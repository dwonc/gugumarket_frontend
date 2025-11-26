import { useState } from "react";
import { Link } from "react-router-dom";
import userApi from "../../api/userApi";

const FindIdPage = () => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await userApi.findUsername(email);

      if (response.data.success) {
        setResult(response.data.data.userName);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("❌ 에러 발생:", err);
      console.error("❌ 에러 응답:", err.response);

      setError(
        err.response?.data?.message ||
          "아이디를 찾을 수 없습니다. 이메일을 확인해주세요."
      );
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
              <span className="text-3xl font-bold text-primary group-hover:text-secondary transition-colors duration-300">
                GUGU Market
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                아이디 찾기
              </h2>
              <p className="text-gray-500">
                가입 시 등록한 이메일을 입력해주세요
              </p>
            </div>

            {/* Result Display */}
            {result && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="font-semibold">✅ 아이디를 찾았습니다!</span>
                </div>
                <div className="text-lg font-bold mt-2">
                  아이디: <span className="text-primary">{result}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                <span>❌ {error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors disabled:bg-gray-100"
                  placeholder="example@email.com"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:transform-none"
              >
                {loading ? "확인 중..." : "아이디 찾기"}
              </button>
            </form>

            {/* Links */}
            <div className="grid grid-cols-2 gap-4 text-center text-sm pt-4 border-t border-gray-200">
              <Link
                to="/login"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                ← 로그인으로
              </Link>
              <Link
                to="/find-password"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                🔑 비밀번호 찾기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindIdPage;
