/**
 * /test — Mock HSK Test
 * Luyện đề thi HSK 1-6: trắc nghiệm, đếm giờ, kết quả chi tiết
 * Cảm hứng từ nhaikanji.com (Đề thi JLPT)
 */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Trophy, RotateCcw, CheckCircle2, XCircle, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { shuffle } from "@/lib/shuffle";
import { generateVocabQuestions } from "@/lib/vocabQuiz";
import { recordTestResult } from "@/lib/testHistory";
import { trackEvent } from "@/lib/analytics";
import { useProgress } from "@/hooks/useProgress";
import ShareCard from "@/components/ui/ShareCard";
import { HSK_DATA } from "@/lib/hsk-data";

interface Question {
  id: string;
  type: "meaning" | "pinyin" | "fill_blank" | "choose_char";
  question: string;
  chinese?: string;
  options: string[];
  correct: number; // index
  explanation: string;
  level: string;
}

// ── Question Bank ──────────────────────────────────────────────────────────────
const HSK1_QUESTIONS: Question[] = [
  { id: "h1_1", type: "meaning", question: "你好 có nghĩa là gì?", options: ["Xin chào", "Cảm ơn", "Tạm biệt", "Xin lỗi"], correct: 0, explanation: "你好 (nǐ hǎo) = Xin chào — câu chào hỏi cơ bản nhất tiếng Trung.", level: "hsk1" },
  { id: "h1_2", type: "pinyin", question: "Pinyin của chữ 爱 là gì?", options: ["ài", "āi", "ǎi", "ái"], correct: 0, explanation: "爱 (ài) thanh 4 — xuống mạnh. Nghĩa: yêu thương.", level: "hsk1" },
  { id: "h1_3", type: "meaning", question: "谢谢 có nghĩa là gì?", options: ["Xin lỗi", "Cảm ơn", "Không có gì", "Chào"], correct: 1, explanation: "谢谢 (xièxiè) = Cảm ơn. Thường đáp lại bằng 不客气 (bùkèqì) — không có gì.", level: "hsk1" },
  { id: "h1_4", type: "choose_char", question: "Chữ nào có nghĩa là 'nước'?", options: ["火", "水", "土", "木"], correct: 1, explanation: "水 (shuǐ) = nước. Cùng bộ: 火(lửa), 土(đất), 木(cây) — 4 nguyên tố cơ bản.", level: "hsk1" },
  { id: "h1_5", type: "fill_blank", question: "___好 = Xin chào", chinese: "___好", options: ["你", "我", "他", "她"], correct: 0, explanation: "你好 = Xin chào. 你 = bạn/anh/chị. Đây là mẫu câu chào hỏi HSK1 quan trọng nhất.", level: "hsk1" },
];

const HSK2_QUESTIONS: Question[] = [
  { id: "h2_1", type: "meaning", question: "喜欢 (xǐhuān) có nghĩa là gì?", options: ["Yêu", "Thích", "Ghét", "Nhớ"], correct: 1, explanation: "喜欢 = thích. Khác với 爱 (yêu) — 喜欢 nhẹ hơn, dùng cho cả người lẫn đồ vật.", level: "hsk2" },
  { id: "h2_2", type: "pinyin", question: "Pinyin của 漂亮 là gì?", options: ["piàoliang", "piáoliáng", "biàoliang", "piàoliǎng"], correct: 0, explanation: "漂亮 (piàoliang) = đẹp. Thanh 4-nhẹ. Hay dùng hơn 美 trong lời khen trực tiếp.", level: "hsk2" },
  { id: "h2_3", type: "meaning", question: "Câu 我不知道 nghĩa là gì?", options: ["Tôi biết rồi", "Tôi không biết", "Tôi hiểu", "Tôi không hiểu"], correct: 1, explanation: "我(tôi) 不(không) 知道(biết) = Tôi không biết. 不 phủ định đứng trước động từ.", level: "hsk2" },
  { id: "h2_4", type: "choose_char", question: "Chữ nào có nghĩa là 'ăn'?", options: ["喝", "吃", "看", "听"], correct: 1, explanation: "吃 (chī) = ăn. 喝(uống) 看(xem) 听(nghe) — 4 động từ cơ bản HSK1-2.", level: "hsk2" },
  { id: "h2_5", type: "fill_blank", question: "我___你 = Tôi nhớ anh/chị", chinese: "我___你", options: ["爱", "想", "看", "有"], correct: 1, explanation: "我想你 = Tôi nhớ bạn. 想 vừa = nhớ vừa = muốn, tùy ngữ cảnh. Khác 我爱你 (tôi yêu bạn).", level: "hsk2" },
];

const HSK3_QUESTIONS: Question[] = [
  { id: "h3_1", type: "meaning", question: "感动 (gǎndòng) có nghĩa là gì?", options: ["Cảm thấy", "Xúc động", "Vận động", "Cảm giác"], correct: 1, explanation: "感动 = xúc động, cảm động. 感(cảm nhận) + 动(rung động) — bị cảm xúc làm rung chuyển.", level: "hsk3" },
  { id: "h3_2", type: "pinyin", question: "Từ nào đọc là 'yuánfèn'?", options: ["原分", "缘份", "缘分", "元份"], correct: 2, explanation: "缘分 (yuánfèn) = duyên phận. Chữ giản thể dùng 分 không phải 份.", level: "hsk3" },
  { id: "h3_3", type: "meaning", question: "已经 (yǐjīng) nghĩa là gì?", options: ["Sắp", "Đã (rồi)", "Đang", "Sẽ"], correct: 1, explanation: "已经 = đã, rồi (diễn tả việc đã hoàn thành). VD: 我已经吃了 = Tôi đã ăn rồi.", level: "hsk3" },
  { id: "h3_4", type: "choose_char", question: "Chữ nào có nghĩa là 'nhớ nhung / tương tư'?", options: ["忘", "思", "想", "记"], correct: 1, explanation: "思 (sī) = suy nghĩ, nhớ nhung. 思念 = nhớ nhung. 相思 = tương tư. Khác 想(muốn/nhớ thông dụng) và 记(nhớ/ghi nhớ).", level: "hsk3" },
  { id: "h3_5", type: "fill_blank", question: "他___来了 = Anh ấy vẫn chưa đến", chinese: "他___来了", options: ["已经", "还没", "不会", "没有"], correct: 1, explanation: "还没(chưa) + V + 了 = vẫn chưa. 还没来了 = vẫn chưa đến. Cấu trúc quan trọng HSK3.", level: "hsk3" },
];

const HSK4_QUESTIONS: Question[] = [
  { id: "h4_1", type: "meaning", question: "虽然...但是... dùng để diễn đạt điều gì?", options: ["Điều kiện", "Tương phản (dù...nhưng...)", "Mục đích", "Kết quả"], correct: 1, explanation: "虽然...但是... = Dù/Mặc dù...nhưng... — cấu trúc tương phản rất hay dùng. VD: 虽然很难，但是我会努力。", level: "hsk4" },
  { id: "h4_2", type: "meaning", question: "一方面...另一方面... nghĩa là gì?", options: ["Vừa...vừa...", "Một mặt...mặt khác...", "Không những...mà còn...", "Nếu...thì..."], correct: 1, explanation: "一方面...另一方面... = Một mặt...mặt khác... — dùng khi trình bày hai khía cạnh của vấn đề.", level: "hsk4" },
  { id: "h4_3", type: "pinyin", question: "Chữ 缘 (duyên phận) bộ thủ là gì?", options: ["糸/纟 (tơ lụa)", "心 (tim)", "目 (mắt)", "口 (miệng)"], correct: 0, explanation: "缘 bộ 纟(tơ lụa) — duyên phận như sợi tơ vô hình nối hai người. Đây là chiết tự của 缘.", level: "hsk4" },
  { id: "h4_4", type: "meaning", question: "不得不 (bùdébù) có nghĩa gì?", options: ["Không thể không", "Buộc phải, không thể không làm", "Không muốn làm", "Có thể không làm"], correct: 1, explanation: "不得不 = buộc phải, không thể không (làm). Phủ định kép tạo thành bắt buộc. VD: 我不得不去 = Tôi buộc phải đi.", level: "hsk4" },
  { id: "h4_5", type: "choose_char", question: "Câu tục ngữ 落叶___根 — chữ điền vào là?", options: ["回", "归", "来", "到"], correct: 1, explanation: "落叶归根 (luò yè guī gēn) = lá rụng về cội. 归 = trở về, hướng về nguồn cội — một trong những chữ cảm xúc nhất tiếng Trung.", level: "hsk4" },
];

