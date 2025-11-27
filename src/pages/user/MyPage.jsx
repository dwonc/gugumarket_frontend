import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import reportApi from "../../api/reportApi";
import useAuthStore from "../../stores/authStore";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import UserProfile from "../../components/user/UserProfile";
import UserLevelBadge from "../../components/user/UserLevelBadge";
// 탭별로 분리된 컴포넌트들 import
import MyPurchases from "../../components/mypages/MyPurchases";
import MySales from "../../components/mypages/MySales";
import MyLikes from "../../components/mypages/MyLikes";
import MyNotifications from "../../components/mypages/MyNotifications";
import MyReports from "../../components/mypages/MyReports";

// 환경변수에서 API 기본 URL 가져오기
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// 이미지가 없을 때 보여줄 기본 SVG 이미지 생성
const NO_IMAGE_PLACEHOLDER =
    "data:image/svg+xml;base64," +
    btoa(
        '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="100%" height="100%" fill="#6B4F4F"/>' +
        '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
        'font-family="sans-serif" font-size="16" fill="#FFFFFF">No Image</text>' +
        "</svg>"
    );

// 상품 이미지 URL을 생성하는 함수
const getProductImageUrl = (imagePath) => {
    // 이미지 경로가 없으면 기본 이미지 반환
    if (!imagePath || imagePath.trim() === "") {
        return NO_IMAGE_PLACEHOLDER;
    }

    // 이미 완전한 URL이면 그대로 반환
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    // 상대 경로를 절대 URL로 변환
    // URL 끝의 슬래시(/) 제거
    const baseUrl = API_BASE_URL.replace(/\/$/, "");
    // 예: "http://localhost:8080/" → "http://localhost:8080"
    // 경로 앞의 슬래시(/) 제거
    const cleanedPath = imagePath.replace(/^\//, "");
    // 예: "/images/product.jpg" → "images/product.jpg"
    return `${baseUrl}/${cleanedPath}`;
};

// 가격을 한국 통화 형식으로 포맷 (예: 10000 → "10,000")
const formatPrice = (price) => {
    return price ? price.toLocaleString("ko-KR") : "0";
};

const MyPage = () => {
    const navigate = useNavigate(); // 페이지 이동 함수
    const location = useLocation(); // 현재 URL 정보
    const { isAuthenticated, logout } = useAuthStore(); // 인증 상태 관리

    // 상태 관리
    const [data, setData] = useState(null); // 마이페이지 전체 데이터
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 메시지
    const [activeTab, setActiveTab] = useState("purchases"); // 현재 활성 탭
    const [reports, setReports] = useState([]); // 신고 내역
    const [levelInfo, setLevelInfo] = useState(null); // 사용자 등급 정보

    // 컴포넌트 마운트 시 인증 상태 확인
    useEffect(() => {
        const authStorage = localStorage.getItem("auth-storage");
        const { accessToken, isAuthenticated: storeAuth } = useAuthStore.getState();

        if (authStorage) {
            try {
                //문자열을 객체로(authStorage)
                const parsed = JSON.parse(authStorage);
            } catch (e) {
                console.error("❌ localStorage 파싱 실패:", e);
            }
        }
    }, [isAuthenticated, location]);

    // 마이페이지 데이터를 서버에서 가져오는 함수
    const fetchData = useCallback(async () => {
        setLoading(true); //로딩 시작
        setError(null); //에러 초기화
        try {
            // 마이페이지 정보 요청
            const response = await api.get("/mypage");
            if (response.data.success) {
                setData(response.data);
            } else {
                setError(
                    response.data.message || "마이페이지 정보를 불러오는데 실패했습니다."
                );
            }

            // 사용자 등급 정보 요청
            try {
                const levelResponse = await api.get("/api/users/me/level");
                if (levelResponse.data.success) {
                    setLevelInfo(levelResponse.data.levelInfo);
                }
            } catch (levelError) {
                console.error("등급 정보 로드 실패:", levelError);
            }
        } catch (err) {
            console.error("마이페이지 데이터 로드 오류:", err);
            // 인증 실패 시 로그아웃 처리
            if (err.response?.status === 401) {
                logout();
                navigate("/login");
                setError("세션이 만료되었습니다. 다시 로그인해주세요.");
            } else {
                setError("서버와 통신 중 오류가 발생했습니다.");
            }
        } finally {
            setLoading(false);
        }
    }, [logout, navigate]);

    // 신고 내역을 가져오는 함수
    const fetchReports = useCallback(async () => {
        try {
            const response = await reportApi.getMyReports();
            if (response.data.success) {
                setReports(response.data.reports);
            }
        } catch (error) {
            console.error("신고 내역 조회 실패:", error);
        }
    }, []);

    // 인증 상태에 따라 데이터 로드 또는 로그인 페이지로 이동
    useEffect(() => {
        if (isAuthenticated === true) {
            fetchData();
        } else if (isAuthenticated === false) {
            navigate("/login");
        }
    }, [isAuthenticated, fetchData, navigate]);

    // URL 쿼리 파라미터에서 탭 정보 읽어오기 (예: ?tab=sales)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");
        if (tab) {
            setActiveTab(tab);
        }
    }, [location.search]);

    // 일반 사용자인 경우 신고 내역 로드
    useEffect(() => {
        if (isAuthenticated && data?.user && data.user.role !== "ADMIN") {
            fetchReports();
        }
    }, [isAuthenticated, data?.user, fetchReports]);

    // 탭 전환 함수
    const showTab = (tabName) => {
        setActiveTab(tabName);
    };

    // 날짜를 포맷하는 함수 (예: "2024-01-15 14:30") 화면에 보여줄 형식을 규정 하는 것
    const formatDate = (dateTimeString) => {
        if (!dateTimeString) return "N/A";
        const date = new Date(dateTimeString);
        return date
            .toLocaleString("ko-KR", {
                year: "numeric",      // 연도 → 2024 (숫자 그대로)
                month: "2-digit",     // 월 → 01, 02, ... 12 (항상 2자리)
                day: "2-digit",       // 일 → 01, 02, ... 31 (항상 2자리)
                hour: "2-digit",      // 시 → 01, 02, ... 23 (항상 2자리)
                minute: "2-digit",    // 분 → 00, 01, ... 59 (항상 2자리)
                hour12: false,        // 24시간 형식 사용 (오전/오후 안 붙임)
            })
            .replace(". ", "-")
            .replace(". ", "-")
            .replace(".", "")
            .replace(" ", " ");
    };

    // 거래 상태에 따른 배지 정보 반환 함수
    const getStatusBadge = (statusName, isSeller) => {
        const statusMap = {
            PENDING: { text: "입금 대기", class: "bg-yellow-100 text-yellow-700" },
            COMPLETED: { text: "구매 확정", class: "bg-green-100 text-green-700" },
            CANCELLED: { text: "거래 취소", class: "bg-red-100 text-red-700" },
            SELLER_PENDING: {
                text: "입금 확인 대기",
                class: "bg-orange-100 text-orange-700",
            },
            SELLER_COMPLETED: {
                text: "판매 완료",
                class: "bg-blue-100 text-blue-700",
            },
            SELLING: { text: "판매 중", class: "bg-indigo-100 text-indigo-700" },
        };

        // 판매자/구매자에 따라 다른 상태 키 사용
        const key = isSeller ? `SELLER_${statusName}` : statusName;
        const defaultStatus = {
            text: statusName,
            class: "bg-gray-100 text-gray-700",
        };

        return statusMap[key] || defaultStatus;
    };

    // 찜 해제 함수
    const handleUnlike = useCallback(
        async (productId) => {
            // 사용자 확인
            if (!window.confirm("찜 목록에서 제거하시겠습니까?")) return;

            // CSRF 토큰 가져오기 (보안)
            const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
            const csrfHeader = document.querySelector(
                'meta[name="_csrf_header"]'
            )?.content;

            const headers = {
                "Content-Type": "application/json",
            };

            if (csrfToken && csrfHeader) {
                headers[csrfHeader] = csrfToken;
            }

            try {
                // 찜 해제 API 요청
                const res = await api.post(`/api/products/${productId}/like`, null, {
                    headers: headers,
                });

                if (res.status === 200) {
                    // 성공 시 해당 상품을 찜 목록에서 제거
                    const updatedLikes = data.likes.filter(
                        (like) => like.productId !== productId
                    );
                    setData({ ...data, likes: updatedLikes });
                    alert("찜 목록에서 상품을 제거했습니다.");
                }
            } catch (err) {
                console.error("찜 해제 오류:", err);
                // 인증 에러 처리
                if (err.response?.status === 401) {
                    alert("세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
                    logout();
                    navigate("/login");
                } else {
                    alert("찜 해제 중 오류가 발생했습니다.");
                }
            }
        },
        [data, logout, navigate]
    );

    // 판매자가 입금 확인 후 거래 완료 처리하는 함수
    const confirmPayment = useCallback(
        async (transactionId) => {
            // 사용자 확인
            if (!window.confirm("입금을 확인하셨습니까? 거래를 완료 처리합니다."))
                return;

            // CSRF 토큰 가져오기
            const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
            const csrfHeader = document.querySelector(
                'meta[name="_csrf_header"]'
            )?.content;

            const headers = {
                "Content-Type": "application/json",
            };
            //$\text{CSRF}$ 헤더 추가: 추출된 csrfToken과 csrfHeader가 모두 유효하면,
            // headers[csrfHeader] = csrfToken 구문을 사용해 동적으로 $\text{CSRF}$ 헤더를 추가합니다.
            // 이는 서버가 요청의 유효성을 검증하는 데 사용
            if (csrfToken && csrfHeader) {
                headers[csrfHeader] = csrfToken;
            }

            try {
                // 거래 완료 API 요청
                const response = await api.post(
                    `/api/transactions/${transactionId}/complete`,
                    null,
                    { headers: headers }
                );

                if (response.status === 200) {
                    // 등급 정보가 포함된 경우 알림 표시
                    if (response.data.levelInfo) {
                        const levelInfo = response.data.levelInfo;
                        alert(
                            `🎉 거래가 완료되었습니다!\n\n` +
                            `📊 현재 등급: ${levelInfo.emoji} ${levelInfo.levelName}\n` +
                            `🔢 거래 횟수: ${levelInfo.transactionCount}회\n` +
                            (levelInfo.toNextLevel > 0
                                ? `🎯 다음 등급까지: ${levelInfo.toNextLevel}회`
                                : `🏆 최고 등급 달성!`)
                        );
                        setLevelInfo(levelInfo); // 등급 정보 업데이트
                    } else {
                        alert("거래가 완료되었습니다.");
                    }

                    fetchData(); // 데이터 새로고침
                } else {
                    alert("처리 중 오류가 발생했습니다.");
                }
            } catch (error) {
                console.error("입금 확인 오류:", error);
                // 인증 에러 처리
                if (error.response?.status === 401) {
                    alert("세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
                    logout();
                    navigate("/login");
                } else {
                    alert("처리 중 오류가 발생했습니다.");
                }
            }
        },
        [fetchData, logout, navigate]
    );

    // 알림을 읽음으로 표시하는 함수
    const markAsRead = useCallback(
        async (notificationId) => {
            // CSRF 토큰 가져오기
            const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
            const csrfHeader = document.querySelector(
                'meta[name="_csrf_header"]'
            )?.content;
            //기본 헤더 설정: $\text{JSON}$ 형식으로 데이터를 보낸다고 알리는 "Content-Type": "application/json" 헤더를 정의합니다.
            //데이터 형식이 무엇인지 명확히 하기 위해서
            const headers = {
                "Content-Type": "application/json",
            };

            if (csrfToken && csrfHeader) {
                headers[csrfHeader] = csrfToken;
            }

            try {
                // 알림 읽음 처리 API 요청
                await api.patch(`/api/notifications/${notificationId}/read`, null, {
                    headers: headers,
                });

                // 로컬 상태 업데이트 (즉시 UI 반영)
                setData((prevData) => {
                    const updatedNotifications = prevData.recentNotifications.map(
                        (notif) =>
                            notif.notificationId === notificationId
                                ? { ...notif, isRead: true } // 해당 알림을 읽음으로 변경
                                : notif
                    );
                    return {
                        ...prevData,
                        recentNotifications: updatedNotifications,
                        unreadCount:
                            prevData.unreadCount > 0 ? prevData.unreadCount - 1 : 0, // 안읽은 개수 감소
                    };
                });
            } catch (error) {
                console.error("알림 읽음 처리 오류:", error);
                // 인증 에러 처리
                if (error.response?.status === 401) {
                    alert("세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
                    logout();
                    navigate("/login");
                }
            }
        },
        [logout, navigate]
    );

    // 로딩 중이거나 데이터가 없으면 로딩 화면 표시
    if (loading || !data || isAuthenticated === null) {
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

    // 데이터에서 필요한 정보 추출
    const {
        user: apiUser,
        purchases,
        likes,
        recentNotifications,
        unreadCount,
        sales,
        products,
    } = data;

    // 탭 메뉴 구성 (관리자는 신고 내역 탭 제외)
    const tabs = [
        {
            name: "purchases",
            label: "구매내역",
            icon: "bi-bag",
            count: purchases?.length,
        },
        {
            name: "sales",
            label: "판매내역",
            icon: "bi-receipt",
            count: sales?.length + products?.length,
        },
        {
            name: "likes",
            label: "찜한 목록",
            icon: "bi-heart",
            count: likes?.length,
        },
        {
            name: "notifications",
            label: "알림",
            icon: "bi-bell",
            count: unreadCount,
        },
        // 일반 사용자만 신고 내역 탭 표시 (관리자 제외)
        ...(apiUser?.role !== "ADMIN"
            ? [
                {
                    name: "reports",
                    label: "신고 내역",
                    icon: "bi-flag",
                    count: reports?.length,
                },
            ]
            : []),
    ];

    return (
        <>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 사용자 프로필 카드 */}
                <UserProfile user={apiUser} />

                {/* 등급 정보 카드 (등급 정보가 있을 때만 표시) */}
                {levelInfo && (
                    <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-lg p-6 mb-6">
                        <div className="flex items-center justify-between text-white">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">내 거래 등급</h3>
                                <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 inline-block">
                                    <UserLevelBadge
                                        levelInfo={levelInfo}
                                        size="lg"
                                        showProgress={false}
                                    />
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-90 mb-1">총 거래 횟수</p>
                                <p className="text-4xl font-bold">
                                    {levelInfo.transactionCount}회
                                </p>
                                {/* 다음 등급까지 남은 횟수 표시 */}
                                {levelInfo.toNextLevel > 0 && (
                                    <p className="text-sm mt-2 opacity-90">
                                        다음 등급까지{" "}
                                        <span className="font-bold">{levelInfo.toNextLevel}회</span>
                                    </p>
                                )}
                                {/* 최고 등급 달성 시 */}
                                {levelInfo.toNextLevel === 0 && (
                                    <p className="text-sm mt-2 font-bold">🏆 최고 등급!</p>
                                )}
                            </div>
                        </div>

                        {/* 등급 진행률 바 */}
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex gap-2">
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                    🥚 알 (0-2회)
                  </span>
                                    <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                    🐣 아기새 (3-9회)
                  </span>
                                    <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                    🐥 사춘기새 (10-29회)
                  </span>
                                    <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                    🦅 어른새 (30회+)
                  </span>
                                </div>
                            </div>
                            {/* 진행률 바 - 현재 등급 구간 내에서의 진행률 계산 */}
                            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                                <div
                                    className="bg-white h-3 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${
                                            levelInfo.level === "ADULT_BIRD"
                                                ? 100 // 최고 등급은 100%
                                                : ((levelInfo.transactionCount -
                                                        levelInfo.minTransactions) /
                                                    (levelInfo.maxTransactions -
                                                        levelInfo.minTransactions +
                                                        1)) *
                                                100
                                        }%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 탭 네비게이션 */}
                <div className="bg-white rounded-t-2xl shadow-lg">
                    <div className="flex border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => showTab(tab.name)} // 탭 클릭 시 활성 탭 변경
                                className={`flex-1 py-4 px-6 font-semibold transition-all relative ${
                                    activeTab === tab.name
                                        ? "active-tab bg-primary text-white"
                                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                                }`}
                            >
                                <i className={`${tab.icon} mr-2`}></i>
                                {tab.label}
                                {/* 알림 탭에만 안읽은 개수 배지 표시 */}
                                {tab.count > 0 && tab.name === "notifications" && (
                                    <span
                                        className={`absolute top-2 right-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${
                                            activeTab === tab.name
                                                ? "bg-white text-red-500"
                                                : "bg-red-500"
                                        }`}
                                        style={{ right: "1rem" }}
                                    >
                    {tab.count}
                  </span>
                                )}
                                {/* 판매내역 탭에는 전체 개수 표시 */}
                                {tab.name === "sales" && (
                                    <span className="ml-1 text-sm text-gray-500 font-normal">
                    ({tab.count || 0})
                  </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 탭 컨텐츠 영역 - 활성 탭에 따라 다른 컴포넌트 표시 */}
                <div className="bg-white rounded-b-2xl shadow-lg p-8">
                    {/* 구매내역 탭 */}
                    {activeTab === "purchases" && (
                        <MyPurchases
                            purchases={purchases}
                            formatPrice={formatPrice}
                            formatDate={formatDate}
                            getStatusBadge={getStatusBadge}
                            getProductImageUrl={getProductImageUrl}
                            navigate={navigate}
                            isAuthenticated={isAuthenticated}
                        />
                    )}
                    {/* 판매내역 탭 */}
                    {activeTab === "sales" && (
                        <MySales
                            sales={sales}
                            products={products}
                            apiUser={apiUser}
                            formatPrice={formatPrice}
                            formatDate={formatDate}
                            getStatusBadge={getStatusBadge}
                            getProductImageUrl={getProductImageUrl}
                            confirmPayment={confirmPayment}
                            navigate={navigate}
                            isAuthenticated={isAuthenticated}
                        />
                    )}
                    {/* 찜한 목록 탭 */}
                    {activeTab === "likes" && (
                        <MyLikes
                            likes={likes}
                            formatPrice={formatPrice}
                            getProductImageUrl={getProductImageUrl}
                            handleUnlike={handleUnlike}
                            navigate={navigate}
                        />
                    )}
                    {/* 알림 탭 */}
                    {activeTab === "notifications" && (
                        <MyNotifications
                            recentNotifications={recentNotifications}
                            formatDate={formatDate}
                            markAsRead={markAsRead}
                        />
                    )}
                    {/* 신고 내역 탭 (일반 사용자만) */}
                    {activeTab === "reports" && apiUser?.role !== "ADMIN" && (
                        <MyReports
                            reports={reports}
                            formatDate={formatDate}
                            navigate={navigate}
                        />
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
};

export default MyPage;