const ProductBreadcrumb = ({ product }) => {
  if (!product) return null;

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
