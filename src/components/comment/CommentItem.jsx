import { useState } from "react";
import { useCommentStore } from "../../stores/commentStore";
import useAuth from "../../hooks/useAuth";
import Button from "../common/Button";

const CommentItem = ({ comment, productId, replies = [], level = 0 }) => {
  const { isAuthenticated, user } = useAuth();
  //  로그인 여부, 현재 로그인한 사용자 정보
  const { createComment, updateComment, deleteComment } = useCommentStore();
  //  댓글 작성 함수 , 댓글 수정 함수 , 댓글 삭제 함수

  const [isEditing, setIsEditing] = useState(false);
  //  수정 모드인지 여부를 저장하는 상태
  const [editContent, setEditContent] = useState(comment.content);
  //  수정 중인 댓글 내용을 저장하는상태 (초기값: 원래 댓글 내용)

  const [isReplying, setIsReplying] = useState(false);
  //  답글 작성 모드인지 여부를 저장하는 상태
  const [replyContent, setReplyContent] = useState("");
  //  작성 중인 답글 내용을 저장하는 상태

  //  기본 프로필 이미지  - 사용자의 프로필 이미지가 없을때 부여줄 기본 이미지
  const defaultProfileImage =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="50" cy="50" r="50" fill="#6B4F4F"/>' +
        '<circle cx="50" cy="40" r="18" fill="#FFFFFF"/>' +
        '<ellipse cx="50" cy="75" rx="25" ry="30" fill="#FFFFFF"/>' +
        "</svg>"
    );

  // comment.mine 필드 사용! ( 댓글 소유자 인지 확인)
  const isOwner = comment.mine;

  // 댓글 수정
  const handleUpdate = async () => {
    if (!editContent.trim()) {
      //  빈 내용 체크 ( 공백만 있는 경우도 걸러냄)
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      await updateComment(comment.id, editContent, productId);
      //  Zustand Store의 updateComment 함수 호출
      //  파라미터: (댓글ID, 새로운내용, 상품ID)
      setIsEditing(false);
      //수정 모드 종료
      alert("✅ 댓글이 수정되었습니다!");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  // 댓글 삭제
  const handleDelete = async () => {
    //  삭제확인 (취소하면 함수 종료)
    if (!confirm("정말로 삭제하시겠습니까?")) return;

    try {
      await deleteComment(comment.id, productId);
      //  Zustand Store의 deleteComment 함수 호출
      //  파라미터(댓글ID, 상품ID)
      alert("✅ 댓글이 삭제되었습니다!");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  // 대댓글 작성
  const handleReply = async () => {
    if (!replyContent.trim()) {
      //  빈 내용 체크
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      await createComment(productId, replyContent, comment.id);
      //  Zustand Store의 createComment 함수 호출해서
      //  파라미터 (상품ID, 댓글내용, 부모댓글ID)
      //  comment.id가 있으면 대댓글로 처리됨
      setReplyContent("");
      // 입력창 초기화
      setIsReplying(false);
      //  답글 작성 보드 종료
      alert("✅ 답글이 작성되었습니다!");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div className={`${level > 0 ? "ml-12 mt-3" : ""}`}>
      <div
        className={`bg-gray-50 rounded-lg p-4 ${
          level > 0 ? "border-l-4 border-primary/40" : ""
        }`}
      >
        {/* 댓글 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* 프로필 이미지 */}
            <img
              src={comment.profileImage || defaultProfileImage}
              alt={`${comment.userNickname} 프로필`}
              className={`${
                level > 0 ? "w-8 h-8" : "w-10 h-10"
              } rounded-full object-cover border-2 border-primary/20 shadow-md flex-shrink-0`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultProfileImage;
              }}
            />

            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-800 text-sm">
                  {comment.userNickname}
                </p>
                {level > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    답글
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{comment.createdAt}</p>
            </div>
          </div>

          {/* 수정/삭제 버튼 (본인만) */}
          {isOwner && !isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                <i className="bi bi-pencil mr-1"></i>수정
              </button>
              <button
                onClick={handleDelete}
                className="text-xs text-red-500 hover:text-red-700"
              >
                <i className="bi bi-trash mr-1"></i>삭제
              </button>
            </div>
          )}
        </div>

        {/* 댓글 내용 */}
        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              text-sm
            />
            <div className="flex gap-2 mt-2">
              <Button
                onClick={handleUpdate}
                variant="primary"
                className="text-xs px-3 py-1"
              >
                저장
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                variant="secondary"
                className="text-xs px-3 py-1"
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 mb-3 whitespace-pre-wrap text-sm">
            {comment.content}
          </p>
        )}

        {/* 답글 버튼 (최상위 댓글만) */}
        {level === 0 && !isEditing && isAuthenticated && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-xs text-gray-600 hover:text-primary font-medium"
          >
            <i className="bi bi-reply mr-1"></i>
            답글 {replies.length > 0 && `(${replies.length})`}
          </button>
        )}

        {/* 답글 작성 폼 */}
        {isReplying && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답글을 입력하세요..."
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary resize-none text-sm"
            />
            <div className="flex gap-2 mt-2">
              <Button
                onClick={handleReply}
                variant="primary"
                className="text-xs px-3 py-1"
              >
                답글 작성
              </Button>
              <Button
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent("");
                }}
                variant="secondary"
                className="text-xs px-3 py-1"
              >
                취소
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 대댓글 목록 */}
      {replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              productId={productId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
