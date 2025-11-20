import { useState } from "react";
import { adminApi } from "../../api/adminApi";

const ProductTable = ({ products, onRefresh }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [status, setStatus] = useState("");

  const handleSearch = () => {
    onRefresh({ keyword: searchKeyword, isDeleted: status });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDelete = async (productId, title) => {
    if (!window.confirm(`"${title}" 상품을 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await adminApi.deleteProduct(productId);
      alert("상품이 삭제되었습니다.");
      onRefresh();
    } catch (error) {
      console.error("상품 삭제 실패:", error);
      alert("상품 삭제에 실패했습니다.");
    }
  };

  return (
    <div>
      {/* 검색 바 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">제품 관리</h2>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="">전체 상태</option>
            <option value="false">판매중</option>
            <option value="true">삭제됨</option>
          </select>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="상품 검색..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSearch}
            className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i className="bi bi-search"></i>
          </button>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <i className="bi bi-box-seam text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-lg">등록된 상품이 없습니다.</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.productId}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
            >
              <div className="flex gap-4">
                <img
                  src={product.mainImage || "https://via.placeholder.com/80"}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/80/6B4F4F/FFFFFF?text=No+Image";
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1">
                    {product.title}
                  </h4>
                  <p className="text-primary font-bold mb-1">
                    {product.price?.toLocaleString()}원
                  </p>
                  <p className="text-sm text-gray-500">
                    판매자: {product.user?.nickname || "알 수 없음"} | 등록일:{" "}
                    {new Date(product.createdDate).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="flex flex-col justify-between items-end">
                  {product.isDeleted ? (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      삭제됨
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      판매중
                    </span>
                  )}
                  <div className="flex gap-2">
                    <a
                      href={`/product/${product.productId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      상세
                    </a>
                    <button
                      onClick={() =>
                        handleDelete(product.productId, product.title)
                      }
                      disabled={product.isDeleted}
                      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductTable;
