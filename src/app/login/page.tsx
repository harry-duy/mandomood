"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/feed" });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-mm-red/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-playfair text-4xl font-bold mb-2">
            Mando<span className="text-mm-red">Mood</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm font-light">
            Học tiếng Trung qua cảm xúc & câu chuyện
          </p>
        </div>

        {/* Quote teaser */}
        <div className="card text-center mb-8">
          <p className="font-chinese text-2xl font-bold text-mm-gold mb-1">
            有缘再见
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-0.5">Yǒu yuán zàijiàn</p>
          <p className="text-sm text-[var(--text-muted)] italic">
            "Nếu có duyên thì gặp lại"
          </p>
        </div>

        {/* Login options */}
        <div className="space-y-3">
          {/* Google */}
          <motion.button
            onClick={handleGoogleLogin}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl",
              "bg-white text-gray-800 font-semibold text-sm",
              "hover:bg-gray-100 transition-all duration-200",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            {/* Google icon */}
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            {loading ? "Đang đăng nhập..." : "Tiếp tục với Google"}
          </motion.button>

          {/* Skip / Guest */}
          <button
            onClick={() => window.location.href = "/"}
            className="w-full py-3 text-sm text-[var(--text-muted)] hover:text-white transition-colors"
          >
            Dùng thử không đăng nhập →
          </button>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6 leading-relaxed">
          Bằng cách đăng nhập, bạn đồng ý với{" "}
          <span className="text-mm-gold">Điều khoản sử dụng</span> và{" "}
          <span className="text-mm-gold">Chính sách bảo mật</span> của MandoMood.
        </p>
      </motion.div>
    </div>
  );
}
