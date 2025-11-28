import { useMemo, useState, useEffect } from "react"; // ⭐️ useEffect 추가
import { Link, useNavigate } from "react-router-dom"; // Link: 라우팅 컴포넌트, useNavigate: 페이지 이동 훅 import
import Button from "../common/Button"; // Button 컴포넌트 import (기능 로직 자체는 포함하지 않음)

const UserProfile = ({ user }) => {
    const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수 초기화
    const [imageError, setImageError] = useState(false); // 프로필 이미지 로드 실패 상태를 저장하는 상태 변수
    // eslint-disable-next-line react-hooks/purity
    const [timestamp, setTimestamp] = useState(Date.now());

    // ⭐️ useEffect 1: imageError 리셋 로직
    // user.profileImage가 변경될 때, 이전에 설정된 에러 상태를 초기화합니다.
    useEffect(() => {
        if (imageError && user?.profileImage) {
            setImageError(false);
        }
    }, [user?.profileImage, imageError]);

    // ⭐️ useEffect 2: 캐시 무효화를 위한 타임스탬프 업데이트 로직
    // user.profileImage가 변경될 때만 새로운 타임스탬프를 생성합니다.
    useEffect(() => {
        if (user?.profileImage) {
            // Date.now() 호출이 user.profileImage 변경 시점에만 실행되도록 명시
            setTimestamp(Date.now()); // 또는 setTimestamp(() => Date.now());
        }
    }, [user?.profileImage]);

    // 프로필 이미지 URL 생성 및 메모이제이션
    const profileImageUrl = useMemo(() => {
        // 이미지 로드 실패 상태이거나, 사용자에게 프로필 이미지가 없는 경우
        if (imageError || !user?.profileImage) {
            // Data URI로 인코딩된 기본 이미지(Placeholder)를 반환
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzZCNEY0RiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UHJvZmlsZTwvdGV4dD48L3N2Zz4=';
        }

        // 서버 이미지 URL에 현재 타임스탬프를 쿼리 파라미터로 추가
        // 이를 통해 브라우저 캐시를 무효화하고 user.profileImage가 변경될 때마다 최신 이미지를 강제 로드함
        return `${user.profileImage}?t=${timestamp}`;
    }, [user?.profileImage, imageError,timestamp]); // 의존성 배열: user.profileImage 또는 imageError가 변경될 때 재계산

    // user prop이 없으면 null을 반환하여 렌더링을 중단 (널 체크)
    if (!user) return null;

    // user.address가 있으면 주소를, 없으면 '주소 정보 없음' 문자열을 표시
    // if(!user) return null; ❌ 중복 제거
    const displayAddress = user.address || '주소 정보 없음';

    // 이미지 로드 실패 핸들러
    const handleImageError = () => {
        console.error('프로필 이미지 로드 실패:', user?.profileImage); // 콘솔에 오류 기록
        setImageError(true); // imageError 상태를 true로 설정하여 대체 이미지(profileImageUrl)가 사용되도록 트리거
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-6">
                {/* 프로필 이미지 섹션 */}
                <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-lg bg-gray-100">
                        <img
                            src={profileImageUrl} // useMemo로 계산된 URL 사용
                            alt="프로필 이미지"
                            className="w-full h-full object-cover"
                            onError={handleImageError} // 이미지 로드 실패 이벤트 발생 시 handleImageError 호출
                        />
                    </div>
                    {/* 수정 버튼 아이콘: Link 컴포넌트를 사용하여 /mypage/edit 경로로 라우팅 */}
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
                        {user.nickname || user.userName} {/* 닉네임이 없으면 userName을 대체 표시 */}
                    </h1>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-gray-500 text-sm mt-1">
                        <i className="bi bi-geo-alt"></i>
                        <span className="ml-1">{displayAddress}</span> {/* 포맷된 주소 정보 표시 */}
                    </p>
                </div>

                {/* 프로필 수정 버튼 */}
                <div>
                    {/* 버튼 클릭 시 navigate 함수를 사용하여 /mypage/edit 경로로 이동 */}
                    <Button onClick={() => navigate('/mypage/edit')} variant="secondary" size="md">
                        <i className="bi bi-pencil mr-2"></i>프로필 수정
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;