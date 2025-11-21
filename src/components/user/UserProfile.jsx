import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../common/Button";

const UserProfile = ({ user }) => {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);

    // 프로필 이미지 URL 생성 (user.profileImage가 변경될 때마다 새로운 타임스탬프)
    const profileImageUrl = useMemo(() => {
        // 이미지 로드 실패 시 data URI 기본 이미지 사용
        if (imageError || !user?.profileImage) {
            // SVG를 data URI로 변환한 기본 이미지
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzZCNEY0RiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UHJvZmlsZTwvdGV4dD48L3N2Zz4=';
        }

        // 서버 이미지 URL에 타임스탬프 추가 (user.profileImage가 변경되면 useMemo가 재계산됨)
        return `${user.profileImage}?t=${Date.now()}`;
    }, [user?.profileImage, imageError]);

    if (!user) return null;

    const displayAddress = user.address || '주소 정보 없음';

    // 이미지 로드 실패 핸들러
    const handleImageError = () => {
        console.error('프로필 이미지 로드 실패:', user?.profileImage);
        setImageError(true);
    };

    // user.profileImage가 변경되면 에러 상태 리셋
    // useMemo가 재계산될 때 imageError도 의존성이므로 자연스럽게 처리됨
    if (imageError && user?.profileImage) {
        // 새로운 이미지 URL이면 에러 상태 리셋
        setImageError(false);
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-6">
                {/* 프로필 이미지 섹션 */}
                <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-lg bg-gray-100">
                        <img
                            src={profileImageUrl}
                            alt="프로필 이미지"
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                        />
                    </div>
                    {/* 수정 버튼 아이콘 */}
                    <Link
                        to="/mypage/edit"
                        className="absolute bottom-0 right-0 bg-white border-2 border-primary text-primary p-2 rounded-full hover:bg-primary hover:text-white transition-all shadow-md"
                        aria-label="프로필 수정"
                    >
                        <i className="bi bi-pencil"></i>
                    </Link>
                </div>

                {/* 사용자 정보 섹션 */}
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {user.nickname || user.userName}
                    </h1>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-gray-500 text-sm mt-1">
                        <i className="bi bi-geo-alt"></i>
                        <span className="ml-1">{displayAddress}</span>
                    </p>
                </div>

                {/* 프로필 수정 버튼 */}
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