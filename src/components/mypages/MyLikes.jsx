import React from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";

/**
 * 마이페이지 - 찜한 상품 목록 컴포넌트
 *
 * 역할: 사용자가 찜(좋아요)한 상품들을 카드 형태로 표시
 * 원래 MyPage.jsx에 있던 renderLikes 함수를 독립적인 컴포넌트로 분리
 *
 * @param {Array} likes - 찜한 상품 목록 배열
 * @param {Function} formatPrice - 가격을 포맷팅하는 함수 (예: 10000 → "10,000")
 * @param {Function} getProductImageUrl - 이미지 URL을 생성하는 함수
 * @param {Function} handleUnlike - 찜 해제 처리 함수
 * @param {Function} navigate - React Router의 페이지 이동 함수
 */
const MyLikes = ({
                     likes, // 찜한 상품 목록 배열
                     formatPrice, // 가격 포맷팅 함수
                     getProductImageUrl, // 이미지 URL 생성 함수
                     handleUnlike, // 찜 해제 함수
                     navigate, // 페이지 이동 함수
                 }) => {
    // 이미지가 없을 때 표시할 플레이스홀더 이미지 URL
    const NO_IMAGE_PLACEHOLDER = getProductImageUrl("");

    /**
     * 상품 상태에 따른 배지 컴포넌트 반환
     * @param {string} status - 상품 상태 (RESERVED, SALE, SOLD_OUT)
     * @returns {JSX.Element|null} 상태 배지 또는 null
     */
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
            {/* 섹션 제목 */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">찜한 목록</h2>

            {/* 상품 카드 그리드 레이아웃 (반응형) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {likes && likes.length > 0 ? (
                    // 찜한 상품이 있을 때: 각 상품을 카드로 표시
                    likes.map((like) => (
                        <div
                            key={like.likeId} // 각 항목의 고유 키 (React 리스트 렌더링용)
                            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                        >
                            {/* ========== 이미지 영역 ========== */}
                            <div className="relative">
                                {/* 상품 상세 페이지로 이동하는 링크 */}
                                <Link to={`/products/${like.productId}`}>
                                    {/* 상품 이미지 (hover 시 확대 효과) */}
                                    <img
                                        src={getProductImageUrl(like.productImage) || null}
                                        alt={like.productTitle}
                                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                            // 이미지 로딩 실패 시 플레이스홀더 이미지로 대체
                                            // dataset.hadError로 무한 재시도 방지
                                            if (e.target.dataset.hadError) return;
                                            e.target.dataset.hadError = true;
                                            e.target.src = NO_IMAGE_PLACEHOLDER;
                                        }}
                                    />
                                </Link>

                                {/* ✅ 판매완료 오버레이 (SOLD_OUT 상태일 때만 표시) */}
                                {like.productStatus === "SOLD_OUT" && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <div className="text-center">
                                            {/* 영문 "SOLD OUT" 표시 */}
                                            <div className="text-white text-3xl font-bold mb-1">
                                                SOLD OUT
                                            </div>
                                            {/* 한글 "판매완료" 표시 */}
                                            <div className="text-white/80 text-sm font-medium">
                                                판매완료
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 찜 해제 버튼 (하트 아이콘) */}
                                <button
                                    type="button"
                                    onClick={() => handleUnlike(like.productId)} // 클릭 시 찜 해제
                                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white toggle-like-btn"
                                >
                                    {/* 채워진 하트 아이콘 (Bootstrap Icons) */}
                                    <i className="bi bi-heart-fill text-red-500 text-xl"></i>
                                </button>
                            </div>

                            {/* ========== 정보 영역 ========== */}
                            <div className="p-4">
                                {/* 상품 제목 (1줄 제한, 넘치면 말줄임표) */}
                                <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">
                                    {like.productTitle}
                                </h3>

                                {/* ✅ 가격 + 상태 배지 영역 */}
                                <div className="flex items-center gap-2 mb-2">
                                    {/* 상품 가격 */}
                                    <p className="text-xl font-bold text-primary">
                                        {formatPrice(like.productPrice)}원
                                    </p>
                                    {/* 상태 배지 (예약중/판매중) */}
                                    {getStatusBadge(like.productStatus)}
                                </div>

                                {/* 위치 정보 (현재는 고정 텍스트) */}
                                <p className="text-sm text-gray-500">
                                    <i className="bi bi-geo-alt"></i>
                                    <span className="ml-1">위치 정보 없음</span>
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    /* ========== Empty State (찜한 상품이 없을 때) ========== */
                    <div className="col-span-4 text-center py-16">
                        {/* 빈 하트 아이콘 */}
                        <i className="bi bi-heart text-6xl text-gray-300 mb-4"></i>
                        {/* 안내 메시지 */}
                        <p className="text-gray-500 text-lg">찜한 상품이 없습니다.</p>
                        {/* 메인 페이지로 이동하는 버튼 */}
                        <Button
                            onClick={() => navigate("/")} // 클릭 시 홈으로 이동
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