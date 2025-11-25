// src/pages/payment/PaymentFailPage.jsx
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Button from "../../components/common/Button";

const PaymentFailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const transactionId = searchParams.get("transaction_id");
  const message =
    searchParams.get("message") || "결제 처리 중 오류가 발생했습니다.";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            {/* 실패 아이콘 */}
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="bi bi-exclamation-triangle-fill text-6xl text-red-500" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              결제에 실패했습니다
            </h1>

            <p className="text-lg text-gray-600 mb-8">{message}</p>

            {/* 거래 정보 */}
            {transactionId && (
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">거래 번호</span>
                  <span className="font-mono font-bold text-gray-800">
                    #{transactionId}
                  </span>
                </div>
              </div>
            )}

            {/* 실패 원인 안내 */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <i className="bi bi-exclamation-circle text-red-600 text-xl mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-2">결제 실패 원인</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>카드 한도 초과 또는 잔액 부족</li>
                    <li>결제 정보 오류 (카드번호, 유효기간 등)</li>
                    <li>네트워크 연결 문제</li>
                    <li>카드사 또는 은행 시스템 오류</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 해결 방법 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <i className="bi bi-lightbulb text-blue-600 text-xl mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-2">해결 방법</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>결제 정보를 다시 확인해주세요</li>
                    <li>다른 결제 수단을 이용해보세요</li>
                    <li>카드사에 문의하여 결제 가능 여부를 확인해주세요</li>
                    <li>문제가 계속되면 Q&A 게시판으로 문의해주세요</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(-2)} // 구매 페이지로
              >
                <i className="bi bi-arrow-clockwise mr-2" />
                다시 시도
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate("/")}
              >
                <i className="bi bi-house-door mr-2" />
                홈으로
              </Button>
            </div>

            {/* 고객센터 링크 */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3">
                결제 문제가 계속되시나요?
              </p>
              <button
                onClick={() => navigate("/qna")}
                className="text-primary hover:text-secondary font-medium transition-colors"
              >
                <i className="bi bi-headset mr-1" />
                고객센터 문의하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PaymentFailPage;
