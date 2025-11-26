import api from "./axios";

const chatApi = {
  /**
   * 채팅방 생성 또는 조회
   * POST /api/chat/rooms
   */
  createOrGetChatRoom: async (productId) => {
    const response = await api.post("/api/chat/rooms", { productId });
    return response.data;
  },

  /**
   * 채팅방 목록 조회
   * GET /api/chat/rooms
   */
  getChatRoomList: async () => {
    const response = await api.get("/api/chat/rooms");
    return response.data;
  },

  /**
   * 채팅방 상세 조회
   * GET /api/chat/rooms/:chatRoomId
   */
  getChatRoom: async (chatRoomId) => {
    const response = await api.get(`/api/chat/rooms/${chatRoomId}`);
    return response.data;
  },

  /**
   * 채팅방의 메시지 목록 조회
   * GET /api/chat/rooms/:chatRoomId/messages
   */
  getMessages: async (chatRoomId) => {
    const response = await api.get(`/api/chat/rooms/${chatRoomId}/messages`);
    return response.data;
  },

  /**
   * 메시지 읽음 처리
   * PATCH /api/chat/rooms/:chatRoomId/read
   */
  markMessagesAsRead: async (chatRoomId) => {
    const response = await api.patch(`/api/chat/rooms/${chatRoomId}/read`);
    return response.data;
  },

  /**
   * 총 읽지 않은 메시지 수 조회
   * GET /api/chat/unread-count
   */
  getTotalUnreadCount: async () => {
    const response = await api.get("/api/chat/unread-count");
    return response.data;
  },

  /**
   * 채팅방 삭제
   * DELETE /api/chat/rooms/:chatRoomId
   */
  deleteChatRoom: async (chatRoomId) => {
    const response = await api.delete(`/api/chat/rooms/${chatRoomId}`);
    return response.data;
  },
};

export default chatApi;
