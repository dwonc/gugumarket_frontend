// React Hooks import
import { useEffect, useState, useCallback } from "react";
// 라우팅 관련: URL 파라미터 읽기, 페이지 이동
import { useParams, useNavigate } from "react-router-dom";
// 상품 전역 상태 관리 store
import { useProductStore } from "../../stores/productStore";
// 인증(로그인) 상태 확인 Hook
import useAuth from "../../hooks/useAuth";
// 상품 권한 체크 Hook (판매자인지, 수정 가능한지 등)
import useProductPermission from "../../hooks/useProductPermission";
// 신고 관련 API
import reportApi from "../../api/reportApi";
// 기본 API 요청 (axios)
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
// 신고 모달 컴포넌트
import ReportModal from "../../components/report/ReportModal";
// 채팅 시작 유틸리티 함수
import { handleStartChatModal } from "../../utils/handleStartChatModal";
import ChatRoomModal from "../../components/chat/ChatRoomModal";

const ProductDetailPage = () => {
    // URL에서 상품 ID 가져오기 (예: /products/123 → id = "123")
    const { id } = useParams();
    // 페이지 이동 함수
    const navigate = useNavigate();
    // 현재 로그인 상태 및 사용자 정보
    const { isAuthenticated = false, user = null } = useAuth() || {};

    // 상품 관련 전역 상태 및 함수들
    const productStore = useProductStore();
    const {
        product,              // 상품 데이터
        loading,              // 로딩 상태
        fetchProduct,         // 상품 정보 가져오기 함수
        toggleLike,           // 찜하기 토글 함수
        updateProductStatus,  // 상품 상태 변경 함수
        deleteProduct,        // 상품 삭제 함수
    } = productStore;

    // 상품 권한 체크 (판매자인지, 관리자인지, 수정 가능한지)
    const { isSeller, isAdmin, canEdit } = useProductPermission(
        isAuthenticated,
        user,
        product
    );

    // 상태 관리
    const [isShareModalOpen, setIsShareModalOpen] = useState(false); // 공유 모달 열림/닫힘
    const [reportCount, setReportCount] = useState(0); // 신고 수
    const [sellerLevelInfo, setSellerLevelInfo] = useState(null); // 판매자 등급 정보
    const [isReportModalOpen, setIsReportModalOpen] = useState(false); // 신고 모달 열림/닫힘
    const [chatRoomId, setChatRoomId] = useState(null); // 채팅방 ID
    const [isChatOpen, setChatOpen] = useState(false); // 채팅 모달 열림/닫힘

    // 채팅 모달 열기 함수
    const openChatModal = (roomId) => {
        setChatRoomId(roomId); // 채팅방 ID 설정
        setChatOpen(true);     // 채팅 모달 열기
    };

    // 판매자 등급 정보를 서버에서 가져오는 함수
    // useCallback으로 메모이제이션 (불필요한 재생성 방지)
    const loadSellerLevel = useCallback(async (sellerId) => {
        try {
            // 판매자 등급 정보 요청
            const response = await api.get(`/api/users/${sellerId}/level`);
            if (response.data.success) {
                setSellerLevelInfo(response.data.levelInfo); // 등급 정보 저장
            }
        } catch (error) {
            console.error("판매자 등급 정보 로드 실패:", error);
        }
    }, []); // 의존성 없음 = 컴포넌트 생성 시 한 번만 함수 생성

    // 상품 정보 불러오기 (컴포넌트 마운트 시 또는 id 변경 시)
    useEffect(() => {
        if (id) {
            // 상품 데이터 가져오기
            fetchProduct(id)
                .then((data) => {
                    const productData = data.product || data;
                    if (productData) {
                        // 신고 수 설정
                        setReportCount(data.reportCount || 0);
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
    // id, fetchProduct, loadSellerLevel이 변경될 때마다 실행

    // 상품 상태 변경 핸들러 (판매중 → 판매완료 등)
    const handleStatusSave = async (selectedStatus) => {
        try {
            // 상태 변경 API 호출
            const result = await updateProductStatus(
                product.productId,
                selectedStatus
            );
            if (result.success) {
                alert("✅ 상태가 변경되었습니다.");
                fetchProduct(id); // 변경된 정보 다시 가져오기
            }
        } catch (error) {
            alert("❌ " + error.message);
        }
    };

    // 상품 삭제 핸들러
    const handleDelete = async () => {
        try {
            await deleteProduct(product.productId); // 상품 삭제 API 호출
            alert("✅ 상품이 삭제되었습니다.");
            navigate("/mypage"); // 마이페이지로 이동
        } catch (error) {
            alert(
                `❌ 상품 삭제 중 오류가 발생했습니다: ${
                    error.message || "알 수 없는 오류"
                }`
            );
        }
    };

    // 공유하기 버튼 클릭 핸들러
    const handleShare = () => {
        setIsShareModalOpen(true); // 공유 모달 열기
    };

    // 찜하기 버튼 클릭 핸들러
    const handleLikeToggle = () => {
        // 로그인 체크
        if (!isAuthenticated) {
            alert("로그인이 필요합니다.");
            navigate("/login"); // 로그인 페이지로 이동
            return;
        }
        toggleLike(product.productId); // 찜하기 토글 (찜 추가/해제)
    };

    // 신고하기 버튼 클릭 핸들러
    const handleReport = () => {
        // 로그인 체크
        if (!isAuthenticated) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }
        setIsReportModalOpen(true); // 신고 모달 열기
    };

    // 신고 성공 후 실행되는 함수
    const handleReportSuccess = () => {
        fetchProduct(id); // 상품 정보 다시 가져오기 (신고 수 업데이트)
    };

    // 로딩 중일 때 화면
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loading text="상품 정보를 불러오는 중..." />
            </div>
        );
    }

    // 에러 발생 시 화면
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

    // 상품이 없을 때 화면
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

    // 정상적으로 상품 정보를 불러왔을 때 메인 화면
    return (
        <div className="min-h-screen bg-gray-50">
            {/* SEO를 위한 메타 태그 */}
            <ProductMetaTags product={product} />
            <Navbar />
            {/* 상품 경로 표시 (홈 > 카테고리 > 상품명) */}
            <ProductBreadcrumb product={product} />

            {/* Product Detail */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Product Images - 상품 이미지 갤러리 */}
                    <ProductImageGallery product={product} />

                    {/* Right: Product Info - 상품 정보 */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            {/* 판매자 정보 + 등급 표시 */}
                            <div className="mb-6 pb-6 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">판매자</p>
                                        <p className="text-lg font-bold text-gray-800">
                                            {product.sellerNickname || product.sellerName || "판매자"}
                                        </p>
                                    </div>
                                    {/* 판매자 등급 배지 (🥚알, 🐣아기새 등) */}
                                    {sellerLevelInfo && (
                                        <UserLevelBadge levelInfo={sellerLevelInfo} size="md" />
                                    )}
                                </div>

                                {/* 판매자가 아닌 경우에만 문의하기 버튼 표시 */}
                                {!isSeller && (
                                    <button
                                        onClick={() =>
                                            // 채팅 시작 함수 호출
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

                            {/* 상품 정보 (가격, 상태 등) */}
                            <ProductInfoSection
                                product={product}
                                isAdmin={isAdmin}
                                reportCount={reportCount}
                            />

                            {/* 액션 버튼들 (수정, 삭제, 찜하기, 공유하기, 신고하기) */}
                            <ProductActionSection
                                product={product}
                                canEdit={canEdit}
                                isAdmin={isAdmin}
                                isSeller={isSeller}
                                onStatusSave={handleStatusSave}   // 상태 변경
                                onDelete={handleDelete}           // 삭제
                                onLikeToggle={handleLikeToggle}  // 찜하기
                                onShare={handleShare}             // 공유
                                onReport={handleReport}           // 신고
                            />
                        </div>
                    </div>
                </div>

                {/* 상품 상세 설명 */}
                <ProductDescription product={product} />
                {/* 댓글 섹션 */}
                <CommentSection productId={product.productId} />
            </div>

            {/* 공유 모달 */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                product={product}
            />

            {/* 신고 모달 */}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                productId={product.productId}
                onSuccess={handleReportSuccess} // 신고 성공 시 콜백
            />

            {/* 채팅 모달 */}
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