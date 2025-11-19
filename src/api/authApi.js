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
};
