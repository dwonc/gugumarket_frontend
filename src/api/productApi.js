import api from "./axiosConfig";

// 상품 목록 조회
export const getProducts = async (page = 0) => {
  //사용자 -> getProducts page 값 0 호출
  const response = await api.get("/api/products", {
    // GET -> /api/products?page=0 요청
    params: { page }, //api/products?page=0 (배열 0 = 1페이지 )
    // params 는 URL 뒤에 붙는 쿼리스트링을 자동으로 만둘어주는 옵션 (get 요청은 보통 body 가 없기때문에 사용)
  });
  return response.data;
};

// 상품 상세 조회
export const fetchProduct = async (productId) => {
  //사용자 -> fetchProduct(???) 호출
  const response = await api.get(`/api/products/${productId}`);
  //Get -> /api/products/??? 요청
  // { productId: ??? 번의 상세 정보 }반환
  // response 는 서버가 보내준 응답 데이터(전체내용)
  return response.data;
};

// 상품 등록
export const createProduct = async (formData) => {
  // 사용자 -> 상품 등록 폼 작성 후 제출
  const response = await api.post("/api/products", formData, {
    // POST -> /api/products 요청 (multipart/form-data 형식)
    // FormData 객체 생성 (제목, 가격, 이미지 등등 포함)
    headers: { "Content-Type": "multipart/form-data" },
    // formData는 파일(이미지)을 업로드 할때 사용하는 바디
    // 이미지는 바이너리 데이터 라서 JSON으로 담을수 없기 때문에 그에 맞는 방식을 만들어 주는게 formData
  });
  return response.data;
};

// 상품 수정
export const updateProduct = async (productId, formData) => {
  // 사용자 - > 상품 수정 폼에서 정보 변경 후 제출
  const response = await api.put(`/api/products/${productId}`, formData, {
    // PUT -> /api/products/?? 요청
    // 서버에서 ??? 번의 상품 정보 업데이트
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 상품 삭제
export const deleteProduct = async (productId) => {
  // 사용자 - > 삭제 버튼 클릭
  const response = await api.delete(`/api/products/${productId}`);
  // DELETE -> /api/products/??? 요청
  // 서버에서 ???번의 상품 정보 삭제
  return response.data;
};

// 상품 상태 변경
export const updateProductStatus = async (productId, status) => {
  // 사용자 - > 상품 상태 변경 버튼 클릭 (예약중, 판매완료 등등)
  const response = await api.patch(`/api/products/${productId}/status`, {
    status,
  });
  // PATCH -> api/products/ ??? / status
  // body:{ status: "REVSERVED"} 등등
  // 서버에서 ??? 번의 상품 상태를 OOO 로 변경
  return response.data;
};

// 좋아요 토글
export const toggleLike = async (productId) => {
  // 사용자 - > 하트 버튼 클릭
  const response = await api.post(`/api/products/${productId}/like`);
  // POST -> /api/products/ ??? / like 호출
  // 서버에서 찜 상태 확인
  // 이미 찜완료 -> 취소 // 찜 안함 - > 찜 추가
  return response.data;
};

// 이미지 업로드
export const uploadImage = async (file) => {
  // 사용자 -> 이미지 파일 선택
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post("/api/products/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    // POST - > /api/products/upload/image 호출
    // 서버에서 이미지를 저장하고 URL 반환
  });
  return response.data.imageUrl;
};

// 다중 이미지 업로드
export const uploadMultipleImages = async (files) => {
  // 사용자 - > 여러 추가 이미지 파일 선택
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.post("/api/products/upload/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    // POST -> /api/products/upload/images 호출
    // 서버에서 모든 이미지를 저장하고 URL 배열 반환
  });
  return response.data.imageUrls;
};
