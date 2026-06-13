/**
 * /shadowing — Luyện Shadowing tiếng Trung
 * Nghe câu → điều chỉnh tốc độ → nhái theo → tự đánh giá
 * Cảm hứng từ nhaikanji.com Shadowing feature
 */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pause, RotateCcw, Mic, MicOff, ChevronLeft, ChevronRight,
  Volume2, Gauge, BookOpen, CheckCircle2, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StoryKaraoke } from "@/components/ui/StoryKaraoke";
import { useProgress } from "@/hooks/useProgress";

interface ShadowItem {
  id: string;
  chinese: string;
  pinyin: string;
  translation: string;
  level: string;
  category: string;
  notes: string; // pronunciation tip
}

const SHADOW_LIST: ShadowItem[] = [
  { id: "s1",  chinese: "你好，很高兴认识你。", pinyin: "Nǐ hǎo, hěn gāoxìng rènshi nǐ.", translation: "Xin chào, rất vui được gặp bạn.", level: "hsk1", category: "Chào hỏi", notes: "高兴 đọc liền mạch: gāoxìng. Nhấn mạnh 很 để thể hiện sự nhiệt tình." },
  { id: "s2",  chinese: "我来自越南，我在学中文。", pinyin: "Wǒ láizì Yuènán, wǒ zài xué Zhōngwén.", translation: "Tôi đến từ Việt Nam, tôi đang học tiếng Trung.", level: "hsk2", category: "Giới thiệu", notes: "在 + động từ = đang làm gì. Phát âm 越 (Yuè) thanh 4 xuống mạnh." },
  { id: "s3",  chinese: "今天天气很好，我们去散步吧。", pinyin: "Jīntiān tiānqì hěn hǎo, wǒmen qù sànbù ba.", translation: "Hôm nay thời tiết rất tốt, chúng ta đi dạo nhé.", level: "hsk2", category: "Đời sống", notes: "吧 ở cuối = đề nghị nhẹ nhàng. 散步 (sànbù) đọc thanh 4-4." },
  { id: "s4",  chinese: "我很想你，你什么时候回来？", pinyin: "Wǒ hěn xiǎng nǐ, nǐ shénme shíhou huílái?", translation: "Tôi rất nhớ bạn, bao giờ bạn trở về?", level: "hsk3", category: "Cảm xúc", notes: "什么时候 hỏi về thời gian. Giọng lên nhẹ ở 回来 vì là câu hỏi." },
  { id: "s5",  chinese: "不管发生什么，我都会在你身边。", pinyin: "Bùguǎn fāshēng shénme, wǒ dōu huì zài nǐ shēnbiān.", translation: "Dù bất cứ chuyện gì xảy ra, tôi đều sẽ ở bên bạn.", level: "hsk4", category: "Cảm xúc", notes: "不管...都... = dù...đều... Đây là cấu trúc quan trọng HSK4. Phát âm 身边 (shēnbiān) liền mạch." },
  { id: "s6",  chinese: "有缘千里来相会，无缘对面不相识。", pinyin: "Yǒu yuán qiānlǐ lái xiāng huì, wú yuán duìmiàn bù xiāng shí.", translation: "Có duyên nghìn dặm cũng gặp nhau, vô duyên đứng trước mặt cũng không nhận ra.", level: "hsk5", category: "Thành ngữ", notes: "Tục ngữ cân đối: 有/无 · 千里/对面. Đọc nhịp nhàng như thơ, nghỉ nhẹ ở dấu phẩy." },
  { id: "s7",  chinese: "对不起，我迟到了，路上堵车。", pinyin: "Duìbuqǐ, wǒ chídào le, lùshàng dǔchē.", translation: "Xin lỗi, tôi đến muộn, đường bị tắc.", level: "hsk2", category: "Xin lỗi", notes: "对不起 đọc nhanh: duìbuqǐ. 堵车 (dǔchē) = tắc đường — từ thực dụng hay dùng." },
  { id: "s8",  chinese: "你最近怎么样？一切都还好吗？", pinyin: "Nǐ zuìjìn zěnmeyàng? Yīqiè dōu hái hǎo ma?", translation: "Dạo này bạn thế nào? Mọi thứ vẫn ổn chứ?", level: "hsk2", category: "Hỏi thăm", notes: "怎么样 hỏi 'thế nào'. 一切 = tất cả mọi thứ. Giọng điệu ấm áp, quan tâm." },
  { id: "s9",  chinese: "慢慢来，不要着急，你做得很好。", pinyin: "Màn man lái, bùyào zhāojí, nǐ zuò de hěn hǎo.", translation: "Từ từ thôi, đừng vội, bạn làm rất tốt.", level: "hsk3", category: "Khích lệ", notes: "慢慢 đọc nhẹ nhàng như an ủi. 着急 (zhāojí) = lo lắng/vội vàng. Giọng nhẹ, trấn an." },
  { id: "s10", chinese: "人生若只如初见，何事秋风悲画扇。", pinyin: "Rénshēng ruò zhǐ rú chūjiàn, hé shì qiūfēng bēi huà shàn.", translation: "Giá như cuộc đời mãi đẹp như lần đầu gặp gỡ, cớ sao gió thu lại khiến ta buồn như cái quạt vẽ.", level: "hsk5", category: "Thơ văn", notes: "Thơ Nạp Lan Tính Đức — đọc chậm rãi, cảm xúc. Nghỉ dài ở dấu phẩy. 何事 = cớ sao." },
  { id: "s11", chinese: "我们一起加油，没有什么做不到的！", pinyin: "Wǒmen yīqǐ jiāyóu, méiyǒu shénme zuòbudào de!", translation: "Chúng ta cùng cố gắng, không có gì là không làm được!", level: "hsk3", category: "Khích lệ", notes: "加油 là cổ vũ phổ biến nhất. 做不到 = không thể làm. Kết thúc bằng ! — giọng lên cao, nhiệt huyết." },
  { id: "s12", chinese: "你笑起来真的很好看，让我心情好多了。", pinyin: "Nǐ xiào qǐlái zhēn de hěn hǎokàn, ràng wǒ xīnqíng hǎo duō le.", translation: "Bạn trông thật đẹp khi cười, làm tâm trạng tôi tốt hơn nhiều.", level: "hsk3", category: "Khen ngợi", notes: "笑起来 = khi cười. 让 + ai + làm gì = khiến ai đó làm gì. Giọng ấm áp, chân thật." },
  { id: "s13", chinese: "谢谢你一直陪在我身边。", pinyin: "Xièxie nǐ yìzhí péi zài wǒ shēnbiān.", translation: "Cảm ơn bạn đã luôn ở bên cạnh tôi.", level: "hsk3", category: "Cảm xúc", notes: "陪 (péi) = bầu bạn, ở bên. 一直 = luôn luôn. Đọc nhẹ nhàng, biết ơn." },
  { id: "s14", chinese: "失败不可怕，可怕的是放弃。", pinyin: "Shībài bù kěpà, kěpà de shì fàngqì.", translation: "Thất bại không đáng sợ, đáng sợ là bỏ cuộc.", level: "hsk4", category: "Khích lệ", notes: "Cấu trúc 不...的是... nhấn mạnh điều thật sự quan trọng. 放弃 (fàngqì) = từ bỏ. Giọng dứt khoát." },
  { id: "s15", chinese: "请问，去地铁站怎么走？", pinyin: "Qǐngwèn, qù dìtiě zhàn zěnme zǒu?", translation: "Xin hỏi, đi đến ga tàu điện ngầm thế nào?", level: "hsk2", category: "Đời sống", notes: "请问 mở đầu câu hỏi lịch sự. ...怎么走 = đi ...thế nào. Câu hỏi đường rất thực dụng." },
  { id: "s16", chinese: "海内存知己，天涯若比邻。", pinyin: "Hǎi nèi cún zhījǐ, tiānyá ruò bǐlín.", translation: "Trong bốn bể có tri kỷ, dù chân trời góc bể cũng như láng giềng kề bên.", level: "hsk5", category: "Thơ văn", notes: "Thơ Vương Bột — lời tiễn bạn ấm áp. Đọc chậm, cân đối hai vế, nghỉ ở dấu phẩy." },
  { id: "s17", chinese: "这个多少钱？可以便宜一点吗？", pinyin: "Zhège duōshao qián? Kěyǐ piányi yìdiǎn ma?", translation: "Cái này bao nhiêu tiền? Có thể rẻ hơn một chút không?", level: "hsk2", category: "Đời sống", notes: "多少钱 hỏi giá, dùng mọi lúc mua sắm. 便宜一点 = rẻ hơn chút — mặc cả lịch sự." },
  { id: "s18", chinese: "千里之行，始于足下。", pinyin: "Qiānlǐ zhī xíng, shǐ yú zú xià.", translation: "Hành trình nghìn dặm bắt đầu từ một bước chân.", level: "hsk5", category: "Thành ngữ", notes: "Lời Lão Tử — nhắc kiên trì từ bước nhỏ. Đọc chậm, trang trọng, nghỉ ở dấu phẩy." },
  { id: "s19", chinese: "别担心，一切都会好起来的。", pinyin: "Bié dānxīn, yíqiè dōu huì hǎo qǐlái de.", translation: "Đừng lo, mọi chuyện rồi sẽ tốt lên thôi.", level: "hsk3", category: "Khích lệ", notes: "别 + động từ = đừng làm gì. 好起来 = trở nên tốt lên. Giọng dịu dàng, an ủi." },
  { id: "s20", chinese: "我可以坐这里吗？", pinyin: "Wǒ kěyǐ zuò zhèlǐ ma?", translation: "Tôi có thể ngồi đây không?", level: "hsk1", category: "Chào hỏi", notes: "可以...吗 xin phép lịch sự. Câu ngắn, hợp người mới luyện phản xạ nói." },
  { id: "s21", chinese: "服务员，请给我一杯热水。", pinyin: "Fúwùyuán, qǐng gěi wǒ yì bēi rè shuǐ.", translation: "Phục vụ ơi, cho tôi một cốc nước nóng.", level: "hsk2", category: "Đời sống", notes: "请给我 + đồ vật = làm ơn đưa tôi... Cấu trúc gọi đồ cơ bản nhất ở nhà hàng." },
  { id: "s22", chinese: "认识你真的很高兴，希望我们常联系。", pinyin: "Rènshi nǐ zhēn de hěn gāoxìng, xīwàng wǒmen cháng liánxì.", translation: "Rất vui được quen bạn, mong chúng ta thường xuyên liên lạc.", level: "hsk3", category: "Giới thiệu", notes: "认识你很高兴 — câu xã giao kinh điển. 常联系 (cháng liánxì) = giữ liên lạc, nói khi chia tay bạn mới quen." },
  { id: "s23", chinese: "不要害怕犯错，错误让我们成长。", pinyin: "Búyào hàipà fàncuò, cuòwù ràng wǒmen chéngzhǎng.", translation: "Đừng sợ mắc lỗi, lỗi lầm giúp chúng ta trưởng thành.", level: "hsk4", category: "Khích lệ", notes: "犯错 (fàncuò) = mắc lỗi. 让 + ai + động từ = khiến ai làm gì. Giọng chắc chắn, truyền cảm hứng." },
  { id: "s24", chinese: "今天的风很温柔，像妈妈的手。", pinyin: "Jīntiān de fēng hěn wēnróu, xiàng māma de shǒu.", translation: "Cơn gió hôm nay thật dịu dàng, như bàn tay của mẹ.", level: "hsk3", category: "Cảm xúc", notes: "温柔 (wēnróu) = dịu dàng. 像 = giống như — phép so sánh đơn giản mà thơ. Đọc chậm, mềm mại." },
  { id: "s25", chinese: "山重水复疑无路，柳暗花明又一村。", pinyin: "Shān chóng shuǐ fù yí wú lù, liǔ àn huā míng yòu yì cūn.", translation: "Núi non trùng điệp tưởng không còn đường, bỗng liễu rủ hoa tươi hiện ra một thôn làng.", level: "hsk6", category: "Thơ văn", notes: "Thơ Lục Du — ẩn dụ 'tuyệt vọng rồi sẽ có lối ra'. Đọc chậm, nghỉ rõ giữa hai vế, vế sau sáng giọng lên." },
  { id: "s26", chinese: "我从来不后悔认识你。", pinyin: "Wǒ cónglái bú hòuhuǐ rènshi nǐ.", translation: "Mình chưa bao giờ hối hận vì đã quen bạn.", level: "hsk4", category: "Cảm xúc", notes: "从来不 + động từ = chưa bao giờ. 后悔 (hậu hối) = hối hận — từ HSK4 vừa học ở kho từ. Giọng chân thành, chậm rãi." },
  { id: "s27", chinese: "与其羡慕别人，不如努力做自己。", pinyin: "Yǔqí xiànmù biérén, bùrú nǔlì zuò zìjǐ.", translation: "Thay vì ngưỡng mộ người khác, chi bằng nỗ lực làm chính mình.", level: "hsk5", category: "Khích lệ", notes: "与其A，不如B = thay vì A chi bằng B — cấu trúc so sánh lựa chọn kinh điển. 羡慕 (tiện mộ) = ngưỡng mộ/ghen tị." },
  { id: "s28", chinese: "不管多忙，也要从容地生活。", pinyin: "Bùguǎn duō máng, yě yào cóngróng de shēnghuó.", translation: "Dù bận đến đâu, cũng phải sống thật ung dung.", level: "hsk6", category: "Cảm xúc", notes: "不管...也... = dù... vẫn... 从容 (thung dung) = ung dung — từ HSK6 trong kho. Đọc thư thái đúng tinh thần câu." },
  { id: "s29", chinese: "离家再远，心里也牵挂着妈妈做的菜。", pinyin: "Lí jiā zài yuǎn, xīnli yě qiānguà zhe māma zuò de cài.", translation: "Xa nhà đến mấy, trong lòng vẫn vương vấn món ăn mẹ nấu.", level: "hsk6", category: "Cảm xúc", notes: "牵挂 (khiên quải) = vương vấn, nhớ thương. 再 + tính từ = dù... đến mấy. Giọng hoài niệm, ấm." },
];

