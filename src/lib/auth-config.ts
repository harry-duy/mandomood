/**
 * NextAuth authOptions — tách ra file riêng
 * Tránh import từ path [..nextauth] có spread syntax gây lỗi TypeScript
 */

import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { connectDB } from "./mongodb";
import User from "@/models/User";
import { premiumSource, daysLeft, trialEndDate } from "@/lib/premium";
import { isAdminEmail } from "@/lib/adminAuth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user }: any) {
      if (!user?.email) return false;
      try {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          // Tài khoản mới → tặng 30 ngày Premium trial (hết hạn tự khóa, mua ở /pricing)
          await User.create({
            email: user.email,
            name: user.name ?? "Người học",
            image: user.image,
            provider: "google",
            trial_until: trialEndDate(),
          });
        } else {
          // Tài khoản cũ chưa từng có trial và chưa premium → tặng nốt 1 lần
          const grantTrial = !existing.trial_until && !existing.premium;
          await User.findOneAndUpdate(
            { email: user.email },
            {
              last_active: new Date(),
              ...(grantTrial ? { trial_until: trialEndDate() } : {}),
            }
          );
        }
        return true;
      } catch (e) {
        console.error("[NextAuth signIn]", e);
        return true;
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user?.email) token.email = user.email;
      return token;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session?.user && token?.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email }).lean();
          if (dbUser) {
            const u = dbUser as Record<string, unknown>;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (session as any).dbUser = {
              level: u.level,
              xp: u.xp,
              streak_days: u.streak_days,
              premium: u.premium,
              weekly_xp: u.weekly_xp,
            };
            // Premium HIỆU LỰC: paid còn hạn (lifetime nếu không có premium_until)
            // HOẶC trial còn hạn. Hết cả hai → false (khóa tính năng Premium).
            const source = premiumSource({
              premium: u.premium as boolean | undefined,
              premium_until: u.premium_until as Date | undefined,
              trial_until: u.trial_until as Date | undefined,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (session.user as any).premium = source !== null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (session.user as any).premiumSource = source; // "paid" | "trial" | null
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (session.user as any).trialDaysLeft = source === "trial"
              ? daysLeft(u.trial_until as Date | undefined)
              : 0;
            // Expose is_admin — dùng helper CHUNG (case-insensitive) để KHỚP authz ở
            // các route admin. Trước đây so case-sensitive → admin có chữ HOA trong
            // email bị ẩn toàn bộ UI admin dù API (đã sửa) cho phép.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (session.user as any).is_admin = isAdminEmail(token.email as string);
          }
        } catch (e) {
          console.error("[NextAuth session]", e);
        }
      }
      return session;
    },
  },

  pages: { signIn: "/login", error: "/login" },

  // JWT session (không dùng DB adapter) — phù hợp với MongoDB tự quản
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 ngày

  // CẢNH BÁO: production BẮT BUỘC set NEXTAUTH_SECRET (nếu không, JWT có thể bị giả mạo).
  secret:
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "production"
      ? (() => { throw new Error("NEXTAUTH_SECRET là bắt buộc ở production"); })()
      : "mandomood-dev-secret"),
};
