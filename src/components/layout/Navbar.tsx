"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Bell } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";
import InstallAppMenuItem from "@/components/ui/InstallPrompt";
import SyncMenuItem from "@/components/ui/SyncMenuItem";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const user = session?.user;
  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16",
        "bg-[rgba(13,13,13,0.75)] backdrop-blur-xl",
        "border-b border-[rgba(255,255,255,0.06)]",
        "flex items-center justify-between px-4"
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        {/* Logo — đặt file logo vào public/logo.png */}
        <Image
          src="/logo.png"
          alt="MandoMood"
          width={36}
          height={36}
          className="rounded-full object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span className="font-playfair text-xl font-bold text-[#F5F0EB]">
          mando
        </span>
        <span className="font-playfair text-xl font-bold text-[#E8634A]">
          mood
        </span>
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle sáng/tối */}
        <ThemeToggle />

        {/* Search */}
        <button
          onClick={() => router.push("/search")}
          className="w-9 h-9 rounded-full bg-[#242424] flex items-center justify-center text-[#8A8078] hover:text-white transition-colors"
          aria-label="Tìm kiếm"
        >
          <Search size={16} />
        </button>

        {/* Notification — chỉ show khi đã login */}
        {user && (
          <button
            onClick={() => router.push("/notifications")}
            className="w-9 h-9 rounded-full bg-[#242424] flex items-center justify-center text-[#8A8078] hover:text-white transition-colors relative"
            aria-label="Thông báo"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E8634A] rounded-full" />
          </button>
        )}

        {/* Avatar / Login */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={cn(
              "w-9 h-9 rounded-full overflow-hidden flex items-center justify-center",
              "text-white text-sm font-semibold transition-all",
              user
                ? "ring-2 ring-[#E8634A]/50 hover:ring-[#E8634A]"
                : "bg-[#E8634A] hover:bg-[#d43f39]"
            )}
          >
            {user?.image ? (
              <Image src={user.image} alt={user.name ?? ""} width={36} height={36} />
            ) : (
              <span>{user ? initial : "+"}</span>
            )}
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-11 z-50 w-56 bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl overflow-hidden">
                {/* User info */}
                {user ? (
                <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-[#8A8078] truncate">{user.email}</p>
                  {(() => {
                    const u = user as { premiumSource?: string; trialDaysLeft?: number };
                    if (u.premiumSource === "paid")
                      return <p className="text-xs mt-1 text-[#D4AF37]">👑 Premium</p>;
                    if (u.premiumSource === "trial")
                      return <p className="text-xs mt-1 text-[#D4AF37]">🎁 Dùng thử Premium — còn {u.trialDaysLeft} ngày</p>;
                    return (
                      <Link href="/pricing" onClick={() => setShowMenu(false)}
                        className="text-xs mt-1 inline-block text-[#E8634A] hover:underline">
                        Hết hạn dùng thử — Nâng cấp 👑
                      </Link>
                    );
                  })()}
                </div>
                ) : (
                <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                  <p className="text-sm font-semibold text-[#E8634A] mb-2">Chưa đăng nhập</p>
                  <button onClick={() => { router.push("/login"); setShowMenu(false); }}
                    className="w-full py-2 bg-[#E8634A] text-white text-xs rounded-xl font-medium">
                    Đăng nhập / Đăng ký
                  </button>
                </div>
                )}
                {/* Menu items */}
                <div className="py-1 max-h-[70vh] overflow-y-auto">
                  {/* Hồ sơ */}
                  <Link href="/generate" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-surface2 transition-colors">
                    ✨ Tạo truyện AI
                  </Link>
                  <Link href="/feed" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-surface2 transition-colors">
                    📖 Feed bài học
                  </Link>
                  <Link href="/daily-plan" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-surface2 transition-colors">
                    📋 Kế hoạch hôm nay
                  </Link>
                  <Link href="/karaoke" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-surface2 transition-colors">
                    🎤 Karaoke luyện nghe & nói
                  </Link>
                  <Link href="/profile" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-surface2 transition-colors">
                    👤 Hồ sơ của tôi
                  </Link>
                  <Link href="/profile/report" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-surface2 transition-colors">
                    📊 Báo cáo học tập
                  </Link>
                  <Link href="/flashcards" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-surface2 transition-colors">
                    🎴 Flashcard SRS
                  </Link>
                  {/* Divider */}
                  <div className="border-t border-[rgba(255,255,255,0.06)] my-1" />
                  {/* Khám phá — toàn bộ công cụ gom về 1 trang */}
                  <Link href="/explore" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-surface2 transition-colors">
                    🧭 Khám phá công cụ
                  </Link>
                  <Link href="/ai-tutor" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-surface2 transition-colors">
                    🤖 AI Gia sư
                  </Link>
                  {/* Divider */}
                  <div className="border-t border-[rgba(255,255,255,0.06)] my-1" />
                  <InstallAppMenuItem onDone={() => setShowMenu(false)} />
                  {user && <SyncMenuItem onDone={() => setShowMenu(false)} />}
                  {/* Other */}
                  <Link href="/pricing" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#E8A838] hover:bg-surface2 transition-colors">
                    💎 Nâng cấp Premium
                  </Link>
                  <Link href="/blog" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-surface2 transition-colors">
                    📝 Blog học tiếng Trung
                  </Link>
                  <Link href="/about" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-surface2 transition-colors">
                    🌸 Về MandoMood
                  </Link>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(user as any)?.is_admin && (
                    <Link href="/admin" onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#8A9DC9] hover:bg-surface2 transition-colors">
                      🛡️ Bảng điều khiển Admin
                    </Link>
                  )}
                  {user && (
                  <button
                    onClick={() => { signOut({ callbackUrl: "/" }); setShowMenu(false); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-[#E8634A] hover:bg-surface2 transition-colors">
                    Đăng xuất
                  </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
