import axios from "axios";

const KAKAO_CLIENT_ID = "15357c9bee4652654d7745794e66a1c1";
const KAKAO_REDIRECT_URI = "http://localhost:5173/auth/kakao";

export const kakaoApi = {
  // 카카오 로그인 페이지로 리다이렉트
  redirectToKakaoLogin: () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  },

  // 카카오 로그인 콜백 처리 (백엔드로 code 전송)
  kakaoCallback: async (code) => {
    const response = await axios.get(
      `http://localhost:8080/api/auth/kakao/callback`,
      {
        params: { code },
      }
    );
    return response;
  },
};
