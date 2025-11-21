import { create } from "zustand";
import api from "../api/axios";

export const useProductStore = create((set, get) => ({
  // 상품 상태
  product: null,
  products: [],
  categories: [],

  // 로딩 상태
  loading: false,
  uploading: false,

  // 에러 상태
  error: null,

  // 액션들
  setProduct: (product) => set({ product }),
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),
  setUploading: (uploading) => set({ uploading }),
  setError: (error) => set({ error }),

  // 상품 상세 조회
  fetchProduct: async (productId) => {
    set({ loading: true, error: null });
    try {
      console.log("🔍 fetchProduct 호출, ID:", productId);

      const response = await api.get(`/api/products/${productId}`);
      console.log("🔍 서버 응답:", response.data);

      const data = response.data;

      const product = data.product || data;
      set({ product, loading: false });

      return {
        success: data.success,
        product: product,
        isLiked: data.isLiked,
        likeCount: data.likeCount,
        interestedBuyers: data.interestedBuyers,
      };
    } catch (error) {
      console.error("❌ fetchProduct 실패:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // 카테고리 목록 조회
  fetchCategories: async () => {
    try {
      const response = await api.get("/api/categories");
      const result = response.data;

      console.log("🔍 받아온 카테고리 원본:", result); // ← 디버깅용

      // ✅ data 필드에서 배열 추출!
      const categoriesArray = result.data || [];

      console.log("✅ 설정할 카테고리 배열:", categoriesArray); // ← 디버깅용

      set({ categories: categoriesArray });
      return categoriesArray;
    } catch (error) {
      console.error("카테고리 조회 실패:", error);
      set({ categories: [] }); //에러시 빈 배열로 설정
      return [];
    }
  },

  // 이미지 업로드
  uploadImage: async (file) => {
    set({ uploading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/api/images/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data;
      set({ uploading: false });

      if (result.success) {
        let imageUrl = result.imageUrl;

        // ✅ 상대 경로면 절대 경로로 변환
        if (!imageUrl.startsWith("http")) {
          imageUrl = `http://localhost:8080${imageUrl}`;
        }

        console.log("✅ 최종 이미지 URL:", imageUrl);

        return imageUrl; // 절대 URL 반환!
      } else {
        throw new Error(result.message || "업로드 실패");
      }
    } catch (error) {
      set({ error: error.message, uploading: false });
      throw error;
    }
  },
  // 여러 이미지 업로드
  uploadMultipleImages: async (files) => {
    set({ uploading: true, error: null });
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await api.post("/api/images/upload-multiple", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data;
      set({ uploading: false });

      if (result.success) {
        // ✅ 각 URL을 절대 경로로 변환
        const imageUrls = result.imageUrls.map((url) => {
          if (!url.startsWith("http")) {
            return `http://localhost:8080${url}`;
          }
          return url;
        });

        console.log("✅ 최종 이미지 URLs:", imageUrls);

        return imageUrls;
      } else {
        throw new Error(result.message || "업로드 실패");
      }
    } catch (error) {
      set({ error: error.message, uploading: false });
      throw error;
    }
  },

  // 상품 등록
  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/api/products/write", productData);
      const result = response.data;
      set({ loading: false });

      if (result.success) {
        return { productId: result.productId }; // ← 이렇게 수정!
      } else {
        throw new Error(result.message || "등록 실패");
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // 상품 수정
  updateProduct: async (productId, productData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/api/products/${productId}`, productData);
      const result = response.data;
      set({ loading: false });

      if (result.success) {
        return result.product;
      } else {
        throw new Error(result.message || "수정 실패");
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          error.message ||
          "상품 수정 중 오류가 발생했습니다.",
        loading: false,
      });
      throw error;
    }
  },

  // 상품 삭제
  deleteProduct: async (productId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/api/products/${productId}`);
      set({ loading: false });
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // 상품 좋아요 토글
  toggleLike: async (productId) => {
    try {
      const response = await api.post(`/api/products/${productId}/like`);
      const result = response.data;

      if (result.needLogin) {
        if (
          confirm(
            "로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?"
          )
        ) {
          window.location.href = "/login";
        }
        return null;
      }

      if (result.success) {
        return {
          isLiked: result.isLiked,
          likeCount: result.likeCount,
        };
      } else {
        throw new Error(result.message || "좋아요 처리 실패");
      }
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
      throw error;
    }
  },

  // 상품 상태 변경
  updateProductStatus: async (productId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/api/products/${productId}/status`, {
        status,
      });
      const result = response.data;

      set({ loading: false });

      if (result.success) {
        const currentProduct = get().product;
        if (currentProduct && currentProduct.productId === productId) {
          set({
            product: {
              ...currentProduct,
              status: status,
            },
          });
        }
        return result;
      } else {
        throw new Error(result.message || "상태 변경 실패");
      }
    } catch (error) {
      console.error("상태 변경 실패:", error);
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },
}));
