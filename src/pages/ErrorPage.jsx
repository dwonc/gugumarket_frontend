import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const ErrorPage = ({ errorInfo: propErrorInfo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // ✅ 우선순위: props > location.state > URL query params > 기본값
  const getErrorInfo = () => {
    // 1. Props로 전달된 에러 정보
    if (propErrorInfo) {
      return propErrorInfo;
    }

    // 2. location.state에서 에러 정보
    if (location.state?.error) {
      return location.state.error;
    }

    // 3. URL 쿼리 파라미터에서 에러 정보
    const statusParam = searchParams.get("status");
    const messageParam = searchParams.get("message");
    const errorParam = searchParams.get("error");
    const pathParam = searchParams.get("path");

    if (statusParam || messageParam) {
      return {
        status: parseInt(statusParam) || 500,
        error: errorParam || "Internal Server Error",
        path: pathParam || location.pathname,
        message: messageParam || "오류가 발생했습니다.",
        trace: null,
      };
    }

    // 4. 기본값
    return {
      status: 500,
      error: "Internal Server Error",
      path: location.pathname,
      message: "오류가 발생했습니다.",
      trace: null,
    };
  };

  const errorInfo = getErrorInfo();

  useEffect(() => {
    document.title = "오류 발생 - GUGU Market";
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  // ✅ 에러 상태에 따른 아이콘 변경
  const getErrorIcon = () => {
    const status = errorInfo.status;
    if (status === 404) return "🔍";
    if (status === 403) return "🚫";
    if (status === 401) return "🔒";
    if (status >= 500) return "🔥";
    return "⚠️";
  };

  // ✅ 에러 상태에 따른 메시지
  const getErrorTitle = () => {
    const status = errorInfo.status;
    if (status === 404) return "페이지를 찾을 수 없습니다";
    if (status === 403) return "접근이 거부되었습니다";
    if (status === 401) return "인증이 필요합니다";
    if (status >= 500) return "서버 오류가 발생했습니다";
    return "오류가 발생했습니다";
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center min-h-screen">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* 아이콘 */}
          <div className="text-6xl mb-4">{getErrorIcon()}</div>

          {/* 제목 */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {getErrorTitle()}
          </h1>

          {/* 에러 정보 박스 */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6 text-left">
            <p className="text-gray-700 mb-2">
              <strong>상태 코드:</strong>{" "}
              <span className="font-mono">{errorInfo.status}</span>
            </p>
            <p className="text-gray-700 mb-2">
              <strong>에러:</strong> {errorInfo.error}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>경로:</strong>{" "}
              <span className="font-mono">{errorInfo.path}</span>
            </p>
            <p className="text-gray-700">
              <strong>메시지:</strong> {errorInfo.message}
            </p>

            {/* 개발 중일 때만 스택 트레이스 표시 */}
            {errorInfo.trace && import.meta.env.DEV && (
              <div className="mt-4 pt-4 border-t border-red-300">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>스택 트레이스:</strong>
                </p>
                <pre className="text-xs bg-red-100 p-3 rounded overflow-auto max-h-64">
                  {errorInfo.trace}
                </pre>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleGoHome}
              className="bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              🏠 메인으로
            </button>
            <button
              onClick={handleGoBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-all"
            >
              ← 뒤로가기
            </button>
          </div>

          {/* 도움말 링크 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              문제가 계속된다면{" "}
              <a
                href="/qna"
                className="text-primary hover:text-secondary font-medium underline"
              >
                고객센터
              </a>
              에 문의해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