const HSK5_QUESTIONS: Question[] = [
  { id: "h5_1", type: "meaning", question: "人生若只如初见 — câu thơ này có nghĩa gì?", options: ["Cuộc đời ngắn ngủi như giấc mơ", "Giá như cuộc đời mãi đẹp như lần đầu gặp gỡ", "Người ta sống chỉ một lần duy nhất", "Lần đầu gặp gỡ là quan trọng nhất"], correct: 1, explanation: "人生若只如初见 (Nạp Lan Tính Đức) = Giá như cuộc đời mãi đẹp như lần đầu gặp gỡ. 若(nếu như) 只(chỉ) 如(giống như) 初见(lần đầu gặp).", level: "hsk5" },
  { id: "h5_2", type: "meaning", question: "心有灵犀一点通 nghĩa là gì?", options: ["Tim tôi đau một nỗi đau", "Hai tâm hồn kết nối — chạm nhau là hiểu", "Tim người thật khó đoán", "Linh cảm đặc biệt của con người"], correct: 1, explanation: "心有灵犀一点通 (Lý Thương Ẩn) — 灵犀 là sừng tê giác thần kỳ, thông linh. Hai người có 灵犀 thì chỉ cần một điểm chạm là hiểu nhau.", level: "hsk5" },
  { id: "h5_3", type: "pinyin", question: "缘分 và 命运 — cái nào mang nghĩa 'số phận/định mệnh' chung chung hơn?", options: ["缘分", "命运", "Như nhau", "Tùy ngữ cảnh"], correct: 1, explanation: "命运 (mìngyùn) = số phận/định mệnh tổng quan. 缘分 (yuánfèn) = duyên phận giữa hai người — hẹp hơn, thiên về mối quan hệ.", level: "hsk5" },
  { id: "h5_4", type: "choose_char", question: "Câu nào SAI về cấu trúc?", options: ["虽然很累，但是很快乐", "因为下雨，所以没去", "他不但聪明，而且勤奋", "虽然很好，所以我喜欢"], correct: 3, explanation: "虽然(dù) không đi với 所以(nên). 虽然 đi với 但是(nhưng). Lỗi hay gặp: nhầm cặp liên từ tương phản với nhân quả.", level: "hsk5" },
  { id: "h5_5", type: "meaning", question: "梦里不知身是客，一晌贪欢 — '身是客' nghĩa là gì?", options: ["Thân xác là khách quý", "Thân mình là kẻ tha hương/lưu lạc", "Cuộc sống như một giấc mơ", "Khách trong mơ"], correct: 1, explanation: "Lý Dục (Nam Đường): Trong mơ quên mình là 客(kẻ lưu lạc/tù binh) — ông là vua bị bắt làm tù. 'Thân là khách' = thân phận lưu đày.", level: "hsk5" },
];


const HSK1_EXTRA: Question[] = [
  { id: "h1_6", type: "meaning", question: "再见 có nghĩa là gì?", options: ["Xin chào", "Tạm biệt", "Cảm ơn", "Xin lỗi"], correct: 1, explanation: "再见 (zàijiàn) = Tạm biệt/Hẹn gặp lại. 再=lại, 见=gặp — gặp lại sau nhé!", level: "hsk1" },
  { id: "h1_7", type: "choose_char", question: "Chữ nào có nghĩa là 'mặt trời'?", options: ["月", "日", "星", "云"], correct: 1, explanation: "日 (rì) = mặt trời, ngày. 月(trăng), 星(sao), 云(mây) — bộ tứ bầu trời HSK1.", level: "hsk1" },
  { id: "h1_8", type: "meaning", question: "多少钱？ nghĩa là gì?", options: ["Bao giờ?", "Ở đâu?", "Bao nhiêu tiền?", "Như thế nào?"], correct: 2, explanation: "多少 (duōshao) = bao nhiêu. 钱 (qián) = tiền. Câu hỏi giá cần thiết nhất khi đi mua sắm.", level: "hsk1" },
  { id: "h1_9", type: "fill_blank", question: "我___中国人。(Tôi là người Trung Quốc.)", chinese: "我___中国人", options: ["是", "有", "在", "叫"], correct: 0, explanation: "我是...人 = Tôi là người... 是 là động từ 'là' cơ bản nhất tiếng Trung.", level: "hsk1" },
  { id: "h1_10", type: "meaning", question: "Số 八 (bā) là số mấy?", options: ["6", "7", "8", "9"], correct: 2, explanation: "八 (bā) = 8. Đây là con số may mắn nhất trong văn hóa Trung Hoa — phát âm gần với 发 (fā = phát tài).", level: "hsk1" },
];

const HSK2_EXTRA: Question[] = [
  { id: "h2_6", type: "meaning", question: "一起 (yīqǐ) có nghĩa là gì?", options: ["Một mình", "Cùng nhau", "Một lần", "Đồng ý"], correct: 1, explanation: "一起 = cùng nhau, cùng với. VD: 我们一起去吧 — Chúng ta cùng đi nhé!", level: "hsk2" },
  { id: "h2_7", type: "fill_blank", question: "他___北京来。(Anh ấy đến từ Bắc Kinh.)", chinese: "他___北京来", options: ["从", "在", "去", "到"], correct: 0, explanation: "从...来 = đến từ... 从(từ) + địa điểm + 来(đến). Cấu trúc chỉ nguồn gốc.", level: "hsk2" },
  { id: "h2_8", type: "meaning", question: "回家 (huí jiā) nghĩa là?", options: ["Đi học", "Về nhà", "Ra ngoài", "Đến trường"], correct: 1, explanation: "回 (huí) = trở về. 家 (jiā) = nhà. 回家 = về nhà — từ dùng nhiều nhất cuối ngày làm việc.", level: "hsk2" },
  { id: "h2_9", type: "choose_char", question: "Chữ nào có nghĩa là 'đọc/học'?", options: ["写", "读", "说", "听"], correct: 1, explanation: "读 (dú) = đọc, học. 写(viết) 说(nói) 听(nghe) — 4 kỹ năng ngôn ngữ cơ bản.", level: "hsk2" },
  { id: "h2_10", type: "meaning", question: "一下 (yīxià) thường được dùng để?", options: ["Nhấn mạnh hành động", "Làm nhẹ nhàng yêu cầu", "Chỉ số lần", "Chỉ thời gian"], correct: 1, explanation: "V + 一下 = làm một chút (lịch sự hóa yêu cầu). VD: 等一下 (đợi một chút), 看一下 (xem một chút).", level: "hsk2" },
];