const CATEGORIES = ["Tất cả", "Chào hỏi", "Cảm xúc", "Thành ngữ", "Thơ văn", "Khích lệ", "Đời sống", "Giới thiệu", "Xin lỗi", "Hỏi thăm", "Khen ngợi"];
const SPEEDS = [
  { label: "0.6×", value: 0.6, color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" },
  { label: "0.8×", value: 0.8, color: "text-teal-400", bg: "bg-teal-500/20 border-teal-500/30" },
  { label: "1.0×", value: 1.0, color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30" },
  { label: "1.2×", value: 1.2, color: "text-orange-400", bg: "bg-orange-500/20 border-orange-500/30" },
];

type RecordState = "idle" | "recording" | "done";
type SelfRating = 1 | 2 | 3 | 4 | 5;

export default function ShadowingPage() {
  const { awardXP } = useProgress();
  const [catFilter, setCatFilter] = useState("Tất cả");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [karaoke, setKaraoke] = useState(false);
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [ratings, setRatings] = useState<Record<string, SelfRating>>({});
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<"listen" | "shadow" | "rate">("listen");

  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);

  const filtered = catFilter === "Tất cả" ? SHADOW_LIST : SHADOW_LIST.filter(s => s.category === catFilter);
  const current = filtered[currentIdx] ?? filtered[0];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      mediaRef.current?.stop();
    };
  }, []);

  const playAudio = useCallback(() => {
    if (!window.speechSynthesis) { toast.error("Trình duyệt không hỗ trợ TTS"); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(current.chinese);
    utter.lang = "zh-CN";
    utter.rate = speed;
    utter.onstart = () => setIsPlaying(true);
    utter.onend = () => setIsPlaying(false);
    utter.onerror = () => setIsPlaying(false);
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [current.chinese, speed]);

  const stopAudio = () => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  };

  const startRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      mr.start();
      setRecordState("recording");
      // Auto-stop after 15s
      setTimeout(() => { if (mr.state === "recording") mr.stop(); }, 15000);
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        setRecordState("done");
        setPhase("rate");
      };
    } catch {
      toast.error("Không thể truy cập microphone");
    }
  };

  const stopRecord = () => { mediaRef.current?.stop(); };

  const handleRate = (star: SelfRating) => {
    setRatings(prev => ({ ...prev, [current.id]: star }));
    setCompletedIds(prev => new Set([...prev, current.id]));
    // Award XP: 5 sao = 20 XP, 4 sao = 15, 3 sao = 10, 1-2 sao = 5
    const xp = star >= 4 ? 20 : star >= 3 ? 15 : 10;
    awardXP(xp, "Shadowing");
    toast.success(star >= 4 ? "Xuất sắc! 🌟" : star >= 3 ? "Tốt lắm! 💪" : "Tiếp tục luyện nhé! 🔄");
  };

  const goNext = () => {
    stopAudio();
    setCurrentIdx(i => Math.min(i + 1, filtered.length - 1));
    setPhase("listen");
    setRecordState("idle");
    setShowPinyin(false);
    setShowTranslation(false);
  };

  const goPrev = () => {
    stopAudio();
    setCurrentIdx(i => Math.max(i - 1, 0));
    setPhase("listen");
    setRecordState("idle");
    setShowPinyin(false);
    setShowTranslation(false);
  };

  const donePct = Math.round((completedIds.size / SHADOW_LIST.length) * 100);

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Gauge size={18} className="text-mm-red" />
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Shadowing</p>
        </div>
        <h1 className="font-playfair text-2xl font-bold">Nhái theo người bản ngữ 🎧</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Nghe → Điều chỉnh tốc độ → Nhái theo → Tự đánh giá</p>
      </motion.div>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-1.5 bg-surface2 rounded-full">
          <div className="h-full bg-mm-red rounded-full transition-all" style={{ width: `${donePct}%` }} />
        </div>
        <span className="text-xs text-[var(--text-muted)] shrink-0">{completedIds.size}/{SHADOW_LIST.length} câu</span>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => { setCatFilter(cat); setCurrentIdx(0); setPhase("listen"); }}
            className={cn("flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              catFilter === cat ? "bg-mm-red text-white" : "bg-surface2 text-[var(--text-muted)]"
            )}>
            {cat}
          </button>
        ))}
      </div>

      {/* Nav + counter */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={goPrev} aria-label="Câu trước" disabled={currentIdx === 0}
          className="p-2 rounded-xl bg-surface2 disabled:opacity-30 active:scale-95 transition-all">
          <ChevronLeft size={16} />
        </button>
        <div className="text-center">
          <span className="text-sm font-medium">{currentIdx + 1} / {filtered.length}</span>
          <span className="text-xs text-[var(--text-muted)] ml-2">· {current?.category}</span>
          {completedIds.has(current?.id) && <span className="ml-2 text-emerald-400 text-xs">✓ Đã hoàn thành</span>}
        </div>
        <button onClick={goNext} disabled={currentIdx >= filtered.length - 1}
          className="p-2 rounded-xl bg-surface2 disabled:opacity-30 active:scale-95 transition-all">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Main card */}
      <AnimatePresence mode="wait">
        <motion.div key={current?.id}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
          className="bg-surface rounded-3xl border border-[rgba(255,255,255,0.08)] p-5 mb-4"
        >
          {/* Level badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs px-2 py-1 rounded-full bg-surface2 text-[var(--text-muted)] uppercase">
              {current?.level}
            </span>
            {ratings[current?.id] && (
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={12} className={s <= ratings[current.id] ? "text-mm-gold fill-mm-gold" : "text-surface2"} />
                ))}
              </div>
            )}
          </div>

          {/* Chinese text — big (hoặc karaoke đọc + sáng từng câu) */}
          {karaoke ? (
            <div className="mb-4">
              <StoryKaraoke text={current?.chinese ?? ""} pinyin={current?.pinyin} showPinyin={showPinyin} rate={speed} />
            </div>
          ) : (
            <p lang="zh-CN" className="font-noto text-2xl leading-relaxed text-center mb-4 tracking-wide">
              {current?.chinese}
            </p>
          )}

          {/* Pinyin toggle */}
          <AnimatePresence>
            {showPinyin && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="text-center text-mm-gold text-sm mb-3 font-medium">
                {current?.pinyin}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Translation toggle */}
          <AnimatePresence>
            {showTranslation && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="text-center text-[var(--text-secondary)] text-sm mb-3">
                {current?.translation}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Tip */}
          <div className="bg-surface2 rounded-2xl p-3 mt-2">
            <p className="text-xs text-[var(--text-muted)] mb-1">💡 Mẹo phát âm</p>
            <p className="text-xs text-[var(--text-secondary)]">{current?.notes}</p>
          </div>

          {/* Toggle buttons */}
          <div className="flex gap-2 mt-3">
            <button onClick={() => setShowPinyin(p => !p)}
              className={cn("flex-1 py-2 rounded-xl text-xs font-medium transition-all border",
                showPinyin ? "bg-mm-gold/20 border-mm-gold/30 text-mm-gold" : "bg-surface2 border-transparent text-[var(--text-muted)]"
              )}>
              Pinyin
            </button>
            <button onClick={() => setShowTranslation(p => !p)}
              className={cn("flex-1 py-2 rounded-xl text-xs font-medium transition-all border",
                showTranslation ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-surface2 border-transparent text-[var(--text-muted)]"
              )}>
              Dịch nghĩa
            </button>
            <button onClick={() => setKaraoke(p => !p)} aria-pressed={karaoke}
              className={cn("flex-1 py-2 rounded-xl text-xs font-medium transition-all border",
                karaoke ? "bg-mm-red/20 border-mm-red/30 text-mm-red" : "bg-surface2 border-transparent text-[var(--text-muted)]"
              )}>
              🎤 Karaoke
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Speed selector */}
      <div className="mb-4">
        <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider">Tốc độ phát âm</p>
        <div className="grid grid-cols-4 gap-2">
          {SPEEDS.map(sp => (
            <button key={sp.value} onClick={() => setSpeed(sp.value)}
              className={cn("py-2 rounded-xl text-xs font-bold border transition-all",
                speed === sp.value ? sp.bg : "bg-surface2 border-transparent text-[var(--text-muted)]",
                speed === sp.value && sp.color
              )}>
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phase: Listen */}
      {phase === "listen" && (
        <div className="space-y-3">
          <button onClick={isPlaying ? stopAudio : playAudio}
            className={cn("w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all active:scale-95",
              isPlaying ? "bg-surface2 border border-[rgba(255,255,255,0.1)]" : "bg-mm-red text-white"
            )}>
            {isPlaying ? <><Pause size={20} /> Dừng</> : <><Volume2 size={20} /> Nghe ({speed}×)</>}
          </button>
          <button onClick={() => setPhase("shadow")}
            className="w-full py-3 rounded-2xl border border-[rgba(255,255,255,0.1)] text-sm text-[var(--text-muted)] flex items-center justify-center gap-2">
            <Mic size={16} /> Sẵn sàng nhái theo →
          </button>
        </div>
      )}

      {/* Phase: Shadow (record) */}
      {phase === "shadow" && (
        <div className="space-y-3">
          <div className="bg-surface2 rounded-2xl p-4 text-center border border-[rgba(255,255,255,0.06)]">
            <p className="text-sm font-medium mb-1">Bước 1: Nghe lại một lần nữa</p>
            <p className="text-xs text-[var(--text-muted)]">Chú ý nhịp điệu và thanh điệu</p>
          </div>
          <button onClick={isPlaying ? stopAudio : playAudio}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface2 border border-[rgba(255,255,255,0.08)] text-sm">
            {isPlaying ? <><Pause size={16}/> Dừng</> : <><Volume2 size={16}/> Nghe lại ({speed}×)</>}
          </button>
          <div className="bg-surface2 rounded-2xl p-4 text-center border border-[rgba(255,255,255,0.06)]">
            <p className="text-sm font-medium mb-1">Bước 2: Nhái theo</p>
            <p className="text-xs text-[var(--text-muted)]">Nhấn mic rồi đọc to câu trên</p>
          </div>
          <button
            onClick={recordState === "recording" ? stopRecord : startRecord}
            className={cn("w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all active:scale-95",
              recordState === "recording" ? "bg-red-500 text-white animate-pulse" : "bg-mm-red text-white"
            )}>
            {recordState === "recording"
              ? <><MicOff size={20} /> Dừng ghi âm</>
              : <><Mic size={20} /> Bắt đầu nhái theo</>}
          </button>
          <button onClick={() => setPhase("listen")}
            className="w-full py-2 text-xs text-[var(--text-muted)] underline">
            ← Quay lại nghe
          </button>
        </div>
      )}

      {/* Phase: Rate */}
      {phase === "rate" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
            <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
            <p className="font-medium">Đã ghi âm xong!</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Tự đánh giá phát âm của bạn</p>
          </div>

          <div className="bg-surface rounded-2xl p-4 border border-[rgba(255,255,255,0.07)]">
            <p className="text-sm font-medium text-center mb-3">Bạn tự chấm mấy sao?</p>
            <div className="flex justify-center gap-3">
              {([1,2,3,4,5] as SelfRating[]).map(s => (
                <button key={s} onClick={() => handleRate(s)}
                  className={cn("flex flex-col items-center gap-1 transition-all active:scale-95",
                    ratings[current.id] === s ? "scale-110" : ""
                  )}>
                  <Star size={28} className={cn("transition-colors",
                    ratings[current.id] && s <= ratings[current.id]
                      ? "text-mm-gold fill-mm-gold"
                      : "text-surface2 hover:text-mm-gold"
                  )} />
                  <span className="text-xs text-[var(--text-muted)]">
                    {s === 1 ? "Kém" : s === 2 ? "Yếu" : s === 3 ? "Ổn" : s === 4 ? "Tốt" : "Xuất sắc"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setRecordState("idle"); setPhase("shadow"); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-[rgba(255,255,255,0.1)] text-sm">
              <RotateCcw size={14} /> Thử lại
            </button>
            <button onClick={goNext} disabled={currentIdx >= filtered.length - 1}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-mm-red text-white text-sm font-semibold disabled:opacity-50">
              <BookOpen size={14} /> Câu tiếp →
            </button>
          </div>
        </motion.div>
      )}
    </main>
  );
}
