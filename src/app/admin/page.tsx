"use client";
/**
 * /admin — Trang chủ khu vực Admin. Layout (admin/layout.tsx) đã chặn non-admin.
 * Liên kết tới các công cụ: thống kê người dùng, analytics web, phản hồi.
 */
import Link from "next/link";
import { Users, TrendingUp, MessageSquare, Shield, ChevronRight } from "lucide-react";

const SECTIONS = [
  { href: "/admin/users", icon: Users, title: "Thống kê người dùng", desc: "Tổng số, premium, đăng ký mới, hoạt động, top XP" },
  { href: "/admin/analytics", icon: TrendingUp, title: "Analytics web", desc: "Lượt xem, khách, nguồn UTM, phễu chuyển đổi (30 ngày)" },
  { href: "/admin/feedback", icon: MessageSquare, title: "Phản hồi người dùng", desc: "Xem feedback gửi từ widget trong app" },
];

export default function AdminHomePage() {
  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
        <Shield className="w-6 h-6 text-mm-red" /> Bảng điều khiển Admin
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">Công cụ quản trị MandoMood</p>

      <div className="space-y-3">
        {SECTIONS.map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-surface p-4 hover:bg-surface2 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mm-red/12">
              <Icon size={18} className="text-mm-red" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
              <p className="text-[11px] text-[var(--text-muted)]">{desc}</p>
            </div>
            <ChevronRight size={18} className="text-[var(--text-muted)] shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
