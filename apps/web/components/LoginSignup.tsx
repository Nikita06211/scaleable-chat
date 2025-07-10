"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const LoginSignup: React.FC = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/api/auth", {
        username,
      });

      if (res.data?.user?.id) {
        localStorage.setItem("chat-user", JSON.stringify(res.data.user));
        router.push("/chat");
      } else {
        setError("User creation failed. Invalid response.");
      }
    } catch (err: any) {
      setError("Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-blue-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome to Chat App</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md transition-all duration-200"
          >
            Continue
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          Don't worry, we’ll remember your username ✨
        </p>
      </div>
    </div>
  );
};

export default LoginSignup;
