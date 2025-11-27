import Button from "../common/Button";
import SellerActionButtons from "./SellerActionButtons";
import BuyerActionButtons from "./BuyerActionButtons";

const ProductActionSection = ({
  product,
  canEdit,
  isAdmin,
  isSeller,
  onStatusSave,
  onDelete,
  onLikeToggle,
  onShare,
  onReport, // ✅ 신고하기 핸들러 추가
  isLiked, // ✅ 추가
  likeCount, // ✅ 추가
}) => {
  if (!product) return null;

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
            isLiked={effectiveIsLiked} // ✅ 여기 전달
            likeCount={effectiveLikeCount} // ✅ 여기 전달
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
