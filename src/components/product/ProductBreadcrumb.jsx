//
//
//  사용자가 현재 어디에 있는지 보여주고,
//  상위 페이지로 쉽게 이동할 수 있게 해주는 네비게이션
//  ex) " 홈 > 전자제품 > 냉장고 " 같은 경로를 보여줌

const ProductBreadcrumb = ({ product }) => {
  if (!product) return null;
  //  상품 정보가 없으면 아무것도 렌더링 하지않음

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-primary">
            <i className="bi bi-house-door"></i> 홈
          </a>
          <span className="text-xs">›</span>
          {product.categoryName && (
            <>
              <a
                href={`/?categoryId=${product.categoryId}`}
                className="hover:text-primary transition-colors duration-200"
              >
                {product.categoryName}
              </a>
              <span className="text-xs">›</span>
            </>
          )}
          <span className="text-gray-800 font-medium">
            {product.productName || product.title}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductBreadcrumb;
