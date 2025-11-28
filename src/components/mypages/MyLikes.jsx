import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

<<<<<<< HEAD
//
//
// 역할: 마이페이지에서 사용자가 찜한 상품 목록을 보여주는 컴포넌트
// 원래 MyPage.jsx에 있던 renderLikes 함수를 독립적인 컴포넌트로 분리한 것

const MyLikes = ({
  likes, // likes: 찜한 상품 목록 배열
  formatPrice, // formatPrice: 가격 포맷팅 함수
  getProductImageUrl, // getProductImageUrl: 이미지 URL 생성 함수
  handleUnlike, // handleUnlike: 찜 해제 함수
  navigate, // navigate: 페이지 이동 함수
}) => {
  const NO_IMAGE_PLACEHOLDER = getProductImageUrl(""); // 이미지가 없을 때 표시할 플레이스홀더 이미지 URL

  // ✅ 상태별 배지 반환 함수
  const getStatusBadge = (status) => {
    switch (status) {
      case "RESERVED": // 예약중 상태
        return (
          <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-md">
            예약중
          </span>
        );
      case "SALE": // 판매중 상태
        return (
          <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-md">
            판매중
          </span>
        );
      // SOLD_OUT은 오버레이로 표시하므로 여기서는 배지 없음
      default:
        return null;
    }
  };
=======
// 사용자가 찜한 상품 목록을 보여주는 컴포넌트
// Props로 찜 목록 데이터, 가격 포맷 함수, 이미지 URL 생성 함수, 찜 해제 함수, 페이지 이동 함수를 받음 mypage 에서 이 5개를 받아서 사용한다는 것
const MyLikes = ({ likes, formatPrice, getProductImageUrl, handleUnlike, navigate }) => {

    // 이미지가 없을 때 보여줄 기본 이미지
    const NO_IMAGE_PLACEHOLDER = getProductImageUrl('');
>>>>>>> origin/의진4

    return (
        <div id="content-likes" className="tab-content">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">찜한 목록</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 찜 목록이 있는지 확인 */}
                {likes && likes.length > 0 ? (
                    // 찜 목록을 순회하며 각 상품 카드 생성
                    likes.map((like) => (
                        <div key={like.likeId} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                            <div className="relative">
                                {/* 상품 상세 페이지로 이동하는 링크 */}
                                <Link to={`/products/${like.productId}`}>
                                    {/* 상품 이미지 표시 */}
                                    <img
                                        src={getProductImageUrl(like.productImage) || null}
                                        alt={like.productTitle}
                                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                        // 이미지 로드 실패 시 기본 이미지로 대체
                                        onError={(e) => {
                                            // 중복 에러 방지 (무한 루프 방지)
                                            if (e.target.dataset.hadError) return;
                                            e.target.dataset.hadError = true;
                                            e.target.src = NO_IMAGE_PLACEHOLDER;
                                        }}
                                    />
                                </Link>
                                {/* 찜 해제 버튼 - 클릭하면 찜 목록에서 제거 */}
                                <button
                                    type="button"
                                    onClick={() => handleUnlike(like.productId)}
                                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white toggle-like-btn"
                                >
                                    <i className="bi bi-heart-fill text-red-500 text-xl"></i>
                                </button>
                            </div>
                            <div className="p-4">
                                {/* 상품 제목 */}
                                <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{like.productTitle}</h3>
                                {/* 상품 가격 - formatPrice 함수로 포맷팅 */}
                                <p className="text-xl font-bold text-primary mb-2">
                                    {formatPrice(like.productPrice)}원
                                </p>
                                {/* 위치 정보 (현재는 고정값) */}
                                <p className="text-sm text-gray-500">
                                    <i className="bi bi-geo-alt"></i>
                                    <span className="ml-1">위치 정보 없음</span>
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    /* 찜한 상품이 없을 때 보여주는 화면 */
                    <div className="col-span-4 text-center py-16">
                        <i className="bi bi-heart text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">찜한 상품이 없습니다.</p>
                        {/* 메인 페이지로 이동하는 버튼 */}
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