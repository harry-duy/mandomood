/**
 * adminAuth — NGUỒN CHÂN LÝ DUY NHẤT cho việc kiểm tra quyền admin. PURE, test được.
 *
 * Vì sao cần: trước đây mỗi route admin (`/api/admin/users`, `/export`, `/analytics`,
 * `/feedback`) tự build danh sách + tự so email. Hai route lowercase cả 2 vế
 * (case-insensitive), hai route KHÔNG → cùng một admin có thể vào trang này nhưng
 * bị 401 ở trang kia nếu ADMIN_EMAILS hoặc email provider có chữ HOA. Email vốn
 * không phân biệt hoa thường → chuẩn hoá về lowercase ở MỘT chỗ để mọi route nhất quán.
 */

const DEFAULT_ADMIN = "ngothanhduy04@gmail.com";

/** Danh sách email admin (đã trim + lowercase + bỏ rỗng) từ ADMIN_EMAILS. */
export function getAdminEmails(env: string | undefined = process.env.ADMIN_EMAILS): string[] {
  return (env ?? DEFAULT_ADMIN)
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Email này có quyền admin không (so sánh KHÔNG phân biệt hoa thường). */
export function isAdminEmail(
  email: string | null | undefined,
  env: string | undefined = process.env.ADMIN_EMAILS
): boolean {
  const e = (email ?? "").trim().toLowerCase();
  return e !== "" && getAdminEmails(env).includes(e);
}
