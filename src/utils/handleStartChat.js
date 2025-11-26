import chatApi from "../api/chatApi";

/**
 * 채팅 시작 공통 함수
 * - 채팅방 생성 또는 기존 채팅방 조회
 * - 채팅방 페이지로 이동
 *
 * @param {number} productId - 상품 ID
 * @param {function} navigate - React Router navigate 함수
 * @param {boolean} isAuthenticated - 인증 여부
 */
export const handleStartChat = async (
  productId,
  navigate,
  isAuthenticated = true
) => {
  try {
    // 인증 확인
    if (!isAuthenticated) {
      if (
        window.confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")
      ) {
        navigate("/login");
      }
      return;
    }

    // 채팅방 생성 또는 조회
    const response = await chatApi.createOrGetChatRoom(productId);

    if (response.success) {
      const chatRoomId = response.chatRoom.chatRoomId;
      console.log(`✅ 채팅방 생성/조회 성공: ${chatRoomId}`);

      // 채팅방 페이지로 이동
      navigate(`/chat/${chatRoomId}`);
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

export default handleStartChat;
