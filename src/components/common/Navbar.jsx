import { Link } from "react-router-dom";
import useAuthStore from "../../stores/authStore";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-white py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-end items-center space-x-6 text-sm">
            {isAuthenticated ? (
              <>
                <span>{user?.nickname || user?.userName}님</span>
                <button
                  onClick={handleLogout}
                  className="hover:text-light transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-light transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="hover:text-light transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <span className="text-3xl font-bold text-primary group-hover:text-secondary transition-colors duration-300">
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
              {isAuthenticated && (
                <>
                  <Link
                    to="/mypage"
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                  >
                    마이페이지
                  </Link>
                  <Link
                    to="/notifications"
                    className="text-gray-700 hover:text-primary font-medium transition-colors relative"
                  >
                    <i className="bi bi-bell text-xl"></i>
                  </Link>
                  <Link
                    to="/products/write"
                    className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <i className="bi bi-plus-circle"></i>
                    상품 등록
                  </Link>
                </>
              )}
              <Link
                to="/qna"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                Q&A
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
