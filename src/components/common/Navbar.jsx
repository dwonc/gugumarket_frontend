import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuthStore from "../../stores/authStore";
import { notificationApi } from "../../api/notificationApi";
import chatApi from "../../api/chatApi";
import useNotificationStore from "../../stores/notificationStore";
import useWebSocket from "../../hooks/useWebSocket";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  // 알림 전역 상태
  const { unreadCount, setUnreadCount } = useNotificationStore();

  // WebSocket
  const { connected, subscribeDestination } = useWebSocket();

  // 채팅 unreadCount (로컬 state)
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  const isAdmin = user?.role === "ADMIN";

  /** 👉 홈 클릭 시 필터 초기화 + 메인으로 이동 */
  const handleHomeClick = () => {
    navigate({
      pathname: "/",
      search: "?categoryId=0&page=0",
    });
  };

  /** ✅ 로그인/로그아웃 시 알림/채팅 카운트 초기화 */
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setChatUnreadCount(0);
      return;
    }
  }, [isAuthenticated, setUnreadCount]);

  /** ✅ WebSocket 연결 + 로그인 후: 초기 동기화 + 실시간 구독 */
  useEffect(() => {
    if (!connected || !isAuthenticated || !user?.userId) return;

    // 1) 연결 직후 REST로 현재 값 동기화
    (async () => {
      try {
        const [notiRes, chatRes] = await Promise.all([
          notificationApi.getUnreadCount(),
          chatApi.getTotalUnreadCount(),
        ]);

        if (notiRes.data.success) {
          setUnreadCount(notiRes.data.data.count);
        }
        if (chatRes.success) {
          setChatUnreadCount(chatRes.unreadCount);
        }
      } catch (e) {
        console.error("초기 unread 동기화 실패:", e);
      }
    })();

    // 2) WebSocket 구독
    const unsubNoti = subscribeDestination(
      `/topic/notifications-count/${user.userId}`,
      (payload) => {
        const count = Number(payload);
        if (!Number.isNaN(count)) {
          setUnreadCount(count);
        }
      }
    );

    const unsubChat = subscribeDestination(
      `/topic/chat/unread-count/${user.userId}`,
      (payload) => {
        console.log("📨 채팅 카운트 WebSocket 수신:", payload);
        const count = Number(payload);
        if (!Number.isNaN(count)) {
          console.log("✅ 채팅 카운트 업데이트:", count);
          setChatUnreadCount(count);
        }
      }
    );

    // 3) cleanup: 구독 해제
    return () => {
      if (typeof unsubNoti === "function") unsubNoti();
      if (typeof unsubChat === "function") unsubChat();
    };
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
                  {/* 알림 */}
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
            <button
              type="button"
              onClick={handleHomeClick}
              className="flex items-center space-x-3 group"
            >
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
            </button>

            <div className="flex items-center space-x-8">
              <button
                type="button"
                onClick={handleHomeClick}
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                홈
              </button>

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

              {/* 채팅 */}
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
