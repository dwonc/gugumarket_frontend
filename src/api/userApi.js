import api from "./axios";

export const userApi = {
    // 회원가입
    signup: (userData) => api.post("/api/users/signup", userData),

    // 아이디 중복 확인
    checkUsername: (userName) => api.post("/api/users/check-username", { userName }),

    // 마이페이지 데이터 조회
    getMypageData: () => api.get("/mypage"),

    // 프로필 수정 데이터 조회 (폼 채우기용)
    getEditFormData: () => api.get("/mypage/edit"),

    // 프로필 수정 데이터 전송
    updateProfile: (formData) => api.post("/mypage/edit", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),

    // 회원탈퇴 (DELETE /users/delete 엔드포인트 가정)
    deleteUser: () => api.delete("/users/delete"),
};