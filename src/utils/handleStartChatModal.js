import chatApi from "../api/chatApi";

export const handleStartChatModal = async (
  productId,
  isAuthenticated,
  openChatModal,
  navigate,
  otherUserId // ✨ 상대 유저 ID (옵션)
) => {
  try {
    if (!isAuthenticated) {
      if (
        window.confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")
      ) {
        navigate("/login");
      }
      return;
    }

    let response;

    if (otherUserId) {
      // ✅ 판매내역에서: 상품 + 상대방 기준
      response = await chatApi.createOrGetChatRoomWithUser(
        productId,
        otherUserId
      );
    } else {
      // ✅ 상품 상세에서: 현재 유저(구매자) → 상품 판매자
      response = await chatApi.createOrGetChatRoom(productId);
    }

    if (response.success) {
      const chatRoomId = response.chatRoom.chatRoomId;
      openChatModal(chatRoomId);
    } else {
      alert(response.message || "채팅방을 생성하는데 실패했습니다.");
    }
  } catch (error) {
    console.error("채팅 시작 실패:", error);

    if (error.response?.status === 401) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    } else if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else {
      alert("채팅방을 생성하는 중 오류가 발생했습니다.");
    }
  }
};

export default handleStartChatModal;
