/**
 * NextAuth authOptions — tách ra file riêng
 * Tránh import từ path [..nextauth] có spread syntax gây lỗi TypeScript
 */

import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { connectDB } from "./mongodb";
import User from "@/models/User";

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
          await User.create({
            email: user.email,
            name: user.name ?? "Nguoi hoc",
            image: user.image,
            provider: "google",
          });
        } else {
          await User.findOneAndUpdate(
            { email: user.email },
            { last_active: new Date() }
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
            // Expose premium trực tiếp trên session.user để PremiumGate dùng
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (session.user as any).premium = u.premium ?? false;
          }
        } catch (e) {
          console.error("[NextAuth session]", e);
        }
      }
      return session;
    },
  },

  pages: { signIn: "/login", error: "/login" },

  secret: process.env.NEXTAUTH_SECRET ?? "mandomood-dev-secret",
};
