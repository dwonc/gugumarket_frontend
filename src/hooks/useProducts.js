import { useState, useEffect } from "react";
import { getMainPageData } from "../api/mainApi";

/**
 * 메인 페이지 상품 데이터를 관리하는 커스텀 훅
 */
const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 12,
    first: true,
    last: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    page: 0,
    size: 12,
    ...initialParams,
  });

  // 데이터 가져오기
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMainPageData(params);

      if (response.success) {
        const { products: productData, categories: categoryData } =
          response.data;

        // 상품 데이터 설정
        setProducts(productData.content || []);

        // 카테고리 데이터 설정
        setCategories(categoryData || []);

        // 페이지네이션 정보 설정
        setPagination({
          currentPage: productData.currentPage,
          totalPages: productData.totalPages,
          totalElements: productData.totalElements,
          size: productData.size,
          first: productData.first,
          last: productData.last,
        });
      } else {
        setError(response.message || "데이터를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      setError(err.message || "데이터를 불러오는데 실패했습니다.");
      console.error("상품 데이터 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // params 변경 시 데이터 재조회
  useEffect(() => {
    fetchProducts();
  }, [params]);

  // 페이지 변경
  const changePage = (newPage) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  // 카테고리 필터 변경
  const changeCategory = (categoryId) => {
    setParams((prev) => ({
      ...prev,
      categoryId: categoryId || undefined,
      page: 0, // 카테고리 변경 시 첫 페이지로
    }));
  };

  // 검색어 변경
  const changeKeyword = (keyword) => {
    setParams((prev) => ({
      ...prev,
      keyword: keyword || undefined,
      page: 0, // 검색 시 첫 페이지로
    }));
  };

  // 필터 초기화
  const resetFilters = () => {
    setParams({ page: 0, size: 12 });
  };

  return {
    products,
    categories,
    pagination,
    loading,
    error,
    params,
    changePage,
    changeCategory,
    changeKeyword,
    resetFilters,
    refetch: fetchProducts,
  };
};

export default useProducts;
