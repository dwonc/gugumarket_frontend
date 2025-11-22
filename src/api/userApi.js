import api from "./axios";

export const userApi = {
  // ✅ 아이디 중복 체크
  checkUsername: async (username) => {
    console.log("🚀 userApi.checkUsername 호출:", username);
    const response = await api.get("/api/users/check-username", {
      params: { username },
    });
    console.log("📥 userApi.checkUsername 응답:", response);
    return response;
  },

  // ✅ 회원가입
  signup: async (userData) => {
    console.log("🚀 userApi.signup 호출:", userData);
    const response = await api.post("/api/users/signup", userData);
    console.log("📥 userApi.signup 응답:", response);
    return response;
  },

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

  // 회원정보 수정 폼 데이터 조회
  getEditFormData: async () => {
    console.log("🚀 userApi.getEditFormData 호출");
    const response = await api.get("/mypage/edit");
    console.log("📥 userApi.getEditFormData 응답:", response);
    return response;
  },

  // 회원정보 수정
  updateProfile: async (formData) => {
    console.log("🚀 userApi.updateProfile 호출");
    const response = await api.post("/mypage/edit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("📥 userApi.updateProfile 응답:", response);
    return response;
  },

  // 회원탈퇴
  deleteUser: async () => {
    console.log("🚀 userApi.deleteUser 호출");
    const response = await api.delete("/mypage");
    console.log("📥 userApi.deleteUser 응답:", response);
    return response;
  },
};

export default userApi;
