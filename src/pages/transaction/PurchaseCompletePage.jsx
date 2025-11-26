// src/pages/transaction/PurchaseCompletePage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";

const PurchaseCompletePage = () => {
  // 라우터: /purchase/complete/:transactionId
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 거래 정보 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // 방법 1) 쿼리 파라미터 방식
        const res = await api.get("/api/purchase/complete", {
          params: { transactionId },
        });

        // 방법 2를 쓰고 싶으면 위를 주석 처리하고 아래를 활성화
        // const res = await api.get(`/api/purchase/${transactionId}`);

        const payload = res.data;

        if (!payload || payload.success === false || !payload.data) {
          throw new Error(
            payload?.message || "거래 정보를 불러올 수 없습니다."
          );
        }

        if (!payload.data.transaction) {
          throw new Error("거래 정보를 찾을 수 없습니다.");
        }

        setTransaction(payload.data.transaction);
      } catch (err) {
        console.error(err);

        if (err.response && err.response.status === 401) {
          setError("로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
        } else {
          setError(
            err.message || "거래 정보를 불러오는 중 오류가 발생했습니다."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (!transactionId) {
      setLoading(false);
      setError("유효하지 않은 거래 번호입니다.");
      return;
    }

    fetchData();
  }, [transactionId]);

  // 계좌번호 복사
  const handleCopyAccount = () => {
    if (!transaction?.product?.accountNumber) return;
    navigator.clipboard
      .writeText(transaction.product.accountNumber)
      .then(() => alert("계좌번호가 복사되었습니다."))
      .catch(() => alert("복사에 실패했습니다."));
  };

  // 로딩 중
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Loading text="구매 완료 정보를 불러오는 중입니다..." />
        </div>
        <Footer />
      </>
    );
  }

  // 에러 or 거래 없음
  if (!transaction) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ErrorMessage
            type="error"
            message={error || "구매 완료 정보를 가져올 수 없습니다."}
          />
          <div className="mt-6 flex gap-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => navigate("/")}
            >
              <i className="bi bi-house-door mr-2" />
              홈으로
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => navigate(0)}
            >
              <i className="bi bi-arrow-clockwise mr-2" />
              다시 시도
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ✅ 정상 화면용 데이터 구조 분해
  const product = transaction.product || {};
  const buyer = transaction.buyer || {};
  const seller = transaction.seller || {};
  const dueDateText =
    transaction.dueDateText || "입금 기한 정보는 판매자가 별도로 안내드립니다.";

  return (
    <>
      <Navbar />

      {/* 상단 단계 표시 */}
      <div className="bg-white border-b py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mb-2">
                <i className="bi bi-check-lg text-xl" />
              </div>
              <p className="text-sm font-medium text-primary">상품 선택</p>
            </div>
            <div className="flex-1 h-1 bg-primary" />
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mb-2">
                <i className="bi bi-check-lg text-xl" />
              </div>
              <p className="text-sm font-medium text-primary">구매 정보 입력</p>
            </div>
            <div className="flex-1 h-1 bg-primary" />
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mb-2">
                <i className="bi bi-check-lg text-xl" />
              </div>
              <p className="text-sm font-medium text-primary">구매 완료</p>
            </div>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
        {/* 상단 완료 메시지 카드 */}
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="bi bi-check-circle-fill text-5xl text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            구매가 완료되었습니다!
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            주문번호:{" "}
            <span className="font-bold text-primary">
              {transaction.transactionId}
            </span>
          </p>
          <p className="text-gray-500">
            입금 확인 후 판매자가 채팅 또는 연락처로 연락드릴 예정입니다.
          </p>
        </div>

        {/* 입금 정보 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="bi bi-credit-card text-primary" />
            입금 정보
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">은행</span>
                <span className="font-bold text-gray-800">
                  {product.bankName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">계좌번호</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800" id="accountNumber">
                    {product.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="text-primary hover:text-secondary transition-colors"
                    title="계좌번호 복사"
                  >
                    <i className="bi bi-clipboard" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">예금주</span>
                <span className="font-bold text-gray-800">
                  {product.accountHolder}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">입금액</span>
                <span className="font-bold text-primary text-xl">
                  {product.price?.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-blue-200 pt-3">
                <span className="text-gray-600">입금 기한</span>
                <span className="font-bold text-red-600">{dueDateText}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex">
              <i className="bi bi-exclamation-triangle-fill text-yellow-500 text-xl mr-3" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">입금 시 유의사항</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    입금 기한 내에 입금하지 않으면 주문이 자동 취소될 수
                    있습니다.
                  </li>
                  <li>
                    입금자명이 다른 경우 마이페이지에서 입금자명을 수정해주세요.
                  </li>
                  <li>입금 확인까지 1~2시간 정도 소요될 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 주문 상품 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="bi bi-box-seam text-primary" />
            주문 상품
          </h2>
          <div className="flex gap-4 border border-gray-200 rounded-lg p-4">
            <img
              src={product.mainImage || "/no-image.png"}
              alt={product.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-1">{product.title}</h3>
              <p className="text-sm text-gray-600 mb-1">
                판매자: <span>{seller.nickname || product.sellerNickname}</span>
              </p>
              <p className="text-lg font-bold text-primary">
                {product.price?.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>

        {/* 구매자 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="bi bi-person-circle text-primary" />
            구매자 정보
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">이름</span>
              <span className="font-medium text-gray-800">
                {buyer.nickname}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">전화번호</span>
              <span className="font-medium text-gray-800">{buyer.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">배송지</span>
              <span className="font-medium text-gray-800 text-right">
                {buyer.address}
              </span>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/mypage")}
            className="w-full"
          >
            <i className="bi bi-list-ul mr-2" />
            구매내역 보기
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate("/")}
            className="w-full"
          >
            <i className="bi bi-house-door mr-2" />
            홈으로
          </Button>
        </div>

        {/* 고객센터 링크 */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">문의사항이 있으신가요?</p>
          <Link
            to="/qna"
            className="text-primary hover:text-secondary font-medium"
          >
            고객센터 바로가기 <i className="bi bi-arrow-right" />
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PurchaseCompletePage;
