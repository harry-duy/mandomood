/**
 * Seed script — them data mau vao MongoDB
 * Chay: npm run seed
 * (sau khi da dien MONGODB_URI vao .env.local)
 */

import mongoose from "mongoose";
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI khong ton tai trong .env.local");
  process.exit(1);
}

const QuoteSchema = new mongoose.Schema({
  chinese_text: String, pinyin: String, translation: String,
  author: String, mood: String, level: String, tags: [String],
  cultural_note: String,
  view_count: { type: Number, default: 0 },
  save_count: { type: Number, default: 0 },
  is_daily: { type: Boolean, default: false },
  daily_date: Date,
}, { timestamps: true });

const LessonSchema = new mongoose.Schema({
  title: String, content_type: String, level: String, mood: String,
  chinese_text: String, pinyin: String, translation: String,
  vocabulary: [{ hanzi: String, pinyin: String, meaning: String, example: String }],
  grammar_notes: String, cultural_note: String,
  is_ai_generated: { type: Boolean, default: false },
  view_count: { type: Number, default: 0 },
  save_count: { type: Number, default: 0 },
  estimated_minutes: { type: Number, default: 3 },
  tags: [String],
}, { timestamps: true });

const Quote = mongoose.models.Quote ?? mongoose.model("Quote", QuoteSchema);
const Lesson = mongoose.models.Lesson ?? mongoose.model("Lesson", LessonSchema);

// ── 10 QUOTES ─────────────────────────────────────────────────────────────────

const QUOTES = [
  {
    chinese_text: "有些人只能陪你走一段路",
    pinyin: "You xie ren zhi neng pei ni zou yi duan lu",
    translation: "Co nhung nguoi chi co the dong hanh cung ban mot doan duong.",
    mood: "romantic", level: "hsk2",
    cultural_note: "Phan anh triet ly vo thuong trong moi quan he.",
    tags: ["tinh yeu", "cuoc doi"],
  },
  {
    chinese_text: "你不需要完美，你只需要真实",
    pinyin: "Ni bu xuyao wanmei, ni zhi xuyao zhenshí",
    translation: "Ban khong can hoan hao, ban chi can chan that.",
    mood: "healing", level: "hsk3",
    cultural_note: "Gia tri chan that duoc Gen Z Trung Quoc de cao.",
    tags: ["self-love", "chua lanh"],
  },
  {
    chinese_text: "不积跬步，无以至千里",
    pinyin: "Bu ji kuibu, wuyi zhi qianli",
    translation: "Khong tich luy tung buoc nho, khong the di nghin dam.",
    author: "Tuan Tu",
    mood: "motivation", level: "hsk4",
    cultural_note: "Thanh ngu co dien, van dung rong rai.",
    tags: ["thanh ngu", "kien tri"],
  },
  {
    chinese_text: "人生若只如初见",
    pinyin: "Rensheng ruo zhi ru chu jian",
    translation: "Gia nhu cuoc doi mai dep nhu lan dau gap go.",
    author: "Nap Lan Tinh Duc",
    mood: "aesthetic", level: "hsk5",
    cultural_note: "Cau tho noi tieng nhat cua Nap Lan Tinh Duc (Thanh trieu).",
    tags: ["tho co", "lang man"],
  },
  {
    chinese_text: "缘分这东西，说来就来，说走就走",
    pinyin: "Yuanfen zhe dongxi, shuo lai jiu lai, shuo zou jiu zou",
    translation: "Duyen phan thu do, noi den thi den, noi di thi di.",
    mood: "sad", level: "hsk4",
    cultural_note: "Yuanfen la khai niem dinh menh khong co tu tuong duong tieng Anh.",
    tags: ["yuanfen", "tam trang"],
  },
  {
    chinese_text: "真正的朋友，是在你最低谷时还在你身边的人",
    pinyin: "Zhenzheng de pengyou, shi zai ni zui digu shi hai zai ni shenbian de ren",
    translation: "Ban be that su la nguoi o ben ban khi ban o diem thap nhat.",
    mood: "friendship", level: "hsk4",
    tags: ["tinh ban", "cuoc song"],
  },
  {
    chinese_text: "心若没有栖息的地方，到哪里都是流浪",
    pinyin: "Xin ruo meiyou qixi de difang, dao nali dou shi liulang",
    translation: "Neu tam hon khong co noi de nuong tua, thi di dau cung la lang thang.",
    mood: "aesthetic", level: "hsk5",
    cultural_note: "Cau noi duoc yeu thich tren Weibo.",
    tags: ["tho", "tam trang"],
  },
  {
    chinese_text: "生活不止眼前的苟且，还有诗和远方",
    pinyin: "Shenghuo bu zhi yanqian de gouqie, hai you shi he yuanfang",
    translation: "Cuoc song khong chi la nhung thang ngay binh thuong truoc mat, con co tho ca va phuong xa.",
    mood: "motivation", level: "hsk5",
    cultural_note: "Slogan the he cua nhac si Gao Xiaosong.",
    tags: ["dong luc", "uoc mo"],
  },
  {
    chinese_text: "独处不是孤独，而是一种与自己相处的能力",
    pinyin: "Duchu bushi gudu, er shi yi zhong yu ziji xiangchu de nengli",
    translation: "O mot minh khong phai co don, ma la mot kha nang cung chinh minh.",
    mood: "healing", level: "hsk4",
    cultural_note: "Phan anh xu huong 'solo culture' cua Gen Z Trung Quoc hien dai.",
    tags: ["chua lanh", "noi tam"],
  },
  {
    chinese_text: "每一个当下，都是余生中最年轻的时刻",
    pinyin: "Mei yi ge dangxia, dou shi yusheng zhong zui nianqing de shike",
    translation: "Moi khoang khac hien tai, deu la luc tre nhat trong phan doi con lai.",
    mood: "motivation", level: "hsk5",
    tags: ["hien tai", "song tron ven"],
  },
];

