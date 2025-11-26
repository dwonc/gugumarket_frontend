import api from "./axios";

export const userApi = {
  // ✅ 아이디 중복 체크
  checkUsername: async (username) => {
    const response = await api.get("/api/users/check-username", {
      params: { username },
    });

    return response;
  },

  // ✅ 회원가입
  signup: async (userData) => {
    const response = await api.post("/api/users/signup", userData);

    return response;
  },

  // 아이디 찾기
  findUsername: async (email) => {
    const response = await api.post("/api/users/find-username", { email });

    return response;
  },

  // 이메일 인증 (비밀번호 찾기 1단계)
  verifyEmail: async (userName, email) => {
    const response = await api.post("/api/users/verify-email", {
      userName,
      email,
    });

    return response;
  },

  // 비밀번호 재설정 (비밀번호 찾기 2단계)
  resetPassword: async (resetToken, newPassword) => {
    const response = await api.post("/api/users/reset-password", {
      resetToken,
      newPassword,
    });

    return response;
  },

  // 회원정보 수정 폼 데이터 조회
  getEditFormData: async () => {
    const response = await api.get("/mypage/edit");

    return response;
  },

  // 회원정보 수정
  updateProfile: async (formData) => {
    const response = await api.post("/mypage/edit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  },

  // 회원탈퇴
  deleteUser: async () => {
    const response = await api.delete("/mypage");

    return response;
  },
};

export default userApi;