const HSK3_EXTRA: Question[] = [
  { id: "h3_6", type: "meaning", question: "一方面...另一方面... dùng để?", options: ["Giải thích nguyên nhân", "Trình bày hai khía cạnh", "So sánh hai sự vật", "Đưa ra điều kiện"], correct: 1, explanation: "一方面...另一方面... = Một mặt...mặt khác... Dùng khi muốn trình bày đa chiều.", level: "hsk3" },
  { id: "h3_7", type: "fill_blank", question: "他___努力，___成功了。(Anh ấy vì cố gắng nên thành công.)", chinese: "他___努力，___成功了", options: ["因为...所以", "虽然...但是", "如果...就", "不但...而且"], correct: 0, explanation: "因为...所以... = Vì...nên... Cặp liên từ nhân quả quan trọng nhất HSK3.", level: "hsk3" },
  { id: "h3_8", type: "meaning", question: "越来越 (yuèláiyuè) có nghĩa là?", options: ["Ngày càng", "Trước đây", "Thỉnh thoảng", "Đột nhiên"], correct: 0, explanation: "越来越 + adj = ngày càng... VD: 越来越好 = ngày càng tốt hơn. Cấu trúc HSK3 hay gặp.", level: "hsk3" },
  { id: "h3_9", type: "choose_char", question: "Từ nào có nghĩa là 'hiểu, thấu hiểu'?", options: ["知道", "明白", "懂", "了解"], correct: 2, explanation: "懂 (dǒng) = hiểu (ở mức sâu, cảm nhận được). 知道=biết, 明白=rõ ràng, 了解=tìm hiểu. 懂你 = hiểu bạn sâu sắc.", level: "hsk3" },
  { id: "h3_10", type: "meaning", question: "Câu 'Chỉ cần có bạn là đủ' dùng cấu trúc nào?", options: ["虽然...但是", "因为...所以", "只要...就", "不但...而且"], correct: 2, explanation: "只要...就... = Chỉ cần...là/thì... VD: 只要有你就够了 = Chỉ cần có bạn là đủ.", level: "hsk3" },
];

const HSK4_EXTRA: Question[] = [
  { id: "h4_6", type: "meaning", question: "'Dù thế nào đi nữa tôi cũng sẽ ở đây' — dùng cấu trúc nào?", options: ["因为...所以", "不管...都", "虽然...但是", "只要...就"], correct: 1, explanation: "不管...都... = Dù...đều... (mạnh hơn 无论). VD: 不管发生什么，我都在 = Dù chuyện gì xảy ra, tôi cũng ở đây.", level: "hsk4" },
  { id: "h4_7", type: "fill_blank", question: "他走了，我才___他有多重要。(Anh ấy ra đi, tôi mới nhận ra anh ấy quan trọng thế nào.)", chinese: "才___有多重要", options: ["意识到", "知道了", "感觉到", "发现了"], correct: 0, explanation: "意识到 (yìshídào) = nhận thức được, nhận ra. Chính xác hơn 知道 khi nói về sự giác ngộ muộn màng.", level: "hsk4" },
  { id: "h4_8", type: "meaning", question: "心有灵犀 — thành ngữ này nghĩa là?", options: ["Tim đau như dao cắt", "Hai tâm hồn kết nối đặc biệt", "Nghĩ nhiều quá", "Yêu từ cái nhìn đầu tiên"], correct: 1, explanation: "心有灵犀一点通 — 灵犀 là sừng tê giác thần kỳ. Hai người có linh cảm đặc biệt, chỉ cần một cái chạm là hiểu nhau.", level: "hsk4" },
  { id: "h4_9", type: "choose_char", question: "Từ nào KHÔNG liên quan đến cảm xúc buồn?", options: ["遗憾", "失望", "难过", "温暖"], correct: 3, explanation: "温暖 (wēnnuǎn) = ấm áp — cảm xúc tích cực. Ba từ kia đều mang sắc thái tiêu cực: 遗憾(tiếc nuối), 失望(thất vọng), 难过(buồn).", level: "hsk4" },
  { id: "h4_10", type: "meaning", question: "宁可...也不... nghĩa là?", options: ["Vừa...vừa...", "Thà...còn hơn không...", "Không những...mà còn...", "Dù...nhưng..."], correct: 1, explanation: "宁可...也不... = Thà...chứ không... (thể hiện quyết tâm hoặc sự lựa chọn kiên định). VD: 宁可一个人，也不将就 = Thà một mình còn hơn chấp nhận sai người.", level: "hsk4" },
];

const HSK5_EXTRA: Question[] = [
  { id: "h5_6", type: "meaning", question: "落叶归根 — nghĩa bóng là?", options: ["Cây lá rụng về đất", "Người xa quê cuối cùng cũng trở về cội nguồn", "Mọi thứ đều có quy luật", "Cái đẹp không bền lâu"], correct: 1, explanation: "落叶归根 = lá rụng về cội. Nghĩa bóng: người dù đi xa đến đâu cũng hướng về quê hương, nguồn cội.", level: "hsk5" },
  { id: "h5_7", type: "meaning", question: "忍一时风平浪静 — tiếp theo là câu gì?", options: ["退一步海阔天空", "向前一步是天堂", "再坚持一会儿", "转身是另一个世界"], correct: 0, explanation: "忍一时风平浪静，退一步海阔天空 = Nhẫn một lúc gió yên sóng lặng, lùi một bước biển rộng trời cao — triết lý nhẫn nhịn Trung Hoa.", level: "hsk5" },
  { id: "h5_8", type: "choose_char", question: "缘分 — bộ thủ 纟 tượng trưng cho điều gì trong ngữ cảnh này?", options: ["Tơ lụa, sợi chỉ kết nối", "Màu sắc", "Sợi dây thắt", "Vải vóc quý giá"], correct: 0, explanation: "纟(tơ lụa) trong 缘 tượng trưng cho 'sợi chỉ đỏ' (红线) trong truyền thuyết Trung Hoa — sợi dây vô hình nối liền hai người có duyên.", level: "hsk5" },
  { id: "h5_9", type: "meaning", question: "Câu nào diễn đạt đúng nghĩa 'người ta không thể hai lần bước vào cùng một dòng sông'?", options: ["时光不倒流", "缘分天注定", "物是人非", "沧海桑田"], correct: 2, explanation: "物是人非 (wùshì rénfēi) = vật còn đó người đã thay đổi — gần nghĩa nhất. Heraclitus có câu tương tự: mọi thứ đều thay đổi.", level: "hsk5" },
  { id: "h5_10", type: "meaning", question: "沧海桑田 (cānghǎi sāngtián) nghĩa là?", options: ["Biển xanh ruộng dâu — chỉ sự thay đổi lớn lao của thời gian", "Phong cảnh thiên nhiên đẹp", "Cuộc đời vô thường như sóng biển", "Người làm nông bên bờ biển"], correct: 0, explanation: "沧海桑田 = biển xanh (cũ) thành ruộng dâu. Thành ngữ chỉ sự biến đổi to lớn qua thời gian. Xuất xứ từ truyền thuyết tiên nữ Magu.", level: "hsk5" },
];

