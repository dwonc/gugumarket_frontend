import { create } from "zustand";
import { toggleProductLike } from "../api/mainApi";

const useLikeStore = create((set, get) => ({
  // State: 찜한 상품 ID 목록
  likedProductIds: new Set(),

  // State: 각 상품의 찜 개수
  likeCounts: new Map(),

  // 초기화: 서버에서 받은 데이터로 상태 설정
  initializeLikes: (products) => {
    const likedIds = new Set();
    const counts = new Map();

    products.forEach((product) => {
      if (product.isLiked) {
        likedIds.add(product.productId);
      }
      counts.set(product.productId, product.likeCount || 0);
    });

    set({
      likedProductIds: likedIds,
      likeCounts: counts,
    });

    console.log("💖 찜 상태 초기화:", {
      찜한상품수: likedIds.size,
      전체상품수: products.length,
      찜한상품ID: Array.from(likedIds),
    });
  },

  // 특정 상품의 찜 여부 확인
  isLiked: (productId) => {
    return get().likedProductIds.has(productId);
  },

  // 특정 상품의 찜 개수 조회
  getLikeCount: (productId) => {
    return get().likeCounts.get(productId) || 0;
  },

  // 찜하기 토글
  toggleLike: async (productId) => {
    try {
      const response = await toggleProductLike(productId);

      if (response.success) {
        const { likedProductIds, likeCounts } = get();
        const newLikedIds = new Set(likedProductIds);
        const newCounts = new Map(likeCounts);

        if (response.isLiked) {
          newLikedIds.add(productId);
        } else {
          newLikedIds.delete(productId);
        }

        newCounts.set(productId, response.likeCount);

        set({
          likedProductIds: newLikedIds,
          likeCounts: newCounts,
        });

        console.log("💖 찜 상태 변경:", {
          상품ID: productId,
          찜여부: response.isLiked,
          찜개수: response.likeCount,
        });

        return response;
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
      likedProductIds: new Set(),
      likeCounts: new Map(),
    });
    console.log("💖 찜 상태 초기화됨");
  },
}));

export default useLikeStore;
