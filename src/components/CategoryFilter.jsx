const CategoryFilter = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
}) => {
  return (
    <div className="bg-white py-6 shadow-sm sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-3">
          {/* 전체 카테고리 */}
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
              selectedCategoryId === null
                ? "bg-primary text-white shadow-md"
                : "bg-white text-primary border-2 border-accent hover:bg-primary hover:text-white"
            }`}
          >
            전체
          </button>

          {/* 카테고리 목록 */}
          {categories.map((category) => (
            <button
              key={category.categoryId}
              onClick={() => onCategoryChange(category.categoryId)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategoryId === category.categoryId
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-primary border-2 border-accent hover:bg-primary hover:text-white"
              }`}
            >
              {category.categoryName}
              {/* ✅ 0일 때는 표시 안 함 */}
              {category.productCount !== undefined &&
                category.productCount > 0 && (
                  <span className="ml-1 text-xs opacity-75">
                    ({category.productCount})
                  </span>
                )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
