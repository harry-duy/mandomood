"use client";

/**
 * Nút chuyển theme sáng/tối.
 * - Lưu lựa chọn vào localStorage "mm_theme" (an toàn qua writeJSON-style).
 * - Đặt thuộc tính data-theme="light" trên <html>; mặc định (không có) = tối.
 * - Chống FOUC nhờ inline script trong layout <head> đọc cùng key.
 */

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "mm_theme";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  // Đồng bộ trạng thái ban đầu với DOM (script anti-FOUC đã chạy trước đó).
  useEffect(() => {
    setLight(document.documentElement.getAttribute("data-theme") === "light");
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    try {
      if (next) {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem(KEY, "light");
      } else {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem(KEY, "dark");
      }
    } catch {
      /* localStorage bị chặn — vẫn đổi giao diện trong phiên */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={light ? "Chuyển sang chế độ tối" : "Chuyển sang chế độ sáng"}
      aria-pressed={light}
      title={light ? "Chế độ tối" : "Chế độ sáng"}
      className="grid place-items-center w-9 h-9 rounded-full text-[#8A8078] hover:text-[#F5F0EB] hover:bg-surface2 transition-colors"
    >
      {light ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
