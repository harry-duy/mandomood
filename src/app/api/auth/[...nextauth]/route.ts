/**
 * NextAuth v4 Route Handler
 * authOptions lives in src/lib/auth-config.ts (clean path, no spread confusion)
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = NextAuth(authOptions) as any;
export const GET = handler;
export const POST = handler;
