import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import Pagination from "../components/Pagination";
import useProducts from "../hooks/useProducts";

const MainPage = () => {
  const {
    products,
    categories,
    pagination,
    loading,
    error,
    params,
    changePage,
    changeCategory,
    changeKeyword,
    refetch,
  } = useProducts();

  useEffect(() => {
    document.title = "GUGU Market - 중고거래 플랫폼";
  }, []);

  const handleLikeUpdate = (productId, isLiked) => {
    console.log(`상품 ${productId} 찜하기 ${isLiked ? "완료" : "취소"}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <SearchBar
        initialKeyword={params.keyword || ""}
        onSearch={changeKeyword}
        currentCategoryId={params.categoryId}
      />

      <CategoryFilter
        categories={categories}
        selectedCategoryId={params.categoryId || null}
        onCategoryChange={changeCategory}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">상품 목록</h2>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loading size="lg" text="상품을 불러오는 중..." />
          </div>
        )}

        {!loading && error && (
          <div className="mb-6">
            <ErrorMessage
              message={error}
              type="error"
              onClose={() => refetch()}
            />
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="col-span-full text-center py-20">
            <i className="bi bi-inbox text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-xl mb-2">등록된 상품이 없습니다</p>
            <p className="text-gray-400 text-sm mb-6">
              첫 상품을 등록해보세요!
            </p>
            <Link
              to="/products/write"
              className="inline-block bg-primary hover:bg-secondary text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              상품 등록하기
            </Link>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onLikeUpdate={handleLikeUpdate}
                />
              ))}
            </div>

            <Pagination pagination={pagination} onPageChange={changePage} />
          </>
        )}
      </main>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-primary transition-all duration-300 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary text-white p-4 rounded-full">
                <i className="bi bi-question-circle text-3xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  고객센터 / Q&A
                </h3>
                <p className="text-gray-600">
                  궁금한 사항이 있으신가요? 언제든지 문의해주세요!
                </p>
              </div>
            </div>
            <Link
              to="/qna"
              className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
            >
              Q&A 바로가기
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MainPage;
