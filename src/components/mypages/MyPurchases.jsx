import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import { handleStartChatModal } from "../../utils/handleStartChatModal";
import ChatRoomModal from "../chat/ChatRoomModal";

const MyPurchases = ({
  purchases,
  formatPrice,
  formatDate,
  getStatusBadge,
  getProductImageUrl,
  navigate,
  isAuthenticated,
}) => {
  const NO_IMAGE_PLACEHOLDER = getProductImageUrl("");

  const [chatRoomId, setChatRoomId] = useState(null);
  const [isChatOpen, setChatOpen] = useState(false);

  const openChatModal = (roomId) => {
    setChatRoomId(roomId);
    setChatOpen(true);
  };

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
                      </span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      구매일: {formatDate(transaction.transactionDate)}
                    </p>
                  </div>

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

      {/* 🔥 채팅 모달 */}
      <ChatRoomModal
        isOpen={isChatOpen}
        chatRoomId={chatRoomId}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
};

export default MyPurchases;
