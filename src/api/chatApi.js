// src/api/chatApi.js
import axios from "./axios";

const chatApi = {
  /**
   * 채팅방 생성 또는 조회
   * @param {number} productId - 상품 ID
   * @returns {Promise}
   */
  createOrGetChatRoom: async (productId) => {
    try {
      const response = await axios.post("/api/chat/rooms", {
        productId: productId,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ✅ 특정 사용자와 채팅방 생성 또는 조회 (거래용)
   * @param {number} productId - 상품 ID
   * @param {number} otherUserId - 상대방 사용자 ID
   * @returns {Promise}
   */
  createChatRoomWithUser: async (productId, otherUserId) => {
    try {
      const response = await axios.post("/api/chat/rooms/with-user", {
        productId: productId,
        otherUserId: otherUserId,
      });

      return response.data;
    } catch (error) {
      console.error("채팅방 생성/조회 실패:", error);
      console.error("에러 응답:", error.response?.data);
      throw error;
    }
  },

  /**
   * 채팅방 목록 조회
   * @returns {Promise}
   */
  getChatRoomList: async () => {
    try {
      const response = await axios.get("/api/chat/rooms");
      return response.data;
    } catch (error) {
      console.error("채팅방 목록 조회 실패:", error);
      throw error;
    }
  },

  /**
   * 채팅방 상세 조회
   * @param {number} chatRoomId - 채팅방 ID
   * @returns {Promise}
   */
  getChatRoom: async (chatRoomId) => {
    try {
      const response = await axios.get(`/api/chat/rooms/${chatRoomId}`);
      return response.data;
    } catch (error) {
      console.error("채팅방 조회 실패:", error);
      throw error;
    }
  },

  /**
   * 메시지 목록 조회
   * @param {number} chatRoomId - 채팅방 ID
   * @returns {Promise}
   */
  getMessages: async (chatRoomId) => {
    try {
      const response = await axios.get(
        `/api/chat/rooms/${chatRoomId}/messages`
      );
      return response.data;
    } catch (error) {
      console.error("메시지 목록 조회 실패:", error);
      throw error;
    }
  },

  /**
   * 메시지 읽음 처리
   * @param {number} chatRoomId - 채팅방 ID
   * @returns {Promise}
   */
  markMessagesAsRead: async (chatRoomId) => {
    try {
      const response = await axios.patch(`/api/chat/rooms/${chatRoomId}/read`);
      return response.data;
    } catch (error) {
      console.error("메시지 읽음 처리 실패:", error);
      throw error;
    }
  },

  /**
   * 총 읽지 않은 메시지 수 조회
   * @returns {Promise}
   */
  getTotalUnreadCount: async () => {
    try {
      const response = await axios.get("/api/chat/unread-count");
      return response.data;
    } catch (error) {
      console.error("읽지 않은 메시지 수 조회 실패:", error);
      throw error;
    }
  },

  /**
   * 채팅방 삭제
   * @param {number} chatRoomId - 채팅방 ID
   * @returns {Promise}
   */
  deleteChatRoom: async (chatRoomId) => {
    try {
      const response = await axios.delete(`/api/chat/rooms/${chatRoomId}`);
      return response.data;
    } catch (error) {
      console.error("채팅방 삭제 실패:", error);
      throw error;
    }
  },
};

export default chatApi;
