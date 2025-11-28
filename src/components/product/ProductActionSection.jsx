import Button from "../common/Button";
import SellerActionButtons from "./SellerActionButtons";
import BuyerActionButtons from "./BuyerActionButtons";

const ProductActionSection = ({
  product, //  상품 정보 객체(제목, 가격, 상태 등)
  canEdit, //  수정 권한 여부(판매자 or 관리자인 경우 TRUE)
  isAdmin, //  관리자 여부
  isSeller, //  판매자 여부
  onStatusSave, //  상품 상태 변경 핸들러(판매중 or 예약중 or 판매완료 등)
  onDelete, //  상품 삭제 핸들러
  onLikeToggle, // 좋아요 토글 핸들러 (좋아요 추가 / 취소)
  onShare, // 공유하기 핸들러  (카톡, 페북, 인스타 URL 복사 등)
  onReport, //  신고하기 핸들러 추가 (부적절한 상품 신고)
  isLiked, // 좋아요 상태
  likeCount, // 좋아요 총 개수
}) => {
  if (!product) return null;
  //  상품 정보가 없으면 Null 반환)   ex) 데이터 로딩 중이거나 에러가 발생한 경우

  const effectiveIsLiked =
    typeof isLiked === "boolean" ? isLiked : product.isLiked;

  const effectiveLikeCount =
    typeof likeCount === "number" ? likeCount : product.likeCount || 0;

  return (
    <>
      {/* Action Buttons */}
      <div className="mt-6">
        {canEdit ? (
          <SellerActionButtons
            product={product}
            isAdmin={isAdmin}
            isSeller={isSeller}
            onStatusSave={onStatusSave}
            onDelete={onDelete}
          />
        ) : (
          <BuyerActionButtons
            product={product}
            onLikeToggle={onLikeToggle}
            isLiked={effectiveIsLiked}
            likeCount={effectiveLikeCount}
          />
        )}
      </div>

      {/* Share & Report */}
      <div className="flex gap-3 mt-4">
        <Button onClick={onShare} variant="secondary" className="flex-1">
          <i className="bi bi-share mr-2"></i>공유하기
        </Button>
        {/* ✅ 신고하기 버튼에 onClick 핸들러 연결 */}
        <Button onClick={onReport} variant="secondary" className="flex-1">
          <i className="bi bi-flag mr-2"></i>신고하기
        </Button>
      </div>
    </>
  );
};

export default ProductActionSection;
