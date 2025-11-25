import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "../../stores/productStore";
import useAuth from "../../hooks/useAuth";
import useProductPermission from "../../hooks/useProductPermission";
import api from "../../api/axios";

// 공통 컴포넌트
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import CommentSection from "../../components/comment/CommentSection";

// product 관련 컴포넌트
import ProductBreadcrumb from "../../components/product/ProductBreadcrumb";
import ProductImageGallery from "../../components/product/ProductImageGallery";
import ProductInfoSection from "../../components/product/ProductInfoSection";
import ProductActionSection from "../../components/product/ProductActionSection";
import ProductDescription from "../../components/product/ProductDescription";
import ShareModal from "../../components/product/ShareModal";
import ProductMetaTags from "../../components/product/ProductMetaTags";
import UserLevelBadge from "../../components/user/UserLevelBadge";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated = false, user = null } = useAuth() || {};

  const productStore = useProductStore();
  const {
    product,
    loading,
    fetchProduct,
    toggleLike,
    updateProductStatus,
    deleteProduct,
  } = productStore;

  const { isSeller, isAdmin, canEdit } = useProductPermission(
    isAuthenticated,
    user,
    product
  );

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sellerLevelInfo, setSellerLevelInfo] = useState(null);

  // 🔥 판매자 등급 정보 로드 (useCallback으로 메모이제이션)
  const loadSellerLevel = useCallback(async (sellerId) => {
    try {
      const response = await api.get(`/api/users/${sellerId}/level`);
      if (response.data.success) {
        setSellerLevelInfo(response.data.levelInfo);
      }
    } catch (error) {
      console.error("판매자 등급 정보 로드 실패:", error);
    }
  }, []);

  // 상품 정보 불러오기
  useEffect(() => {
    if (id) {
      console.log("요청할 상품 ID:", id);

      fetchProduct(id)
        .then((data) => {
          const productData = data.product || data;
          if (productData) {
            console.log("✅ 서버에서 받은 mainImage:", productData.mainImage);

            // 판매자 등급 정보 불러오기
            if (productData.sellerId) {
              loadSellerLevel(productData.sellerId);
            }
          }
        })
        .catch((err) => {
          console.error("상품 로딩 실패:", err);
        });
    }
  }, [id, fetchProduct, loadSellerLevel]);

  const handleStatusSave = async (selectedStatus) => {
    try {
      const result = await updateProductStatus(
        product.productId,
        selectedStatus
      );
      if (result.success) {
        alert("✅ 상태가 변경되었습니다.");
        fetchProduct(id);
      }
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(product.productId);
      alert("✅ 상품이 삭제되었습니다.");
      navigate("/mypage");
    } catch (error) {
      alert(
        `❌ 상품 삭제 중 오류가 발생했습니다: ${
          error.message || "알 수 없는 오류"
        }`
      );
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading text="상품 정보를 불러오는 중..." />
      </div>
    );
  }

  if (productStore.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <ErrorMessage message={productStore.error} type="error" />
          <Button onClick={() => navigate(-1)} className="mt-4">
            <i className="bi bi-arrow-left mr-2"></i>돌아가기
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            상품을 찾을 수 없습니다
          </h2>
          <Button onClick={() => navigate("/")}>메인으로</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductMetaTags product={product} />
      <Navbar />
      <ProductBreadcrumb product={product} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductImageGallery product={product} />

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* 판매자 정보 + 등급 */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">판매자</p>
                    <p className="text-lg font-bold text-gray-800">
                      {product.sellerNickname || product.sellerName || "판매자"}
                    </p>
                  </div>
                  {sellerLevelInfo && (
                    <UserLevelBadge levelInfo={sellerLevelInfo} size="md" />
                  )}
                </div>
              </div>

              <ProductInfoSection product={product} />

              <ProductActionSection
                product={product}
                canEdit={canEdit}
                isAdmin={isAdmin}
                isSeller={isSeller}
                onStatusSave={handleStatusSave}
                onDelete={handleDelete}
                onLikeToggle={toggleLike}
                onShare={handleShare}
              />
            </div>
          </div>
        </div>

        <ProductDescription product={product} />
        <CommentSection productId={product.productId} />
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        product={product}
      />

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