// ── 12 LESSONS ────────────────────────────────────────────────────────────────

const LESSONS = [
  {
    title: "Cuoc goi luc nua dem",
    content_type: "story", mood: "romantic", level: "hsk2",
    estimated_minutes: 3,
    chinese_text: "你睡了吗？\n我只是想听听你的声音。\n今天过得怎么样？\n还不错，就是有点想你。",
    pinyin: "Ni shui le ma?\nWo zhishi xiang ting ting ni de shengyin.\nJintian guo de zenmeyang?\nHai bucuo, jiushi youdian xiang ni.",
    translation: "Em ngu chua?\nAnh chi muon nghe giong em thoi.\nHom nay cua em the nao?\nKha on, chi la nho anh mot chut.",
    vocabulary: [
      { hanzi: "睡", pinyin: "shui", meaning: "ngu", example: "你睡了吗？" },
      { hanzi: "声音", pinyin: "shengyin", meaning: "giong noi", example: "好听的声音" },
      { hanzi: "过", pinyin: "guo", meaning: "trai qua", example: "过得好吗？" },
      { hanzi: "想", pinyin: "xiang", meaning: "nho, muon", example: "我想你了" },
    ],
    grammar_notes: "怎么样 dung de hoi ve tinh trang. 就是 = chi la. 有点 = hoi, mot chut.",
    cultural_note: "Nguoi Trung Quoc thuong the hien tinh cam qua hanh dong hon loi noi truc tiep.",
    tags: ["tinh yeu", "hoi thoai dem"],
  },
  {
    title: "Buoi sang quan ca phe",
    content_type: "dialogue", mood: "aesthetic", level: "hsk1",
    estimated_minutes: 2,
    chinese_text: "来一杯咖啡，谢谢。\n好的，要加糖吗？\n不用，谢谢。多少钱？\n二十块。给你。\n谢谢，祝你有个好天气！",
    pinyin: "Lai yi bei kafei, xie xie.\nHao de, yao jia tang ma?\nBuyong, xie xie. Duoshao qian?\nErshi kuai. Gei ni.\nXie xie, zhu ni you ge hao tian qi!",
    translation: "Cho mot ly ca phe, cam on.\nVang, cho them duong khong?\nKhong can, cam on. Bao nhieu tien?\n20 te. Day a.\nCam on, chuc ban co mot ngay dep troi!",
    vocabulary: [
      { hanzi: "咖啡", pinyin: "kafei", meaning: "ca phe", example: "来一杯咖啡" },
      { hanzi: "糖", pinyin: "tang", meaning: "duong", example: "加糖" },
      { hanzi: "多少", pinyin: "duoshao", meaning: "bao nhieu", example: "多少钱？" },
      { hanzi: "块", pinyin: "kuai", meaning: "te (don vi tien)", example: "二十块" },
    ],
    grammar_notes: "要...吗 = muon ... khong? Buyong = khong can (lich su hon 不要).",
    cultural_note: "Cau chao cuoi 'zhu ni you ge hao tianqi' la cach noi rat than thien o Trung Quoc.",
    tags: ["mua sam", "HSK1", "hang ngay"],
  },
  {
    title: "Thu nho gui nguoi cu",
    content_type: "story", mood: "sad", level: "hsk3",
    estimated_minutes: 4,
    chinese_text: "有些话我多想对你说。\n可惜，时间已经过去了。\n我只能在心里默默祝福你。",
    pinyin: "You xie hua wo duo xiang dui ni shuo.\nKexi, shijian yijing guoqu le.\nWo zhi neng zai xinli momo zhufu ni.",
    translation: "Co nhung loi toi rat muon noi voi ban.\nTiec thay, thoi gian da qua roi.\nToi chi co the tham lang chuc phuc ban trong long.",
    vocabulary: [
      { hanzi: "可惜", pinyin: "kexi", meaning: "tiec thay", example: "真可惜！" },
      { hanzi: "过去", pinyin: "guoqu", meaning: "da qua, qua khu", example: "时间过去了" },
      { hanzi: "默默", pinyin: "momo", meaning: "tham lang, am tham", example: "默默等待" },
      { hanzi: "祝福", pinyin: "zhufu", meaning: "chuc phuc", example: "祝福你" },
    ],
    grammar_notes: "已经...了 = da... roi (hoan thanh). 只能 = chi co the.",
    cultural_note: "Van hoa Trung Quoc de cao su cam lang (默默) — khong noi het nhung van cam nhan duoc.",
    tags: ["tam trang", "co don"],
  },
  {
    title: "Ngay mai se tot hon",
    content_type: "quote", mood: "motivation", level: "hsk2",
    estimated_minutes: 2,
    chinese_text: "不积跬步，无以至千里。\n一步一步，慢慢来。\n你一定可以的。",
    pinyin: "Bu ji kuibu, wuyi zhi qianli.\nYi bu yi bu, man man lai.\nNi yiding keyi de.",
    translation: "Khong tich luy tung buoc nho, khong the di nghin dam.\nTung buoc mot, dan dan se den.\nBan nhat dinh lam duoc.",
    vocabulary: [
      { hanzi: "跬步", pinyin: "kuibu", meaning: "buoc di nho", example: "不积跬步" },
      { hanzi: "慢慢", pinyin: "manman", meaning: "tu tu, cham cham", example: "慢慢来" },
      { hanzi: "一定", pinyin: "yiding", meaning: "nhat dinh, chac chan", example: "一定可以" },
    ],
    grammar_notes: "一定 + dong tu = nhat dinh se... (the hien su quyet tam). 慢慢来 = khong can voi.",
    cultural_note: "Thanh ngu 不积跬步 tu Tuan Tu — moi nguoi Trung Quoc deu thuoc.",
    tags: ["dong luc", "kien tri", "thanh ngu"],
  },
  {
    title: "Cuoc tro chuyen voi me",
    content_type: "dialogue", mood: "healing", level: "hsk1",
    estimated_minutes: 2,
    chinese_text: "妈，今天你还好吗？\n好着呢，你呢？\n我也很好。想你了。\n我也想你。快回来吧。",
    pinyin: "Ma, jintian ni hao ma?\nHao zhe ne, ni ne?\nWo ye hen hao. Xiang ni le.\nWo ye xiang ni. Kuai hui lai ba.",
    translation: "Me oi, hom nay me co khoe khong?\nKhoe roi, con thi sao?\nCon cung rat khoe. Nho me lam.\nMe cung nho con. Mau ve nha di nhe.",
    vocabulary: [
      { hanzi: "好", pinyin: "hao", meaning: "tot, khoe", example: "你好吗？" },
      { hanzi: "想", pinyin: "xiang", meaning: "nho, nghi", example: "想你了" },
      { hanzi: "快", pinyin: "kuai", meaning: "mau, nhanh", example: "快回来" },
      { hanzi: "吧", pinyin: "ba", meaning: "tu nghi cau (de nghi nhe)", example: "回来吧" },
    ],
    grammar_notes: "好着呢 = van con khoe lam (着 the hien trang thai dang dien ra). 吧 o cuoi = loi de nghi nhe nhang.",
    cultural_note: "Gia dinh la gia tri trung tam cua van hoa Trung Hoa — cuoc tro chuyen voi cha me la chu de pho bien.",
    tags: ["gia dinh", "HSK1", "tinh cam"],
  },
  {
    title: "Dem nhin sao troi",
    content_type: "poem", mood: "aesthetic", level: "hsk3",
    estimated_minutes: 3,
    chinese_text: "我希望，在我看不到天空的地方，\n你正在看着同一片星空。",
    pinyin: "Wo xiwang, zai wo kan bu dao tiankong de difang,\nni zhengzai kanzhe tongyi pian xingkong.",
    translation: "Toi hy vong, o noi toi khong thay bau troi,\nban dang nhin cung mot bau sao.",
    vocabulary: [
      { hanzi: "天空", pinyin: "tiankong", meaning: "bau troi", example: "美丽的天空" },
      { hanzi: "星空", pinyin: "xingkong", meaning: "bau sao", example: "看着星空" },
      { hanzi: "希望", pinyin: "xiwang", meaning: "hy vong", example: "我希望..." },
      { hanzi: "正在", pinyin: "zhengzai", meaning: "dang (hanh dong)", example: "正在做什么" },
    ],
    grammar_notes: "正在 + dong tu = dang lam gi do (hien tai tien dang). 看不到 = khong nhin thay (kha nang phu dinh).",
    cultural_note: "Bau sao (星空) la bieu tuong cua su hien dien tu xa — chu de duoc yeu thich trong van hoc lãng man Trung Hoa.",
    tags: ["tho", "dem", "xu huong"],
  },
  {
    title: "Hom nay toi uong tra sua",
    content_type: "dialogue", mood: "funny", level: "hsk1",
    estimated_minutes: 2,
    chinese_text: "你想喝什么？\n珍珠奶茶，少糖，去冰！\n好的！大杯还是中杯？\n当然大杯！",
    pinyin: "Ni xiang he shenme?\nZhenzhu nacha, shao tang, qu bing!\nHao de! Da bei haishi zhong bei?\nDangren da bei!",
    translation: "Ban muon uong gi?\nTra sua tran chau, it duong, khong da!\nVang! Ly to hay ly vua?\nDuong nhien ly to!",
    vocabulary: [
      { hanzi: "珍珠奶茶", pinyin: "zhenzhu nacha", meaning: "tra sua tran chau", example: "一杯珍珠奶茶" },
      { hanzi: "少糖", pinyin: "shao tang", meaning: "it duong", example: "少糖去冰" },
      { hanzi: "去冰", pinyin: "qu bing", meaning: "khong da", example: "请去冰" },
      { hanzi: "当然", pinyin: "dangran", meaning: "duong nhien", example: "当然可以！" },
    ],
    grammar_notes: "还是 trong cau hoi = hay la (chon lua). 当然 = duong nhien (khang dinh manh).",
    cultural_note: "Tra sua tran chau (珍珠奶茶) la quoc dan am cua Gen Z Trung Quoc. 'Shao tang qu bing' la cau the hien ca tinh.",
    tags: ["do uong", "vui ve", "hang ngay"],
  },
  {
    title: "Tinh ban thuc su",
    content_type: "story", mood: "healing", level: "hsk2",
    estimated_minutes: 3,
    chinese_text: "真正的朋友，不用天天联系。\n但每次相见，都跟昨天一样。\n这种感情，才是最珍贵的。",
    pinyin: "Zhenzheng de pengyou, buyong tiantian lianxi.\nDan mei ci xiangjian, dou gen zuotian yiyang.\nZhe zhong ganqing, cai shi zui zhenggui de.",
    translation: "Ban be that su, khong can lien lac hang ngay.\nNhung moi lan gap nhau, van nhu ngay hom qua.\nLoai tinh cam nay, moi la quy gia nhat.",
    vocabulary: [
      { hanzi: "朋友", pinyin: "pengyou", meaning: "ban be", example: "好朋友" },
      { hanzi: "联系", pinyin: "lianxi", meaning: "lien lac", example: "保持联系" },
      { hanzi: "相见", pinyin: "xiangjian", meaning: "gap nhau", example: "期待相见" },
      { hanzi: "珍贵", pinyin: "zhengui", meaning: "quy gia", example: "最珍贵的" },
    ],
    grammar_notes: "不用 = khong can (nhe nhang hon 不必). 才是 = moi that la (nhan manh ban chat).",
    cultural_note: "Ban be lau nam (老朋友) duoc xem la tai san quy gia trong van hoa Trung Hoa.",
    tags: ["tinh ban", "cam xuc"],
  },
  {
    title: "Tuoi thanh xuan khong tro lai",
    content_type: "poem", mood: "motivation", level: "hsk3",
    estimated_minutes: 2,
    chinese_text: "青春是我们最大的资本。\n别浪费它在抱怨和后悔里。\n去做你一直想做的事吧。",
    pinyin: "Qingchun shi women zui da de ziben.\nBie langfei ta zai baoyuan he houhuí li.\nQu zuo ni yizhi xiang zuo de shi ba.",
    translation: "Tuoi thanh xuan la tai san lon nhat cua chung ta.\nDung lang phi no vao phàn nan va hoi tiec.\nHay di lam dieu ban luon muon lam.",
    vocabulary: [
      { hanzi: "青春", pinyin: "qingchun", meaning: "tuoi thanh xuan", example: "青春岁月" },
      { hanzi: "浪费", pinyin: "langfei", meaning: "lang phi", example: "浪费时间" },
      { hanzi: "抱怨", pinyin: "baoyuan", meaning: "phan nan", example: "别抱怨了" },
      { hanzi: "后悔", pinyin: "hougui", meaning: "hoi tiec", example: "不后悔" },
    ],
    grammar_notes: "别 + dong tu = dung... (cam). 一直 = luon luon, mai mai.",
    cultural_note: "Chu de tuoi tre rat duoc yeu thich trong nhac pop Trung Quoc hien dai.",
    tags: ["dong luc", "tuoi tre"],
  },
  {
    title: "Mua xuan va khoang khac binh yen",
    content_type: "story", mood: "healing", level: "hsk1",
    estimated_minutes: 1,
    chinese_text: "春天来了。\n花开了，鸟叫了。\n心情好了一点。\n生活还是美好的。",
    pinyin: "Chuntian lai le.\nHua kai le, niao jiao le.\nXinqing hao le yidian.\nShenghuo haishi meihao de.",
    translation: "Mua xuan den roi.\nHoa no, chim hot.\nTam trang tot hon mot chut.\nCuoc song van dep.",
    vocabulary: [
      { hanzi: "春天", pinyin: "chuntian", meaning: "mua xuan", example: "春天来了" },
      { hanzi: "花开", pinyin: "huakai", meaning: "hoa no", example: "花开了" },
      { hanzi: "心情", pinyin: "xinqing", meaning: "tam trang", example: "心情好" },
      { hanzi: "美好", pinyin: "meihao", meaning: "tuyet voi, dep", example: "美好的生活" },
    ],
    grammar_notes: "动词 + 了 = hanh dong da xay ra / trang thai thay doi. 还是 = van con.",
    cultural_note: "Mua xuan (春天) trong van hoa Trung Hoa tuong trung cho su hy vong va bat dau moi.",
    tags: ["thien nhien", "binh yen", "HSK1"],
  },
  {
    title: "Khoang lang de tri oc nghi ngoi",
    content_type: "quote", mood: "aesthetic", level: "hsk4",
    estimated_minutes: 2,
    chinese_text: "独处不是孤独，而是一种与自己相处的能力。\n学会独处，才能真正认识自己。",
    pinyin: "Duchu bushi gudu, er shi yi zhong yu ziji xiangchu de nengli.\nXuehui duchu, cai neng zhenzheng renshi ziji.",
    translation: "O mot minh khong phai co don, ma la mot kha nang cung chinh minh.\nHoc duoc cach o mot minh, moi co the that su hieu ban than.",
    vocabulary: [
      { hanzi: "独处", pinyin: "duchu", meaning: "o mot minh", example: "享受独处" },
      { hanzi: "孤独", pinyin: "gudu", meaning: "co don", example: "感到孤独" },
      { hanzi: "相处", pinyin: "xiangchu", meaning: "song cung, o cung", example: "和自己相处" },
      { hanzi: "认识", pinyin: "renshi", meaning: "hieu biet, nhan ra", example: "认识自己" },
    ],
    grammar_notes: "不是A，而是B = khong phai A ma la B (doi lap). 才能 = moi co the (dieu kien tien quyet).",
    cultural_note: "Solo culture dang len manh o gioi tre Trung Quoc — doc cu cung di du lich, an toi mot minh la binh thuong.",
    tags: ["noi tam", "tu thiet ke", "aesthetic"],
  },
  {
    title: "Ngu ngon ve con duong",
    content_type: "poem", mood: "motivation", level: "hsk4",
    estimated_minutes: 1,
    chinese_text: "路是走出来的，\n不是等出来的。\n你的将来，就在脚下。",
    pinyin: "Lu shi zou chulai de,\nbushi deng chulai de.\nNi de jianglai, jiu zai jiao xia.",
    translation: "Con duong la duoc di ma co,\nkhong phai la ngoi doi ma co.\nTuong lai cua ban, chinh o duoi chan ban.",
    vocabulary: [
      { hanzi: "路", pinyin: "lu", meaning: "con duong", example: "走这条路" },
      { hanzi: "等", pinyin: "deng", meaning: "cho doi", example: "不要等" },
      { hanzi: "将来", pinyin: "jianglai", meaning: "tuong lai", example: "美好的将来" },
      { hanzi: "脚下", pinyin: "jiaoxia", meaning: "duoi chan", example: "就在脚下" },
    ],
    grammar_notes: "动词 + 出来 = lam ra duoc (ket qua). 就在 = chinh o ngay tai (nhan manh vi tri).",
    cultural_note: "Tu tuong 'tu tay xay dung tuong lai' rat duoc tri thuc tre Trung Quoc dong tinh.",
    tags: ["dong luc", "hanh dong", "ngu ngon"],
  },
];

async function seed() {
  console.log("Bat dau seed data...");
  await mongoose.connect(MONGODB_URI!);
  console.log("Da ket noi MongoDB");

  await Quote.deleteMany({});
  await Lesson.deleteMany({});
  console.log("Da xoa data cu");

  await Quote.insertMany(QUOTES);
  console.log(`Da them ${QUOTES.length} quotes`);

  await Lesson.insertMany(LESSONS);
  console.log(`Da them ${LESSONS.length} lessons`);

  console.log("\nSeed hoan tat! Chay npm run dev va xem ket qua.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Loi seed:", err);
  process.exit(1);
});
