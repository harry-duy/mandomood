/**
 * Type shims cho next-auth v4
 * Cần thiết vì bản cài trong node_modules bị thiếu .d.ts files
 * Tất cả types match với next-auth@4.24.x API
 */

// ─── next-auth core ───────────────────────────────────────────────────────────
declare module "next-auth" {
  export interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    expires: string;
    // extended fields từ callback
    dbUser?: {
      level: string;
      xp: number;
      streak_days: number;
      premium: boolean;
    };
  }

  export interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }

  export interface Account {
    provider: string;
    type: string;
    providerAccountId: string;
    access_token?: string;
    token_type?: string;
    scope?: string;
    id_token?: string;
  }

  export interface Profile {
    sub?: string;
    name?: string;
    email?: string;
    image?: string;
    picture?: string;
  }

  export interface NextAuthOptions {
    providers: import("next-auth/providers/index").Provider[];
    callbacks?: {
      signIn?: (params: { user: User; account: Account | null; profile?: Profile }) => Promise<boolean | string> | boolean | string;
      jwt?: (params: { token: JWT; user?: User; account?: Account | null }) => Promise<JWT> | JWT;
      session?: (params: { session: Session; token: JWT; user?: User }) => Promise<Session> | Session;
      redirect?: (params: { url: string; baseUrl: string }) => Promise<string> | string;
    };
    pages?: {
      signIn?: string;
      signOut?: string;
      error?: string;
      verifyRequest?: string;
      newUser?: string;
    };
    session?: {
      strategy?: "jwt" | "database";
      maxAge?: number;
    };
    secret?: string;
    debug?: boolean;
  }

  export interface JWT {
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    sub?: string;
    iat?: number;
    exp?: number;
    jti?: string;
    [key: string]: unknown;
  }

  export function getServerSession(options?: NextAuthOptions): Promise<Session | null>;

  export default function NextAuth(
    options: NextAuthOptions
  ): {
    GET: import("next/server").NextResponse | unknown;
    POST: import("next/server").NextResponse | unknown;
  };
}

// ─── next-auth/react ─────────────────────────────────────────────────────────
declare module "next-auth/react" {
  import type { Session } from "next-auth";
  import type { ReactNode } from "react";

  export interface SessionContextValue {
    data: Session | null;
    status: "loading" | "authenticated" | "unauthenticated";
    update: (data?: unknown) => Promise<Session | null>;
  }

  export function useSession(): SessionContextValue;

  export function signIn(
    provider?: string,
    options?: { callbackUrl?: string; redirect?: boolean; [key: string]: unknown }
  ): Promise<{ error?: string; ok?: boolean; url?: string } | undefined>;

  export function signOut(options?: {
    callbackUrl?: string;
    redirect?: boolean;
  }): Promise<{ url?: string }>;

  export function SessionProvider(props: {
    children: ReactNode;
    session?: Session | null;
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
  }): JSX.Element;

  export function getSession(params?: { req?: unknown }): Promise<Session | null>;
}

// ─── next-auth/providers/google ──────────────────────────────────────────────
declare module "next-auth/providers/google" {
  interface GoogleProviderOptions {
    clientId: string;
    clientSecret: string;
    authorization?: string | { params?: Record<string, string> };
    profile?: (profile: Record<string, unknown>) => unknown;
  }
  export default function GoogleProvider(options: GoogleProviderOptions): unknown;
}

// ─── next-auth/providers/index ───────────────────────────────────────────────
declare module "next-auth/providers/index" {
  export type Provider = unknown;
}
