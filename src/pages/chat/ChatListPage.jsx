import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import chatApi from "../../api/chatApi";
import useAuth from "../../hooks/useAuth";
import useWebSocket from "../../hooks/useWebSocket";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import ChatRoomModal from "../../components/chat/ChatRoomModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getProductImageUrl = (imagePath) => {
  if (!imagePath || imagePath.trim() === "") {
    return "/images/no-image.png";
  }
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const cleanedPath = imagePath.replace(/^\//, "");
  return `${baseUrl}/${cleanedPath}`;
};

const ChatListPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { connected, subscribeDestination } = useWebSocket();

  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // ✅ 이전 카운트 저장 (비교용)
  const prevCountRef = useRef(null);
  // ✅ debounce용 타이머
  const debounceTimerRef = useRef(null);

  const fetchChatRooms = useCallback(async () => {
    try {
      const response = await chatApi.getChatRoomList();
      if (response.success) {
        setChatRooms(response.chatRooms);
      } else {
        setError(response.message || "채팅방 목록을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("채팅방 목록 조회 실패:", err);
      setError("채팅방 목록을 불러오는 중 오류가 발생했습니다.");
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadInitial = async () => {
      setLoading(true);
      await fetchChatRooms();
      setLoading(false);
    };

    loadInitial();
  }, [isAuthenticated, navigate, fetchChatRooms]);

  // ✅ WebSocket 구독: 실시간 채팅 알림 (debounce 적용)
  useEffect(() => {
    if (!connected || !isAuthenticated || !user?.userId) return;

    const unsubChat = subscribeDestination(
      `/topic/chat/unread-count/${user.userId}`,
      (payload) => {
        const count = Number(payload);

        // ✅ 값이 변경되었을 때만 처리
        if (prevCountRef.current !== count) {
          console.log("📨 채팅 카운트 변경:", prevCountRef.current, "→", count);
          prevCountRef.current = count;

          // ✅ debounce: 500ms 내에 여러 번 오면 마지막 것만 실행
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          debounceTimerRef.current = setTimeout(() => {
            console.log("🔄 채팅방 목록 새로고침");
            fetchChatRooms();
          }, 500);
        }
      }
    );

    return () => {
      if (typeof unsubChat === "function") unsubChat();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    connected,
    isAuthenticated,
    user?.userId,
    subscribeDestination,
    fetchChatRooms,
  ]);

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return price ? price.toLocaleString("ko-KR") : "0";
  };

  const getUnreadCount = (chatRoom) => {
    if (!user) return 0;
    if (user.userId === chatRoom.sellerId) {
      return chatRoom.sellerUnreadCount || 0;
    } else {
      return chatRoom.buyerUnreadCount || 0;
    }
  };

  const getOpponentName = (chatRoom) => {
    if (!user) return "";
    if (user.userId === chatRoom.sellerId) {
      return chatRoom.buyerNickname || "구매자";
    } else {
      return chatRoom.sellerNickname || "판매자";
    }
  };

  const handleChatRoomClick = (chatRoomId) => {
    setSelectedChatRoomId(chatRoomId);
    setIsChatModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsChatModalOpen(false);
    setSelectedChatRoomId(null);
    fetchChatRooms();
  };

  const handleDeleteChatRoom = async (e, chatRoomId) => {
    e.stopPropagation();
    if (!window.confirm("이 채팅방을 삭제하시겠습니까?")) return;

    try {
      await chatApi.deleteChatRoom(chatRoomId);
      setChatRooms((prev) =>
        prev.filter((room) => room.chatRoomId !== chatRoomId)
      );
    } catch (err) {
      console.error("채팅방 삭제 실패:", err);
      alert("채팅방 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loading size="lg" text="채팅방 목록을 불러오는 중..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">채팅</h1>
            <p className="mt-2 text-sm text-gray-600">
              상품 판매자/구매자와 대화를 나눠보세요
            </p>
          </div>
        </div>

        {error && (
          <ErrorMessage message={error} type="error" className="mb-6" />
        )}

        {chatRooms.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <i className="bi bi-chat-dots text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-lg mb-4">
              아직 채팅 내역이 없습니다.
            </p>
            <Button onClick={() => navigate("/")} variant="primary">
              상품 둘러보기
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg divide-y divide-gray-200">
            {chatRooms.map((chatRoom) => {
              const unreadCount = getUnreadCount(chatRoom);
              const opponentName = getOpponentName(chatRoom);

              return (
                <div
                  key={chatRoom.chatRoomId}
                  onClick={() => handleChatRoomClick(chatRoom.chatRoomId)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={getProductImageUrl(chatRoom.productImage)}
                      alt={chatRoom.productTitle}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        e.target.src = "/images/no-image.png";
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {chatRoom.productTitle}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatDate(chatRoom.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-primary mb-1">
                        {formatPrice(chatRoom.productPrice)}원
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          <span className="font-medium">{opponentName}</span>:{" "}
                          {chatRoom.lastMessage || "메시지가 없습니다"}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                          <button
                            onClick={(e) =>
                              handleDeleteChatRoom(e, chatRoom.chatRoomId)
                            }
                            className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            title="채팅방 삭제"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ChatRoomModal
        chatRoomId={selectedChatRoomId}
        isOpen={isChatModalOpen}
        onClose={handleCloseModal}
      />

      <Footer />
    </div>
  );
};

export default ChatListPage;