// HSK6 — Bậc tinh thông: thành ngữ, thơ cổ điển, ngữ pháp văn viết.
const HSK6_QUESTIONS: Question[] = [
  { id: "h6_1", type: "meaning", question: "曾经沧海难为水 — câu thơ này ngụ ý gì?", options: ["Biển cả khó tạo thành nước", "Đã từng thấy biển lớn thì khó coi dòng nước thường là gì — đã yêu sâu đậm thì khó rung động lần nữa", "Nước biển mặn không uống được", "Cuộc đời như sóng biển vô thường"], correct: 1, explanation: "曾经沧海难为水，除却巫山不是云 (Nguyên Chẩn) — đã trải qua biển lớn thì sông suối chẳng đáng nhìn; tả tình yêu sâu nặng không gì thay thế được.", level: "hsk6" },
  { id: "h6_2", type: "meaning", question: "塞翁失马，焉知非福 — thành ngữ này dạy điều gì?", options: ["Mất ngựa là điềm xui", "Họa phúc khôn lường, việc xấu có thể hóa may", "Người già hay quên", "Đừng nuôi ngựa ở biên ải"], correct: 1, explanation: "塞翁失马，焉知非福 = Ông lão biên ải mất ngựa, biết đâu lại là phúc. Triết lý họa-phúc tương sinh, đừng vội buồn vui.", level: "hsk6" },
  { id: "h6_3", type: "fill_blank", question: "___风破浪会有时，直挂云帆济沧海。(Lý Bạch)", chinese: "___风破浪会有时", options: ["乘", "长", "顺", "迎"], correct: 1, explanation: "长风破浪会有时 (Lý Bạch) = Rồi sẽ có ngày cưỡi gió rẽ sóng. 长风 = ngọn gió dài/lớn. Câu thơ về niềm tin vào tương lai.", level: "hsk6" },
  { id: "h6_4", type: "choose_char", question: "Thành ngữ nào KHÔNG mang nghĩa 'kiên trì, bền bỉ'?", options: ["锲而不舍", "持之以恒", "半途而废", "水滴石穿"], correct: 2, explanation: "半途而废 (bàntú'érfèi) = bỏ dở giữa chừng — trái nghĩa. Ba câu kia đều nói về sự kiên trì: 锲而不舍, 持之以恒, 水滴石穿 (nước chảy đá mòn).", level: "hsk6" },
  { id: "h6_5", type: "meaning", question: "落霞与孤鹜齐飞，秋水共长天一色 — vế này nổi tiếng vì điều gì?", options: ["Tả cảnh chiến trận", "Đối ngẫu hoàn mỹ tả ráng chiều, cánh cò, nước thu và trời xa hòa một màu", "Nói về nỗi cô đơn", "Miêu tả mùa xuân"], correct: 1, explanation: "Vương Bột (Đằng Vương Các Tự): 落霞(ráng chiều)与孤鹜(cánh cò lẻ)齐飞, 秋水(nước thu)共长天一色 — kiệt tác đối ngẫu, cảnh trời nước hòa làm một.", level: "hsk6" },
];

const HSK6_EXTRA: Question[] = [
  { id: "h6_6", type: "meaning", question: "画蛇添足 nghĩa bóng là?", options: ["Vẽ rắn rất khéo", "Làm thừa thãi, vẽ rắn thêm chân — hỏng việc", "Sáng tạo độc đáo", "Tỉ mỉ cẩn thận"], correct: 1, explanation: "画蛇添足 = vẽ rắn thêm chân. Nghĩa bóng: làm việc thừa, tốt thành hỏng.", level: "hsk6" },
  { id: "h6_7", type: "meaning", question: "言外之意 nghĩa là gì?", options: ["Lời nói thẳng thắn", "Ý ngoài lời — hàm ý ẩn sau câu chữ", "Lời hứa suông", "Ngôn ngữ nước ngoài"], correct: 1, explanation: "言外之意 (yánwàizhīyì) = ý nằm ngoài lời nói, hàm ý sâu xa người nghe phải tự hiểu.", level: "hsk6" },
  { id: "h6_8", type: "choose_char", question: "Chọn từ điền: 他的成功并非___，而是多年努力的结果。", options: ["一帆风顺", "一蹴而就", "一日千里", "一鸣惊人"], correct: 1, explanation: "一蹴而就 (yīcù'érjiù) = thành ngay trong một bước. Câu phủ định: thành công không phải đạt được trong chốc lát, mà do nỗ lực nhiều năm.", level: "hsk6" },
  { id: "h6_9", type: "meaning", question: "君子之交淡如水 — ý nói tình bạn thế nào?", options: ["Tình bạn nhạt nhẽo vô vị", "Tình bạn người quân tử nhạt như nước — thanh khiết, bền lâu, không vụ lợi", "Bạn bè nên xa cách", "Uống nước nhớ nguồn"], correct: 1, explanation: "君子之交淡如水 (Trang Tử) = giao tình người quân tử nhạt như nước: không nồng nàn phô trương nhưng trong sạch và bền vững.", level: "hsk6" },
  { id: "h6_10", type: "meaning", question: "海内存知己，天涯若比邻 — câu này an ủi điều gì?", options: ["Đi xa thì mất bạn", "Có tri kỷ trong đời, dù chân trời góc bể vẫn như sát bên nhau", "Hàng xóm là quan trọng nhất", "Biển cả ngăn cách con người"], correct: 1, explanation: "海内存知己，天涯若比邻 (Vương Bột) = Trong bốn bể có tri kỷ, dù góc bể chân trời cũng như láng giềng kề bên — lời tiễn bạn ấm áp nhất.", level: "hsk6" },
];

