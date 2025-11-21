import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link,useLocation } from "react-router-dom";
import api from "../../api/axios";
import useAuthStore from "../../stores/authStore";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button"; // Button.jsx 사용
import UserProfile from "../../components/user/UserProfile";
// DTO 필드에 맞춘 타입 정의 (참고용)
// const TransactionResponseDto = {
//     productId, productTitle, productPrice, productImage,
//     status (String), transactionDate (LocalDateTime)
// };

// ✅ 백엔드 기본 URL 설정 (axios.js와 동일하게 환경 변수 사용)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// primary: #6B4F4F 색상을 배경색으로 사용한 SVG Data URI
const NO_IMAGE_PLACEHOLDER = 'data:image/svg+xml;base64,' +
    btoa('<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="100%" height="100%" fill="#6B4F4F"/>' + // primary 색상
        '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
        'font-family="sans-serif" font-size="16" fill="#FFFFFF">No Image</text>' +
        '</svg>');

const MyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuthStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("purchases");

    // Zustand에서 가져온 사용자 정보가 없거나 인증되지 않았으면 리디렉션
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    // fetchData에 logout과 navigate 의존성 추가
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // MypageController.java의 @GetMapping("/") 엔드포인트 호출
            const response = await api.get("/mypage");
            if (response.data.success) {
                setData(response.data);
            } else {
                setError(response.data.message || "마이페이지 정보를 불러오는데 실패했습니다.");
            }
        } catch (err) {
            console.error("마이페이지 데이터 로드 오류:", err);
            if (err.response?.status === 401) {
                // 토큰 만료 등 인증 오류 시 로그아웃 처리
                logout();
                navigate("/login");
                setError("세션이 만료되었습니다. 다시 로그인해주세요.");
            } else {
                setError("서버와 통신 중 오류가 발생했습니다.");
            }
        } finally {
            setLoading(false);
        }
    }, [logout, navigate]); // ✅ 의존성 추가: logout, navigate

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        } else if (user === null && !isAuthenticated && !loading) {
            // 만약 로그아웃 상태인데 마이페이지에 접근한 경우 리디렉션 처리
            navigate('/login');
        }
    }, [isAuthenticated, fetchData, navigate,location.state, user, loading]);

    // Tab 전환 함수 (mypage.html의 showTab 로직 반영)
    const showTab = (tabName) => {
        setActiveTab(tabName);
        // 스크롤 자동 조정은 필요하다면 useEffect 등에서 처리
    };

    // 금액 포맷 함수
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ko-KR').format(price);
    };

    // 날짜 포맷 함수
    const formatDate = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        const date = new Date(dateTimeString);
        // 'YYYY-MM-DD HH:mm' 포맷
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace('. ', '-').replace('. ', '-').replace('.', '').replace(' ', ' ');
    };

    // 트랜잭션 상태를 디자인에 맞게 변환하는 함수
    const getStatusBadge = (statusName, isSeller) => {
        const statusMap = {
            // 구매내역 (Buyer)
            'PENDING': { text: '입금 대기', class: 'bg-yellow-100 text-yellow-700' },
            'COMPLETED': { text: '구매 확정', class: 'bg-green-100 text-green-700' }, // mypage.html 구매내역
            'CANCELLED': { text: '거래 취소', class: 'bg-red-100 text-red-700' },
            // 판매내역 (Seller)
            'SELLER_PENDING': { text: '입금 확인 대기', class: 'bg-orange-100 text-orange-700' }, // mypage.html 판매내역
            'SELLER_COMPLETED': { text: '판매 완료', class: 'bg-blue-100 text-blue-700' }, // mypage.html 판매내역
        };

        // MypageController의 DTO는 status.name()을 반환함.
        const key = isSeller ? `SELLER_${statusName}` : statusName;
        const defaultStatus = { text: statusName, class: 'bg-gray-100 text-gray-700' };

        return statusMap[key] || statusMap[statusName] || defaultStatus;
    };

    // 찜 해제 (mypage.html의 JS 로직 반영)
    const handleUnlike = useCallback(async (productId) => {
        if (!window.confirm('찜 목록에서 제거하시겠습니까?')) return;

        // ✅ CSRF 토큰 가져오기 및 헤더 설정
        const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

        const headers = {
            // Content-Type은 axios.js에 기본 설정되어 있지만, 명시적으로 추가
            'Content-Type': 'application/json',
        };

        if (csrfToken && csrfHeader) {
            headers[csrfHeader] = csrfToken; // 스프링 시큐리티용 CSRF 헤더 추가
        }

        try {
            // LikeController의 실제 경로: /api/products/{productId}/like
            const res = await api.post(`/api/products/${productId}/like`, null, { headers: headers });

            if (res.status === 200) {
                // UI에서 즉시 제거
                const updatedLikes = data.likes.filter(like => like.productId !== productId);
                setData({ ...data, likes: updatedLikes });
                alert("찜 목록에서 상품을 제거했습니다.");
            }
        } catch (err) {
            console.error('찜 해제 오류:', err);
            // 401 에러 처리 (Axios Interceptor에서 1차 처리 후, 최종 실패 시)
            if (err.response?.status === 401) {
                alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
                logout();
                navigate('/login');
            } else {
                alert('찜 해제 중 오류가 발생했습니다.');
            }
        }
    }, [data, logout, navigate]); // ✅ 의존성 추가: data, logout, navigate

    // 입금 확인 처리 함수 (mypage.html의 JS 로직 반영)
    const confirmPayment = useCallback(async (transactionId) => {
        if (!window.confirm('입금을 확인하셨습니까? 거래를 완료 처리합니다.')) return;

        // ✅ CSRF 토큰 가져오기 (POST 요청이므로 추가)
        const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

        const headers = {
            'Content-Type': 'application/json',
        };

        if (csrfToken && csrfHeader) {
            headers[csrfHeader] = csrfToken;
        }

        try {
            // TransactionController의 실제 경로: /api/transactions/{transactionId}/complete
            const response = await api.post(`/api/transactions/${transactionId}/complete`, null, { headers: headers });

            if (response.status === 200) {
                alert('거래가 완료되었습니다.');
                // 데이터 새로고침
                fetchData();
            } else {
                alert('처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('입금 확인 오류:', error);
            // 401 에러 처리
            if (error.response?.status === 401) {
                alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
                logout();
                navigate('/login');
            } else {
                alert('처리 중 오류가 발생했습니다.');
            }
        }
    }, [fetchData, logout, navigate]); // ✅ 의존성 추가: fetchData, logout, navigate

    // 알림 읽음 처리 (mypage.html의 JS 로직 반영)
    const markAsRead = useCallback(async (notificationId) => {
        // ✅ CSRF 토큰 가져오기 (POST 요청이므로 추가)
        const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

        const headers = {
            'Content-Type': 'application/json',
        };

        if (csrfToken && csrfHeader) {
            headers[csrfHeader] = csrfToken;
        }

        try {
            // NotificationController의 실제 경로: /api/notifications/{notificationId}/read
            // PATCH 요청 사용
            await api.patch(`/api/notifications/${notificationId}/read`, null, { headers: headers });
            // UI 업데이트
            setData(prevData => {
                const updatedNotifications = prevData.recentNotifications.map(notif =>
                    notif.notificationId === notificationId ? { ...notif, isRead: true } : notif
                );
                return {
                    ...prevData,
                    recentNotifications: updatedNotifications,
                    unreadCount: prevData.unreadCount > 0 ? prevData.unreadCount - 1 : 0
                };
            });
        } catch (error) {
            console.error('알림 읽음 처리 오류:', error);
            if (error.response?.status === 401) {
                alert('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
                logout();
                navigate('/login');
            }
        }
    }, [logout, navigate]);


    // 로딩 상태
    if (loading || !data ) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <Loading size="lg" text="마이페이지 정보를 불러오는 중..." />
                </main>
                <Footer />
            </div>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ErrorMessage message={error} type="error" />
                    <Button onClick={fetchData} className="mt-4">다시 시도</Button>
                </main>
                <Footer />
            </div>
        );
    }

    // 데이터 구조 분해 (MypageController.java의 응답 구조 사용)
    const { user:apiUser,purchases, sales, likes, recentNotifications, unreadCount } = data;

    // 이미지 경로 생성 헬퍼 함수
    const getProductImageUrl = (imagePath) => {
        // ✅ 이미지 경로가 없거나 빈 문자열이면 플레이스홀더 반환
        if (!imagePath || imagePath.trim() === '') {
            return NO_IMAGE_PLACEHOLDER;
        }
        // ✅ 이미지 경로가 있다면 백엔드 URL을 붙여서 절대 경로로 요청
        return `${API_BASE_URL}${imagePath}`;
    };

    // --- 탭 콘텐츠 렌더링 함수 ---

    // 1. 구매내역 탭 렌더링
    const renderPurchases = () => (
        <div id="content-purchases" className="tab-content">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">구매내역</h2>
            <div className="space-y-4">
                {purchases && purchases.length > 0 ? (
                    purchases.map((transaction) => {
                        const badge = getStatusBadge(transaction.status, false);
                        return (
                            // ✅ Link로 감싸서 거래 상세 페이지로 이동하도록 수정
                            <Link to={`/transactions/${transaction.transactionId}`} key={transaction.transactionId} className="block">
                                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                                    <div className="flex gap-4 items-center">
                                        {/* 상품 이미지: getProductImageUrl 헬퍼 함수 적용 */}
                                        <img
                                            src={getProductImageUrl(transaction.productImage)}
                                            alt={transaction.productTitle}
                                            className="w-32 h-32 object-cover rounded-lg"
                                            onError={(e) => {e.target.onerror = null; e.target.src=NO_IMAGE_PLACEHOLDER;}}
                                        />

                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 mb-2">{transaction.productTitle}</h3>
                                            <p className="text-2xl font-bold text-primary mb-2">
                                                {formatPrice(transaction.productPrice)}원
                                            </p>
                                            <p className="text-gray-600 text-sm mb-1">
                                                판매자: <span className="font-medium">{transaction.sellerName}</span>
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                구매일: {formatDate(transaction.transactionDate)}
                                            </p>
                                        </div>

                                        <div className="flex flex-col justify-between items-end h-full">
                                            {/* 상태 배지 */}
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
                                            {badge.text}
                                        </span>

                                            {/* 상태에 따른 액션 버튼 */}
                                            <div className="mt-3 space-y-2">
                                                {transaction.status === 'COMPLETED' && ( // 구매 확정 상태
                                                    // Link로 감싸지 않은 버튼은 클릭 이벤트가 따로 작동해야 함.
                                                    // 여기서는 버튼을 div 안에 두어 Link 클릭을 방해하지 않게 합니다.
                                                    <button
                                                        className="text-gray-600 hover:text-primary text-sm w-full text-right"
                                                        onClick={(e) => e.preventDefault()} // Link 동작 방지
                                                    >
                                                        <i className="bi bi-chat-dots mr-1"></i>문의하기
                                                    </button>
                                                )}
                                                {transaction.status === 'PENDING' && ( // 입금 대기 상태
                                                    <button
                                                        className="text-blue-600 hover:text-blue-800 text-sm w-full text-right font-medium"
                                                        onClick={(e) => e.preventDefault()} // Link 동작 방지
                                                    >
                                                        <i className="bi bi-credit-card mr-1"></i>입금 정보 보기
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    /* Empty State */
                    <div className="text-center py-16">
                        <i className="bi bi-bag-x text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">구매내역이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );

// 2. 판매내역 탭 렌더링
    const renderSales = () => (
        <div id="content-sales" className="tab-content">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">판매내역</h2>
            <div className="space-y-4">
                {sales && sales.length > 0 ? (
                    sales.map((transaction) => {
                        const badge = getStatusBadge(transaction.status, true);
                        return (
                            // ✅ Link로 감싸서 거래 상세 페이지로 이동하도록 수정
                            <Link to={`/transactions/${transaction.transactionId}`} key={transaction.transactionId} className="block">
                                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                                    <div className="flex gap-4 items-center">
                                        {/* 상품 이미지: getProductImageUrl 헬퍼 함수 적용 */}
                                        <img
                                            src={getProductImageUrl(transaction.productImage)}
                                            alt={transaction.productTitle}
                                            className="w-32 h-32 object-cover rounded-lg"
                                            onError={(e) => {e.target.onerror = null; e.target.src=NO_IMAGE_PLACEHOLDER;}}
                                        />

                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 mb-2">{transaction.productTitle}</h3>
                                            <p className="text-2xl font-bold text-primary mb-2">
                                                {formatPrice(transaction.productPrice)}원
                                            </p>
                                            <p className="text-gray-600 text-sm mb-1">
                                                구매자: <span className="font-medium">{transaction.buyerName}</span>
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                판매일: {formatDate(transaction.transactionDate)}
                                            </p>
                                        </div>

                                        <div className="flex flex-col justify-between items-end h-full">
                                            {/* 상태 배지 */}
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
                                            {badge.text}
                                        </span>

                                            {/* 상태에 따른 액션 버튼 */}
                                            <div className="mt-3 space-y-2">
                                                {transaction.status === 'COMPLETED' && ( // 판매 완료 상태
                                                    <button
                                                        className="text-gray-600 hover:text-primary text-sm w-full text-right"
                                                        onClick={(e) => e.preventDefault()} // Link 동작 방지
                                                    >
                                                        <i className="bi bi-chat-dots mr-1"></i>문의하기
                                                    </button>
                                                )}
                                                {transaction.status === 'PENDING' && ( // 입금 확인 대기 상태
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault(); // Link 동작 방지
                                                            confirmPayment(transaction.transactionId);
                                                        }}
                                                        className="bg-primary hover:bg-secondary text-white text-sm px-4 py-2 rounded-lg w-full font-medium transition-all"
                                                    >
                                                        <i className="bi bi-check-circle mr-1"></i>입금 확인하기
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    /* Empty State */
                    <div className="text-center py-16">
                        <i className="bi bi-receipt text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">판매내역이 없습니다.</p>
                        {/* 상품 등록 페이지로 이동 */}
                        <Button onClick={() => navigate('/products/write')} variant="primary" size="md" className="mt-4">
                            상품 등록하기
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    // 3. 찜한 목록 탭 렌더링
    const renderLikes = () => (
        <div id="content-likes" className="tab-content">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">찜한 목록</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {likes && likes.length > 0 ? (
                    likes.map((like) => (
                        <div key={like.likeId} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                            <div className="relative">
                                <Link to={`/products/${like.productId}`}>
                                    {/* 상품 이미지: getProductImageUrl 헬퍼 함수 적용 */}
                                    <img
                                        src={getProductImageUrl(like.productImage)}
                                        alt={like.productTitle}
                                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {e.target.onerror = null; e.target.src=NO_IMAGE_PLACEHOLDER;}}
                                    />
                                </Link>
                                {/* 찜 해제 버튼 */}
                                <button
                                    type="button"
                                    onClick={() => handleUnlike(like.productId)}
                                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white toggle-like-btn"
                                >
                                    <i className="bi bi-heart-fill text-red-500 text-xl"></i>
                                </button>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{like.productTitle}</h3>
                                <p className="text-xl font-bold text-primary mb-2">
                                    {formatPrice(like.productPrice)}원
                                </p>
                                <p className="text-sm text-gray-500">
                                    <i className="bi bi-geo-alt"></i>
                                    {/* DTO에 주소 필드가 없으므로 임시로 빈 값 */}
                                    <span className="ml-1">위치 정보 없음</span>
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    /* Empty State */
                    <div className="col-span-4 text-center py-16">
                        <i className="bi bi-heart text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">찜한 상품이 없습니다.</p>
                        <Button onClick={() => navigate('/')} variant="primary" size="md" className="mt-4">
                            상품 둘러보기
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    // 4. 알림 탭 렌더링
    const renderNotifications = () => (
        <div id="content-notifications" className="tab-content">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">알림</h2>
                <Link to="/mypage/notifications" className="text-primary hover:text-secondary font-medium">
                    전체 보기 <i className="bi bi-arrow-right"></i>
                </Link>
            </div>

            <div className="space-y-3">
                {recentNotifications && recentNotifications.length > 0 ? (
                    recentNotifications.map((notification) => {
                        let iconClass;
                        let iconColor;

                        switch (notification.type) { // NotificationType → String으로 변환되어 있음
                            case 'COMMENT':
                                iconClass = 'bi-chat-dots';
                                iconColor = 'text-primary';
                                break;
                            case 'LIKE':
                                iconClass = 'bi-heart-fill';
                                iconColor = 'text-red-500';
                                break;
                            case 'PURCHASE':
                                iconClass = 'bi-cart-fill';
                                iconColor = 'text-green-600';
                                break;
                            case 'TRANSACTION':
                                iconClass = 'bi-check-circle-fill';
                                iconColor = 'text-blue-600';
                                break;
                            default:
                                iconClass = 'bi-bell';
                                iconColor = 'text-gray-500';
                        }

                        return (
                            <div key={notification.notificationId} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
                                <Link to={notification.url.replace('/product/', '/products/').replace('/transaction/', '/transactions/')} onClick={() => markAsRead(notification.notificationId)} className="block">
                                    <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div className="flex-shrink-0">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-gray-100' : 'bg-primary/10'}`}>
                                                <i className={`${iconClass} text-xl ${iconColor}`}></i>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <p className={`mb-1 ${notification.isRead ? 'text-gray-600' : 'text-gray-800 font-semibold'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(notification.createdDate)}
                                            </p>
                                        </div>
                                        {/* Badge */}
                                        {!notification.isRead && (
                                            <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        );
                    })
                ) : (
                    /* Empty State */
                    <div className="text-center py-16">
                        <i className="bi bi-bell-slash text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">알림이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );

    // --- 메인 렌더링 ---
    return (
        <>
            <Navbar />

            {/* Main Content (mypage.html 반영) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Success Message (컴포넌트 내에서는 사용하지 않음, 필요 시 Props로 받아야 함) */}

                {/* User Info Card */}
                <UserProfile user={apiUser} />

                {/* Tabs Navigation */}
                <div className="bg-white rounded-t-2xl shadow-lg">
                    <div className="flex border-b border-gray-200">
                        {/* active-tab 스타일: background-color: var(--primary); color: white; */}
                        {[{ name: 'purchases', icon: 'bi-bag', label: '구매내역' },
                            { name: 'sales', icon: 'bi-receipt', label: '판매내역' },
                            { name: 'likes', icon: 'bi-heart', label: '찜한 목록' },
                            { name: 'notifications', icon: 'bi-bell', label: '알림', count: unreadCount }].map(tab => (
                            <button
                                key={tab.name}
                                onClick={() => showTab(tab.name)}
                                className={`flex-1 py-4 px-6 font-semibold transition-all relative ${
                                    activeTab === tab.name
                                        ? 'active-tab bg-primary text-white' // mypage.html의 active-tab 클래스 반영
                                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                                }`}
                            >
                                <i className={`${tab.icon} mr-2`}></i>{tab.label}
                                {tab.count > 0 && (
                                    <span
                                        className={`absolute top-2 right-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${activeTab === tab.name ? 'bg-white text-red-500' : 'bg-red-500'}`}
                                        style={{ right: '1rem' }} // mypage.html의 right-2 위치 조정
                                    >
                      {tab.count}
                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Contents */}
                <div className="bg-white rounded-b-2xl shadow-lg p-8">
                    {activeTab === 'purchases' && renderPurchases()}
                    {activeTab === 'sales' && renderSales()}
                    {activeTab === 'likes' && renderLikes()}
                    {activeTab === 'notifications' && renderNotifications()}
                </div>
            </div>

            <Footer />
        </>
    );
};

export default MyPage;