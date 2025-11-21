import api from "./axios";

export const userApi = {
  // 아이디 찾기
  findUsername: async (email) => {
    console.log("🚀 userApi.findUsername 호출:", email);
    const response = await api.post("/api/users/find-username", { email });
    console.log("📥 userApi.findUsername 응답:", response);
    return response;
  },

  // 이메일 인증 (비밀번호 찾기 1단계)
  verifyEmail: async (userName, email) => {
    console.log("🚀 userApi.verifyEmail 호출:", { userName, email });
    const response = await api.post("/api/users/verify-email", {
      userName,
      email,
    });
    console.log("📥 userApi.verifyEmail 응답:", response);
    return response;
  },

  // 비밀번호 재설정 (비밀번호 찾기 2단계)
  resetPassword: async (resetToken, newPassword) => {
    console.log("🚀 userApi.resetPassword 호출:", { resetToken });
    const response = await api.post("/api/users/reset-password", {
      resetToken,
      newPassword,
    });
    console.log("📥 userApi.resetPassword 응답:", response);
    return response;
  },
};

export default userApi;
