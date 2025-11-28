import { useState, useEffect } from "react";
import { useCommentStore } from "../../stores/commentStore";
import useAuth from "../../hooks/useAuth";
import CommentItem from "./CommentItem";
import Button from "../common/Button";

const CommentSection = ({ productId }) => {
  const { isAuthenticated } = useAuth();
  //  로그인 정보 가져오기 ( 로그인 여부 확인 )

  const {
    //  Zustand Store에서 댓글 관련 데이터 / 함수 가져오기
    comments, //  현재 상품의 모든 댓글 배열 ( 최상위  + 대댓글 모두 포함 )
    loading, // 댓글 로딩 중 여부
    fetchComments, // 댓글 목록 조회 함수
    createComment, // 새 댓글 작성 함수
  } = useCommentStore();

  //  로컬상태 관리
  const [content, setContent] = useState("");
  //  댓글 작성 입력창의 내용을 저장하는 상태
  const [submitting, setSubmitting] = useState(false);
  //  댓글 작성 중인지 여부를 저장하는 상태 ( 중복 제출 방지용 )

  // 댓글 불러오기 ( 컴포넌트 마운트시 )
  useEffect(() => {
    if (productId) {
      //  productId가 있을 때만 실행 (undefined 체크)
      fetchComments(productId);
      //  Zustand Store의 fetchComments 함수 호출
      //  서버에서 댓글 목록을 가져와서 comments 상태에 저장
    }
  }, [productId, fetchComments]);
  //  의존성배열 :  productId, fetchComments 가 변경되면 다시 실행

  // 댓글 작성 - 폼 제출시 실행 되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault(); //  폼의 기본 동작 ( 페이지 새로고침 ) 방지

    // 🔐 프론트에서 먼저 로그인 체크
    if (!isAuthenticated) {
      if (
        window.confirm(
          "로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?"
        )
      ) {
        navigate("/login");
      }
      return;
    }

    if (!content.trim()) {
      //  빈 내용 체크 ( 공백만 있는 경우도 걸러냄 )
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    setSubmitting(true); //  제출 시작 ( 버튼 비활성화용 )
    try {
      await createComment(productId, content);
      //  Zustand Store에서 createComment 함수 호출
      //  파라미터 ( 상품 ID, 댓글내용 )
      //  세 번째 파라미터( 부모댓글 ID )가 없으면 최상위 댓글로 생성됨

      setContent(""); // 성공 시 입력창 초기화
      alert("✅ 댓글이 작성되었습니다!");
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "댓글 작성 중 오류가 발생했습니다.";
      alert("❌ " + msg);

      // 혹시 백엔드에서 401을 또 던지면 (토큰 만료 등)
      if (error.response?.status === 401) {
        // 이때는 axios 인터셉터가 이미 logout + redirect 했을 수도 있음
        // 추가 UX를 주고 싶으면 여기서도 navigate("/login") 해도 됨
      }
    } finally {
      setSubmitting(false);
      //  성공 실패 여부 상관없이 항상 실행
      //  제출 종료 (버튼 다시 활성화)
    }
  };

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        <i className="bi bi-chat-dots text-primary mr-2"></i>
        댓글 ({comments.length})
      </h2>

      {/* 댓글 작성 폼 */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력하세요..."
            rows="3"
            className="w-full px-4 py-3 border
             border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors resize-none text-sm"
          />
          <div className="flex justify-end mt-3">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || !content.trim()}
              className="text-sm px-4 py-2"
            >
              {submitting ? "작성 중..." : "댓글 작성"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 text-sm">
            댓글을 작성하려면{" "}
            <a href="/login" className="text-primary font-bold hover:underline">
              로그인
            </a>
            이 필요합니다.
          </p>
        </div>
      )}

      {/* 댓글 목록 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-3 text-sm">댓글을 불러오는 중...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <i className="bi bi-chat-text text-5xl mb-3 block"></i>
          <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments
            .filter((comment) => !comment.parentId) // ✅ 최상위 댓글만
            .map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                productId={productId}
                replies={comments.filter(
                  (c) => c.parentId === comment.id // ✅ comment.id
                )}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
