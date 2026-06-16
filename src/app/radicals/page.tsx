"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playTTS } from "@/hooks/useTTS";
import { Volume2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";

/* ─── 60 bộ thủ phổ biến nhất ─── */
const RADICALS = [
  { hanzi: "人", pinyin: "rén", meaning: "Người", stroke: 2, examples: ["你","他","休","从","众"], mnemonic: "Hình người đứng thẳng, hai chân dang rộng" },
  { hanzi: "心", pinyin: "xīn", meaning: "Trái tim / tâm", stroke: 4, examples: ["爱","忍","思","想","忘"], mnemonic: "Ba chấm như ba nhịp tim đập — tình cảm, cảm xúc" },
  { hanzi: "手", pinyin: "shǒu", meaning: "Bàn tay", stroke: 4, examples: ["打","找","拿","握","推"], mnemonic: "Năm ngón tay xòe ra — mọi hành động bằng tay" },
  { hanzi: "口", pinyin: "kǒu", meaning: "Miệng / cửa", stroke: 3, examples: ["吃","喝","唱","叫","问"], mnemonic: "Hình vuông nhỏ như cái miệng mở ra" },
  { hanzi: "女", pinyin: "nǚ", meaning: "Phụ nữ", stroke: 3, examples: ["妈","姐","她","好","姓"], mnemonic: "Người phụ nữ quỳ gối, tay khoanh trước ngực" },
  { hanzi: "水", pinyin: "shuǐ", meaning: "Nước", stroke: 4, examples: ["河","海","泪","游","洗"], mnemonic: "Ba vạch như sóng nước chảy — bộ 氵khi ghép với chữ khác" },
  { hanzi: "火", pinyin: "huǒ", meaning: "Lửa", stroke: 4, examples: ["热","烧","炒","煮","灯"], mnemonic: "Ngọn lửa bùng cháy với tàn lửa bay lên — bộ 灬 khi ở dưới chữ" },
  { hanzi: "木", pinyin: "mù", meaning: "Gỗ / cây", stroke: 4, examples: ["树","桌","椅","林","森"], mnemonic: "Thân cây với cành trên và rễ dưới" },
  { hanzi: "土", pinyin: "tǔ", meaning: "Đất", stroke: 3, examples: ["地","坐","场","城","墙"], mnemonic: "Đất nằm giữa trời và mặt đất" },
  { hanzi: "金", pinyin: "jīn", meaning: "Kim loại / vàng", stroke: 8, examples: ["银","铁","钱","针","钟"], mnemonic: "Vàng chôn dưới đất, hai phần bên cạnh là hầm mỏ" },
  { hanzi: "山", pinyin: "shān", meaning: "Núi", stroke: 3, examples: ["岭","峰","岛","岩","崖"], mnemonic: "Ba đỉnh núi nhô lên — đỉnh giữa cao nhất" },
  { hanzi: "日", pinyin: "rì", meaning: "Mặt trời / ngày", stroke: 4, examples: ["明","晴","晚","昨","时"], mnemonic: "Hình tròn mặt trời với điểm sáng ở giữa" },
  { hanzi: "月", pinyin: "yuè", meaning: "Mặt trăng / tháng", stroke: 4, examples: ["明","期","朝","望","朋"], mnemonic: "Vầng trăng lưỡi liềm nghiêng nghiêng" },
  { hanzi: "目", pinyin: "mù", meaning: "Mắt", stroke: 5, examples: ["看","见","眼","睛","盲"], mnemonic: "Con mắt nhìn thẳng với hai đường kẻ ngang là lông mi" },
  { hanzi: "言", pinyin: "yán", meaning: "Lời nói", stroke: 7, examples: ["说","话","语","读","请"], mnemonic: "Miệng nói ra lời — bộ 讠khi ghép bên trái" },
  { hanzi: "走", pinyin: "zǒu", meaning: "Đi bộ", stroke: 7, examples: ["起","越","赶","超","趣"], mnemonic: "Chân người đang bước đi về phía trước" },
  { hanzi: "足", pinyin: "zú", meaning: "Chân", stroke: 7, examples: ["跑","跳","踢","踏","跟"], mnemonic: "Bàn chân với ngón chân và gót" },
  { hanzi: "食", pinyin: "shí", meaning: "Ăn / thức ăn", stroke: 9, examples: ["饭","饿","饱","餐","饮"], mnemonic: "Người ngồi ăn với bát cơm trước mặt — bộ 饣khi ghép bên trái" },
  { hanzi: "马", pinyin: "mǎ", meaning: "Con ngựa", stroke: 3, examples: ["骑","驾","驰","骨","驶"], mnemonic: "Con ngựa đứng với bờm và đuôi" },
  { hanzi: "鱼", pinyin: "yú", meaning: "Con cá", stroke: 8, examples: ["鲜","鲤","鲸","鲸","鳄"], mnemonic: "Hình con cá với vây và đuôi" },
  { hanzi: "鸟", pinyin: "niǎo", meaning: "Con chim", stroke: 5, examples: ["鸡","鸭","鹰","鹦","鹏"], mnemonic: "Con chim nhỏ với mỏ và đuôi dài" },
  { hanzi: "虫", pinyin: "chóng", meaning: "Côn trùng / sâu", stroke: 6, examples: ["蛇","蝶","蚊","蜂","螺"], mnemonic: "Con sâu cuộn mình thành hình — mọi loài bò sát nhỏ" },
  { hanzi: "草", pinyin: "cǎo", meaning: "Cỏ / thực vật", stroke: 9, examples: ["花","茶","药","菜","葡"], mnemonic: "Hai nhánh cỏ mọc lên từ mặt đất — bộ 艹ở trên chữ" },
  { hanzi: "竹", pinyin: "zhú", meaning: "Tre / trúc", stroke: 6, examples: ["笑","笔","算","答","等"], mnemonic: "Hai cành tre rủ xuống đối xứng nhau" },
  { hanzi: "雨", pinyin: "yǔ", meaning: "Mưa", stroke: 8, examples: ["雪","雷","霜","雾","露"], mnemonic: "Đám mây với những giọt mưa rơi xuống" },
  { hanzi: "力", pinyin: "lì", meaning: "Sức mạnh", stroke: 2, examples: ["功","加","动","努","劳"], mnemonic: "Bắp tay cong, căng cơ thể hiện sức mạnh" },
  { hanzi: "刀", pinyin: "dāo", meaning: "Dao / cắt", stroke: 2, examples: ["切","划","剪","刺","刻"], mnemonic: "Lưỡi dao sắc bén — bộ 刂khi ở bên phải chữ" },
  { hanzi: "弓", pinyin: "gōng", meaning: "Cái cung", stroke: 3, examples: ["强","弱","弹","弦","张"], mnemonic: "Cây cung uốn cong sẵn sàng bắn" },
  { hanzi: "石", pinyin: "shí", meaning: "Đá", stroke: 5, examples: ["砖","碗","磁","砸","碎"], mnemonic: "Tảng đá nằm dưới vách núi" },
  { hanzi: "纟", pinyin: "sī", meaning: "Sợi / tơ", stroke: 3, examples: ["红","绿","线","绸","编"], mnemonic: "Sợi tơ mỏng xoắn lại với nhau — bộ của vải, màu sắc" },
  { hanzi: "门", pinyin: "mén", meaning: "Cánh cửa", stroke: 3, examples: ["间","开","闭","闻","闯"], mnemonic: "Hai cánh cửa đóng lại — không gian bên trong" },
  { hanzi: "宀", pinyin: "mián", meaning: "Mái nhà", stroke: 3, examples: ["家","室","字","安","宝"], mnemonic: "Mái nhà che chở — không gian trong nhà" },
  { hanzi: "广", pinyin: "guǎng", meaning: "Mái rộng / nhà kho", stroke: 3, examples: ["店","庭","席","床","应"], mnemonic: "Mái nhà rộng một bên che phủ" },
  { hanzi: "囗", pinyin: "wéi", meaning: "Vây quanh / hộp", stroke: 3, examples: ["国","园","围","图","困"], mnemonic: "Hình vuông như bức tường bao quanh" },
  { hanzi: "田", pinyin: "tián", meaning: "Ruộng lúa", stroke: 5, examples: ["男","留","备","界","略"], mnemonic: "Ruộng lúa chia thành ô vuông đều nhau" },
  { hanzi: "禾", pinyin: "hé", meaning: "Lúa / cây hạt", stroke: 5, examples: ["种","秋","科","稻","稳"], mnemonic: "Cây lúa cúi đầu khi trĩu hạt" },
  { hanzi: "米", pinyin: "mǐ", meaning: "Gạo / hạt", stroke: 6, examples: ["粒","粉","精","糖","糕"], mnemonic: "Hạt gạo tỏa ra tám hướng như tinh tế" },
  { hanzi: "贝", pinyin: "bèi", meaning: "Vỏ sò / tiền tệ", stroke: 4, examples: ["财","货","贸","贵","赢"], mnemonic: "Vỏ sò thời xưa dùng làm tiền — bộ của tài sản, giao dịch" },
  { hanzi: "王", pinyin: "wáng", meaning: "Vua / ngọc", stroke: 4, examples: ["玉","珍","珠","班","球"], mnemonic: "Ba tầng trời đất người, vua là người nối liền ba tầng — bộ 王/玨 chỉ ngọc quý" },
  { hanzi: "示", pinyin: "shì", meaning: "Thần linh / chỉ dẫn", stroke: 5, examples: ["神","祝","福","礼","祈"], mnemonic: "Bàn thờ cúng tế — bộ 礻khi ghép bên trái chỉ tế lễ, tôn giáo" },
  { hanzi: "衣", pinyin: "yī", meaning: "Quần áo", stroke: 6, examples: ["被","袖","裙","裤","补"], mnemonic: "Bộ áo với tay áo và vạt áo — bộ 衤khi ghép bên trái" },
  { hanzi: "疒", pinyin: "nì", meaning: "Bệnh tật", stroke: 5, examples: ["病","痛","癌","疼","疲"], mnemonic: "Người nằm trên giường bệnh — bộ chỉ bệnh, đau đớn" },
  { hanzi: "页", pinyin: "yè", meaning: "Đầu người / trang giấy", stroke: 6, examples: ["顶","颈","颜","题","顺"], mnemonic: "Đầu người với nét đặc trưng — bộ liên quan đến đầu, mặt" },
  { hanzi: "鬼", pinyin: "guǐ", meaning: "Ma quỷ", stroke: 9, examples: ["魂","魄","魅","魔","魁"], mnemonic: "Bóng ma với cái đầu kỳ lạ và cái đuôi dài phất phơ" },
  { hanzi: "白", pinyin: "bái", meaning: "Trắng / sáng", stroke: 5, examples: ["的","皮","皆","百","泉"], mnemonic: "Ánh sáng mặt trời chiếu xuống — màu trắng tinh khiết" },
  { hanzi: "黑", pinyin: "hēi", meaning: "Đen", stroke: 12, examples: ["默","墨","黯","黛","黎"], mnemonic: "Lửa đốt cháy đất tạo ra màu đen của than" },
  { hanzi: "大", pinyin: "dà", meaning: "To lớn", stroke: 3, examples: ["太","天","夫","奇","套"], mnemonic: "Người giang rộng hai tay — biểu thị sự to lớn" },
  { hanzi: "小", pinyin: "xiǎo", meaning: "Nhỏ bé", stroke: 3, examples: ["少","尖","尘","省","肖"], mnemonic: "Ba chấm nhỏ — ít, nhỏ, tinh tế" },
  { hanzi: "父", pinyin: "fù", meaning: "Cha / người lớn tuổi", stroke: 4, examples: ["爷","爸","爹","爻","爵"], mnemonic: "Người đàn ông cầm gậy — quyền uy của cha" },
  { hanzi: "又", pinyin: "yòu", meaning: "Tay phải / lại", stroke: 2, examples: ["友","双","发","对","取"], mnemonic: "Bàn tay phải với ngón trỏ chỉ ra" },
  { hanzi: "子", pinyin: "zǐ", meaning: "Con trẻ / con trai", stroke: 3, examples: ["学","孩","字","存","孤"], mnemonic: "Đứa bé đang quơ tay — đại diện trẻ con" },
  { hanzi: "女", pinyin: "nǚ", meaning: "Phụ nữ", stroke: 3, examples: ["妈","姐","她","好","姓"], mnemonic: "Người phụ nữ quỳ gối, tay khoanh trước ngực" },
  { hanzi: "阜", pinyin: "fù", meaning: "Núi đất / gò", stroke: 8, examples: ["阶","陆","院","随","防"], mnemonic: "Các bậc đất đắp lên — bộ 阝bên trái chỉ địa hình" },
  { hanzi: "邑", pinyin: "yì", meaning: "Thành phố / ấp", stroke: 7, examples: ["都","郡","邦","郊","部"], mnemonic: "Người ngồi trong thành phố — bộ 阝bên phải chỉ địa danh" },
  { hanzi: "音", pinyin: "yīn", meaning: "Âm thanh", stroke: 9, examples: ["响","韵","韶","音","意"], mnemonic: "Âm thanh phát ra từ miệng và vang lên" },
  { hanzi: "见", pinyin: "jiàn", meaning: "Nhìn thấy", stroke: 4, examples: ["观","视","览","觉","规"], mnemonic: "Mắt người nhìn ra xung quanh" },
  { hanzi: "气", pinyin: "qì", meaning: "Khí / hơi thở", stroke: 4, examples: ["氛","氢","氮","氧","汽"], mnemonic: "Hơi khí bốc lên từ dưới đất" },
  { hanzi: "厂", pinyin: "chǎng", meaning: "Vách đá / nhà máy", stroke: 2, examples: ["厚","原","历","庄","厕"], mnemonic: "Vách đá nhô ra che chở bên dưới" },
  { hanzi: "皮", pinyin: "pí", meaning: "Da / vỏ", stroke: 5, examples: ["披","坡","疲","颇","破"], mnemonic: "Bàn tay bóc vỏ — lớp ngoài của vật" },
];

const STROKE_RANGES = [
  { label: "1-3 nét", min: 1, max: 3 },
  { label: "4-6 nét", min: 4, max: 6 },
  { label: "7+ nét", min: 7, max: 99 },
];

export default function RadicalsPage() {
  const { awardXP } = useProgress();
  const awardedSet = useRef(new Set<string>());
  const [search, setSearch] = useState("");
  const [strokeFilter, setStrokeFilter] = useState<string | null>(null);
  const [selectedRadical, setSelectedRadical] = useState<typeof RADICALS[0] | null>(null);


  const filtered = RADICALS.filter(r => {
    const matchSearch = !search || r.hanzi.includes(search) || r.meaning.toLowerCase().includes(search.toLowerCase()) || r.pinyin.includes(search);
    const range = STROKE_RANGES.find(s => s.label === strokeFilter);
    const matchStroke = !range || (r.stroke >= range.min && r.stroke <= range.max);
    return matchSearch && matchStroke;
  });

  return (
    <main className="min-h-screen pb-28 bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
        <div className="max-w-xl mx-auto space-y-3">
          <div>
            <h1 className="font-display text-xl font-bold">Bộ thủ Hán tự</h1>
            <p className="text-xs text-[var(--text-muted)]">{RADICALS.length} bộ thủ phổ biến nhất • Hiểu bộ thủ = đoán được ý nghĩa chữ Hán</p>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm bộ thủ... (VD: 心, tâm, xin)" aria-label="Tìm bộ thủ... (VD: 心, tâm, xin)"
              className="w-full pl-8 pr-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[rgba(255,255,255,0.06)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-mm-red/40"
            />
          </div>
          {/* Stroke filter */}
          <div className="flex gap-2">
            {STROKE_RANGES.map(r => (
              <button
                key={r.label}
                onClick={() => setStrokeFilter(strokeFilter === r.label ? null : r.label)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-all",
                  strokeFilter === r.label
                    ? "border-mm-red text-mm-red bg-mm-red/10"
                    : "border-[rgba(255,255,255,0.1)] text-[var(--text-muted)]"
                )}
              >
                {r.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-[var(--text-muted)] self-center">{filtered.length} bộ</span>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4">
        {/* Grid */}
        <div className="grid grid-cols-4 gap-2">
          {filtered.map((r, i) => (
            <motion.button
              key={r.hanzi}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.015 }}
              onClick={() => {
                setSelectedRadical(r);
                if (!awardedSet.current.has(r.hanzi)) {
                  awardedSet.current.add(r.hanzi);
                  awardXP(3, "Kham pha bo thu");
                }
              }}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all",
                selectedRadical?.hanzi === r.hanzi
                  ? "border-mm-red bg-mm-red/10"
                  : "border-[rgba(255,255,255,0.06)] bg-[var(--bg-card)] hover:border-[rgba(255,255,255,0.15)]"
              )}
            >
              <span className="text-2xl font-bold leading-tight">{r.hanzi}</span>
              <span className="text-[9px] text-mm-red/80">{r.pinyin}</span>
              <span className="text-[9px] text-[var(--text-muted)] text-center leading-tight line-clamp-1">{r.meaning}</span>
              <span className="text-[8px] text-[rgba(255,255,255,0.2)]">{r.stroke} nét</span>
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">Không tìm thấy bộ thủ nào</p>
          </div>
        )}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedRadical && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setSelectedRadical(null)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-card)] rounded-t-3xl p-6 max-w-xl mx-auto"
              style={{ maxHeight: "75vh", overflowY: "auto" }}
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-[rgba(255,255,255,0.15)] rounded-full mx-auto mb-6" />

              {/* Top */}
              <div className="flex items-start gap-5 mb-6">
                <div className="text-7xl font-bold leading-none">{selectedRadical.hanzi}</div>
                <div className="flex-1">
                  <div className="text-mm-red font-medium text-lg mb-1">{selectedRadical.pinyin}</div>
                  <div className="text-white font-semibold text-base mb-1">{selectedRadical.meaning}</div>
                  <div className="text-xs text-[var(--text-muted)]">{selectedRadical.stroke} nét</div>
                </div>
                <button
                  onClick={() => playTTS(selectedRadical.hanzi)}
                  className="p-2.5 rounded-full bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] transition-colors"
                >
                  <Volume2 size={18} className="text-mm-red" />
                </button>
              </div>

              {/* Mnemonic */}
              <div className="bg-[rgba(255,255,255,0.04)] rounded-2xl p-4 mb-4">
                <p className="text-xs text-[var(--text-muted)] mb-1">💡 Gợi nhớ hình ảnh</p>
                <p className="text-sm text-white/90 leading-relaxed">{selectedRadical.mnemonic}</p>
              </div>

              {/* Example characters */}
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-3">Các chữ chứa bộ thủ này:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRadical.examples.map(ex => (
                    <button
                      key={ex}
                      onClick={() => playTTS(ex)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] rounded-xl transition-colors"
                    >
                      <span className="text-xl font-bold">{ex}</span>
                      <Volume2 size={11} className="text-[var(--text-muted)]" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedRadical(null)}
                className="w-full mt-6 py-3 rounded-2xl border border-[rgba(255,255,255,0.1)] text-sm text-[var(--text-muted)] hover:text-white transition-colors"
              >
                Đóng
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
