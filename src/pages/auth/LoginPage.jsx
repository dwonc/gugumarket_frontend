import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { handleLogin, handleKakaoLogin } = useAuth(); // 🔥 handleKakaoLogin 추가

  const [formData, setFormData] = useState({
    userName: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await handleLogin(formData);
      if (!result.success) {
        setError(result.message || "아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/images/gugumarket-logo.png"
                alt="GUGU Market Logo"
                className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-3xl font-bold text-primary group-hover:text-secondary transition-colors duration-300">
                GUGU Market
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Container */}
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Login Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">로그인</h2>
              <p className="text-gray-500">
                GUGU Market에 오신 것을 환영합니다
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  <i className="bi bi-exclamation-circle mr-2"></i>
                  <span>{error}</span>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label
                  htmlFor="userName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  아이디
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bi bi-person text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    required
                    value={formData.userName}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors disabled:bg-gray-100"
                    placeholder="아이디를 입력하세요"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  비밀번호
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bi bi-lock text-gray-400"></i>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors disabled:bg-gray-100"
                    placeholder="비밀번호를 입력하세요"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    로그인 상태 유지
                  </label>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:transform-none"
              >
                로그인 하기
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            {/* 🔥 카카오 로그인 버튼 */}
            <button
              type="button"
              onClick={handleKakaoLogin}
              disabled={loading}
              className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
            >
              <img
                src="/images/kakao-logo.png"
                alt="Kakao"
                className="w-5 h-5"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span>카카오로 시작하기</span>
            </button>

            {/* Links */}
            <div className="grid grid-cols-2 gap-4 text-center text-sm">
              <Link
                to="/find-id"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <i className="bi bi-person-circle mr-1"></i>
                아이디 찾기
              </Link>
              <Link
                to="/find-password"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <i className="bi bi-key mr-1"></i>
                비밀번호 찾기
              </Link>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                아직 회원이 아니신가요?{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:text-secondary font-semibold transition-colors"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
