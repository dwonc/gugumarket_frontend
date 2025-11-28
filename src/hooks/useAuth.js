import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 훅 import
import useAuthStore from "../stores/authStore"; // 사용자 인증 상태를 관리하는 Zustand 스토어 import
import { authApi } from "../api/authApi"; // 일반 로그인, 콜백 처리, 프로필 완성 등의 인증 관련 API 함수 import
import { kakaoApi } from "../api/kakaoApi"; // 카카오 로그인 리다이렉션을 위한 API 함수 import

const useAuth = () => {
    const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수 인스턴스 생성
    // Zustand 스토어에서 로그인, 로그아웃, 사용자 업데이트 함수 및 현재 상태(user, isAuthenticated)를 구조 분해 할당으로 가져옴
    const { login, logout, updateUser, user, isAuthenticated } = useAuthStore();

    // --- 1. 일반 로그인 처리 함수 ---
    const handleLogin = async (credentials) => {
        try {
            const response = await authApi.login(credentials); // 서버에 로그인 요청 전송
            const { data } = response.data; // 응답 데이터 구조 분해

            // 로그인 성공 시, 스토어에 사용자 정보와 토큰 저장
            login({
                user: {
                    userId: data.userId,
                    userName: data.username,
                    nickname: data.username,
                    email: data.email,
                    role: data.role,
                },
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });

            // 사용자 역할(Role)에 따라 페이지 이동 (ADMIN이면 관리자 페이지, 아니면 메인 페이지)
            if (data.role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/");
            }

            return { success: true }; // 성공 결과 반환
        } catch (error) {
            // 로그인 실패 시, 오류 메시지와 함께 실패 결과 반환
            return {
                success: false,
                message: error.response?.data?.message || "로그인에 실패했습니다.",
            };
        }
    };

    // --- 2. 카카오 로그인 시작 함수 ---
    const handleKakaoLogin = () => {
        // 카카오 OAuth 서버로 사용자 리다이렉션 (실제 로그인을 유도)
        kakaoApi.redirectToKakaoLogin();
    };

    /**
     * --- 3. 카카오 로그인 콜백 처리 함수 ---
     * @param {string} code - 카카오 서버로부터 전달받은 인증 코드
     */
    const handleKakaoCallback = async (code) => {
        try {
            // 인증 코드를 서버로 전송하여 사용자 정보 및 토큰을 요청
            const response = await authApi.kakaoCallback(code);

            if (response.data.success) {
                const loginData = response.data.data;

                // 로그인 성공 시, 스토어에 사용자 정보와 토큰 저장
                // 응답 데이터 구조가 유연할 수 있어 Nullish 병합 연산자 (??)를 사용하여 안전하게 값 할당
                login({
                    user: {
                        userId: loginData.userId ?? loginData.user?.userId,
                        userName: loginData.username ?? loginData.user?.userName,
                        nickname: loginData.user?.nickname ?? loginData.username,
                        email: loginData.email ?? loginData.user?.email,
                        role: loginData.role ?? loginData.user?.role,
                        profileImage: loginData.user?.profileImage,
                    },
                    accessToken: loginData.accessToken,
                    refreshToken: loginData.refreshToken,
                });

                // 주소 정보 입력이 필요한지 여부를 포함하여 결과 객체 생성
                const result = {
                    success: true,
                    message: "카카오 로그인 성공",
                    requiresAddressUpdate: loginData.requiresAddressUpdate || false, // 주소 입력 필요 여부
                    user: loginData.user,
                };

                // 주소 정보 입력이 필요 없으면 (이미 입력되어 있으면) 바로 메인으로 이동
                if (!loginData.requiresAddressUpdate) {
                    navigate("/");
                }

                return result; // 결과 객체 반환 (필수 정보 입력 페이지에서 사용)
            } else {
                // 카카오 로그인 처리 실패
                return {
                    success: false,
                    message: response.data.message || "카카오 로그인에 실패했습니다.",
                };
            }
        } catch (error) {
            console.error("❌ 카카오 로그인 에러:", error);
            // 서버 통신 중 오류 발생 시 실패 결과 반환
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "카카오 로그인 처리 중 오류가 발생했습니다.",
            };
        }
    };

    // --- 4. 로그아웃 처리 함수 ---
    const handleLogout = () => {
        logout(); // Zustand 스토어에서 사용자 정보 및 토큰 제거
        navigate("/login"); // 로그인 페이지로 이동
    };

    /**
     * --- 5. 소셜 로그인 사용자 필수정보 입력 처리 함수 ---
     * 소셜 로그인 후 주소 등 추가 정보를 입력받아 서버에 저장
     */
    const handleCompleteProfile = async (profileData) => {
        try {
            const response = await authApi.completeProfile(profileData); // 서버에 필수 정보 저장 요청

            if (response.data.success) {
                // 서버에서 업데이트된 사용자 정보를 받음
                const updatedUser = response.data.user;
                // Zustand 스토어의 사용자 정보를 업데이트 (updateUser 함수 사용)
                updateUser(updatedUser);

                navigate("/"); // 필수 정보 입력 완료 후 메인 페이지로 이동

                return {
                    success: true,
                    message: response.data.message,
                };
            } else {
                // 서버 응답은 성공이지만 데이터 내에서 실패 메시지를 보낸 경우 오류 발생
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error("❌ 필수정보 입력 실패:", error);
            throw error; // 오류를 상위 호출자에게 전파하여 UI에 표시 등 후속 처리 가능하도록 함
        }
    };

    // --- 6. 훅에서 제공하는 값 및 함수 반환 ---
    return {
        user, // 현재 로그인된 사용자 정보
        isAuthenticated, // 현재 로그인 상태
        handleLogin, // 일반 로그인 함수
        handleKakaoLogin, // 카카오 로그인 시작 함수
        handleKakaoCallback, // 카카오 콜백 처리 함수
        handleCompleteProfile, // 필수 정보 입력 완료 함수
        handleLogout, // 로그아웃 함수
    };
};

export default useAuth; // useAuth 훅 내보내기