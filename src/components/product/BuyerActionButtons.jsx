//
//
//구매자용 버튼들(찜하기, 구매하기)

import { useNavigate } from "react-router-dom";
import Button from "../common/Button";

const BuyerActionButtons = ({ product, onLikeToggle, isLiked, likeCount }) => {
  // product: 상품 정보 객체 (productId, title, price, isLiked 등)
  // onLikeToggle: 찜하기 토글 함수 (부모 컴포넌트에서 전달받음)
  // isLiked: 현재 찜 상태 (true/false)
  // likeCount: 찜 개수
  const navigate = useNavigate();

  if (!product) return null; // product가 없으면 아무것도 렌더링하지 않음

  // prop이 안 들어오면 product 객체에서 fallback
  const effectiveIsLiked =
    typeof isLiked === "boolean" ? isLiked : product.isLiked;

  const effectiveLikeCount =
    typeof likeCount === "number" ? likeCount : product.likeCount || 0;

  // ===== 찜하기 버튼 클릭 핸들러 =====
  const handleLikeClick = async () => {
    try {
      // store 쪽에서 알아서 상태를 변경해주고,
      // 여기서는 그냥 트리거만 눌러준다
      await onLikeToggle?.(product.productId);
    } catch (error) {
      alert(`오류가 발생했습니다: ${error.message || error}`);
    }
  };

  return (
    <>
      {/* 판매완료/예약중 표시 */}
      {product.status === "SOLD_OUT" && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-center">
          <p className="text-red-700 font-bold text-lg">
            🔴 판매완료된 상품입니다
          </p>
        </div>
      )}

      {product.status === "RESERVED" && (
        <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-700 font-bold text-lg">
            🟡 예약중인 상품입니다
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {/* 찜하기 버튼 */}
        <button
          onClick={handleLikeClick}
          disabled={product.status === "SOLD_OUT"}
          className={`flex-1 border-2 font-bold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            effectiveIsLiked
              ? "bg-red-500 text-white border-red-500"
              : "bg-white text-primary border-primary hover:bg-primary hover:text-white"
          } ${
            product.status === "SOLD_OUT" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <i
            className={`text-xl ${
              effectiveIsLiked ? "bi bi-heart-fill" : "bi bi-heart"
            }`}
          ></i>
          <span>{effectiveIsLiked ? "찜 취소" : "찜하기"}</span>
          <span className="ml-1 px-2 py-0.5 bg-black/10 rounded-full text-sm">
            {effectiveLikeCount}
          </span>
        </button>

        {/* 구매하기 버튼 */}
        <Button
          onClick={() => {
            if (product.status === "SOLD_OUT") {
              alert("판매완료된 상품입니다.");
            } else {
              navigate(`/products/${product.productId}/purchase`);
            }
          }}
          disabled={product.status === "SOLD_OUT"}
          variant="primary"
          className={`flex-1 ${
            product.status === "SOLD_OUT"
              ? "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400"
              : ""
          }`}
        >
          <i className="bi bi-cart text-xl mr-2"></i>
          {product.status === "SOLD_OUT" ? "판매완료" : "구매하기"}
        </Button>
      </div>
    </>
  );
};

export default BuyerActionButtons;
