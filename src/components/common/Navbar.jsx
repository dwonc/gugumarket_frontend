import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuthStore from "../../stores/authStore";
import { notificationApi } from "../../api/notificationApi";
import chatApi from "../../api/chatApi"; // ✅ 추가!

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  // ✅ 알림과 채팅 unreadCount 분리
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  useEffect(() => {
    console.log("📊 Navbar - 인증 상태:", {
      isAuthenticated,
      user,
      role: user?.role,
      hasAccessToken: !!useAuthStore.getState().accessToken,
    });
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated) {
      // ✅ 알림 개수 조회
      fetchNotificationUnreadCount();

      // ✅ 채팅 읽지 않은 메시지 개수 조회
      fetchChatUnreadCount();

      // ✅ 30초마다 갱신
      const interval = setInterval(() => {
        fetchNotificationUnreadCount();
        fetchChatUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setNotificationUnreadCount(0);
      setChatUnreadCount(0);
    }
  }, [isAuthenticated]);

  // ✅ 알림 읽지 않은 개수 조회
  const fetchNotificationUnreadCount = async () => {
    if (!isAuthenticated) {
      setNotificationUnreadCount(0);
      return;
    }

    try {
      const response = await notificationApi.getUnreadCount();
      if (response.data.success) {
        setNotificationUnreadCount(response.data.data.count);
      }
    } catch (error) {
      console.error("알림 개수 조회 실패:", error);
      if (error.response?.status === 401) {
        console.log("인증 만료, 알림 개수 초기화");
        setNotificationUnreadCount(0);
      }
    }
  };

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
                      {notificationUnreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                          {notificationUnreadCount > 99
                            ? "99+"
                            : notificationUnreadCount}
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
