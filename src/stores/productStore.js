import { create } from "zustand";
import api from "../api/axios";

export const useProductStore = create((set, get) => ({
  //  zustand 스토어 생성 -> 상품 관련 모든 상태와 함수를 여기서 관리

  // 상품 상태
  product: null, //  단일 상품 정보
  products: [], //  여러 상품 목록 배열
  categories: [], //  카테고리 목록 배열

  // 로딩 상태
  loading: false, //  데이터를 불러오는 중인지 나타내는 상태 (true 면 로딩 중)
  uploading: false, //  이미지를 업로드 하는 중인 나타내는 상태

  // 에러 상태
  error: null,

  // 액션들
  setProduct: (product) => set({ product }), //  product 상태 변경 함수
  setProducts: (products) => set({ products }), //  products 배열 변경 함수
  setCategories: (categories) => set({ categories }), //categories 배열 변경 함수
  setLoading: (loading) => set({ loading }), //  로딩 상태 변경 함수
  setUploading: (uploading) => set({ uploading }), //  업로드 상태 변경 함수
  setError: (error) => set({ error }), //  에러 상태 변경 함수

  // 상품 상세 조회 -> 특정 상품의 상세 정보를 서버에서 가져오는 비동기 함수
  fetchProduct: async (productId) => {
    set({ loading: true, error: null }); //  로딩 시작, 에러 초기화
    try {
      const response = await api.get(`/api/products/${productId}`);

      const data = response.data; //  응답 데이터를 변수에 저장

      const product = data.product || data;
      //  응답 구조에 따라 product 추출 ( data.product 가 있으면 그것을, 없으면 data 자체를 사용  )
      set({ product, loading: false });
      //  상품 정보를 store 에 저장하고 로딩 종료

      return {
        //  컴포넌트에서 사용 가능하게 여러 정보를 객체로 반환
        success: data.success, //  요청 성공 여부
        product: product, //  상품 정보
        isLiked: data.isLiked, //  현재 사용자가 좋아요를 눌렀는지
        likeCount: data.likeCount, // 총 좋아요 개수
        interestedBuyers: data.interestedBuyers, //  관심 있는 구매자 목록
        reportCount: data.reportCount, // 신고 횟수
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
      const response = await api.get("/api/categories"); //  서버에서 GET 요청
      const result = response.data; //  응답 데이터를 변수 result 에 저장

      const categoriesArray = result.data || [];
      //  서버 응답 구조에 따라 배열 추출 (result.data가 실제 배열)
      //  만약 result.data가 없으면 빈 배울 사용

      set({ categories: categoriesArray });
      //  스토어의 categories 상태를 업데이트

      return categoriesArray; // 배열을 반환해서 호출한 곳에서도 사용할 수 있게해줌
    } catch (error) {
      console.error("카테고리 조회 실패:", error);
      set({ categories: [] }); //에러시 빈 배열로 설정
      return [];
    }
  },

  // 이미지 업로드
  uploadImage: async (file) => {
    set({ uploading: true, error: null }); //  업로드 시작, 에러 초기화
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/api/images/upload", formData, {
        //  서버에서 POST 요청으로 파일 전송
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
    //  새로운 상품을 서버에 등록하는 함수
    set({ loading: true, error: null });
    try {
      const response = await api.post("/api/products/write", productData);
      //  서버에 POST 요청으로 상품 등록에 대한 데이터 전송
      const result = response.data;
      //  응답 데이터를 변수 result 에 저장
      set({ loading: false });

      if (result.success) {
        return { productId: result.productId };
        //  등록된 상품의 ID를 반환 (상세페이지로 이동할 때 사용)
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
    //  기존 상품의 정보를 수정하는 함수
    set({ loading: true, error: null }); //  로딩 시작, 에러 초기화
    try {
      const response = await api.put(`/api/products/${productId}`, productData);
      //  서버에 PUT 요청으로 상품 데이터 수정
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
    //  상품 삭제를 하는 함수
    set({ loading: true, error: null });
    try {
      await api.delete(`/api/products/${productId}`); //  서버에 DELETE 요청 전송
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
    //  좋아요를 누르거나 취소하는 함수 (토글: 스위치 ON / OFF )
    try {
      const response = await api.post(`/api/products/${productId}/like`);
      //  서버에 POST 요청으로 좋아요 토글
      const result = response.data;

      if (result.needLogin) {
        //  로그인이 필요한 경우
        if (
          confirm(
            "로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?"
          )
        ) {
          window.location.href = "/login"; //  확인을 누르면 로그인 페이지로 이동
        }
        return null;
      }

      if (result.success) {
        //  좋아요 처리 성공
        return {
          isLiked: result.isLiked, //  true몇 좋아요를 누른상태 , false 면 안누른 상태
          likeCount: result.likeCount, //  현재 좋아요 총 개수
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
    //  상품의 판매 상태를 변경하는 함수 (판매중, 예약중, 판매완료 등)
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/api/products/${productId}/status`, {
        //  서버에 PUT 요청으로 상태 변경 요청
        status,
      });
      const result = response.data;

      set({ loading: false }); //  상태 변경 완료

      if (result.success) {
        //  변경 성공 확안
        const currentProduct = get().product;
        //  현재 스토어에 저장된 상품 정보를 가져옴
        if (currentProduct && currentProduct.productId === productId) {
          //  현재 보고있는 상품의 상태를 변경한 경우
          set({
            //  스토어의 상품 정보도 업데이트 (화면에 바로 반영되도록)
            product: {
              ...currentProduct, //  기존 정보는 그대로 두고
              status: status, // 상태만 새 값으로 변경
            },
          });
        }
        return result; //  결과 반환
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
