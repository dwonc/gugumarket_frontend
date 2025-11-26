import { useState, useEffect, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import useAuthStore from "../stores/authStore";

const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);
  const subscriptionsRef = useRef({});
  const { accessToken } = useAuthStore();

  /**
   * WebSocket 연결
   */
  const connect = useCallback(() => {
    if (clientRef.current?.connected) {
      console.log("✅ WebSocket이 이미 연결되어 있습니다.");
      return;
    }

    if (!accessToken) {
      console.error("❌ accessToken이 없습니다. 연결할 수 없습니다.");
      setError("인증 토큰이 없습니다.");
      return;
    }

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const socket = new SockJS(`${API_BASE_URL}/ws`);

      const stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
        debug: (str) => {
          console.log("🔌 STOMP:", str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log("✅ WebSocket 연결 성공!");
          setConnected(true);
          setError(null);
        },
        onStompError: (frame) => {
          console.error("❌ STOMP 에러:", frame);
          setError("WebSocket 연결 중 오류가 발생했습니다.");
          setConnected(false);
        },
        onDisconnect: () => {
          console.log("🔌 WebSocket 연결 해제");
          setConnected(false);
        },
      });

      stompClient.activate();
      clientRef.current = stompClient;
    } catch (err) {
      console.error("❌ WebSocket 연결 실패:", err);
      setError("WebSocket 연결에 실패했습니다.");
      setConnected(false);
    }
  }, [accessToken]);

  /**
   * WebSocket 연결 해제
   */
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      // 모든 구독 해제
      Object.keys(subscriptionsRef.current).forEach((destination) => {
        subscriptionsRef.current[destination]?.unsubscribe();
      });
      subscriptionsRef.current = {};

      clientRef.current.deactivate();
      clientRef.current = null;
      setConnected(false);
      console.log("✅ WebSocket 연결 해제 완료");
    }
  }, []);

  /**
   * 채팅방 구독
   */
  const subscribe = useCallback((chatRoomId, callback) => {
    if (!clientRef.current?.connected) {
      console.error("❌ WebSocket이 연결되어 있지 않습니다.");
      return;
    }

    const destination = `/topic/chat/${chatRoomId}`;

    // 이미 구독 중이면 무시
    if (subscriptionsRef.current[destination]) {
      console.log(`✅ 이미 구독 중: ${destination}`);
      return;
    }

    try {
      const subscription = clientRef.current.subscribe(
        destination,
        (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log("📨 메시지 수신:", data);
            callback(data);
          } catch (err) {
            console.error("❌ 메시지 파싱 실패:", err);
          }
        }
      );

      subscriptionsRef.current[destination] = subscription;
      console.log(`✅ 구독 성공: ${destination}`);
    } catch (err) {
      console.error(`❌ 구독 실패: ${destination}`, err);
    }
  }, []);

  /**
   * 구독 해제
   */
  const unsubscribe = useCallback((chatRoomId) => {
    const destination = `/topic/chat/${chatRoomId}`;
    if (subscriptionsRef.current[destination]) {
      subscriptionsRef.current[destination].unsubscribe();
      delete subscriptionsRef.current[destination];
      console.log(`✅ 구독 해제: ${destination}`);
    }
  }, []);

  /**
   * 메시지 전송
   */
  const sendMessage = useCallback((chatRoomId, content) => {
    if (!clientRef.current?.connected) {
      console.error("❌ WebSocket이 연결되어 있지 않습니다.");
      return;
    }

    try {
      clientRef.current.publish({
        destination: "/app/chat/send",
        body: JSON.stringify({
          chatRoomId,
          messageType: "TEXT",
          content,
        }),
      });
      console.log("✅ 메시지 전송:", content);
    } catch (err) {
      console.error("❌ 메시지 전송 실패:", err);
    }
  }, []);

  /**
   * 입장 알림
   */
  const enterChatRoom = useCallback((chatRoomId) => {
    if (!clientRef.current?.connected) {
      console.error("❌ WebSocket이 연결되어 있지 않습니다.");
      return;
    }

    try {
      clientRef.current.publish({
        destination: "/app/chat/enter",
        body: JSON.stringify({ chatRoomId }),
      });
      console.log(`✅ 입장 알림 전송: ${chatRoomId}`);
    } catch (err) {
      console.error("❌ 입장 알림 전송 실패:", err);
    }
  }, []);

  /**
   * 퇴장 알림
   */
  const leaveChatRoom = useCallback((chatRoomId) => {
    if (!clientRef.current?.connected) {
      console.error("❌ WebSocket이 연결되어 있지 않습니다.");
      return;
    }

    try {
      clientRef.current.publish({
        destination: "/app/chat/leave",
        body: JSON.stringify({ chatRoomId }),
      });
      console.log(`✅ 퇴장 알림 전송: ${chatRoomId}`);
    } catch (err) {
      console.error("❌ 퇴장 알림 전송 실패:", err);
    }
  }, []);

  /**
   * 컴포넌트 마운트 시 자동 연결
   */
  useEffect(() => {
    connect();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connected,
    error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendMessage,
    enterChatRoom,
    leaveChatRoom,
  };
};

export default useWebSocket;
