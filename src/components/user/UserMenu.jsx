import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth"; // ✅ useAuth 훅 사용

const UserMenu = () => {
    const { isAuthenticated, user, handleLogout } = useAuth(); // useAuth에서 user 정보 가져옴

    return (
        <div className="flex justify-end items-center space-x-6 text-sm">
            {isAuthenticated ? (
                <>
                    {/* user?.username 대신 user?.nickname을 사용하는 것이 일반적일 수 있으나,
             현재 useAuth에는 username만 정의되어 있으므로 그대로 사용 */}
                    <span>{user?.username}님</span>
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

export default UserMenu;