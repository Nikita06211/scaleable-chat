"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../../context/SocketProvider";

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const { sendMessage, messages } = useSocket();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  // 🧪 Replace this with your real receiver's ID
  const receiverId = "cmcxpi4gw0004tsp0zwe52yyz";

  useEffect(() => {
    const userData = localStorage.getItem("chat-user");
    if (!userData) {
      router.push("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (message.trim() && user) {
      sendMessage(message, receiverId);
      setMessage("");
    }
  };

  if (!user) return <p className="text-white text-center mt-10">Loading user...</p>;

  return (
    <div className="flex flex-col h-screen bg-[#111] text-white">
      <div className="p-4 border-b border-gray-700 text-lg font-semibold">
        Welcome {user.username}!
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {messages.map((msg, i) => {
  const isObject = typeof msg === "object" && msg !== null && "message" in msg;
  const content = isObject ? msg.message : msg;
  const isSender = isObject && "senderId" in msg && msg.senderId === user.id;
  const senderName = isSender ? "You" : "Friend";


  return (
    <div key={i} className={`max-w-sm ${isSender ? "ml-auto" : "mr-auto"}`}>
      <div className="text-xs text-gray-400 mb-1">{senderName}</div>
      <div
        className={`p-2 rounded-md ${
          isSender ? "bg-blue-600" : "bg-gray-700"
        }`}
      >
        {content}
      </div>
    </div>
  );
})}

        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-gray-700 flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 py-2 rounded-md bg-gray-800 text-white outline-none"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  );
}
