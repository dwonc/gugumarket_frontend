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

export const getProductList = async (params = {}) => {
  try {
    // 🔥 sort 배열을 "필드명,방향" 문자열로 변환
    const requestParams = { ...params };
    if (params.sort && Array.isArray(params.sort)) {
      requestParams.sort = `${params.sort[0]},${params.sort[1]}`;
    }

    const response = await api.get("/api/products/list", {
      params: requestParams,
    });
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
