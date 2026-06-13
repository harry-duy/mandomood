/**
 * /chiet-tu — Chiết tự chữ Hán
 * Phân tích thành phần + bộ thủ + câu chuyện nhớ chữ
 * Cảm hứng từ nhaikanji.com (Chiết tự Kanji)
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Search, ChevronDown, Volume2, BookOpen, Sparkles } from "lucide-react";
import { playTTS } from "@/hooks/useTTS";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";

interface Component {
  char: string;
  meaning: string;
  role: string; // "radical" | "phonetic" | "semantic"
  note?: string;
}

interface ChietTuEntry {
  hanzi: string;
  pinyin: string;
  tone: number;
  meaning: string;
  strokes: number;
  hsk: number;
  radical: string;
  radical_meaning: string;
  components: Component[];
  decomposition_story: string; // Câu chuyện nhớ chữ qua chiết tự
  emotional_hook: string;
  category: string;
  related: string[];
}

const CHIET_TU_DATA: ChietTuEntry[] = [
  {
    hanzi: "爱", pinyin: "ài", tone: 4, meaning: "Tình yêu, yêu thương", strokes: 10, hsk: 1,
    radical: "爪", radical_meaning: "Bàn tay/móng vuốt",
    components: [
      { char: "爫", meaning: "Bàn tay từ trên", role: "semantic", note: "Tay người chìa ra yêu thương" },
      { char: "冖", meaning: "Che phủ", role: "semantic", note: "Bao bọc, ôm ấp" },
      { char: "心", meaning: "Trái tim", role: "semantic", note: "Tình yêu xuất phát từ tim" },
      { char: "友", meaning: "Bạn bè", role: "semantic", note: "Hữu nghị, gắn kết" },
    ],
    decomposition_story: "爱 = Bàn tay (爫) từ trên che phủ (冖) trái tim (心) của người bạn (友). Tình yêu là khi bạn dùng đôi tay che chở trái tim của người mình yêu.",
    emotional_hook: "Người ta nói 爱 mà không có 心 (tim) là 爱 giả dối — vì chữ phồn thể 愛 có tim ở giữa, còn giản thể bỏ đi... nhắc ta: yêu thật sự phải có tâm.",
    category: "Tình cảm",
    related: ["心", "情", "恋", "友"],
  },
  {
    hanzi: "情", pinyin: "qíng", tone: 2, meaning: "Tình cảm, cảm xúc", strokes: 11, hsk: 2,
    radical: "忄", radical_meaning: "Tim (bên trái)",
    components: [
      { char: "忄", meaning: "Tim (dạng bên)", role: "radical", note: "忄= 心 viết bên trái — cảm xúc từ trái tim" },
      { char: "青", meaning: "Xanh lam, trong sáng", role: "phonetic", note: "Đọc gần âm 'qīng', cũng gợi sự trong sáng của cảm xúc" },
    ],
    decomposition_story: "情 = Tim (忄) + Xanh/Trong sáng (青). Cảm xúc thật sự giống như màu xanh của bầu trời — trong veo và không thể giả tạo.",
    emotional_hook: "Trong tiếng Trung, 感情 (gǎnqíng) là tình cảm sâu sắc, còn 表情 (biǎoqíng) là biểu cảm khuôn mặt — 情 có mặt ở khắp nơi khi nói về con tim.",
    category: "Tình cảm",
    related: ["爱", "心", "感", "恋"],
  },
  {
    hanzi: "心", pinyin: "xīn", tone: 1, meaning: "Tim, tâm hồn", strokes: 4, hsk: 1,
    radical: "心", radical_meaning: "Tim",
    components: [
      { char: "心", meaning: "Tim đập", role: "radical", note: "3 nét gợi hình tim — 2 nét nhỏ là máu chảy hai bên, nét cong lớn là tim" },
    ],
    decomposition_story: "心 là một trong những chữ tượng hình đẹp nhất — 4 nét phác họa trái tim đang đập: nét cong lớn là tim, hai chấm nhỏ là nhịp đập bên trái và phải.",
    emotional_hook: "心 xuất hiện trong hàng trăm chữ Hán: 想(nhớ) 忘(quên) 恨(hận) 爱(yêu) — vì người Trung Hoa xưa tin mọi cảm xúc đều xuất phát từ tim, không phải não.",
    category: "Cơ thể & Tâm hồn",
    related: ["爱", "情", "忘", "想"],
  },
  {
    hanzi: "缘", pinyin: "yuán", tone: 2, meaning: "Duyên phận, mối liên kết", strokes: 12, hsk: 4,
    radical: "纟", radical_meaning: "Tơ lụa/sợi chỉ",
    components: [
      { char: "纟", meaning: "Sợi tơ", role: "radical", note: "Duyên phận như sợi chỉ đỏ buộc hai người" },
      { char: "彖", meaning: "Lợn rừng/dự đoán", role: "phonetic", note: "Cho âm yuán — cũng gợi ý 'điều được định sẵn'" },
    ],
    decomposition_story: "缘 = Sợi tơ (纟) + Điều định sẵn (彖). Duyên phận là sợi tơ vô hình nối hai người lại — như sợi chỉ đỏ (红线) trong truyền thuyết Trung Hoa.",
    emotional_hook: "Câu nói 'Có 缘 mà không có phận thì cũng không thành' — 缘 là gặp được nhau, nhưng 分 (phận) mới quyết định có ở lại hay không.",
    category: "Định mệnh",
    related: ["份", "命", "遇", "牵"],
  },
  {
    hanzi: "忘", pinyin: "wàng", tone: 4, meaning: "Quên lãng", strokes: 7, hsk: 3,
    radical: "心", radical_meaning: "Tim",
    components: [
      { char: "亡", meaning: "Chết, mất đi", role: "semantic", note: "Điều đã mất, không còn nữa" },
      { char: "心", meaning: "Trái tim", role: "radical", note: "Tim không còn giữ lại nữa" },
    ],
    decomposition_story: "忘 = Mất đi (亡) + Tim (心). Quên là khi trái tim để cho ký ức 'chết' — 亡 ở trên 心, như cái chết đè lên trái tim, xóa đi cảm xúc.",
    emotional_hook: "忘不了 (wàng bù liǎo) — 'không thể quên' là câu được dùng nhiều nhất trong nhạc C-pop. Vì có những người dù tim muốn 亡 đi... vẫn không thể.",
    category: "Ký ức",
    related: ["心", "记", "念", "思"],
  },
  {
    hanzi: "思", pinyin: "sī", tone: 1, meaning: "Suy nghĩ, nhớ nhung", strokes: 9, hsk: 3,
    radical: "心", radical_meaning: "Tim",
    components: [
      { char: "田", meaning: "Ruộng đất, não", role: "semantic", note: "Người xưa nghĩ não có hình dạng như ruộng có ô" },
      { char: "心", meaning: "Trái tim", role: "radical", note: "Nhớ là từ tim chứ không chỉ từ não" },
    ],
    decomposition_story: "思 = Ruộng/Não (田) + Tim (心). Suy nghĩ là khi não (田) và tim (心) hoạt động cùng nhau — người Trung Hoa xưa tin 'nhớ thương' cần cả lý trí lẫn cảm xúc.",
    emotional_hook: "思念 (sīniàn) = nhớ nhung | 思考 (sīkǎo) = suy nghĩ | 相思 (xiāngsī) = tương tư. Chữ 思 ôm trọn cả lý trí lẫn con tim.",
    category: "Ký ức",
    related: ["念", "想", "忆", "心"],
  },
  {
    hanzi: "美", pinyin: "měi", tone: 3, meaning: "Đẹp, vẻ đẹp", strokes: 9, hsk: 2,
    radical: "羊", radical_meaning: "Con dê",
    components: [
      { char: "羊", meaning: "Con dê (to, béo)", role: "semantic", note: "Dê béo = quý giá = đẹp trong mắt người xưa" },
      { char: "大", meaning: "To lớn", role: "semantic", note: "To lớn, đầy đặn" },
    ],
    decomposition_story: "美 = Dê (羊) + To lớn (大). Theo quan niệm người Trung Hoa cổ đại, một con dê to béo là hình ảnh của sự sung túc và vẻ đẹp — 'con dê lớn nhất bầy là đẹp nhất'.",
    emotional_hook: "Thú vị là 美 (đẹp) và 善 (tốt lành) đều có chữ 羊 — vì dê là con vật biểu tượng cho sự hiền lành, sung túc và hoàn hảo trong văn hóa Trung Hoa.",
    category: "Vẻ đẹp",
    related: ["善", "好", "艳", "丽"],
  },
  {
    hanzi: "泪", pinyin: "lèi", tone: 4, meaning: "Nước mắt", strokes: 8, hsk: 4,
    radical: "氵", radical_meaning: "Nước",
    components: [
      { char: "氵", meaning: "Nước", role: "radical", note: "3 chấm nước — nước mắt là nước" },
      { char: "目", meaning: "Con mắt", role: "semantic", note: "Mắt — nơi nước mắt chảy ra" },
    ],
    decomposition_story: "泪 = Nước (氵) + Mắt (目). Đơn giản và thơ mộng: nước mắt là 'nước từ mắt'. Chỉ 8 nét nhưng chứa đựng cả một biển cảm xúc.",
    emotional_hook: "热泪 (rèlèi) = nước mắt nóng hổi | 泪水 (lèishuǐ) = nước mắt | 含泪 (hánlèi) = ngậm nước mắt. Người Trung không hay khóc trước mặt người khác — nhưng khi 泪 rơi, đó là cảm xúc thật nhất.",
    category: "Cảm xúc",
    related: ["哭", "悲", "伤", "目"],
  },
  {
    hanzi: "梦", pinyin: "mèng", tone: 4, meaning: "Giấc mơ", strokes: 11, hsk: 3,
    radical: "夕", radical_meaning: "Đêm tối/buổi chiều",
    components: [
      { char: "苜", meaning: "Cây cỏ rậm rạp", role: "semantic", note: "Hỗn độn, không rõ ràng như giấc mơ" },
      { char: "夕", meaning: "Đêm/chiều tối", role: "radical", note: "Giấc mơ xảy ra vào ban đêm" },
    ],
    decomposition_story: "梦 = Cây cỏ rậm (苜) + Đêm (夕). Giấc mơ như khu rừng rậm trong đêm tối — hỗn độn, mơ hồ, khó nắm bắt. Người ta 'lạc' trong giấc mơ như lạc trong rừng đêm.",
    emotional_hook: "梦想 (mèngxiǎng) = ước mơ lý tưởng | 做梦 (zuòmèng) = nằm mơ | 白日梦 (báirìmèng) = mơ ban ngày. Người Trung hay nói 'Đừng làm 白日梦' — nhắc nhở đừng mơ mộng viển vông.",
    category: "Tâm hồn",
    related: ["想", "幻", "睡", "夜"],
  },
  {
    hanzi: "归", pinyin: "guī", tone: 1, meaning: "Trở về, trở lại", strokes: 5, hsk: 4,
    radical: "彐", radical_meaning: "Tay cầm/chỉ hướng",
    components: [
      { char: "彐", meaning: "Tay chỉ hướng", role: "radical", note: "Hướng về nhà" },
      { char: "刀", meaning: "Con dao", role: "semantic", note: "Người lính về nhà mang theo vũ khí" },
    ],
    decomposition_story: "归 hình ảnh người lính (dao/刀) đang chỉ về hướng (彐) nhà — đó là hành trình 'trở về'. Mọi cuộc chia ly đều hướng đến một chữ 归.",
    emotional_hook: "落叶归根 — lá rụng về cội. 归 là một trong những chữ cảm xúc nhất trong tiếng Trung — nỗi nhớ nhà (思乡) luôn kết thúc bằng ước muốn 归.",
    category: "Định mệnh",
    related: ["家", "回", "乡", "离"],
  },
  {
    hanzi: "别", pinyin: "bié", tone: 2, meaning: "Chia tay, đừng, khác", strokes: 7, hsk: 1,
    radical: "刂", radical_meaning: "Dao (bên phải)",
    components: [
      { char: "另", meaning: "Khác biệt, sang một bên", role: "semantic", note: "Bước sang con đường khác" },
      { char: "刂", meaning: "Dao/cắt đứt", role: "radical", note: "Cắt đứt mối liên kết" },
    ],
    decomposition_story: "别 = Khác biệt (另) + Dao cắt (刂). Chia tay là dùng dao cắt đứt sợi dây nối hai người, để mỗi người đi một con đường riêng (另). Đau mà không thể tránh.",
    emotional_hook: "离别 (líbié) = chia ly | 告别 (gàobié) = từ biệt | 别了 (bié le) = vĩnh biệt. Kỳ lạ là chữ 别 còn nghĩa là 'đừng' — như tiếng nài nỉ 'đừng đi' trong lúc chia tay.",
    category: "Chia ly",
    related: ["离", "归", "走", "再见"],
  },
  {
    hanzi: "暖", pinyin: "nuǎn", tone: 3, meaning: "Ấm áp, sưởi ấm", strokes: 13, hsk: 3,
    radical: "日", radical_meaning: "Mặt trời",
    components: [
      { char: "日", meaning: "Mặt trời", role: "radical", note: "Nguồn ấm áp từ mặt trời" },
      { char: "爰", meaning: "Nhẹ nhàng, dần dần", role: "phonetic", note: "Cho âm nuǎn — sự ấm áp đến từ từ, không vội" },
    ],
    decomposition_story: "暖 = Mặt trời (日) + Dần dần (爰). Sự ấm áp không đến ồ ạt — nó đến như ánh mặt trời buổi sáng, từ từ, nhẹ nhàng, lan tỏa vào từng ngóc ngách của tâm hồn.",
    emotional_hook: "温暖 (wēnnuǎn) = ấm áp (cả nghĩa đen lẫn bóng) | 暖男 (nuǎnnán) = 'warm boy' — kiểu bạn trai ân cần, quan tâm. Chữ 暖 đang viral trên mạng xã hội Trung Quốc vì Gen Z dùng để nói về người yêu lý tưởng.",
    category: "Cảm xúc",
    related: ["温", "热", "日", "春"],
  },
  {
    hanzi: "孤", pinyin: "gū", tone: 1, meaning: "Cô đơn, lẻ loi", strokes: 8, hsk: 4,
    radical: "子", radical_meaning: "Đứa trẻ/con cái",
    components: [
      { char: "子", meaning: "Đứa trẻ", role: "radical", note: "Một đứa trẻ không cha không mẹ" },
      { char: "瓜", meaning: "Quả bầu/dưa", role: "phonetic", note: "Cho âm gū — quả bầu đơn độc trên dây leo" },
    ],
    decomposition_story: "孤 = Đứa trẻ (子) + Quả bầu/dưa (瓜). Hình ảnh một đứa trẻ mồ côi lẻ loi như quả bầu đơn độc — 孤 ban đầu chỉ trẻ mồ côi, sau mở rộng thành 'cô đơn'.",
    emotional_hook: "孤独 (gūdú) = cô đơn | 孤单 (gūdān) = đơn độc | 天涯孤独 = cô đơn giữa chân trời góc bể. Người Trung Hoa có câu: 孤 không đáng sợ, 孤 mà không 独 mới là vấn đề — cô đơn không phải là tội lỗi.",
    category: "Cảm xúc",
    related: ["独", "寂", "单", "离"],
  },
  {
    hanzi: "真", pinyin: "zhēn", tone: 1, meaning: "Thật, chân thật, thực sự", strokes: 10, hsk: 2,
    radical: "目", radical_meaning: "Mắt",
    components: [
      { char: "匕", meaning: "Thìa/dao nhỏ — biến đổi", role: "semantic", note: "Sự chuyển hóa thành thực" },
      { char: "目", meaning: "Mắt", role: "radical", note: "Điều mắt thấy là thật" },
      { char: "八", meaning: "Số tám — phân tán", role: "semantic", note: "Chân lý lan tỏa ra tám hướng" },
    ],
    decomposition_story: "真 = Điều mắt (目) nhìn thấy và lan tỏa (八) ra khắp nơi là chân lý. Cái gì mắt nhìn thẳng vào được, không phải ảo ảnh, mới là 真 — thật.",
    emotional_hook: "真的 (zhēn de) = thật không? | 认真 (rènzhēn) = nghiêm túc, thật tâm | 真心 (zhēnxīn) = thật lòng. Gen Z hay dùng '你是认真的吗' (bạn nghiêm túc không?) như câu hỏi viral.",
    category: "Triết học",
    related: ["实", "假", "诚", "心"],
  },
  {
    hanzi: "陪", pinyin: "péi", tone: 2, meaning: "Đồng hành, ở bên, bầu bạn", strokes: 10, hsk: 3,
    radical: "阝", radical_meaning: "Gò đất/làng xóm",
    components: [
      { char: "阝", meaning: "Làng/khu vực", role: "radical", note: "Ở trong cùng không gian" },
      { char: "咅", meaning: "Nói ra/nhổ ra", role: "phonetic", note: "Cho âm péi — cũng gợi sự giao tiếp khi bên nhau" },
    ],
    decomposition_story: "陪 = Ở cùng làng (阝) + Chia sẻ lời nói (咅). Đồng hành không chỉ là ở cùng chỗ mà còn là chia sẻ — ngồi bên nhau và nói chuyện với nhau.",
    emotional_hook: "陪伴 (péibàn) = đồng hành, ở cạnh | 陪你 (péi nǐ) = ở bên bạn. Câu 'Tôi sẽ 陪 bạn' trong tiếng Trung nặng hơn 'Tôi yêu bạn' — vì yêu là cảm xúc, còn 陪 là hành động.",
    category: "Tình cảm",
    related: ["伴", "陪伴", "友", "爱"],
  },
  {
    hanzi: "离", pinyin: "lí", tone: 2, meaning: "Rời xa, chia ly, cách biệt", strokes: 10, hsk: 3,
    radical: "隹", radical_meaning: "Chim đuôi ngắn",
    components: [
      { char: "离", meaning: "Con chim vàng anh (li)", role: "radical", note: "Con chim dùng để đặt tên loại chim — sau nghĩa thay đổi sang 'rời đi'" },
      { char: "隹", meaning: "Loại chim", role: "semantic", note: "Chim bay đi = rời xa" },
    ],
    decomposition_story: "离 ban đầu là tên một loài chim đẹp — con chim vàng anh. Nhưng vì chim luôn bay đi, 离 dần mang nghĩa 'rời xa'. Như người ta hay nói: 'Những thứ đẹp nhất thường bay đi sớm nhất.'",
    emotional_hook: "分离 (fēnlí) = chia cắt | 离别 (líbié) = chia ly | 离开 (líkāi) = rời đi. 离 có lẽ là chữ xuất hiện nhiều nhất trong nhạc buồn tiếng Trung — vì không có gì đau bằng khi người mình yêu 离开.",
    category: "Chia ly",
    related: ["别", "归", "走", "远"],
  },
  {
    hanzi: "寂", pinyin: "jì", tone: 4, meaning: "Tĩnh lặng, cô tịch", strokes: 11, hsk: 5,
    radical: "宀", radical_meaning: "Mái nhà",
    components: [
      { char: "宀", meaning: "Mái nhà", role: "radical", note: "Căn nhà yên tĩnh" },
      { char: "叔", meaning: "Chú/người đàn ông trẻ", role: "phonetic", note: "Cho âm jì — người đàn ông về nhà ngồi một mình" },
    ],
    decomposition_story: "寂 = Mái nhà (宀) + Một người (叔). Sự cô tịch là ngồi một mình dưới mái nhà, không có ai bên cạnh. Căn nhà không thiếu chỗ, chỉ thiếu người.",
    emotional_hook: "寂静 (jìjìng) = yên tĩnh | 寂寞 (jìmò) = cô đơn, buồn chán | 空寂 (kōngjì) = trống vắng. Khác với 孤独 (gūdú) là cô đơn từ bên trong, 寂寞 là cô đơn vì thiếu sự hiện diện của người khác.",
    category: "Cảm xúc",
    related: ["静", "孤", "空", "独"],
  },
  {
    hanzi: "望", pinyin: "wàng", tone: 4, meaning: "Trông mong, nhìn xa, hy vọng", strokes: 11, hsk: 3,
    radical: "月", radical_meaning: "Mặt trăng",
    components: [
      { char: "亡", meaning: "Mất đi, vắng mặt", role: "semantic", note: "Người đi xa không còn ở đây" },
      { char: "月", meaning: "Mặt trăng", role: "radical", note: "Nhìn trăng nhớ người" },
      { char: "王", meaning: "Vương/đứng thẳng", role: "semantic", note: "Đứng thẳng nhìn về phía xa" },
    ],
    decomposition_story: "望 = Người mất (亡) + Trăng (月) + Đứng thẳng (王). Hình ảnh: một người đứng thẳng nhìn lên trăng (月), nhớ về người đã xa (亡). Đó là 望 — trông chờ người không còn ở bên.",
    emotional_hook: "期望 (qīwàng) = kỳ vọng | 希望 (xīwàng) = hy vọng | 绝望 (juéwàng) = tuyệt vọng. Và câu thơ muôn đời: '举头望明月，低头思故乡' — ngẩng đầu nhìn trăng sáng, cúi đầu nhớ quê hương.",
    category: "Ký ức",
    related: ["希", "盼", "思", "月"],
  },
  {
    hanzi: "痛", pinyin: "tòng", tone: 4, meaning: "Đau đớn, nỗi đau", strokes: 12, hsk: 3,
    radical: "疒", radical_meaning: "Bệnh tật",
    components: [
      { char: "疒", meaning: "Bệnh/nỗi đau thể xác", role: "radical", note: "Bộ thủ chỉ bệnh tật, tổn thương" },
      { char: "甬", meaning: "Đường ống, chảy mạnh", role: "phonetic", note: "Cho âm tòng — nỗi đau chảy dội như nước qua ống" },
    ],
    decomposition_story: "痛 = Bệnh (疒) + Chảy dội (甬). Nỗi đau như nước chảy mạnh qua đường ống — nó dâng lên, không thể kiểm soát, lan khắp cơ thể và tâm hồn.",
    emotional_hook: "心痛 (xīntòng) = đau lòng | 痛苦 (tòngkǔ) = khổ đau | 痛快 (tòngkuài) = sướng lắm (đau mà sướng!). Thú vị: 痛快 ghép 'đau' với 'vui sướng' — diễn tả cảm giác 'đã' đến mức như đau.",
    category: "Cảm xúc",
    related: ["苦", "伤", "哭", "泪"],
  },
];

const CATEGORIES = ["Tất cả", "Tình cảm", "Chia ly", "Ký ức", "Cảm xúc", "Tâm hồn", "Định mệnh", "Vẻ đẹp", "Cơ thể & Tâm hồn", "Triết học"];
const ROLE_COLOR: Record<string, string> = {
  radical: "bg-mm-red/20 text-mm-red border-mm-red/30",
  phonetic: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  semantic: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};
const ROLE_LABEL: Record<string, string> = {
  radical: "Bộ thủ", phonetic: "Biểu âm", semantic: "Biểu ý"
};

export default function ChietTuPage() {
  const { awardXP } = useProgress();
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [awardedIds] = useState<Set<string>>(new Set());

  const filtered = CHIET_TU_DATA.filter(entry => {
    const matchCat = selectedCategory === "Tất cả" || entry.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || entry.hanzi.includes(q) || entry.pinyin.toLowerCase().includes(q) || entry.meaning.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const toggleExpand = (hanzi: string) => {
    setExpandedId(prev => {
      const opening = prev !== hanzi;
      // Award 5 XP mỗi chữ học lần đầu
      if (opening && !awardedIds.has(hanzi)) {
        awardedIds.add(hanzi);
        awardXP(5, "Chiet tu");
      }
      return opening ? hanzi : null;
    });
  };

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Layers size={18} className="text-mm-gold" />
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Chiết tự</p>
        </div>
        <h1 className="font-playfair text-2xl font-bold">Giải mã chữ Hán 🔍</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Hiểu sâu từng chữ qua bộ thủ, thành phần và câu chuyện nhớ chữ
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-2 mb-5"
      >
        {[
          { label: "Chữ Hán", value: CHIET_TU_DATA.length, color: "text-mm-red" },
          { label: "Bộ thủ", value: new Set(CHIET_TU_DATA.map(e => e.radical)).size, color: "text-mm-gold" },
          { label: "Chủ đề", value: CATEGORIES.length - 1, color: "text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-2xl p-3 text-center border border-[rgba(255,255,255,0.06)]">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm chữ Hán, pinyin, nghĩa..." aria-label="Tìm chữ Hán, pinyin, nghĩa"
          className="w-full bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-mm-red/50"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              selectedCategory === cat ? "bg-mm-gold text-black" : "bg-surface2 text-[var(--text-muted)]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {filtered.map((entry, idx) => {
          const isOpen = expandedId === entry.hanzi;
          return (
            <motion.div
              key={entry.hanzi}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-surface rounded-3xl border border-[rgba(255,255,255,0.07)] overflow-hidden"
            >
              {/* Card header — always visible */}
              <button
                onClick={() => toggleExpand(entry.hanzi)}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                {/* Hanzi big */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mm-red/15 to-mm-gold/10 flex items-center justify-center flex-shrink-0 border border-mm-red/10">
                  <span className="font-noto text-3xl leading-none">{entry.hanzi}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base font-semibold text-mm-gold">{entry.pinyin}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-surface2 text-[var(--text-muted)]">HSK{entry.hsk}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-surface2 text-[var(--text-muted)]">{entry.strokes} nét</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] truncate">{entry.meaning}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-[var(--text-muted)]">Bộ thủ:</span>
                    <span className="text-xs font-medium text-mm-red">{entry.radical}</span>
                    <span className="text-xs text-[var(--text-muted)]">({entry.radical_meaning})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); playTTS(entry.hanzi); }}
                    className="p-1.5 rounded-full hover:bg-surface2 transition-colors"
                  >
                    <Volume2 size={14} className="text-[var(--text-muted)]" />
                  </button>
                  <ChevronDown
                    size={16}
                    className={cn("text-[var(--text-muted)] transition-transform duration-300", isOpen && "rotate-180")}
                  />
                </div>
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-5 space-y-4 border-t border-[rgba(255,255,255,0.06)]">

                      {/* Components breakdown */}
                      <div className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Layers size={13} className="text-mm-gold" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            Thành phần chiết tự
                          </span>
                        </div>
                        <div className="space-y-2">
                          {entry.components.map((comp, ci) => (
                            <div key={ci} className="flex items-start gap-3 bg-surface2 rounded-2xl p-3">
                              <span className="font-noto text-2xl leading-none w-8 text-center">{comp.char}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">{comp.meaning}</span>
                                  <span className={cn("text-xs px-2 py-0.5 rounded-full border", ROLE_COLOR[comp.role])}>
                                    {ROLE_LABEL[comp.role]}
                                  </span>
                                </div>
                                {comp.note && <p className="text-xs text-[var(--text-muted)]">{comp.note}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Decomposition story */}
                      <div className="bg-gradient-to-br from-mm-gold/10 to-mm-red/5 rounded-2xl p-4 border border-mm-gold/15">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={13} className="text-mm-gold" />
                          <span className="text-xs font-semibold text-mm-gold uppercase tracking-wider">Câu chuyện nhớ chữ</span>
                        </div>
                        <p className="text-sm leading-relaxed">{entry.decomposition_story}</p>
                      </div>

                      {/* Emotional hook */}
                      <div className="bg-surface2 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen size={13} className="text-[var(--text-muted)]" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Góc văn hóa & cảm xúc</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{entry.emotional_hook}</p>
                      </div>

                      {/* Related characters */}
                      <div>
                        <p className="text-xs text-[var(--text-muted)] mb-2">Chữ liên quan:</p>
                        <div className="flex gap-2 flex-wrap">
                          {entry.related.map(rel => (
                            <button
                              key={rel}
                              onClick={() => {
                                const found = CHIET_TU_DATA.find(e => e.hanzi === rel);
                                if (found) { setExpandedId(rel); }
                              }}
                              className="font-noto text-lg px-3 py-1.5 rounded-xl bg-surface2 hover:bg-mm-red/15 transition-colors border border-[rgba(255,255,255,0.06)]"
                            >
                              {rel}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <p className="text-4xl mb-3">迷</p>
            <p>Không tìm thấy chữ nào</p>
          </div>
        )}
      </div>
    </main>
  );
}