// ── Batch 3: mở rộng ngân hàng để mỗi lần thi không trùng (chọn ngẫu nhiên) ──
const HSK1_EXTRA2: Question[] = [
  { id: "h1_11", type: "meaning", question: "对不起 có nghĩa là gì?", options: ["Cảm ơn", "Xin lỗi", "Không sao", "Tạm biệt"], correct: 1, explanation: "对不起 (duìbuqǐ) = Xin lỗi. Đáp lại bằng 没关系 (méiguānxi) = không sao đâu.", level: "hsk1" },
  { id: "h1_12", type: "choose_char", question: "Chữ nào có nghĩa là 'người'?", options: ["人", "大", "天", "入"], correct: 0, explanation: "人 (rén) = người — một trong những chữ đầu tiên, hình hai chân người đang bước.", level: "hsk1" },
  { id: "h1_13", type: "fill_blank", question: "我___学生。(Tôi là học sinh.)", chinese: "我___学生", options: ["是", "有", "在", "的"], correct: 0, explanation: "我是学生 = Tôi là học sinh. 是 = là (động từ liên kết).", level: "hsk1" },
  { id: "h1_14", type: "meaning", question: "今天 (jīntiān) nghĩa là gì?", options: ["Hôm qua", "Hôm nay", "Ngày mai", "Mỗi ngày"], correct: 1, explanation: "今天 = hôm nay. 昨天(hôm qua), 明天(ngày mai) — bộ ba thời gian cơ bản.", level: "hsk1" },
  { id: "h1_15", type: "meaning", question: "Số 十 (shí) là số mấy?", options: ["1", "5", "10", "100"], correct: 2, explanation: "十 (shí) = 10. Chữ tượng hình một dấu cộng — đủ đầy, trọn vẹn.", level: "hsk1" },
];
const HSK2_EXTRA2: Question[] = [
  { id: "h2_11", type: "meaning", question: "因为 (yīnwèi) dùng để chỉ điều gì?", options: ["Kết quả", "Nguyên nhân", "Điều kiện", "Thời gian"], correct: 1, explanation: "因为 = bởi vì (nêu nguyên nhân), thường đi với 所以 (nên).", level: "hsk2" },
  { id: "h2_12", type: "choose_char", question: "Chữ nào có nghĩa là 'vui'?", options: ["哭", "笑", "怒", "累"], correct: 1, explanation: "笑 (xiào) = cười, vui. 哭(khóc), 怒(giận), 累(mệt) — các trạng thái cảm xúc.", level: "hsk2" },
  { id: "h2_13", type: "fill_blank", question: "你___哪儿？(Bạn ở đâu?)", chinese: "你___哪儿", options: ["从", "在", "去", "到"], correct: 1, explanation: "你在哪儿？ = Bạn đang ở đâu? 在 = ở (chỉ vị trí).", level: "hsk2" },
  { id: "h2_14", type: "meaning", question: "知道 và 认识 khác nhau thế nào?", options: ["Giống hệt nhau", "知道=biết thông tin, 认识=quen biết người", "认识 mạnh hơn 知道 mọi lúc", "知道 chỉ dùng cho người"], correct: 1, explanation: "知道 = biết (sự việc, thông tin). 认识 = quen biết (người, chữ). VD: 我认识他 (tôi quen anh ấy).", level: "hsk2" },
  { id: "h2_15", type: "meaning", question: "为什么 (wèishénme) nghĩa là gì?", options: ["Cái gì", "Tại sao", "Khi nào", "Ở đâu"], correct: 1, explanation: "为什么 = tại sao. Trả lời thường bắt đầu bằng 因为 (bởi vì).", level: "hsk2" },
];
const HSK3_EXTRA2: Question[] = [
  { id: "h3_11", type: "meaning", question: "其实 (qíshí) nghĩa là gì?", options: ["Thật ra", "Có lẽ", "Đương nhiên", "Cuối cùng"], correct: 0, explanation: "其实 = thật ra, thực ra (đưa ra sự thật khác với bề ngoài). VD: 其实我很在乎你.", level: "hsk3" },
  { id: "h3_12", type: "choose_char", question: "Chữ nào nghĩa là 'thay đổi'?", options: ["变", "便", "辩", "遍"], correct: 0, explanation: "变 (biàn) = thay đổi, biến hóa. 改变 = thay đổi, 变化 = biến hóa.", level: "hsk3" },
  { id: "h3_13", type: "meaning", question: "舍不得 (shěbude) diễn tả cảm xúc gì?", options: ["Tiếc, không nỡ", "Ghét bỏ", "Vui mừng", "Sợ hãi"], correct: 0, explanation: "舍不得 = không nỡ, tiếc không muốn rời/bỏ. VD: 舍不得你走 = không nỡ để bạn đi.", level: "hsk3" },
  { id: "h3_14", type: "fill_blank", question: "天气___冷了。(Trời ngày càng lạnh.)", chinese: "天气___冷了", options: ["越来越", "差不多", "终于", "一直"], correct: 0, explanation: "越来越冷 = ngày càng lạnh. 越来越 + tính từ = mức độ tăng dần.", level: "hsk3" },
  { id: "h3_15", type: "meaning", question: "Cấu trúc 一边...一边... nghĩa là?", options: ["Vừa...vừa... (cùng lúc)", "Một bên...bên kia", "Trước...sau", "Nếu...thì"], correct: 0, explanation: "一边...一边... = vừa...vừa... (làm hai việc cùng lúc). VD: 一边走一边唱 = vừa đi vừa hát.", level: "hsk3" },
];
const HSK4_EXTRA2: Question[] = [
  { id: "h4_11", type: "meaning", question: "即使...也... nghĩa là gì?", options: ["Vì...nên...", "Cho dù...cũng...", "Chỉ cần...là...", "Vừa...vừa..."], correct: 1, explanation: "即使...也... = cho dù...cũng... (giả định nhượng bộ). VD: 即使失败，也要尝试.", level: "hsk4" },
  { id: "h4_12", type: "meaning", question: "珍惜 (zhēnxī) nghĩa là gì?", options: ["Lãng phí", "Trân trọng, quý trọng", "Quên lãng", "Tìm kiếm"], correct: 1, explanation: "珍惜 = trân trọng, quý trọng (thời gian, người, cơ hội). VD: 珍惜眼前人 = trân trọng người trước mắt.", level: "hsk4" },
  { id: "h4_13", type: "choose_char", question: "Thành ngữ 守株___兔 — điền chữ nào?", options: ["待", "等", "捕", "抓"], correct: 0, explanation: "守株待兔 (shǒuzhū dàitù) = ôm cây đợi thỏ — ngồi chờ may rủi, không chịu nỗ lực.", level: "hsk4" },
  { id: "h4_14", type: "meaning", question: "随着 (suízhe) thường dùng để?", options: ["Đối lập hai việc", "Diễn tả 'cùng với, theo đà'", "Nêu nguyên nhân", "Đưa giả định"], correct: 1, explanation: "随着 = cùng với, theo (sự thay đổi). VD: 随着时间过去 = theo thời gian trôi qua.", level: "hsk4" },
  { id: "h4_15", type: "meaning", question: "后悔 (hòuhuǐ) nghĩa là gì?", options: ["Hy vọng", "Hối hận", "Hồi tưởng", "Hồi hộp"], correct: 1, explanation: "后悔 = hối hận, tiếc nuối về việc đã làm. VD: 我后悔没有告诉她 = Tôi hối hận đã không nói với cô ấy.", level: "hsk4" },
];
const HSK5_EXTRA2: Question[] = [
  { id: "h5_11", type: "meaning", question: "山重水复疑无路，柳暗花明又一村 — ngụ ý gì?", options: ["Đi lạc trong núi", "Lúc tưởng cùng đường lại mở ra hy vọng mới", "Phong cảnh làng quê đẹp", "Sông núi hiểm trở"], correct: 1, explanation: "Lục Du: tưởng hết đường giữa núi sông trùng điệp, bỗng liễu rậm hoa tươi hiện ra một thôn — bĩ cực thái lai, hết khó sẽ có lối.", level: "hsk5" },
  { id: "h5_12", type: "meaning", question: "不以物喜，不以己悲 — triết lý gì?", options: ["Không thích vật chất", "Không vì ngoại vật mà vui, không vì bản thân mà buồn — tâm thái an nhiên", "Buồn vui là chuyện thường", "Sống vì người khác"], correct: 1, explanation: "范仲淹 (Phạm Trọng Yêm) — Nhạc Dương Lâu Ký: bậc quân tử giữ tâm bình thản, không để được-mất ngoại cảnh chi phối.", level: "hsk5" },
  { id: "h5_13", type: "choose_char", question: "成语 '___途末路' chỉ cảnh cùng quẫn — điền chữ?", options: ["穷", "前", "长", "中"], correct: 0, explanation: "穷途末路 (qióngtú mòlù) = đường cùng ngõ cụt, hết lối thoát.", level: "hsk5" },
  { id: "h5_14", type: "meaning", question: "Câu 'thời gian sẽ chứng minh tất cả' gần nghĩa thành ngữ nào?", options: ["日久见人心", "一见钟情", "朝三暮四", "半信半疑"], correct: 0, explanation: "日久见人心 (rìjiǔ jiàn rénxīn) = lâu ngày mới thấy lòng người — thời gian sẽ kiểm chứng tất cả.", level: "hsk5" },
  { id: "h5_15", type: "meaning", question: "执子之手，与子偕老 — câu này nói về điều gì?", options: ["Tình bạn tri kỷ", "Lời thề trọn đời: nắm tay nhau, cùng nhau đến già", "Lòng hiếu thảo", "Tình quân thần"], correct: 1, explanation: "执子之手，与子偕老 (Kinh Thi) — nắm tay người, cùng người đến đầu bạc răng long; lời thề tình yêu đẹp nhất tiếng Trung.", level: "hsk5" },
];
const HSK6_EXTRA2: Question[] = [
  { id: "h6_11", type: "meaning", question: "水至清则无鱼，人至察则无徒 — dạy điều gì?", options: ["Phải giữ nước trong sạch", "Quá khắt khe soi xét thì không ai theo — cần khoan dung", "Cá thích nước đục", "Người tốt thì cô độc"], correct: 1, explanation: "水至清则无鱼，人至察则无徒 — nước quá trong thì không có cá, người quá xét nét thì không có bạn. Bài học về sự bao dung.", level: "hsk6" },
  { id: "h6_12", type: "meaning", question: "塞翁失马 thuộc loại điển tích nào?", options: ["Sử ký chiến tranh", "Ngụ ngôn triết lý họa-phúc (Hoài Nam Tử)", "Thơ Đường", "Truyện cổ tích tình yêu"], correct: 1, explanation: "Xuất từ 《淮南子》(Hoài Nam Tử) — ngụ ngôn về biện chứng họa phúc chuyển hóa lẫn nhau.", level: "hsk6" },
  { id: "h6_13", type: "fill_blank", question: "千里之行，始于___下。(Lão Tử)", chinese: "始于___下", options: ["足", "脚", "步", "地"], correct: 0, explanation: "千里之行，始于足下 (Lão Tử) = Hành trình ngàn dặm bắt đầu từ một bước chân. 足下 = dưới chân.", level: "hsk6" },
  { id: "h6_14", type: "choose_char", question: "Thành ngữ nào nghĩa 'gặp nhau muộn màng, tiếc đã không quen sớm hơn'?", options: ["相见恨晚", "一见如故", "久别重逢", "萍水相逢"], correct: 0, explanation: "相见恨晚 (xiāngjiàn hènwǎn) = gặp nhau hận muộn, tiếc sao không quen biết sớm hơn.", level: "hsk6" },
  { id: "h6_15", type: "meaning", question: "天行健，君子以自强不息 — ý nghĩa?", options: ["Trời trong xanh", "Trời vận hành mạnh mẽ; quân tử phải không ngừng tự cường", "Sức khỏe là vàng", "Thuận theo tự nhiên"], correct: 1, explanation: "天行健，君子以自强不息 (Kinh Dịch) — trời đất vận động không ngừng, người quân tử noi theo mà phấn đấu không nghỉ. Châm ngôn tự cường nổi tiếng.", level: "hsk6" },
];

