import api from "./axios";

export const authApi = {
  login: (credentials) => api.post("/api/auth/login", credentials),

  logout: () => api.post("/api/auth/logout"),

  refreshToken: (refreshToken) =>
    api.post(
      "/api/auth/refresh",
      {},
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
      }
    ),

  getCurrentUser: () => api.get("/api/auth/me"),

  // ✅ 카카오 콜백 함수 추가
  kakaoCallback: async (code) => {
    console.log("🚀 authApi.kakaoCallback 호출:", code);
    const response = await api.get(`/api/auth/kakao/callback?code=${code}`);
    console.log("📥 authApi.kakaoCallback 응답:", response);
    return response;
  },

  // ✅ 필수정보 입력 함수 추가 (객체 안으로 이동)
  completeProfile: async (data) => {
    console.log("🚀 authApi.completeProfile 호출:", data);

    const params = new URLSearchParams();
    params.append("address", data.address);
    params.append("addressDetail", data.addressDetail || "");
    params.append("postalCode", data.postalCode);

    if (data.password) {
      params.append("password", data.password);
    }

    const response = await api.post("/api/auth/complete-profile", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("📥 authApi.completeProfile 응답:", response);
    return response;
  },
};

export default authApi;
