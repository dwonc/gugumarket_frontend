import { useState } from "react";
import { adminApi } from "../../api/adminApi";
import { handleImageError } from "../../utils/formatters";

//  상태관리
const ProductTable = ({ products, onRefresh }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  //  상품 상태 (전체,판매중,삭제됨 등)을 저장하는 상태
  const [status, setStatus] = useState("");

  //  검색기능
  const handleSearch = () => {
    // 검색 버튼을 클릭했을때 실행됨
    onRefresh({ keyword: searchKeyword, isDeleted: status });
    //  부모 컴포넌트의 onRefresh 함수를 호출
    //  검색어 와 삭제 상태를 전달
  };

  //  엔터키를 눌렀을 때 검색 되도록 하는 함수
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  //  삭제 기능
  const handleDelete = async (productId, title) => {
    if (!window.confirm(`"${title}" 상품을 정말 삭제하시겠습니까?`)) {
      // 삭제 확인 팝업
      return;
    }

    try {
      await adminApi.deleteProduct(productId); // API 호출해서 백엔드에 DELETE 요청
      alert("상품이 삭제되었습니다."); //  삭제 성공시 알림
      onRefresh(); //  목록 새로고침 ( 삭제된 상품이 사라지도록 )
    } catch (error) {
      console.error("상품 삭제 실패:", error); // 에러가 발생하면 알림
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
                {/* ✅ 이미지 - 크기 제한 추가 */}
                <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {product.mainImage ? (
                    <img
                      src={product.mainImage}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%236B4F4F'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='10' fill='white'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary">
                      <i className="bi bi-image text-white text-xl"></i>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 mb-1 truncate">
                    {product.title}
                  </h4>
                  <p className="text-primary font-bold mb-1">
                    {product.price?.toLocaleString()}원
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    판매자: {product.user?.nickname || "알 수 없음"} | 등록일:{" "}
                    {new Date(product.createdDate).toLocaleDateString("ko-KR")}
                  </p>
                </div>

                <div className="flex flex-col justify-between items-end flex-shrink-0">
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
                      href={`/products/${product.productId}`}
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
