"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/firebase/auth";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-white/80 hover:text-white border border-white/30 hover:border-white/60 px-3 py-1.5 rounded-lg transition-colors"
    >
      Đăng xuất
    </button>
  );
}