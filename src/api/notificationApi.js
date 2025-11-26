import api from "./axios";

export const notificationApi = {
  // 알림 목록 조회
  getNotifications: () => api.get("/notifications"),

  // 읽지 않은 알림 개수 조회
  getUnreadCount: () => api.get("/notifications/unread-count"),

  // 특정 알림 읽음 처리
  markAsRead: (notificationId) =>
    api.patch(`/notifications/${notificationId}/read`),

  // 모든 알림 읽음 처리
  markAllAsRead: () => api.patch("/notifications/read-all"),

  // 특정 알림 삭제
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`),

  // 모든 알림 삭제
  deleteAllNotifications: () => api.delete("/notifications/delete-all"),
};
