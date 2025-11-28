import api from "./axios";

// 사용자 관련 API 함수들을 모아놓은 객체
export const userApi = {
    // ✅ 아이디 중복 체크
    // username을 파라미터로 받아서 해당 아이디가 이미 사용 중인지 확인
    checkUsername: async (username) => {
        // GET 요청으로 쿼리 파라미터(?username=...)로 전달
        //파라미터=함수에 전달하는 입력값
        const response = await api.get("/api/users/check-username", {
            //params=?뒤의 데이터 (ex.?username=john123)
            params: { username },
        });

        return response;
    },

    // ✅ 회원가입
    // 회원가입에 필요한 모든 데이터를 받아서 서버로 전송
    //async=비동기 작업,작업이 완료될 때까지 기다리지 않고 다음 코드를 먼저 실행하는 방식
    signup: async (userData) => {
        // POST 요청으로 사용자 데이터를 body에 담아서 전송
        const response = await api.post("/api/users/signup", userData);

        return response;
    },

    // 아이디 찾기
    // 이메일을 통해 가입된 아이디를 찾는 기능
    findUsername: async (email) => {
        // POST 요청으로 이메일을 전송하여 해당 이메일로 가입된 아이디 조회
        const response = await api.post("/api/users/find-username", { email });

        return response;
    },

    // 이메일 인증 (비밀번호 찾기 1단계)
    // 비밀번호 재설정 전에 본인 확인을 위한 이메일 인증
    verifyEmail: async (userName, email) => {
        // POST 요청으로 아이디와 이메일을 전송하여 일치 여부 확인
        const response = await api.post("/api/users/verify-email", {
            userName,
            email,
        });

        return response;
    },

    // 비밀번호 재설정 (비밀번호 찾기 2단계)
    // 이메일 인증 후 받은 토큰으로 새 비밀번호 설정
    resetPassword: async (resetToken, newPassword) => {
        // POST 요청으로 인증 토큰과 새 비밀번호를 전송
        const response = await api.post("/api/users/reset-password", {
            resetToken,
            newPassword,
        });

        return response;
    },

    // 회원정보 수정 폼 데이터 조회
    // 마이페이지에서 현재 사용자의 정보를 불러오기
    getEditFormData: async () => {
        // GET 요청으로 현재 로그인한 사용자의 정보 조회
        const response = await api.get("/mypage/edit");

        return response;
    },

    // 회원정보 수정
    // 변경된 사용자 정보를 서버에 저장
    updateProfile: async (formData) => {
        // POST 요청으로 폼 데이터 전송
        // multipart/form-data 타입 사용 (파일 업로드 포함 가능)
        const response = await api.post("/mypage/edit", formData, {
            headers: {
                "Content-Type": "multipart/form-data", // 파일 전송을 위한 헤더 설정
            },
        });

        return response;
    },

    // 회원탈퇴
    // 현재 로그인한 사용자의 계정을 삭제
    deleteUser: async () => {
        // DELETE 요청으로 사용자 계정 삭제
        const response = await api.delete("/mypage");

        return response;
    },
};


export default userApi;
