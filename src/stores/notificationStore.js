import { create } from "zustand";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  // 알림 목록 설정
  setNotifications: (notifications) => set({ notifications }),

  // 읽지 않은 알림 개수 설정
  setUnreadCount: (count) => set({ unreadCount: count }),

  // 새 알림 추가
  addNotification: (notification) =>
    set({
      notifications: [notification, ...get().notifications],
      unreadCount: get().unreadCount + 1,
    }),

  // 알림 읽음 처리
  markAsRead: (notificationId) =>
    set({
      notifications: get().notifications.map((n) =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, get().unreadCount - 1),
    }),

  // 모든 알림 읽음 처리
  markAllAsRead: () =>
    set({
      notifications: get().notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }),

  // 알림 삭제
  removeNotification: (notificationId) => {
    const notification = get().notifications.find(
      (n) => n.notificationId === notificationId
    );
    const isUnread = notification && !notification.isRead;

    set({
      notifications: get().notifications.filter(
        (n) => n.notificationId !== notificationId
      ),
      unreadCount: isUnread
        ? Math.max(0, get().unreadCount - 1)
        : get().unreadCount,
    });
  },
}));

export default useNotificationStore;
