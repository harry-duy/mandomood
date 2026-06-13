"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Lightbulb, Star } from "lucide-react";
import { useState } from "react";
import { playTTS } from "@/hooks/useTTS";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { type HSKWord } from "@/lib/hsk-data";
import { saveWord, isWordSaved } from "@/lib/savedWords";
import { useEffect } from "react";
import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
// Tra kho từ HSK chung — fallback khi chữ không có trong HANZI_DATA chi tiết.
import { findHskWord } from "@/lib/hskSearch";

// Dynamic import HanziWriterDisplay — tránh SSR crash
const HanziWriterDisplay = dynamic(
  () => import("@/components/ui/HanziWriterDisplay"),
  {
    ssr: false,
    loading: () => (
      <div className="w-32 h-32 rounded-2xl bg-[#111111] border-2 border-[rgba(255,255,255,0.1)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#E8504A]/30 border-t-[#E8504A] rounded-full animate-spin" />
      </div>
    ),
  }
);

// ─── Hanzi data (sẽ fetch từ DB sau) ─────────────────────────────────────────

const HANZI_DATA: Record<string, {
  hanzi: string; pinyin: string; tone: number; meaning: string[];
  radical: string; stroke_count: number; hsk_level: number;
  origin_story: string; visual_mnemonic: string; emotional_hook: string;
  example_sentences: { zh: string; pinyin: string; vi: string }[];
  related: string[];
}> = {
  爱: {
    hanzi: "爱", pinyin: "ài", tone: 4, meaning: ["tình yêu", "yêu", "thích"],
    radical: "心", stroke_count: 10, hsk_level: 2,
    origin_story: "Chữ 爱 trong tiếng Trung giản thể có 心 (trái tim) ở trung tâm. Chữ 爱 truyền thống 愛 bao gồm 心 (tim), 受 (nhận), và 友 (bạn bè) — tình yêu là khi bạn nhận bạn bè vào trái tim.",
    visual_mnemonic: "Hình dung: một trái tim 心 được bọc bởi hai cánh tay đang ôm — đó chính là 爱.",
    emotional_hook: "Người Trung Quốc nói '我爱你' (wǒ ài nǐ) nhưng thường chỉ nói khi thật sự nghiêm túc. Những cảm xúc nhỏ hàng ngày được thể hiện qua hành động, không phải lời nói.",
    example_sentences: [
      { zh: "我爱你", pinyin: "Wǒ ài nǐ", vi: "Anh/em yêu bạn" },
      { zh: "我爱喝咖啡", pinyin: "Wǒ ài hē kāfēi", vi: "Tôi thích uống cà phê" },
      { zh: "爱情很复杂", pinyin: "Àiqíng hěn fùzá", vi: "Tình yêu rất phức tạp" },
    ],
    related: ["情", "心", "恋", "爱好"],
  },
  心: {
    hanzi: "心", pinyin: "xīn", tone: 1, meaning: ["tim", "tâm", "lòng", "ý nghĩ"],
    radical: "心", stroke_count: 4, hsk_level: 3,
    origin_story: "Chữ 心 có nguồn gốc là hình ảnh của trái tim người thực. Trong tiếng Trung cổ, 心 đại diện cho cả trái tim vật lý lẫn tâm trí — vì người xưa tin rằng suy nghĩ xuất phát từ tim.",
    visual_mnemonic: "Nhìn chữ 心: ba nét như ba giọt máu nhỏ từ trái tim, và một nét cong bên dưới như quả tim. Đơn giản nhưng đầy cảm xúc.",
    emotional_hook: "心 xuất hiện trong hàng trăm từ cảm xúc: 心情 (tâm trạng), 心动 (rung động), 心碎 (tan vỡ lòng). Học 心 là học tất cả ngôn ngữ cảm xúc tiếng Trung.",
    example_sentences: [
      { zh: "你在我心里", pinyin: "Nǐ zài wǒ xīn lǐ", vi: "Bạn ở trong lòng tôi" },
      { zh: "今天心情很好", pinyin: "Jīntiān xīnqíng hěn hǎo", vi: "Tâm trạng hôm nay rất tốt" },
      { zh: "我全心全意", pinyin: "Wǒ quánxīn quányì", vi: "Tôi hết lòng hết dạ" },
    ],
    related: ["爱", "情", "心情", "心动"],
  },
  缘: {
    hanzi: "缘", pinyin: "yuán", tone: 2, meaning: ["duyên", "duyên phận", "lý do", "viền"],
    radical: "糸", stroke_count: 12, hsk_level: 5,
    origin_story: "缘 gồm bộ 糸 (sợi chỉ — mối liên hệ) và phần bên phải nghĩa là 'đường viền'. Người xưa hình dung duyên phận như những sợi chỉ đỏ vô hình kết nối những người có duyên với nhau.",
    visual_mnemonic: "Tưởng tượng những sợi chỉ đỏ (糸) quấn quanh hai người — đó là 缘 phận giữa họ.",
    emotional_hook: "Sợi chỉ đỏ (红线) trong văn hóa Trung Hoa: Thần Tơ Hồng buộc sợi chỉ đỏ vào cổ tay hai người có duyên, dù họ ở đâu, dù thế nào — họ sẽ gặp nhau.",
    example_sentences: [
      { zh: "这是我们的缘分", pinyin: "Zhè shì wǒmen de yuánfèn", vi: "Đây là duyên phận của chúng ta" },
      { zh: "无缘无故", pinyin: "Wú yuán wú gù", vi: "Không có lý do gì cả" },
      { zh: "有缘再见", pinyin: "Yǒu yuán zàijiàn", vi: "Nếu có duyên thì gặp lại" },
    ],
    related: ["分", "缘分", "命运", "红线"],
  },
  静: {
    hanzi: "静", pinyin: "jìng", tone: 4, meaning: ["bình yên", "yên tĩnh", "tĩnh lặng"],
    radical: "青", stroke_count: 14, hsk_level: 3,
    origin_story: "静 gồm 青 (xanh lá — màu của thiên nhiên bình yên) và 争 (tranh giành). Khi không còn tranh giành, thiên nhiên trả lại màu xanh — đó là 静.",
    visual_mnemonic: "Tưởng tượng một khu vườn xanh (青) sau khi mọi cuộc tranh cãi (争) đã kết thúc — không khí trong lành, tĩnh lặng hoàn toàn.",
    emotional_hook: "Người Trung Quốc dùng 静下来 (jìng xia lái) — 'hãy tĩnh lại' — khi cần ai đó bình tâm. 心静 (xīn jìng) là trạng thái nội tâm bình yên mà nhiều người cả đời tìm kiếm.",
    example_sentences: [
      { zh: "心静自然凉", pinyin: "Xīn jìng zìrán liáng", vi: "Lòng bình yên thì tự nhiên mát mẻ (tâm thái quyết định mọi thứ)" },
      { zh: "保持安静", pinyin: "Bǎochí ānjìng", vi: "Giữ im lặng / giữ bình tĩnh" },
      { zh: "夜深人静", pinyin: "Yè shēn rén jìng", vi: "Đêm khuya người vắng — khung cảnh tĩnh mịch" },
    ],
    related: ["安", "平", "心", "静心"],
  },
  梦: {
    hanzi: "梦", pinyin: "mèng", tone: 4, meaning: ["giấc mơ", "mơ", "ước mơ"],
    radical: "夕", stroke_count: 11, hsk_level: 4,
    origin_story: "梦 truyền thống 夢 gồm 林 (rừng cây), 目 (mắt), và 夕 (đêm). Giấc mơ là khi đôi mắt nhìn thấy rừng cây trong đêm — thế giới ẩn hiện khi ngủ.",
    visual_mnemonic: "Đêm (夕) + mắt nhắm (木) = giấc mơ. Hình dung bạn nhắm mắt dưới ánh trăng và bước vào khu rừng bí ẩn.",
    emotional_hook: "梦想 (mèngxiǎng) là 'ước mơ và lý tưởng' — từ này xuất hiện trong mọi bài phát biểu truyền cảm hứng Trung Quốc. Còn 做梦 (zuò mèng) vừa nghĩa là 'nằm mơ' vừa là 'đừng có mơ!'",
    example_sentences: [
      { zh: "我昨晚做了一个梦", pinyin: "Wǒ zuówǎn zuòle yīgè mèng", vi: "Tối qua tôi nằm mơ" },
      { zh: "追逐梦想", pinyin: "Zhuīzhú mèngxiǎng", vi: "Theo đuổi ước mơ" },
      { zh: "梦里不知身是客", pinyin: "Mèng lǐ bù zhī shēn shì kè", vi: "Trong mơ quên mình là khách tha hương (thơ Lý Dục)" },
    ],
    related: ["想", "梦想", "睡", "夜"],
  },
  情: {
    hanzi: "情", pinyin: "qíng", tone: 2, meaning: ["tình cảm", "cảm xúc", "tình yêu", "hoàn cảnh"],
    radical: "心", stroke_count: 11, hsk_level: 3,
    origin_story: "情 gồm 忄(trái tim — biến thể của 心) và 青 (xanh lá, thuần khiết). Tình cảm thuần khiết nhất xuất phát từ trái tim trong sáng như màu xanh.",
    visual_mnemonic: "Trái tim (忄) và màu xanh thuần khiết (青) — tình cảm chân thật, không pha tạp.",
    emotional_hook: "情 xuất hiện trong hàng trăm từ: 爱情 (tình yêu lãng mạn), 友情 (tình bạn), 亲情 (tình thân), 感情 (cảm tình). Mỗi loại tình cảm đều có từ riêng — tiếng Trung rất cụ thể về tình cảm.",
    example_sentences: [
      { zh: "感情很深", pinyin: "Gǎnqíng hěn shēn", vi: "Tình cảm rất sâu đậm" },
      { zh: "人之常情", pinyin: "Rén zhī cháng qíng", vi: "Chuyện thường tình của con người" },
      { zh: "情深义重", pinyin: "Qíng shēn yì zhòng", vi: "Tình nghĩa sâu nặng" },
    ],
    related: ["爱", "心", "感", "情感"],
  },
  思: {
    hanzi: "思", pinyin: "sī", tone: 1, meaning: ["nỗi nhớ", "suy nghĩ", "nghĩ đến"],
    radical: "心", stroke_count: 9, hsk_level: 4,
    origin_story: "思 gồm 田 (ruộng đất — đất quê hương) và 心 (trái tim). Khi trái tim hướng về quê nhà — đó là nỗi nhớ. Người xưa tin rằng suy nghĩ bắt đầu từ hình ảnh của quê hương.",
    visual_mnemonic: "Ruộng đất quê hương (田) ngồi trên trái tim (心) — mỗi khi nhớ, hình ảnh làng quê lại hiện về.",
    emotional_hook: "思乡 (sīxiāng) là 'nỗi nhớ quê' — một trong những cảm xúc được thơ Trung Hoa viết nhiều nhất suốt 3000 năm. 李白's 静夜思 (Tĩnh dạ tư) là bài thơ về nỗi nhớ nhà nổi tiếng nhất.",
    example_sentences: [
      { zh: "思念是一种病", pinyin: "Sīniàn shì yī zhǒng bìng", vi: "Nỗi nhớ là một căn bệnh" },
      { zh: "三思而后行", pinyin: "Sān sī ér hòu xíng", vi: "Suy nghĩ ba lần trước khi hành động" },
      { zh: "思乡情切", pinyin: "Sīxiāng qíng qiē", vi: "Nỗi nhớ quê thiết tha" },
    ],
    related: ["念", "想", "心", "思念"],
  },
  忍: {
    hanzi: "忍", pinyin: "rěn", tone: 3, meaning: ["nhẫn nại", "chịu đựng", "kiềm chế"],
    radical: "心", stroke_count: 7, hsk_level: 5,
    origin_story: "忍 gồm 刃 (lưỡi dao) đặt trên 心 (trái tim). Hình ảnh cực kỳ thơ: nhẫn nhịn là khi lưỡi dao chạm vào tim nhưng bạn vẫn không phản ứng — đau nhưng im lặng.",
    visual_mnemonic: "Dao (刃) cắm xuống tim (心) — nhẫn nại là chịu đựng nỗi đau mà không bùng phát.",
    emotional_hook: "Người Trung Hoa có câu: '忍一时风平浪静，退一步海阔天空' — Nhịn một lúc gió yên sóng lặng, lùi một bước biển rộng trời cao. Đây là triết lý sống của nhiều thế hệ.",
    example_sentences: [
      { zh: "忍无可忍", pinyin: "Rěn wú kě rěn", vi: "Không thể chịu đựng được nữa (giới hạn cuối cùng)" },
      { zh: "忍一忍就过去了", pinyin: "Rěn yī rěn jiù guòqù le", vi: "Nhẫn một chút là qua thôi" },
      { zh: "百忍成金", pinyin: "Bǎi rěn chéng jīn", vi: "Trăm lần nhẫn nhịn thành vàng" },
    ],
    related: ["耐", "忍耐", "心", "坚持"],
  },
  勇: {
    hanzi: "勇", pinyin: "yǒng", tone: 3, meaning: ["can đảm", "dũng cảm", "dũng khí"],
    radical: "力", stroke_count: 9, hsk_level: 4,
    origin_story: "勇 gồm 甬 (ống dẫn — dòng chảy mạnh) và 力 (sức lực). Lòng dũng cảm như dòng nước mạnh chảy qua ống — sức mạnh tập trung và có hướng.",
    visual_mnemonic: "Sức lực (力) được kênh dẫn (甬) đúng hướng — đó là dũng cảm, không phải liều lĩnh.",
    emotional_hook: "勇气 (yǒngqì) là 'dũng khí' — khí phách dám làm. Người Trung Hoa phân biệt rõ 勇 (dũng cảm có suy nghĩ) và 莽 (liều lĩnh bốc đồng). Chỉ 勇 mới được ngợi ca.",
    example_sentences: [
      { zh: "鼓起勇气", pinyin: "Gǔqǐ yǒngqì", vi: "Lấy hết can đảm / dũng cảm lên" },
      { zh: "勇往直前", pinyin: "Yǒng wǎng zhí qián", vi: "Dũng cảm tiến thẳng về phía trước" },
      { zh: "真正的勇敢", pinyin: "Zhēnzhèng de yǒnggǎn", vi: "Lòng dũng cảm thực sự" },
    ],
    related: ["力", "气", "勇气", "强"],
  },
  福: {
    hanzi: "福", pinyin: "fú", tone: 2, meaning: ["phúc lộc", "hạnh phúc", "may mắn"],
    radical: "示", stroke_count: 13, hsk_level: 4,
    origin_story: "福 gồm 示 (bàn thờ thần linh) và 畐 (bình đầy ắp rượu và thức ăn). Ngày xưa 福 là khi cúng tế thần linh đầy đủ — phúc lành từ trên ban xuống.",
    visual_mnemonic: "Bàn thờ (示) với bình đầy ắp (畐) — khi lễ vật đủ đầy, phúc lộc đến nhà.",
    emotional_hook: "Mỗi năm Tết, người Trung Hoa dán chữ 福 ngược (倒福) trên cửa vì 倒 (ngược) đồng âm với 到 (đến) — phúc 'đến' nhà. Một chữ, một phong tục cả nghìn năm.",
    example_sentences: [
      { zh: "祝你幸福", pinyin: "Zhù nǐ xìngfú", vi: "Chúc bạn hạnh phúc" },
      { zh: "福气满满", pinyin: "Fúqì mǎn mǎn", vi: "Phúc khí đầy tràn" },
      { zh: "知足者常乐，知足是福", pinyin: "Zhī zú zhě cháng lè", vi: "Biết đủ thì thường vui, biết đủ là phúc" },
    ],
    related: ["幸", "乐", "吉", "幸福"],
  },
  泪: {
    hanzi: "泪", pinyin: "lèi", tone: 4, meaning: ["nước mắt", "giọt lệ"],
    radical: "氵", stroke_count: 8, hsk_level: 5,
    origin_story: "泪 gồm 氵(nước) và 目 (mắt). Đơn giản và thơ đến mức không cần giải thích — nước từ mắt chảy ra. Chữ Trung cổ hơn là 淚, phức tạp hơn nhưng ít dùng hơn bây giờ.",
    visual_mnemonic: "Nước (氵) + mắt (目) = nước mắt. Không có hình ảnh nào trực tiếp hơn trong cả hệ thống chữ Hán.",
    emotional_hook: "Thơ Trung Hoa đầy những giọt lệ: 泪眼问花花不语 (mắt lệ hỏi hoa, hoa không đáp) của Âu Dương Tu. 泪 là chữ xuất hiện nhiều nhất trong thơ cổ về chia ly và tương tư.",
    example_sentences: [
      { zh: "热泪盈眶", pinyin: "Rè lèi yíng kuàng", vi: "Nước mắt nóng lăn đầy mi (xúc động tột độ)" },
      { zh: "泪流满面", pinyin: "Lèi liú mǎn miàn", vi: "Nước mắt chảy đầy mặt" },
      { zh: "强忍泪水", pinyin: "Qiáng rěn lèishuǐ", vi: "Cố gắng kìm nước mắt" },
    ],
    related: ["哭", "眼", "水", "伤"],
  },
  笑: {
    hanzi: "笑", pinyin: "xiào", tone: 4, meaning: ["cười", "nụ cười", "chế nhạo"],
    radical: "竹", stroke_count: 10, hsk_level: 2,
    origin_story: "笑 gồm 竹 (tre) và 夭 (uốn cong — người cúi người). Tre khi có gió thì cúi người uyển chuyển — hình ảnh người cúi mình vì cười to, giống cây tre rũ trong gió.",
    visual_mnemonic: "Cây tre (竹) cong mình (夭) trong gió — đó là hình ảnh người đang cười ngã nghiêng.",
    emotional_hook: "微笑 (wēixiào) là 'nụ cười nhẹ' — thanh lịch và kín đáo. 大笑 (dàxiào) là cười to. 苦笑 (kǔxiào) là cười chua — cười mà lòng đắng. Tiếng Trung phân biệt từng sắc thái của nụ cười.",
    example_sentences: [
      { zh: "你笑起来很好看", pinyin: "Nǐ xiào qǐlái hěn hǎokàn", vi: "Khi bạn cười trông rất đẹp" },
      { zh: "破涕为笑", pinyin: "Pò tì wéi xiào", vi: "Nín khóc chuyển sang cười (vui vẻ đột ngột)" },
      { zh: "笑一笑，十年少", pinyin: "Xiào yī xiào, shí nián shào", vi: "Một nụ cười, trẻ ra mười tuổi" },
    ],
    related: ["乐", "开心", "笑容", "幸福"],
  },
  念: {
    hanzi: "念", pinyin: "niàn", tone: 4, meaning: ["nhớ nhung", "nghĩ đến", "đọc to", "ý niệm"],
    radical: "心", stroke_count: 8, hsk_level: 4,
    origin_story: "念 gồm 今 (bây giờ — khoảnh khắc hiện tại) và 心 (trái tim). Nỗi nhớ là khoảnh khắc hiện tại của trái tim — khi đang nhớ ai, người đó đang chiếm trọn trái tim bạn lúc này.",
    visual_mnemonic: "Bây giờ (今) trong tim (心) — người đó đang ở trong tim bạn ngay khoảnh khắc này. Đó là nỗi nhớ.",
    emotional_hook: "想念 (xiǎngniàn) và 思念 (sīniàn) đều nghĩa là nhớ nhung, nhưng 念 mang cảm giác gần hơn — nhớ trong từng khoảnh khắc nhỏ. 念念不忘 (niàn niàn bù wàng) — không phút nào không nhớ.",
    example_sentences: [
      { zh: "念念不忘，必有回响", pinyin: "Niàn niàn bù wàng, bì yǒu huíxiǎng", vi: "Không phút nào quên, ắt sẽ có tiếng vang (có thành quả)" },
      { zh: "我很想念你", pinyin: "Wǒ hěn xiǎngniàn nǐ", vi: "Tôi rất nhớ bạn" },
      { zh: "一念之间", pinyin: "Yī niàn zhī jiān", vi: "Trong một ý niệm / chỉ một suy nghĩ" },
    ],
    related: ["想", "思", "忆", "心"],
  },
  悟: {
    hanzi: "悟", pinyin: "wù", tone: 4, meaning: ["giác ngộ", "chợt hiểu", "lĩnh hội"],
    radical: "心", stroke_count: 10, hsk_level: 5,
    origin_story: "悟 gồm 忄(trái tim) và 吾 (tôi — ngôi thứ nhất). Giác ngộ là khi trái tim của chính mình hiểu ra — không ai có thể giúp bạn giác ngộ, chỉ bạn mới giác ngộ được cho chính mình.",
    visual_mnemonic: "Trái tim (忄) của tôi (吾) bỗng sáng lên — đó là khoảnh khắc 悟, không thể diễn đạt bằng lời.",
    emotional_hook: "顿悟 (dùnwù) là 'đốn ngộ' trong Phật giáo Thiền — giác ngộ tức thì, không qua học hỏi từ từ. Tôn Ngộ Không (孙悟空) — tên nhân vật có chữ 悟 — người đã ngộ ra Không (sự vô thường).",
    example_sentences: [
      { zh: "恍然大悟", pinyin: "Huǎngrán dà wù", vi: "Bỗng chợt hiểu ra (ngộ ra lớn)" },
      { zh: "每个人都有自己的领悟", pinyin: "Měi gè rén dōu yǒu zìjǐ de lǐngwù", vi: "Mỗi người đều có sự lĩnh hội riêng của mình" },
      { zh: "悟出道理", pinyin: "Wù chū dàolǐ", vi: "Ngộ ra được đạo lý" },
    ],
    related: ["知", "觉", "明白", "顿悟"],
  },
  惜: {
    hanzi: "惜", pinyin: "xī", tone: 1, meaning: ["tiếc thương", "trân trọng", "tiếc"],
    radical: "心", stroke_count: 11, hsk_level: 4,
    origin_story: "惜 gồm 忄(trái tim) và 昔 (ơi ưa — quá khứ). Tiếc là khi trái tim hướng về quá khứ — những gì đã mất đi.",
    visual_mnemonic: "Trái tim (忄) nhìn về những ngày ưa (昔) — tiếc nuối luôn hướng về quá khứ.",
    emotional_hook: "可惜 (kěxī) — 'Tiếc thay' — một trong những từ được dùng nhiều nhất trong thơ tình Tiếng Trung. Bạn có thể không biết nhiều từ, nhưng nếu biết 可惜, bạn có thể nói lên nỗi lòng của cả một thế hệ.",
    example_sentences: [
      { zh: "可惜", pinyin: "Kěxī", vi: "Tiếc thay, thật đáng tiếc" },
      { zh: "珍惜光阴", pinyin: "Zhēnxī guāngyīn", vi: "Trân trọng từng khoảnh khắc" },
      { zh: "惜别山河", pinyin: "Xī bié shānhé", vi: "Tiếc nuối rời xa non nước" },
    ],
    related: ["怎", "爱", "心", "费"],
  },
  暖: {
    hanzi: "暖", pinyin: "nuǎn", tone: 3, meaning: ["ấm", "ấm áp", "làm ấm"],
    radical: "日", stroke_count: 13, hsk_level: 3,
    origin_story: "暖 gồm 日 (mặt trời) và một phần mang nghĩa 'trao đi'. Mặt trời trao hơi ấm — đó là 暖.",
    visual_mnemonic: "Mặt trời (日) chiếu qua cửa sổ vào buổi sáng, chạm vào má bạn — cảm giác đó là 暖.",
    emotional_hook: "暖男 (nuǎn nán) — 'đàn ông ấm áp' — là từ Gen Z Trung Quốc dùng cho người bạn trai lý tưởng. Không cần đẹp, không cần giàu — chỉ cần 暖.",
    example_sentences: [
      { zh: "你让我感到很暖", pinyin: "Nǐ ràng wǒ gǎndào hěn nuǎn", vi: "Bạn khiến tôi cảm thấy rất ấm lòng" },
      { zh: "暖男", pinyin: "Nuǎn nán", vi: "Người đàn ông ấm áp (ideal boyfriend)" },
      { zh: "心里暖暖的", pinyin: "Xīn lǐ nuǎnnuǎn de", vi: "Trong lòng ấm áp" },
    ],
    related: ["热", "冷", "心", "温"],
  },
  望: {
    hanzi: "望", pinyin: "wàng", tone: 4, meaning: ["trông mong", "nhìn xa", "mong đợi", "hi vọng"],
    radical: "月", stroke_count: 11, hsk_level: 4,
    origin_story: "望 truyền thống gồm người đứng trên đất nhìn về phía chân trời. Mong chờ là khi đôi mắt hướng xa nhưng đôi chân vẫn đứng yên.",
    visual_mnemonic: "Người (人) vươn cổ (vương) nhìn về chân trời xa — đó là 望.",
    emotional_hook: "希望 (xīwàng) là 'hi vọng'. Người Trung Hoa nói: 希望在前方 — Hi vọng ở phía trước. Khi nói 望, họ đang nhìn về tương lai với cả trái tim.",
    example_sentences: [
      { zh: "望着你回来", pinyin: "Wàng zhe nǐ huílái", vi: "Trông mong bạn trở về" },
      { zh: "山高水长居希望", pinyin: "Shān gāo shuǐ cháng jū xīwàng", vi: "Núi cao sông dài ở hi vọng" },
      { zh: "望天欲远飞", pinyin: "Wàng tiān yù yuǎn fēi", vi: "Ngóng trời muốn bay xa" },
    ],
    related: ["希", "盼", "看", "想"],
  },
  盼: {
    hanzi: "盼", pinyin: "pàn", tone: 4, meaning: ["mong chờ", "đôi mắt mong", "trông"],
    radical: "目", stroke_count: 10, hsk_level: 5,
    origin_story: "盼 gồm 分 (chia ra) và 目 (mắt). Mắt dõi theo từng hướng — mong chờ là khi cả đôi mắt đù nhìn ra ngóng đợi.",
    visual_mnemonic: "Đôi mắt (目) tách ra (分) hai phía — mong chờ đến mức mắt mởi bên trông một hướng.",
    emotional_hook: "盼君归 (Pàn jūn guī) — Mong chàng trở về — câu nói nổi tiếng nhất của người vợ chờ chồng đi chiến đấu. 盼 mang trong nó cả biển cả yêu thương.",
    example_sentences: [
      { zh: "盼了很久", pinyin: "Pàn le hěn jiǔ", vi: "Chờ đợi đã rất lâu" },
      { zh: "盼山盼水盼你归", pinyin: "Pàn shān pàn shuǐ pàn nǐ guī", vi: "Trông núi trông sông trông bạn về" },
      { zh: "满心期盼", pinyin: "Mǎn xīn qībàn", vi: "Đầy lòng mong đợi" },
    ],
    related: ["望", "希", "展", "目"],
  },
  归: {
    hanzi: "归", pinyin: "guī", tone: 1, meaning: ["trở về", "về nhà", "quy về"],
    radical: "止", stroke_count: 5, hsk_level: 4,
    origin_story: "归 truyền thống 歸 hình vẽ người phụ nữ với cây chổi trên vai đang đi về nhà sau một ngày dài. Trở về là về với nơi bạn thuộc về.",
    visual_mnemonic: "Bước chân (止) hướng về nhà — đơn giản, dứt khoát. Mỗi bước đi là một bước về.",
    emotional_hook: "落叶归根 — Lá rụng về cội. Người Trung Hoa dù đi xa đến đâu cũng khát vọng 归 — về nhà, về với gốc rễ.",
    example_sentences: [
      { zh: "归心似箭", pinyin: "Guī xīn sì jiàn", vi: "Lòng muốn về nhà nhanh như mũi tên" },
      { zh: "落叶归根", pinyin: "Luò yè guī gēn", vi: "Lá rụng về cội" },
      { zh: "归来归去", pinyin: "Guī lái guī qù", vi: "Qua lại trở về — qua qua lại lại" },
    ],
    related: ["来", "回", "家", "乡"],
  },
  别: {
    hanzi: "别", pinyin: "bié", tone: 2, meaning: ["chia tay", "đừng", "khác nhau", "tạm biệt"],
    radical: "刀", stroke_count: 7, hsk_level: 2,
    origin_story: "别 gồm 另 (khác đi) và 刀 (dao). Chia tay như lưỡi dao cắt đứt — hai người đi hai hướng khác nhau.",
    visual_mnemonic: "Dao (刀) cắt đôi — hai người từ một trở thành hai, mỗi người một đường.",
    emotional_hook: "别 có hai nghĩa đau nhất: 'đừng' (cầu xin) và 'tạm biệt' (chia ly). Câu nói cuối cùng trước chia tay thường là: 别走 — Đừng đi.",
    example_sentences: [
      { zh: "别走，好吗", pinyin: "Bié zǒu, hǎo ma", vi: "Đừng đi, được không?" },
      { zh: "离别是为了更好的相聚", pinyin: "Líbié shì wèile gèng hǎo de xiāngjù", vi: "Chia ly là để gặp lại tốt hơn" },
      { zh: "别有风情", pinyin: "Bié yǒu fēngqíng", vi: "Có phong vị riêng, khác biệt" },
    ],
    related: ["离", "分", "走", "再见"],
  },
  痛: {
    hanzi: "痛", pinyin: "tòng", tone: 4, meaning: ["đau", "đau đớn", "đau lòng"],
    radical: "疲", stroke_count: 12, hsk_level: 4,
    origin_story: "痛 gồm bộ 疲 (bệnh) và 用 (dùng). Cơn đau là khi bệnh tật 'dùng' hết sức mạnh của bạn. Đau thể xác hay tâm hồn — đều cùng một chữ.",
    visual_mnemonic: "Bệnh (疲) dùng hết (用) sức mạnh — đau là khi bạn cảm thấy kiệt sức hoàn toàn.",
    emotional_hook: "心痛 (xīntòng) là 'đau lòng' — vết thương tâm hồn có từ riêng. Người Trung Hoa tin rằng đau lòng có thể đầu đớn không kém đau thể xác.",
    example_sentences: [
      { zh: "心痛不如身痛", pinyin: "Xīntòng bùrú shēntòng", vi: "Đau lòng còn hơn đau thân xác" },
      { zh: "痛苦中成长", pinyin: "Tòngkǔ zhōng chéngzhǎng", vi: "Trưởng thành trong đau khổ" },
      { zh: "将心比心，感同身受", pinyin: "Jiāng xīn bǐ xīn, gǎn tóng shēn shòu", vi: "Đặt lòng mình vào lòng người khác" },
    ],
    related: ["苦", "伤", "心", "病"],
  },
  散: {
    hanzi: "散", pinyin: "sàn", tone: 4, meaning: ["tan biến", "rời đi", "phân tán", "xuất hiện"],
    radical: "文", stroke_count: 12, hsk_level: 4,
    origin_story: "散 gồm 月 (một loại thịt — gốc là thân thể) và 敖 (dùng roi). Khi tất cả bị phân tán, tan rã — như mưa bị gió đẩy đén tứ phía.",
    visual_mnemonic: "Tưởng tượng một bó hoa vỡ ra, cánh hoa bay khắp nơi trong gió — đó là 散.",
    emotional_hook: "散了 (Sàn le) — Tan rã rồi. Hai chữ ngắn nhất nhưng đủ để kết thúc một câu chuyện yêu. Trong tiếng Trung hiện đại, 'chúng ta đã 散 rồi' nhẹ nhưng sâu.",
    example_sentences: [
      { zh: "聚散离合", pinyin: "Jù sàn lí hé", vi: "Hợp tan ly hợp — vòng lập của cuộc đời" },
      { zh: "散心了", pinyin: "Xīn sàn le", vi: "Lòng đã tan nát" },
      { zh: "人散心不散", pinyin: "Rén sàn xīn bù sàn", vi: "Người tan nhưng lòng không tan" },
    ],
    related: ["离", "分", "忠", "走"],
  },
  孤: {
    hanzi: "孤", pinyin: "gū", tone: 1, meaning: ["cô đơn", "một mình", "mồ côi"],
    radical: "子", stroke_count: 8, hsk_level: 5,
    origin_story: "孤 gồm 子 (con cái) và 瓜 (bí ngô). Một đứa trẻ mồ côi như trái bí ngô một mình trên đồng — heo hút, không có ai.",
    visual_mnemonic: "Trẻ con (子) đơn độc như trái bí (瓜) giữa cánh đồng rộng lớn — cô đơn không ai thấu.",
    emotional_hook: "孤独 (gūdú) là 'cô đơn một mình'. Người Trung Hoa có câu: '孤独不是一个人吃饭，而是一棁馓灯下没有人说话' — Cô đơn không phải ăn cơm một mình, mà là dưới ngọn đèn không có ai để nói chuyện.",
    example_sentences: [
      { zh: "孤身旅客", pinyin: "Gū shēn lǚkè", vi: "Một mình nơi đất khách" },
      { zh: "我不孤独", pinyin: "Wǒ bù gūdú", vi: "Tôi không cô đơn" },
      { zh: "孤鹰海上飞", pinyin: "Gū yīng hǎi shàng fēi", vi: "Diều hâu cô đơn bay trên biển" },
    ],
    related: ["独", "寂", "心", "单"],
  },
  哭: {
    hanzi: "哭", pinyin: "kū", tone: 1, meaning: ["khóc", "rơi lệ", "thảm thiết"],
    radical: "口", stroke_count: 10, hsk_level: 3,
    origin_story: "哭 gồm 口 (miệng) và 犬 (chó). Người xưa nghe tiếng khóc như tiếng sủa não nuột của chó — âm thanh đau đớn nhất thế giới.",
    visual_mnemonic: "Miệng (口) phát ra tiếng như chó (犬) sủa — khóc là khi cảm xúc vượt qua mọi kiểm soát.",
    emotional_hook: "哭出来 (kū chūlai) — Cứ khóc đi. Trong văn hóa Trung Hoa hiện đại, việc cho phép bản thân khóc được xem là sức mạnh, không phải yếu đuối.",
    example_sentences: [
      { zh: "哭了就好了", pinyin: "Kūle jiù hǎo le", vi: "Khóc xong là ổn rồi" },
      { zh: "告别哭泣", pinyin: "Gàobié kūqì", vi: "Khóc nức nở khi chia tay" },
      { zh: "哭得很伤心", pinyin: "Kū de hěn shāngxīn", vi: "Khóc đau đớn lắm" },
    ],
    related: ["泪", "心", "伤", "悲"],
  },
  寂: {
    hanzi: "寂", pinyin: "jì", tone: 4, meaning: ["cô tịch", "yên lặng", "vắng vẻo"],
    radical: "宀", stroke_count: 11, hsk_level: 5,
    origin_story: "寂 gồm bộ mái nhà (宀) và 叔 (cơ mầm — sự yên tĩnh). Yên tĩnh đến mức chỉ nghe thấy sự siêu đờng tĩnh.",
    visual_mnemonic: "Mái nhà (宀) phủ xuống trong bóng tối — cô tịch là khi không gian xung quanh quá yên tĩnh.",
    emotional_hook: "寂寅 (jìmò) là 'sự cô đơn lặng lẽ'. Khác với 孤独 (cô đơn có tiếng động), 寂 là loại cô đơn yên tĩnh, sâu đến mức có thể cảm nhận được — loại cô đơn của 3 giờ sáng.",
    example_sentences: [
      { zh: "寂寞难耐", pinyin: "Jìmò nán nài", vi: "Cô tịch khó chịu nổi" },
      { zh: "大隐于市，小隐于野", pinyin: "Dà yǐn yú shì, xiǎo yǐn yú yě", vi: "Ẩn lớn ở đô thị, ẩn nhỏ ở hoàng dã" },
      { zh: "寂寅之中有大美", pinyin: "Jìmò zhī zhōng yǒu dà měi", vi: "Trong cô tịch có vẻ đẹp lớn lao" },
    ],
    related: ["孤", "静", "心", "独"],
  },
  真: {
    hanzi: "真", pinyin: "zhēn", tone: 1, meaning: ["chân thật", "thật", "thật sự", "thật ra"],
    radical: "目", stroke_count: 10, hsk_level: 2,
    origin_story: "真 gốc từ hình ảnh người ngằng thẳng đứng trên đất. Sự thật là khi bạn đứng thẳng, không cần che giấu hay uốn éo.",
    visual_mnemonic: "Một người đứng thẳng (ngắn gọn) trên nền vững chắc — đó là 真: không cần gập người, không cần diễn.",
    emotional_hook: "Trong văn hóa Trung Hoa hiện đại Gen Z: 真的吗 (Thật không?) và 我是认真的 (Tôi nghiêm túc đó) — 真 là chuẩn mực cao nhất của một mối quan hệ.",
    example_sentences: [
      { zh: "我是认真的", pinyin: "Wǒ shì rènzhēn de", vi: "Tôi nghiêm túc đó" },
      { zh: "真心话", pinyin: "Zhēnxīn huà", vi: "Lời nói thật lòng" },
      { zh: "真实不虚假", pinyin: "Zhēnshí bù xūjiǎ", vi: "Chân thật không giả tạo" },
    ],
    related: ["假", "诚", "心", "实"],
  },
  陪: {
    hanzi: "陪", pinyin: "péi", tone: 2, meaning: ["đồng hành", "ở bên", "đi cùng", "bất đồng hành"],
    radical: "阜", stroke_count: 11, hsk_level: 3,
    origin_story: "陪 gồm bộ 阜 (đất nhô cao, gần cái bệ) và 倍 (gấp đôi). Người đứng bên cạnh người khác — đồng hành là luôn có người kề bên.",
    visual_mnemonic: "Hai người được nhân (倍) lên cùng nhau trên cái bệ vững chắc — cùng đi, cùng được nâng đỡ.",
    emotional_hook: "陪你左右 (Péi nǐ zuǒyòu) — ở bên trái phải bạn. Lời hứa đơn giản nhưng nặng nghĩa nhất trong tiếng Trung. Không hứa 'yêu mãi mãi' mà hứa 'ở bên cạnh'.",
    example_sentences: [
      { zh: "我陪你左右", pinyin: "Wǒ péi nǐ zuǒyòu", vi: "Tôi ở bên bạn, cả trái lẫn phải" },
      { zh: "陪伴左右", pinyin: "Péibàn zuǒyòu", vi: "Đồng hành, luôn kề bên" },
      { zh: "我会陪你度过", pinyin: "Wǒ huì péi nǐ dùguò", vi: "Tôi sẽ ở bên cùng bạn vượt qua" },
    ],
    related: ["同", "共", "伴", "和"],
  },
  美: {
    hanzi: "美", pinyin: "měi", tone: 3, meaning: ["vẻ đẹp", "đẹp", "ngon", "tuyệt vời"],
    radical: "羊", stroke_count: 9, hsk_level: 2,
    origin_story: "美 gồm 羊 (cừu) và 大 (lớn). Con cừu to lớn — người xưa trông cừu mập mạp là đẹp, là no đủ, là tại lộc.",
    visual_mnemonic: "Cừợ (羊) đội mũ lớn (大) — thuần khiết, hồn nhiên. Vẻ đẹp thật sự là như vậy.",
    emotional_hook: "内心美 (nèixīnměi) — 'đẹp từ bên trong' — là lời khen cao quý nhất trong văn hóa Trung Hoa. Đẹp ngoại hình là 好, đẹp từ bên trong mới là 美.",
    example_sentences: [
      { zh: "美不在外表", pinyin: "Měi bù zài wàibiǎo", vi: "Vẻ đẹp không nằm ở ngoại hình" },
      { zh: "内心美", pinyin: "Nèixīnměi", vi: "Đẹp từ bên trong" },
      { zh: "美好的事永远要发生", pinyin: "Měi hǎo de shì yǒngyuǎn yào fāshēng", vi: "Những điều đẹp sẽ luôn xảy ra" },
    ],
    related: ["好", "丽", "心", "羊"],
  },

  懂: {
    hanzi: "懂", pinyin: "dǒng", tone: 3, meaning: ["hiểu", "thấu hiểu", "hiểu rõ"],
    radical: "忄", stroke_count: 15, hsk_level: 3,
    origin_story: "懂 gồm 忄 (tim) bên trái và 董 (chỉ huy, coi sóc) bên phải. Thật sự hiểu một điều là khi trái tim nắm bắt và coi sóc được nó — không chỉ biết bằng lý trí.",
    visual_mnemonic: "Trái tim (忄) đặt cạnh người trông coi (董) — hiểu là dùng cả con tim để nhìn thấu một người.",
    emotional_hook: "懂 khác với 知道 (chỉ biết). '我懂你' (wǒ dǒng nǐ) — 'mình hiểu bạn' — là một trong những câu ấm áp nhất tiếng Trung: được hiểu chính là hạnh phúc.",
    example_sentences: [
      { zh: "我懂你", pinyin: "Wǒ dǒng nǐ", vi: "Mình hiểu bạn" },
      { zh: "你懂我的意思吗？", pinyin: "Nǐ dǒng wǒ de yìsi ma?", vi: "Bạn hiểu ý mình không?" },
      { zh: "懂得感恩", pinyin: "Dǒngdé gǎn'ēn", vi: "Biết trân trọng và biết ơn" },
    ],
    related: ["知", "明", "心", "情"],
  },

};

