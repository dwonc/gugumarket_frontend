console.log("🔍 NotificationBell user:", user);
// src/components/layout/NotificationBell.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useNotificationStore from "../../stores/notificationStore";
import { notificationApi } from "../../api/notificationApi";
import useWebSocket from "../../hooks/useWebSocket";
import useAuthStore from "../../stores/authStore";

const NotificationBell = () => {
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const { connected, subscribeDestination } = useWebSocket();
  const { user } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  // 1️⃣ 최초 1번 REST 로 unreadCount 가져오기
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationApi.getUnreadCount();
        if (response.data.success) {
          setUnreadCount(response.data.data.count);
        }
      } catch (error) {
        console.error("알림 개수 조회 실패:", error);
      } finally {
        setInitialized(true);
      }
    };

    fetchUnreadCount();
  }, [setUnreadCount]);

  // 2️⃣ WebSocket으로 실시간 count 갱신
  useEffect(() => {
    if (!connected) return;
    if (!initialized) return;
    if (!user || !user.userId) return;

    const dest = `/topic/notifications-count/${user.userId}`;
    console.log("🔔 알림 카운트 구독:", dest);

    subscribeDestination(dest, (payload) => {
      console.log("🔔 알림 카운트 수신:", payload);

      // 서버에서 payload = 21 같은 숫자만 보내는 상태니까
      if (typeof payload === "number") {
        setUnreadCount(payload);
      } else if (typeof payload === "string" && !isNaN(Number(payload))) {
        setUnreadCount(Number(payload));
      }
    });
  }, [connected, initialized, user, subscribeDestination, setUnreadCount]);

  useEffect(() => {
    console.log("🔔 connected:", connected);
    console.log("🔔 initialized:", initialized);
    console.log("🔔 userId:", user?.userId);

    if (!connected) return;
    if (!initialized) return;
    if (!user || !user.userId) return;

    const dest = `/topic/notifications-count/${user.userId}`;
    console.log("🔔 알림 카운트 구독 시작:", dest);

    subscribeDestination(dest, (payload) => {
      console.log("🔔 실시간 알림 수신:", payload);
      setUnreadCount(Number(payload));
    });
  }, [connected, initialized, user]);

  return (
    <Link to="/notifications" className="relative">
      <i className="bi bi-bell text-xl text-gray-700 hover:text-primary transition-colors"></i>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
