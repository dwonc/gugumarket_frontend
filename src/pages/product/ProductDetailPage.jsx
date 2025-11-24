import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "../../stores/productStore";
import useAuth from "../../hooks/useAuth";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import ShareModal from "@/components/product/ShareModal.jsx";
import ProductMetaTags from "@/components/product/ProductMetaTags.jsx";

// ✅ 백엔드 기본 URL 설정 (MyPage.jsx와 동일)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// primary: #6B4F4F 색상을 배경색으로 사용한 SVG Data URI (MyPage.jsx와 동일)
const NO_IMAGE_PLACEHOLDER = 'data:image/svg+xml;base64,' +
    btoa('<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="100%" height="100%" fill="#6B4F4F"/>' + // primary 색상
        '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
        'font-family="sans-serif" font-size="16" fill="#FFFFFF">No Image</text>' +
        '</svg>');

// ✅ 이미지 경로 생성 헬퍼 함수 최종 수정: 절대 URL 중복 방지

const getProductImageUrl = (imagePath) => {
    // 1. 이미지가 없으면 플레이스홀더 반환
    if (!imagePath || imagePath.trim() === '') {
        return NO_IMAGE_PLACEHOLDER;
    }

    // 2. 🔥 수정된 로직: 경로가 'http://' 또는 'https://'로 시작하면
    //    이미 절대 경로이므로 그대로 반환합니다.
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // 3. (만약 서버가 상대 경로를 보낸다면) Base URL 결합 로직 유지
    //    API_BASE_URL의 끝 슬래시를 제거 (있든 없든 제거)
    const baseUrl = API_BASE_URL.replace(/\/$/, "");

    //    imagePath의 시작 슬래시를 제거 (있든 없든 제거)
    const cleanedPath = imagePath.replace(/^\//, "");

    // 4. 결합
    return `${baseUrl}/${cleanedPath}`;
};


const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated = false, user = null } = useAuth() || {};

    const productStore = useProductStore(); // 🌟 store 전체를 가져와서 ESLint 경고 해결

    const {
        product,
        loading,
        fetchProduct,
        toggleLike,
        updateProductStatus,
        deleteProduct,
    } = productStore; // error를 구조 분해 할당에서 제외

    const [selectedImage, setSelectedImage] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isShareModalOpen,setIsShareModalOpen] = useState(false);

    // 상품 정보 불러오기
    useEffect(() => {
        if (id) {
            console.log("요청할 상품 ID:", id);

            fetchProduct(id)
                .then((data) => {
                    const productData = data.product || data;

                    if (productData) {
                        console.log("✅ 서버에서 받은 mainImage:", productData.mainImage); // ✅ 이 로그를 추가
                        setSelectedImage(productData.mainImage);
                        setSelectedStatus(productData.status);
                        setIsLiked(data.isLiked || false);
                        setLikeCount(data.likeCount || 0);
                    }
                })
                .catch((err) => {
                    console.error("상품 로딩 실패:", err);
                });
        }
    }, [id, fetchProduct]);

    // 로딩 중
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loading text="상품 정보를 불러오는 중..." />
            </div>
        );
    }

    // 에러 발생 (🌟 productStore.error로 직접 접근)
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

    // 판매자 여부 확인
    const isSeller =
        isAuthenticated && user?.username === product.seller?.userName;

    // 이미지 변경
    const handleImageChange = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    // 좋아하기 토글
    const handleLikeToggle = async () => {
        try {
            const result = await toggleLike(product.productId);
            if (result) {
                setIsLiked(result.isLiked);
                setLikeCount(result.likeCount);
            }
        } catch (error) {
            alert(`오류가 발생했습니다: ${error.message || error}`);
        }
    };

    // 상태 변경 저장
    const handleStatusSave = async () => {
        if (selectedStatus === product.status) {
            alert("변경된 상태가 없습니다.");
            return;
        }

        const statusText = {
            SALE: "🟢 판매중",
            RESERVED: "🟡 예약중",
            SOLD_OUT: "🔴 판매완료",
        }[selectedStatus];

        if (!confirm(`상품 상태를 "${statusText}"(으)로 변경하시겠습니까?`)) {
            setSelectedStatus(product.status);
            return;
        }

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
            setSelectedStatus(product.status);
        }
    };

    // 상품 삭제
    const handleDelete = async () => {
        if (
            !confirm(
                "정말로 이 상품을 삭제하시겠습니까?\n삭제된 상품은 복구할 수 없습니다."
            )
        ) {
            return;
        }

        try {
            await deleteProduct(product.productId);
            alert("✅ 상품이 삭제되었습니다.");
            navigate("/mypage");
        } catch (error) {
            alert(`❌ 상품 삭제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        }
    };
    // 공유하기 핸들러
    const handleShare = () => {
        setIsShareModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <productMetaTags product={product}/>

            <Navbar />

            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <a href="/" className="hover:text-primary">
                            <i className="bi bi-house-door"></i> 홈
                        </a>
                        <span className="text-xs">›</span> {/* ← 여기! */}
                        {product.categoryName && (
                            <>
                                <a
                                    href={`/?categoryId=${product.categoryId}`}
                                    className="hover:text-primary transition-colors duration-200"
                                >
                                    {product.categoryName}
                                </a>
                                <span className="text-xs">›</span> {/* ← 여기! */}
                            </>
                        )}
                        <span className="text-gray-800 font-medium">{product.title}</span>
                    </div>
                </div>
            </div>

            {/* Product Detail */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Product Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                            <img
                                // ✅ 헬퍼 함수를 사용하고 src={value || null} 패턴 적용
                                src={getProductImageUrl(selectedImage) || null}
                                alt={product.title}
                                className="w-full h-96 object-cover"
                                onError={(e) => {
                                    // ✅ 통일된 NO_IMAGE_PLACEHOLDER 및 에러 핸들링 로직 사용
                                    if (e.target.dataset.hadError) return;
                                    e.target.dataset.hadError = "true";
                                    e.target.src = NO_IMAGE_PLACEHOLDER;
                                }}
                            />
                        </div>

                        {/* Thumbnail Images */}
                        <div className="grid grid-cols-4 gap-3">
                            {/* 메인 이미지 썸네일 */}
                            <div
                                className={`bg-white rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all ${
                                    selectedImage === product.mainImage
                                        ? "ring-2 ring-primary"
                                        : ""
                                }`}
                                onClick={() => handleImageChange(product.mainImage)}
                            >
                                <img
                                    // ✅ 헬퍼 함수를 사용하고 src={value || null} 패턴 적용
                                    src={getProductImageUrl(product.mainImage) || null}
                                    alt="메인 이미지"
                                    className="w-full h-24 object-cover"
                                    onError={(e) => {
                                        // ✅ 썸네일 이미지 로드 실패 시 No Image 표시
                                        if (e.target.dataset.hadError) return;
                                        e.target.dataset.hadError = "true";
                                        e.target.src = NO_IMAGE_PLACEHOLDER;
                                    }}
                                />
                            </div>

                            {/* 추가 이미지 썸네일 */}
                            {product.productImages &&
                                Array.isArray(product.productImages) &&
                                product.productImages
                                    .filter((image) => {
                                        // ✅ 유효한 이미지만 필터링
                                        const url =
                                            typeof image === "string" ? image : image?.imageUrl;
                                        return url && url.trim() !== "";
                                    })
                                    .map((image, index) => {
                                        // ✅ 이미지 URL 안전하게 추출
                                        const imageUrl =
                                            typeof image === "string" ? image : image.imageUrl;
                                        const imageId =
                                            typeof image === "string" ? index : image.imageId;

                                        return (
                                            <div
                                                key={imageId || index}
                                                className={`bg-white rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all ${
                                                    selectedImage === imageUrl
                                                        ? "ring-2 ring-primary"
                                                        : ""
                                                }`}
                                                onClick={() => handleImageChange(imageUrl)}
                                            >
                                                <img
                                                    // ✅ 헬퍼 함수를 사용하고 src={value || null} 패턴 적용
                                                    src={getProductImageUrl(imageUrl) || null}
                                                    alt={`상품 이미지 ${index + 1}`}
                                                    className="w-full h-24 object-cover"
                                                    onError={(e) => {
                                                        // ✅ 썸네일 이미지 로드 실패 시 No Image 표시
                                                        console.error(
                                                            `이미지 ${index + 1} 로드 실패:`,
                                                            imageUrl
                                                        );
                                                        if (!e.target.dataset.errorHandled) {
                                                            e.target.dataset.errorHandled = "true";
                                                            e.target.src = NO_IMAGE_PLACEHOLDER; // 실패한 이미지 No Image로 대체
                                                        }
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            {/* Title */}
                            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                                {product.title}
                            </h1>

                            {/* Price */}
                            <div className="mb-6">
                <span className="text-4xl font-bold text-primary">
                  {product.price?.toLocaleString()}원
                </span>
                            </div>

                            {/* Product Meta Info */}
                            <div className="space-y-3 py-6 border-y border-gray-200">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">카테고리</span>
                                    <span className="font-medium">{product.category?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">상태</span>
                                    <span className="font-medium">중고</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">판매자</span>
                                    <span className="font-medium">{product.sellerNickname}</span>
                                </div>
                                {product.seller?.address && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">거래지역</span>
                                        <span className="font-medium">
                      {product.seller.address}
                    </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">조회수</span>
                                    <span className="font-medium">{product.viewCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">등록일</span>
                                    <span className="font-medium">
                    {new Date(product.createdDate).toLocaleDateString()}
                  </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6">
                                {/* 판매자인 경우 */}
                                {isSeller ? (
                                    <>
                                        {/* 상태 변경 UI */}
                                        <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                                            <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">
                          상품 상태
                        </span>
                                                <select
                                                    value={selectedStatus}
                                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                                    className="border-2 border-primary rounded-lg px-4 py-2 font-medium"
                                                >
                                                    <option value="SALE">🟢 판매중</option>
                                                    <option value="RESERVED">🟡 예약중</option>
                                                    <option value="SOLD_OUT">🔴 판매완료</option>
                                                </select>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleStatusSave}
                                            variant="primary"
                                            className="w-full mb-3"
                                        >
                                            <i className="bi bi-check-circle text-xl mr-2"></i>
                                            상태 변경 저장
                                        </Button>

                                        {/* 구매 희망자 목록 */}
                                        {product.interestedBuyers &&
                                            product.interestedBuyers.length > 0 && (
                                                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 mb-3">
                                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                            <span>
                              <i className="bi bi-people-fill mr-2"></i>구매
                              희망자 목록
                            </span>
                                                        <span className="text-sm text-blue-600">
                              총 {product.interestedBuyers.length}명
                            </span>
                                                    </h3>
                                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                                        {product.interestedBuyers.map((buyer) => (
                                                            <div
                                                                key={buyer.userId}
                                                                className="flex items-center justify-between bg-white p-3 rounded-lg hover:shadow-md transition-all"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                                                                        <i className="bi bi-person text-white"></i>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold">
                                                                            {buyer.nickname}
                                                                        </p>
                                                                        {buyer.address && (
                                                                            <p className="text-sm text-gray-500">
                                                                                <i className="bi bi-geo-alt"></i>
                                                                                {buyer.address}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                        {/* 수정/삭제 버튼 */}
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={() =>
                                                    navigate(`/products/${product.productId}/edit`)
                                                }
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                <i className="bi bi-pencil mr-1"></i>수정
                                            </Button>
                                            <Button
                                                onClick={handleDelete}
                                                variant="danger"
                                                className="flex-1"
                                            >
                                                <i className="bi bi-trash mr-1"></i>삭제
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    /* 일반 사용자인 경우 */
                                    <>
                                        {/* 판매완료/예약중 표시 */}
                                        {product.status === "SOLD_OUT" && (
                                            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-center">
                                                <p className="text-red-700 font-bold text-lg">
                                                    🔴 판매완료된 상품입니다
                                                </p>
                                            </div>
                                        )}

                                        {product.status === "RESERVED" && (
                                            <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
                                                <p className="text-yellow-700 font-bold text-lg">
                                                    🟡 예약중인 상품입니다
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            {/* 찜하기 버튼 */}
                                            <button
                                                onClick={handleLikeToggle}
                                                disabled={product.status === "SOLD_OUT"}
                                                className={`flex-1 border-2 font-bold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                                                    isLiked
                                                        ? "bg-red-500 text-white border-red-500"
                                                        : "bg-white text-primary border-primary hover:bg-primary hover:text-white"
                                                } ${
                                                    product.status === "SOLD_OUT"
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                }`}
                                            >
                                                <i
                                                    className={`text-xl ${
                                                        isLiked ? "bi bi-heart-fill" : "bi bi-heart"
                                                    }`}
                                                ></i>
                                                <span>{isLiked ? "찜 취소" : "찜하기"}</span>
                                                <span className="ml-1 px-2 py-0.5 bg-black/10 rounded-full text-sm">
                          {likeCount}
                        </span>
                                            </button>

                                            {/* 구매하기 버튼 */}
                                            <Button
                                                onClick={() => {
                                                    if (product.status === "SOLD_OUT") {
                                                        alert("판매완료된 상품입니다.");
                                                    } else {
                                                        navigate(
                                                            `/purchase?productId=${product.productId}`
                                                        );
                                                    }
                                                }}
                                                disabled={product.status === "SOLD_OUT"}
                                                variant="primary"
                                                className={`flex-1 ${
                                                    product.status === "SOLD_OUT"
                                                        ? "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400"
                                                        : ""
                                                }`}
                                            >
                                                <i className="bi bi-cart text-xl mr-2"></i>
                                                {product.status === "SOLD_OUT"
                                                    ? "판매완료"
                                                    : "구매하기"}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Share & Report */}
                            <div className="flex gap-3 mt-4">
                                <Button onClick={handleShare} variant="secondary" className="flex-1">
                                    <i className="bi bi-share mr-2"></i>공유하기
                                </Button>
                                <Button variant="secondary" className="flex-1">
                                    <i className="bi bi-flag mr-2"></i>신고하기
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Description */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">상품 설명</h2>
                    <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                        {product.content}
                    </div>
                </div>
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