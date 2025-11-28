import { Link } from "react-router-dom"; // 라우팅(페이지 이동)을 위한 Link 컴포넌트를 import 합니다.
import useAuth from "../../hooks/useAuth"; // ✅ 사용자 인증 관련 상태와 함수를 관리하는 커스텀 훅(Hook)을 import 합니다.

const UserMenu = () => {
    // useAuth 훅을 호출하여 현재 사용자의 인증 상태, 사용자 정보, 로그아웃 함수를 가져옵니다.
    const { isAuthenticated, user, handleLogout } = useAuth();

    return (
        <div className="flex justify-end items-center space-x-6 text-sm">
            {/* 1. 사용자가 로그인 되어 있는지 (isAuthenticated가 true인지) 확인합니다. */}
            {isAuthenticated ? (
                // ✅ 로그인 상태일 때 표시되는 UI
                <>
                    {/* 사용자 객체(user)가 존재하면 username을 표시합니다. user?.username은 안전 접근 연산자입니다. */}
                    <span>{user?.username}님</span>

                    {/* 로그아웃 버튼: 클릭 시 useAuth 훅에서 가져온 handleLogout 함수를 실행합니다. */}
                    <button
                        onClick={handleLogout}
                        className="hover:underline bg-transparent border-0 text-white cursor-pointer"
                    >
                        로그아웃
                    </button>
                </>
            ) : (
                <>
                    <Link to="/login" className="hover:underline">
                        로그인
                    </Link>

                    <Link to="/signup" className="hover:underline">
                        회원가입
                    </Link>
                </>
            )}
        </div>
    );
};

export default UserMenu; // UserMenu 컴포넌트를 내보냅니다.