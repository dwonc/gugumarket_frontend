import axios from "./axios";

const chatApi = {
  // 기본: 상품 기준 채팅방 생성/조회 (구매자가 상품 상세에서 "문의하기" 누를 때)
  createOrGetChatRoom: async (productId) => {
    const response = await axios.post("/api/chat/rooms", { productId });
    return response.data; // { success, chatRoom, message? }
  },

  // ✅ api → axios로 수정
  createChatRoomWithUser: async (productId, otherUserId) => {
    const response = await axios.post("/api/chat/rooms", {
      productId,
      otherUserId,
    });
    return response.data;
  },

  // 판매내역에서 "문의하기" 누를 때: 상품 + 상대 유저 기준
  createOrGetChatRoomWithUser: async (productId, otherUserId) => {
    const response = await axios.post("/api/chat/rooms/with-user", {
      productId,
      otherUserId,
    });
    return response.data; // { success, chatRoom, message? }
  },

  getChatRoomList: async () => {
    const response = await axios.get("/api/chat/rooms");
    return response.data;
  },

  getChatRoom: async (chatRoomId) => {
    const response = await axios.get(`/api/chat/rooms/${chatRoomId}`);
    return response.data;
  },

  getMessages: async (chatRoomId) => {
    const response = await axios.get(`/api/chat/rooms/${chatRoomId}/messages`);
    return response.data;
  },

  markMessagesAsRead: async (chatRoomId) => {
    const response = await axios.patch(`/api/chat/rooms/${chatRoomId}/read`);
    return response.data;
  },

  getTotalUnreadCount: async () => {
    const response = await axios.get("/api/chat/unread-count");
    return response.data;
  },

  deleteChatRoom: async (chatRoomId) => {
    const response = await axios.delete(`/api/chat/rooms/${chatRoomId}`);
    return response.data;
  },
};

export default chatApi;
