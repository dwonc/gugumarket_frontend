import { create } from "zustand";
import api from "../api/axios";

//
//  댓글 관련 전역 상태와 함수를 관리하는 zustand Store
//

export const useCommentStore = create((set, get) => ({
  // State
  comments: [], //  댓글 목록을 저장하는 배열 ( 최상위 댓글, 대댓글 모두 포함 (parentId 로 구분))
  loading: false, //  데이터 로딩 중인지 여부 ( true / false )
  error: null, // 에러 메시지 저장  ( string / null )

  // Actions 상태 변경함수
  setComments: (comments) => set({ comments }), //  댓글 목록을 직접 설정하는 함수
  setLoading: (loading) => set({ loading }), //  로딩 상태를 설정하는 함수
  setError: (error) => set({ error }), //  에러 상태를 설정하는 함수

  // 댓글 목록 조회
  fetchComments: async (productId) => {
    set({ loading: true, error: null }); //  로딩시작 , 에러 초기화
    try {
      const response = await api.get(`/api/products/${productId}/comments`);
      //  서버에 GET 요청 (댓글 목록 조회)
      //  ex) GET /api/products/123/comments
      const result = response.data; //  서버 응답 데이터

      if (result.success) {
        // 요청 성공 여부 확인
        set({ comments: result.comments, loading: false });
        //  댓글 목록을 상태에 저장하고 로딩 종료
        return result; //  결과반환
      } else {
        throw new Error("댓글을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 조회 실패:", error);
      set({ error: error.message, loading: false });
      //  에러 상태 저장하고 로딩 종료
      throw error; //  에러를 다시 던져서 호출한 곳에서 처리할 수 있게 함
    }
  },

  // 댓글 작성
  createComment: async (productId, content, parentId = null) => {
    try {
      const response = await api.post(`/api/products/${productId}/comments`, {
        //  서버에 POST 요청 ( 댓글작성 )
        //  ex) /api/products/123/comments
        content, //  댓글 내용
        parentId: parentId ? String(parentId) : null,
        //  parentId가 있으면 문자열로 변환 , 없으면 NULL
        //  서버가 문자열로 받을 수도 있어서 String() 처리
      });

      const result = response.data; //  서버 응답 데이터

      if (result.success) {
        // 댓글 목록 새로고침
        await get().fetchComments(productId);
        //  댓글 작성 성공 후 목록 새로고침
        //  get(): 현재 스토어의 상태 / 함수에 접근하는 Zustand 함수
        //  get().fetchComments : 스토어의 fetchComments 함수 호출
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
        //  서버에 PUT 요청 ( 댓글 수정 )
        //  ex) PUT /api/comments/456
        content, //  새로운 댓글 내용
      });

      const result = response.data; //  서버 응답 데이터

      if (result.success) {
        //  요청 성공 여부 확인

        await get().fetchComments(productId);
        //  댓글 수정 성공 후 목록 새로고침
        //  전체 목록을 다시 불러와서 수정된 내용 반영
        return result;
      } else {
        //  실패시
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
      //  서버에서 DELETE 요청 ( 댓글 삭제 )
      //  ex) /api/comments/456
      const result = response.data; //  서버 응답데이터

      if (result.success) {
        //  요청 성공 여부 확인

        await get().fetchComments(productId);
        //  댓글 삭제 성공 후 목록 새로고침
        //  삭제된 댓글을 목록에서 제거하기 위해
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
