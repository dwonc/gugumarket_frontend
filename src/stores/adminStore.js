import { create } from "zustand";

const useAdminStore = create((set, get) => ({
  // State
  stats: {
    totalUsers: 0,
    totalProducts: 0,
    unansweredQna: 0,
  },
  users: [],
  products: [],
  qnaPosts: [],
  loading: false,
  error: null,
  currentTab: "users", // users, products, qna

  // Actions
  setStats: (stats) => set({ stats }),

  setUsers: (users) => set({ users }),

  setProducts: (products) => set({ products }),

  setQnaPosts: (qnaPosts) => set({ qnaPosts }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setCurrentTab: (tab) => set({ currentTab: tab }),

  // 회원 추가
  addUser: (user) => set({ users: [...get().users, user] }),

  // 회원 업데이트
  updateUser: (userId, updatedData) =>
    set({
      users: get().users.map((user) =>
        user.userId === userId ? { ...user, ...updatedData } : user
      ),
    }),

  // 회원 삭제
  removeUser: (userId) =>
    set({
      users: get().users.filter((user) => user.userId !== userId),
    }),

  // 상품 삭제
  removeProduct: (productId) =>
    set({
      products: get().products.filter((p) => p.productId !== productId),
    }),

  // QnA 업데이트
  updateQna: (qnaId, updatedData) =>
    set({
      qnaPosts: get().qnaPosts.map((qna) =>
        qna.qnaId === qnaId ? { ...qna, ...updatedData } : qna
      ),
    }),

  // Reset
  reset: () =>
    set({
      stats: { totalUsers: 0, totalProducts: 0, unansweredQna: 0 },
      users: [],
      products: [],
      qnaPosts: [],
      loading: false,
      error: null,
      currentTab: "users",
    }),
}));

export default useAdminStore;
