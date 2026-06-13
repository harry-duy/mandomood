"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { playTTS } from "@/hooks/useTTS";
import { useProgress } from "@/hooks/useProgress";
import {
  Volume2, CheckCircle, XCircle, Flame, Trophy,
  ChevronRight, RefreshCw, Calendar, Lock
} from "lucide-react";
import { cn, readJSON, writeJSON } from "@/lib/utils";

/* ─── Challenge types ─── */
type ChallengeType = "multiple_choice" | "fill_blank" | "listen_pick" | "translate";

interface Challenge {
  type: ChallengeType;
  question: string;
  answer: string;
  options?: string[];
  pinyin?: string;
  hint?: string;
  xp: number;
}

/* ─── Daily seed: deterministic from date ─── */
function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function seededRandom(seed: number, n: number): number {
  const x = Math.sin(seed + n) * 10000;
  return x - Math.floor(x);
}

/* ─── Pool of 40 challenges ─── */
const POOL: Challenge[] = [
  { type: "multiple_choice", question: "我__喜欢你。(Tôi cũng thích bạn.)", answer: "也", options: ["也", "都", "很", "再"], pinyin: "yě", xp: 10 },
  { type: "multiple_choice", question: "她__漂亮。(Cô ấy rất đẹp.)", answer: "很", options: ["很", "也", "太", "比"], pinyin: "hěn", xp: 10 },
  { type: "multiple_choice", question: "今天__冷了。(Hôm nay trở lạnh rồi.)", answer: "变", options: ["变", "是", "很", "比"], pinyin: "biàn", xp: 10 },
  { type: "multiple_choice", question: "我__去过北京。(Tôi chưa từng đến Bắc Kinh.)", answer: "没", options: ["没", "不", "别", "无"], pinyin: "méi", xp: 10 },
  { type: "multiple_choice", question: "虽然很难，__是很有趣。(Mặc dù khó nhưng rất thú vị.)", answer: "但", options: ["但", "因", "所", "如"], pinyin: "dàn", xp: 10 },
  { type: "multiple_choice", question: "他跑得很__。(Anh ấy chạy rất nhanh.)", answer: "快", options: ["快", "好", "多", "高"], pinyin: "kuài", xp: 10 },
  { type: "multiple_choice", question: "请把书__在桌子上。(Đặt sách lên bàn.)", answer: "放", options: ["放", "买", "看", "给"], pinyin: "fàng", xp: 10 },
  { type: "multiple_choice", question: "我的钱包被__了。(Ví của tôi bị mất cắp.)", answer: "偷", options: ["偷", "丢", "坏", "拿"], pinyin: "tōu", xp: 10 },
  { type: "fill_blank", question: "每天早上她都喝一杯___啡。", answer: "咖", hint: "kā (cà phê)", xp: 15 },
  { type: "fill_blank", question: "我___欢学习汉语。", answer: "喜", hint: "xǐ", xp: 15 },
  { type: "fill_blank", question: "___然很累，但是很开心。", answer: "虽", hint: "suī (mặc dù)", xp: 15 },
  { type: "fill_blank", question: "他比我高___了。(Hơn nhiều)", answer: "多", hint: "duō", xp: 15 },
  { type: "fill_blank", question: "请把门关___。(Đóng lại)", answer: "上", hint: "shàng (hướng lên/vào)", xp: 15 },
  { type: "fill_blank", question: "我去___北京两次。(Đã từng)", answer: "过", hint: "guò", xp: 15 },
  { type: "fill_blank", question: "因为下雨，所___我没出去。", answer: "以", hint: "yǐ (vì vậy)", xp: 15 },
  { type: "fill_blank", question: "他唱歌唱___很好听。(Bổ ngữ mức độ)", answer: "得", hint: "de", xp: 15 },
  { type: "translate", question: "Xin chào", answer: "你好", options: ["你好", "再见", "谢谢", "对不起"], pinyin: "nǐ hǎo", xp: 10 },
  { type: "translate", question: "Cảm ơn bạn", answer: "谢谢你", options: ["你好吗", "谢谢你", "没问题", "不客气"], pinyin: "xiè xiè nǐ", xp: 10 },
  { type: "translate", question: "Tôi yêu bạn", answer: "我爱你", options: ["我喜欢你", "我爱你", "我想你", "我需要你"], pinyin: "wǒ ài nǐ", xp: 10 },
  { type: "translate", question: "Mùa xuân đến rồi", answer: "春天来了", options: ["夏天来了", "春天来了", "秋天来了", "冬天来了"], pinyin: "chūntiān lái le", xp: 10 },
  { type: "translate", question: "Thành công", answer: "成功", options: ["失败", "成功", "努力", "坚持"], pinyin: "chénggōng", xp: 10 },
  { type: "translate", question: "Duyên phận", answer: "缘分", options: ["命运", "缘分", "感情", "关系"], pinyin: "yuánfèn", xp: 10 },
  { type: "translate", question: "Nỗi nhớ / nhớ nhung", answer: "思念", options: ["喜欢", "思念", "爱情", "感动"], pinyin: "sīniàn", xp: 10 },
  { type: "translate", question: "Kiên trì", answer: "坚持", options: ["放弃", "坚持", "努力", "成功"], pinyin: "jiānchí", xp: 10 },
  { type: "listen_pick", question: "Nghe và chọn nghĩa đúng của: 平静", answer: "Bình yên / bình tĩnh", options: ["Bình yên / bình tĩnh", "Hạnh phúc", "Buồn bã", "Vui vẻ"], pinyin: "píngjìng", xp: 15 },
  { type: "listen_pick", question: "Nghe và chọn nghĩa đúng của: 沉淀", answer: "Lắng đọng / tích lũy", options: ["Bay lên cao", "Lắng đọng / tích lũy", "Tan biến", "Thay đổi"], pinyin: "chéndiàn", xp: 15 },
  { type: "listen_pick", question: "Nghe và chọn nghĩa đúng của: 顿悟", answer: "Chợt hiểu / đốn ngộ", options: ["Chậm hiểu", "Chợt hiểu / đốn ngộ", "Không hiểu", "Hiểu từ từ"], pinyin: "dùnwù", xp: 15 },
  { type: "listen_pick", question: "Nghe và chọn nghĩa đúng của: 蜕变", answer: "Lột xác / biến đổi", options: ["Không thay đổi", "Lột xác / biến đổi", "Tiến bộ nhỏ", "Thụt lùi"], pinyin: "tuìbiàn", xp: 15 },
  { type: "listen_pick", question: "Nghe và chọn nghĩa đúng của: 绽放", answer: "Nở rộ / tỏa sáng", options: ["Tàn phai", "Nở rộ / tỏa sáng", "Im lặng", "Ẩn mình"], pinyin: "zhànfàng", xp: 15 },
  { type: "multiple_choice", question: "连小孩__会做这道题。(Ngay cả trẻ con cũng làm được.)", answer: "都", options: ["都", "也", "还", "很"], pinyin: "dōu", xp: 20 },
  { type: "multiple_choice", question: "要成功，__要努力。(Muốn thành công thì phải nỗ lực.)", answer: "就", options: ["就", "才", "都", "也"], pinyin: "jiù", xp: 20 },
  { type: "fill_blank", question: "他内心充满了矛___。(Mâu thuẫn)", answer: "盾", hint: "dùn", xp: 20 },
  { type: "fill_blank", question: "岁月流___，青春不再。(Trôi qua)", answer: "逝", hint: "shì", xp: 20 },
  { type: "translate", question: "Thấu hiểu / cảm ngộ", answer: "感悟", options: ["感动", "感悟", "感谢", "感情"], pinyin: "gǎnwù", xp: 20 },
  { type: "translate", question: "Truyền thừa / kế thừa", answer: "传承", options: ["传统", "传承", "传播", "传说"], pinyin: "chuánchéng", xp: 20 },
  { type: "listen_pick", question: "Nghe và chọn nghĩa đúng của: 领悟", answer: "Lĩnh hội / giác ngộ", options: ["Lĩnh hội / giác ngộ", "Chỉ huy", "Lãnh thổ", "Cầm đầu"], pinyin: "lǐngwù", xp: 20 },
  { type: "multiple_choice", question: "这件事很__要，你要注意。(Quan trọng)", answer: "重", options: ["重", "难", "大", "多"], pinyin: "zhòng", xp: 15 },
  { type: "fill_blank", question: "我们要尊___他人。(Tôn trọng)", answer: "重", hint: "zhòng", xp: 15 },
  { type: "translate", question: "Khám phá / tìm tòi", answer: "探索", options: ["发现", "探索", "寻找", "研究"], pinyin: "tànsuǒ", xp: 15 },
  { type: "listen_pick", question: "Nghe và chọn nghĩa đúng của: 缘分", answer: "Duyên phận", options: ["Số phận", "Duyên phận", "Tình yêu", "Hôn nhân"], pinyin: "yuánfèn", xp: 15 },
  // ── Cảm xúc & Thơ văn
  { type: "translate", question: "Dịch: Tôi nhớ bạn", answer: "我想你", options: ["我想你", "我爱你", "我找你", "我看你"], pinyin: "Wǒ xiǎng nǐ", xp: 15 },
  { type: "translate", question: "Dịch: Xin lỗi, tôi đến muộn", answer: "对不起，我迟到了", options: ["对不起，我迟到了", "谢谢，我来了", "没关系，我晚了", "对不起，我走了"], pinyin: "Duìbuqǐ, wǒ chídào le", xp: 15 },
  { type: "multiple_choice", question: "有些人__能陪你走一段路。(Chỉ có thể...)", answer: "只", options: ["只", "都", "也", "还"], pinyin: "zhǐ", xp: 10 },
  { type: "multiple_choice", question: "思念是一种__，你是我的药。(Nhớ nhung là một căn...)", answer: "病", options: ["病", "药", "情", "心"], pinyin: "bìng", xp: 15 },
  { type: "multiple_choice", question: "你若安好，__是晴天。", answer: "便", options: ["便", "就", "也", "才"], pinyin: "biàn", xp: 15 },
  // ── Thanh điệu
  { type: "multiple_choice", question: "爱 (tình yêu) là thanh mấy?", answer: "Thanh 4 (ài)", options: ["Thanh 4 (ài)", "Thanh 1 (āi)", "Thanh 3 (ǎi)", "Thanh 2 (ái)"], pinyin: "ài", xp: 10 },
  { type: "multiple_choice", question: "缘 (duyên) là thanh mấy?", answer: "Thanh 2 (yuán)", options: ["Thanh 2 (yuán)", "Thanh 4 (yuàn)", "Thanh 1 (yuān)", "Thanh 3 (yuǎn)"], pinyin: "yuán", xp: 10 },
  { type: "multiple_choice", question: "思 (nhớ nhung) là thanh mấy?", answer: "Thanh 1 (sī)", options: ["Thanh 1 (sī)", "Thanh 4 (sì)", "Thanh 2 (sí)", "Thanh 3 (sǐ)"], pinyin: "sī", xp: 10 },
  { type: "multiple_choice", question: "梦 (giấc mơ) là thanh mấy?", answer: "Thanh 4 (mèng)", options: ["Thanh 4 (mèng)", "Thanh 2 (méng)", "Thanh 1 (māng)", "Thanh 3 (měng)"], pinyin: "mèng", xp: 10 },
  // ── Bộ thủ & Chiết tự
  { type: "multiple_choice", question: "Chữ 情 (tình cảm) có bộ thủ là?", answer: "忄 (tim)", options: ["忄 (tim)", "氵 (nước)", "口 (miệng)", "日 (mặt trời)"], pinyin: "qíng", xp: 20 },
  { type: "multiple_choice", question: "Chữ 泪 (nước mắt) có bộ thủ là?", answer: "氵 (nước)", options: ["氵 (nước)", "目 (mắt)", "心 (tim)", "口 (miệng)"], pinyin: "lèi", xp: 20 },
  { type: "multiple_choice", question: "Chữ 明 (sáng) gồm?", answer: "日 + 月", options: ["日 + 月", "日 + 火", "月 + 星", "日 + 木"], pinyin: "míng", xp: 20 },
  // ── Ngữ pháp
  { type: "multiple_choice", question: "__ 下雨，我就不去了。(Nếu trời mưa...)", answer: "如果", options: ["如果", "虽然", "因为", "所以"], pinyin: "rúguǒ", xp: 15 },
  { type: "multiple_choice", question: "虽然很累，__很开心。(Dù mệt, nhưng vui.)", answer: "但是", options: ["但是", "所以", "因为", "如果"], pinyin: "dànshì", xp: 15 },
  { type: "multiple_choice", question: "我__他打了电话。(Tôi gọi điện cho anh ấy.)", answer: "给", options: ["给", "跟", "对", "向"], pinyin: "gěi", xp: 15 },
  // ── Từ vựng cảm xúc
  { type: "multiple_choice", question: "心动 (xīndòng) nghĩa là?", answer: "Rung động, xao xuyến", options: ["Rung động, xao xuyến", "Tim đập", "Cảm thấy", "Xúc động"], pinyin: "xīndòng", xp: 15 },
  { type: "multiple_choice", question: "珍惜 (zhēnxī) nghĩa là?", answer: "Trân trọng, quý trọng", options: ["Trân trọng, quý trọng", "Thích thú", "Tìm kiếm", "Đánh mất"], pinyin: "zhēnxī", xp: 15 },
  { type: "multiple_choice", question: "遗憾 (yíhàn) nghĩa là?", answer: "Tiếc nuối, đáng tiếc", options: ["Tiếc nuối, đáng tiếc", "Vui mừng", "Hài lòng", "Hạnh phúc"], pinyin: "yíhàn", xp: 15 },
  { type: "multiple_choice", question: "Từ nào nghĩa là 'tuyệt vọng'?", answer: "绝望", options: ["绝望", "希望", "期望", "渴望"], pinyin: "juéwàng", xp: 15 },
  // ── Thành ngữ
  { type: "multiple_choice", question: "落叶__根 — lá rụng về cội", answer: "归", options: ["归", "回", "来", "到"], pinyin: "guī", xp: 20 },
  { type: "multiple_choice", question: "忍一时风平浪静，退一步__阔天空", answer: "海", options: ["海", "天", "山", "云"], pinyin: "hǎi", xp: 20 },
  { type: "multiple_choice", question: "不积跬步，无以至__里", answer: "千", options: ["千", "百", "万", "十"], pinyin: "qiān", xp: 15 },
  { type: "multiple_choice", question: "温柔 (wēnróu) nghĩa là?", answer: "Dịu dàng, nhẹ nhàng", options: ["Dịu dàng, nhẹ nhàng", "Ấm áp", "Mềm mại", "Nhút nhát"], pinyin: "wēnróu", xp: 10 },
  { type: "multiple_choice", question: "迷茫 nghĩa là?", answer: "Mơ hồ, lạc lõng", options: ["Mơ hồ, lạc lõng", "Tối tăm", "Lạc đường", "Mê hoặc"], pinyin: "mímáng", xp: 15 },
  // ── HSK4-5 nâng cao
  { type: "multiple_choice", question: "坚持 (jiānchí) nghĩa là?", answer: "Kiên trì, bền vững", options: ["Kiên trì, bền vững", "Cứng đầu", "Giữ vững", "Cố gắng"], pinyin: "jiānchí", xp: 15 },
  { type: "multiple_choice", question: "忽然 (hūrán) nghĩa là?", answer: "Đột nhiên, bỗng nhiên", options: ["Đột nhiên, bỗng nhiên", "Thỉnh thoảng", "Ngay lập tức", "Từ từ"], pinyin: "hūrán", xp: 10 },
  { type: "multiple_choice", question: "担心 (dānxīn) nghĩa là?", answer: "Lo lắng, lo ngại", options: ["Lo lắng, lo ngại", "Quan tâm", "Nhớ thương", "Sợ hãi"], pinyin: "dānxīn", xp: 10 },
  { type: "multiple_choice", question: "Câu nào ĐÚNG nghĩa 'Ngay cả trẻ con cũng biết'?", answer: "连小孩都知道", options: ["连小孩都知道", "小孩也知道", "小孩才知道", "小孩就知道"], pinyin: "lián", xp: 20 },
  { type: "multiple_choice", question: "舍不得 (shěbude) nghĩa là?", answer: "Không nỡ, không đành lòng", options: ["Không nỡ, không đành lòng", "Không muốn", "Chịu đựng", "Từ bỏ"], pinyin: "shěbude", xp: 20 },
  { type: "multiple_choice", question: "机会 (jīhuì) nghĩa là?", answer: "Cơ hội", options: ["Cơ hội", "Cơ duyên", "Điều kiện", "Hoàn cảnh"], pinyin: "jīhuì", xp: 10 },
  { type: "multiple_choice", question: "骄傲 (jiāo'ào) nghĩa là?", answer: "Tự hào / kiêu ngạo", options: ["Tự hào / kiêu ngạo", "Hạnh phúc", "Phấn khởi", "Tức giận"], pinyin: "jiāo'ào", xp: 15 },
  // ── Ngữ pháp nâng cao
  { type: "multiple_choice", question: "__ 你来，我就放心了。(Miễn là bạn đến...)", answer: "只要", options: ["只要", "只有", "不管", "即使"], pinyin: "zhǐyào", xp: 20 },
  { type: "multiple_choice", question: "即使下雨，__。(Dù trời mưa, tôi vẫn đến.)", answer: "我也会来", options: ["我也会来", "我才会来", "我就来了", "我不来了"], pinyin: "jíshǐ", xp: 20 },
  { type: "multiple_choice", question: "他越说__高兴。(Anh ấy nói càng ngày càng vui.)", answer: "越", options: ["越", "更", "也", "就"], pinyin: "yuè", xp: 15 },
  // ── Từ dễ nhầm
  { type: "multiple_choice", question: "'Nhớ nhung' nói là?", answer: "想念 (xiǎngniàn)", options: ["想念 (xiǎngniàn)", "思念 (sīniàn)", "念念 (niànniàn)", "Cả A và B đều đúng"], pinyin: "xiǎngniàn", xp: 15 },
  { type: "multiple_choice", question: "分手 (fēnshǒu) nghĩa là?", answer: "Chia tay (người yêu)", options: ["Chia tay (người yêu)", "Bắt tay", "Tạm biệt", "Kết hôn"], pinyin: "fēnshǒu", xp: 10 },
  // ── Văn hóa & C-drama
  { type: "multiple_choice", question: "别怕，有我在 nghĩa là?", answer: "Đừng sợ, có tôi đây", options: ["Đừng sợ, có tôi đây", "Đừng lo, tôi biết rồi", "Không sao, cứ đi đi", "Im đi, tôi đây rồi"], pinyin: "yǒu wǒ zài", xp: 15 },
  { type: "multiple_choice", question: "缘分 (yuánfèn) nghĩa là?", answer: "Duyên phận, nhân duyên", options: ["Duyên phận, nhân duyên", "Tình yêu", "Vận may", "Số phận"], pinyin: "yuánfèn", xp: 15 },
  { type: "multiple_choice", question: "加油 (jiāyóu) thường dùng để?", answer: "Cổ vũ, cố lên!", options: ["Cổ vũ, cố lên!", "Thêm dầu vào xe", "Chúc mừng", "Chào hỏi"], pinyin: "jiāyóu", xp: 10 },
  { type: "multiple_choice", question: "Chữ 爱 (ài) phồn thể gồm những bộ nào?", answer: "爫 + 冖 + 心 + 友", options: ["爫 + 冖 + 心 + 友", "爫 + 目 + 心", "心 + 友 + 大", "女 + 子 + 心"], pinyin: "ài", xp: 20 },
  { type: "multiple_choice", question: "Chữ 国 (quốc/nước) bộ thủ bao quanh là?", answer: "囗 (khung)", options: ["囗 (khung)", "土 (đất)", "门 (cửa)", "方 (vuông)"], pinyin: "guó", xp: 15 },
  { type: "multiple_choice", question: "Thanh điệu của 买 (mua) là?", answer: "Thanh 3 (mǎi)", options: ["Thanh 3 (mǎi)", "Thanh 4 (mài)", "Thanh 2 (mái)", "Thanh 1 (māi)"], pinyin: "mǎi", xp: 10 },
  { type: "multiple_choice", question: "Thanh điệu của 卖 (bán) là?", answer: "Thanh 4 (mài)", options: ["Thanh 4 (mài)", "Thanh 3 (mǎi)", "Thanh 2 (mái)", "Thanh 1 (māi)"], pinyin: "mài", xp: 10 },
  { type: "multiple_choice", question: "幸福 (xìngfú) nghĩa là?", answer: "Hạnh phúc", options: ["Hạnh phúc", "May mắn", "Vui vẻ", "Thành công"], pinyin: "xìngfú", xp: 10 },

];

