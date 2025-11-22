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

  // ✅ 회원정보 수정 폼 데이터 조회
  getEditFormData: async () => {
    console.log("🚀 userApi.getEditFormData 호출");
    const response = await api.get("/mypage/edit"); // ✅ /mypage/edit
    console.log("📥 userApi.getEditFormData 응답:", response);
    return response;
  },

  // ✅ 회원정보 수정
  updateProfile: async (formData) => {
    console.log("🚀 userApi.updateProfile 호출");
    const response = await api.post("/mypage/edit", formData, {
      // ✅ POST /mypage/edit
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("📥 userApi.updateProfile 응답:", response);
    return response;
  },

  // ✅ 회원탈퇴 (백엔드에 API가 없으므로 임시)
  deleteUser: async () => {
    console.log("🚀 userApi.deleteUser 호출");
    // TODO: 백엔드에 회원탈퇴 API 추가 필요!
    const response = await api.delete("/mypage"); // 또는 적절한 경로
    console.log("📥 userApi.deleteUser 응답:", response);
    return response;
  },
};

export default userApi;
