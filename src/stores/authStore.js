import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import useLikeStore from "./likeStore";

// 인증(로그인) 상태를 관리하는 전역 store 생성
const useAuthStore = create(
    persist(
        (set, get) => ({
            // ===== 상태(State) =====
            user: null,              // 사용자 정보 (이름, 이메일 등)
            accessToken: null,       // API 요청에 사용하는 토큰
            refreshToken: null,      // 토큰 갱신용 토큰
            isAuthenticated: false,  // 로그인 여부

            // ===== 액션(Actions) - 상태를 변경하는 함수들 =====

            // 로그인 함수 - 서버에서 받은 데이터를 저장
            login: (loginData) => {
                set({
                    user: loginData.user,
                    accessToken: loginData.accessToken,
                    refreshToken: loginData.refreshToken,
                    isAuthenticated: true,  // 로그인 상태로 변경
                });
            },

            // 로그아웃 함수 - 모든 인증 정보 삭제
            logout: () => {
                // 찜하기 store도 함께 초기화
                useLikeStore.getState().reset();

                // 인증 관련 상태 모두 null로 초기화
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,  // 로그아웃 상태로 변경
                });
            },

            // 사용자 정보만 업데이트 (프로필 수정 시 사용)
            updateUser: (userData) => set({ user: userData }),

            // 토큰만 업데이트 (토큰 갱신 시 사용)
            updateTokens: (accessToken, refreshToken) =>
                set({
                    accessToken,
                    refreshToken,
                }),

            // 초기화 함수 - 페이지 새로고침 시 localStorage에서 복원 후 실행
            initialize: () => {
                // 현재 상태 가져오기
                const state = get();

                // 토큰과 사용자 정보가 있으면 로그인 상태로 설정
                if (state.accessToken && state.user) {
                    set({ isAuthenticated: true });
                } else {
                    // 하나라도 없으면 로그아웃 상태로 설정
                    set({ isAuthenticated: false });
                }
            },
        }),
        {
            // ===== persist 설정 - localStorage에 저장하는 방법 =====

            // localStorage에 저장될 키 이름
            name: "auth-storage",

            // 저장 위치를 localStorage로 명시
            storage: createJSONStorage(() => localStorage),

            // 어떤 상태들을 저장할지 선택 (함수는 저장 안 됨)
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),

            // localStorage에서 데이터를 복원(hydration)한 후 실행되는 콜백
            // 페이지 새로고침 시 자동으로 실행됨
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // 복원된 상태로 initialize 함수 실행
                    state.initialize();
                }
            },
        }
    )
);

export default useAuthStore;
