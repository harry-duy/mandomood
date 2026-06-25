/**
 * characters.ts — Danh sách CHỮ HÁN tuyển chọn theo cảm xúc (trang /characters).
 *
 * Tách ra lib dùng chung để:
 *  - /characters (client) render lưới chữ.
 *  - sitemap.ts (server) liệt kê /character/<hanzi> cho Google index (SEO long-tail:
 *    "chữ 爱 nghĩa là gì", "học chữ 心"…). Mỗi trang chữ đã có generateMetadata riêng.
 */

export type CharCategory = "heart" | "fate" | "pain" | "peace" | "strength";

export interface CharacterEntry {
  hanzi: string;
  pinyin: string;
  meaning: string;
  category: CharCategory;
  hsk: number;
  emotional_hook: string;
}

export const CHARACTERS: CharacterEntry[] = [
  // Tình yêu & Tim
  { hanzi: "爱", pinyin: "ài", meaning: "tình yêu", category: "heart", hsk: 2, emotional_hook: "3 chữ mà triệu người sợ nói" },
  { hanzi: "心", pinyin: "xīn", meaning: "trái tim", category: "heart", hsk: 3, emotional_hook: "Gốc rễ của mọi cảm xúc" },
  { hanzi: "情", pinyin: "qíng", meaning: "tình cảm", category: "heart", hsk: 3, emotional_hook: "Một chữ, ngàn loại tình" },
  { hanzi: "念", pinyin: "niàn", meaning: "nỗi nhớ", category: "heart", hsk: 4, emotional_hook: "Nhớ ai đó không dứt được" },
  { hanzi: "惜", pinyin: "xī", meaning: "tiếc thương", category: "heart", hsk: 4, emotional_hook: "Tiếc vì không giữ được" },
  { hanzi: "暖", pinyin: "nuǎn", meaning: "ấm áp", category: "heart", hsk: 3, emotional_hook: "Cảm giác được quan tâm" },
  // Duyên phận & Số phận
  { hanzi: "缘", pinyin: "yuán", meaning: "duyên phận", category: "fate", hsk: 5, emotional_hook: "Sợi chỉ đỏ vô hình" },
  { hanzi: "梦", pinyin: "mèng", meaning: "giấc mơ", category: "fate", hsk: 4, emotional_hook: "Thế giới chỉ ta được nhìn" },
  { hanzi: "望", pinyin: "wàng", meaning: "trông mong", category: "fate", hsk: 4, emotional_hook: "Nhìn xa và mong chờ" },
  { hanzi: "盼", pinyin: "pàn", meaning: "mong chờ", category: "fate", hsk: 5, emotional_hook: "Đôi mắt hướng về phía trước" },
  { hanzi: "归", pinyin: "guī", meaning: "trở về", category: "fate", hsk: 4, emotional_hook: "Con đường về nhà" },
  // Nỗi đau & Chia ly
  { hanzi: "泪", pinyin: "lèi", meaning: "nước mắt", category: "pain", hsk: 5, emotional_hook: "Nước từ mắt — thơ nhất tiếng Trung" },
  { hanzi: "别", pinyin: "bié", meaning: "chia tay", category: "pain", hsk: 2, emotional_hook: "Đừng đi / tạm biệt" },
  { hanzi: "痛", pinyin: "tòng", meaning: "đau", category: "pain", hsk: 4, emotional_hook: "Đau thân xác và tâm hồn" },
  { hanzi: "散", pinyin: "sàn", meaning: "tan biến", category: "pain", hsk: 4, emotional_hook: "Khi tất cả rời đi" },
  { hanzi: "孤", pinyin: "gū", meaning: "cô đơn", category: "pain", hsk: 5, emotional_hook: "Một mình trên đời" },
  { hanzi: "哭", pinyin: "kū", meaning: "khóc", category: "pain", hsk: 3, emotional_hook: "Cảm xúc không thể giữ lại" },
  // Bình yên & Nội tâm
  { hanzi: "静", pinyin: "jìng", meaning: "bình yên", category: "peace", hsk: 3, emotional_hook: "Trạng thái cả đời tìm kiếm" },
  { hanzi: "思", pinyin: "sī", meaning: "suy nghĩ", category: "peace", hsk: 4, emotional_hook: "Trái tim hướng về quê nhà" },
  { hanzi: "寂", pinyin: "jì", meaning: "cô tịch", category: "peace", hsk: 5, emotional_hook: "Yên lặng đến mức cảm được" },
  { hanzi: "真", pinyin: "zhēn", meaning: "chân thật", category: "peace", hsk: 2, emotional_hook: "Điều quý giá nhất" },
  // Sức mạnh & Kiên định
  { hanzi: "忍", pinyin: "rěn", meaning: "nhẫn nại", category: "strength", hsk: 5, emotional_hook: "Dao trên tim vẫn không gục" },
  { hanzi: "勇", pinyin: "yǒng", meaning: "dũng cảm", category: "strength", hsk: 4, emotional_hook: "Sức mạnh có hướng" },
  { hanzi: "笑", pinyin: "xiào", meaning: "nụ cười", category: "strength", hsk: 2, emotional_hook: "Vũ khí mạnh nhất" },
  { hanzi: "懂", pinyin: "dǒng", meaning: "thấu hiểu", category: "strength", hsk: 3, emotional_hook: "Được hiểu = hạnh phúc" },
  { hanzi: "陪", pinyin: "péi", meaning: "đồng hành", category: "strength", hsk: 3, emotional_hook: "Có người ở bên cạnh" },
  { hanzi: "美", pinyin: "měi", meaning: "vẻ đẹp", category: "strength", hsk: 2, emotional_hook: "Cừu đội mũ lớn — thuần khiết" },
  { hanzi: "悟", pinyin: "wù", meaning: "giác ngộ, hiểu ra", category: "peace", hsk: 5, emotional_hook: "Khoảnh khắc chợt hiểu sau bao năm tìm kiếm" },
  { hanzi: "福", pinyin: "fú", meaning: "hạnh phúc, may mắn", category: "strength", hsk: 4, emotional_hook: "Hạnh phúc không tìm mà đến" },
];
