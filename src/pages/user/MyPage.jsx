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
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        } else if (user === null && !isAuthenticated && !loading) {
            // 만약 로그아웃 상태인데 마이페이지에 접근한 경우 리디렉션 처리
            navigate('/login');
        }
    }, [isAuthenticated, fetchData, navigate,location.state]);

    // ✅ 추가: user가 변경될 때마다 데이터 새로고침
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchData();
        }
    }, [user]);

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
    const handleUnlike = async (productId) => {
        if (!window.confirm('찜 목록에서 제거하시겠습니까?')) return;

        try {
            // LikeController의 @PostMapping("/like/toggle/{productId}") 가정
            const res = await api.post(`/like/toggle/${productId}`);

            if (res.status === 200) {
                // UI에서 즉시 제거
                const updatedLikes = data.likes.filter(like => like.productId !== productId);
                setData({ ...data, likes: updatedLikes });
                alert("찜 목록에서 상품을 제거했습니다.");
            }
        } catch (err) {
            console.error('찜 해제 오류:', err);
            alert('찜 해제 중 오류가 발생했습니다. 로그인을 확인해주세요.');
        }
    };

    // 입금 확인 처리 함수 (mypage.html의 JS 로직 반영)
    const confirmPayment = async (transactionId) => {
        if (!window.confirm('입금을 확인하셨습니까? 거래를 완료 처리합니다.')) return;

        try {
            // TransactionController의 @PostMapping("/transaction/{id}/complete") 가정
            const response = await api.post(`/transaction/${transactionId}/complete`);

            if (response.status === 200) {
                alert('거래가 완료되었습니다.');
                // 데이터 새로고침
                fetchData();
            } else {
                alert('처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('입금 확인 오류:', error);
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    // 알림 읽음 처리 (mypage.html의 JS 로직 반영)
    const markAsRead = async (notificationId) => {
        try {
            // NotificationController의 @PostMapping("/mypage/notifications/{id}/read") 가정
            await api.post(`/mypage/notifications/${notificationId}/read`);
            // UI에서 즉시 읽음 처리 (선택적) 또는 새로고침

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
        }
    };

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
                            <div key={transaction.transactionId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                                <div className="flex gap-4 items-center">
                                    {/* 상품 이미지 */}
                                    <img
                                        src={transaction.productImage || 'https://via.placeholder.com/150/6B4F4F/FFFFFF?text=No+Image'}
                                        alt={transaction.productTitle}
                                        className="w-32 h-32 object-cover rounded-lg"
                                        onError={(e) => {e.target.onerror = null; e.target.src='https://via.placeholder.com/150/6B4F4F/FFFFFF?text=No+Image'}}
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
                                                <button className="text-gray-600 hover:text-primary text-sm w-full text-right">
                                                    <i className="bi bi-chat-dots mr-1"></i>문의하기
                                                </button>
                                            )}
                                            {transaction.status === 'PENDING' && ( // 입금 대기 상태
                                                <button className="text-blue-600 hover:text-blue-800 text-sm w-full text-right font-medium">
                                                    <i className="bi bi-credit-card mr-1"></i>입금 정보 보기
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                            <div key={transaction.transactionId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                                <div className="flex gap-4 items-center">
                                    {/* 상품 이미지 */}
                                    <img
                                        src={transaction.productImage || 'https://via.placeholder.com/150/6B4F4F/FFFFFF?text=No+Image'}
                                        alt={transaction.productTitle}
                                        className="w-32 h-32 object-cover rounded-lg"
                                        onError={(e) => {e.target.onerror = null; e.target.src='https://via.placeholder.com/150/6B4F4F/FFFFFF?text=No+Image'}}
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
                                                <button className="text-gray-600 hover:text-primary text-sm w-full text-right">
                                                    <i className="bi bi-chat-dots mr-1"></i>문의하기
                                                </button>
                                            )}
                                            {transaction.status === 'PENDING' && ( // 입금 확인 대기 상태
                                                <button
                                                    onClick={() => confirmPayment(transaction.transactionId)}
                                                    className="bg-primary hover:bg-secondary text-white text-sm px-4 py-2 rounded-lg w-full font-medium transition-all"
                                                >
                                                    <i className="bi bi-check-circle mr-1"></i>입금 확인하기
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    /* Empty State */
                    <div className="text-center py-16">
                        <i className="bi bi-receipt text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">판매내역이 없습니다.</p>
                        <Button onClick={() => navigate('/product/write')} variant="primary" size="md" className="mt-4">
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
                                <Link to={`/product/${like.productId}`}>
                                    <img
                                        src={like.productImage || 'https://via.placeholder.com/300x200/6B4F4F/FFFFFF?text=No+Image'}
                                        alt={like.productTitle}
                                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {e.target.onerror = null; e.target.src='https://via.placeholder.com/300x200/6B4F4F/FFFFFF?text=No+Image'}}
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
                                <Link to={notification.url} onClick={() => markAsRead(notification.notificationId)} className="block">
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