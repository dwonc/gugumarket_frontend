import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useNotificationStore from "../../stores/notificationStore";
import { notificationApi } from "../../api/notificationApi";

const NotificationBell = () => {
  const { unreadCount, setUnreadCount } = useNotificationStore();

  // 읽지 않은 알림 개수 조회
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationApi.getUnreadCount();
        if (response.data.success) {
          setUnreadCount(response.data.data.count);
        }
      } catch (error) {
        console.error("알림 개수 조회 실패:", error);
      }
    };

    fetchUnreadCount();

    // 30초마다 갱신
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [setUnreadCount]);

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
