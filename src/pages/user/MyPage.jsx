// src/pages/mypage/MyPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import useAuthStore from "../../stores/authStore";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button"; // Button.jsx 사용
import UserProfile from "../../components/user/UserProfile";

// ✅ 분리된 탭 컴포넌트 import
import MyPurchases from "../../components/mypages/MyPurchases";
import MySales from "../../components/mypages/MySales";
import MyLikes from "../../components/mypages/MyLikes";
import MyNotifications from "../../components/mypages/MyNotifications";

// ✅ 백엔드 기본 URL 설정 (axios.js와 동일하게 환경 변수 사용)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// primary: #6B4F4F 색상을 배경색으로 사용한 SVG Data URI
const NO_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;base64," +
  btoa(
    '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100%" height="100%" fill="#6B4F4F"/>' + // primary 색상
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
      'font-family="sans-serif" font-size="16" fill="#FFFFFF">No Image</text>' +
      "</svg>"
  );

// ✅ 이미지 경로 생성 헬퍼 함수 최종 수정: 절대 URL 중복 방지
const getProductImageUrl = (imagePath) => {
  // 1. 이미지가 없으면 플레이스홀더 반환
  if (!imagePath || imagePath.trim() === "") {
    return NO_IMAGE_PLACEHOLDER;
  }

  // 2. 🔥 수정된 로직: 경로가 'http://' 또는 'https://'로 시작하면
  //    이미 절대 경로이므로 그대로 반환합니다.
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // 3. (만약 서버가 상대 경로를 보낸다면) Base URL 결합 로직 유지
  //    API_BASE_URL의 끝 슬래시를 제거 (있든 없든 제거)
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const cleanedPath = imagePath.replace(/^\//, "");

  // 4. 결합
  return `${baseUrl}/${cleanedPath}`;
};

const MyPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 location 사용되므로 유지
  const { isAuthenticated, logout } = useAuthStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("purchases");

  // ==========================================================
  // ✅ 1. fetchData 정의 (TDZ/ReferenceError 해결)
  // ==========================================================
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // MypageController.java의 @GetMapping("/") 엔드포인트 호출
      const response = await api.get("/mypage");
      if (response.data.success) {
        setData(response.data);
      } else {
        setError(
          response.data.message || "마이페이지 정보를 불러오는데 실패했습니다."
        );
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
  }, [logout, navigate]);

  // ==========================================================
  // ✅ 2. useEffect로 데이터 로딩 및 리디렉션 처리
  // ==========================================================
  useEffect(() => {
    if (isAuthenticated === true) {
      fetchData();
    } else if (isAuthenticated === false) {
      navigate("/login");
    }
  }, [isAuthenticated, fetchData, navigate]);

  // URL 쿼리 파라미터에서 탭 상태를 읽어옴
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Tab 전환 함수
  const showTab = (tabName) => {
    setActiveTab(tabName);
  };

  // 금액 포맷 함수
  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  // 날짜 포맷 함수
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date
      .toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(". ", "-")
      .replace(". ", "-")
      .replace(".", "")
      .replace(" ", " ");
  };

  // ✅ 트랜잭션 상태를 디자인에 맞게 변환하는 함수 (수정됨!)
  const getStatusBadge = (statusName, isSeller) => {
    const statusMap = {
      // 구매내역 (Buyer)
      PENDING: { text: "입금 대기", class: "bg-yellow-100 text-yellow-700" },
      COMPLETED: { text: "구매 확정", class: "bg-green-100 text-green-700" },
      CANCELLED: { text: "거래 취소", class: "bg-red-100 text-red-700" },
      // 판매내역 (Seller)
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

    const key = isSeller ? `SELLER_${statusName}` : statusName;
    const defaultStatus = {
      text: statusName,
      class: "bg-gray-100 text-gray-700",
    };

    // ✅ 반환문 추가!
    return statusMap[key] || defaultStatus;
  }; // ✅ 함수 제대로 닫기!

  // 찜 해제
  const handleUnlike = useCallback(
    async (productId) => {
      if (!window.confirm("찜 목록에서 제거하시겠습니까?")) return;

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
        const res = await api.post(`/api/products/${productId}/like`, null, {
          headers: headers,
        });

        if (res.status === 200) {
          const updatedLikes = data.likes.filter(
            (like) => like.productId !== productId
          );
          setData({ ...data, likes: updatedLikes });
          alert("찜 목록에서 상품을 제거했습니다.");
        }
      } catch (err) {
        console.error("찜 해제 오류:", err);
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

  // 입금 확인 처리 함수
  const confirmPayment = useCallback(
    async (transactionId) => {
      if (!window.confirm("입금을 확인하셨습니까? 거래를 완료 처리합니다."))
        return;

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
        const response = await api.post(
          `/api/transactions/${transactionId}/complete`,
          null,
          { headers: headers }
        );

        if (response.status === 200) {
          alert("거래가 완료되었습니다.");
          fetchData();
        } else {
          alert("처리 중 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("입금 확인 오류:", error);
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

  // 알림 읽음 처리
  const markAsRead = useCallback(
    async (notificationId) => {
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
        await api.patch(`/api/notifications/${notificationId}/read`, null, {
          headers: headers,
        });
        setData((prevData) => {
          const updatedNotifications = prevData.recentNotifications.map(
            (notif) =>
              notif.notificationId === notificationId
                ? { ...notif, isRead: true }
                : notif
          );
          return {
            ...prevData,
            recentNotifications: updatedNotifications,
            unreadCount:
              prevData.unreadCount > 0 ? prevData.unreadCount - 1 : 0,
          };
        });
      } catch (error) {
        console.error("알림 읽음 처리 오류:", error);
        if (error.response?.status === 401) {
          alert("세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
          logout();
          navigate("/login");
        }
      }
    },
    [logout, navigate]
  );

  // 로딩 조건
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

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage message={error} type="error" />
          <Button onClick={fetchData} className="mt-4">
            다시 시도
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // 데이터 구조 분해
  const {
    user: apiUser,
    purchases,
    likes,
    recentNotifications,
    unreadCount,
    sales,
    products,
  } = data;

  // 탭 정보 정의
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
  ];

  // 메인 렌더링
  return (
    <>
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <UserProfile user={apiUser} />

        {/* Tabs Navigation */}
        <div className="bg-white rounded-t-2xl shadow-lg">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => showTab(tab.name)}
                className={`flex-1 py-4 px-6 font-semibold transition-all relative ${
                  activeTab === tab.name
                    ? "active-tab bg-primary text-white"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
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
                {tab.name === "sales" && (
                  <span className="ml-1 text-sm text-gray-500 font-normal">
                    ({tab.count || 0})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="bg-white rounded-b-2xl shadow-lg p-8">
          {activeTab === "purchases" && (
            <MyPurchases
              purchases={purchases}
              formatPrice={formatPrice}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              getProductImageUrl={getProductImageUrl}
            />
          )}
          {activeTab === "sales" && (
            <MySales
              sales={sales}
              products={products}
              apiUser={apiUser}
              formatPrice={formatPrice}
              formatDate={formatDate}
              formDate={formatDate}
              getStatusBadge={getStatusBadge}
              getProductImageUrl={getProductImageUrl}
              confirmPayment={confirmPayment}
              navigate={navigate}
            />
          )}
          {activeTab === "likes" && (
            <MyLikes
              likes={likes}
              formatPrice={formatPrice}
              getProductImageUrl={getProductImageUrl}
              handleUnlike={handleUnlike}
              navigate={navigate}
            />
          )}
          {activeTab === "notifications" && (
            <MyNotifications
              recentNotifications={recentNotifications}
              formatDate={formatDate}
              marksAsRead={markAsRead}
            />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default MyPage;
