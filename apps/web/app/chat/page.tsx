"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../../context/SocketProvider";
import axios from "axios";

interface Message {
  senderId: string;
  receiverId: string;
  message?: string;
  text?: string;
}


export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [receiverId, setReceiverId] = useState<string>("");
  const [chat, setChat] = useState<Message[]>([]);

  const { sendMessage, messages } = useSocket();
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("chat-user");
    if (!userData) {
      router.push("/login");
    } else {
      const parsed = JSON.parse(userData);
      setUser(parsed);
    }
  }, [router]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get("http://localhost:8000/api/users");
      const currentUser = JSON.parse(localStorage.getItem("chat-user") || "{}");
      const otherUsers = res.data.filter((u: any) => u.id !== currentUser.id);
      setUsers(otherUsers);
    };
    fetchUsers();
  }, []);

  const handleUserClick = async (id: string) => {
    setReceiverId(id);
    const res = await axios.get(`http://localhost:8000/api/messages/${user.id}/${id}`);
    setChat(res.data); // Set chat history directly
  };

  const handleSend = () => {
    if (message.trim() && user && receiverId) {
      sendMessage(message, receiverId);
      setMessage("");
    }
  };

  // Append real-time messages that are relevant
  useEffect(() => {
    const relevantMessages = messages.filter(
      (m) =>
        (m.senderId === user?.id && m.receiverId === receiverId) ||
        (m.senderId === receiverId && m.receiverId === user?.id)
    );

    if (relevantMessages.length > 0) {
      setChat((prev) => [...prev, ...relevantMessages]);
    }
  }, [messages, receiverId, user?.id]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    const chatContainer = document.getElementById("chat-scroll");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chat]);

  if (!user) return <p className="text-white text-center mt-10">Loading user...</p>;

  return (
    <div className="flex h-screen bg-[#111] text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-700 p-4 space-y-2">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => handleUserClick(u.id)}
            className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${
              receiverId === u.id ? "bg-blue-600" : "bg-gray-800"
            }`}
          >
            {u.username}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-700 text-lg font-semibold">
          Chatting as {user.username}
        </div>

        <div id="chat-scroll" className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {chat.map((msg, i) => {
            const isSender = msg.senderId === user.id;
            const senderName = isSender ? "You" : "Friend";

            return (
              <div key={i} className={`max-w-sm ${isSender ? "ml-auto" : "mr-auto"}`}>
                <div className="text-xs text-gray-400 mb-1">{senderName}</div>
                <div className={`p-2 rounded-md ${isSender ? "bg-blue-600" : "bg-gray-700"}`}>
                  {msg.text || msg.message}
                </div>
              </div>
            );
          })}
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
    </div>
  );
}
