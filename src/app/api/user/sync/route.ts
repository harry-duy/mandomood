/**
 * /api/user/sync — đồng bộ dữ liệu học giữa thiết bị (cần đăng nhập).
 *
 * GET  → trả bản cloud hiện tại (hoặc payload rỗng nếu chưa từng sync).
 * POST → body = SyncPayload từ localStorage của client.
 *        Server MERGE với bản cloud (lib/mergeSync — union, không mất tiến độ)
 *        rồi lưu và TRẢ VỀ bản merged → client ghi đè localStorage.
 *
 * Bảo vệ: auth bắt buộc, rate limit theo email, giới hạn kích thước body 256KB.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectDB } from "@/lib/mongodb";
import SyncData from "@/models/SyncData";
import { checkRateLimit } from "@/lib/ratelimit";
import User from "@/models/User";
import { EMPTY_SYNC, sanitizePayload, mergeSyncPayload, type SyncPayload } from "@/lib/mergeSync";

const MAX_BODY_BYTES = 256 * 1024;

async function requireEmail(): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (getServerSession as any)(authOptions);
  return session?.user?.email ?? null;
}

export async function GET() {
  try {
    const email = await requireEmail();
    if (!email) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    await connectDB();
    const doc = await SyncData.findOne({ user_email: email }).lean() as
      | { data?: SyncPayload; updated_at?: Date }
      | null;

    return NextResponse.json({
      data: sanitizePayload(doc?.data ?? EMPTY_SYNC),
      updatedAt: doc?.updated_at ?? null,
    });
  } catch (error) {
    console.error("[GET /api/user/sync]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const email = await requireEmail();
    if (!email) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    // 10 lần sync / phút / tài khoản là quá đủ
    if (!checkRateLimit(`sync:${email}`, 10)) {
      return NextResponse.json({ error: "Đồng bộ quá nhanh, thử lại sau 1 phút" }, { status: 429 });
    }

    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Dữ liệu quá lớn" }, { status: 413 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 });
    }
    const client = sanitizePayload(parsed);

    await connectDB();
    const doc = await SyncData.findOne({ user_email: email }).lean() as
      | { data?: SyncPayload }
      | null;
    const server = sanitizePayload(doc?.data ?? EMPTY_SYNC);

    const merged = mergeSyncPayload(server, client);

    const saved = await SyncData.findOneAndUpdate(
      { user_email: email },
      { $set: { data: merged } },
      { new: true, upsert: true }
    ).lean() as { updated_at?: Date } | null;

    // Cập nhật thành tích thi lên User (nguồn cho leaderboard) — best-effort,
    // lỗi không làm hỏng sync.
    try {
      const results = merged.testResults ?? [];
      if (results.length > 0) {
        const best = Math.max(...results.map((r) => Math.round((r.score / r.total) * 100)));
        await User.updateOne(
          { email },
          { $set: { test_best_pct: best, tests_taken: results.length } }
        );
      }
    } catch (e) {
      console.error("[sync] cập nhật thành tích thi:", e);
    }

    return NextResponse.json({ data: merged, updatedAt: saved?.updated_at ?? new Date() });
  } catch (error) {
    console.error("[POST /api/user/sync]", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
