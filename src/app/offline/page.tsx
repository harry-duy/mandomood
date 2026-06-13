import Link from "next/link";

export const metadata = {
  title: "Ngoại tuyến · MandoMood",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="text-5xl mb-4">🌙</div>
      <h1 className="font-playfair text-2xl font-bold mb-2">Bạn đang ngoại tuyến</h1>
      <p className="text-sm text-[var(--text-muted)] max-w-xs mb-6">
        Không có kết nối mạng. Những câu chuyện bạn đã tạo vẫn được lưu trên máy —
        hãy mở lại khi có mạng để đồng bộ và tạo nội dung mới.
      </p>
      <Link
        href="/"
        className="btn-primary px-5 py-3 rounded-2xl text-sm font-semibold"
      >
        Thử lại
      </Link>
    </div>
  );
}
