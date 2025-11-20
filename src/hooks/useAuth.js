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

      login({
        user: {
          username: data.username,
          nickname: data.nickname, // ✅ 추가!
          email: data.email,
          role: data.role,
        },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      navigate("/");
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
