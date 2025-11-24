// src/pages/transaction/TransactionDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";

const TransactionDetailPage = () => {
    // /transactions/:id  → 실제 주소는 /transactions/8 이런 식
    const { id } = useParams();
    const transactionId = Number(id);
    const navigate = useNavigate();

    const [transaction, setTransaction] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [isBuyer, setIsBuyer] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [depositorName, setDepositorName] = useState("");
    const [editingDepositor, setEditingDepositor] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // 거래 상세 불러오기
    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                setLoading(true);
                setError("");

                if (!transactionId || Number.isNaN(transactionId)) {
                    throw new Error("유효하지 않은 거래 번호입니다.");
                }

                const res = await api.get(`/api/transactions/${transactionId}`);
                const payload = res.data;

                // success = false 이거나 transaction이 없으면 에러 처리
                if (!payload || payload.success === false || !payload.transaction) {
                    throw new Error(
                        payload?.message || "유효하지 않은 거래 번호입니다."
                    );
                }

                const tx = payload.transaction;

                setTransaction(tx);
                setIsSeller(payload.isSeller || false);
                setIsBuyer(payload.isBuyer || false);
                setDepositorName(tx.depositorName || "");
            } catch (err) {
                console.error(err);
                if (err.response && err.response.status === 401) {
                    setError("로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
                } else {
                    setError(err.message || "거래 정보를 불러오는 중 오류가 발생했습니다.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [transactionId]);

    const status = transaction?.status; // "PENDING" | "COMPLETED" | "CANCELLED"

    // 입금자명 수정 시작
    const handleStartEditDepositor = () => {
        setEditingDepositor(true);
    };

    // 입금자명 수정 취소
    const handleCancelEditDepositor = () => {
        if (transaction) {
            setDepositorName(transaction.depositorName || "");
        }
        setEditingDepositor(false);
    };

    // 입금자명 저장
    const handleSaveDepositor = async () => {
        const trimmed = depositorName.trim();
        if (!trimmed) {
            alert("입금자명을 입력해주세요.");
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.post(
                `/api/transactions/${transactionId}/depositor`,
                { depositorName: trimmed }
            );

            const payload = res.data;
            if (!payload || payload.success === false) {
                throw new Error(
                    payload?.message || "입금자명 수정 중 오류가 발생했습니다."
                );
            }

            alert("입금자명이 수정되었습니다.");
            setTransaction((prev) =>
                prev ? { ...prev, depositorName: trimmed } : prev
            );
            setEditingDepositor(false);
        } catch (err) {
            console.error(err);
            alert(err.message || "입금자명 수정 중 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    // 거래 완료 (판매자)
    const handleCompleteTransaction = async () => {
        if (
            !window.confirm("거래를 완료 처리하시겠습니까?\n완료 후에는 취소할 수 없습니다.")
        ) {
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.post(
                `/api/transactions/${transactionId}/complete`
            );
            const payload = res.data;

            if (!payload || payload.success === false) {
                throw new Error(
                    payload?.message || "거래 완료 처리 중 오류가 발생했습니다."
                );
            }

            alert("거래가 완료되었습니다.");
            setTransaction((prev) =>
                prev ? { ...prev, status: "COMPLETED" } : prev
            );
        } catch (err) {
            console.error(err);
            alert(err.message || "거래 완료 처리 중 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    // 거래 취소 (구매자)
    const handleCancelTransaction = async () => {
        if (!window.confirm("거래를 취소하시겠습니까?")) {
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.delete(`/api/transactions/${transactionId}`);
            const payload = res.data;

            if (!payload || payload.success === false) {
                throw new Error(
                    payload?.message || "거래 취소 중 오류가 발생했습니다."
                );
            }

            alert("거래가 취소되었습니다.");
            setTransaction((prev) =>
                prev ? { ...prev, status: "CANCELLED" } : prev
            );
        } catch (err) {
            console.error(err);
            alert(err.message || "거래 취소 중 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    // 로딩 중
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Loading text="거래 정보를 불러오는 중입니다..." />
                </div>
                <Footer />
            </>
        );
    }

    // 에러 또는 데이터 없음
    if (!transaction) {
        return (
            <>
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <ErrorMessage
                        type="error"
                        message={error || "거래 정보를 가져올 수 없습니다."}
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
                            onClick={() => navigate(-1)}
                        >
                            <i className="bi bi-arrow-left mr-2" />
                            이전으로
                        </Button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // DTO 기준으로 바로 사용
    const formattedPrice = transaction.productPrice
        ? transaction.productPrice.toLocaleString()
        : "0";

    const formattedTransactionDate = transaction.transactionDate
        ? transaction.transactionDate.replace("T", " ").slice(0, 16)
        : "-";

    return (
        <>
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="text-gray-600 hover:text-primary transition-colors"
                        >
                            <i className="bi bi-arrow-left text-2xl" />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">
                            <i className="bi bi-receipt text-primary mr-2" />
                            거래 상세
                        </h1>
                    </div>

                    {/* 상태 배지 */}
                    <div className="flex items-center gap-3">
                        {status === "PENDING" && (
                            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                <i className="bi bi-clock-history mr-1" />
                거래 진행중
              </span>
                        )}
                        {status === "COMPLETED" && (
                            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-bold">
                <i className="bi bi-check-circle-fill mr-1" />
                거래 완료
              </span>
                        )}
                        {status === "CANCELLED" && (
                            <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full font-bold">
                <i className="bi bi-x-circle-fill mr-1" />
                거래 취소
              </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 왼쪽 영역: 상품/거래/당사자 정보 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 상품 정보 */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <i className="bi bi-box-seam text-primary mr-2" />
                                상품 정보
                            </h2>

                            <div className="flex gap-4">
                                {/* 상품 이미지 */}
                                <div className="flex-shrink-0">
                                    {transaction.productImage ? (
                                        <img
                                            src={transaction.productImage}
                                            alt={transaction.productTitle}
                                            className="w-32 h-32 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <i className="bi bi-image text-gray-400 text-4xl" />
                                        </div>
                                    )}
                                </div>

                                {/* 상품 상세 */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                        {transaction.productTitle}
                                    </h3>
                                    <p className="text-2xl font-bold text-primary mb-2">
                                        {formattedPrice}원
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(`/products/${transaction.productId}`)
                                        }
                                        className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center"
                                    >
                                        <i className="bi bi-box-arrow-up-right mr-1" />
                                        상품 페이지 보기
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 거래 정보 */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <i className="bi bi-info-circle text-primary mr-2" />
                                거래 정보
                            </h2>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-gray-600">거래 번호</span>
                                    <span className="font-mono text-sm">
                    {transaction.transactionId}
                  </span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-gray-600">거래 일시</span>
                                    <span>{formattedTransactionDate}</span>
                                </div>

                                {/* 입금자명 */}
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-gray-600">입금자명</span>
                                    <div className="flex items-center gap-2">
                                        {!editingDepositor && (
                                            <>
                        <span className="font-semibold">
                          {transaction.depositorName || "미입력"}
                        </span>
                                                {isBuyer && status === "PENDING" && (
                                                    <button
                                                        type="button"
                                                        onClick={handleStartEditDepositor}
                                                        className="text-blue-600 hover:text-blue-700 text-sm"
                                                    >
                                                        <i className="bi bi-pencil" />
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {editingDepositor && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={depositorName}
                                                    onChange={(e) => setDepositorName(e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="입금자명 입력"
                                                />
                                                <Button
                                                    variant="primary"
                                                    className="px-3 py-2 text-sm"
                                                    onClick={handleSaveDepositor}
                                                    disabled={submitting}
                                                >
                                                    저장
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    className="px-3 py-2 text-sm"
                                                    onClick={handleCancelEditDepositor}
                                                    disabled={submitting}
                                                >
                                                    취소
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 거래 상태 텍스트 */}
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">거래 상태</span>
                                    {status === "PENDING" && (
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                      진행중
                    </span>
                                    )}
                                    {status === "COMPLETED" && (
                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                      완료
                    </span>
                                    )}
                                    {status === "CANCELLED" && (
                                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                      취소
                    </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 거래 당사자 정보 */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <i className="bi bi-people text-primary mr-2" />
                                거래 당사자
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* 판매자 */}
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">판매자</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                                            <i className="bi bi-person-fill text-blue-600 text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">
                                                {transaction.sellerName || "판매자"}
                                            </p>
                                            {isSeller && (
                                                <p className="text-sm text-gray-600">
                                                    <i className="bi bi-check-circle-fill text-blue-600 mr-1" />
                                                    나
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 구매자 */}
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">구매자</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                                            <i className="bi bi-person-fill text-green-600 text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">
                                                {transaction.buyerName || "구매자"}
                                            </p>
                                            {isBuyer && (
                                                <p className="text-sm text-gray-600">
                                                    <i className="bi bi-check-circle-fill text-green-600 mr-1" />
                                                    나
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽 영역: 결제/계좌/버튼들 */}
                    <div className="space-y-6">
                        {/* 결제 정보 */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">결제 정보</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">상품 금액</span>
                                    <span className="font-semibold">{formattedPrice}원</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">
                    총 금액
                  </span>
                                    <span className="text-2xl font-bold text-primary">
                    {formattedPrice}원
                  </span>
                                </div>
                            </div>
                        </div>

                        {/* 무통장입금 정보 */}
                        {transaction.bankName && (
                            <div className="bg-amber-50 rounded-xl shadow-md p-6 border-2 border-amber-200">
                                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                                    <i className="bi bi-credit-card text-amber-600 mr-2" />
                                    입금 계좌
                                </h2>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">은행</span>
                                        <span className="font-semibold">{transaction.bankName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">계좌번호</span>
                                        <span className="font-mono text-sm font-semibold">
                      {transaction.accountNumber}
                    </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">예금주</span>
                                        <span className="font-semibold">
                      {transaction.accountHolder}
                    </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 액션 버튼들 */}
                        <div className="space-y-3">
                            {isSeller && status === "PENDING" && (
                                <Button
                                    variant="primary"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold"
                                    onClick={handleCompleteTransaction}
                                    disabled={submitting}
                                >
                                    <i className="bi bi-check-circle-fill mr-2" />
                                    거래 완료 처리
                                </Button>
                            )}

                            {isBuyer && status === "PENDING" && (
                                <Button
                                    variant="primary"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold"
                                    onClick={handleCancelTransaction}
                                    disabled={submitting}
                                >
                                    <i className="bi bi-x-circle-fill mr-2" />
                                    거래 취소
                                </Button>
                            )}

                            <Button
                                variant="secondary"
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-bold"
                                onClick={() => navigate("/mypage")}
                            >
                                <i className="bi bi-list mr-2" />
                                목록으로
                            </Button>
                        </div>

                        {/* 안내 메시지 */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-gray-700">
                                <i className="bi bi-info-circle text-blue-600 mr-1" />
                                {isSeller && "입금 확인 후 거래 완료 버튼을 눌러주세요."}
                                {isBuyer &&
                                    !isSeller &&
                                    "입금 후 입금자명을 정확히 입력해주세요."}
                                {!isSeller &&
                                    !isBuyer &&
                                    "거래 당사자만 상세 조작이 가능합니다."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default TransactionDetailPage;
