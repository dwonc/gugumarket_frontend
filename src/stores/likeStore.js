import { create } from "zustand";
import { toggleProductLike } from "../api/mainApi";

//
//
// 찜하기(좋아요) 상태를 전역으로 관리하는 Zustand 스토어

const useLikeStore = create((set, get) => ({
  // State: 찜한 상품 ID 목록
  likedProductIds: new Set(),

  // State: 각 상품의 찜 개수
  likeCounts: new Map(),

  // 초기화: 서버에서 받은 데이터로 상태 설정
  initializeLikes: (products) => {
    const likedIds = new Set(); // 찜한 상품 ID들을 담을 Set
    const counts = new Map(); // 찜 개수를 담을 Map

    products.forEach((product) => {
      // 모든 상품을 순회하면서 데이터 채우기
      if (product.isLiked) {
        // 현재 사용자가 찜한 상품이면
        likedIds.add(product.productId); // Set에 상품 ID 추가
      }
      counts.set(product.productId, product.likeCount || 0); // 찜 개수를 Map에 저장 (없으면 0으로)
    });

    set({
      // 스토어 상태 업데이트
      likedProductIds: likedIds,
      likeCounts: counts,
    });
  },

  // 특정 상품의 찜 여부 확인
  isLiked: (productId) => {
    return get().likedProductIds.has(productId);
    // get()으로 현재 상태를 가져옴
    // likedProductIds는 Set이므로 has() 메서드로 존재 여부 확인
    // Set의 has()는 O(1) 시간복잡도 → 매우 빠름!
  },

  // 특정 상품의 찜 개수 조회
  getLikeCount: (productId) => {
    return get().likeCounts.get(productId) || 0;
    // Map에서 해당 상품 ID의 찜 개수를 가져옴
    // 없으면 0 반환 (|| 0 연산자)
  },

  // 찜하기 토글
  toggleLike: async (productId) => {
    try {
      const response = await toggleProductLike(productId); // 서버에 찜하기 토글 요청

      if (response.success) {
        // 응답 성공 여부 확인
        const { likedProductIds, likeCounts } = get();
        //  현재 스토어 상태 가져오기

        // 불변성을 지키기 위해 새로운 Set과 Map 생성
        // React는 참조가 바뀌어야 리렌더링되므로 new Set(), new Map() 필수!
        const newLikedIds = new Set(likedProductIds); // 기존 Set 복사
        const newCounts = new Map(likeCounts); // 기존 Map 복사

        // 서버 응답에 따라 로컬 상태 변경
        if (response.isLiked) {
          // 찜하기 성공
          newLikedIds.add(productId); // set에 상품 id 추가
        } else {
          // 찜 취소 성공
          newLikedIds.delete(productId); // set에서 상품 id 제거
        }

        newCounts.set(productId, response.likeCount); // 찜 개수 업데이트

        set({
          // 스토어 상태 업데이트
          likedProductIds: newLikedIds,
          likeCounts: newCounts,
        });

        return response; // 응답 반환 ( 컴포넌트에서 추가 처리 가능 )
      } else {
        throw new Error(response.message || "찜하기 실패");
      }
    } catch (error) {
      console.error("❌ 찜하기 오류:", error);
      throw error;
    }
  },

  // 초기화 (로그아웃 시)
  reset: () => {
    set({
      likedProductIds: new Set(), // 빈 set
      likeCounts: new Map(), // 빈 map
    });
  },
}));

export default useLikeStore;
