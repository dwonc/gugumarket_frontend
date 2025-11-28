import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import { handleStartChatModal } from "../../utils/handleStartChatModal";
import ChatRoomModal from "../chat/ChatRoomModal";

/**
 * 마이페이지 - 구매 내역 컴포넌트
 *
 * 역할: 사용자가 구매한 상품들의 거래 내역을 리스트 형태로 표시
 * 거래 상태에 따라 다른 액션 버튼 제공 (입금 정보 보기, 문의하기 등)
 *
 * @param {Array} purchases - 구매 내역 배열 (Transaction 객체 리스트)
 * @param {Function} formatPrice - 가격 포맷팅 함수
 * @param {Function} formatDate - 날짜 포맷팅 함수
 * @param {Function} getStatusBadge - 거래 상태 배지 정보 반환 함수
 * @param {Function} getProductImageUrl - 이미지 URL 생성 함수
 * @param {Function} navigate - 페이지 이동 함수
 * @param {boolean} isAuthenticated - 사용자 로그인 여부
 */
const MyPurchases = ({
                         purchases, // 구매 내역 배열
                         formatPrice, // 가격 포맷팅 함수
                         formatDate, // 날짜 포맷팅 함수
                         getStatusBadge, // 거래 상태 배지 정보 반환 함수
                         getProductImageUrl, // 이미지 URL 생성 함수
                         navigate, // 페이지 이동 함수
                         isAuthenticated, // 로그인 여부
                     }) => {
    // 이미지가 없을 때 표시할 플레이스홀더 이미지 URL
    const NO_IMAGE_PLACEHOLDER = getProductImageUrl("");

    // ========== 채팅 모달 상태 관리 ==========
    const [chatRoomId, setChatRoomId] = useState(null); // 현재 열린 채팅방 ID
    const [isChatOpen, setChatOpen] = useState(false); // 채팅 모달 열림/닫힘 상태

    /**
     * 채팅 모달을 여는 함수
     * @param {number} roomId - 열려는 채팅방 ID
     */
    const openChatModal = (roomId) => {
        setChatRoomId(roomId); // 채팅방 ID 설정
        setChatOpen(true); // 모달 열기
    };

    return (
        <div id="content-purchases" className="tab-content">
            {/* 섹션 제목 */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">구매내역</h2>

            {/* 구매 내역 리스트 (세로 스택 레이아웃) */}
            <div className="space-y-4">
                {purchases && purchases.length > 0 ? (
                    // 구매 내역이 있을 때: 각 거래를 카드로 표시
                    purchases.map((transaction) => {
                        // 거래 상태에 따른 배지 정보 가져오기 (색상, 텍스트)
                        const badge = getStatusBadge(transaction.status, false);

                        return (
                            <div
                                key={transaction.transactionId} // 각 거래의 고유 키
                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
                            >
                                {/* ========== 거래 정보 레이아웃 ========== */}
                                <div className="flex gap-4 items-center">
                                    {/* 상품 이미지 (클릭 시 거래 상세 페이지로 이동) */}
                                    <img
                                        src={getProductImageUrl(transaction.productImage) || null}
                                        alt={transaction.productTitle}
                                        className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                                        onClick={() =>
                                            navigate(`/transactions/${transaction.transactionId}`)
                                        }
                                        onError={(e) => {
                                            // 이미지 로딩 실패 시 플레이스홀더로 대체
                                            if (e.target.dataset.hadError) return;
                                            e.target.dataset.hadError = true;
                                            e.target.src = NO_IMAGE_PLACEHOLDER;
                                        }}
                                    />

                                    {/* ========== 상품 정보 영역 ========== */}
                                    <div className="flex-1">
                                        {/* 상품 제목 (클릭 시 거래 상세 페이지로 이동) */}
                                        <h3
                                            className="text-lg font-bold text-gray-800 mb-2 cursor-pointer hover:text-primary"
                                            onClick={() =>
                                                navigate(`/transactions/${transaction.transactionId}`)
                                            }
                                        >
                                            {transaction.productTitle}
                                        </h3>

                                        {/* 상품 가격 */}
                                        <p className="text-2xl font-bold text-primary mb-2">
                                            {formatPrice(transaction.productPrice)}원
                                        </p>

                                        {/* 판매자 정보 */}
                                        <p className="text-gray-600 text-sm mb-1">
                                            판매자:{" "}
                                            <span className="font-medium">
                        {transaction.sellerName}
                      </span>
                                        </p>

                                        {/* 구매일 */}
                                        <p className="text-gray-500 text-sm">
                                            구매일: {formatDate(transaction.transactionDate)}
                                        </p>
                                    </div>

                                    {/* ========== 우측 액션 영역 ========== */}
                                    <div className="flex flex-col justify-between items-end h-full">
                                        {/* 거래 상태 배지 (대기중, 입금완료, 거래완료 등) */}
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}
                                        >
                      {badge.text}
                    </span>

                                        {/* 거래 상태별 액션 버튼 */}
                                        <div className="mt-3 space-y-2">
                                            {/* ✅ 거래 완료 상태 - 판매자에게 문의하기 버튼 */}
                                            {transaction.status === "COMPLETED" && (
                                                <button
                                                    className="text-gray-600 hover:text-primary text-sm w-full text-right"
                                                    onClick={() => {
                                                        // 채팅방 열기 또는 생성 (유틸 함수 호출)
                                                        handleStartChatModal(
                                                            transaction.productId, // 상품 ID
                                                            isAuthenticated, // 로그인 여부
                                                            openChatModal, // 채팅 모달 열기 함수
                                                            navigate // 페이지 이동 함수
                                                        );
                                                    }}
                                                >
                                                    <i className="bi bi-chat-dots mr-1"></i>문의하기
                                                </button>
                                            )}

                                            {/* ✅ 거래 대기 상태 - 입금 정보 확인 버튼 */}
                                            {transaction.status === "PENDING" && (
                                                <button
                                                    className="text-blue-600 hover:text-blue-800 text-sm w-full text-right font-medium"
                                                    onClick={() =>
                                                        // 거래 상세 페이지로 이동 (입금 정보 확인)
                                                        navigate(
                                                            `/transactions/${transaction.transactionId}`
                                                        )
                                                    }
                                                >
                                                    <i className="bi bi-credit-card mr-1"></i>
                                                    입금 정보 보기
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    /* ========== Empty State (구매 내역이 없을 때) ========== */
                    <div className="text-center py-16">
                        {/* 빈 가방 아이콘 */}
                        <i className="bi bi-bag-x text-6xl text-gray-300 mb-4"></i>
                        {/* 안내 메시지 */}
                        <p className="text-gray-500 text-lg">구매내역이 없습니다.</p>
                    </div>
                )}
            </div>

            {/* ========== 채팅 모달 ========== */}
            {/* 문의하기 버튼 클릭 시 열리는 채팅 모달 */}
            <ChatRoomModal
                isOpen={isChatOpen} // 모달 열림/닫힘 상태
                chatRoomId={chatRoomId} // 채팅방 ID
                onClose={() => setChatOpen(false)} // 모달 닫기 함수
            />
        </div>
    );
};

export default MyPurchases;