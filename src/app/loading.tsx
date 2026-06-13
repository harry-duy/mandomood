/**
 * Root loading UI — hiện ngay khi điều hướng / SSR đang tải.
 * Cải thiện perceived performance cho toàn app.
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6">
      <div className="relative w-16 h-16 mb-5">
        <div className="absolute inset-0 rounded-2xl border-2 border-[rgba(255,255,255,0.06)]" />
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-[#E8504A] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-[#E8504A] select-none">
          中
        </div>
      </div>
      <p className="text-sm text-[#8A8078]">Đang tải…</p>
    </div>
  );
}
