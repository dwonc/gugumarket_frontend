import { create } from "zustand";
import { persist } from "zustand/middleware";
import { userApi } from "../api/userApi";
// import useAuthStore from "./authStore"; // 필요한 경우 토큰 갱신 로직을 위해 사용 가능

const userStore = create(
    persist(
        (set, get) => ({
            // State
            user: null, // 사용자 상세 정보

            // Actions
            setUser: (userData) => set({ user: userData }),

            // 프로필 수정 후 전역 상태 업데이트 액션
            updateUser: (userData) => set({ user: userData }),

            // 상태 초기화 (로그아웃 시 useAuthStore에서 호출)
            clearUser: () => set({ user: null }),

            // [추가 기능] 서버에서 최신 사용자 정보 조회 (Navbar 등에 유용)
            fetchCurrentUser: async () => {
                try {
                    const response = await userApi.getMypageData(); // 마이페이지 엔드포인트를 재사용
                    if (response.data.success) {
                        get().setUser(response.data.user);
                        return response.data.user;
                    }
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                    // 401 처리 등은 axios 인터셉터와 useAuthStore.logout에 맡김
                    get().clearUser();
                }
            },
        }),
        {
            name: "user-storage",
            partialize: (state) => ({
                user: state.user,
            }),
            // useAuthStore와 동일한 storage를 사용한다면 여기서 동기화 필요
        }
    )
);

export default userStore;