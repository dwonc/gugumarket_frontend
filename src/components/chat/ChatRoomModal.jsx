import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import chatApi from "../../api/chatApi";
import useWebSocket from "../../hooks/useWebSocket";
import useAuth from "../../hooks/useAuth";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

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

const ChatRoomModal = ({ chatRoomId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const {
    connected,
    subscribe,
    unsubscribe,
    sendMessage,
    enterChatRoom,
    leaveChatRoom,
  } = useWebSocket();

  const [chatRoom, setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen && chatRoomId) {
      fetchChatRoomData();
    }
  }, [isOpen, chatRoomId]);

  const fetchChatRoomData = async () => {
    setLoading(true);
    setError(null);

    try {
      const roomResponse = await chatApi.getChatRoom(chatRoomId);
      if (roomResponse.success) {
        setChatRoom(roomResponse.chatRoom);
      } else {
        setError(roomResponse.message || "채팅방을 불러오는데 실패했습니다.");
        return;
      }

      const messagesResponse = await chatApi.getMessages(chatRoomId);
      if (messagesResponse.success) {
        setMessages(messagesResponse.messages);
      }

      await chatApi.markMessagesAsRead(chatRoomId);
    } catch (err) {
      console.error("채팅방 데이터 로드 실패:", err);
      setError("채팅방을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!connected || !chatRoomId || !isOpen) return;

    subscribe(chatRoomId, (message) => {
      if (message.type === "SYSTEM" || message.messageType === "SYSTEM") {
        return;
      }
      setMessages((prev) => [...prev, message]);
    });

    enterChatRoom(chatRoomId);

    return () => {
      leaveChatRoom(chatRoomId);
      unsubscribe(chatRoomId);
    };
  }, [
    connected,
    chatRoomId,
    isOpen,
    subscribe,
    unsubscribe,
    enterChatRoom,
    leaveChatRoom,
  ]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;
    if (sending) return;
    if (!connected) {
      alert("WebSocket이 연결되어 있지 않습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setSending(true);

    try {
      sendMessage(chatRoomId, newMessage.trim());
      setNewMessage("");
    } catch (err) {
      console.error("메시지 전송 실패:", err);
      alert("메시지 전송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatPrice = (price) => {
    return price ? price.toLocaleString("ko-KR") : "0";
  };

  const isMyMessage = (message) => {
    if (!user || !message) {
      return false;
    }

    const messageSenderId =
      message.senderId || message.sender?.userId || message.senderUserId;
    const currentUserId = user.userId || user.id;

    return Number(messageSenderId) === Number(currentUserId);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 🌫️ Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn"
        onClick={onClose}
      ></div>

      {/* 💬 Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[800px] flex flex-col animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loading size="lg" text="채팅방을 불러오는 중..." />
            </div>
          ) : error || !chatRoom ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ErrorMessage
                  message={error || "채팅방을 찾을 수 없습니다."}
                  type="error"
                />
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
                >
                  닫기
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 flex-shrink-0 rounded-t-2xl">
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <i className="bi bi-x-lg text-2xl"></i>
                </button>

                <img
                  src={getProductImageUrl(chatRoom.productImage)}
                  alt={chatRoom.productTitle}
                  className="w-12 h-12 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = "/images/no-image.png";
                  }}
                />

                <div className="flex-1 min-w-0">
                  <h2
                    className="font-semibold text-gray-900 truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => {
                      navigate(`/products/${chatRoom.productId}`);
                      onClose();
                    }}
                  >
                    {chatRoom.productTitle}
                  </h2>
                  <p className="text-sm text-primary font-medium">
                    {formatPrice(chatRoom.productPrice)}원
                  </p>
                </div>

                {!connected && (
                  <span className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full">
                    연결 중...
                  </span>
                )}
              </div>

              {/* Messages - 카카오톡 스타일 */}
              <div
                ref={messageListRef}
                className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
                style={{ backgroundColor: "#B2C7D9" }}
              >
                {messages.length === 0 ? (
                  <div className="text-center text-gray-600 py-12">
                    <i className="bi bi-chat-dots text-5xl mb-3 opacity-50"></i>
                    <p className="font-medium">아직 메시지가 없습니다.</p>
                    <p className="text-sm mt-1">첫 메시지를 보내보세요!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isMine = isMyMessage(message);
                    const messageContent =
                      message.content || message.message || message.text || "";

                    return (
                      <div
                        key={message.messageId || index}
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        {/* 상대방 메시지 (왼쪽) */}
                        {!isMine && (
                          <div className="flex items-end gap-2 max-w-[70%]">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-red-500 to-pink-500">
                                {message.senderNickname?.charAt(0) || "?"}
                              </div>
                            </div>

                            <div className="flex flex-col">
                              <p className="text-xs text-gray-700 font-semibold mb-1 ml-1">
                                {message.senderNickname || "익명"}
                              </p>

                              <div className="flex items-end gap-1">
                                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm">
                                  <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                                    {messageContent}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-600 mb-1">
                                  {formatDate(message.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 내 메시지 (오른쪽) */}
                        {isMine && (
                          <div className="flex items-end gap-1 max-w-[70%]">
                            <span className="text-xs text-gray-600 mb-1">
                              {formatDate(message.createdAt)}
                            </span>
                            <div className="bg-yellow-300 rounded-2xl rounded-br-sm px-4 py-2 shadow-sm">
                              <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                                {messageContent}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0 rounded-b-2xl">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    disabled={sending || !connected}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={sending || !connected || !newMessage.trim()}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-secondary transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {sending ? (
                      <>
                        <i className="bi bi-hourglass-split animate-spin"></i>
                        <span className="hidden sm:inline">전송 중...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill"></i>
                        <span className="hidden sm:inline">전송</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        /* 모바일에서는 전체 화면 */
        @media (max-width: 640px) {
          .max-w-4xl {
            max-width: 100%;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }
        }
      `}</style>
    </>
  );
};

export default ChatRoomModal;
