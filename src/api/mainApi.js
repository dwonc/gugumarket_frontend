import api from "./axios";

/**
 * 메인 페이지 데이터 조회
 * @param {Object} params - 쿼리 파라미터
 * @param {number} params.page - 페이지 번호 (0부터 시작)
 * @param {number} params.size - 페이지 크기 (기본 12)
 * @param {number} params.categoryId - 카테고리 ID (선택)
 * @param {string} params.keyword - 검색어 (선택)
 */
export const getMainPageData = async (params = {}) => {
  try {
    const response = await api.get("/api/main", { params });
    return response.data;
  } catch (error) {
    console.error("메인 페이지 데이터 조회 실패:", error);
    throw error;
  }
};

/**
 * 상품 찜하기/취소
 * @param {number} productId - 상품 ID
 */
export const toggleProductLike = async (productId) => {
  try {
    const response = await api.post(`/api/products/${productId}/like`);
    return response.data;
  } catch (error) {
    console.error("찜하기 처리 실패:", error);
    throw error;
  }
};

/**
 * 상품 목록 조회 (필터링 + 정렬)
 * @param {Object} params - 쿼리 파라미터
 * @param {string} params.district - 구 이름 (예: "강남구")
 * @param {number} params.categoryId - 카테고리 ID
 * @param {string} params.keyword - 검색어
 * @param {number} params.page - 페이지 번호
 * @param {number} params.size - 페이지 크기
 * @param {string[]} params.sort - 정렬 ["필드명", "방향"] (예: ["price", "asc"])
 */
export const getProductList = async (params = {}) => {
  try {
    const response = await api.get("/api/products/list", { params });
    return response.data;
  } catch (error) {
    console.error("상품 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 지역(구) 목록 조회
 */
export const getDistricts = async () => {
  try {
    const response = await api.get("/api/districts");
    return response.data;
  } catch (error) {
    console.error("지역 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 카테고리 목록 조회
 * @param {boolean} includeCount - 상품 개수 포함 여부
 */
export const getCategories = async (includeCount = false) => {
  try {
    const response = await api.get("/api/categories", {
      params: { includeCount },
    });
    return response.data;
  } catch (error) {
    console.error("카테고리 조회 실패:", error);
    throw error;
  }
};
