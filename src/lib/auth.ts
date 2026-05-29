/**
 * Auth utilities - helpers dung chung
 * next-auth v4: getServerSession(authOptions)
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "./mongodb";
import User from "@/models/User";

export async function getSessionUser() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (getServerSession as any)(authOptions);
  if (!session?.user?.email) return null;
  await connectDB();
  return User.findOne({ email: session.user.email }).lean();
}

export function requireAuth(
  handler: (req: NextRequest, user: Record<string, unknown>) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await (getServerSession as any)(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });
    }
    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return NextResponse.json({ error: "User khong ton tai" }, { status: 401 });
    }
    return handler(req, user as Record<string, unknown>);
  };
}
