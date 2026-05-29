"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Bell } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
            onClick={() => user ? setShowMenu(!showMenu) : router.push("/login")}
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
          {showMenu && user && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-11 z-50 w-48 bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-[#8A8078] truncate">{user.email}</p>
                </div>
                {/* Menu items */}
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-[#242424] transition-colors"
                  >
                    Hồ sơ của tôi
                  </Link>
                  <Link
                    href="/generate"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-[#242424] transition-colors"
                  >
                    ✨ Tạo story AI
                  </Link>
                  <Link
                    href="/smart-lesson"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#F5F0EB] hover:bg-[#242424] transition-colors"
                  >
                    Smart Lesson AI
                  </Link>
                  <button
                    onClick={() => { signOut({ callbackUrl: "/" }); setShowMenu(false); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-[#E8634A] hover:bg-[#242424] transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
