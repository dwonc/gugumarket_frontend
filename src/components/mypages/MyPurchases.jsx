import React, { useState } from "react";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import Button from "../common/Button";
import { handleStartChatModal } from "../../utils/handleStartChatModal";
import ChatRoomModal from "../chat/ChatRoomModal";
=======
import Button from "../common/Button"; // Button 컴포넌트 사용을 위해 import
import { handleStartChatModal } from "../../utils/handleStartChatModal";
import ChatRoomModal from "../chat/ChatRoomModal"; // 채팅 모달 컴포넌트
>>>>>>> origin/의진4

// 이 코드는 MyPage.jsx에서 사용되던 renderPurchases 함수를 컴포넌트화한 것입니다.
// Props: purchases, formatPrice, formatDate, getStatusBadge, getProductImageUrl, navigate, isAuthenticated
const MyPurchases = ({
<<<<<<< HEAD
  purchases,
  formatPrice,
  formatDate,
  getStatusBadge,
  getProductImageUrl,
  navigate,
  isAuthenticated,
}) => {
  const NO_IMAGE_PLACEHOLDER = getProductImageUrl("");
=======
                         purchases,
                         formatPrice,
                         formatDate,
                         getStatusBadge, // 거래 상태에 따른 배지 정보 반환 함수
                         getProductImageUrl, // 상품 이미지 URL 생성 함수
                         navigate, // 페이지 이동을 위한 함수 (주로 react-router-dom의 useNavigate에서 옴)
                         isAuthenticated, // 사용자 인증 상태 (채팅 시작 시 필요)
                     }) => {
    // MyPage에서 정의된 NO_IMAGE_PLACEHOLDER(기본 이미지)를 사용합니다.
    const NO_IMAGE_PLACEHOLDER = getProductImageUrl("");
>>>>>>> origin/의진4

    // 채팅 모달 관련 상태 관리
    const [chatRoomId, setChatRoomId] = useState(null); // 현재 열린 채팅방 ID
    const [isChatOpen, setChatOpen] = useState(false); // 채팅 모달 열림/닫힘 상태

    // 채팅 모달을 여는 함수
    const openChatModal = (roomId) => {
        setChatRoomId(roomId); // 채팅방 ID 설정
        setChatOpen(true); // 모달 열기
    };

<<<<<<< HEAD
  return (
    <div id="content-purchases" className="tab-content">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">구매내역</h2>
      <div className="space-y-4">
        {purchases && purchases.length > 0 ? (
          purchases.map((transaction) => {
            const badge = getStatusBadge(transaction.status, false);
            return (
              <div
                key={transaction.transactionId}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={getProductImageUrl(transaction.productImage) || null}
                    alt={transaction.productTitle}
                    className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                    onClick={() =>
                      navigate(`/transactions/${transaction.transactionId}`)
                    }
                    onError={(e) => {
                      if (e.target.dataset.hadError) return;
                      e.target.dataset.hadError = true;
                      e.target.src = NO_IMAGE_PLACEHOLDER;
                    }}
                  />

                  <div className="flex-1">
                    <h3
                      className="text-lg font-bold text-gray-800 mb-2 cursor-pointer hover:text-primary"
                      onClick={() =>
                        navigate(`/transactions/${transaction.transactionId}`)
                      }
                    >
                      {transaction.productTitle}
                    </h3>
                    <p className="text-2xl font-bold text-primary mb-2">
                      {formatPrice(transaction.productPrice)}원
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      판매자:{" "}
                      <span className="font-medium">
                        {transaction.sellerName}
=======
    // 모든 버튼의 Link 클릭 방지 핸들러
    // 버튼 클릭 시 상위 Link 컴포넌트의 기본 페이지 이동 동작을 막기 위함 (이벤트 버블링 차단)
    const preventLinkDefault = (e) => e.preventDefault();

    return (
        <div id="content-purchases" className="tab-content">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">구매내역</h2>
            <div className="space-y-4">
                {/* 구매 내역 목록이 있는지 확인 후 렌더링 */}
                {purchases && purchases.length > 0 ? (
                    purchases.map((transaction) => {
                        // 거래 상태에 따른 배지 정보 (텍스트, 스타일) 가져오기
                        const badge = getStatusBadge(transaction.status, false);
                        return (
                            // Link로 감싸서 거래 상세 페이지로 이동
                            <Link
                                to={`/transactions/${transaction.transactionId}`}
                                key={transaction.transactionId}
                                className="block"
                            >
                                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                                    <div className="flex gap-4 items-center">
                                        {/* 상품 이미지 */}
                                        <img
                                            src={getProductImageUrl(transaction.productImage) || null}
                                            alt={transaction.productTitle}
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
                                                {transaction.productTitle}
                                            </h3>
                                            <p className="text-2xl font-bold text-primary mb-2">
                                                {formatPrice(transaction.productPrice)}원
                                            </p>
                                            <p className="text-gray-600 text-sm mb-1">
                                                판매자:{" "}
                                                <span className="font-medium">
                          {transaction.sellerName}
                        </span>
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                구매일: {formatDate(transaction.transactionDate)}
                                            </p>
                                        </div>

                                        <div className="flex flex-col justify-between items-end h-full">
                                            {/* 상태 배지 */}
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}
                                            >
                        {badge.text}
>>>>>>> origin/의진4
                      </span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      구매일: {formatDate(transaction.transactionDate)}
                    </p>
                  </div>

<<<<<<< HEAD
                  <div className="flex flex-col justify-between items-end h-full">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}
                    >
                      {badge.text}
                    </span>

                    <div className="mt-3 space-y-2">
                      {/* ✅ 거래 완료 시 - 문의하기 */}
                      {transaction.status === "COMPLETED" && (
                        <button
                          className="text-gray-600 hover:text-primary text-sm w-full text-right"
                          onClick={() => {
                            handleStartChatModal(
                              transaction.productId,
                              isAuthenticated,
                              openChatModal,
                              navigate
                            );
                          }}
                        >
                          <i className="bi bi-chat-dots mr-1"></i>문의하기
                        </button>
                      )}

                      {/* ✅ 거래 진행 중 - 입금 정보 보기 */}
                      {transaction.status === "PENDING" && (
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm w-full text-right font-medium"
                          onClick={() =>
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
          <div className="text-center py-16">
            <i className="bi bi-bag-x text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-lg">구매내역이 없습니다.</p>
          </div>
        )}
      </div>
=======
                                            {/* 상태에 따른 액션 버튼 */}
                                            <div className="mt-3 space-y-2">
                                                {/* 거래 완료 상태일 때: 문의하기 버튼 표시 */}
                                                {transaction.status === "COMPLETED" && (
                                                    <button
                                                        className="text-gray-600 hover:text-primary text-sm w-full text-right"
                                                        onClick={(e) => {
                                                            e.preventDefault(); // Link 이동 막기
                                                            // 채팅 모달 시작 함수 호출
                                                            handleStartChatModal(
                                                                transaction.productId, // 상품 ID
                                                                isAuthenticated, // 로그인 여부
                                                                openChatModal, // 모달 열기 콜백
                                                                navigate // 로그인 필요 시 사용
                                                            );
                                                        }}
                                                    >
                                                        <i className="bi bi-chat-dots mr-1"></i>문의하기
                                                    </button>
                                                )}

                                                {/* 입금 대기 상태일 때: 입금 정보 보기 버튼 표시 */}
                                                {transaction.status === "PENDING" && (
                                                    <button
                                                        className="text-blue-600 hover:text-blue-800 text-sm w-full text-right font-medium"
                                                        onClick={preventLinkDefault}
                                                    >
                                                        <i className="bi bi-credit-card mr-1"></i>
                                                        입금 정보 보기
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
                    /* Empty State: 구매내역이 없을 때 표시됨 */
                    <div className="text-center py-16">
                        <i className="bi bi-bag-x text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">구매내역이 없습니다.</p>
                    </div>
                )}
            </div>
>>>>>>> origin/의진4

            {/* 채팅 모달: 문의하기 버튼 클릭 시 열림 */}
            <ChatRoomModal
                isOpen={isChatOpen} // 모달 열림 상태
                chatRoomId={chatRoomId} // 현재 채팅방 ID
                onClose={() => setChatOpen(false)} // 모달 닫기 함수
            />
        </div>
    );
};

export default MyPurchases;