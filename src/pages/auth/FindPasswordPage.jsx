import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";

const FindPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Step 1: 이메일 인증
  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await userApi.verifyEmail(
        formData.userName,
        formData.email
      );

      if (response.data.success) {
        setResetToken(response.data.data.resetToken);
        setStep(2);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("❌ 이메일 인증 에러:", err);
      console.error("❌ 에러 응답:", err.response);

      setError(
        err.response?.data?.message || "아이디 또는 이메일이 일치하지 않습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: 비밀번호 재설정
  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    try {
      const response = await userApi.resetPassword(
        resetToken,
        formData.newPassword
      );

      if (response.data.success) {
        alert("비밀번호가 성공적으로 변경되었습니다!");
        navigate("/login");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("❌ 비밀번호 재설정 에러:", err);
      console.error("❌ 에러 응답:", err.response);

      setError(
        err.response?.data?.message || "비밀번호 재설정에 실패했습니다."
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
                비밀번호 찾기
              </h2>
              <p className="text-gray-500">
                {step === 1
                  ? "아이디와 이메일을 입력해주세요"
                  : "새로운 비밀번호를 설정해주세요"}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= 1
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <div className="w-16 h-1 bg-gray-200">
                <div
                  className={`h-full ${
                    step >= 2 ? "bg-primary" : "bg-gray-200"
                  } transition-all duration-300`}
                  style={{ width: step >= 2 ? "100%" : "0%" }}
                ></div>
              </div>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= 2
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                <span>❌ {error}</span>
              </div>
            )}

            {/* Step 1: Email Verification */}
            {step === 1 && (
              <form onSubmit={handleVerifyEmail} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    아이디
                  </label>
                  <input
                    type="text"
                    name="userName"
                    required
                    value={formData.userName}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors disabled:bg-gray-100"
                    placeholder="아이디를 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors disabled:bg-gray-100"
                    placeholder="example@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? "확인 중..." : "다음"}
                </button>
              </form>
            )}

            {/* Step 2: Reset Password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    required
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors disabled:bg-gray-100"
                    placeholder="새 비밀번호 (최소 8자)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors disabled:bg-gray-100"
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? "변경 중..." : "비밀번호 변경"}
                </button>
              </form>
            )}

            {/* Links */}
            <div className="grid grid-cols-2 gap-4 text-center text-sm pt-4 border-t border-gray-200">
              <Link
                to="/login"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                ← 로그인으로
              </Link>
              <Link
                to="/find-id"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                👤 아이디 찾기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindPasswordPage;
