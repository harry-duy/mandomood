/**
 * GET /api/admin/users/export — Xuất toàn bộ user ra CSV (chỉ ADMIN_EMAILS).
 * Tải về file users-YYYY-MM-DD.csv. Có BOM UTF-8 để Excel đọc tiếng Việt đúng.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { buildUserFilter } from "@/lib/adminUserFilter";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "ngothanhduy04@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase());

/** Bọc 1 ô CSV: escape dấu " và bọc trong "..." nếu chứa , " xuống dòng. */
function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function iso(d: unknown): string {
  if (!d) return "";
  const date = new Date(d as string);
  return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (getServerSession as any)(authOptions) as { user?: { email?: string } } | null;
  const email = (session?.user?.email ?? "").toLowerCase();
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    // Tôn trọng bộ lọc admin đang chọn (q/tier/level). Không filter → xuất tất cả.
    const sp = req.nextUrl.searchParams;
    const { query } = buildUserFilter(
      { q: sp.get("q") ?? "", tier: sp.get("tier") ?? "", level: sp.get("level") ?? "" }
    );
    const users = await User.find(query)
      .select("name email provider level xp streak_days premium premium_until created_at last_active")
      .sort({ created_at: -1 })
      .limit(10000)
      .lean() as Record<string, unknown>[];

    const header = [
      "name", "email", "provider", "level", "xp", "streak_days",
      "premium", "premium_until", "created_at", "last_active",
    ];
    const rows = users.map((u) => [
      csvCell(u.name), csvCell(u.email), csvCell(u.provider), csvCell(u.level),
      csvCell(u.xp ?? 0), csvCell(u.streak_days ?? 0),
      csvCell(u.premium ? "yes" : "no"), csvCell(iso(u.premium_until)),
      csvCell(iso(u.created_at)), csvCell(iso(u.last_active)),
    ].join(","));

    const csv = "﻿" + [header.join(","), ...rows].join("\r\n");
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="mandomood-users-${date}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[GET /api/admin/users/export]", e);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
