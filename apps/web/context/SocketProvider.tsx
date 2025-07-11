"use client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketProviderProps {
  userId: string;
  children?: React.ReactNode;
}

interface Message {
  senderId: string;
  receiverId: string;
  message: string;
}

interface ISocketContext {
  sendMessage: (msg: string, receiverId: string) => void;
  messages: Message[];
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw new Error(`Socket context is undefined`);
  return state;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ userId, children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = useCallback(
    (msg: string, receiverId: string) => {
      if (socket) {
        socket.emit("event:message", {
          senderId: userId,
          receiverId,
          message: msg,
        });
      }
    },
    [socket, userId]
  );

  const onMessageRec = useCallback((payload: Message) => {
    console.log("From Server Msg Rec", payload);
    setMessages((prev) => [...prev, payload]);
  }, []);

  useEffect(() => {
    const _socket = io("http://localhost:8000");

    _socket.emit("event:register", { userId });

    // Important: Match this event name with your backend emit
    _socket.on("event:message", onMessageRec);

    setSocket(_socket);

    return () => {
      _socket.disconnect();
      _socket.off("event:message", onMessageRec);
      setSocket(undefined);
    };
  }, [userId, onMessageRec]);

  return (
    <SocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};
