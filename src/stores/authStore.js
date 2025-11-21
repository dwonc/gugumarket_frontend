import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // Actions
      login: (loginData) => {
        console.log("🔐 로그인 데이터 저장:", loginData); // 디버깅용
        set({
          user: loginData.user,
          accessToken: loginData.accessToken,
          refreshToken: loginData.refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        console.log("🚪 로그아웃"); // 디버깅용
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) => set({ user: userData }),

      updateTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
        }),

      // 🔥 초기화 함수 추가 (LocalStorage에서 복원)
      initialize: () => {
        const state = get();
        console.log("🔄 authStore 초기화:", state); // 디버깅용

        // isAuthenticated 재계산
        if (state.accessToken && state.user) {
          set({ isAuthenticated: true });
        } else {
          set({ isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage", // localStorage key
      storage: createJSONStorage(() => localStorage), // 🔥 명시적으로 localStorage 사용
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // 🔥 hydration 완료 후 콜백
      onRehydrateStorage: () => (state) => {
        console.log("💧 Hydration 완료:", state); // 디버깅용
        if (state) {
          state.initialize();
        }
      },
    }
  )
);

export default useAuthStore;
