"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SocketProvider } from "../context/SocketProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const isAuthPage = pathname === "/login";

  useEffect(() => {
    if (isAuthPage) return; // skip user lookup on login page

    const user = localStorage.getItem("chat-user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserId(parsed.id);
    }
  }, [isAuthPage]);

  // ✅ Let login render without blocking
  if (!isAuthPage && !userId) {
    return <p className="text-center mt-10">Loading user...</p>;
  }

  return isAuthPage ? (
    <>{children}</>
  ) : (
    <SocketProvider userId={userId!}>{children}</SocketProvider>
  );
}
