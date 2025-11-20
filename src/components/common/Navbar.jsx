import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuthStore from "../../stores/authStore";
import { notificationApi } from "../../api/notificationApi";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  console.log("=== Navbar Debug ===");
  console.log("isAuthenticated:", isAuthenticated);
  console.log("user:", user);
  console.log("user?.userName:", user?.userName);
  console.log("user?.nickname:", user?.nickname);

  // ✅ 알림 개수 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();

      // 30초마다 알림 개수 갱신 (선택사항)
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (error) {
      console.error("알림 개수 조회 실패:", error);
      // 에러 발생해도 UI는 계속 표시 (0으로 유지)
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Top Bar - 상단 사용자 정보 바 */}
      <div className="bg-primary text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            {/* 왼쪽: 빈 공간 또는 간단한 메시지 */}
            <div>
              {isAuthenticated ? (
                <span>
                  <i className="bi bi-person-circle mr-2"></i>
                  {user?.userName || user?.nickname}님
                </span>
              ) : (
                <span>
                  <i className="bi bi-heart mr-2"></i>
                  GUGU Market
                </span>
              )}
            </div>

            {/* 오른쪽: 사용자 정보 */}
            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  {/* ✅ 알림 */}
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

                  {/* ✅ 사용자명 (아이콘 없이) */}

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

      {/* Main Navbar - 흰색 배경 메인 네비게이션 */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* 로고 */}
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

            {/* 메뉴 */}
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                홈
              </Link>
              <Link
                to="/mypage"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                마이페이지
              </Link>
              <Link
                to="/qna"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                Q&A
              </Link>

              {/* 관리자 메뉴 */}
              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="text-primary hover:text-secondary font-bold transition-colors"
                >
                  <i className="bi bi-shield-check mr-1"></i>
                  관리자
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