// ── Batch 4: +3 câu/bậc — đời sống, ngữ pháp, văn hóa ─────────────────────────
const HSK1_EXTRA3: Question[] = [
  { id: "h1_16", type: "meaning", question: "再见 (zàijiàn) có nghĩa là gì?", options: ["Xin chào", "Hẹn gặp lại / tạm biệt", "Cảm ơn", "Không sao"], correct: 1, explanation: "再见 = 再(lại) + 见(gặp) — 'gặp lại sau', cách tạm biệt phổ biến nhất.", level: "hsk1" },
  { id: "h1_17", type: "fill_blank", question: "我___学生 = Tôi là học sinh", chinese: "我___学生", options: ["是", "有", "在", "很"], correct: 0, explanation: "是 (shì) = là — động từ nối cơ bản nhất: 我是学生 = Tôi là học sinh.", level: "hsk1" },
  { id: "h1_18", type: "choose_char", question: "Chữ nào có nghĩa là 'người'?", options: ["人", "入", "八", "大"], correct: 0, explanation: "人 (rén) = người — tượng hình dáng người đứng. Cẩn thận nhầm với 入(vào) và 八(số 8).", level: "hsk1" },
];
const HSK2_EXTRA3: Question[] = [
  { id: "h2_16", type: "meaning", question: "为什么 (wèishénme) nghĩa là gì?", options: ["Cái gì", "Tại sao", "Ở đâu", "Khi nào"], correct: 1, explanation: "为什么 = tại sao. 为(vì) + 什么(cái gì) = 'vì cái gì'. Trả lời bằng 因为... (bởi vì...).", level: "hsk2" },
  { id: "h2_17", type: "fill_blank", question: "今天比昨天___ = Hôm nay nóng hơn hôm qua", chinese: "今天比昨天___", options: ["热", "冷", "好", "忙"], correct: 0, explanation: "Cấu trúc so sánh A 比 B + tính từ: 今天比昨天热 = hôm nay nóng hơn hôm qua. 热 (rè) = nóng.", level: "hsk2" },
  { id: "h2_18", type: "pinyin", question: "Pinyin của 睡觉 (ngủ) là gì?", options: ["shuìjiào", "shuǐjiǎo", "shuìjiǎo", "suìjiào"], correct: 0, explanation: "睡觉 (shuìjiào) = ngủ, cả hai âm thanh 4. Đừng nhầm 水饺 (shuǐjiǎo) = bánh chẻo nước!", level: "hsk2" },
];
const HSK3_EXTRA3: Question[] = [
  { id: "h3_16", type: "meaning", question: "越来越 (yuèláiyuè) diễn đạt điều gì?", options: ["So sánh nhất", "Ngày càng... (mức độ tăng dần)", "Vừa... vừa...", "Càng... càng..."], correct: 1, explanation: "越来越 + tính từ = ngày càng... VD: 天气越来越冷 = trời ngày càng lạnh. Khác 越...越... (càng A càng B).", level: "hsk3" },
  { id: "h3_17", type: "fill_blank", question: "我把作业___完了 = Tôi đã làm xong bài tập", chinese: "我把作业___完了", options: ["做", "干", "办", "弄"], correct: 0, explanation: "Câu chữ 把: 把 + tân ngữ + động từ + kết quả. 做作业 = làm bài tập → 我把作业做完了.", level: "hsk3" },
  { id: "h3_18", type: "meaning", question: "马马虎虎 (mǎmǎhūhū) nghĩa là gì?", options: ["Nhanh như ngựa", "Tàm tạm / qua loa", "Rất cẩn thận", "Nguy hiểm"], correct: 1, explanation: "马马虎虎 = tàm tạm, làng nhàng, qua loa. Trả lời khiêm tốn khi được khen: 马马虎虎啦!", level: "hsk3" },
];
const HSK4_EXTRA3: Question[] = [
  { id: "h4_16", type: "meaning", question: "不但...而且... nghĩa là gì?", options: ["Dù... nhưng...", "Không những... mà còn...", "Hoặc... hoặc...", "Vì... nên..."], correct: 1, explanation: "不但 A 而且 B = không những A mà còn B — cấu trúc tăng tiến. VD: 她不但聪明，而且很努力。", level: "hsk4" },
  { id: "h4_17", type: "choose_char", question: "Từ nào nghĩa là 'trải nghiệm / từng trải qua'?", options: ["经历", "经济", "已经", "经常"], correct: 0, explanation: "经历 (jīnglì) = trải nghiệm. Cùng chữ 经: 经济(kinh tế), 已经(đã), 经常(thường xuyên) — phân biệt bằng chữ sau.", level: "hsk4" },
  { id: "h4_18", type: "meaning", question: "入乡随俗 (rù xiāng suí sú) khuyên điều gì?", options: ["Về quê lập nghiệp", "Nhập gia tùy tục — theo phong tục nơi mình đến", "Đi xa phải nhớ nhà", "Sống giản dị"], correct: 1, explanation: "入乡随俗 = vào làng theo tục — tương đương 'nhập gia tùy tục' tiếng Việt. Dùng khi nói về thích nghi văn hóa.", level: "hsk4" },
];
const HSK5_EXTRA3: Question[] = [
  { id: "h5_16", type: "meaning", question: "恨不得 (hènbude) diễn đạt cảm xúc gì?", options: ["Căm ghét ai đó", "Ước gì làm được ngay (nóng lòng)", "Hối hận", "Không nỡ"], correct: 1, explanation: "恨不得 = hận chẳng thể — nóng lòng muốn làm ngay điều gì. VD: 我恨不得马上回家 = chỉ ước được về nhà ngay.", level: "hsk5" },
  { id: "h5_17", type: "fill_blank", question: "他说得___，大家都被感动了 = Anh ấy nói cảm động đến mức ai cũng xúc động", chinese: "他说得___", options: ["很快", "那么动人", "不错", "很大声"], correct: 1, explanation: "Bổ ngữ trình độ 得: động từ + 得 + mô tả. 动人 (dòngrén) = cảm động lòng người.", level: "hsk5" },
  { id: "h5_18", type: "meaning", question: "明月几时有？把酒问青天 — câu mở đầu bài từ của ai?", options: ["Lý Bạch", "Tô Thức (Tô Đông Pha)", "Đỗ Phủ", "Vương Duy"], correct: 1, explanation: "《水调歌头》của Tô Thức — bài từ Trung thu nổi tiếng nhất, sau thành bài hát 但愿人长久.", level: "hsk5" },
];
const HSK6_EXTRA3: Question[] = [
  { id: "h6_16", type: "meaning", question: "亡羊补牢，犹未为晚 — dạy điều gì?", options: ["Nuôi cừu phải làm chuồng", "Mất bò mới lo làm chuồng — sửa sai muộn vẫn hơn không", "Đừng nuôi gia súc", "Phòng bệnh hơn chữa bệnh"], correct: 1, explanation: "亡羊补牢 (Chiến Quốc sách) = mất cừu mới sửa chuồng — nhận lỗi và sửa ngay thì chưa muộn.", level: "hsk6" },
  { id: "h6_17", type: "choose_char", question: "Thành ngữ nào tả 'kiên trì làm việc lớn từ việc nhỏ'?", options: ["愚公移山", "画蛇添足", "守株待兔", "杯弓蛇影"], correct: 0, explanation: "愚公移山 (Ngu Công dời núi) — kiên trì phi thường ắt thành. 3 thành ngữ còn lại đều mang nghĩa chê.", level: "hsk6" },
  { id: "h6_18", type: "meaning", question: "落霞与孤鹜齐飞，秋水共长天一色 — của ai, trong bài nào?", options: ["Vương Bột — Đằng Vương các tự", "Lý Bạch — Tương tiến tửu", "Thôi Hiệu — Hoàng Hạc lâu", "Đào Uyên Minh — Quy khứ lai từ"], correct: 0, explanation: "Câu thiên cổ tuyệt cú trong 《滕王阁序》 của Vương Bột: ráng chiều cùng cò lẻ song phi, nước thu in trời thành một sắc.", level: "hsk6" },
];