const TONE_COLORS: Record<number, string> = {
  1: "#7AB8D4", // flat — blue
  2: "#8FAF8F", // rising — green
  3: "#D4AF37", // dip — gold
  4: "#E8504A", // falling — red
};

const TONE_NAME: Record<number, string> = {
  1: "Thanh bằng (—)",
  2: "Thanh sắc (/)",
  3: "Thanh hỏi (∨)",
  4: "Thanh nặng (\\)",
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CharacterPage() {
  const params = useParams();
  const router = useRouter();
  const { awardXP } = useProgress();
  const [mastery, setMastery] = useState(2); // 0-5
  const [showOrigin, setShowOrigin] = useState(false);

  // Award XP khi user mở trang chi tiết chữ (1 lần mỗi visit)
  useEffect(() => { awardXP(5, "Kham pha chu Han"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Phồn thể → Giản thể mapping (traditional → simplified)
  const TRAD_TO_SIMP: Record<string, string> = {
    "愛": "爱", "心": "心", "緣": "缘", "靜": "静", "夢": "梦",
    "情": "情", "思": "思", "忍": "忍", "勇": "勇", "福": "福",
    "淚": "泪", "笑": "笑", "念": "念", "悟": "悟", "惜": "惜",
    "暖": "暖", "望": "望", "盼": "盼", "歸": "归", "別": "别",
    "痛": "痛", "散": "散", "孤": "孤", "哭": "哭", "寂": "寂",
    "真": "真", "陪": "陪", "美": "美",
  };
  const rawKey = decodeURIComponent(params.hanzi as string);
  const hanziKey = TRAD_TO_SIMP[rawKey] ?? rawKey;
  const data = HANZI_DATA[hanziKey];

  if (!data) {
    // Fallback: tra kho từ HSK chung (lib/hsk-data) trước khi báo "chưa có dữ liệu"
    const hskHit = findHskWord(hanziKey) ?? findHskWord(rawKey);
    if (hskHit) {
      return <HskWordLite hit={hskHit} onBack={() => router.back()} />;
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <p className="font-semibold mb-2">Chưa có dữ liệu cho chữ này</p>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Chúng mình đang cập nhật thêm dữ liệu cho chữ <strong className="font-chinese text-mm-gold">{hanziKey}</strong>
        </p>
        <button onClick={() => router.back()} className="btn-primary">
          Quay lại
        </button>
      </div>
    );
  }

  const toneColor = TONE_COLORS[data.tone] ?? "#8A8078";

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Quay lại
      </button>

      {/* Hero: Hanzi + info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-6 items-start mb-8"
      >
        <HanziWriterDisplay hanzi={data.hanzi} toneColor={toneColor} size={128} />

        <div className="flex-1">
          {/* Pinyin + tone */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-2xl font-bold tracking-wider"
              style={{ color: toneColor }}
            >
              {data.pinyin}
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${toneColor}20`, color: toneColor }}
            >
              {TONE_NAME[data.tone]}
            </span>
          </div>

          {/* Meanings */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {data.meaning.map((m) => (
              <span key={m} className="text-xs px-2.5 py-1 bg-surface2 rounded-full text-[#F5F0EB]">
                {m}
              </span>
            ))}
          </div>

          {/* HSK + strokes */}
          <div className="flex gap-2 text-[10px] text-[var(--text-muted)]">
            <span>HSK {data.hsk_level}</span>
            <span>·</span>
            <span>Bộ thủ: {data.radical}</span>
            <span>·</span>
            <span>{data.stroke_count} nét</span>
          </div>
        </div>
      </motion.div>

      {/* Mastery indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
            Mức độ thuộc
          </p>
          <p className="text-xs text-mm-gold font-semibold">{mastery}/5</p>
        </div>
        <div className="flex gap-1.5 mb-3">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => {
                setMastery(level);
                toast(level === 5 ? "🏆 Thuộc hoàn toàn! +30 XP" : `✨ Level ${level}/5 · Tiếp tục luyện!`);
              }}
              className={cn(
                "flex-1 h-2 rounded-full transition-all duration-300",
                level <= mastery ? "bg-mm-gold" : "bg-surface2"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          {mastery <= 1 && "Mới gặp — cần học thêm"}
          {mastery === 2 && "Nhận ra khi thấy — học thêm vài lần nữa"}
          {mastery === 3 && "Nhớ nghĩa — cần luyện thêm pinyin"}
          {mastery === 4 && "Gần thuộc — ôn lại một lần nữa"}
          {mastery === 5 && "🏆 Thuộc hoàn toàn — xuất sắc!"}
        </p>
      </motion.div>

      {/* Content sections */}
      <div className="space-y-4">
        {/* Visual mnemonic */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={15} className="text-mm-gold" />
            <p className="text-xs text-mm-gold uppercase tracking-widest font-semibold">
              🧠 Mẹo nhớ hình ảnh
            </p>
          </div>
          <p className="text-sm text-[#F5F0EB] leading-relaxed font-light">
            {data.visual_mnemonic}
          </p>
        </motion.div>

        {/* Emotional hook */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card border-[rgba(232,80,74,0.15)]"
          style={{ background: "rgba(232,80,74,0.03)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">❤️</span>
            <p className="text-xs text-mm-rose uppercase tracking-widest font-semibold">
              Kết nối cảm xúc
            </p>
          </div>
          <p className="text-sm text-[#F5F0EB] leading-relaxed font-light">
            {data.emotional_hook}
          </p>
        </motion.div>

        {/* Origin story — collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card"
        >
          <button
            onClick={() => setShowOrigin(!showOrigin)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={15} className="text-[#7AB8D4]" />
              <p className="text-xs text-[#7AB8D4] uppercase tracking-widest font-semibold">
                Nguồn gốc chữ
              </p>
            </div>
            <span className={cn("text-[var(--text-muted)] text-xs transition-transform", showOrigin && "rotate-180")}>▼</span>
          </button>

          {showOrigin && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-[#F5F0EB] leading-relaxed font-light mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]"
            >
              {data.origin_story}
            </motion.p>
          )}
        </motion.div>

        {/* Example sentences */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
            💬 Ví dụ câu ({data.example_sentences.length})
          </p>
          <div className="space-y-3">
            {data.example_sentences.map((ex, i) => (
              <div
                key={i}
                className="cursor-pointer group"
                onClick={() => {
                  void playTTS(ex.zh);
                }}
              >
                <p className="font-chinese text-lg font-bold group-hover:text-mm-gold transition-colors">
                  {ex.zh}
                </p>
                <p className="text-xs text-mm-gold/60 mb-0.5">{ex.pinyin}</p>
                <p className="text-xs text-[var(--text-muted)] italic">{ex.vi}</p>
                {i < data.example_sentences.length - 1 && (
                  <div className="w-full h-px bg-[rgba(255,255,255,0.05)] mt-3" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Related characters */}
        {data.related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card"
          >
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
              🔗 Chữ liên quan
            </p>
            <div className="flex gap-2 flex-wrap">
              {data.related.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    const char = r.charAt(0);
                    if (HANZI_DATA[char]) {
                      router.push(`/character/${encodeURIComponent(char)}`);
                    } else if (findHskWord(r) || findHskWord(char)) {
                      // Có trong kho HSK → trang fallback lite vẫn hữu ích
                      router.push(`/character/${encodeURIComponent(findHskWord(r) ? r : char)}`);
                    } else {
                      toast(`Chữ "${r}" sẽ có sớm!`);
                    }
                  }}
                  className="font-chinese text-lg px-3 py-2 bg-surface2 rounded-xl hover:bg-[rgba(212,175,55,0.1)] hover:text-mm-gold transition-all"
                >
                  {r}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mark as learned */}
        <motion.button
          onClick={() => {
            setMastery(Math.min(5, mastery + 1));
            toast(mastery >= 4 ? "🏆 Thuộc rồi! +30 XP" : "✅ Đã ôn lại · +10 XP");
          }}
          whileTap={{ scale: 0.97 }}
          className="w-full btn-primary py-4 flex items-center justify-center gap-2"
        >
          <Star size={16} fill="currentColor" />
          Đánh dấu đã học · +10 XP
        </motion.button>
      </div>

      <div className="h-8" />
    </div>
  );
}

// ─── Fallback lite: từ HSK chưa có trang chi tiết ─────────────────────────────
function HskWordLite({
  hit,
  onBack,
}: {
  hit: { word: HSKWord; level: number };
  onBack: () => void;
}) {
  const { word, level } = hit;
  const [saved, setSaved] = useState(false);
  const isSingleChar = [...word.hanzi].length === 1;

  useEffect(() => {
    setSaved(isWordSaved(word.hanzi));
  }, [word.hanzi]);

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Quay lại
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-6 items-start mb-6">
        {isSingleChar ? (
          <HanziWriterDisplay hanzi={word.hanzi} toneColor="#E8A838" size={128} />
        ) : (
          <button
            onClick={() => playTTS(word.hanzi)}
            aria-label={`Nghe phát âm ${word.hanzi}`}
            lang="zh-CN"
            className="font-chinese text-6xl leading-none py-4 px-2 text-mm-gold hover:opacity-80 transition-opacity"
          >
            {word.hanzi}
          </button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold tracking-wider text-mm-gold">{word.pinyin}</span>
            <button
              onClick={() => playTTS(word.hanzi)}
              aria-label="Nghe phát âm"
              className="text-lg hover:scale-110 transition-transform"
            >
              🔊
            </button>
          </div>
          {word.hanViet && (
            <p className="text-sm text-mm-gold/80 mb-1">Hán Việt: {word.hanViet}</p>
          )}
          <p className="text-lg">{word.meaning}</p>
          <span className="inline-block mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface2 text-[var(--text-muted)]">
            HSK {level}
          </span>
        </div>
      </motion.div>

      {word.example && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-4"
        >
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
            <BookOpen size={12} className="inline mr-1" /> Ví dụ
          </p>
          <button
            onClick={() => playTTS(word.example!)}
            lang="zh-CN"
            className="font-chinese text-lg text-left hover:text-mm-gold transition-colors"
            aria-label="Nghe câu ví dụ"
          >
            {word.example} 🔊
          </button>
        </motion.div>
      )}

      <div className="flex gap-2">
        <button
          onClick={async () => {
            const r = await saveWord({ hanzi: word.hanzi, pinyin: word.pinyin, meaning: word.meaning, example: word.example });
            setSaved(true);
            toast(r === "added" ? "🔖 Đã lưu vào sổ tay từ!" : "Từ này đã có trong sổ tay");
          }}
          className={cn("flex-1 py-3 rounded-2xl font-semibold transition-all", saved ? "bg-surface2 text-mm-gold" : "btn-primary")}
        >
          {saved ? "✓ Đã lưu vào sổ tay" : "🔖 Lưu vào sổ tay từ"}
        </button>
        <Link
          href="/hsk"
          className="px-4 py-3 rounded-2xl bg-surface2 text-sm font-semibold flex items-center hover:text-mm-gold transition-colors"
        >
          Học HSK {level} →
        </Link>
      </div>

      <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
        Trang chi tiết (chiết tự, nguồn gốc, câu chuyện) cho từ này sẽ có sớm.
      </p>
    </div>
  );
}
