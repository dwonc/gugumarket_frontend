import axios from "axios";
import useAuthStore from "../stores/authStore";

// axios 인스턴스 생성 - API 요청의 기본 설정을 정의
//VITE_API_BASE_URL=http://localhost:8080
const api = axios.create({
    // 환경변수에서 API 기본 URL을 가져오거나, 없으면 로컬호스트 사용
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
    // API 요청 타임아웃 설정 (10초)
    timeout: 10000,
    // 모든 요청의 기본 헤더 설정
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ 이미지 경로 변환 헬퍼 함수
function convertImagePaths(data) {
  const baseURL = api.defaults.baseURL;

  // null, undefined 처리
  if (!data) return data;

  // 배열인 경우
  if (Array.isArray(data)) {
    return data.map((item) => convertImagePaths(item));
  }

  // 객체인 경우
  if (typeof data === "object") {
    const converted = {};

    for (const key in data) {
      const value = data[key];

      // 이미지 관련 필드명 체크 (image, Image, img 포함)
      if (
        (key.toLowerCase().includes("image") ||
          key.toLowerCase().includes("img")) &&
        typeof value === "string" &&
        value.length > 0
      ) {
        // 이미 완전한 URL이면 그대로
        if (value.startsWith("http://") || value.startsWith("https://")) {
          converted[key] = value;
        }
        // Cloudinary 등 외부 서비스면 그대로
        else if (
          value.includes("cloudinary.com") ||
          value.includes("res.cloudinary.com")
        ) {
          converted[key] = value;
        }
        // Data URI면 그대로
        else if (value.startsWith("data:")) {
          converted[key] = value;
        }
        // 상대 경로면 baseURL 붙이기
        else {
          const cleanPath = value.startsWith("/") ? value : `/${value}`;
          converted[key] = `${baseURL}${cleanPath}`;
        }
      }
      // 중첩 객체/배열은 재귀 처리
      else if (value && typeof value === "object") {
        converted[key] = convertImagePaths(value);
      }
      // 나머지는 그대로
      else {
        converted[key] = value;
      }
    }

    return converted;
  }

  // 기본값 그대로 반환
  return data;
}

// Request Interceptor (토큰 자동 추가)
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (토큰 갱신 처리 + 이미지 URL 변환)
api.interceptors.response.use(
  (response) => {
    // ✅ 성공 응답에 이미지 경로 변환 적용
    if (response.data) {
      response.data = convertImagePaths(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 && 토큰 갱신 시도 안 했을 때
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        const response = await axios.post(
          `${api.defaults.baseURL}/api/auth/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;

        useAuthStore.getState().updateTokens(newAccessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
