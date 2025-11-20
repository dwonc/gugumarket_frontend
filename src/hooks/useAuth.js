import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { authApi } from "../api/authApi";

const useAuth = () => {
  const navigate = useNavigate();
  const { login, logout, user, isAuthenticated } = useAuthStore();

  const handleLogin = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      const { data } = response.data;

      // ✅ 백엔드 응답 구조에 맞게 매핑
      login({
        user: {
          userName: data.username, // ✅ username → userName
          nickname: data.username, // ✅ username을 nickname으로도 사용
          email: data.email,
          role: data.role,
        },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      // 관리자면 관리자 페이지로
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return {
    user,
    isAuthenticated,
    handleLogin,
    handleLogout,
  };
};

export default useAuth;
