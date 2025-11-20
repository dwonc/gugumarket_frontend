import api from "./axios";

export const notificationApi = {
  // 알림 목록 조회
  getNotifications: () => api.get("/api/notifications"),

  // 읽지 않은 알림 개수 조회
  getUnreadCount: () => api.get("/api/notifications/unread-count"),

  // 특정 알림 읽음 처리
  markAsRead: (notificationId) =>
    api.patch(`/api/notifications/${notificationId}/read`),

  // 모든 알림 읽음 처리
  markAllAsRead: () => api.patch("/api/notifications/read-all"),

  // 특정 알림 삭제
  deleteNotification: (notificationId) =>
    api.delete(`/api/notifications/${notificationId}`),

  // 모든 알림 삭제
  deleteAllNotifications: () => api.delete("/api/notifications/delete-all"),
};
