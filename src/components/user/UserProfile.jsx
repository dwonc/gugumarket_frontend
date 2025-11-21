import { Link, useNavigate } from "react-router-dom";
import userStore from "../../stores/userStore";
import Button from "../common/Button"; // Button.jsx 임포트

const UserProfile = ({ user }) => {
    const navigate = useNavigate();

    if (!user) return null; // user 정보가 없으면 렌더링하지 않음

    // user.profileImageOrDefault() 대신 직접 로직 구현
    const profileImage = user.profileImage || '/images/default-profile.png';
    const displayAddress = user.address || '주소 정보 없음';

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <img
                        src={profileImage}
                        alt="프로필 이미지"
                        className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 shadow-md"
                        onError={(e) => {e.target.onerror = null; e.target.src='/images/default-profile.png'}}
                    />
                    {/* 수정 버튼 아이콘 */}
                    <Link to="/mypage/edit"
                          className="absolute bottom-0 right-0 bg-white border-2 border-primary text-primary p-2 rounded-full hover:bg-primary hover:text-white transition-all">
                        <i className="bi bi-pencil"></i>
                    </Link>
                </div>

                <div className="flex-1">
                    {/* user.nickname이 DTO에 있다고 가정 */}
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.nickname || user.userName}</h1>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-gray-500 text-sm mt-1">
                        <i className="bi bi-geo-alt"></i>
                        <span className="ml-1">{displayAddress}</span>
                    </p>
                </div>

                <div>
                    <Button onClick={() => navigate('/mypage/edit')} variant="secondary" size="md">
                        <i className="bi bi-pencil mr-2"></i>프로필 수정
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;