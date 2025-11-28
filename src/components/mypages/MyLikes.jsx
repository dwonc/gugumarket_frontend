import React from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";

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

  return (
    <div id="content-likes" className="tab-content">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">찜한 목록</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {likes && likes.length > 0 ? (
          likes.map((like) => (
            <div
              key={like.likeId}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* 이미지 영역 */}
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

                {/* ✅ 판매완료 오버레이 */}
                {like.productStatus === "SOLD_OUT" && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-white text-3xl font-bold mb-1">
                        SOLD OUT
                      </div>
                      <div className="text-white/80 text-sm font-medium">
                        판매완료
                      </div>
                    </div>
                  </div>
                )}

                {/* 찜 해제 버튼 */}
                <button
                  type="button"
                  onClick={() => handleUnlike(like.productId)}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white toggle-like-btn"
                >
                  <i className="bi bi-heart-fill text-red-500 text-xl"></i>
                </button>
              </div>

              {/* 정보 영역 */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">
                  {like.productTitle}
                </h3>

                {/* ✅ 가격 + 상태 배지 */}
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(like.productPrice)}원
                  </p>
                  {getStatusBadge(like.productStatus)}
                </div>

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
            <Button
              onClick={() => navigate("/")}
              variant="primary"
              size="md"
              className="mt-4"
            >
              상품 둘러보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLikes;
