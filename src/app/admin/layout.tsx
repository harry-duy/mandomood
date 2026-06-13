"use client";

/**
 * Admin Layout — bảo vệ toàn bộ /admin/* routes
 * Chỉ user có is_admin === true mới được vào
 * Redirect về /login nếu chưa đăng nhập, về / nếu không phải admin
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session?.user as any)?.is_admin === true;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/admin/feedback");
      return;
    }
    if (status === "authenticated" && !isAdmin) {
      router.replace("/");
    }
  }, [status, isAdmin, router]);

  // Loading
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E8504A]/30 border-t-[#E8504A] rounded-full animate-spin" />
      </div>
    );
  }

  // Không phải admin
  if (status === "authenticated" && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <Shield size={40} className="mx-auto text-red-400 opacity-60" />
          <p className="text-lg font-semibold">Không có quyền truy cập</p>
          <p className="text-sm text-[var(--text-muted)]">
            Trang này chỉ dành cho Admin
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return <>{children}</>;
}
