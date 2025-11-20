import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
  const { isAuthenticated, user, handleLogout } = useAuth();

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-white py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-end items-center space-x-6 text-sm">
            {isAuthenticated ? (
              <>
                <span>{user?.username}님</span>
                <button
                  onClick={handleLogout}
                  className="hover:underline bg-transparent border-0 text-white cursor-pointer"
                >
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

      {/* Main Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
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
                className="w-12 h-12 rounded-full hidden items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: "#6B4F4F" }}
              >
                G
              </div>
              <span className="text-3xl font-bold text-primary group-hover:text-secondary transition-colors duration-300">
                GUGU Market
              </span>
            </Link>

            {/* Navigation Links */}
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
                    {/* 알림 뱃지 (옵션) */}
                    {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span> */}
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
