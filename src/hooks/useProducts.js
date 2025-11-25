import { useState, useEffect } from "react";
import { getProductList, getCategories, getDistricts } from "../api/mainApi";
import useLikeStore from "../stores/likeStore";

/**
 * 메인 페이지 상품 데이터를 관리하는 커스텀 훅
 */
const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]); // 🔥 추가
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
    sort: ["createdDate", "desc"], // 기본 정렬 (최신순)
    ...initialParams,
  });

  // 🔥 Zustand store에서 초기화 함수 가져오기
  const initializeLikes = useLikeStore((state) => state.initializeLikes);

  // 🔥 카테고리 목록 가져오기
  const fetchCategories = async () => {
    try {
      const response = await getCategories(true);
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error("카테고리 조회 실패:", err);
    }
  };

  // 🔥 지역 목록 가져오기
  const fetchDistricts = async () => {
    try {
      const response = await getDistricts();
      if (response.success) {
        setDistricts(response.districts || []);
      }
    } catch (err) {
      console.error("지역 목록 조회 실패:", err);
    }
  };

  // 🔥 상품 목록 가져오기
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProductList(params);

      if (response.success) {
        setProducts(response.content || []);

        // 🔥 찜 상태 초기화 (Zustand에 저장)
        initializeLikes(response.content || []);

        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          size: response.size,
          first: response.first,
          last: response.last,
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

  // 🔥 최초 로드: 카테고리 + 지역 목록 조회
  useEffect(() => {
    fetchCategories();
    fetchDistricts();
  }, []);

  // params 변경 시 상품 재조회
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
      page: 0,
    }));
  };

  // 검색어 변경
  const changeKeyword = (keyword) => {
    setParams((prev) => ({
      ...prev,
      keyword: keyword || undefined,
      page: 0,
    }));
  };

  // 🔥 지역 필터 변경
  const changeDistrict = (district) => {
    setParams((prev) => ({
      ...prev,
      district: district || undefined,
      page: 0,
    }));
  };

  // 🔥 정렬 변경
  const changeSort = (sortField, sortDirection) => {
    setParams((prev) => ({
      ...prev,
      sort: [sortField, sortDirection],
      page: 0,
    }));
  };

  // 필터 초기화
  const resetFilters = () => {
    setParams({ page: 0, size: 12, sort: ["createdDate", "desc"] });
  };

  return {
    products,
    categories,
    districts, // 🔥 추가
    pagination,
    loading,
    error,
    params,
    changePage,
    changeCategory,
    changeKeyword,
    changeDistrict, // 🔥 추가
    changeSort, // 🔥 추가
    resetFilters,
    refetch: fetchProducts,
  };
};

export default useProducts;
