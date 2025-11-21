import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { authApi } from "../api/authApi";
import { kakaoApi } from "../api/kakaoApi"; // 🔥 추가

const useAuth = () => {
  const navigate = useNavigate();
  const { login, logout, user, isAuthenticated } = useAuthStore();

  // 기존 일반 로그인
  const handleLogin = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      const { data } = response.data;

      login({
        user: {
          userName: data.username,
          nickname: data.username,
          email: data.email,
          role: data.role,
        },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      if (data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "로그인에 실패했습니다.",
      };
    }
  };

  // 🔥 카카오 로그인
  const handleKakaoLogin = () => {
    kakaoApi.redirectToKakaoLogin();
  };

  // handleKakaoCallback 함수만 수정
  const handleKakaoCallback = async (code) => {
    try {
      console.log("🔐 useAuth: 카카오 콜백 처리 시작");
      const response = await kakaoApi.kakaoCallback(code);
      const { data } = response.data;

      console.log("✅ useAuth: 토큰 받음:", {
        hasAccessToken: !!data.accessToken,
        username: data.username,
      });

      login({
        user: {
          userName: data.username,
          nickname: data.username,
          email: data.email,
          role: data.role,
        },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      console.log("✅ useAuth: 로그인 상태 저장 완료");

      // 🔥 navigate를 동기적으로 실행
      if (data.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

      return { success: true };
    } catch (error) {
      console.error("❌ useAuth: 카카오 콜백 실패:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "카카오 로그인에 실패했습니다.",
      };
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return {
    user,
    isAuthenticated,
    handleLogin,
    handleKakaoLogin, // 🔥 추가
    handleKakaoCallback, // 🔥 추가
    handleLogout,
  };
};

export default useAuth;
