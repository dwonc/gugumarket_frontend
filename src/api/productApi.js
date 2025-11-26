import api from "./axiosConfig";

const S3_HOST = import.meta.env.VITE_S3_HOST;
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

    const relativePath = response.data.imageUrl;

    // ⚠️ 백엔드가 상대 경로를 반환할 경우에만 S3_HOST를 붙입니다.
    //    백엔드가 S3에서 반환된 풀 URL을 제공한다면, 이 라인을 제거하세요.
    //    (일반적으로 백엔드가 풀 URL을 반환하는 것이 가장 효율적입니다.)
    if (relativePath && !relativePath.startsWith('http')) {
        return `${S3_HOST}/${relativePath}`;
    }
    return relativePath; // 이미 풀 URL인 경우
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

    const relativePaths = response.data.imageUrls;

    // ⚠️ 배열의 각 경로에 S3_HOST를 붙여 풀 URL로 변환합니다.
    if (relativePaths && Array.isArray(relativePaths)) {
        return relativePaths.map(relativePath => {
            if (relativePath && !relativePath.startsWith('http')) {
                return `${S3_HOST}/${relativePath}`;
            }
            return relativePath;
        });
    }
    return relativePaths;
};
