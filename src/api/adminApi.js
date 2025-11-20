import api from "./axios";

export const adminApi = {
  // 대시보드 통계 (수정!)
  getStats: () => api.get("/api/admin/dashboard"),

  // 회원 관리
  getUsers: (keyword = "") =>
    api.get("/api/admin/users", { params: { search: keyword } }),
  getUserDetail: (userId) => api.get(`/api/admin/users/${userId}`),
  toggleUserStatus: (userId) =>
    api.patch(`/api/admin/users/${userId}/toggle-status`),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),

  // 상품 관리
  getProducts: (params = {}) =>
    api.get("/api/admin/products", {
      params: {
        search: params.keyword,
        isDeleted: params.isDeleted,
      },
    }),
  deleteProduct: (productId) => api.delete(`/api/admin/products/${productId}`),

  // Q&A 관리
  getQnaPosts: () => api.get("/api/admin/qna"),
  answerQna: (qnaId, content) =>
    api.post(`/api/admin/qna/${qnaId}/answer`, { content }),
};
