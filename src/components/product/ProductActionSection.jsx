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
}) => {
  if (!product) return null;

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
          <BuyerActionButtons product={product} onLikeToggle={onLikeToggle} />
        )}
      </div>

      {/* Share & Report */}
      <div className="flex gap-3 mt-4">
        <Button onClick={onShare} variant="secondary" className="flex-1">
          <i className="bi bi-share mr-2"></i>공유하기
        </Button>
        <Button variant="secondary" className="flex-1">
          <i className="bi bi-flag mr-2"></i>신고하기
        </Button>
      </div>
    </>
  );
};

export default ProductActionSection;
