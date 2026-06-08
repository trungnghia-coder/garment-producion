"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate @nitimo.com domain
    if (!email.endsWith("@nitimo.com")) {
      setError("Vui lòng sử dụng email công ty @nitimo.com");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      setLoading(false);
      return;
    }

    // TODO: Replace with Firebase Auth
    // Temporary mock auth
    await new Promise((r) => setTimeout(r, 800));
    router.push("/dashboard");
    setLoading(false);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left — brand image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#8B1A1A]">
        {/* Replace with actual model image */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B1A1A] via-[#6d1515] to-[#3d0b0b]" />

        {/* Overlay pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="NITIMO"
            width={140}
            height={46}
            className="object-contain object-left"
            priority
          />

          {/* Bottom text */}
          <div>
            <h2 className="text-white text-3xl font-bold leading-snug">
              Quản lý công đoạn
              <br />
              sản xuất chuyên nghiệp
            </h2>
            <p className="text-white/60 text-sm mt-3">
              Hệ thống quản lý nội bộ — NITIMO Fashion
            </p>
          </div>
        </div>

        <Image
          src="/hero-banner.png"
          alt="NITIMO Fashion"
          fill
          className="object-cover"
          priority
        />
       
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 bg-white">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Image
              src="/logo-color.png"
              alt="NITIMO"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-3xl text-center font-bold text-gray-900 mb-1">
            Đăng nhập
          </h1>
          <p className="text-sm text-center text-gray-500 mb-8">
            Sử dụng tài khoản công ty để tiếp tục
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-medium text-gray-700">
                Email công ty
              </label>
              <input
                type="email"
                placeholder="ten@nitimo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-3.5 py-2.5 text-base border border-gray-200 rounded-lg outline-none focus:border-[#8B1A1A] focus:ring-2 focus:ring-[#8B1A1A]/10 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="px-3.5 py-2.5 text-base border border-gray-200 rounded-lg outline-none focus:border-[#8B1A1A] focus:ring-2 focus:ring-[#8B1A1A]/10 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 text-sm font-semibold text-white bg-[#8B1A1A] rounded-lg hover:bg-[#7a1616] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-8">
            Chỉ dành cho nhân viên NITIMO.
            <br />
            Liên hệ quản trị viên nếu quên mật khẩu.
          </p>
        </div>
      </div>
    </div>
  );
}