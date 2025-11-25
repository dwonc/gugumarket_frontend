// src/pages/payment/PaymentCancelPage.jsx
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Button from "../../components/common/Button";

const PaymentCancelPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const transactionId = searchParams.get("transaction_id");

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            {/* 취소 아이콘 */}
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="bi bi-x-circle-fill text-6xl text-orange-500" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              결제가 취소되었습니다
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              사용자에 의해 결제가 취소되었습니다.
            </p>

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

            {/* 안내 메시지 */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <i className="bi bi-info-circle text-orange-600 text-xl mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-2">안내사항</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>결제가 취소되어 주문이 생성되지 않았습니다.</li>
                    <li>
                      다시 결제를 진행하시려면 상품 페이지로 이동해주세요.
                    </li>
                    <li>
                      결제 중 문제가 발생한 경우 Q&A 게시판을 이용해주세요.
                    </li>
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
                <i className="bi bi-arrow-left mr-2" />
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
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PaymentCancelPage;
