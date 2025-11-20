const ProductGrid = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages, totalElements, first, last } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-12">
      <div className="flex justify-center items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={first}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
            first
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          이전
        </button>

        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              pageNum === currentPage
                ? "bg-primary text-white hover:bg-secondary"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {pageNum + 1}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={last}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
            last
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          다음
        </button>
      </div>

      <div className="text-center mt-4 text-gray-600 text-sm">
        총 <span className="font-bold text-primary">{totalElements}</span>개의
        상품 | 현재 <span className="font-bold">{currentPage + 1}</span> /{" "}
        <span>{totalPages}</span> 페이지
      </div>
    </div>
  );
};

export default ProductGrid;
