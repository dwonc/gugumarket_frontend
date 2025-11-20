import { useState } from "react";

const ProductsSearch = ({
  initialKeyword = "",
  onSearch,
  currentCategoryId,
}) => {
  const [keyword, setKeyword] = useState(initialKeyword);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(keyword.trim());
  };

  const handleClear = () => {
    setKeyword("");
    onSearch("");
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="어떤 상품을 찾고 계신가요?"
            className="w-full py-4 pl-6 pr-32 text-lg border-2 border-primary rounded-full focus:outline-none focus:ring-4 ring-primary/20 transition-all duration-300 shadow-lg"
          />

          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-secondary text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <i className="bi bi-search mr-2"></i>
            검색
          </button>
        </form>

        {keyword && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm">
              <i className="bi bi-search"></i>'
              <span className="font-semibold">{keyword}</span>' 검색 결과
              <button
                onClick={handleClear}
                className="ml-2 hover:text-secondary transition-colors"
                title="검색 초기화"
              >
                <i className="bi bi-x-circle"></i>
              </button>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsSearch;
