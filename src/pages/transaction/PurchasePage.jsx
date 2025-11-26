// src/pages/purchase/PurchasePage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";
import Loading from "../../components/common/Loading";

const PurchasePage = () => {
  const { id } = useParams();
  const productId = Number(id);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [depositorName, setDepositorName] = useState("");
  const [message, setMessage] = useState("");

  const [agreePurchase, setAgreePurchase] = useState(false);
  const [agreeInfo, setAgreeInfo] = useState(false);
  const [agreeAll, setAgreeAll] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ⭐ 결제 수단 상태 추가
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");

  // 구매 페이지에 필요한 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/api/purchase/ready", {
          params: { productId },
        });

        const payload = res.data;

        if (!payload || payload.success === false || !payload.data) {
          throw new Error(
            payload?.message || "구매 정보를 불러올 수 없습니다."
          );
        }

        const { product, user } = payload.data;
        if (!product || !user) {
          throw new Error("상품 또는 사용자 정보를 찾을 수 없습니다.");
        }

        setProduct(product);
        setUser(user);
        setDepositorName(user.nickname || "");
        setMessage("");
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 401) {
          setError("로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
        } else {
          setError(
            err.message || "구매 정보를 불러오는 중 오류가 발생했습니다."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (!productId || Number.isNaN(productId)) {
      setError("잘못된 상품 번호입니다.");
      setLoading(false);
      return;
    }

    fetchData();
  }, [productId]);

  // 전체 동의 체크박스 변경
  const handleAgreeAllChange = (checked) => {
    setAgreeAll(checked);
    setAgreePurchase(checked);
    setAgreeInfo(checked);
  };

  // 개별 체크 변경 시 전체 동의 상태 갱신
  useEffect(() => {
    setAgreeAll(agreePurchase && agreeInfo);
  }, [agreePurchase, agreeInfo]);

  // ⭐ 구매 요청 - 결제 수단별 분기 처리
  const handleSubmit = async () => {
    if (!agreePurchase || !agreeInfo) {
      alert("필수 약관에 동의해주세요.");
      return;
    }

    // 무통장 입금일 때만 입금자명 체크
    if (paymentMethod === "BANK_TRANSFER" && !depositorName.trim()) {
      alert("입금자명을 입력해주세요.");
      return;
    }

    const confirmResult = window.confirm(
      paymentMethod === "KAKAOPAY"
        ? "카카오페이 결제를 진행하시겠습니까?"
        : "구매를 진행하시겠습니까?\n\n입금 정보를 확인하신 후 입금해주세요."
    );
    if (!confirmResult) return;

    try {
      setSubmitting(true);
      setError("");

      // ⭐ 결제 수단 포함해서 전송
      const res = await api.post("/api/purchase", {
        productId,
        depositorName: depositorName.trim(),
        phone: user.phone,
        address: user.address,
        message: message.trim(),
        paymentMethod: paymentMethod, // ⭐ 추가!
      });

      const payload = res.data;

      if (!payload || payload.success === false) {
        throw new Error(
          payload?.message || "구매 처리 중 오류가 발생했습니다."
        );
      }

      // ⭐ 카카오페이면 결제 URL로 리다이렉트
      if (paymentMethod === "KAKAOPAY" && payload.data.kakaoPayUrl) {
        window.location.href = payload.data.kakaoPayUrl;
        return;
      }

      // ⭐ 무통장 입금이면 완료 페이지로
      const { transactionId } = payload.data;
      navigate(`/purchase/complete/${transactionId}`);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "구매 처리 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 계좌번호 복사
  const handleCopyAccount = () => {
    if (!product?.accountNumber) return;
    navigator.clipboard
      .writeText(product.accountNumber)
      .then(() => alert("계좌번호가 복사되었습니다."))
      .catch(() => alert("복사에 실패했습니다."));
  };

  // 로딩 중
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Loading text="구매 정보를 불러오는 중입니다..." />
        </div>
        <Footer />
      </>
    );
  }

  // 상품이나 유저 정보를 못 가져왔을 때
  if (!product || !user) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ErrorMessage
            type="error"
            message={error || "구매 정보를 가져올 수 없습니다."}
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

  // 정상 화면
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
                2
              </div>
              <p className="text-sm font-medium text-primary">구매 정보 입력</p>
            </div>
            <div className="flex-1 h-1 bg-gray-300" />
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold mb-2">
                3
              </div>
              <p className="text-sm text-gray-500">구매 완료</p>
            </div>
          </div>
        </div>
      </div>

      {/* 내용 영역 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          <i className="bi bi-cart-check text-primary mr-2" />
          구매하기
        </h1>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} type="error" />
          </div>
        )}

        {/* 상품 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">상품 정보</h2>
          <div className="flex gap-4">
            <img
              src={product.mainImage || "/no-image.png"}
              alt={product.title}
              className="w-32 h-32 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {product.title}
              </h3>
              <p className="text-gray-600 mb-1">
                <i className="bi bi-person-circle mr-1" />
                판매자: <span>{product.sellerNickname}</span>
              </p>
              <p className="text-gray-600 mb-2">
                <i className="bi bi-geo-alt mr-1" />
                거래지역: <span>{user.address}</span>
              </p>
              <p className="text-3xl font-bold text-primary">
                {product.price.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>

        {/* 구매자 정보 + 메시지 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">구매자 정보</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                구매자명
              </label>
              <input
                type="text"
                value={user.nickname}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="text"
                value={user.phone}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg cursor-not-allowed"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              거래 희망 장소
            </label>
            <input
              type="text"
              value={user.address}
              readOnly
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg mb-2 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500">
              <i className="bi bi-info-circle mr-1" />
              주소 변경은 마이페이지에서 가능합니다.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              판매자에게 메시지 <span className="text-gray-400">(선택)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="예: 오늘 저녁 7시에 ○○역 근처에서 거래 가능할까요?"
            />
          </div>
        </div>

        {/* ⭐ 결제 방법 선택 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">결제 방법</h2>

          {/* 결제 수단 선택 버튼 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* 무통장 입금 */}
            <button
              type="button"
              onClick={() => setPaymentMethod("BANK_TRANSFER")}
              className={`p-6 border-2 rounded-xl transition-all ${
                paymentMethod === "BANK_TRANSFER"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <i
                className={`bi bi-bank text-4xl mb-3 block ${
                  paymentMethod === "BANK_TRANSFER"
                    ? "text-primary"
                    : "text-gray-400"
                }`}
              />
              <div className="font-bold text-lg mb-1">무통장 입금</div>
              <div className="text-sm text-gray-600">수수료 없음</div>
            </button>

            {/* 카카오페이 - 비활성화 */}
            <button
              type="button"
              disabled
              className="p-6 border-2 rounded-xl opacity-50 cursor-not-allowed border-gray-300"
            >
              <i className="bi bi-chat-fill text-4xl mb-3 block text-gray-400" />
              <div className="font-bold text-lg mb-1">카카오페이</div>
              <div className="text-xs text-gray-500">
                가맹점 계약 후 이용 가능
              </div>
            </button>
          </div>

          {/* ⭐ 무통장 입금 정보 */}
          {paymentMethod === "BANK_TRANSFER" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="bi bi-credit-card-2-front text-blue-600" />
                입금 계좌 안내
              </h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <span className="text-gray-600">은행</span>
                  <span className="font-bold text-gray-800">
                    {product.bankName}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <span className="text-gray-600">계좌번호</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">
                      {product.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="text-primary hover:text-secondary transition-colors"
                      title="복사"
                    >
                      <i className="bi bi-clipboard" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <span className="text-gray-600">예금주</span>
                  <span className="font-bold text-gray-800">
                    {product.accountHolder}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <span className="text-gray-600">입금액</span>
                  <span className="font-bold text-primary text-xl">
                    {product.price.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* 입금자명 입력 */}
              <div>
                <label
                  htmlFor="depositorName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  입금자명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="depositorName"
                  value={depositorName}
                  onChange={(e) => setDepositorName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="입금자명을 입력하세요"
                />
                <p className="mt-2 text-sm text-gray-600">
                  <i className="bi bi-exclamation-circle mr-1" />
                  입금자명과 구매자명이 다른 경우 반드시 입력해주세요.
                </p>
              </div>
            </div>
          )}

          {/* ⭐ 카카오페이 안내 */}
          {paymentMethod === "KAKAOPAY" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <i className="bi bi-chat-fill text-yellow-400 text-5xl" />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    카카오페이 간편결제
                  </h3>
                  <p className="text-sm text-gray-600">
                    카카오톡으로 안전하게 결제하세요
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">결제 금액</span>
                  <span className="font-bold text-3xl text-primary">
                    {product.price.toLocaleString()}원
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 text-sm">
                <div className="flex items-start gap-2">
                  <i className="bi bi-info-circle text-blue-600 text-lg mt-0.5" />
                  <div className="text-gray-700">
                    <p className="font-semibold mb-2">카카오페이 결제 안내</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>
                        결제 후 판매자 확인 시 자동으로 거래가 완료됩니다.
                      </li>
                      <li>카카오톡으로 결제 알림이 전송됩니다.</li>
                      <li>결제 취소는 마이페이지에서 가능합니다.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 약관 동의 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="space-y-3">
            <div className="flex items-start">
              <input
                id="agree-all"
                type="checkbox"
                className="h-5 w-5 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary"
                checked={agreeAll}
                onChange={(e) => handleAgreeAllChange(e.target.checked)}
              />
              <label
                htmlFor="agree-all"
                className="ml-3 block text-sm font-bold text-gray-800 cursor-pointer"
              >
                전체 동의
              </label>
            </div>
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex items-start ml-4">
                <input
                  id="agree-purchase"
                  type="checkbox"
                  className="h-4 w-4 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary"
                  checked={agreePurchase}
                  onChange={(e) => setAgreePurchase(e.target.checked)}
                />
                <label
                  htmlFor="agree-purchase"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  구매 조건 확인 및 결제 진행에 동의합니다.{" "}
                  <span className="text-red-500">(필수)</span>
                </label>
              </div>
              <div className="flex items-start ml-4">
                <input
                  id="agree-info"
                  type="checkbox"
                  className="h-4 w-4 mt-0.5 text-primary border-gray-300 rounded focus:ring-primary"
                  checked={agreeInfo}
                  onChange={(e) => setAgreeInfo(e.target.checked)}
                />
                <label
                  htmlFor="agree-info"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  개인정보 제3자 제공에 동의합니다.{" "}
                  <span className="text-red-500">(필수)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex gap-4">
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
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left mr-2" />
              이전으로
            </Button>
          </div>
          <Button
            variant="primary"
            className="w-full py-4 text-lg font-bold"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <i className="bi bi-hourglass-split mr-2 animate-spin" />
                처리 중...
              </>
            ) : paymentMethod === "KAKAOPAY" ? (
              <>
                <i className="bi bi-chat-fill mr-2" />
                카카오페이로 결제하기
              </>
            ) : (
              <>
                <i className="bi bi-check-circle mr-2" />
                구매하기
              </>
            )}
          </Button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PurchasePage;
