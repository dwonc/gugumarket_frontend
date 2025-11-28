//
//
// 상품 정보 (제목, 가격, 메타 정보)를 보여주는 컴포넌트

const ProductInfoSection = ({ product, isAdmin, reportCount }) => {
  //  Props로 상품 정보를 받아옴
  //  product = 상품 정보, isAdmin = 관리자여부, reportCount = 신고 건수
  if (!product) return null;

  return (
    <>
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        {product.productName || product.title}
      </h1>

      {/* 🎯 신고 배지 - 모든 유저에게 표시 */}
      {reportCount > 0 && (
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
          <span className="font-medium">{product.categoryName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">상태</span>
          <span className="font-medium">중고</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">판매자</span>
          <span className="font-medium">
            {product.sellerNickname || product.sellerName}
          </span>
        </div>
        {(product.sellerAddress || product.seller?.address) && (
          <div className="flex justify-between">
            <span className="text-gray-600">거래지역</span>
            <span className="font-medium">
              {product.sellerAddress || product.seller?.address}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">조회수</span>
          <span className="font-medium">{product.viewCount || 0}</span>
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
