"use client";
import { useSocket } from "../context/SocketProvider";
import classes from "./page.module.css";
import { useEffect, useState } from "react";

export default function Page() {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  // 🧠 Load current user from localStorage
  useEffect(() => {
    const user = localStorage.getItem("chat-user");
    if (user) {
      const parsed = JSON.parse(user);
      setCurrentUserId(parsed.id);
    }

    // 💡 Hardcode a receiverId for now
    // Replace this with a real user selection dropdown later
    setReceiverId("RECEIVER_USER_ID"); // 🧠 Replace this with real userId you want to chat with
  }, []);

  return (
    <div className={classes["container"]}>
      <h2>Logged in as: <span className="font-mono text-sm">{currentUserId}</span></h2>
      <div>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={classes["chat-input"]}
          type="text"
          placeholder="Message..."
        />
        <button
          onClick={() => {
            if (!receiverId) {
              alert("No receiver selected");
              return;
            }
            sendMessage(message, receiverId);
            setMessage("");
          }}
          className={classes["button"]}
        >
          Send
        </button>
      </div>

      <ul className={classes["message-list"]}>
        {messages.map((msg, i) => (
          <li key={i}>
            <span className={classes["sender"]}>{msg.senderId}</span>: {msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
