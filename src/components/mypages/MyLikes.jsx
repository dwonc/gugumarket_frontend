import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

// 이 코드는 MyPage.jsx에서 사용되던 renderLikes 함수를 컴포넌트화한 것입니다.
// Props: likes, formatPrice, getProductImageUrl, handleUnlike, navigate
const MyLikes = ({ likes, formatPrice, getProductImageUrl, handleUnlike, navigate }) => {

    const NO_IMAGE_PLACEHOLDER = getProductImageUrl('');

    return (
        <div id="content-likes" className="tab-content">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">찜한 목록</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {likes && likes.length > 0 ? (
                    likes.map((like) => (
                        <div key={like.likeId} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                            <div className="relative">
                                <Link to={`/products/${like.productId}`}>
                                    {/* 상품 이미지 */}
                                    <img
                                        src={getProductImageUrl(like.productImage) || null}
                                        alt={like.productTitle}
                                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                            if (e.target.dataset.hadError) return;
                                            e.target.dataset.hadError = true;
                                            e.target.src = NO_IMAGE_PLACEHOLDER;
                                        }}
                                    />
                                </Link>
                                {/* 찜 해제 버튼 */}
                                <button
                                    type="button"
                                    onClick={() => handleUnlike(like.productId)}
                                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white toggle-like-btn"
                                >
                                    <i className="bi bi-heart-fill text-red-500 text-xl"></i>
                                </button>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{like.productTitle}</h3>
                                <p className="text-xl font-bold text-primary mb-2">
                                    {formatPrice(like.productPrice)}원
                                </p>
                                <p className="text-sm text-gray-500">
                                    <i className="bi bi-geo-alt"></i>
                                    <span className="ml-1">위치 정보 없음</span>
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    /* Empty State */
                    <div className="col-span-4 text-center py-16">
                        <i className="bi bi-heart text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">찜한 상품이 없습니다.</p>
                        <Button onClick={() => navigate('/')} variant="primary" size="md" className="mt-4">
                            상품 둘러보기
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyLikes;