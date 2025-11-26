import api from "./axios";

const KAKAO_CLIENT_ID = "15357c9bee4652654d7745794e66a1c1";
const KAKAO_REDIRECT_URI = window.location.origin + "/auth/kakao"; // ✅ 동적으로 변경

export const kakaoApi = {
    redirectToKakaoLogin: () => {
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
        window.location.href = kakaoAuthUrl;
    },

    kakaoCallback: async (code) => {
        // ⚠️ 하드코딩된 URL 제거
        const response = await api.get(`/auth/kakao/callback`, { // ✅ baseURL 사용
            params: { code },
        });
        return response;
    },
};