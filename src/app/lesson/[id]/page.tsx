"use client";

import { useEffect, useState } from "react";
import { useTTS } from "@/hooks/useTTS";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Volume2, Eye, EyeOff,
  BookOpen, Lightbulb, Globe, CheckCircle2
} from "lucide-react";
import { VocabList } from "@/components/ui/VocabCard";
import MiniQuiz from "@/components/ui/MiniQuiz";
import PronunciationPractice from "@/components/ui/PronunciationPractice";
import XPToast, { useXPToast } from "@/components/ui/XPToast";
import { LessonDetailSkeleton } from "@/components/ui/LoadingSkeleton";
import { useAppStore } from "@/store/useAppStore";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";
import { MOOD_COLORS, MOOD_EMOJI, MOOD_LABEL, LEVEL_LABEL } from "@/lib/utils";
import { toast } from "sonner";

interface VocabItem {
  hanzi: string;
  pinyin: string;
  meaning: string;
  example?: string;
}

interface Lesson {
  _id: string;
  title: string;
  content_type: string;
  level: string;
  mood: string;
  chinese_text: string;
  pinyin: string;
  translation: string;
  vocabulary: VocabItem[];
  grammar_notes?: string;
  cultural_note?: string;
  audio_url?: string;
}

// Demo data — sẽ thay bằng API fetch sau
const DEMO_LESSONS: Record<string, Lesson> = {
  l1: {
    _id: "l1",
    title: "Cuộc gọi lúc nửa đêm",
    content_type: "story",
    mood: "romantic",
    level: "hsk2",
    chinese_text: "你睡了吗？\n我只是想听听你的声音。\n今天过得怎么样？\n还不错，就是有点想你。",
    pinyin: "Nǐ shuì le ma?\nWǒ zhǐshì xiǎng tīng tīng nǐ de shēngyīn.\nJīntiān guò de zěnmeyàng?\nHái bùcuò, jiùshì yǒudiǎn xiǎng nǐ.",
    translation:
      "Em ngủ chưa?\nAnh chỉ muốn nghe giọng em thôi.\nHôm nay của em thế nào?\nKhá ổn, chỉ là nhớ anh một chút.",
    vocabulary: [
      { hanzi: "睡", pinyin: "shuì", meaning: "ngủ", example: "你睡了吗？" },
      { hanzi: "声音", pinyin: "shēngyīn", meaning: "giọng nói, âm thanh", example: "好听的声音" },
      { hanzi: "过", pinyin: "guò", meaning: "trải qua, sống qua", example: "过得怎么样？" },
      { hanzi: "想", pinyin: "xiǎng", meaning: "nhớ, muốn, nghĩ", example: "我想你了" },
    ],
    grammar_notes:
      "• 怎么样 (zěnmeyàng) — hỏi về tình trạng/cảm nghĩ. Dùng sau động từ 过 để hỏi về trải nghiệm.\n• 就是 (jiùshì) — \"chỉ là, nhưng mà\". Dùng để thêm một điều nhỏ vào câu trước.\n• 有点 (yǒudiǎn) — \"một chút, hơi\". Dùng trước tính từ/động từ.",
    cultural_note:
      "Người Trung Quốc thường thể hiện tình cảm qua hành động và câu nói gián tiếp hơn là nói thẳng \"Anh yêu em\" (我爱你). Câu \"就是有点想你\" (chỉ là nhớ anh/em một chút) là cách nói rất đặc trưng — nhẹ nhàng nhưng chứa đựng rất nhiều cảm xúc.",
  },
  l2: {
    _id: "l2",
    title: "Buổi sáng quán cà phê",
    content_type: "dialogue",
    mood: "aesthetic",
    level: "hsk1",
    chinese_text: "来一杯咖啡，谢谢。\n好的，要加糖吗？\n不用，谢谢。多少钱？\n二十块。给你。\n谢谢，祝你有个好天气！",
    pinyin:
      "Lái yī bēi kāfēi, xièxiè.\nHǎo de, yào jiā táng ma?\nBùyòng, xièxiè. Duōshao qián?\nÈrshí kuài. Gěi nǐ.\nXièxiè, zhù nǐ yǒu gè hǎo tiānqì!",
    translation:
      "Cho một ly cà phê, cảm ơn.\nVâng, cho thêm đường không ạ?\nKhông cần, cảm ơn. Bao nhiêu tiền?\n20 tệ. Đây ạ.\nCảm ơn, chúc bạn có một ngày đẹp trời!",
    vocabulary: [
      { hanzi: "咖啡", pinyin: "kāfēi", meaning: "cà phê", example: "来一杯咖啡" },
      { hanzi: "糖", pinyin: "táng", meaning: "đường, kẹo", example: "加糖" },
      { hanzi: "多少", pinyin: "duōshao", meaning: "bao nhiêu", example: "多少钱？" },
      { hanzi: "块", pinyin: "kuài", meaning: "tệ (đơn vị tiền)", example: "二十块" },
      { hanzi: "祝", pinyin: "zhù", meaning: "chúc", example: "祝你生日快乐" },
    ],
    grammar_notes:
      "• 要...吗 — hỏi có/không về việc muốn gì đó. Ví dụ: 要加糖吗？\n• 不用 (bùyòng) — \"không cần\", lịch sự hơn 不要.\n• 给你 (gěi nǐ) — \"đây/cho bạn\", dùng khi đưa đồ vật cho ai.",
    cultural_note:
      "Văn hóa cà phê đang bùng nổ ở Trung Quốc. Luckin Coffee (瑞幸咖啡) đã vượt Starbucks ở Trung Quốc. Khi mua đồ, người Trung Quốc thường không nói 'please' giống tiếng Anh — chỉ cần thêm 谢谢 là đã rất lịch sự.",
  },
  l3: {
    _id: "l3",
    title: "Người không nên yêu",
    content_type: "story",
    mood: "sad",
    level: "hsk3",
    chinese_text: "有些人，相遇是缘分，离开是注定。\n我们在最好的时光里相遇，\n却在最坏的时机里离开。\n这就是人生。",
    pinyin:
      "Yǒu xiē rén, xiāngyù shì yuánfèn, líkāi shì zhùdìng.\nWǒmen zài zuìhǎo de shíguāng lǐ xiāngyù,\nquè zài zuìhuài de shíjī lǐ líkāi.\nZhè jiùshì rénshēng.",
    translation:
      "Có những người, gặp nhau là duyên, chia tay là số phận.\nChúng ta gặp nhau vào thời điểm đẹp nhất,\nnhưng lại chia tay vào lúc tệ nhất.\nĐó chính là cuộc đời.",
    vocabulary: [
      { hanzi: "缘分", pinyin: "yuánfèn", meaning: "duyên phận, số phận gặp gỡ", example: "这是我们的缘分" },
      { hanzi: "注定", pinyin: "zhùdìng", meaning: "định sẵn, số phận", example: "这是注定的" },
      { hanzi: "时光", pinyin: "shíguāng", meaning: "thời gian, khoảnh khắc", example: "美好的时光" },
      { hanzi: "却", pinyin: "què", meaning: "nhưng, tuy nhiên (đối lập)", example: "想去却不能去" },
    ],
    grammar_notes:
      "• 有些 (yǒu xiē) — \"có những\", dùng để nói về một phần của nhóm.\n• 却 (què) — dùng để diễn đạt sự tương phản, giống \"nhưng\" nhưng mạnh hơn, thể hiện sự ngạc nhiên.\n• 这就是 (zhè jiùshì) — \"đây chính là\", nhấn mạnh kết luận.",
    cultural_note:
      "缘分 (yuánfèn) là một trong những khái niệm đặc trưng nhất của văn hóa Trung Hoa — mối duyên tiền định giữa người với người. Không có từ nào trong tiếng Anh hoặc tiếng Việt dịch được hoàn toàn ý nghĩa này.",
  },
  l4: {
    _id: "l4", title: "Ngày mai sẽ tốt hơn", content_type: "quote", mood: "motivation", level: "hsk2",
    chinese_text: "再难的路，走着走着就习惯了。\n再苦的日子，过着过着就好了。\n加油，明天会更好。",
    pinyin: "Zài nán de lù, zǒuzhe zǒuzhe jiù xíguàn le.\nZài kǔ de rìzi, guòzhe guòzhe jiù hǎo le.\nJiāyóu, míngtiān huì gèng hǎo.",
    translation: "Con đường dù khó đến đâu, đi mãi rồi cũng quen.\nNgày tháng dù khổ đến đâu, sống mãi rồi cũng qua.\nCố lên, ngày mai sẽ tốt hơn.",
    vocabulary: [
      { hanzi: "习惯", pinyin: "xíguàn", meaning: "quen, thói quen", example: "慢慢习惯了" },
      { hanzi: "苦", pinyin: "kǔ", meaning: "khổ, đắng", example: "日子很苦" },
      { hanzi: "加油", pinyin: "jiāyóu", meaning: "cố lên! cổ vũ", example: "加油！" },
      { hanzi: "更", pinyin: "gèng", meaning: "càng, hơn nữa", example: "明天会更好" },
    ],
    grammar_notes: "• V着V着就 — làm mãi rồi sẽ (thay đổi dần dần)\n• 会更...— sẽ càng... hơn",
    cultural_note: "加油 (jiāyóu) nghĩa đen là 'đổ thêm dầu' — châm dầu vào đèn để sáng hơn. Nay là câu cổ vũ phổ biến nhất trong tiếng Trung.",
  },
  l5: {
    _id: "l5", title: "Cuộc trò chuyện với bà", content_type: "dialogue", mood: "healing", level: "hsk2",
    chinese_text: "奶奶，你年轻的时候喜欢什么？\n我喜欢看星星，听故事。\n跟现在的你一样。\n是啊，有些事不会变。",
    pinyin: "Nǎinai, nǐ niánqīng de shíhou xǐhuān shénme?\nWǒ xǐhuān kàn xīngxīng, tīng gùshi.\nGēn xiànzài de nǐ yīyàng.\nShì a, yǒu xiē shì bù huì biàn.",
    translation: "Bà ơi, hồi trẻ bà thích gì?\nBà thích nhìn sao, nghe chuyện kể.\nGiống bạn bây giờ vậy.\nÀ đúng rồi, có những thứ không thay đổi.",
    vocabulary: [
      { hanzi: "奶奶", pinyin: "nǎinai", meaning: "bà nội", example: "奶奶很温柔" },
      { hanzi: "年轻", pinyin: "niánqīng", meaning: "trẻ tuổi", example: "年轻的时候" },
      { hanzi: "星星", pinyin: "xīngxīng", meaning: "ngôi sao", example: "看星星" },
      { hanzi: "故事", pinyin: "gùshi", meaning: "câu chuyện", example: "听故事" },
    ],
    grammar_notes: "• 年轻的时候 — hồi còn trẻ\n• 跟...一样 — giống như...\n• 有些 + N + 不会变 — có những thứ không thay đổi",
    cultural_note: "奶奶 (bà nội) và 外婆 (bà ngoại) đóng vai trò quan trọng trong gia đình Trung Hoa. Quan hệ ba thế hệ là nền tảng của văn hóa gia đình Trung Quốc.",
  },
  l6: {
    _id: "l6", title: "Đêm nhìn sao trời", content_type: "poem", mood: "aesthetic", level: "hsk3",
    chinese_text: "抬头看星空，\n心里的烦恼都变小了。\n原来宇宙那么大，\n我的忧愁那么小。",
    pinyin: "Tái tóu kàn xīngkōng,\nXīn lǐ de fánnǎo dōu biàn xiǎo le.\nYuánlái yǔzhòu nàme dà,\nWǒ de yōuchóu nàme xiǎo.",
    translation: "Ngẩng đầu nhìn bầu trời sao,\nNhững phiền muộn trong lòng đều trở nên nhỏ bé.\nThì ra vũ trụ rộng lớn thế,\nNỗi buồn của tôi nhỏ bé thế thôi.",
    vocabulary: [
      { hanzi: "烦恼", pinyin: "fánnǎo", meaning: "phiền muộn, lo âu", example: "没有烦恼" },
      { hanzi: "宇宙", pinyin: "yǔzhòu", meaning: "vũ trụ", example: "宇宙很大" },
      { hanzi: "原来", pinyin: "yuánlái", meaning: "thì ra, hóa ra", example: "原来如此" },
      { hanzi: "忧愁", pinyin: "yōuchóu", meaning: "nỗi buồn, ưu sầu", example: "忘记忧愁" },
    ],
    grammar_notes: "• 原来 — thì ra là (nhận ra bất ngờ)\n• 那么 + adj — thế, như vậy (nhấn mạnh)\n• 都变...了 — đều trở nên... rồi",
    cultural_note: "Câu thơ nổi tiếng của Lý Bạch: 举头望明月，低头思故乡 — ngẩng đầu nhìn trăng, cúi đầu nhớ quê. Nhìn trời đêm để giải tỏa tâm trạng là motif xuyên suốt thơ Đường.",
  },
  l7: {
    _id: "l7", title: "Hôm nay uống trà", content_type: "dialogue", mood: "aesthetic", level: "hsk2",
    chinese_text: "今天喝茶还是咖啡？\n喝茶吧，安静一下。\n好，我来泡茶。\n谢谢你，陪我坐坐。",
    pinyin: "Jīntiān hē chá háishi kāfēi?\nHē chá ba, ānjìng yīxià.\nHǎo, wǒ lái pào chá.\nXièxiè nǐ, péi wǒ zuò zuò.",
    translation: "Hôm nay uống trà hay cà phê?\nUống trà đi, yên tĩnh một chút.\nĐược, để tôi pha trà.\nCảm ơn bạn, ngồi với tôi một lúc nhé.",
    vocabulary: [
      { hanzi: "安静", pinyin: "ānjìng", meaning: "yên tĩnh, bình yên", example: "今天很安静" },
      { hanzi: "泡茶", pinyin: "pào chá", meaning: "pha trà", example: "我来泡茶" },
      { hanzi: "陪", pinyin: "péi", meaning: "đồng hành, ở bên", example: "陪我坐坐" },
      { hanzi: "茶", pinyin: "chá", meaning: "trà", example: "喝一杯茶" },
    ],
    grammar_notes: "• A还是B — A hay B? (câu hỏi lựa chọn)\n• 来 + V — để tôi làm gì đó (tự nguyện)\n• V坐 — ngồi một lúc (V lặp = làm một chút)",
    cultural_note: "Văn hóa trà (茶文化) Trung Hoa hơn 4000 năm. 陪 không chỉ là 'ở cùng' mà là 'dành thời gian và sự chú ý cho ai đó' — một trong những từ thể hiện tình cảm sâu sắc nhất.",
  },
  l8: {
    _id: "l8", title: "Tình bạn thực sự", content_type: "story", mood: "friendship", level: "hsk2",
    chinese_text: "真正的朋友，\n不需要每天联系，\n但每次见面，\n都像从未分开过。",
    pinyin: "Zhēnzhèng de péngyǒu,\nBù xūyào měitiān liánxì,\nDàn měi cì jiànmiàn,\nDōu xiàng cóng wèi fēnkāi guò.",
    translation: "Bạn bè thực sự,\nKhông cần liên lạc mỗi ngày,\nNhưng mỗi lần gặp lại,\nVẫn như chưa từng xa cách.",
    vocabulary: [
      { hanzi: "真正", pinyin: "zhēnzhèng", meaning: "thực sự, thật sự", example: "真正的朋友" },
      { hanzi: "联系", pinyin: "liánxì", meaning: "liên lạc", example: "保持联系" },
      { hanzi: "见面", pinyin: "jiànmiàn", meaning: "gặp mặt", example: "下次见面" },
      { hanzi: "分开", pinyin: "fēnkāi", meaning: "chia cách, tách ra", example: "从未分开" },
    ],
    grammar_notes: "• 不需要 — không cần (phải)\n• 每次 + V — mỗi lần làm gì\n• 从未 + V过 — chưa bao giờ",
    cultural_note: "Tình bạn lâu năm (老朋友) được coi trọng đặc biệt. Câu tục ngữ: 一日为友，终身为友 — một ngày là bạn, cả đời là bạn.",
  },
  l9: {
    _id: "l9", title: "Tuổi thanh xuân", content_type: "poem", mood: "motivation", level: "hsk3",
    chinese_text: "青春是一本书，\n翻过去的页不能再回头。\n但每一页都算数，\n哪怕是错的那页。",
    pinyin: "Qīngchūn shì yī běn shū,\nFān guòqù de yè bùnéng zài huítóu.\nDàn měi yī yè dōu suànshù,\nNǎpà shì cuò de nà yè.",
    translation: "Tuổi trẻ là một cuốn sách,\nTrang đã lật qua không thể quay lại.\nNhưng mỗi trang đều có giá trị,\nDù là trang sai lầm.",
    vocabulary: [
      { hanzi: "青春", pinyin: "qīngchūn", meaning: "tuổi thanh xuân", example: "青春很短暂" },
      { hanzi: "翻", pinyin: "fān", meaning: "lật trang", example: "翻书" },
      { hanzi: "算数", pinyin: "suànshù", meaning: "có giá trị, tính đến", example: "每一步都算数" },
      { hanzi: "哪怕", pinyin: "nǎpà", meaning: "dù, thậm chí", example: "哪怕很难也要去" },
    ],
    grammar_notes: "• 不能再回头 — không thể quay đầu lại nữa\n• 都算数 — đều tính, đều có giá trị\n• 哪怕是...也... — dù là...cũng...",
    cultural_note: "青春 là chủ đề trung tâm của văn học trẻ Trung Quốc. Phim C-drama '致青春' (Gửi tuổi thanh xuân) đã khiến từ này trở thành biểu tượng cảm xúc của cả thế hệ.",
  },
  l10: {
    _id: "l10", title: "Mùa xuân về rồi", content_type: "story", mood: "healing", level: "hsk2",
    chinese_text: "冬天走了，春天来了。\n花开了，心情也好了。\n原来希望就像春天，\n只要等，就会来。",
    pinyin: "Dōngtiān zǒu le, chūntiān lái le.\nHuā kāi le, xīnqíng yě hǎo le.\nYuánlái xīwàng jiù xiàng chūntiān,\nZhǐyào děng, jiù huì lái.",
    translation: "Mùa đông đi rồi, mùa xuân đến rồi.\nHoa nở rồi, tâm trạng cũng tốt lên rồi.\nThì ra hy vọng giống như mùa xuân,\nChỉ cần chờ đợi, rồi sẽ đến.",
    vocabulary: [
      { hanzi: "冬天", pinyin: "dōngtiān", meaning: "mùa đông", example: "冬天很冷" },
      { hanzi: "春天", pinyin: "chūntiān", meaning: "mùa xuân", example: "春天来了" },
      { hanzi: "花开", pinyin: "huā kāi", meaning: "hoa nở", example: "花开了" },
      { hanzi: "希望", pinyin: "xīwàng", meaning: "hy vọng", example: "有希望就有未来" },
    ],
    grammar_notes: "• V了 — V rồi (hoàn thành/thay đổi trạng thái)\n• 就像 — giống như (so sánh)\n• 只要...就... — chỉ cần...là/thì...",
    cultural_note: "Mùa xuân (春天) gắn liền với Tết Nguyên Đán (春节), sự đổi mới và hy vọng. 春 là một trong những chữ được viết nhiều nhất dịp Tết Trung Hoa.",
  },
  l11: {
    _id: "l11", title: "Khoảng lặng để nghỉ ngơi", content_type: "quote", mood: "healing", level: "hsk3",
    chinese_text: "什么都不想，也是一种修行。\n让大脑放空，\n让心慢慢沉淀。\n你不需要时刻都有答案。",
    pinyin: "Shénme dōu bù xiǎng, yě shì yī zhǒng xiūxíng.\nRàng dànǎo fàngkōng,\nRàng xīn màn man chéndiàn.\nNǐ bù xūyào shíkè dōu yǒu dá'àn.",
    translation: "Không nghĩ gì cũng là một cách tu tâm.\nĐể não bộ trống rỗng,\nĐể trái tim từ từ lắng xuống.\nBạn không cần phải lúc nào cũng có câu trả lời.",
    vocabulary: [
      { hanzi: "修行", pinyin: "xiūxíng", meaning: "tu tập, rèn luyện tâm", example: "这是一种修行" },
      { hanzi: "放空", pinyin: "fàngkōng", meaning: "trống rỗng, buông bỏ suy nghĩ", example: "让大脑放空" },
      { hanzi: "沉淀", pinyin: "chéndiàn", meaning: "lắng đọng, trầm lắng", example: "心慢慢沉淀" },
      { hanzi: "时刻", pinyin: "shíkè", meaning: "mọi lúc", example: "不需要时刻准备" },
    ],
    grammar_notes: "• 什么都不 + V — không V gì cả\n• 让 + N + V — để/khiến N làm V\n• 不需要时刻都 — không cần lúc nào cũng",
    cultural_note: "放空 (fàngkōng) xuất phát từ Thiền định Phật giáo. Ngày nay Gen Z Trung Quốc dùng từ này cho trạng thái mindfulness — tắt điện thoại và cho phép bản thân nghỉ ngơi thực sự.",
  },
  l12: {
    _id: "l12", title: "Ngụ ngôn về con đường", content_type: "poem", mood: "motivation", level: "hsk4",
    chinese_text: "世上本无路，\n走的人多了，\n就成了路。\n你走的每一步，都在为后人开路。",
    pinyin: "Shì shàng běn wú lù,\nZǒu de rén duō le,\nJiù chéng le lù.\nNǐ zǒu de měi yī bù, dōu zài wèi hòurén kāi lù.",
    translation: "Trên đời vốn không có đường,\nNhiều người đi rồi,\nThành đường thôi.\nMỗi bước bạn đi đều đang mở đường cho người đi sau.",
    vocabulary: [
      { hanzi: "本", pinyin: "běn", meaning: "vốn, căn bản", example: "本来如此" },
      { hanzi: "成", pinyin: "chéng", meaning: "trở thành", example: "变成了路" },
      { hanzi: "后人", pinyin: "hòurén", meaning: "thế hệ sau", example: "为后人着想" },
      { hanzi: "开路", pinyin: "kāi lù", meaning: "mở đường, khai phá", example: "为后人开路" },
    ],
    grammar_notes: "• 本无 — vốn không có\n• V的人多了，就... — nhiều người V rồi thì...\n• 在为...开路 — đang mở đường cho...",
    cultural_note: "Câu nói của Lỗ Tấn: '其实地上本没有路，走的人多了，也便成了路' — một trong những câu được trích dẫn nhiều nhất văn học hiện đại Trung Quốc, về tinh thần tiên phong.",
  },

};

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showPinyin, togglePinyin } = useAppStore();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [activeSection, setActiveSection] = useState<"text" | "vocab" | "notes" | "pronunciation">("text");
  const { xp, show: showXP, awardXP: showXPAnimation } = useXPToast();
  // Server-side XP + streak sync (nếu đã login)
  const { awardXP: syncXP } = useProgress();

  const lessonId = params.id as string;

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        // Thử fetch từ API trước
        const res = await fetch(`/api/lessons/${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          setLesson(data);
        } else {
          // Dùng demo data
          setLesson(DEMO_LESSONS[lessonId] ?? DEMO_LESSONS.l1);
        }
      } catch {
        setLesson(DEMO_LESSONS[lessonId] ?? DEMO_LESSONS.l1);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const { speak } = useTTS();
  const playAudio = () => {
    if (!lesson) return;
    void speak(lesson.chinese_text.replace(/\n/g, "。"));
  };

  const handleComplete = async () => {
    if (completed) return;
    setCompleted(true);
    // Local animation
    showXPAnimation(20);
    // Server sync (cộng XP vào DB, tính streak, level up nếu có)
    await syncXP(20, "complete_lesson");
    toast("🎉 Bài học hoàn thành! +20 XP", { duration: 2000 });
  };

  const handleQuizComplete = async (score: number, _total: number) => {
    const bonus = score * 10;
    if (bonus > 0) {
      showXPAnimation(bonus);
      await syncXP(bonus, "complete_quiz");
    }
  };

  if (loading) return <LessonDetailSkeleton />;
  if (!lesson) return null;

  const moodColor = MOOD_COLORS[lesson.mood] ?? "#8A8078";
  const sentences = lesson.chinese_text.split("\n").filter(Boolean);
  const pinyinLines = lesson.pinyin.split("\n").filter(Boolean);
  const translationLines = lesson.translation.split("\n").filter(Boolean);

  return (
    <div className="min-h-screen max-w-lg mx-auto">
      <XPToast xp={xp} show={showXP} />

      {/* Hero header */}
      <div
        className="relative px-4 pt-5 pb-8 mb-0"
        style={{
          background: `linear-gradient(to bottom, ${moodColor}15 0%, transparent 100%)`,
        }}
      >
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="badge text-[10px]"
            style={{ background: `${moodColor}20`, color: moodColor }}
          >
            {MOOD_EMOJI[lesson.mood]} {MOOD_LABEL[lesson.mood]}
          </span>
          <span className="badge bg-white/5 text-[var(--text-muted)] text-[10px]">
            {LEVEL_LABEL[lesson.level]}
          </span>
          <span className="badge bg-white/5 text-[var(--text-muted)] text-[10px]">
            {lesson.content_type === "story" ? "📖 Câu chuyện" : "💬 Hội thoại"}
          </span>
        </div>

        <h1 className="font-playfair text-2xl font-bold mb-4">{lesson.title}</h1>

        {/* Pinyin toggle + audio */}
        <div className="flex items-center gap-2">
          <button
            onClick={playAudio}
            className="flex items-center gap-1.5 text-xs bg-surface2 text-[var(--text-muted)] hover:text-white px-3 py-2 rounded-full transition-colors"
          >
            <Volume2 size={13} /> Nghe toàn bài
          </button>
          <button
            onClick={togglePinyin} aria-label="Bật/tắt pinyin"
            className="flex items-center gap-1.5 text-xs bg-surface2 text-[var(--text-muted)] hover:text-white px-3 py-2 rounded-full transition-colors"
          >
            {showPinyin ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPinyin ? "Ẩn pinyin" : "Hiện pinyin"}
          </button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 px-4 mb-6 bg-surface2 mx-4 p-1 rounded-2xl">
        {(["text", "vocab", "notes", "pronunciation"] as const).map((tab) => {
          const labels = { text: "📖 Nội dung", vocab: "📚 Từ vựng", notes: "💡 Ghi chú", pronunciation: "🎙️ Phát âm" };
          return (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                activeSection === tab
                  ? "bg-surface text-[#F5F0EB] shadow"
                  : "text-[var(--text-muted)] hover:text-white"
              )}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      <div className="px-4 pb-8 space-y-6">
        {/* TEXT SECTION */}
        {activeSection === "text" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {sentences.map((sentence, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group"
              >
                <div
                  className={cn(
                    "p-4 rounded-2xl border transition-all duration-200 cursor-pointer",
                    "bg-surface border-[rgba(255,255,255,0.06)]",
                    "hover:border-[rgba(232,80,74,0.2)]"
                  )}
                  onClick={() => {
                    void speak(sentence);
                  }}
                >
                  {/* Chinese sentence */}
                  <p className="font-chinese text-xl font-bold leading-relaxed tracking-wider text-[#F5F0EB] mb-1">
                    {sentence}
                  </p>

                  {/* Pinyin */}
                  <div
                    className={cn(
                      "transition-all duration-300 overflow-hidden",
                      showPinyin ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <p className="text-xs text-mm-gold/60 tracking-wider mb-1">
                      {pinyinLines[i] ?? ""}
                    </p>
                  </div>

                  {/* Translation */}
                  <p className="text-sm text-[var(--text-muted)] font-light italic">
                    {translationLines[i] ?? ""}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Complete button */}
            <motion.button
              onClick={handleComplete}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "w-full py-4 rounded-2xl font-semibold text-sm transition-all duration-300",
                "flex items-center justify-center gap-2",
                completed
                  ? "bg-[rgba(143,175,143,0.2)] text-[#8FAF8F] border border-[#8FAF8F]/30"
                  : "btn-primary"
              )}
            >
              {completed ? (
                <><CheckCircle2 size={16} /> Đã hoàn thành · +20 XP</>
              ) : (
                <>Hoàn thành bài học · +20 XP ✨</>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* VOCAB SECTION */}
        {activeSection === "vocab" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <VocabList vocabulary={lesson.vocabulary} />

            {lesson.vocabulary.length >= 2 && (
              <MiniQuiz
                vocabulary={lesson.vocabulary}
                onComplete={handleQuizComplete}
              />
            )}
          </motion.div>
        )}

        {/* NOTES SECTION */}
        {activeSection === "notes" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {lesson.grammar_notes && (
              <div className="card space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={15} className="text-mm-gold" />
                  <p className="text-xs text-mm-gold uppercase tracking-widest font-semibold">
                    Ngữ pháp
                  </p>
                </div>
                {lesson.grammar_notes.split("\n").filter(Boolean).map((line, i) => (
                  <p key={i} className="text-sm text-[#F5F0EB] leading-relaxed font-light">
                    {line}
                  </p>
                ))}
              </div>
            )}

            {lesson.cultural_note && (
              <div className="card space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={15} className="text-mm-rose" />
                  <p className="text-xs text-mm-rose uppercase tracking-widest font-semibold">
                    Văn hóa & Cảm xúc
                  </p>
                </div>
                <p className="text-sm text-[#F5F0EB] leading-relaxed font-light">
                  {lesson.cultural_note}
                </p>
              </div>
            )}

            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={15} className="text-mm-sage" />
                <p className="text-xs text-mm-sage uppercase tracking-widest font-semibold">
                  Mẹo nhớ
                </p>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed font-light">
                Đọc to câu tiếng Trung 3 lần, sau đó thử nói mà không nhìn phiên âm. Não sẽ ghi nhớ qua âm thanh tốt hơn nhiều so với chỉ nhìn.
              </p>
            </div>
          </motion.div>
        )}

        {/* PRONUNCIATION SECTION */}
        {activeSection === "pronunciation" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-sm text-[var(--text-muted)]">
              Luyện phát âm từng câu trong bài. Nhấn <strong className="text-white">Nghe mẫu</strong> trước, sau đó nhấn mic để thử.
            </p>
            {sentences.map((sentence, i) => (
              <PronunciationPractice
                key={i}
                targetText={sentence}
                targetPinyin={pinyinLines[i] ?? ""}
                translation={translationLines[i] ?? ""}
                onScore={(score) => {
                  if (score >= 80 && !completed) {
                    void handleComplete();
                  }
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
