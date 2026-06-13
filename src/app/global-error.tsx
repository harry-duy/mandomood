"use client";

/**
 * Global Error Boundary — bắt lỗi xảy ra ngay trong root layout.
 * Phải tự render <html>/<body> vì layout gốc đã hỏng.
 */

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MandoMood] Global error:", error);
  }, [error]);

  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0D0D0D",
          color: "#F5F0EB",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, color: "#E8504A", marginBottom: 16 }}>误</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Đã có lỗi nghiêm trọng</h1>
        <p style={{ fontSize: 14, color: "#8A8078", maxWidth: 320, marginBottom: 24 }}>
          Ứng dụng gặp sự cố. Vui lòng tải lại trang.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "12px 28px",
            borderRadius: 16,
            background: "#E8504A",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
          }}
        >
          Tải lại
        </button>
      </body>
    </html>
  );
}
