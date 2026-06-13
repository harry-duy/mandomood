"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playTTS } from "@/hooks/useTTS";
import { Volume2, BookOpen, ChevronLeft, ChevronRight, Eye, EyeOff, BookmarkPlus, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn, readJSON, writeJSON } from "@/lib/utils";
import { getCustomPassages, removeCustomPassage } from "@/lib/readingLibrary";
import { saveWord, isWordSaved } from "@/lib/savedWords";
import { useProgress } from "@/hooks/useProgress";

const READING_INDEX_KEY = "mm_reading_index";
import { StoryKaraoke } from "@/components/ui/StoryKaraoke";

/* ─── Reading passages ─── */
interface Word { hanzi: string; pinyin: string; meaning: string }
interface Passage {
  id: string; title: string; titleVi: string;
  level: string; mood: string; moodColor: string;
  words: Word[];
  translation: string;
  culturalNote: string;
  custom?: boolean;
}

const PASSAGES: Passage[] = [
  {
    id: "p1", title: "春天来了", titleVi: "Mùa xuân đến rồi",
    level: "HSK 1", mood: "Healing", moodColor: "#8FAF8F",
    words: [
      { hanzi: "春天", pinyin: "chūntiān", meaning: "Mùa xuân" },
      { hanzi: "来了", pinyin: "lái le", meaning: "Đến rồi" },
      { hanzi: "花", pinyin: "huā", meaning: "Hoa" },
      { hanzi: "开了", pinyin: "kāi le", meaning: "Nở rồi" },
      { hanzi: "鸟", pinyin: "niǎo", meaning: "Chim" },
      { hanzi: "唱歌", pinyin: "chànggē", meaning: "Ca hát" },
      { hanzi: "孩子们", pinyin: "háizimen", meaning: "Các em nhỏ" },
      { hanzi: "在", pinyin: "zài", meaning: "Ở / đang" },
      { hanzi: "公园", pinyin: "gōngyuán", meaning: "Công viên" },
      { hanzi: "里", pinyin: "lǐ", meaning: "Trong" },
      { hanzi: "玩", pinyin: "wán", meaning: "Chơi" },
      { hanzi: "很", pinyin: "hěn", meaning: "Rất" },
      { hanzi: "开心", pinyin: "kāixīn", meaning: "Vui vẻ" },
    ],
    translation: "Mùa xuân đến rồi. Hoa nở rồi. Chim ca hát. Các em nhỏ chơi trong công viên, rất vui vẻ.",
    culturalNote: "Mùa xuân (春天) là mùa quan trọng nhất trong văn hóa Trung Hoa — biểu tượng của sự tái sinh, hy vọng và bắt đầu mới. Tết Nguyên Đán cũng gọi là 春节 (Chūnjié - Lễ hội mùa xuân).",
  },
  {
    id: "p2", title: "一杯咖啡的故事", titleVi: "Câu chuyện một tách cà phê",
    level: "HSK 2", mood: "Aesthetic", moodColor: "#D4AF37",
    words: [
      { hanzi: "每天", pinyin: "měitiān", meaning: "Mỗi ngày" },
      { hanzi: "早上", pinyin: "zǎoshang", meaning: "Buổi sáng" },
      { hanzi: "她", pinyin: "tā", meaning: "Cô ấy" },
      { hanzi: "都", pinyin: "dōu", meaning: "Đều / luôn" },
      { hanzi: "喝", pinyin: "hē", meaning: "Uống" },
      { hanzi: "一杯", pinyin: "yī bēi", meaning: "Một tách / ly" },
      { hanzi: "咖啡", pinyin: "kāfēi", meaning: "Cà phê" },
      { hanzi: "坐在", pinyin: "zuò zài", meaning: "Ngồi ở" },
      { hanzi: "窗边", pinyin: "chuāngbiān", meaning: "Cạnh cửa sổ" },
      { hanzi: "看着", pinyin: "kànzhe", meaning: "Nhìn (liên tục)" },
      { hanzi: "外面", pinyin: "wàimiàn", meaning: "Bên ngoài" },
      { hanzi: "世界", pinyin: "shìjiè", meaning: "Thế giới" },
      { hanzi: "感觉", pinyin: "gǎnjué", meaning: "Cảm thấy" },
      { hanzi: "平静", pinyin: "píngjìng", meaning: "Bình yên" },
    ],
    translation: "Mỗi buổi sáng, cô ấy đều uống một tách cà phê, ngồi cạnh cửa sổ nhìn ra thế giới bên ngoài, cảm thấy bình yên.",
    culturalNote: "Văn hóa cà phê đang ngày càng phổ biến ở Trung Quốc, đặc biệt trong giới trẻ thành thị. Các quán cà phê kiểu Thượng Hải (上海) nổi tiếng với thiết kế đẹp và không khí chậm rãi.",
  },
  {
    id: "p3", title: "思念", titleVi: "Nhớ nhung",
    level: "HSK 3", mood: "Romantic", moodColor: "#E8634A",
    words: [
      { hanzi: "有些", pinyin: "yǒuxiē", meaning: "Có một chút" },
      { hanzi: "想念", pinyin: "xiǎngniàn", meaning: "Nhớ nhung" },
      { hanzi: "说不清楚", pinyin: "shuō bù qīngchǔ", meaning: "Không nói rõ được" },
      { hanzi: "是", pinyin: "shì", meaning: "Là" },
      { hanzi: "什么", pinyin: "shénme", meaning: "Cái gì" },
      { hanzi: "感觉", pinyin: "gǎnjué", meaning: "Cảm giác" },
      { hanzi: "只是", pinyin: "zhǐshì", meaning: "Chỉ là" },
      { hanzi: "某个", pinyin: "mǒu gè", meaning: "Một (nào đó)" },
      { hanzi: "瞬间", pinyin: "shùnjiān", meaning: "Khoảnh khắc" },
      { hanzi: "突然", pinyin: "tūrán", meaning: "Đột nhiên" },
      { hanzi: "想起了", pinyin: "xiǎng qǐ le", meaning: "Nhớ đến" },
      { hanzi: "你", pinyin: "nǐ", meaning: "Bạn / anh / em" },
      { hanzi: "微笑", pinyin: "wēixiào", meaning: "Nụ cười" },
    ],
    translation: "Có một chút nhớ nhung không nói rõ được là cảm giác gì. Chỉ là trong một khoảnh khắc nào đó, đột nhiên nhớ đến nụ cười của bạn.",
    culturalNote: "Tư tưởng về nỗi nhớ (思念 sīniàn / 想念 xiǎngniàn) rất phổ biến trong thơ ca Trung Hoa. Người Trung Quốc thường dùng những câu văn ngắn gọn, súc tích để diễn đạt cảm xúc sâu sắc nhất.",
  },
  {
    id: "p4", title: "努力的意义", titleVi: "Ý nghĩa của nỗ lực",
    level: "HSK 4", mood: "Motivation", moodColor: "#7AB8D4",
    words: [
      { hanzi: "人生", pinyin: "rénshēng", meaning: "Cuộc đời / nhân sinh" },
      { hanzi: "没有", pinyin: "méiyǒu", meaning: "Không có" },
      { hanzi: "捷径", pinyin: "jiéjìng", meaning: "Con đường tắt" },
      { hanzi: "所有", pinyin: "suǒyǒu", meaning: "Tất cả" },
      { hanzi: "的", pinyin: "de", meaning: "(trợ từ)" },
      { hanzi: "成功", pinyin: "chénggōng", meaning: "Thành công" },
      { hanzi: "背后", pinyin: "bèihòu", meaning: "Phía sau" },
      { hanzi: "都是", pinyin: "dōu shì", meaning: "Đều là" },
      { hanzi: "无数", pinyin: "wúshù", meaning: "Vô số" },
      { hanzi: "个", pinyin: "gè", meaning: "(lượng từ)" },
      { hanzi: "深夜", pinyin: "shēnyè", meaning: "Đêm khuya" },
      { hanzi: "努力", pinyin: "nǔlì", meaning: "Nỗ lực / cố gắng" },
      { hanzi: "的", pinyin: "de", meaning: "(trợ từ)" },
      { hanzi: "自己", pinyin: "zìjǐ", meaning: "Bản thân mình" },
    ],
    translation: "Cuộc đời không có con đường tắt. Đằng sau tất cả những thành công đều là vô số đêm khuya của bản thân đã nỗ lực.",
    culturalNote: "Tinh thần 吃苦 (chīkǔ - chịu khổ) rất được trân trọng trong văn hóa Trung Hoa. Người ta tin rằng sự gian nan giúp xây dựng nhân cách và là nền tảng của mọi thành tựu lớn.",
  },
  {
    id: "p5", title: "缘分", titleVi: "Duyên phận",
    level: "HSK 5", mood: "Romantic", moodColor: "#C9878A",
    words: [
      { hanzi: "世界", pinyin: "shìjiè", meaning: "Thế giới" },
      { hanzi: "那么", pinyin: "nàme", meaning: "Thật / như vậy" },
      { hanzi: "大", pinyin: "dà", meaning: "Rộng lớn" },
      { hanzi: "我们", pinyin: "wǒmen", meaning: "Chúng ta" },
      { hanzi: "却", pinyin: "què", meaning: "Nhưng lại / vậy mà" },
      { hanzi: "相遇", pinyin: "xiāngyù", meaning: "Gặp gỡ nhau" },
      { hanzi: "这", pinyin: "zhè", meaning: "Điều này" },
      { hanzi: "不是", pinyin: "bù shì", meaning: "Không phải" },
      { hanzi: "巧合", pinyin: "qiǎohé", meaning: "Sự trùng hợp ngẫu nhiên" },
      { hanzi: "而是", pinyin: "érshì", meaning: "Mà là" },
      { hanzi: "命中注定", pinyin: "mìng zhōng zhùdìng", meaning: "Số phận đã định" },
      { hanzi: "的", pinyin: "de", meaning: "(trợ từ)" },
      { hanzi: "缘分", pinyin: "yuánfèn", meaning: "Duyên phận" },
    ],
    translation: "Thế giới thật rộng lớn, vậy mà chúng ta lại gặp nhau. Điều này không phải sự trùng hợp ngẫu nhiên, mà là duyên phận đã được định sẵn.",
    culturalNote: "Khái niệm 缘分 (yuánfèn) là một trong những khái niệm đẹp nhất của văn hóa Trung Hoa — chỉ mối duyên kết nối con người với nhau qua nhiều kiếp, không thể giải thích bằng logic.",
  },
  {
    id: "p6", title: "夜空的星星", titleVi: "Những vì sao trên bầu trời đêm",
    level: "HSK 2", mood: "Aesthetic", moodColor: "#8A9DC9",
    words: [
      { hanzi: "晚上", pinyin: "wǎnshang", meaning: "Buổi tối" },
      { hanzi: "我", pinyin: "wǒ", meaning: "Tôi" },
      { hanzi: "喜欢", pinyin: "xǐhuan", meaning: "Thích" },
      { hanzi: "看", pinyin: "kàn", meaning: "Nhìn / xem" },
      { hanzi: "天上", pinyin: "tiānshàng", meaning: "Trên trời" },
      { hanzi: "的", pinyin: "de", meaning: "(trợ từ)" },
      { hanzi: "星星", pinyin: "xīngxing", meaning: "Ngôi sao" },
      { hanzi: "它们", pinyin: "tāmen", meaning: "Chúng (đồ vật)" },
      { hanzi: "很", pinyin: "hěn", meaning: "Rất" },
      { hanzi: "亮", pinyin: "liàng", meaning: "Sáng" },
      { hanzi: "也", pinyin: "yě", meaning: "Cũng" },
      { hanzi: "很", pinyin: "hěn", meaning: "Rất" },
      { hanzi: "安静", pinyin: "ānjìng", meaning: "Yên tĩnh" },
    ],
    translation: "Buổi tối, tôi thích nhìn những ngôi sao trên trời. Chúng rất sáng, cũng rất yên tĩnh.",
    culturalNote: "Người Trung Hoa xưa đặt tên các chòm sao và gắn chúng với truyền thuyết, như chuyện Ngưu Lang – Chức Nữ (牛郎织女) gặp nhau trên cầu Ô Thước mỗi năm một lần vào ngày Thất Tịch (七夕).",
  },
  {
    id: "p7", title: "妈妈的味道", titleVi: "Hương vị của mẹ",
    level: "HSK 3", mood: "Healing", moodColor: "#8FAF8F",
    words: [
      { hanzi: "无论", pinyin: "wúlùn", meaning: "Dù / bất kể" },
      { hanzi: "走到", pinyin: "zǒu dào", meaning: "Đi đến" },
      { hanzi: "哪里", pinyin: "nǎlǐ", meaning: "Nơi nào" },
      { hanzi: "我", pinyin: "wǒ", meaning: "Tôi" },
      { hanzi: "最", pinyin: "zuì", meaning: "Nhất" },
      { hanzi: "想念", pinyin: "xiǎngniàn", meaning: "Nhớ nhung" },
      { hanzi: "的", pinyin: "de", meaning: "(trợ từ)" },
      { hanzi: "还是", pinyin: "háishì", meaning: "Vẫn là" },
      { hanzi: "妈妈", pinyin: "māma", meaning: "Mẹ" },
      { hanzi: "做", pinyin: "zuò", meaning: "Làm / nấu" },
      { hanzi: "的", pinyin: "de", meaning: "(trợ từ)" },
      { hanzi: "饭", pinyin: "fàn", meaning: "Cơm" },
      { hanzi: "那", pinyin: "nà", meaning: "Đó" },
      { hanzi: "是", pinyin: "shì", meaning: "Là" },
      { hanzi: "家", pinyin: "jiā", meaning: "Nhà" },
      { hanzi: "的", pinyin: "de", meaning: "(trợ từ)" },
      { hanzi: "味道", pinyin: "wèidào", meaning: "Hương vị" },
    ],
    translation: "Dù đi đến nơi nào, thứ tôi nhớ nhất vẫn là cơm mẹ nấu. Đó là hương vị của nhà.",
    culturalNote: "Trong văn hóa Trung Hoa, bữa cơm gia đình (家常饭) tượng trưng cho tình thân và sự đoàn tụ. Câu 'hương vị của mẹ' (妈妈的味道) thường xuất hiện trong quảng cáo, phim ảnh để gợi nỗi nhớ quê hương.",
  },
  {
    id: "p8", title: "时间的礼物", titleVi: "Món quà của thời gian",
    level: "HSK 4", mood: "Motivation", moodColor: "#E8A838",
    words: [
      { hanzi: "时间", pinyin: "shíjiān", meaning: "Thời gian" },
      { hanzi: "对", pinyin: "duì", meaning: "Đối với" },
      { hanzi: "每个人", pinyin: "měi gè rén", meaning: "Mỗi người" },
      { hanzi: "都", pinyin: "dōu", meaning: "Đều" },
      { hanzi: "是", pinyin: "shì", meaning: "Là" },
      { hanzi: "公平", pinyin: "gōngpíng", meaning: "Công bằng" },
      { hanzi: "的", pinyin: "de", meaning: "(trợ từ)" },
      { hanzi: "你", pinyin: "nǐ", meaning: "Bạn" },
      { hanzi: "怎么", pinyin: "zěnme", meaning: "Như thế nào" },
      { hanzi: "使用", pinyin: "shǐyòng", meaning: "Sử dụng" },
      { hanzi: "它", pinyin: "tā", meaning: "Nó" },
      { hanzi: "就", pinyin: "jiù", meaning: "Thì / liền" },
      { hanzi: "会", pinyin: "huì", meaning: "Sẽ" },
      { hanzi: "成为", pinyin: "chéngwéi", meaning: "Trở thành" },
      { hanzi: "怎样", pinyin: "zěnyàng", meaning: "Ra sao" },
      { hanzi: "的", pinyin: "de", meaning: "(trợ từ)" },
      { hanzi: "人", pinyin: "rén", meaning: "Người" },
    ],
    translation: "Thời gian với mỗi người đều công bằng. Bạn sử dụng nó thế nào thì sẽ trở thành người như thế ấy.",
    culturalNote: "Tục ngữ 一寸光阴一寸金 (một tấc thời gian một tấc vàng) nhấn mạnh giá trị của thời gian trong tư tưởng Trung Hoa — thời gian quý như vàng nhưng vàng không mua lại được thời gian.",
  },
  {
    id: "p9", title: "下雨天", titleVi: "Ngày mưa",
    level: "HSK 2", mood: "Sad", moodColor: "#7A8E9F",
    words: [
      { hanzi: "外面", pinyin: "wàimiàn", meaning: "Bên ngoài" },
      { hanzi: "下雨", pinyin: "xiàyǔ", meaning: "Mưa" },
      { hanzi: "了", pinyin: "le", meaning: "(trợ từ chỉ thay đổi)" },
      { hanzi: "我", pinyin: "wǒ", meaning: "Tôi" },
      { hanzi: "一个人", pinyin: "yí ge rén", meaning: "Một mình" },
      { hanzi: "在", pinyin: "zài", meaning: "Đang / ở" },
      { hanzi: "家", pinyin: "jiā", meaning: "Nhà" },
      { hanzi: "喝", pinyin: "hē", meaning: "Uống" },
      { hanzi: "热茶", pinyin: "rè chá", meaning: "Trà nóng" },
      { hanzi: "听", pinyin: "tīng", meaning: "Nghe" },
      { hanzi: "雨声", pinyin: "yǔ shēng", meaning: "Tiếng mưa" },
      { hanzi: "心里", pinyin: "xīn lǐ", meaning: "Trong lòng" },
      { hanzi: "很", pinyin: "hěn", meaning: "Rất" },
      { hanzi: "安静", pinyin: "ānjìng", meaning: "Yên tĩnh" },
    ],
    translation: "Bên ngoài mưa rồi. Tôi một mình ở nhà, uống trà nóng, nghe tiếng mưa. Trong lòng rất yên tĩnh.",
    culturalNote: "Người Trung Hoa xưa xem ngày mưa là lúc lý tưởng để tĩnh tâm, đọc sách hay uống trà (品茶). Nhiều bài thơ cổ lấy mưa làm nền cho nỗi nhớ và sự suy ngẫm.",
  },
  {
    id: "p10", title: "好朋友", titleVi: "Bạn tốt",
    level: "HSK 2", mood: "Friendship", moodColor: "#7AB8D4",
    words: [
      { hanzi: "真正", pinyin: "zhēnzhèng", meaning: "Thật sự" },
      { hanzi: "的", pinyin: "de", meaning: "(trợ từ)" },
      { hanzi: "朋友", pinyin: "péngyou", meaning: "Bạn bè" },
      { hanzi: "不", pinyin: "bù", meaning: "Không" },
      { hanzi: "需要", pinyin: "xūyào", meaning: "Cần" },
      { hanzi: "每天", pinyin: "měitiān", meaning: "Mỗi ngày" },
      { hanzi: "见面", pinyin: "jiànmiàn", meaning: "Gặp mặt" },
      { hanzi: "但是", pinyin: "dànshì", meaning: "Nhưng" },
      { hanzi: "你", pinyin: "nǐ", meaning: "Bạn" },
      { hanzi: "难过", pinyin: "nánguò", meaning: "Buồn" },
      { hanzi: "的", pinyin: "de", meaning: "(trợ từ)" },
      { hanzi: "时候", pinyin: "shíhou", meaning: "Lúc / khi" },
      { hanzi: "他", pinyin: "tā", meaning: "Anh ấy" },
      { hanzi: "一定", pinyin: "yídìng", meaning: "Nhất định" },
      { hanzi: "在", pinyin: "zài", meaning: "Ở bên" },
    ],
    translation: "Bạn bè thật sự không cần ngày nào cũng gặp nhau. Nhưng khi bạn buồn, người ấy nhất định sẽ ở bên.",
    culturalNote: "Thành ngữ 患难见真情 (huànnàn jiàn zhēnqíng) — 'hoạn nạn mới thấy chân tình' — phản ánh quan niệm về tình bạn bền vững qua thử thách trong văn hóa Trung Hoa.",
  },
  {
    id: "p11", title: "月亮和家", titleVi: "Vầng trăng và mái nhà",
    level: "HSK 3", mood: "Nostalgia", moodColor: "#8A9DC9",
    words: [
      { hanzi: "今晚", pinyin: "jīnwǎn", meaning: "Tối nay" },
      { hanzi: "的", pinyin: "de", meaning: "(trợ từ)" },
      { hanzi: "月亮", pinyin: "yuèliang", meaning: "Mặt trăng" },
      { hanzi: "很", pinyin: "hěn", meaning: "Rất" },
      { hanzi: "圆", pinyin: "yuán", meaning: "Tròn" },
      { hanzi: "我", pinyin: "wǒ", meaning: "Tôi" },
      { hanzi: "想起", pinyin: "xiǎngqǐ", meaning: "Nhớ đến" },
      { hanzi: "小时候", pinyin: "xiǎoshíhou", meaning: "Hồi nhỏ" },
      { hanzi: "和", pinyin: "hé", meaning: "Cùng / và" },
      { hanzi: "家人", pinyin: "jiārén", meaning: "Người nhà" },
      { hanzi: "一起", pinyin: "yìqǐ", meaning: "Cùng nhau" },
      { hanzi: "吃", pinyin: "chī", meaning: "Ăn" },
      { hanzi: "月饼", pinyin: "yuèbǐng", meaning: "Bánh trung thu" },
      { hanzi: "无论", pinyin: "wúlùn", meaning: "Dù cho" },
      { hanzi: "走", pinyin: "zǒu", meaning: "Đi" },
      { hanzi: "多远", pinyin: "duō yuǎn", meaning: "Bao xa" },
      { hanzi: "心", pinyin: "xīn", meaning: "Trái tim" },
      { hanzi: "一直", pinyin: "yìzhí", meaning: "Luôn luôn" },
      { hanzi: "在", pinyin: "zài", meaning: "Ở" },
      { hanzi: "家", pinyin: "jiā", meaning: "Nhà" },
    ],
    translation: "Vầng trăng tối nay rất tròn. Tôi nhớ đến hồi nhỏ cùng gia đình ăn bánh trung thu. Dù đi xa đến đâu, trái tim vẫn luôn ở nhà.",
    culturalNote: "Trăng tròn (圆月) trong văn hóa Trung Hoa tượng trưng cho đoàn viên (团圆). Tết Trung Thu 中秋节 là dịp cả nhà quây quần — câu 月是故乡明 'trăng quê nhà sáng nhất' của Đỗ Phủ nói hộ nỗi nhớ nhà của người xa quê.",
  },
  {
    id: "p12", title: "学骑自行车", titleVi: "Học đi xe đạp",
    level: "HSK 3", mood: "Motivation", moodColor: "#E8A838",
    words: [
      { hanzi: "我", pinyin: "wǒ", meaning: "Tôi" },
      { hanzi: "第一次", pinyin: "dì yī cì", meaning: "Lần đầu tiên" },
      { hanzi: "学", pinyin: "xué", meaning: "Học" },
      { hanzi: "骑", pinyin: "qí", meaning: "Cưỡi / đạp (xe)" },
      { hanzi: "自行车", pinyin: "zìxíngchē", meaning: "Xe đạp" },
      { hanzi: "的时候", pinyin: "de shíhou", meaning: "Khi / lúc" },
      { hanzi: "摔倒", pinyin: "shuāidǎo", meaning: "Ngã" },
      { hanzi: "了", pinyin: "le", meaning: "(trợ từ hoàn thành)" },
      { hanzi: "很多次", pinyin: "hěn duō cì", meaning: "Rất nhiều lần" },
      { hanzi: "爸爸", pinyin: "bàba", meaning: "Bố" },
      { hanzi: "对", pinyin: "duì", meaning: "Với / đối với" },
      { hanzi: "我", pinyin: "wǒ", meaning: "Tôi" },
      { hanzi: "说", pinyin: "shuō", meaning: "Nói" },
      { hanzi: "别怕", pinyin: "bié pà", meaning: "Đừng sợ" },
      { hanzi: "再", pinyin: "zài", meaning: "Thêm / lại" },
      { hanzi: "试", pinyin: "shì", meaning: "Thử" },
      { hanzi: "一次", pinyin: "yí cì", meaning: "Một lần" },
      { hanzi: "后来", pinyin: "hòulái", meaning: "Sau đó" },
      { hanzi: "我", pinyin: "wǒ", meaning: "Tôi" },
      { hanzi: "终于", pinyin: "zhōngyú", meaning: "Cuối cùng" },
      { hanzi: "学会", pinyin: "xuéhuì", meaning: "Học được" },
      { hanzi: "了", pinyin: "le", meaning: "(trợ từ hoàn thành)" },
    ],
    translation: "Lần đầu học đi xe đạp, tôi ngã rất nhiều lần. Bố nói với tôi: 'Đừng sợ, thử thêm lần nữa.' Sau đó, cuối cùng tôi cũng học được.",
    culturalNote: "失败是成功之母 (shībài shì chénggōng zhī mǔ) — 'thất bại là mẹ thành công' — câu cửa miệng của cha mẹ Trung Hoa khi động viên con. Cấu trúc 终于…了 diễn tả 'cuối cùng cũng…' sau quá trình cố gắng.",
  },
  {
    id: "p13", title: "一杯奶茶", titleVi: "Một ly trà sữa",
    level: "HSK 2", mood: "Friendship", moodColor: "#7AB8D4",
    words: [
      { hanzi: "下课", pinyin: "xià kè", meaning: "Tan học" },
      { hanzi: "以后", pinyin: "yǐhòu", meaning: "Sau khi" },
      { hanzi: "我", pinyin: "wǒ", meaning: "Tôi" },
      { hanzi: "和", pinyin: "hé", meaning: "Và / cùng" },
      { hanzi: "朋友", pinyin: "péngyou", meaning: "Bạn bè" },
      { hanzi: "去", pinyin: "qù", meaning: "Đi" },
      { hanzi: "买", pinyin: "mǎi", meaning: "Mua" },
      { hanzi: "奶茶", pinyin: "nǎichá", meaning: "Trà sữa" },
      { hanzi: "她", pinyin: "tā", meaning: "Cô ấy" },
      { hanzi: "请", pinyin: "qǐng", meaning: "Mời / đãi" },
      { hanzi: "我", pinyin: "wǒ", meaning: "Tôi" },
      { hanzi: "喝", pinyin: "hē", meaning: "Uống" },
      { hanzi: "一杯", pinyin: "yì bēi", meaning: "Một ly" },
      { hanzi: "小事", pinyin: "xiǎo shì", meaning: "Chuyện nhỏ" },
      { hanzi: "也", pinyin: "yě", meaning: "Cũng" },
      { hanzi: "让", pinyin: "ràng", meaning: "Khiến" },
      { hanzi: "人", pinyin: "rén", meaning: "Người" },
      { hanzi: "很", pinyin: "hěn", meaning: "Rất" },
      { hanzi: "温暖", pinyin: "wēnnuǎn", meaning: "Ấm áp" },
    ],
    translation: "Sau khi tan học, tôi và bạn đi mua trà sữa. Cô ấy mời tôi uống một ly. Chuyện nhỏ cũng khiến người ta thấy thật ấm áp.",
    culturalNote: "Văn hóa 请客 (qǐngkè — mời/đãi) rất quan trọng với người Trung Hoa: bạn bè thay nhau đãi, ít khi chia tiền kiểu AA như phương Tây. Trà sữa 奶茶 là 'ngôn ngữ tình bạn' của giới trẻ Trung Quốc hiện đại.",
  },
  {
    id: "p14", title: "爷爷的茶", titleVi: "Trà của ông nội",
    level: "HSK 3", mood: "Nostalgia", moodColor: "#8A9DC9",
    words: [
      { hanzi: "爷爷", pinyin: "yéye", meaning: "Ông nội" },
      { hanzi: "每天", pinyin: "měitiān", meaning: "Mỗi ngày" },
      { hanzi: "早上", pinyin: "zǎoshang", meaning: "Buổi sáng" },
      { hanzi: "都", pinyin: "dōu", meaning: "Đều" },
      { hanzi: "泡", pinyin: "pào", meaning: "Pha (trà)" },
      { hanzi: "一壶", pinyin: "yì hú", meaning: "Một ấm" },
      { hanzi: "茶", pinyin: "chá", meaning: "Trà" },
      { hanzi: "他", pinyin: "tā", meaning: "Ông ấy" },
      { hanzi: "说", pinyin: "shuō", meaning: "Nói" },
      { hanzi: "喝茶", pinyin: "hē chá", meaning: "Uống trà" },
      { hanzi: "要", pinyin: "yào", meaning: "Cần / phải" },
      { hanzi: "慢慢", pinyin: "màn man", meaning: "Chậm rãi" },
      { hanzi: "生活", pinyin: "shēnghuó", meaning: "Cuộc sống" },
      { hanzi: "也", pinyin: "yě", meaning: "Cũng" },
      { hanzi: "一样", pinyin: "yíyàng", meaning: "Như vậy / giống nhau" },
      { hanzi: "现在", pinyin: "xiànzài", meaning: "Bây giờ" },
      { hanzi: "我", pinyin: "wǒ", meaning: "Tôi" },
      { hanzi: "终于", pinyin: "zhōngyú", meaning: "Cuối cùng" },
      { hanzi: "懂了", pinyin: "dǒng le", meaning: "Hiểu rồi" },
    ],
    translation: "Ông nội mỗi sáng đều pha một ấm trà. Ông nói: uống trà phải chậm rãi, cuộc sống cũng vậy. Bây giờ tôi cuối cùng đã hiểu.",
    culturalNote: "Trà đạo Trung Hoa (茶道) coi việc pha trà chậm rãi là cách tu tâm. Câu 慢慢来 (màn man lái — từ từ thôi) vừa là lời khuyên uống trà, vừa là triết lý sống được truyền qua các thế hệ.",
  },
  {
    id: "p15", title: "第一次面试", titleVi: "Lần phỏng vấn đầu tiên",
    level: "HSK 4", mood: "Motivation", moodColor: "#E8A838",
    words: [
      { hanzi: "面试", pinyin: "miànshì", meaning: "Phỏng vấn" },
      { hanzi: "之前", pinyin: "zhīqián", meaning: "Trước khi" },
      { hanzi: "紧张", pinyin: "jǐnzhāng", meaning: "Căng thẳng" },
      { hanzi: "经历", pinyin: "jīnglì", meaning: "Trải nghiệm" },
      { hanzi: "目标", pinyin: "mùbiāo", meaning: "Mục tiêu" },
      { hanzi: "能力", pinyin: "nénglì", meaning: "Năng lực" },
      { hanzi: "态度", pinyin: "tàidu", meaning: "Thái độ" },
      { hanzi: "决定", pinyin: "juédìng", meaning: "Quyết định" },
      { hanzi: "结果", pinyin: "jiéguǒ", meaning: "Kết quả" },
      { hanzi: "失败", pinyin: "shībài", meaning: "Thất bại" },
      { hanzi: "经验", pinyin: "jīngyàn", meaning: "Kinh nghiệm" },
      { hanzi: "后悔", pinyin: "hòuhuǐ", meaning: "Hối hận" },
      { hanzi: "勇气", pinyin: "yǒngqì", meaning: "Dũng khí" },
    ],
    translation: "Trước buổi phỏng vấn đầu tiên, tôi rất căng thẳng. Tôi không có nhiều trải nghiệm, nhưng tôi có mục tiêu rõ ràng. Người phỏng vấn nói: năng lực có thể học, thái độ mới là điều quyết định. Kết quả lần đó tôi thất bại, nhưng tôi không hối hận — vì tôi đã có kinh nghiệm, và quan trọng nhất là có dũng khí bắt đầu.",
    culturalNote: "Giới trẻ Trung Quốc gọi áp lực xin việc là 内卷 (nèijuǎn — cuộn vào trong, cạnh tranh khốc liệt). Câu an ủi phổ biến: 尽人事，听天命 — tận nhân lực, tri thiên mệnh.",
  },
  {
    id: "p16", title: "情绪的天气", titleVi: "Thời tiết của cảm xúc",
    level: "HSK 5", mood: "Healing", moodColor: "#8FAF8F",
    words: [
      { hanzi: "情绪", pinyin: "qíngxù", meaning: "Cảm xúc" },
      { hanzi: "天气", pinyin: "tiānqì", meaning: "Thời tiết" },
      { hanzi: "心理", pinyin: "xīnlǐ", meaning: "Tâm lý" },
      { hanzi: "现象", pinyin: "xiànxiàng", meaning: "Hiện tượng" },
      { hanzi: "压力", pinyin: "yālì", meaning: "Áp lực" },
      { hanzi: "接受", pinyin: "jiēshòu", meaning: "Chấp nhận" },
      { hanzi: "关键", pinyin: "guānjiàn", meaning: "Then chốt" },
      { hanzi: "调整", pinyin: "tiáozhěng", meaning: "Điều chỉnh" },
      { hanzi: "角度", pinyin: "jiǎodù", meaning: "Góc nhìn" },
      { hanzi: "宽容", pinyin: "kuānróng", meaning: "Khoan dung" },
      { hanzi: "信任", pinyin: "xìnrèn", meaning: "Tin tưởng" },
      { hanzi: "气氛", pinyin: "qìfēn", meaning: "Bầu không khí" },
      { hanzi: "灵感", pinyin: "línggǎn", meaning: "Cảm hứng" },
    ],
    translation: "Cảm xúc giống như thời tiết — có ngày nắng, có ngày mưa, đó là hiện tượng tâm lý bình thường. Khi áp lực đến, điều then chốt không phải là chống lại nó, mà là chấp nhận, rồi điều chỉnh góc nhìn. Hãy khoan dung với chính mình như tin tưởng một người bạn. Bầu không khí trong lòng dịu xuống, cảm hứng tự nhiên sẽ quay về.",
    culturalNote: "Tiếng Trung hiện đại mượn emo (từ tiếng Anh) làm động từ: 我emo了 = mình đang tụt mood. Cách nói trẻ trung này xuất hiện khắp Weibo/Douyin — học nó là hiểu thêm văn hóa mạng Trung Quốc.",
  },
];

