import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuthStore from "../../stores/authStore";
import { notificationApi } from "../../api/notificationApi";
import chatApi from "../../api/chatApi"; // ✅ 추가!
import useNotificationStore from "../../stores/notificationStore"; // ✅ 추가
import useWebSocket from "../../hooks/useWebSocket"; // ✅ 추가

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  // ✅ 알림은 전역 store 사용
  const { unreadCount, setUnreadCount } = useNotificationStore();

  // ✅ WebSocket
  const { connected, subscribeDestination } = useWebSocket();

  // ✅ 채팅 unreadCount 는 로컬 state 그대로
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  useEffect(() => {
    console.log("📊 Navbar - 인증 상태:", {
      isAuthenticated,
      user,
      role: user?.role,
      hasAccessToken: !!useAuthStore.getState().accessToken,
    });
  }, [isAuthenticated, user]);

  // ✅ 알림 unreadCount 초기 로딩 (로그인 / 로그아웃 시)
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const fetchNotificationUnreadCount = async () => {
      try {
        const response = await notificationApi.getUnreadCount();
        if (response.data.success) {
          setUnreadCount(response.data.data.count);
        }
      } catch (error) {
        console.error("알림 개수 조회 실패:", error);
        if (error.response?.status === 401) {
          console.log("인증 만료, 알림 개수 초기화");
          setUnreadCount(0);
        }
      }
    };

    fetchNotificationUnreadCount();
  }, [isAuthenticated, setUnreadCount]);

  // ✅ 채팅 읽지 않은 메시지 개수 조회 + 30초마다 갱신
  useEffect(() => {
    if (!isAuthenticated) {
      setChatUnreadCount(0);
      return;
    }

    const fetchChatUnreadCount = async () => {
      try {
        const response = await chatApi.getTotalUnreadCount();
        if (response.success) {
          setChatUnreadCount(response.unreadCount);
        }
      } catch (error) {
        console.error("채팅 읽지 않은 메시지 개수 조회 실패:", error);
        if (error.response?.status === 401) {
          console.log("인증 만료, 채팅 개수 초기화");
          setChatUnreadCount(0);
        }
      }
    };

    fetchChatUnreadCount(); // 초기 1번

    const interval = setInterval(fetchChatUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // ✅ 채팅 읽지 않은 메시지 개수 조회
  const fetchChatUnreadCount = async () => {
    if (!isAuthenticated) {
      setChatUnreadCount(0);
      return;
    }

    try {
      const response = await chatApi.getTotalUnreadCount();
      if (response.success) {
        setChatUnreadCount(response.unreadCount);
      }
    } catch (error) {
      console.error("채팅 읽지 않은 메시지 개수 조회 실패:", error);
      if (error.response?.status === 401) {
        console.log("인증 만료, 채팅 개수 초기화");
        setChatUnreadCount(0);
      }
    }
  };

  // ✅ WebSocket 실시간 알림 카운트 반영
  useEffect(() => {
    console.log("🟢 Navbar WS 상태:", {
      connected,
      isAuthenticated,
      userId: user?.userId,
    });

    if (!connected) return;
    if (!isAuthenticated) return;
    if (!user || !user.userId) return;

    const dest = `/topic/notifications-count/${user.userId}`;
    console.log("🔔 Navbar 알림 카운트 구독 시작:", dest);

    subscribeDestination(dest, (payload) => {
      console.log("🔔 Navbar 실시간 알림 수신:", payload);

      if (typeof payload === "number") {
        setUnreadCount(payload);
      } else if (typeof payload === "string" && !isNaN(Number(payload))) {
        setUnreadCount(Number(payload));
      } else if (payload?.unreadCount != null) {
        setUnreadCount(Number(payload.unreadCount));
      } else {
        // 혹시 NotificationDto만 날라오면 일단 +1
        setUnreadCount((prev) => prev + 1);
      }
    });
  }, [
    connected,
    isAuthenticated,
    user?.userId,
    subscribeDestination,
    setUnreadCount,
  ]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ 채팅 unreadCount 실시간 구독
  useEffect(() => {
    if (!connected) return;
    if (!isAuthenticated) return;
    if (!user?.userId) return;

    const dest = `/topic/chat/unread-count/${user.userId}`;
    console.log("💬 채팅 unread 구독 시작:", dest);

    subscribeDestination(dest, (payload) => {
      // backend에서 long 그대로 보내니까 string/number 둘 다 처리
      const count = Number(payload);
      console.log("💬 실시간 채팅 unread 수신:", count);
      if (!Number.isNaN(count)) {
        setChatUnreadCount(count);
      }
    });
  }, [connected, isAuthenticated, user, subscribeDestination]);

  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div>
              {isAuthenticated ? (
                <span>
                  <i className="bi bi-person-circle mr-2"></i>
                  {user?.nickname || user?.userName || "사용자"}님
                  {isAdmin && (
                    <span className="ml-2 bg-yellow-400 text-gray-800 px-2 py-0.5 rounded-full text-xs font-bold">
                      관리자
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  <i className="bi bi-heart mr-2"></i>
                  GUGU Market
                </span>
              )}
            </div>

            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  {/* ✅ 알림 - notificationUnreadCount 사용 */}
                  <Link
                    to="/notifications"
                    className="relative hover:underline flex items-center"
                  >
                    <div className="relative mr-1">
                      <i className="bi bi-bell text-lg"></i>
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                    <span>알림</span>
                  </Link>

                  <Link to="/mypage" className="hover:underline">
                    마이페이지
                  </Link>

                  <button onClick={handleLogout} className="hover:underline">
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:underline">
                    로그인
                  </Link>
                  <Link to="/signup" className="hover:underline">
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/images/gugumarket-logo.png"
                alt="GUGU Market Logo"
                className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                className="w-12 h-12 bg-primary rounded-full items-center justify-center text-white font-bold text-xl hidden"
                style={{ display: "none" }}
              >
                G
              </div>
              <span className="text-3xl font-bold text-primary">
                GUGU Market
              </span>
            </Link>

            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                홈
              </Link>

              {/* 🗺️ 지도 링크 */}
              <Link
                to="/map"
                className="text-gray-700 hover:text-primary font-medium transition-colors flex items-center space-x-1"
              >
                <i className="bi bi-map"></i>
                <span>지도</span>
              </Link>

              <Link
                to="/mypage"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                마이페이지
              </Link>

              {/* ✅ 채팅 링크 - chatUnreadCount 사용 */}
              <Link
                to="/chat"
                className="relative text-gray-700 hover:text-primary font-medium transition-colors flex items-center space-x-1"
              >
                <div className="relative">
                  <i className="bi bi-chat-dots text-lg"></i>
                  {chatUnreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                      {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                    </span>
                  )}
                </div>
                <span>채팅</span>
              </Link>

              <Link
                to="/qna"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                Q&A
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-yellow-600 hover:text-yellow-700 font-bold transition-colors flex items-center space-x-1"
                >
                  <i className="bi bi-shield-check"></i>
                  <span>관리자</span>
                </Link>
              )}

              {isAuthenticated && (
                <Link
                  to="/products/write"
                  className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-secondary transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <i className="bi bi-plus-circle"></i>
                  <span>상품 등록</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
