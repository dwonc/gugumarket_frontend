// src/pages/payment/PaymentSuccessPage.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const transactionId = searchParams.get("transaction_id");
  const paymentMethod = searchParams.get("payment_method");

  useEffect(() => {
    // 간단한 로딩 애니메이션
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loading text="결제 완료 처리 중..." />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 성공 아이콘 */}
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <i className="bi bi-check-circle-fill text-6xl text-green-500" />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              🎉 결제가 완료되었습니다!
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              {paymentMethod === "KAKAOPAY"
                ? "카카오페이 결제가 성공적으로 완료되었습니다."
                : "결제가 성공적으로 완료되었습니다."}
            </p>

            {/* 거래 정보 */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">거래 번호</span>
                  <span className="font-mono font-bold text-primary">
                    #{transactionId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">결제 수단</span>
                  <span className="font-semibold">
                    {paymentMethod === "KAKAOPAY" ? (
                      <span className="flex items-center gap-2">
                        <i className="bi bi-chat-fill text-yellow-400" />
                        카카오페이
                      </span>
                    ) : (
                      "무통장 입금"
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">결제 시간</span>
                  <span className="font-semibold">
                    {new Date().toLocaleString("ko-KR")}
                  </span>
                </div>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <i className="bi bi-info-circle text-blue-600 text-xl mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-2">안내사항</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>판매자가 입금을 확인하면 거래가 완료됩니다.</li>
                    <li>거래 내역은 마이페이지에서 확인하실 수 있습니다.</li>
                    <li>문의사항은 Q&A 게시판을 이용해주세요.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/purchase/complete/${transactionId}`)}
              >
                <i className="bi bi-receipt mr-2" />
                영수증 보기
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate("/mypage")}
              >
                <i className="bi bi-list-ul mr-2" />
                구매내역 보기
              </Button>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate("/")}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                <i className="bi bi-house-door mr-1" />
                홈으로 돌아가기
              </button>
            </div>
          </div>

          {/* 추가 정보 카드 */}
          {paymentMethod === "KAKAOPAY" && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <i className="bi bi-chat-fill text-yellow-400 text-2xl" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">
                    카카오페이 결제 완료
                  </h3>
                  <p className="text-sm text-gray-600">
                    카카오톡으로 결제 내역이 발송되었습니다.
                    <br />
                    카카오톡 알림톡을 확인해주세요.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PaymentSuccessPage;
