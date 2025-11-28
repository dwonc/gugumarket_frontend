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
// ✅ 분리된 탭 컴포넌트 import
import MyPurchases from "../../components/mypages/MyPurchases";
import MySales from "../../components/mypages/MySales";
import MyLikes from "../../components/mypages/MyLikes";
import MyNotifications from "../../components/mypages/MyNotifications";
import MyReports from "../../components/mypages/MyReports";
import {
  formatDateTime,
  formatPrice,
  getImageUrl,
  getTransactionStatus,
} from "../../utils/formatters";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const NO_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;base64," +
  btoa(
    '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="100%" height="100%" fill="#6B4F4F"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
      'font-family="sans-serif" font-size="16" fill="#FFFFFF">No Image</text>' +
      "</svg>"
  );

const MyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuthStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("purchases");
  const [reports, setReports] = useState([]);
  const [levelInfo, setLevelInfo] = useState(null);

  useEffect(() => {
    const authStorage = localStorage.getItem("auth-storage");
    const { accessToken, isAuthenticated: storeAuth } = useAuthStore.getState();

    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
      } catch (e) {
        console.error("❌ localStorage 파싱 실패:", e);
      }
    }
  }, [isAuthenticated, location]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/mypage");
      if (response.data.success) {
        setData(response.data);
      } else {
        setError(
          response.data.message || "마이페이지 정보를 불러오는데 실패했습니다."
        );
      }

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

  useEffect(() => {
    if (isAuthenticated === true) {
      fetchData();
    } else if (isAuthenticated === false) {
      navigate("/login");
    }
  }, [isAuthenticated, fetchData, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (isAuthenticated && data?.user && data.user.role !== "ADMIN") {
      fetchReports();
    }
  }, [isAuthenticated, data?.user, fetchReports]);

  const showTab = (tabName) => {
    setActiveTab(tabName);
  };

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

    const key = isSeller ? `SELLER_${statusName}` : statusName;
    const defaultStatus = {
      text: statusName,
      class: "bg-gray-100 text-gray-700",
    };

    return statusMap[key] || defaultStatus;
  };

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
            setLevelInfo(levelInfo);
          } else {
            alert("거래가 완료되었습니다.");
          }

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

  const {
    user: apiUser,
    purchases,
    likes,
    recentNotifications,
    unreadCount,
    sales,
    products,
  } = data;

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
    // USER 전용 신고 내역 탭 (Admin 제외)
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
        {/* User Info Card */}
        <UserProfile user={apiUser} />

        {/* 등급 정보 카드 */}
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
                {levelInfo.toNextLevel > 0 && (
                  <p className="text-sm mt-2 opacity-90">
                    다음 등급까지{" "}
                    <span className="font-bold">{levelInfo.toNextLevel}회</span>
                  </p>
                )}
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
              <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      levelInfo.level === "ADULT_BIRD"
                        ? 100
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
              formatDate={formatDateTime}
              getStatusBadge={getStatusBadge}
              getProductImageUrl={getImageUrl}
              navigate={navigate} // ✅ 추가
              isAuthenticated={isAuthenticated} // ✅ 추가
            />
          )}
          {activeTab === "sales" && (
            <MySales
              sales={sales}
              products={products}
              apiUser={apiUser}
              formatPrice={formatPrice}
              formatDate={formatDateTime}
              getStatusBadge={getStatusBadge}
              getProductImageUrl={getImageUrl}
              confirmPayment={confirmPayment}
              navigate={navigate}
              isAuthenticated={isAuthenticated} // ✅ 추가
            />
          )}
          {activeTab === "likes" && (
            <MyLikes
              likes={likes}
              formatPrice={formatPrice}
              getProductImageUrl={getImageUrl}
              handleUnlike={handleUnlike}
              navigate={navigate}
            />
          )}
          {activeTab === "notifications" && (
            <MyNotifications
              recentNotifications={recentNotifications}
              formatDate={formatDateTime}
              markAsRead={markAsRead}
            />
          )}
          {activeTab === "reports" && apiUser?.role !== "ADMIN" && (
            <MyReports
              reports={reports}
              formatDate={formatDateTime}
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
