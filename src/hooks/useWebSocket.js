// src/hooks/useWebSocket.js
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

  const connect = useCallback(() => {
    if (clientRef.current?.connected) {
      return;
    }

    if (!accessToken) {
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
        debug: (str) => console.log("🔌 STOMP:", str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          setConnected(true);
          setError(null);
        },
        onStompError: (frame) => {
          console.error("❌ STOMP 에러:", frame);
          setError("WebSocket 연결 중 오류가 발생했습니다.");
          setConnected(false);
        },
        onDisconnect: () => {
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

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      Object.keys(subscriptionsRef.current).forEach((destination) => {
        subscriptionsRef.current[destination]?.unsubscribe();
      });
      subscriptionsRef.current = {};

      clientRef.current.deactivate();
      clientRef.current = null;
      setConnected(false);
    }
  }, []);

  /** 어디든 구독할 수 있는 공용 함수 */
  const subscribeDestination = useCallback((destination, callback) => {
    if (!clientRef.current?.connected) {
      console.error("❌ WebSocket이 연결되어 있지 않습니다.");
      return null;
    }

    // 중복 구독 방지
    if (subscriptionsRef.current[destination]) {
      console.log(`✅ 이미 구독 중: ${destination}`);
      return () => {};
    }

    try {
      const sub = clientRef.current.subscribe(destination, (message) => {
        let payload = null;
        try {
          payload = JSON.parse(message.body);
        } catch {
          payload = message.body;
        }
        callback(payload);
      });

      subscriptionsRef.current[destination] = sub;
      console.log(`✅ 구독 성공: ${destination}`);

      // unsubscribe 함수 반환
      return () => {
        if (subscriptionsRef.current[destination]) {
          subscriptionsRef.current[destination].unsubscribe();
          delete subscriptionsRef.current[destination];
          console.log(`✅ 구독 해제: ${destination}`);
        }
      };
    } catch (err) {
      console.error(`❌ 구독 실패: ${destination}`, err);
      return null;
    }
  }, []);

  const unsubscribeDestination = useCallback((destination) => {
    if (subscriptionsRef.current[destination]) {
      subscriptionsRef.current[destination].unsubscribe();
      delete subscriptionsRef.current[destination];
    }
  }, []);

  const subscribe = useCallback(
    (chatRoomId, callback) => {
      const dest = `/topic/chat/${chatRoomId}`;
      return subscribeDestination(dest, callback);
    },
    [subscribeDestination]
  );

  const unsubscribe = useCallback(
    (chatRoomId) => {
      const dest = `/topic/chat/${chatRoomId}`;
      unsubscribeDestination(dest);
    },
    [unsubscribeDestination]
  );

  const sendMessage = useCallback((chatRoomId, content) => {
    if (!clientRef.current?.connected) {
      console.error("❌ WebSocket이 연결되어 있지 않습니다.");
      return;
    }

    clientRef.current.publish({
      destination: "/app/chat/send",
      body: JSON.stringify({
        chatRoomId,
        messageType: "TEXT",
        content,
      }),
    });
  }, []);

  const enterChatRoom = useCallback((chatRoomId) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: "/app/chat/enter",
      body: JSON.stringify({ chatRoomId }),
    });
  }, []);

  const leaveChatRoom = useCallback((chatRoomId) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: "/app/chat/leave",
      body: JSON.stringify({ chatRoomId }),
    });
  }, []);

  useEffect(() => {
    if (accessToken) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [accessToken, connect, disconnect]);

  return {
    connected,
    error,
    connect,
    disconnect,
    subscribe,
    subscribeDestination,
    unsubscribe,
    unsubscribeDestination,
    sendMessage,
    enterChatRoom,
    leaveChatRoom,
  };
};

export default useWebSocket;
