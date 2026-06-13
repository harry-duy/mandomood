// ESLint v9 flat config — chuẩn Next.js 16 (next lint đã bị gỡ ở Next 16,
// chạy bằng: npm run lint  →  eslint .)
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Cảnh báo cosmetic đã biết (PROGRESS_LOG đợt soát lỗi tĩnh)
      "no-duplicate-imports": "warn",
      // Rule mới của react-hooks v7. Pattern của dự án là hydrate state từ
      // localStorage trong useEffect (SSR-safe — server không có localStorage),
      // setState đồng bộ ở đó là chủ đích. Hạ error → warn để lint không fail;
      // chỗ nào refactor được sang useSyncExternalStore thì làm dần.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/**",
    "scripts/**",
  ]),
]);