const QUESTION_BANK: Record<string, Question[]> = {
  hsk1: [...HSK1_QUESTIONS, ...HSK1_EXTRA, ...HSK1_EXTRA2, ...HSK1_EXTRA3],
  hsk2: [...HSK2_QUESTIONS, ...HSK2_EXTRA, ...HSK2_EXTRA2, ...HSK2_EXTRA3],
  hsk3: [...HSK3_QUESTIONS, ...HSK3_EXTRA, ...HSK3_EXTRA2, ...HSK3_EXTRA3],
  hsk4: [...HSK4_QUESTIONS, ...HSK4_EXTRA, ...HSK4_EXTRA2, ...HSK4_EXTRA3],
  hsk5: [...HSK5_QUESTIONS, ...HSK5_EXTRA, ...HSK5_EXTRA2, ...HSK5_EXTRA3],
  hsk6: [...HSK6_QUESTIONS, ...HSK6_EXTRA, ...HSK6_EXTRA2, ...HSK6_EXTRA3],
};

/** Mỗi đề thi: chọn ngẫu nhiên 10 câu từ ngân hàng (15 câu) → lần nào cũng mới. */
const QUIZ_SIZE = 10;

const LEVEL_CONFIG = [
  { level: "hsk1", label: "HSK 1", emoji: "🌱", color: "from-green-500/20 to-emerald-500/10", border: "border-green-500/30", desc: "Cơ bản · 10 câu · 5 phút" },
  { level: "hsk2", label: "HSK 2", emoji: "🌿", color: "from-teal-500/20 to-green-500/10", border: "border-teal-500/30", desc: "Sơ cấp · 10 câu · 8 phút" },
  { level: "hsk3", label: "HSK 3", emoji: "🌸", color: "from-blue-500/20 to-sky-500/10", border: "border-blue-500/30", desc: "Trung cấp · 10 câu · 8 phút" },
  { level: "hsk4", label: "HSK 4", emoji: "🌺", color: "from-purple-500/20 to-violet-500/10", border: "border-purple-500/30", desc: "Trung cao · 10 câu · 10 phút" },
  { level: "hsk5", label: "HSK 5", emoji: "🔥", color: "from-orange-500/20 to-red-500/10", border: "border-orange-500/30", desc: "Cao cấp · 10 câu · 10 phút" },
  { level: "hsk6", label: "HSK 6", emoji: "👑", color: "from-rose-500/20 to-pink-500/10", border: "border-rose-500/30", desc: "Tinh thông · 10 câu · 12 phút" },
];

const TIME_LIMITS: Record<string, number> = { hsk1: 300, hsk2: 480, hsk3: 480, hsk4: 600, hsk5: 600, hsk6: 720 };

type Phase = "select" | "test" | "result";

