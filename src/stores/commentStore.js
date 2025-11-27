import { create } from "zustand";
import api from "../api/axios";

export const useCommentStore = create((set, get) => ({
  // State
  comments: [],
  loading: false,
  error: null,

  // Actions
  setComments: (comments) => set({ comments }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // 댓글 목록 조회
  fetchComments: async (productId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/products/${productId}/comments`);
      const result = response.data;

      if (result.success) {
        set({ comments: result.comments, loading: false });
        return result;
      } else {
        throw new Error("댓글을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 조회 실패:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // 댓글 작성
  createComment: async (productId, content, parentId = null) => {
    try {
      const response = await api.post(`/api/products/${productId}/comments`, {
        content,
        parentId: parentId ? String(parentId) : null,
      });

      const result = response.data;

      if (result.success) {
        // 댓글 목록 새로고침
        await get().fetchComments(productId);
        return result;
      } else {
        throw new Error(result.message || "댓글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      // ❗여기서 더 이상 confirm / redirect 하지 말고
      // 그냥 에러를 밖으로 던진다
      throw error;
    }
  },

  // 댓글 수정
  updateComment: async (commentId, content, productId) => {
    try {
      const response = await api.put(`/api/comments/${commentId}`, {
        content,
      });

      const result = response.data;

      if (result.success) {
        // 댓글 목록 새로고침
        await get().fetchComments(productId);
        return result;
      } else {
        throw new Error(result.message || "댓글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 수정 실패:", error);

      if (error.response?.status === 401) {
        alert("로그인이 필요합니다.");
        return null;
      }

      throw error;
    }
  },

  // 댓글 삭제
  deleteComment: async (commentId, productId) => {
    try {
      const response = await api.delete(`/api/comments/${commentId}`);
      const result = response.data;

      if (result.success) {
        // 댓글 목록 새로고침
        await get().fetchComments(productId);
        return result;
      } else {
        throw new Error(result.message || "댓글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 삭제 실패:", error);

      if (error.response?.status === 401) {
        alert("로그인이 필요합니다.");
        return null;
      }

      throw error;
    }
  },
}));
