import { create } from "zustand"; // Zustand 스토어를 생성하는 핵심 함수 import Zustand=전역 상태 관리 라이브러리 - 여러 컴포넌트에서 공유하는 데이터를 관리하는 도구
import { persist } from "zustand/middleware"; // 스토어 상태를 브라우저 저장소에 유지시키는 미들웨어 import
import { userApi } from "../api/userApi"; // 사용자 정보 조회 관련 API 함수 import
// import useAuthStore from "./authStore"; // 필요한 경우 토큰 갱신 로직을 위해 사용 가능 (주석 처리됨)

const userStore = create( // 새로운 Zustand 스토어 생성
    persist( // persist 미들웨어 적용 시작 (상태 영구 저장)
        (set, get) => ({ // 스토어의 상태(State)와 액션(Actions) 정의
            // State
            user: null, // 사용자 상세 정보 객체 (초기값은 null)

            // Actions
            // 사용자 상세 정보 전체를 설정하는 액션
            setUser: (userData) => set({ user: userData }),

            // 프로필 수정 후 전역 상태 업데이트 액션 (setUser과 동일하게 동작)
            updateUser: (userData) => set({ user: userData }),

            // 상태 초기화 (user를 null로 설정)
            clearUser: () => set({ user: null }),

            // [추가 기능] 서버에서 최신 사용자 정보 조회 (Navbar 등에 유용)
            fetchCurrentUser: async () => {
                try {
                    const response = await userApi.getMypageData(); // 마이페이지 데이터를 조회하는 API 호출
                    if (response.data.success) {
                        get().setUser(response.data.user); // 성공 시, setUser 액션을 호출하여 상태 업데이트
                        return response.data.user;
                    }
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                    // 데이터 로드 실패 시, clearUser 액션을 호출하여 상태 초기화
                    // (인증 오류 401 처리는 보통 axios 인터셉터나 useAuthStore가 담당)
                    get().clearUser();
                }
            },
        }),
        {
            name: "user-storage", // 로컬/세션 저장소에 저장될 때 사용될 키 이름
            partialize: (state) => ({ // 스토어 상태 중 저장소에 저장할 부분만 선택
                user: state.user, // user 상태만 저장소에 유지
            }),
            // useAuthStore와 동일한 storage를 사용한다면 여기서 동기화 필요 (현재 설정되지 않음)
        }
    )
);

export default userStore;