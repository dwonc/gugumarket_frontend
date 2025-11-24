// 상품 정보 (제목, 가격, 메타 정보)

const ProductInfoSection = ({ product, isAdmin, reportCount }) => {
  if (!product) return null;

  return (
    <>
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.title}</h1>

      {/* ✅ Admin 전용 신고 배지 */}
      {isAdmin && reportCount > 0 && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill text-red-600 text-xl"></i>
          <span className="text-red-700 font-bold">
            이 상품에 {reportCount}건의 신고가 접수되었습니다.
          </span>
        </div>
      )}

      {/* Price */}
      <div className="mb-6">
        <span className="text-4xl font-bold text-primary">
          {product.price?.toLocaleString()}원
        </span>
      </div>

      {/* Product Meta Info */}
      <div className="space-y-3 py-6 border-y border-gray-200">
        <div className="flex justify-between">
          <span className="text-gray-600">카테고리</span>
          <span className="font-medium">{product.category?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">상태</span>
          <span className="font-medium">중고</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">판매자</span>
          <span className="font-medium">{product.sellerNickname}</span>
        </div>
        {product.seller?.address && (
          <div className="flex justify-between">
            <span className="text-gray-600">거래지역</span>
            <span className="font-medium">{product.seller.address}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">조회수</span>
          <span className="font-medium">{product.viewCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">등록일</span>
          <span className="font-medium">
            {new Date(product.createdDate).toLocaleDateString()}
          </span>
        </div>
      </div>
    </>
  );
};

export default ProductInfoSection;