/* Build daily set: 6 challenges from pool, deterministic by date */
function getDailySet(): Challenge[] {
  const seed = dateSeed();
  const indices: number[] = [];
  while (indices.length < 6) {
    const idx = Math.floor(seededRandom(seed, indices.length * 7 + 3) * POOL.length);
    if (!indices.includes(idx)) indices.push(idx);
  }
  return indices.map(i => POOL[i]);
}

const DAILY_KEY = `mm_challenge_${dateSeed()}`;

export default function ChallengePage() {
  const router = useRouter();
  const [challenges] = useState<Challenge[]>(getDailySet);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [done, setDone] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const { awardXP } = useProgress();

  useEffect(() => {
    const saved = readJSON<{ score: number; xp: number } | null>(DAILY_KEY, null);
    if (saved) {
      setScore(saved.score); setXpEarned(saved.xp); setDone(true); setAlreadyDone(true);
    }
  }, []);

  const current = challenges[step];

  const checkAnswer = useCallback((ans: string) => {
    if (revealed) return;
    const isCorrect = ans.trim() === current.answer.trim();
    setSelected(ans);
    setRevealed(true);
    if (isCorrect) {
      setScore(s => s + 1);
      setXpEarned(x => x + current.xp);
    }
  }, [revealed, current]);

  const next = useCallback(async () => {
    if (step + 1 >= challenges.length) {
      const finalXp = xpEarned + (selected === current.answer ? 0 : 0); // already counted
      await awardXP(finalXp, "daily_challenge");
      writeJSON(DAILY_KEY, { score: score + (selected === current.answer ? 1 : 0), xp: finalXp });
      setDone(true);
    } else {
      setStep(s => s + 1);
      setInput(""); setSelected(null); setRevealed(false);
    }
  }, [step, challenges.length, xpEarned, awardXP, score, selected, current.answer]);

  // Format today's date VN
  const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric", year: "numeric" });

  const TYPE_LABEL: Record<ChallengeType, string> = {
    multiple_choice: "Chọn đáp án đúng",
    fill_blank: "Điền vào chỗ trống",
    listen_pick: "Nghe → chọn nghĩa",
    translate: "Chọn bản dịch đúng",
  };

  if (done) {
    const pct = Math.round((score / challenges.length) * 100);
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 bg-[var(--bg-primary)]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4 max-w-sm w-full">
          <div className="text-6xl">{pct >= 83 ? "🏆" : pct >= 50 ? "🎯" : "💪"}</div>
          <div>
            <h2 className="font-display text-2xl font-bold">
              {alreadyDone ? "Đã hoàn thành hôm nay!" : "Thử thách xong!"}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">{today}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Trophy size={18} className="text-mm-gold" />, val: `${score}/${challenges.length}`, label: "Đúng" },
              { icon: <Flame size={18} className="text-mm-red" />, val: `+${xpEarned}`, label: "XP" },
              { icon: <Calendar size={18} className="text-blue-400" />, val: "1", label: "Ngày" },
            ].map((s, i) => (
              <div key={i} className="bg-[var(--bg-card)] rounded-2xl p-3 border border-[rgba(255,255,255,0.05)]">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <div className="text-lg font-bold">{s.val}</div>
                <div className="text-[10px] text-[var(--text-muted)]">{s.label}</div>
              </div>
            ))}
          </div>
          {!alreadyDone && (
            <p className="text-xs text-[var(--text-muted)]">
              Thử thách mới mỗi ngày lúc 00:00 🌙
            </p>
          )}
          <div className="flex flex-col gap-2">
            <button onClick={() => router.push("/practice")}
              className="w-full py-3 bg-mm-red text-white rounded-2xl font-semibold hover:bg-mm-red/90 transition-colors">
              Luyện thêm → Ghép câu
            </button>
            <button onClick={() => router.push("/")}
              className="w-full py-2.5 bg-[var(--bg-card)] text-[var(--text-muted)] rounded-2xl text-sm hover:text-white transition-colors">
              Về trang chủ
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28 bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-mm-red" />
              <h1 className="font-display text-lg font-bold">Thử Thách Ngày</h1>
            </div>
            <p className="text-xs text-[var(--text-muted)]">{today}</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[var(--text-muted)]">{step + 1}/{challenges.length}</span>
            <span className="text-mm-gold font-bold">+{xpEarned} XP</span>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5 space-y-5">
        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center">
          {challenges.map((_, i) => (
            <div key={i} className={cn("h-2 rounded-full transition-all duration-300",
              i < step ? "bg-green-500 w-6" :
              i === step ? "bg-mm-red w-6" :
              "bg-[rgba(255,255,255,0.15)] w-2"
            )} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="space-y-5"
          >
            {/* Type badge + XP */}
            <div className="flex items-center justify-between">
              <span className="text-xs px-3 py-1 rounded-full bg-mm-red/10 text-mm-red/80">
                {TYPE_LABEL[current.type]}
              </span>
              <span className="text-xs text-mm-gold">+{current.xp} XP</span>
            </div>

            {/* Question card */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-5 border border-[rgba(255,255,255,0.06)] space-y-3">
              {/* Listen button for listen_pick */}
              {current.type === "listen_pick" && (
                <button onClick={() => { const w = current.question.split(": ")[1]; playTTS(w); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-mm-red/15 border border-mm-red/30 rounded-2xl text-sm text-mm-red hover:bg-mm-red/25 transition-colors">
                  <Volume2 size={16} /> Nghe phát âm
                </button>
              )}
              <p className="text-base leading-relaxed font-medium">{current.question}</p>
              {current.hint && !revealed && (
                <p className="text-xs text-mm-gold/70">💡 Gợi ý: {current.hint}</p>
              )}
            </div>

            {/* Answer section */}
            {current.type === "fill_blank" ? (
              /* Fill blank input */
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !revealed && input && checkAnswer(input)}
                    disabled={revealed}
                    placeholder="Nhập chữ Hán..." aria-label="Nhập chữ Hán"
                    className="flex-1 px-4 py-3 bg-[var(--bg-card)] border border-[rgba(255,255,255,0.1)] rounded-2xl text-xl font-bold text-center placeholder:text-sm placeholder:font-normal placeholder:text-[var(--text-muted)] focus:outline-none focus:border-mm-red/40"
                  />
                  {!revealed && (
                    <button onClick={() => checkAnswer(input)} disabled={!input}
                      className="px-5 bg-mm-red text-white rounded-2xl font-semibold disabled:opacity-30 hover:bg-mm-red/90 transition-colors">
                      ✓
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* MCQ options */
              <div className="grid grid-cols-2 gap-2">
                {(current.options ?? []).map(opt => {
                  const isCorrect = opt === current.answer;
                  const isSelected = selected === opt;
                  return (
                    <button key={opt} onClick={() => checkAnswer(opt)} disabled={revealed}
                      className={cn(
                        "p-3 rounded-2xl border text-sm font-medium text-left transition-all",
                        !revealed && "bg-[var(--bg-card)] border-[rgba(255,255,255,0.08)] hover:border-mm-red/40 hover:bg-mm-red/10",
                        revealed && isCorrect && "border-green-500 bg-green-500/15 text-green-300",
                        revealed && isSelected && !isCorrect && "border-red-500 bg-red-500/15 text-red-300",
                        revealed && !isSelected && !isCorrect && "opacity-40 bg-[var(--bg-card)] border-[rgba(255,255,255,0.05)]",
                      )}>
                      <div className="flex items-center justify-between gap-2">
                        <span>{opt}</span>
                        {revealed && isCorrect && <CheckCircle size={14} className="text-green-400 shrink-0" />}
                        {revealed && isSelected && !isCorrect && <XCircle size={14} className="text-red-400 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Feedback */}
            <AnimatePresence>
              {revealed && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("rounded-2xl p-4 flex items-start gap-3",
                    selected === current.answer
                      ? "bg-green-500/15 border border-green-500/30"
                      : "bg-red-500/15 border border-red-500/30"
                  )}>
                  {selected === current.answer
                    ? <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" />
                    : <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <p className={cn("text-sm font-semibold",
                      selected === current.answer ? "text-green-300" : "text-red-300")}>
                      {selected === current.answer ? `Đúng! +${current.xp} XP 🎉` : `Sai. Đáp án: ${current.answer}`}
                    </p>
                    {current.pinyin && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">{current.answer} — {current.pinyin}</p>
                    )}
                  </div>
                  <button onClick={() => playTTS(current.answer)}
                    className="p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.1)] shrink-0">
                    <Volume2 size={13} className="text-[var(--text-muted)]" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next button */}
            {revealed && (
              <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                onClick={next}
                className="w-full flex items-center justify-center gap-2 py-3 bg-mm-red text-white rounded-2xl font-semibold hover:bg-mm-red/90 transition-colors">
                {step + 1 >= challenges.length ? <><Trophy size={16} /> Xem kết quả</> : <>Tiếp <ChevronRight size={16} /></>}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
