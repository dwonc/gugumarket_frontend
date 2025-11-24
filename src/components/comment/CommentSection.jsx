import { useState, useEffect } from "react";
import { useCommentStore } from "../../stores/commentStore";
import useAuth from "../../hooks/useAuth";
import CommentItem from "./CommentItem";
import Button from "../common/Button";

const CommentSection = ({ productId }) => {
  const { isAuthenticated } = useAuth();
  const { comments, loading, fetchComments, createComment } = useCommentStore();

  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 댓글 불러오기
  useEffect(() => {
    if (productId) {
      fetchComments(productId);
    }
  }, [productId, fetchComments]);

  // 댓글 작성
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await createComment(productId, content);
      setContent(""); // 입력창 초기화
      alert("✅ 댓글이 작성되었습니다!");
    } catch (error) {
      alert("❌ " + error.message);
    } finally {
      setSubmitting(false);
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
