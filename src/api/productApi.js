import api from "./axiosConfig";

// 상품 목록 조회
export const getProducts = async (page = 0) => {
  const response = await api.get("/api/products", {
    params: { page },
  });
  return response.data;
};

// 상품 상세 조회
export const fetchProduct = async (productId) => {
  const response = await api.get(`/api/products/${productId}`);
  return response.data;
};

// 상품 등록
export const createProduct = async (formData) => {
  const response = await api.post("/api/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 상품 수정
export const updateProduct = async (productId, formData) => {
  const response = await api.put(`/api/products/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 상품 삭제
export const deleteProduct = async (productId) => {
  const response = await api.delete(`/api/products/${productId}`);
  return response.data;
};

// 상품 상태 변경
export const updateProductStatus = async (productId, status) => {
  const response = await api.patch(`/api/products/${productId}/status`, {
    status,
  });
  return response.data;
};

// 좋아요 토글
export const toggleLike = async (productId) => {
  const response = await api.post(`/api/products/${productId}/like`);
  return response.data;
};

// 이미지 업로드
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post("/api/products/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.imageUrl;
};

// 다중 이미지 업로드
export const uploadMultipleImages = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.post("/api/products/upload/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.imageUrls;
};