export default function ReadingPage() {
  const { awardXP } = useProgress();
  const [index, setIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [hoveredWord, setHoveredWord] = useState<Word | null>(null);
  const [showCultural, setShowCultural] = useState(false);
  const [karaoke, setKaraoke] = useState(false);

  const [customPassages, setCustomPassages] = useState<Passage[]>([]);
  const [savedWordKey, setSavedWordKey] = useState<string | null>(null);

  // Gộp truyện AI đã lưu (đầu danh sách) với các đoạn tích hợp.
  useEffect(() => {
    setCustomPassages(getCustomPassages() as Passage[]);
  }, []);

  const passages = useMemo(() => [...customPassages, ...PASSAGES], [customPassages]);
  const passage = passages[index] ?? PASSAGES[0];

  // Khôi phục vị trí đọc dở lần trước (chỉ chạy 1 lần khi mở trang).
  useEffect(() => {
    const saved = readJSON<number>(READING_INDEX_KEY, 0);
    if (Number.isInteger(saved) && saved > 0 && saved < PASSAGES.length) {
      setIndex(saved);
    }
  }, []);

  // Lưu vị trí đọc mỗi khi đổi đoạn.
  useEffect(() => {
    writeJSON(READING_INDEX_KEY, index);
  }, [index]);

  const goNext = () => {
    // Award XP khi chuyển sang đoạn tiếp theo — phần thưởng đọc xong 1 bài
    awardXP(15, "Doc truyen");
    setIndex(i => Math.min(i + 1, passages.length - 1));
    setShowTranslation(false);
    setHoveredWord(null);
    setShowCultural(false);
    setKaraoke(false);
  };
  const goPrev = () => {
    setIndex(i => Math.max(i - 1, 0));
    setShowTranslation(false);
    setHoveredWord(null);
    setShowCultural(false);
    setKaraoke(false);
  };

  return (
    <main className="min-h-screen pb-28 bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold">Đọc Hiểu</h1>
            <p className="text-xs text-[var(--text-muted)]">Nhấn vào từng từ để xem nghĩa + pinyin</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">{index + 1}/{passages.length}</span>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5 space-y-5">

        {/* Passage card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={passage.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[rgba(255,255,255,0.05)]"
          >
            {/* Top bar */}
            <div className="px-5 pt-5 pb-4 border-b border-[rgba(255,255,255,0.05)]">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <h2 className="font-display text-2xl font-bold">{passage.title}</h2>
                  <p className="text-sm text-[var(--text-muted)]">{passage.titleVi}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setKaraoke(k => !k)}
                    aria-pressed={karaoke}
                    aria-label="Chế độ karaoke: đọc và sáng từng từ"
                    className={cn(
                      "px-2.5 py-2 rounded-full transition-colors text-xs flex items-center gap-1",
                      karaoke ? "bg-mm-red/20 text-mm-red" : "bg-[rgba(255,255,255,0.06)] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.12)]"
                    )}
                  >
                    🎤 Karaoke
                  </button>
                  <button onClick={() => playTTS(passage.words.map(w => w.hanzi).join(''))}
                    aria-label="Nghe toàn đoạn"
                    className="p-2 rounded-full bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] transition-colors">
                    <Volume2 size={16} className="text-mm-red" />
                  </button>
                  {passage.custom && (
                    <button
                      onClick={() => {
                        removeCustomPassage(passage.id);
                        setCustomPassages((list) => list.filter((p) => p.id !== passage.id));
                        setIndex(0);
                        toast("🗑️ Đã xoá khỏi thư viện Đọc", { duration: 1800 });
                      }}
                      aria-label="Xoá truyện khỏi thư viện Đọc"
                      className="p-2 rounded-full bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] transition-colors">
                      <Trash2 size={16} className="text-[var(--text-muted)]" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[var(--text-muted)]">{passage.level}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${passage.moodColor}22`, color: passage.moodColor }}>
                  {passage.mood}
                </span>
              </div>
            </div>

            {/* Interactive text */}
            <div className="px-5 py-5">
              {karaoke ? (
                <StoryKaraoke
                  segments={passage.words.map(w => ({ text: w.hanzi, pinyin: w.pinyin }))}
                  showPinyin
                />
              ) : (
              <>
              <div className="flex flex-wrap gap-x-1 gap-y-3">
                {passage.words.map((word, wi) => {
                  const isHovered = hoveredWord?.hanzi === word.hanzi && hoveredWord?.pinyin === word.pinyin;
                  return (
                    <button
                      key={`${word.hanzi}-${wi}`}
                      onMouseEnter={() => setHoveredWord(word)}
                      onMouseLeave={() => setHoveredWord(null)}
                      onClick={() => { setHoveredWord(word); playTTS(word.hanzi); }}
                      className={cn(
                        "relative flex flex-col items-center px-1 py-1 rounded-xl transition-all",
                        isHovered ? "bg-mm-red/15" : "hover:bg-[rgba(255,255,255,0.06)]"
                      )}
                    >
                      {/* Pinyin above (always visible on hover) */}
                      <span className={cn(
                        "text-[10px] text-mm-red/80 transition-all duration-200 leading-none mb-0.5",
                        isHovered ? "opacity-100" : "opacity-0"
                      )}>
                        {word.pinyin}
                      </span>
                      <span lang="zh-CN" className="text-xl font-medium leading-tight">{word.hanzi}</span>
                    </button>
                  );
                })}
              </div>

              {/* Word tooltip */}
              <AnimatePresence>
                {hoveredWord && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="mt-4 flex items-center gap-3 p-3 bg-[rgba(255,255,255,0.05)] rounded-2xl"
                  >
                    <span className="text-2xl font-bold">{hoveredWord.hanzi}</span>
                    <div className="flex-1">
                      <div className="text-sm text-mm-red/90">{hoveredWord.pinyin}</div>
                      <div className="text-sm text-white/80">{hoveredWord.meaning}</div>
                    </div>
                    <button
                      onClick={async () => {
                        const w = hoveredWord;
                        const r = await saveWord({ hanzi: w.hanzi, pinyin: w.pinyin, meaning: w.meaning });
                        setSavedWordKey(w.hanzi);
                        toast(r === "added" ? "✅ Đã lưu từ vào Flashcard" : "Từ này đã có trong Flashcard", { duration: 1800 });
                      }}
                      aria-label="Lưu từ vào flashcard"
                      className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.08)]">
                      {isWordSaved(hoveredWord.hanzi) || savedWordKey === hoveredWord.hanzi
                        ? <Check size={15} className="text-mm-sage" />
                        : <BookmarkPlus size={15} className="text-mm-gold/80" />}
                    </button>
                    <button onClick={() => playTTS(hoveredWord.hanzi)}
                      className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.08)]">
                      <Volume2 size={15} className="text-mm-red/70" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              </>
              )}
            </div>

            {/* Translation toggle */}
            <div className="px-5 pb-5 space-y-3">
              <button
                onClick={() => setShowTranslation(s => !s)}
                className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-white transition-colors"
              >
                {showTranslation ? <EyeOff size={13} /> : <Eye size={13} />}
                {showTranslation ? "Ẩn dịch nghĩa" : "Xem dịch nghĩa"}
              </button>
              <AnimatePresence>
                {showTranslation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-white/80 leading-relaxed p-3 bg-[rgba(255,255,255,0.04)] rounded-xl">
                      {passage.translation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cultural note toggle */}
              <button
                onClick={() => setShowCultural(s => !s)}
                className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-mm-gold transition-colors"
              >
                <BookOpen size={13} />
                {showCultural ? "Ẩn ghi chú văn hóa" : "📚 Ghi chú văn hóa"}
              </button>
              <AnimatePresence>
                {showCultural && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-white/70 leading-relaxed p-3 bg-mm-gold/5 border border-mm-gold/15 rounded-xl">
                      {passage.culturalNote}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={goPrev}
            disabled={index === 0}
            className="flex items-center gap-2 px-5 py-3 bg-[var(--bg-card)] rounded-2xl text-sm disabled:opacity-30 hover:bg-[rgba(255,255,255,0.08)] transition-colors"
          >
            <ChevronLeft size={16} /> Trước
          </button>
          <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
            {passages.map((_, i) => (
              <button key={i} onClick={() => { setIndex(i); setShowTranslation(false); setHoveredWord(null); setShowCultural(false); }}
                className={cn("w-2 h-2 rounded-full transition-all", i === index ? "bg-mm-red w-5" : "bg-[rgba(255,255,255,0.2)]")} />
            ))}
          </div>
          <button
            onClick={goNext}
            disabled={index === passages.length - 1}
            className="flex items-center gap-2 px-5 py-3 bg-[var(--bg-card)] rounded-2xl text-sm disabled:opacity-30 hover:bg-[rgba(255,255,255,0.08)] transition-colors"
          >
            Sau <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </main>
  );
}
