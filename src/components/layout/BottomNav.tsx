"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Users, GraduationCap, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/",           icon: Home,          label: "Trang chủ" },
  { href: "/feed",       icon: BookOpen,      label: "Học"       },
  { href: "/community",  icon: Users,         label: "Cộng đồng" },
  { href: "/flashcards", icon: GraduationCap, label: "Ôn tập"    },
  { href: "/profile",    icon: User,          label: "Hồ sơ"     },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 h-20",
      "glass border-t border-[rgba(255,255,255,0.06)]",
      "flex items-center justify-around px-4 pb-4"
    )}>
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link key={href} href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-all duration-200",
              isActive ? "text-mm-red" : "text-[var(--text-muted)] hover:text-white"
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8}
              className={cn(isActive && "drop-shadow-[0_0_8px_rgba(232,99,74,0.6)]")} />
            <span className={cn("text-[9px] font-medium", isActive && "font-semibold")}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
