import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { authApi } from "../api/authApi";
import { kakaoApi } from "../api/kakaoApi";

const useAuth = () => {
  const navigate = useNavigate();
  const { login, logout, updateUser, user, isAuthenticated } = useAuthStore(); // ✅ updateUser 추가!

  // 기존 일반 로그인
  const handleLogin = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      const { data } = response.data;

      login({
        user: {
          userId: data.userId, // 🔥 핵심
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

  // 카카오 로그인
  const handleKakaoLogin = () => {
    kakaoApi.redirectToKakaoLogin();
  };

  /**
   * 카카오 로그인 콜백 처리
   */
  const handleKakaoCallback = async (code) => {
    try {
      console.log("🔐 카카오 콜백 처리 시작 - code:", code);

      const response = await authApi.kakaoCallback(code);

      console.log("📥 카카오 콜백 응답:", response);

      if (response.data.success) {
        const loginData = response.data.data;

        console.log("✅ 카카오 로그인 성공:", loginData);

        // Zustand store에 저장
        login({
          user: {
            userId: loginData.userId ?? loginData.user?.userId,
            userName: loginData.username ?? loginData.user?.userName,
            nickname: loginData.user?.nickname ?? loginData.username,
            email: loginData.email ?? loginData.user?.email,
            role: loginData.role ?? loginData.user?.role,
            profileImage: loginData.user?.profileImage,
          },
          accessToken: loginData.accessToken,
          refreshToken: loginData.refreshToken,
        });

        // requiresAddressUpdate 플래그 반환
        const result = {
          success: true,
          message: "카카오 로그인 성공",
          requiresAddressUpdate: loginData.requiresAddressUpdate || false,
          user: loginData.user,
        };

        // 주소가 이미 있으면 바로 메인으로 이동
        if (!loginData.requiresAddressUpdate) {
          navigate("/");
        }

        return result;
      } else {
        return {
          success: false,
          message: response.data.message || "카카오 로그인에 실패했습니다.",
        };
      }
    } catch (error) {
      console.error("❌ 카카오 로그인 에러:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "카카오 로그인 처리 중 오류가 발생했습니다.",
      };
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /**
   * 소셜 로그인 사용자 필수정보 입력
   */
  const handleCompleteProfile = async (profileData) => {
    try {
      console.log("📝 필수정보 입력 시작:", profileData);

      const response = await authApi.completeProfile(profileData);

      if (response.data.success) {
        // Zustand store 업데이트
        const updatedUser = response.data.user;
        updateUser(updatedUser);

        console.log("✅ 필수정보 입력 성공:", updatedUser);

        // 메인 페이지로 이동
        navigate("/");

        return {
          success: true,
          message: response.data.message,
        };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("❌ 필수정보 입력 실패:", error);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    handleLogin,
    handleKakaoLogin,
    handleKakaoCallback,
    handleCompleteProfile,
    handleLogout,
  };
};

export default useAuth;
