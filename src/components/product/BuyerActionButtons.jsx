//구매자용 버튼들(찜하기, 구매하기)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";

const BuyerActionButtons = ({ product, onLikeToggle }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (product) {
      setIsLiked(product.isLiked || false);
      setLikeCount(product.likeCount || 0);
    }
  }, [product]);

  const handleLikeToggle = async () => {
    try {
      const result = await onLikeToggle(product.productId);
      if (result) {
        setIsLiked(result.isLiked);
        setLikeCount(result.likeCount);
      }
    } catch (error) {
      alert(`오류가 발생했습니다: ${error.message || error}`);
    }
  };

  if (!product) return null;

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
          onClick={handleLikeToggle}
          disabled={product.status === "SOLD_OUT"}
          className={`flex-1 border-2 font-bold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            isLiked
              ? "bg-red-500 text-white border-red-500"
              : "bg-white text-primary border-primary hover:bg-primary hover:text-white"
          } ${
            product.status === "SOLD_OUT" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <i
            className={`text-xl ${
              isLiked ? "bi bi-heart-fill" : "bi bi-heart"
            }`}
          ></i>
          <span>{isLiked ? "찜 취소" : "찜하기"}</span>
          <span className="ml-1 px-2 py-0.5 bg-black/10 rounded-full text-sm">
            {likeCount}
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