export default function TestPage() {
  const { awardXP } = useProgress();
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [chosenIdx, setChosenIdx] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Timer
  useEffect(() => {
    if (phase !== "test" || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  const finishTest = () => {
    const correct = answers.filter((a, i) => a === questions[i]?.correct).length;
    // Lưu lịch sử điểm (localStorage) → biểu đồ tiến bộ ở /progress
    recordTestResult({ level: selectedLevel, score: correct, total: questions.length });
    // Đo engagement thi cử (analytics first-party)
    trackEvent("test_completed");
    if (questions.length > 0 && correct === questions.length) trackEvent("test_perfect");
    // XP: 5 per correct answer, tối thiểu 10 XP để encourage hoàn thành
    awardXP(Math.max(10, correct * 5), "HSK mock test");
    setPhase("result");
  };

  useEffect(() => {
    if (phase === "test" && timeLeft === 0 && currentQ < questions.length) {
      finishTest();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const startTest = (level: string) => {
    // Trộn ngân hàng soạn tay với câu sinh động từ kho từ vựng (580+ từ)
    // → mỗi lần thi luôn gặp câu mới, ôn được toàn bộ kho thay vì 15 câu cứng.
    const levelNum = Number(level.replace("hsk", "")) || 1;
    const generated = generateVocabQuestions(HSK_DATA[levelNum] ?? [], level, QUIZ_SIZE);
    const pool = [...(QUESTION_BANK[level] ?? []), ...generated];
    const qs = shuffle(pool).slice(0, QUIZ_SIZE);
    setSelectedLevel(level);
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(null));
    setCurrentQ(0);
    setTimeLeft(TIME_LIMITS[level] ?? 300);
    setChosenIdx(null);
    setShowExplanation(false);
    setPhase("test");
  };

  const handleAnswer = (idx: number) => {
    if (chosenIdx !== null) return;
    setChosenIdx(idx);
    setAnswers(prev => { const a = [...prev]; a[currentQ] = idx; return a; });
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQ >= questions.length - 1) {
      finishTest();
    } else {
      setCurrentQ(q => q + 1);
      setChosenIdx(null);
      setShowExplanation(false);
    }
  };

  const score = answers.filter((a, i) => a === questions[i]?.correct).length;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const config = LEVEL_CONFIG.find(c => c.level === selectedLevel);

  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto pb-24">
      <AnimatePresence mode="wait">

        {/* ─── SELECT LEVEL ─── */}
        {phase === "select" && (
          <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={18} className="text-mm-red" />
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Đề thi thử</p>
              </div>
              <h1 className="font-playfair text-2xl font-bold">Mock HSK Test 📝</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">Chọn cấp độ để bắt đầu luyện đề</p>
            </div>

            <div className="space-y-3">
              {LEVEL_CONFIG.map((cfg, i) => (
                <motion.button
                  key={cfg.level}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => startTest(cfg.level)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl text-left",
                    "bg-gradient-to-r border transition-all active:scale-95",
                    cfg.color, cfg.border
                  )}
                >
                  <span className="text-3xl">{cfg.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold">{cfg.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{cfg.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-[var(--text-muted)]" />
                </motion.button>
              ))}
            </div>

            <div className="mt-6 bg-surface rounded-2xl p-4 border border-[rgba(255,255,255,0.06)]">
              <p className="text-xs text-[var(--text-muted)] mb-2">📌 Hướng dẫn</p>
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• Mỗi đề có 5 câu trắc nghiệm</li>
                <li>• Đọc giải thích sau mỗi câu để học sâu hơn</li>
                <li>• Có đếm ngược thời gian</li>
                <li>• Kết quả hiển thị chi tiết từng câu</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* ─── TEST ─── */}
        {phase === "test" && questions[currentQ] && (
          <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-medium">{config?.label} · Câu {currentQ + 1}/{questions.length}</span>
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-bold",
                timeLeft < 30 ? "bg-red-500/20 text-red-400" : "bg-surface2 text-[var(--text-secondary)]"
              )}>
                <Timer size={13} />
                {fmtTime(timeLeft)}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-surface2 rounded-full mb-5">
              <div
                className="h-full bg-mm-red rounded-full transition-all duration-300"
                style={{ width: `${((currentQ) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div className="bg-surface rounded-3xl p-5 mb-4 border border-[rgba(255,255,255,0.07)]">
              {questions[currentQ].chinese && (
                <p className="font-noto text-4xl text-center mb-3 text-mm-gold">{questions[currentQ].chinese}</p>
              )}
              <p className="text-base font-medium leading-relaxed">{questions[currentQ].question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2 mb-4">
              {questions[currentQ].options.map((opt, i) => {
                const isCorrect = i === questions[currentQ].correct;
                const isChosen = i === chosenIdx;
                let bg = "bg-surface border-[rgba(255,255,255,0.08)]";
                if (chosenIdx !== null) {
                  if (isCorrect) bg = "bg-emerald-500/20 border-emerald-500/40";
                  else if (isChosen) bg = "bg-red-500/20 border-red-500/40";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={chosenIdx !== null}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all",
                      bg,
                      chosenIdx === null && "active:scale-[0.98] hover:border-mm-red/30"
                    )}
                  >
                    <span className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                      chosenIdx !== null && isCorrect ? "bg-emerald-500 text-white" :
                      chosenIdx !== null && isChosen ? "bg-red-500 text-white" :
                      "bg-surface2 text-[var(--text-muted)]"
                    )}>
                      {chosenIdx !== null ? (isCorrect ? "✓" : isChosen ? "✗" : String.fromCharCode(65 + i)) : String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm">{opt}</span>
                    {chosenIdx !== null && isCorrect && <CheckCircle2 size={16} className="ml-auto text-emerald-400" />}
                    {chosenIdx !== null && isChosen && !isCorrect && <XCircle size={16} className="ml-auto text-red-400" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-mm-gold/10 border border-mm-gold/20 rounded-2xl p-4 mb-4"
                >
                  <p className="text-xs text-mm-gold font-semibold mb-1">💡 Giải thích</p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {questions[currentQ].explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {chosenIdx !== null && (
              <button
                onClick={nextQuestion} aria-label="Câu tiếp theo"
                className="w-full py-3 rounded-2xl bg-mm-red text-white font-semibold flex items-center justify-center gap-2"
              >
                {currentQ >= questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}
                <ChevronRight size={16} />
              </button>
            )}
          </motion.div>
        )}

        {/* ─── RESULT ─── */}
        {phase === "result" && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            {/* Score ring */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-mm-red mb-3">
                <div>
                  <p className="text-3xl font-bold text-mm-red">{score}/{questions.length}</p>
                  <p className="text-xs text-[var(--text-muted)]">{pct}%</p>
                </div>
              </div>
              <h2 className="font-playfair text-2xl font-bold mb-1">
                {pct === 100 ? "Tuyệt đối! 💯" : pct >= 80 ? "Xuất sắc! 🏆" : pct >= 60 ? "Khá tốt! 🌸" : "Cần ôn thêm 💪"}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                {config?.label} · {pct >= 80 ? "Bạn đã nắm vững level này!" : "Xem lại phần giải thích để học sâu hơn."}
              </p>

              {/* Confetti emoji khi đạt 100% — nhẹ, không thêm dependency */}
              {pct === 100 && (
                <div className="pointer-events-none relative h-0" aria-hidden>
                  {["🎉", "✨", "🎊", "💮", "🌸", "⭐", "🎉", "✨"].map((e, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: -10, x: 0 }}
                      animate={{ opacity: [0, 1, 1, 0], y: 90 + (i % 3) * 30, x: (i - 3.5) * 34, rotate: (i % 2 ? 1 : -1) * 120 }}
                      transition={{ duration: 1.6, delay: i * 0.08, ease: "easeOut" }}
                      className="absolute left-1/2 text-xl"
                    >
                      {e}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Khoe thành tích (growth loop) — điểm cao mới đáng khoe */}
              {pct >= 80 && (
                <div className="mt-4 flex justify-center">
                  <ShareCard quote={{
                    _id: `test-${selectedLevel}-${score}of${questions.length}`, // deterministic — tránh Date.now() trong render
                    chinese_text: pct === 100 ? "满分！" : "高分通过！",
                    pinyin: pct === 100 ? "mǎn fēn!" : "gāo fēn tōng guò!",
                    translation: `Mình vừa đạt ${score}/${questions.length} (${pct}%) đề thi thử ${config?.label} trên MandoMood 🎓`,
                    mood: "motivation",
                    author: "MandoMood · Thi thử HSK",
                  }} />
                </div>
              )}
            </div>

            {/* Detailed review */}
            <div className="space-y-3 mb-5">
              {questions.map((q, i) => {
                const userAns = answers[i];
                const isRight = userAns === q.correct;
                return (
                  <div key={q.id} className={cn(
                    "rounded-2xl p-4 border",
                    isRight ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
                  )}>
                    <div className="flex items-start gap-3">
                      {isRight ? <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" /> : <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">Câu {i + 1}: {q.question}</p>
                        {!isRight && userAns !== null && (
                          <p className="text-xs text-red-400 mb-1">Bạn chọn: {q.options[userAns]}</p>
                        )}
                        {!isRight && (
                          <p className="text-xs text-emerald-400 mb-1">Đáp án đúng: {q.options[q.correct]}</p>
                        )}
                        <p className="text-xs text-[var(--text-muted)]">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => startTest(selectedLevel)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-mm-red text-white font-semibold"
              >
                <RotateCcw size={16} /> Làm lại
              </button>
              <button
                onClick={() => setPhase("select")}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-[rgba(255,255,255,0.1)] text-sm"
              >
                <Trophy size={16} /> Chọn level khác
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
