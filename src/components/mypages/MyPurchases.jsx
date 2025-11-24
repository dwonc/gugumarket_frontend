import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button'; // Button 컴포넌트 사용을 위해 import

// 이 코드는 MyPage.jsx에서 사용되던 renderPurchases 함수를 컴포넌트화한 것입니다.
// Props: purchases, formatPrice, formatDate, getStatusBadge, getProductImageUrl
const MyPurchases = ({ purchases, formatPrice, formatDate, getStatusBadge, getProductImageUrl }) => {

    // 이전에 MyPage.jsx에서 정의된 NO_IMAGE_PLACEHOLDER를 사용합니다.
    const NO_IMAGE_PLACEHOLDER = getProductImageUrl('');

    // 모든 버튼의 Link 클릭 방지 핸들러
    const preventLinkDefault = (e) => e.preventDefault();

    return (
        <div id="content-purchases" className="tab-content">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">구매내역</h2>
            <div className="space-y-4">
                {purchases && purchases.length > 0 ? (
                    purchases.map((transaction) => {
                        const badge = getStatusBadge(transaction.status, false);
                        return (
                            // Link로 감싸서 거래 상세 페이지로 이동
                            <Link to={`/transactions/${transaction.transactionId}`} key={transaction.transactionId} className="block">
                                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                                    <div className="flex gap-4 items-center">
                                        {/* 상품 이미지 */}
                                        <img
                                            src={getProductImageUrl(transaction.productImage) || null}
                                            alt={transaction.productTitle}
                                            className="w-32 h-32 object-cover rounded-lg"
                                            onError={(e) => {
                                                if (e.target.dataset.hadError) return;
                                                e.target.dataset.hadError = true;
                                                e.target.src = NO_IMAGE_PLACEHOLDER;
                                            }}
                                        />

                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 mb-2">{transaction.productTitle}</h3>
                                            <p className="text-2xl font-bold text-primary mb-2">
                                                {formatPrice(transaction.productPrice)}원
                                            </p>
                                            <p className="text-gray-600 text-sm mb-1">
                                                판매자: <span className="font-medium">{transaction.sellerName}</span>
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                구매일: {formatDate(transaction.transactionDate)}
                                            </p>
                                        </div>

                                        <div className="flex flex-col justify-between items-end h-full">
                                            {/* 상태 배지 */}
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
                                                {badge.text}
                                            </span>

                                            {/* 상태에 따른 액션 버튼 */}
                                            <div className="mt-3 space-y-2">
                                                {transaction.status === 'COMPLETED' && (
                                                    <button
                                                        className="text-gray-600 hover:text-primary text-sm w-full text-right"
                                                        onClick={preventLinkDefault}
                                                    >
                                                        <i className="bi bi-chat-dots mr-1"></i>문의하기
                                                    </button>
                                                )}
                                                {transaction.status === 'PENDING' && (
                                                    <button
                                                        className="text-blue-600 hover:text-blue-800 text-sm w-full text-right font-medium"
                                                        onClick={preventLinkDefault}
                                                    >
                                                        <i className="bi bi-credit-card mr-1"></i>입금 정보 보기
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
                    /* Empty State */
                    <div className="text-center py-16">
                        <i className="bi bi-bag-x text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">구매내역이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPurchases;