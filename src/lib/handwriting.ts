/**
 * handwriting.ts — Nhận dạng chữ Hán viết tay (license-safe, không phụ thuộc GPL).
 *
 * Ý tưởng: so khớp các nét người dùng vẽ với "medians" (đường tâm nét) của
 * từng chữ ứng viên — dữ liệu lấy từ hanzi-writer (MIT). Thuật toán dựa trên
 * $1 Unistroke Recognizer (resample + chuẩn hoá + khoảng cách trung bình).
 *
 * Tất cả hàm ở đây là PURE (không DOM) để dễ test và tái dùng.
 */

export type Point = [number, number];
export type Stroke = Point[];

/** Resample một nét thành đúng n điểm cách đều theo chiều dài cung. */
export function resample(points: Stroke, n: number): Stroke {
  if (points.length === 0) return [];
  if (points.length === 1) {
    return Array.from({ length: n }, () => [points[0][0], points[0][1]] as Point);
  }
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  const out: Stroke = [[points[0][0], points[0][1]]];
  if (total === 0) {
    while (out.length < n) out.push([points[0][0], points[0][1]]);
    return out;
  }
  const interval = total / (n - 1);
  let prev: Point = [points[0][0], points[0][1]];
  let D = 0;
  let i = 1;
  while (out.length < n - 1 && i < points.length) {
    const d = Math.hypot(points[i][0] - prev[0], points[i][1] - prev[1]);
    if (d === 0) {
      i++;
      continue;
    }
    if (D + d >= interval) {
      const t = (interval - D) / d;
      const np: Point = [
        prev[0] + (points[i][0] - prev[0]) * t,
        prev[1] + (points[i][1] - prev[1]) * t,
      ];
      out.push(np);
      prev = np;
      D = 0;
    } else {
      D += d;
      prev = [points[i][0], points[i][1]];
      i++;
    }
  }
  while (out.length < n) out.push([points[points.length - 1][0], points[points.length - 1][1]]);
  return out;
}

/**
 * Chuẩn hoá toàn bộ các nét vào ô vuông [0,1]×[0,1], giữ tỉ lệ (uniform scale),
 * căn giữa. Nhờ vậy vị trí tương đối giữa các nét được bảo toàn.
 */
export function normalizeStrokes(strokes: Stroke[]): Stroke[] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let count = 0;
  for (const s of strokes) {
    for (const [x, y] of s) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      count++;
    }
  }
  if (count === 0) return strokes;
  const w = maxX - minX;
  const h = maxY - minY;
  const scale = Math.max(w, h) || 1;
  const offX = (scale - w) / 2;
  const offY = (scale - h) / 2;
  return strokes.map((s) =>
    s.map(([x, y]) => [(x - minX + offX) / scale, (y - minY + offY) / scale] as Point)
  );
}

const SAMPLES = 16; // số điểm mỗi nét khi so khớp

/** Khoảng cách trung bình giữa 2 nét đã resample (lấy min của 2 chiều). */
function strokeDistance(a: Stroke, b: Stroke): number {
  const ra = resample(a, SAMPLES);
  const rb = resample(b, SAMPLES);
  let fwd = 0;
  let rev = 0;
  for (let i = 0; i < SAMPLES; i++) {
    fwd += Math.hypot(ra[i][0] - rb[i][0], ra[i][1] - rb[i][1]);
    rev += Math.hypot(ra[i][0] - rb[SAMPLES - 1 - i][0], ra[i][1] - rb[SAMPLES - 1 - i][1]);
  }
  return Math.min(fwd, rev) / SAMPLES;
}

/**
 * Chấm điểm 1 ứng viên: điểm CÀNG NHỎ càng giống.
 * - `userNorm`, `refNorm`: các nét đã chuẩn hoá.
 * - Phạt theo chênh lệch số nét; bỏ qua nếu lệch quá nhiều.
 */
export function scoreCandidate(userNorm: Stroke[], refNorm: Stroke[]): number {
  const countDiff = Math.abs(userNorm.length - refNorm.length);
  if (countDiff > 2) return Infinity; // khác số nét quá nhiều → loại
  const pairs = Math.min(userNorm.length, refNorm.length);
  if (pairs === 0) return Infinity;
  let sum = 0;
  for (let i = 0; i < pairs; i++) {
    sum += strokeDistance(userNorm[i], refNorm[i]);
  }
  const avg = sum / pairs;
  return avg + countDiff * 0.15; // mỗi nét lệch +0.15
}

/**
 * Chuyển medians của hanzi-writer (gốc toạ độ y hướng LÊN, 0..1024) sang hệ
 * toạ độ màn hình (y hướng XUỐNG) rồi chuẩn hoá. Trả về các nét đã chuẩn hoá.
 */
export function prepareReference(medians: number[][][]): Stroke[] {
  const flipped: Stroke[] = medians.map((stroke) =>
    stroke.map(([x, y]) => [x, 1024 - y] as Point)
  );
  return normalizeStrokes(flipped);
}

export interface RecognitionResult {
  char: string;
  score: number;
}

/**
 * So khớp nét người dùng với tập ứng viên đã chuẩn hoá sẵn.
 * Trả về `topK` kết quả tốt nhất (điểm tăng dần).
 */
export function recognize(
  userStrokes: Stroke[],
  candidates: { char: string; refNorm: Stroke[] }[],
  topK = 8
): RecognitionResult[] {
  const userNorm = normalizeStrokes(userStrokes);
  const scored: RecognitionResult[] = [];
  for (const c of candidates) {
    const score = scoreCandidate(userNorm, c.refNorm);
    if (Number.isFinite(score)) scored.push({ char: c.char, score });
  }
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, topK);
}
