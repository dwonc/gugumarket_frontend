import React from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import { handleStartChatModal } from "../../utils/handleStartChatModal";
import ChatRoomModal from "../chat/ChatRoomModal"; // 채팅 모달 컴포넌트
import { useState } from "react";

// 이 코드는 MyPage.jsx에서 사용되던 renderSales 함수를 컴포넌트화한 것입니다.
// Props: sales, products, apiUser, formatPrice, formatDate, getStatusBadge, getProductImageUrl, confirmPayment, navigate
const MySales = ({
                     sales,
                     products,
                     apiUser,
                     formatPrice,
                     formatDate,
                     getStatusBadge,
                     getProductImageUrl,
                     confirmPayment,
                     navigate,
                     isAuthenticated, // 사용자 인증 상태
                 }) => {
    const NO_IMAGE_PLACEHOLDER = getProductImageUrl("");

    // 채팅 모달 관련 상태 관리
    const [chatRoomId, setChatRoomId] = useState(null); // 현재 열린 채팅방 ID
    const [isChatOpen, setChatOpen] = useState(false); // 채팅 모달 열림/닫힘 상태

    // 채팅 모달을 여는 함수
    const openChatModal = (roomId) => {
        setChatRoomId(roomId); // 채팅방 ID 설정
        setChatOpen(true); // 모달 열기
    };

    // 1. 거래가 진행 중이거나 완료된 상품 (Transaction) 목록에서 Product ID를 추출
    //map = 배열의 각 요소를 변환해서 새 배열 만들기
    const transactionProductIds = new Set((sales || []).map((t) => t.productId));

    // 2. 등록된 모든 상품 (products) 목록에서 거래 목록에 없는 상품만 필터링 (판매 중인 상품)
    const sellingProducts = (products || []).filter(
        (p) => !transactionProductIds.has(p.productId)
    );

    // 3. 거래 목록(sales)과 판매 중인 상품 목록(sellingProducts)을 결합
    const mappedSellingItems = sellingProducts.map((p) => ({
        // 거래 정보 필드는 null/임시 값으로 설정 (TransactionResponseDto와 유사한 구조)
        transactionId: null,
        status: "SELLING", // '판매 중' 상태
        buyerName: "판매 중",
        depositorName: null,
        transactionDate: null, // 거래일은 null
        buyerId: null,
        createdDate: p.createdDate, // 등록일 사용

        // 상품 정보 필드
        productId: p.productId,
        productTitle: p.title,
        productPrice: p.price,
        productImage: p.mainImage,
        sellerName: apiUser.nickname,
        product: p,
    }));

    // 최종 목록 합치기
    const finalSalesList = [...(sales || []), ...mappedSellingItems];

    // 최신순 정렬 (거래일/등록일 기준)
    finalSalesList.sort((a, b) => {
        // 정렬 기준 선택: 두 항목(a, b)을 비교할 때, **transactionDate (거래일)**이 있으면 그것을 사용하고,
        // 없으면 **createdDate (등록일)**을 사용하도록 || 연산자를 이용해 우선순위를 정한다.
        const dateA = new Date(a.transactionDate || a.createdDate);
        const dateB = new Date(b.transactionDate || b.createdDate);

        // 유효하지 않은 날짜 처리
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;

        // 최신순 정렬 (내림차순)
        return dateB.getTime() - dateA.getTime();
    });

    return (
        <div id="content-sales" className="tab-content">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">판매내역</h2>
            <div className="space-y-4">
                {finalSalesList && finalSalesList.length > 0 ? (
                    finalSalesList.map((item) => {
                        // 거래 여부 확인 (transactionId가 있으면 거래 완료/진행 중)
                        const isTransaction = !!item.transactionId;
                        // 현재 상태 결정 (거래면 실제 상태, 아니면 'SELLING')
                        const currentStatus = isTransaction ? item.status : "SELLING";
                        // 상태에 따른 배지 정보 가져오기
                        const badge = getStatusBadge(currentStatus, true);

                        // 표시할 정보 설정
                        const displayTitle = item.productTitle;
                        const displayPrice = item.productPrice;
                        const displayImage = item.productImage;
                        const buyerOrStatusText = isTransaction ? "구매자" : "상태";
                        const displayBuyerName = item.buyerName;
                        const dateLabel = isTransaction ? "판매일" : "등록일";
                        const displayDate = formatDate(
                            item.transactionDate || item.createdDate
                        );

                        // 링크 URL 결정 (거래 상세 페이지 또는 상품 상세 페이지)
                        let linkTo;
                        if (isTransaction) {
                            linkTo = `/transactions/${item.transactionId}`;
                        } else {
                            linkTo = `/products/${item.productId}`;
                        }

                        return (
                            <Link
                                to={linkTo}
                                key={
                                    isTransaction
                                        ? `t-${item.transactionId}`
                                        : `p-${item.productId}`
                                }
                                className="block"
                            >
                                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                                    <div className="flex gap-4 items-center">
                                        {/* 상품 이미지 */}
                                        <img
                                            src={getProductImageUrl(displayImage) || null}
                                            alt={displayTitle}
                                            className="w-32 h-32 object-cover rounded-lg"
                                            onError={(e) => {
                                                // 무한 루프 방지를 위해 이미 에러 처리된 적 있는지 확인
                                                if (e.target.dataset.hadError) return;
                                                e.target.dataset.hadError = true;
                                                e.target.src = NO_IMAGE_PLACEHOLDER;
                                            }}
                                        />

                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                                {displayTitle}
                                            </h3>
                                            <p className="text-2xl font-bold text-primary mb-2">
                                                {formatPrice(displayPrice)}원
                                            </p>
                                            <p className="text-gray-600 text-sm mb-1">
                                                {buyerOrStatusText}:
                                                <span className="font-medium">{displayBuyerName}</span>
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                {dateLabel}: {displayDate}
                                            </p>
                                        </div>

                                        <div className="flex flex-col justify-between items-end h-full">
                                            {/* 상태 배지 */}
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}
                                            >
                        {badge.text}
                      </span>

                                            {/* 상태에 따른 액션 버튼 */}
                                            <div className="mt-3 space-y-2">
                                                {/* 수정 버튼 (판매 중인 상품) */}
                                                {!isTransaction && (
                                                    <Button
                                                        onClick={(e) => {
                                                            e.preventDefault(); // Link 이동 방지
                                                            navigate(`/products/${item.productId}/edit`);
                                                        }}
                                                        variant="secondary"
                                                        size="sm"
                                                        className="w-full text-right"
                                                    >
                                                        <i className="bi bi-pencil-fill mr-1"></i>수정하기
                                                    </Button>
                                                )}

                                                {/* 입금 확인 버튼 (거래 진행 중) */}
                                                {isTransaction && currentStatus === "PENDING" && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault(); // Link 이동 방지
                                                            confirmPayment(item.transactionId); // 입금 확인 처리
                                                        }}
                                                        className="bg-primary hover:bg-secondary text-white text-sm px-4 py-2 rounded-lg w-full font-medium transition-all"
                                                    >
                                                        <i className="bi bi-check-circle mr-1"></i>입금
                                                        확인하기
                                                    </button>
                                                )}

                                                {/* 문의하기 버튼 (판매 완료) */}
                                                {isTransaction && currentStatus === "COMPLETED" && (
                                                    <button
                                                        className="text-gray-600 hover:text-primary text-sm w-full text-right"
                                                        onClick={(e) => {
                                                            e.preventDefault(); // Link 이동 방지

                                                            // 구매자 ID를 여러 경로에서 찾기 (데이터 구조가 다를 수 있음)
                                                            const otherUserId =
                                                                item.buyerId ??
                                                                item.buyerUserId ??
                                                                item.buyer?.userId ??
                                                                null;

                                                            // 디버깅용 로그
                                                            console.log("판매내역 문의하기", {
                                                                productId: item.productId,
                                                                otherUserId,
                                                                item,
                                                            });

                                                            // 채팅 모달 시작 함수 호출
                                                            handleStartChatModal(
                                                                item.productId, // 상품 ID
                                                                isAuthenticated, // 로그인 여부
                                                                openChatModal, // 모달 열기 콜백
                                                                navigate, // 로그인 필요 시 사용
                                                                otherUserId // 구매자 ID (채팅 상대방)
                                                            );
                                                        }}
                                                    >
                                                        <i className="bi bi-chat-dots mr-1"></i>문의하기
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    /* Empty State: 등록된 상품이 없을 때 */
                    <div className="text-center py-16">
                        <i className="bi bi-receipt text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">등록된 상품이 없습니다.</p>
                        <Button
                            onClick={() => navigate("/products/write")}
                            variant="primary"
                            size="md"
                            className="mt-4"
                        >
                            상품 등록하기
                        </Button>
                    </div>
                )}
            </div>
            {/* 채팅 모달: 문의하기 버튼 클릭 시 열림 */}
            <ChatRoomModal
                isOpen={isChatOpen} // 모달 열림 상태
                chatRoomId={chatRoomId} // 현재 채팅방 ID
                onClose={() => setChatOpen(false)} // 모달 닫기 함수
            />
        </div>
    );
};

export default MySales;