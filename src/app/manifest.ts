import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MandoMood — Học tiếng Trung qua cảm xúc",
    short_name: "MandoMood",
    description: "Học tiếng Trung qua câu chuyện, cảm xúc và cuộc sống thật.",
    start_url: "/",
    display: "standalone",
    background_color: "#0D0D0D",
    theme_color: "#E8504A",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["education", "lifestyle"],
    lang: "vi",
  };
}
