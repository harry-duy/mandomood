/**
 * hsk-data — kho từ vựng HSK 1-6 dùng chung (580 từ: HSK1=150, HSK2=150, HSK3=100, HSK4-6=60/cấp)
 * (dùng bởi /hsk, /dictation, /search, fallback /character và các tính năng luyện tập khác)
 *
 * Từ đợt 20: dữ liệu tách theo cấp trong src/lib/hsk/levelN.ts — file này chỉ là barrel,
 * mọi import cũ `@/lib/hsk-data` giữ nguyên. Thêm từ mới: sửa đúng file cấp tương ứng.
 */
import type { HSKWord } from "./hsk/types";
import { HSK1 } from "./hsk/level1";
import { HSK2 } from "./hsk/level2";
import { HSK3 } from "./hsk/level3";
import { HSK4 } from "./hsk/level4";
import { HSK5 } from "./hsk/level5";
import { HSK6 } from "./hsk/level6";

export type { HSKWord } from "./hsk/types";

export const HSK_DATA: Record<number, HSKWord[]> = {
  1: HSK1,
  2: HSK2,
  3: HSK3,
  4: HSK4,
  5: HSK5,
  6: HSK6,
};
