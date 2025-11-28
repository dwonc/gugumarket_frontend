import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "../../stores/productStore";
import useAuth from "../../hooks/useAuth";
import useProductPermission from "../../hooks/useProductPermission";
import useWebSocket from "../../hooks/useWebSocket"; // ✅ 추가
import reportApi from "../../api/reportApi";
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
import ReportModal from "../../components/report/ReportModal";
import { handleStartChatModal } from "../../utils/handleStartChatModal";
import ChatRoomModal from "../../components/chat/ChatRoomModal";
import useLikeStore from "../../stores/likeStore";

//  =============== ProductDetialPage 컴포넌트  ==============
//  상품 상세 페이지
//  URL에서 상품 ID 가져오기
//  로그인 및 권한 확인
//  상품 데이터 로딩
//  UI 렌더링 (이미지, 정보, 댓글등)
//  액션 핸들러 (수정, 삭제, 찜 , 공유, 신고)

const ProductDetailPage = () => {
  const { id } = useParams(); //URL 에서 상품 ID 가져오기
  const navigate = useNavigate(); // 페이지 이동 함수
  const { isAuthenticated = false, user = null } = useAuth() || {};
  // isAuthenticated = 로그인 여부 / user = 로그인한 사용자 객체

  // ✅ WebSocket 훅 추가
  const { connected, subscribeDestination } = useWebSocket();

  //Zustand사용 - 전역상태 관리 라이브러리 (데이터를 여러 컴포넌트 공유가능)
  const productStore = useProductStore();

  const {
    product, //  현재 상품 데이터
    loading, //  로딩 상태
    fetchProduct, //  상품 조회 함수
    toggleLike, //  찜하기 토글 함수
    updateProductStatus, //  상태 변경 함수
    deleteProduct, //  삭제 함수
  } = productStore;

  const {
    isLiked: isLikedInStore,
    getLikeCount,
    toggleLike: toggleLikeInStore,
  } = useLikeStore();

  const { isSeller, isAdmin, canEdit } = useProductPermission(
    // 권한 체크 (커스텀 훅 사용)  - 현재 로그인 한 사용자와 상품 판매자를 비교하여 권한 확인
    isAuthenticated, //  로그인 여부
    user, //  로그인 사용자 정보
    product //  현재 상품 정보
  );

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const [sellerLevelInfo, setSellerLevelInfo] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [isChatOpen, setChatOpen] = useState(false);

  const openChatModal = (roomId) => {
    setChatRoomId(roomId);
    setChatOpen(true);
  };

  // 판매자 등급 정보 로드
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
      fetchProduct(id)
        .then((data) => {
          const productData = data.product || data;
          if (productData) {
            setReportCount(data.reportCount || 0);
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

  // ✅ WebSocket 구독: 실시간 신고 카운트 (조건부 return 전에 위치!)
  useEffect(() => {
    if (!connected || !id) return;

    const unsubReport = subscribeDestination(
      `/topic/product/report-count/${id}`,
      (payload) => {
        const count = Number(payload);
        if (!Number.isNaN(count)) {
          console.log("🚨 신고 카운트 실시간 업데이트:", count);
          setReportCount(count);
        }
      }
    );

    return () => {
      if (typeof unsubReport === "function") unsubReport();
    };
  }, [connected, id, subscribeDestination]);

  // 상태 변경 핸들러
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

  // 상품 삭제 핸들러
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

  // 공유하기 핸들러
  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  // 찜하기 핸들러
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      await toggleLikeInStore(product.productId);
    } catch (e) {
      console.error("찜하기 실패:", e);
      alert("찜하기 처리 중 오류가 발생했습니다.");
    }
  };

  // 신고하기 핸들러
  const handleReport = () => {
    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    setIsReportModalOpen(true);
  };

  // 신고 성공 후 핸들러
  const handleReportSuccess = () => {
    // ✅ 로컬에서 즉시 +1 (WebSocket 오기 전까지 빠른 피드백)
    setReportCount((prev) => prev + 1);
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading text="상품 정보를 불러오는 중..." />
      </div>
    );
  }

  // 에러 발생
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

  // 상품 없음
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

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Product Images */}
          <ProductImageGallery product={product} />

          {/* Right: Product Info */}
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

                {!isSeller && (
                  <button
                    onClick={() =>
                      handleStartChatModal(
                        product.productId,
                        isAuthenticated,
                        openChatModal,
                        navigate
                      )
                    }
                    className="mt-3 w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
                  >
                    <i className="bi bi-chat-dots-fill mr-2"></i>
                    판매자에게 문의하기
                  </button>
                )}
              </div>

              <ProductInfoSection
                product={product}
                isAdmin={isAdmin}
                reportCount={reportCount}
              />

              <ProductActionSection
                product={product}
                canEdit={canEdit}
                isAdmin={isAdmin}
                isSeller={isSeller}
                onStatusSave={handleStatusSave}
                onDelete={handleDelete}
                onLikeToggle={handleLikeToggle}
                onShare={handleShare}
                onReport={handleReport}
                isLiked={isLikedInStore(product.productId)}
                likeCount={getLikeCount(product.productId)}
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

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        productId={product.productId}
        onSuccess={handleReportSuccess}
      />

      <ChatRoomModal
        isOpen={isChatOpen}
        chatRoomId={chatRoomId}
        onClose={() => setChatOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
