import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import CompleteProfileModal from "../../components/user/CompleteProfileModal";

const KakaoCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleKakaoCallback, handleCompleteProfile } = useAuth();
  const [error, setError] = useState("");
  const hasProcessed = useRef(false);

  // ✅ 모달 상태 관리
  const [showCompleteProfileModal, setShowCompleteProfileModal] =
    useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (hasProcessed.current) {
      console.log("⚠️ 이미 처리됨, 중복 실행 방지");
      return;
    }

    const processKakaoLogin = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      console.log("🔐 카카오 콜백 처리 시작:", { code, errorParam });

      if (errorParam) {
        setError("카카오 로그인이 취소되었습니다.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      if (!code) {
        setError("인증 코드가 없습니다.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      hasProcessed.current = true;

      try {
        console.log("📤 백엔드로 code 전송:", code);
        const result = await handleKakaoCallback(code);

        console.log("✅ 카카오 로그인 결과:", result);

        if (!result.success) {
          setError(result.message || "카카오 로그인에 실패했습니다.");
          hasProcessed.current = false;
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        // ✅ 주소 입력 필요 여부 확인
        if (result.requiresAddressUpdate) {
          console.log("🏠 주소 입력 필요! 모달 표시");
          setUserInfo(result.user);
          setShowCompleteProfileModal(true);
        } else {
          // ✅ 주소가 이미 있으면 바로 메인으로 이동
          console.log("✅ 주소 정보 있음, 메인으로 이동");
          // navigate는 useAuth에서 이미 처리됨
        }
      } catch (err) {
        console.error("❌ 카카오 로그인 에러:", err);
        setError("카카오 로그인 처리 중 오류가 발생했습니다.");
        hasProcessed.current = false;
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    processKakaoLogin();
  }, []);

  // ✅ 필수정보 입력 완료 핸들러
  const handleCompleteProfileSubmit = async (profileData) => {
    try {
      await handleCompleteProfile(profileData);
      // navigate는 handleCompleteProfile에서 처리됨
    } catch (error) {
      throw error; // 모달에서 에러 표시
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          {error ? (
            <div className="space-y-4">
              <div className="text-6xl">❌</div>
              <h2 className="text-2xl font-bold text-red-600">로그인 실패</h2>
              <p className="text-gray-600">{error}</p>
              <p className="text-sm text-gray-500">
                로그인 페이지로 이동합니다...
              </p>
            </div>
          ) : !showCompleteProfileModal ? (
            <div className="space-y-4">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
              <h2 className="text-2xl font-bold text-gray-800">
                카카오 로그인 처리 중...
              </h2>
              <p className="text-gray-600">잠시만 기다려주세요</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* ✅ 필수정보 입력 모달 */}
      <CompleteProfileModal
        isOpen={showCompleteProfileModal}
        onClose={() => {}} // 닫기 방지
        onComplete={handleCompleteProfileSubmit}
        userInfo={userInfo}
      />
    </>
  );
};

export default KakaoCallbackPage;
