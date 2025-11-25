import { Link } from "react-router-dom";
import useLikeStore from "../../stores/likeStore";
import useAuthStore from "../../stores/authStore";

const NO_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;base64," +
  btoa(
    '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="400" height="300" fill="#6B4F4F"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
      'font-family="sans-serif" font-size="20" fill="#FFFFFF">No Image</text>' +
      "</svg>"
  );

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuthStore();

  // 🔥 Zustand에서 찜 상태 가져오기
  const isLiked = useLikeStore((state) => state.isLiked(product.productId));
  const likeCount = useLikeStore((state) =>
    state.getLikeCount(product.productId)
  );
  const toggleLike = useLikeStore((state) => state.toggleLike);

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

    try {
      await toggleLike(product.productId);
    } catch (error) {
      console.error("찜하기 처리 실패:", error);
      alert("찜하기 처리 중 오류가 발생했습니다.");
    }
  };

  const formatPrice = (price) => {
    return price?.toLocaleString("ko-KR") || "0";
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <Link to={`/products/${product.productId}`}>
          <img
            src={
              product.thumbnailImageUrl ||
              product.mainImage ||
              NO_IMAGE_PLACEHOLDER
            }
            alt={product.productName || product.title}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = NO_IMAGE_PLACEHOLDER;
            }}
          />
        </Link>

        <button
          onClick={handleLikeToggle}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 transform hover:scale-110"
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
            <span>{product.sellerAddress || "위치 정보 없음"}</span>
          </span>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <i className="bi bi-eye"></i>
              <span>{product.viewCount || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <i
                className={`bi ${
                  isLiked ? "bi-heart-fill text-red-500" : "bi-heart"
                }`}
              ></i>
              <span>{likeCount}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
