/**
 * daily.ts — tiện ích xoay vòng nội dung theo ngày (PURE, không I/O).
 */

/** Chỉ số xoay vòng theo ngày-trong-năm, luôn nằm trong [0, poolLength). */
export function dailyRotationIndex(date: Date, poolLength: number): number {
  if (poolLength <= 0) return 0;
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return ((dayOfYear % poolLength) + poolLength) % poolLength;
}
