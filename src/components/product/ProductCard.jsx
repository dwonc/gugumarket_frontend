import { useState } from "react";
import { Link } from "react-router-dom";
import { toggleProductLike } from "../../api/mainApi";
import useAuthStore from "../../stores/authStore";

const ProductCard = ({ product, onLikeUpdate }) => {
  const [isLiked, setIsLiked] = useState(product.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleLikeToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      if (
        window.confirm(
          "로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?"
        )
      ) {
        window.location.href = "/login";
      }
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    try {
      const response = await toggleProductLike(product.productId);

      if (response.success) {
        setIsLiked(!isLiked);
        if (onLikeUpdate) {
          onLikeUpdate(product.productId, !isLiked);
        }
      } else {
        alert(response.message || "오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("찜하기 처리 실패:", error);
      alert("찜하기 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLiking(false);
    }
  };

  const formatPrice = (price) => {
    return price?.toLocaleString("ko-KR") || "0";
  };

  // ⭐ sellerAddress가 없거나 "위치정보 없음"일 경우 처리
  const getLocationText = () => {
    if (!product.sellerAddress || product.sellerAddress === "위치정보 없음") {
      return "위치 정보 없음";
    }
    return product.sellerAddress;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <Link to={`/products/${product.productId}`}>
          <img
            src={
              product.thumbnailImageUrl ||
              product.mainImage ||
              "https://placehold.co/400x300/6B4F4F/FFFFFF?text=No+Image"
            }
            alt={product.productName || product.title}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/400x300/6B4F4F/FFFFFF?text=No+Image";
            }}
          />
        </Link>

        <button
          onClick={handleLikeToggle}
          disabled={isLiking}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 transform hover:scale-110 disabled:opacity-50"
        >
          <i
            className={`${
              isLiked ? "bi-heart-fill" : "bi-heart"
            } text-red-500 text-xl`}
          ></i>
        </button>

        {product.viewCount > 200 && (
          <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            인기
          </div>
        )}
      </div>

      <div className="p-5">
        <Link to={`/products/${product.productId}`} className="block">
          <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
            {product.productName || product.title}
          </h3>
        </Link>

        <p className="text-2xl font-bold text-primary mb-3">
          {formatPrice(product.price)}원
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <i className="bi bi-geo-alt"></i>
            {/* ⭐ sellerAddress 직접 사용 */}
            <span>{getLocationText()}</span>
          </span>
          <span className="flex items-center gap-1">
            <i className="bi bi-eye"></i>
            <span>{product.viewCount || 0}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
