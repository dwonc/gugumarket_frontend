import api from "./axios";

export const adminApi = {
  // 대시보드 통계 (수정!)
  getStats: () => api.get("/admin/dashboard"),

  // 회원 관리
  getUsers: (keyword = "") =>
    api.get("/admin/users", { params: { search: keyword } }),
  getUserDetail: (userId) => api.get(`/admin/users/${userId}`),
  toggleUserStatus: (userId) =>
    api.patch(`/admin/users/${userId}/toggle-status`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  // 상품 관리
  getProducts: (params = {}) =>
    api.get("/admin/products", {
      params: {
        search: params.keyword,
        isDeleted: params.isDeleted,
      },
    }),
  deleteProduct: (productId) => api.delete(`/admin/products/${productId}`),

  // Q&A 관리
  getQnaPosts: () => api.get("/admin/qna"),
  answerQna: (qnaId, content) =>
    api.post(`/admin/qna/${qnaId}/answer`, { content }),
};
