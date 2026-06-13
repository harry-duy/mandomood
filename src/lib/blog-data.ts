/**
 * Kho bài blog SEO (server-render tĩnh, không cần CMS).
 * Mỗi bài: slug + meta + sections (h2 + đoạn văn). Thêm bài = thêm object.
 * 5 bài đầu theo MARKETING_LAUNCH.md — đây là 3 bài đầu tiên.
 */

export interface BlogSection {
  heading: string;
  paragraphs: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  readMinutes: number;
  tags: string[];
  sections: BlogSection[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "hoc-tieng-trung-bang-am-han-viet",
    title: "Học tiếng Trung bằng âm Hán Việt — lợi thế bí mật của người Việt",
    description:
      "70% từ vựng tiếng Việt có gốc Hán. Người Việt học tiếng Trung nhanh hơn nhờ âm Hán Việt — cách tận dụng lợi thế này để nhớ từ gấp 3 lần.",
    date: "2026-06-12",
    readMinutes: 6,
    tags: ["Hán Việt", "phương pháp học"],
    sections: [
      {
        heading: "Bạn đã biết hàng nghìn từ tiếng Trung mà không nhận ra",
        paragraphs: [
          "Khoảng 60–70% từ vựng tiếng Việt là từ Hán Việt. Khi bạn nói \"đại học\", người Trung Quốc nói 大学 (dàxué — đại học). Khi bạn nói \"thế giới\", họ nói 世界 (shìjiè — thế giới). Cùng một gốc, chỉ khác cách phát âm.",
          "Đây là lợi thế mà người Mỹ, người Pháp học tiếng Trung không bao giờ có. Họ phải học 大学 như một từ hoàn toàn xa lạ. Còn bạn? Bạn chỉ cần \"nối dây\" giữa âm Hán Việt đã nằm sẵn trong đầu với âm Quan Thoại.",
        ],
      },
      {
        heading: "Quy luật chuyển âm — học 1 biết 10",
        paragraphs: [
          "Âm Hán Việt và âm Quan Thoại chuyển đổi theo quy luật khá ổn định. Ví dụ: âm \"học\" (học tập, đại học, học sinh) hầu như luôn là 学 xué. Âm \"quốc\" (quốc gia, ngoại quốc, Trung Quốc) luôn là 国 guó. Nắm một quy luật, bạn đoán được hàng chục từ chưa từng học.",
          "Thử ngay: 中国 = Trung Quốc, 国家 = quốc gia, 美国 = Mỹ quốc (nước Mỹ), 法国 = Pháp quốc (nước Pháp). Bạn vừa \"học\" 4 từ trong 10 giây — vì thực ra bạn đã biết chúng từ trước.",
        ],
      },
      {
        heading: "Cách MandoMood tận dụng âm Hán Việt",
        paragraphs: [
          "Mọi từ vựng trong MandoMood đều hiển thị kèm âm Hán Việt — không chỉ pinyin và nghĩa. Khi học 电脑 (diànnǎo), bạn thấy ngay \"điện não\" — máy tính là \"bộ não chạy điện\". Từ khó bỗng thành dễ nhớ vì nó kể một câu chuyện bằng chính tiếng mẹ đẻ của bạn.",
          "Kết hợp với truyện ngắn AI cá nhân hóa theo tâm trạng và flashcard SRS, âm Hán Việt là mảnh ghép giúp người Việt học nhanh hơn bất kỳ app quốc tế nào không hiểu lợi thế này.",
        ],
      },
    ],
  },
  {
    slug: "chiet-tu-10-chu-han-dep-nhat",
    title: "Chiết tự 10 chữ Hán đẹp nhất — mỗi chữ là một câu chuyện",
    description:
      "好 là người phụ nữ bên đứa con. 安 là người phụ nữ dưới mái nhà. Chiết tự biến chữ Hán từ ký hiệu khó nhớ thành câu chuyện không thể quên.",
    date: "2026-06-12",
    readMinutes: 7,
    tags: ["chiết tự", "chữ Hán"],
    sections: [
      {
        heading: "Chiết tự là gì?",
        paragraphs: [
          "Chiết tự (析字) là nghệ thuật \"mổ xẻ\" chữ Hán thành các bộ phận có nghĩa. Chữ Hán không phải ký hiệu ngẫu nhiên — chúng được ghép từ các bộ thủ, mỗi bộ mang một ý nghĩa. Hiểu cách ghép, bạn nhớ chữ như nhớ một câu chuyện.",
        ],
      },
      {
        heading: "10 chữ Hán kể chuyện hay nhất",
        paragraphs: [
          "好 hǎo (hảo — tốt): 女 người mẹ bên 子 đứa con — còn gì \"tốt đẹp\" hơn? · 安 ān (an — bình yên): 女 người phụ nữ dưới 宀 mái nhà — gia đình là bình an. · 明 míng (minh — sáng): 日 mặt trời + 月 mặt trăng — hai nguồn sáng của bầu trời.",
          "休 xiū (hưu — nghỉ ngơi): 人 người tựa vào 木 gốc cây. · 看 kàn (khán — nhìn): 手 bàn tay che trên 目 mắt — dáng người nheo mắt nhìn xa. · 思 sī (tư — suy nghĩ): 田 ruộng + 心 tim — trái tim cày xới như thửa ruộng.",
          "森 sēn (sâm — rừng rậm): ba chữ 木 cây chồng lên nhau — một cây là mộc, ba cây thành rừng. · 众 zhòng (chúng — đám đông): ba chữ 人 người. · 鲜 xiān (tiên — tươi ngon): 鱼 cá + 羊 dê — hai món tươi ngon nhất thời cổ. · 爱 ài (ái — yêu): giữa chữ yêu giản thể là 友 bạn — tình yêu bắt đầu từ tình bạn.",
        ],
      },
      {
        heading: "Học chiết tự ở đâu?",
        paragraphs: [
          "Trang Chiết tự của MandoMood phân tích từng chữ Hán thành bộ thủ kèm hình động nét bút (hanzi-writer), âm Hán Việt và câu chuyện ghi nhớ. Mỗi ngày 5 phút, sau một tháng bạn đọc được những chữ tưởng chừng \"vẽ bùa\".",
        ],
      },
    ],
  },
  {
    slug: "lo-trinh-hsk-cho-nguoi-moi",
    title: "Lộ trình HSK cho người mới bắt đầu — từ số 0 đến HSK 3 trong 6 tháng",
    description:
      "HSK là gì, học cấp nào trước, mỗi ngày bao nhiêu phút? Lộ trình thực tế cho người Việt tự học tiếng Trung từ con số 0.",
    date: "2026-06-12",
    readMinutes: 8,
    tags: ["HSK", "lộ trình"],
    sections: [
      {
        heading: "HSK là gì và vì sao nên theo?",
        paragraphs: [
          "HSK (汉语水平考试 — Hán ngữ thủy bình khảo thí) là kỳ thi năng lực tiếng Trung chuẩn quốc tế, 6 cấp từ dễ đến khó. HSK1 cần ~150 từ, HSK2 ~300 từ, HSK3 ~600 từ. Theo khung HSK, bạn luôn biết mình đang ở đâu và cần học gì tiếp — không lạc lối giữa biển từ vựng.",
        ],
      },
      {
        heading: "Lộ trình 6 tháng thực tế (30 phút/ngày)",
        paragraphs: [
          "Tháng 1–2 (HSK1): học phát âm + thanh điệu thật chắc, 150 từ cơ bản, mẫu câu chào hỏi. Sai lầm lớn nhất của người mới là bỏ qua thanh điệu — hãy luyện nghe và shadowing từ ngày đầu.",
          "Tháng 3–4 (HSK2): thêm 150 từ, ngữ pháp 了/过/在, bắt đầu đọc truyện ngắn siêu dễ. Đây là lúc flashcard SRS phát huy — ôn đúng lúc sắp quên thay vì ôn tràn lan.",
          "Tháng 5–6 (HSK3): thêm 300 từ, đọc đoạn văn 100–200 chữ, nghe hội thoại chậm. Mục tiêu: tự đọc được một mẩu truyện ngắn không cần tra quá 5 từ.",
        ],
      },
      {
        heading: "Công cụ miễn phí cho cả lộ trình",
        paragraphs: [
          "MandoMood có đủ bộ cho lộ trình này: kho từ HSK kèm âm Hán Việt, flashcard SRS nhắc ôn đúng lúc, bài đọc ngắn theo cấp độ kèm chú thích từng từ, luyện phát âm chấm điểm bằng giọng nói, và đề thi thử HSK 1–6. Tất cả miễn phí — bắt đầu tại trang Lộ trình.",
        ],
      },
    ],
  },
  {
    slug: "150-tu-hsk1-kem-han-viet",
    title: "150 từ HSK1 kèm âm Hán Việt — nhóm theo chủ đề để nhớ nhanh",
    description:
      "Toàn bộ từ vựng HSK1 chia 8 nhóm chủ đề, kèm âm Hán Việt và mẹo nhớ. Học 150 từ đầu tiên đúng cách là nền móng cho cả hành trình tiếng Trung.",
    date: "2026-06-12",
    readMinutes: 9,
    tags: ["HSK1", "từ vựng", "Hán Việt"],
    sections: [
      {
        heading: "Vì sao 150 từ HSK1 quan trọng đến vậy?",
        paragraphs: [
          "150 từ HSK1 chiếm tới ~50% tần suất xuất hiện trong hội thoại hằng ngày. Nắm chắc nhóm từ này, bạn đã nghe hiểu được khung của hầu hết câu nói đơn giản. Học sai cách (nhồi danh sách dài, không ngữ cảnh) là lý do số 1 khiến người mới bỏ cuộc sau 2 tuần.",
          "Cách đúng: chia nhỏ theo chủ đề, gắn mỗi từ với âm Hán Việt quen thuộc, và ôn bằng SRS đúng thời điểm sắp quên.",
        ],
      },
      {
        heading: "8 nhóm chủ đề HSK1",
        paragraphs: [
          "Nhóm 1 — Đại từ & nghi vấn: 我 wǒ (ngã — tôi), 你 nǐ (nhĩ — bạn), 他/她 tā (tha — anh/cô ấy), 什么 shénme (thậm ma — cái gì), 谁 shéi (thùy — ai), 哪儿 nǎr (nả nhi — ở đâu), 几 jǐ (kỷ — mấy), 多少 duōshao (đa thiểu — bao nhiêu).",
          "Nhóm 2 — Động từ cốt lõi: 是 shì (thị — là), 有 yǒu (hữu — có), 在 zài (tại — ở), 去 qù (khứ — đi), 来 lái (lai — đến), 看 kàn (khán — nhìn/xem), 听 tīng (thính — nghe), 说 shuō (thuyết — nói), 读 dú (độc — đọc), 写 xiě (tả — viết).",
          "Nhóm 3 — Gia đình & người: 爸爸 bàba (ba), 妈妈 māma (mẹ), 儿子 érzi (nhi tử — con trai), 女儿 nǚ'ér (nữ nhi — con gái), 朋友 péngyou (bằng hữu — bạn bè), 老师 lǎoshī (lão sư — giáo viên), 学生 xuésheng (học sinh), 医生 yīshēng (y sinh — bác sĩ).",
          "Nhóm 4 — Thời gian: 今天 jīntiān (kim thiên — hôm nay), 明天 míngtiān (minh thiên — ngày mai), 昨天 zuótiān (tạc thiên — hôm qua), 年 nián (niên — năm), 月 yuè (nguyệt — tháng), 日 rì (nhật — ngày), 点 diǎn (điểm — giờ), 现在 xiànzài (hiện tại — bây giờ).",
          "Nhóm 5 — Ăn uống: 吃 chī (ngật — ăn), 喝 hē (hát — uống), 米饭 mǐfàn (mễ phạn — cơm), 菜 cài (thái — món ăn/rau), 水 shuǐ (thủy — nước), 茶 chá (trà), 苹果 píngguǒ (bình quả — táo), 水果 shuǐguǒ (thủy quả — hoa quả).",
          "Nhóm 6 — Nơi chốn & di chuyển: 家 jiā (gia — nhà), 学校 xuéxiào (học hiệu — trường học), 中国 Zhōngguó (Trung Quốc), 北京 Běijīng (Bắc Kinh), 商店 shāngdiàn (thương điếm — cửa hàng), 医院 yīyuàn (y viện — bệnh viện), 飞机 fēijī (phi cơ — máy bay), 出租车 chūzūchē (xuất tô xa — taxi).",
          "Nhóm 7 — Tính từ & trạng từ: 好 hǎo (hảo — tốt), 大 dà (đại — to), 小 xiǎo (tiểu — nhỏ), 多 duō (đa — nhiều), 少 shǎo (thiểu — ít), 冷 lěng (lãnh — lạnh), 热 rè (nhiệt — nóng), 高兴 gāoxìng (cao hứng — vui), 漂亮 piàoliang (phiếu lượng — đẹp), 很 hěn (ngận — rất), 不 bù (bất — không), 都 dōu (đô — đều), 太 tài (thái — quá).",
          "Nhóm 8 — Đồ vật & học tập: 书 shū (thư — sách), 字 zì (tự — chữ), 钱 qián (tiền), 电脑 diànnǎo (điện não — máy tính), 电视 diànshì (điện thị — tivi), 电影 diànyǐng (điện ảnh — phim), 桌子 zhuōzi (trác tử — cái bàn), 椅子 yǐzi (ỷ tử — cái ghế), 杯子 bēizi (bôi tử — cái cốc), 猫 māo (miêu — mèo), 狗 gǒu (cẩu — chó).",
        ],
      },
      {
        heading: "Mẹo học 150 từ trong 3-4 tuần",
        paragraphs: [
          "Mỗi ngày 1 nhóm nhỏ 8-10 từ, ưu tiên từ có âm Hán Việt quen (điện não, điện ảnh, học sinh — gần như miễn phí). Tối ôn lại bằng flashcard SRS, cuối tuần làm quiz tổng. Đừng học chữ viết tay ngay từ đầu — nhận mặt chữ + nghe nói trước, viết sau.",
          "Trang HSK của MandoMood có đủ kho từ HSK1 kèm âm Hán Việt, ví dụ và quiz; bấm một nút là từ vào sổ tay để ôn SRS.",
        ],
      },
    ],
  },
  {
    slug: "hoc-tieng-trung-qua-c-drama",
    title: "Học tiếng Trung qua C-drama — biến giờ cày phim thành giờ học",
    description:
      "Xem Trần Tình Lệnh, Khanh Khanh Nhật Thường mà vẫn tiến bộ tiếng Trung? Được — nếu xem đúng cách. Phương pháp 4 bước biến phim thành giáo trình.",
    date: "2026-06-12",
    readMinutes: 7,
    tags: ["C-drama", "phương pháp học"],
    sections: [
      {
        heading: "Xem phim có thật sự giúp học tiếng Trung?",
        paragraphs: [
          "Có — nhưng không phải kiểu xem thụ động với phụ đề tiếng Việt. Não bạn sẽ chỉ đọc phụ đề và bỏ qua âm thanh. Muốn tiến bộ, phải xem CHỦ ĐỘNG: chọn cảnh ngắn, nghe lại nhiều lần, nhại theo, và thu hoạch từ vựng.",
          "Tin vui: hội thoại C-drama hiện đại (thể loại đời thường, lãng mạn) dùng đúng lớp từ HSK2-4 — vừa tầm người học 6 tháng đến 2 năm.",
        ],
      },
      {
        heading: "Phương pháp 4 bước với một cảnh phim",
        paragraphs: [
          "Bước 1 — Xem cảnh 2-3 phút với phụ đề Việt để hiểu cốt truyện. Bước 2 — Xem lại với phụ đề Trung (hoặc song ngữ), dừng ở câu ngắn hay, chép lại 3-5 câu. Bước 3 — Shadowing: phát lại từng câu, nhại theo cả ngữ điệu và cảm xúc của diễn viên — đây là cách luyện thanh điệu tự nhiên nhất. Bước 4 — Đưa từ mới vào flashcard, hôm sau ôn lại.",
          "Mỗi ngày chỉ cần MỘT cảnh. Một bộ phim 40 tập đủ cho bạn 3 tháng luyện nghe nói liên tục mà không thấy chán.",
        ],
      },
      {
        heading: "Những câu C-drama kinh điển đáng học thuộc",
        paragraphs: [
          "你是我的例外 nǐ shì wǒ de lìwài — \"Em là ngoại lệ của anh\" (例外 = lệ ngoại). 我等你很久了 wǒ děng nǐ hěn jiǔ le — \"Anh đợi em lâu lắm rồi\". 别怕，有我在 bié pà, yǒu wǒ zài — \"Đừng sợ, có anh đây\". Những câu này ngắn, giàu cảm xúc, lặp lại trong rất nhiều phim — học một lần, nghe ra mãi mãi.",
          "Trang Shadowing và Video của MandoMood có sẵn câu thoại kiểu C-drama kèm pinyin + Hán Việt + chấm điểm phát âm; trang Tạo truyện AI có thể viết tiếp một mẩu chuyện theo mood \"lãng mạn cổ trang\" cho riêng bạn.",
        ],
      },
    ],
  },
  {
    slug: "karaoke-luyen-nghe-noi-tieng-trung",
    title: "Phương pháp Karaoke — cách luyện nghe & nói tiếng Trung hiệu quả nhất cho người Việt",
    description:
      "Không phải bài tập, không phải từ điển. Karaoke kết hợp 3 kỹ thuật khoa học — nghe chủ động, shadowing và chính tả âm thanh — giúp não ghi nhớ ngôn ngữ theo cách tự nhiên nhất.",
    date: "2026-06-13",
    readMinutes: 6,
    tags: ["luyện nghe", "shadowing", "phương pháp học"],
    sections: [
      {
        heading: "Tại sao não người học qua âm thanh nhanh hơn qua chữ viết?",
        paragraphs: [
          "Ngôn ngữ vào não qua hai con đường: chữ viết (vỏ não thị giác) và âm thanh (vỏ não thính giác + vận động). Trẻ em học tiếng mẹ đẻ hoàn toàn qua con đường âm thanh trong 2-3 năm đầu — không một trang sách nào. Kết quả: chúng nói trôi chảy trước khi biết đọc biết viết.",
          "Người lớn học ngoại ngữ hay làm ngược: đọc ngữ pháp, làm bài tập điền từ, nhìn vào danh sách từ vựng. Não lưu thông tin đó vào bộ nhớ ngắn hạn (declarative memory) — biết qui tắc nhưng nói không ra. Luyện qua âm thanh, đặc biệt qua shadowing, kích hoạt procedural memory — loại bộ nhớ giúp bạn đi xe đạp mà không cần nghĩ từng động tác.",
        ],
      },
      {
        heading: "Ba kỹ thuật trong phương pháp Karaoke",
        paragraphs: [
          "Kỹ thuật 1 — Nghe chủ động (Active Listening): nghe TTS đọc từng câu, mắt theo dõi chữ, tai bắt nhịp điệu và thanh điệu. Khác với nghe nhạc hay phim (thụ động), nghe chủ động yêu cầu bạn dự đoán từ tiếp theo — giúp não xây dựng mô hình ngôn ngữ chứ không chỉ ghi nhận thụ động.",
          "Kỹ thuật 2 — Shadowing (nhái bóng): nghe câu xong, TTS dừng lại 3 giây, bạn nhái lại NGAY — cùng tốc độ, cùng ngữ điệu, cùng cảm xúc. Đây là phương pháp Alexander Arguelles dùng để học hàng chục ngôn ngữ. Não không chỉ nghe mà còn điều phối miệng, phổi, lưỡi đồng bộ với âm thanh — ghi sâu vào bộ nhớ cơ thể.",
          "Kỹ thuật 3 — Chính tả âm thanh (Dictation): không nhìn chữ, nghe TTS đọc, gõ lại từng câu. Hệ thống chấm điểm theo từng ký tự. Đây là bài test toàn diện nhất: để gõ đúng, bạn phải nghe đúng thanh điệu, nhận ra ranh giới từ, nhớ cách viết. Sai ở đâu biết ngay cần luyện thêm gì.",
        ],
      },
      {
        heading: "Lịch luyện Karaoke hiệu quả",
        paragraphs: [
          "Buổi sáng (5–8 phút): 1 track Karaoke ở chế độ Nghe — như warm-up cho tai. Giữa giờ hoặc bữa trưa (8–10 phút): Shadowing 1 track — lúc này não tỉnh táo, luyện vận động miệng hiệu quả nhất. Tối (5 phút): Chính tả 1 track cũ — ôn lại những gì đã nghe sáng, chuyển từ bộ nhớ ngắn hạn sang dài hạn.",
          "Tổng cộng 20 phút/ngày, không cần giáo viên, không cần phòng học — chỉ cần tai nghe và app. Sau 30 ngày, thanh điệu không còn là cơn ác mộng, câu chữ tự nhiên hơn khi bạn nói.",
        ],
      },
      {
        heading: "Karaoke trên MandoMood — thực hành ngay",
        paragraphs: [
          "Trang Karaoke của MandoMood có 6 track nội dung chọn lọc từ HSK2 đến HSK4: câu truyện ngắn, thoại C-drama, thành ngữ, câu thơ. Ba chế độ Nghe · Shadowing · Chính tả chuyển liền mạch. Tốc độ TTS có thể chỉnh 0.7× cho người mới, 1.2× khi đã quen. Cuối phiên hiển thị điểm chính tả và XP tích lũy.",
        ],
      },
    ],
  },
  {
    slug: "streak-hoc-tieng-trung-giu-chuoi-ngay",
    title: "Chuỗi ngày học — khoa học đằng sau streak và cách không bao giờ bỏ cuộc",
    description:
      "Duolingo biến streak thành vũ khí giữ người dùng không phải ngẫu nhiên. Hiểu cơ chế tâm lý, bạn có thể tự tạo động lực học tiếng Trung bền vững hơn bất kỳ app nào.",
    date: "2026-06-13",
    readMinutes: 5,
    tags: ["streak", "thói quen học", "tâm lý học"],
    sections: [
      {
        heading: "Tại sao mất streak lại đau hơn được streak?",
        paragraphs: [
          "Đây là loss aversion — nguyên lý tâm lý học kinh điển của Daniel Kahneman: nỗi đau mất một thứ lớn hơn gấp đôi niềm vui có được thứ tương đương. Streak 30 ngày biến 1 buổi bỏ học thành mất 30 ngày thành quả — đủ để đau. Đây là lý do Duolingo giữ được hàng triệu người dùng quay lại mỗi ngày.",
          "Nhưng có mặt tối: nhiều người học 2 phút mỗi ngày chỉ để giữ streak, không thực sự học. Streak là công cụ — không phải mục tiêu. Dùng đúng, nó rất mạnh. Dùng sai, nó trở thành gánh nặng.",
        ],
      },
      {
        heading: "Xây thói quen học tiếng Trung theo khoa học hành vi",
        paragraphs: [
          "Mô hình Habit Loop của Charles Duhigg gồm 3 phần: Cue (gợi nhắc) → Routine (thói quen) → Reward (phần thưởng). Để streak không chết sau tuần đầu tiên: Cue phải cụ thể và tự động (\"sau khi đánh răng sáng\" tốt hơn \"khi có thời gian\"). Routine phải đủ ngắn để không thể từ chối (5 phút mỗi ngày dễ duy trì hơn 1 giờ cuối tuần). Reward phải ngay lập tức (XP, badge, thấy con số streak tăng).",
          "Nghiên cứu của Phillippa Lally (UCL) cho thấy trung bình mất 66 ngày để hình thành một thói quen — không phải 21 ngày như nhiều người nghĩ. Đừng bỏ cuộc sau 3 tuần đầu. Tuần 3-5 là giai đoạn khó nhất; nếu vượt qua được, não bắt đầu \"đòi\" học như đòi cà phê sáng.",
        ],
      },
      {
        heading: "Kỹ thuật \"Never Miss Twice\" — không bao giờ mất streak dài",
        paragraphs: [
          "Bỏ một ngày là chuyện bình thường — cuộc sống không hoàn hảo. Vấn đề là bỏ ngày thứ hai. Nghiên cứu của BJ Fogg (Stanford) cho thấy: một lần bỏ không phá vỡ thói quen, hai lần bỏ liên tiếp mới thật sự nguy hiểm. Quy tắc đơn giản: Never Miss Twice. Không đủ 10 phút? Làm 2 phút. Không muốn làm flashcard? Nghe 1 track Karaoke. Quan trọng là chuỗi không bị cắt.",
          "MandoMood theo dõi streak học của bạn — bao gồm cả khi dùng Karaoke, Daily Plan, hoặc tạo truyện AI. Không nhất thiết phải làm cùng một việc mỗi ngày. Hệ thống XP và chuỗi ngày trong trang Tiến độ cho bạn thấy hành trình — không phải chỉ kết quả một ngày.",
        ],
      },
    ],
  },
  {
    slug: "thanh-dieu-tieng-trung-5-bi-quyet",
    title: "5 bí quyết chinh phục thanh điệu tiếng Trung — không còn là cơn ác mộng",
    description:
      "Thanh điệu là rào cản số 1 của người học tiếng Trung. Nhưng não người Việt có lợi thế lớn — 5 kỹ thuật này giúp bạn nghe đúng và nói đúng thanh điệu chỉ trong 4-6 tuần.",
    date: "2026-06-13",
    readMinutes: 6,
    tags: ["thanh điệu", "phát âm", "phương pháp học"],
    sections: [
      {
        heading: "Người Việt học thanh điệu tiếng Trung: lợi thế ẩn",
        paragraphs: [
          "Tiếng Việt có 6 thanh điệu — nhiều hơn tiếng Trung (4 thanh + trung bình). Não người Việt đã được lập trình để phân biệt âm điệu từ lúc mới sinh. Người Anh, người Pháp phải mất 1-2 năm để nghe ra sự khác biệt mà người Việt cảm nhận được ngay từ tuần đầu tiên.",
          "Thách thức nằm ở chỗ khác: thanh điệu tiếng Trung khác hệ thống thanh Việt — không phải 1-1. Thanh 2 (sắc âm lên cao) giống thanh sắc tiếng Việt nhưng bắt đầu từ âm vực thấp hơn. Thanh 3 (khúc khuỷu) không có tương đương trong tiếng Việt. Đây là 2 thanh cần tập trung.",
        ],
      },
      {
        heading: "5 kỹ thuật học thanh điệu khoa học",
        paragraphs: [
          "Kỹ thuật 1 — Học qua câu hoàn chỉnh, không học âm rời: não nhớ thanh điệu tốt hơn khi chúng nằm trong ngữ cảnh. \"你好 nǐ hǎo\" dễ nhớ thanh 3-3 hơn là tập phát âm hǎo riêng lẻ 50 lần.",
          "Kỹ thuật 2 — Gắn màu sắc với thanh điệu: nhiều người học dùng hệ màu của Olle Linge (Chinese Grammar Wiki) — Thanh 1 đỏ, Thanh 2 cam, Thanh 3 xanh lá, Thanh 4 xanh dương. Não thị giác lưu màu sắc hiệu quả hơn ký hiệu diacritic nhỏ trên âm tiết.",
          "Kỹ thuật 3 — Pitch glide: dùng tay vẽ đường cao độ trong không khí khi đọc. Thanh 1 = ngang, Thanh 2 = lên, Thanh 3 = xuống-lên chữ V, Thanh 4 = xuống nhanh. Kết nối vận động cơ thể với âm thanh tạo bộ nhớ cơ thể (muscle memory).",
          "Kỹ thuật 4 — Minimal pair drilling: luyện cặp từ chỉ khác nhau về thanh. mā (妈 mẹ) / má (麻 gai) / mǎ (马 ngựa) / mà (骂 chửi) — 4 nghĩa hoàn toàn khác nhau từ cùng một âm. Trang Luyện thanh điệu của MandoMood có sẵn bộ minimal pairs HSK1-4.",
          "Kỹ thuật 5 — Shadowing cảm xúc: nhái theo diễn viên C-drama, không chỉ nhái âm thanh — nhái cả cảm xúc, tốc độ, ngữ điệu. Diễn viên đã học cách phát âm chuẩn; bạn đang học qua những người thầy tốt nhất mà không mất tiền thuê.",
        ],
      },
      {
        heading: "Lịch luyện thanh điệu 4 tuần",
        paragraphs: [
          "Tuần 1-2: Mỗi ngày 5 phút luyện nhận diện — nghe 10 từ tối thiểu pairs, phân biệt thanh. Không cần nói. Chỉ nghe và chọn. Tuần 3-4: Bắt đầu nói — đọc to 5 câu mỗi ngày, ghi âm lại, so sánh với TTS. Nghe sự khác biệt, điều chỉnh.",
          "Sau 4 tuần, thanh điệu không còn là yếu tố bạn phải nghĩ consciously — chúng trở thành phản xạ. Đây là khi việc học thật sự bắt đầu có tốc độ.",
        ],
      },
    ],
  },
  {
    slug: "tu-vung-cam-xuc-tieng-trung",
    title: "50 từ cảm xúc tiếng Trung — học ngôn ngữ qua trái tim",
    description:
      "Tại sao từ vựng cảm xúc giúp bạn nhớ tiếng Trung tốt hơn bất kỳ danh sách từ nào? Khoa học cảm xúc + 50 từ thiết yếu kèm câu ví dụ thật từ C-drama và thơ cổ.",
    date: "2026-06-13",
    readMinutes: 7,
    tags: ["từ vựng", "cảm xúc", "C-drama", "phương pháp học"],
    sections: [
      {
        heading: "Cảm xúc và bộ nhớ — khoa học đằng sau MandoMood",
        paragraphs: [
          "Nghiên cứu của Antonio Damasio (neuroscientist, ĐH Southern California) chứng minh: cảm xúc không chỉ là \"phụ gia\" của tư duy — chúng là yếu tố cốt lõi trong quá trình ghi nhớ và ra quyết định. Khi bạn học một từ gắn với cảm xúc mạnh (ngạc nhiên, xúc động, tức giận), amygdala phóng dopamine tăng cường ghi nhớ trong hippocampus.",
          "Đây là lý do bạn nhớ câu thoại trong C-drama lâu hơn từ trong sách giáo khoa. \"别怕，有我在\" (Đừng sợ, có anh đây) — bạn nhớ mãi vì cảnh đó khiến bạn xúc động, không phải vì bạn ôn lại 10 lần.",
        ],
      },
      {
        heading: "Nhóm 1: Tình yêu và nhớ nhung",
        paragraphs: [
          "喜欢 xǐhuan (hỉ hoan) — thích, yêu thích (ít mạnh hơn 爱). 爱 ài (ái) — yêu (sâu sắc, cả gia đình lẫn tình nhôi). 想念 xiǎngniàn (tưởng niệm) — nhớ nhung. 思念 sīniàn (tư niệm) — nhớ da diết (văn chương hơn). 心动 xīndòng (tâm động) — tim rung động. 暗恋 ànliàn (ám luyến) — yêu thầm. 失恋 shīliàn (thất luyến) — thất tình. 分手 fēnshǒu (phân thủ) — chia tay. 缘分 yuánfèn (duyên phận) — duyên số.",
          "Câu ví dụ từ C-drama: 我想念你，每一天。(Wǒ xiǎngniàn nǐ, měi yītiān.) — Tôi nhớ em, mỗi ngày. | 这就是缘分吧。(Zhè jiùshì yuánfèn ba.) — Đây chính là duyên phận.",
        ],
      },
      {
        heading: "Nhóm 2: Buồn và hồi phục",
        paragraphs: [
          "难过 nánguò (nan quá) — buồn, khó chịu trong lòng. 伤心 shāngxīn (thương tâm) — đau lòng. 委屈 wěiqū (ủy khuất) — ấm ức, tủi thân. 孤独 gūdú (cô độc) — cô đơn. 绝望 juéwàng (tuyệt vọng) — tuyệt vọng. 释怀 shìhuái (thích hoài) — buông bỏ, không còn bận tâm. 重新开始 chóngxīn kāishǐ (trùng tân khai thủy) — bắt đầu lại từ đầu.",
          "Câu ví dụ: 没关系，慢慢来。(Méiguānxi, mànmàn lái.) — Không sao, cứ từ từ. | 是时候放手了。(Shì shíhòu fàngshǒu le.) — Đã đến lúc buông tay.",
        ],
      },
      {
        heading: "Nhóm 3: Động lực và trưởng thành",
        paragraphs: [
          "加油 jiāyóu (gia du) — cố lên! (từ phổ biến nhất trong tiếng Trung hiện đại). 坚持 jiānchí (kiên trì) — kiên trì, không bỏ cuộc. 成长 chéngzhǎng (thành trưởng) — trưởng thành. 努力 nǔlì (nỗ lực) — cố gắng. 骄傲 jiāo'ào (kiêu ngạo) — tự hào (cũng có nghĩa kiêu ngạo tùy ngữ cảnh). 感激 gǎnjī (cảm kích) — biết ơn. 幸福 xìngfú (hạnh phúc) — hạnh phúc (sâu sắc, lâu dài — khác happiness bề mặt).",
          "Câu thơ: 不积跬步，无以至千里。(Bù jī kuǐbù, wúyǐ zhì qiānlǐ.) — Không tích lũy từng bước nhỏ, không thể đi nghìn dặm. Học từ gắn với câu thơ, câu thoại có cảm xúc — đó là cách MandoMood được xây dựng.",
        ],
      },
    ],
  },
  {
    slug: "hoc-tieng-trung-qua-c-drama",
    title: "Học tiếng Trung qua C-drama: phương pháp passive learning cực mạnh",
    description:
      "C-drama không chỉ để giải trí — đây là tài nguyên học tiếng Trung miễn phí và hiệu quả nhất. Cách biến mỗi tập phim thành buổi học 45 phút mà không cần sách vở.",
    date: "2026-06-13",
    readMinutes: 7,
    tags: ["C-drama", "immersion", "passive learning", "nghe nói"],
    sections: [
      {
        heading: "Tại sao C-drama dạy tiếng Trung tốt hơn sách giáo khoa?",
        paragraphs: [
          "Sách giáo khoa dạy tiếng Trung \"chuẩn\" — nhưng không ai nói chuyện như trong sách. C-drama dạy bạn tiếng Trung thật: cách người trẻ Bắc Kinh nói với nhau, cách thể hiện cảm xúc, cách dùng từ lóng và thành ngữ. Đây là lý do người học qua immersion nói tự nhiên hơn người học qua sách — dù điểm ngữ pháp thấp hơn.",
          "Krashen's Input Hypothesis (1985) — một trong những lý thuyết có ảnh hưởng nhất trong language acquisition — đề xuất: người học tiến bộ khi tiếp xúc với input \"i+1\" (vừa đủ khó hơn trình độ hiện tại). C-drama ở HSK3-4 là i+1 hoàn hảo cho người học trung cấp. Bạn hiểu 70-80% — đủ để đoán 20% còn lại từ ngữ cảnh.",
        ],
      },
      {
        heading: "3 chế độ xem C-drama để học hiệu quả",
        paragraphs: [
          "Chế độ 1 — Active watching (Học chủ động): Bật phụ đề tiếng Trung. Dừng lại khi nghe từ lạ. Tra từ điển, ghi vào sổ tay hoặc lưu vào MandoMood. Tốt cho tuần đầu với một bộ phim mới — bạn đang xây nền từ vựng của series đó.",
          "Chế độ 2 — Shadowing (Nhái theo): Dừng sau mỗi câu thoại, nhái lại — cùng tốc độ, cùng cảm xúc, cùng ngữ điệu. Không cần hiểu 100% — não tự nhớ qua pattern. Đây là kỹ thuật actor dùng để học kịch bản. 15 phút shadowing mỗi ngày hiệu quả hơn 1 giờ học từ vựng.",
          "Chế độ 3 — Passive immersion (Nghe thụ động): Bật phim không nhìn màn hình — trong khi nấu ăn, tập thể dục, làm việc nhà. Não vẫn xử lý âm thanh ngầm. Sau 50-100 giờ passive immersion, nhiều từ bạn chưa từng học consciously bắt đầu xuất hiện tự nhiên khi nói.",
        ],
      },
      {
        heading: "5 bộ C-drama hay + dễ học nhất cho người mới",
        paragraphs: [
          "HSK2-3: 《家有儿女》(Gia hữu nhi nữ) — sitcom gia đình, lời thoại đơn giản, phát âm chuẩn Bắc Kinh. 《武林外传》(Võ lâm ngoại truyện) — hài hước, từ vựng phong phú, phát âm rõ ràng. Hai bộ này được cộng đồng học tiếng Trung toàn cầu khuyên cho người mới nhất.",
          "HSK3-4: 《请回答1988》phiên bản Trung (remake) — ngôn ngữ đời thường hiện đại. 《都挺好》(Đô đình hảo) — drama gia đình, từ vựng cảm xúc đa dạng. HSK4+: 《甄嬛传》(Chân Hoàn truyện) — cổ trang, ngôn ngữ văn học phong phú — khó nhưng cực kỳ giàu về từ vựng. Học qua phụ đề tiếng Việt trước, sau đó chuyển sang phụ đề tiếng Trung.",
        ],
      },
    ],
  },
  {
    slug: "10-cau-truc-cau-hsk3-co-ban",
    title: "10 cấu trúc câu HSK3 dùng nhiều nhất — nói tiếng Trung như người bản xứ",
    description:
      "Ngữ pháp tiếng Trung không phức tạp như bạn nghĩ — chỉ cần 10 cấu trúc này để nói được 80% tình huống giao tiếp hằng ngày ở trình độ trung cấp.",
    date: "2026-06-13",
    readMinutes: 6,
    tags: ["ngữ pháp", "HSK3", "cấu trúc câu", "giao tiếp"],
    sections: [
      {
        heading: "Tại sao HSK3 là \"turning point\" của người học tiếng Trung?",
        paragraphs: [
          "HSK1-2 đủ để mua đồ, hỏi đường. HSK3 là nơi bạn bắt đầu nói được cảm xúc, giải thích ý kiến, kể chuyện. 600 từ HSK3 kết hợp với 10 cấu trúc câu dưới đây cho phép bạn tham gia hầu hết cuộc trò chuyện thường ngày — đây là lý do HSK3 thường được coi là mức \"độc lập cơ bản\".",
          "Tiếng Trung không chia động từ theo thì (tense) như tiếng Anh — đây là tin mừng. Nhưng trật tự từ và các marker thì (了, 过, 着, 呢) rất quan trọng. 10 cấu trúc dưới đây bao phủ các pattern này một cách tự nhiên.",
        ],
      },
      {
        heading: "Cấu trúc 1-5: Nền tảng giao tiếp",
        paragraphs: [
          "1. 虽然…但是… (suīrán…dànshì…) — \"Tuy…nhưng…\": 虽然很累，但是很开心。(Tuy mệt nhưng rất vui.) 2. 因为…所以… (yīnwèi…suǒyǐ…) — \"Vì…nên…\": 因为下雨，所以没来。(Vì mưa nên không đến.) 3. 不但…而且… (búdàn…érqiě…) — \"Không chỉ…mà còn…\": 她不但漂亮，而且聪明。(Cô ấy không chỉ đẹp mà còn thông minh.) 4. 如果…就… (rúguǒ…jiù…) — \"Nếu…thì…\": 如果有时间，就来吧。(Nếu có thời gian thì đến nhé.) 5. 一边…一边… (yībiān…yībiān…) — \"Vừa…vừa…\": 他一边唱歌，一边跳舞。(Anh ấy vừa hát vừa nhảy.)",
          "5 cấu trúc đầu xuất hiện trong hầu hết bài đọc HSK3 và là nền tảng để nối ý tưởng. Học qua câu hoàn chỉnh — không học cấu trúc trơ không ngữ cảnh.",
        ],
      },
      {
        heading: "Cấu trúc 6-10: Nâng cao biểu đạt",
        paragraphs: [
          "6. 越来越… (yuèláiyuè…) — \"Càng ngày càng…\": 我的汉语越来越好了。(Tiếng Trung của tôi càng ngày càng tốt.) 7. 对…来说 (duì…láishuō) — \"Đối với… mà nói\": 对我来说，学中文很有趣。(Đối với tôi, học tiếng Trung rất thú vị.) 8. 除了…以外 (chúle…yǐwài) — \"Ngoài…ra\": 除了工作以外，他还学中文。(Ngoài làm việc ra, anh ấy còn học tiếng Trung.) 9. 是…的 (shì…de) — nhấn mạnh thông tin: 我是昨天来的。(Tôi đến hôm qua — nhấn thời gian.) 10. 把 (bǎ) — câu chủ động với tân ngữ trước động từ: 我把作业做完了。(Tôi đã làm xong bài tập.)",
          "Cấu trúc 把 (số 10) là điểm ngữ pháp HSK3 khiến nhiều người học nhầm nhất — nhưng logic của nó đơn giản: bạn \"xử lý\" một đối tượng cụ thể và kết quả xảy ra. Gặp một câu 把 trong C-drama, dừng lại và tự phân tích — đây là cách tốt nhất để nhớ.",
        ],
      },
    ],
  },
  {
    slug: "hoc-pinyin-tu-dau-cho-nguoi-viet",
    title: "Học pinyin từ đầu: hướng dẫn đầy đủ dành riêng cho người Việt",
    description:
      "Pinyin là bản đồ phát âm của tiếng Trung — không học pinyin đúng từ đầu, bạn sẽ phải sửa lỗi mãi. Guide đầy đủ nhất cho người Việt, có so sánh với âm tiếng Việt để học nhanh hơn.",
    date: "2026-06-13",
    readMinutes: 8,
    tags: ["pinyin", "phát âm", "người mới bắt đầu", "cơ bản"],
    sections: [
      {
        heading: "Pinyin là gì và tại sao quan trọng hơn bạn nghĩ?",
        paragraphs: [
          "Pinyin (拼音, pīnyīn — nghĩa đen: \"ghép âm\") là hệ thống phiên âm La-tinh chính thức của tiếng Trung Phổ thông (Mandarin). Được phát triển vào năm 1950s bởi chính phủ Trung Quốc, pinyin là công cụ để người học nước ngoài (và trẻ em Trung Quốc!) tiếp cận âm thanh của ngôn ngữ trước khi học chữ Hán.",
          "Sai lầm phổ biến nhất của người mới: đọc pinyin như đọc tiếng Anh. \"X\" trong pinyin không đọc là /eks/ — nó là âm /ɕ/, gần với \"s\" trong \"si\" của tiếng Việt. \"Q\" không phải /kjuː/ — là âm /tɕʰ/, gần \"ch\" nhưng nhẹ hơn. Học sai từ đầu rất khó sửa — dành 1 tuần để học pinyin đúng, bạn tiết kiệm 6 tháng sửa lỗi.",
        ],
      },
      {
        heading: "Bảng âm đầu (Initials) — so sánh với tiếng Việt",
        paragraphs: [
          "21 âm đầu tiếng Trung và cách người Việt dễ nhớ nhất: b/p/m/f — giống tiếng Việt hoàn toàn. d/t/n/l — cũng tương đương. g/k/h — gần giống, chỉ khác vị trí lưỡi một chút. Khó nhất với người Việt: zh/ch/sh/r (nhóm âm cuộn lưỡi — retroflex). Người Nam Bộ gặp khó vì không quen cuộn lưỡi. Mẹo: tưởng tượng lưỡi cong lên chạm vòm miệng khi nói zh/ch/sh — ngược với j/q/x (lưỡi phẳng, chạm răng trên).",
          "j/q/x là nhóm âm mà người Việt học nhanh nhất: x ≈ 's' trong 'si' | q ≈ 'ch' nhẹ (không bật hơi mạnh) | j ≈ 'gi' nhẹ. So sánh: 小 xiǎo (nhỏ) — âm x giống 's' trong 'siêu'. 七 qī (bảy) — âm q gần 'chi' nhưng lưỡi phẳng hơn.",
        ],
      },
      {
        heading: "Bảng âm cuối (Finals) + thanh điệu — lộ trình 2 tuần",
        paragraphs: [
          "Finals (âm cuối/vần): tiếng Trung có 35 finals. Người Việt học được nhiều finals nhanh nhờ hệ vần phong phú. Khó nhất: -ü (âm 'ư' tròn môi), -ian (đọc là 'yen' không phải 'ian'), -ong (gần 'ung' tiếng Việt). Đặc biệt: âm 'e' đứng một mình đọc là /ɤ/ — không phải 'e' của tiếng Việt hay tiếng Anh.",
          "Lộ trình 2 tuần học pinyin từ đầu: Tuần 1 — Ngày 1-3: initials b/p/m/f/d/t/n/l/g/k/h. Ngày 4-5: initials j/q/x và zh/ch/sh/r (khó nhất, cần nhiều thời gian). Ngày 6-7: finals cơ bản (-a/-o/-e/-i/-u/-ü). Tuần 2 — Ngày 8-10: finals kết hợp (-an/-en/-in/-un/-ün). Ngày 11-12: thanh điệu trên từ thật. Ngày 13-14: tổng ôn + shadowing câu ngắn. MandoMood có phần Luyện thanh điệu và Phát âm để thực hành sau khi học xong bảng pinyin.",
        ],
      },
    ],
  },
  {
    slug: "loi-the-nguoi-viet-hoc-tieng-trung",
    title: "5 lợi thế bất ngờ của người Việt khi học tiếng Trung — bạn đang ngồi trên kho báu",
    description:
      "Tiếng Việt và tiếng Trung có liên hệ sâu sắc hơn bạn tưởng. Người Việt có 5 lợi thế tự nhiên mà người Anh, Pháp, hay Nhật không có — đây là cách khai thác chúng.",
    date: "2026-06-13",
    readMinutes: 6,
    tags: ["người Việt học tiếng Trung", "Hán Việt", "lợi thế", "phương pháp"],
    sections: [
      {
        heading: "Lợi thế 1: Hệ thống thanh điệu (tonal language advantage)",
        paragraphs: [
          "Tiếng Việt có 6 thanh điệu, tiếng Trung có 4 thanh + neutral. Não người Việt từ khi sinh ra đã được lập trình để xử lý pitch (cao độ giọng) như thông tin ngữ nghĩa — không phải chỉ như intonation (ngữ điệu cảm xúc). Đây là thứ người Anh, người Pháp phải mất 1-2 năm mới bắt đầu nghe ra, còn người Việt cảm nhận được từ tuần đầu tiên.",
          "Theo nghiên cứu của Paul Iverson (UCL, 2008), người nói ngôn ngữ có thanh điệu xử lý thanh điệu ngoại ngữ nhanh hơn 40% so với người nói ngôn ngữ không thanh điệu. Bạn đang có lợi thế não bộ mà 80% người học tiếng Trung trên thế giới không có.",
        ],
      },
      {
        heading: "Lợi thế 2: Từ Hán-Việt — kho từ vựng 60%",
        paragraphs: [
          "Ước tính 60-70% từ vựng tiếng Việt hiện đại có nguồn gốc Hán-Việt — được vay mượn qua 1000 năm Bắc thuộc và giao thương. Điều này có nghĩa là: khi bạn nghe một từ tiếng Trung, bạn đã biết \"hình dạng\" của nó trong tiếng Việt. 经济 jīngjì = kinh tế | 文化 wénhuà = văn hóa | 教育 jiàoyù = giáo dục | 社会 shèhuì = xã hội | 政治 zhèngzhì = chính trị | 科学 kēxué = khoa học.",
          "Mẹo khai thác: khi gặp từ tiếng Trung mới, đọc to và tự hỏi \"từ Hán-Việt nào nghe giống vậy?\". Ví dụ: 自然 zìrán — nghe giống 'tự nhiên'. 平静 píngjìng — 'bình tĩnh'. 感情 gǎnqíng — 'cảm tình'. Bộ não người Việt có thể nhận ra pattern này tự nhiên hơn người học khác.",
        ],
      },
      {
        heading: "Lợi thế 3-5: Văn hóa, địa lý, và tư duy Á Đông",
        paragraphs: [
          "Lợi thế 3 — Văn hóa tương đồng: khái niệm \"mặt mũi\" (面子 miànzi), quan hệ gia đình phức tạp (có từ riêng cho từng vai vế), Tết âm lịch, thức ăn và phong tục — người Việt hiểu ngay ngữ cảnh mà người phương Tây phải học nhiều tháng. Ngôn ngữ không tồn tại ngoài văn hóa — hiểu văn hóa = hiểu ngôn ngữ sâu hơn.",
          "Lợi thế 4 — Địa lý: sát biên giới, tiếp xúc với người Trung Quốc hàng ngày ở nhiều vùng. Cơ hội thực hành input thật sự (nghe, nói với người bản xứ) dễ hơn nhiều so với học ở châu Âu. Lợi thế 5 — Tư duy visual: người Việt quen với chữ viết tay, thư pháp (dù chữ Quốc ngữ), và visual learning từ văn hóa Á Đông — giúp nhớ chữ Hán tốt hơn qua visual mnemonics. MandoMood được xây dựng để khai thác đúng 5 lợi thế này — từ Hán-Việt hooks đến emotional storytelling phù hợp văn hóa Việt.",
        ],
      },
    ],
  },
  {
    slug: "spaced-repetition-hoc-tu-vung-khoa-hoc",
    title: "Spaced Repetition: Khoa học giúp bạn nhớ tiếng Trung mãi mãi",
    description:
      "Tại sao ôn tập 1 lần mỗi ngày kém hiệu quả hơn ôn tập đúng thời điểm? Spaced Repetition là thuật toán não bộ mà các ứng dụng hàng đầu như Anki sử dụng — và MandoMood tích hợp sẵn.",
    date: "2026-06-13",
    readMinutes: 7,
    tags: ["spaced repetition", "SRS", "flashcard", "ghi nhớ", "khoa học học tập"],
    sections: [
      {
        heading: "Đường cong quên lãng — tại sao não bạn xóa tiếng Trung sau 1 ngày",
        paragraphs: [
          "Hermann Ebbinghaus (nhà tâm lý học Đức, 1885) phát hiện ra đường cong quên lãng (Forgetting Curve): không ôn tập, chúng ta quên 50% kiến thức mới trong 1 giờ, 70% trong 24 giờ, 90% trong 1 tuần. Điều này giải thích tại sao học 200 từ trong 1 buổi tối xong sáng hôm sau không nhớ được bao nhiêu.",
          "Spaced Repetition (SRS — Hệ thống ôn tập cách quãng) là giải pháp: ôn lại đúng thời điểm khi não sắp quên. Não bộ diễn giải \"ôn lại khi sắp quên\" là \"thông tin này quan trọng\" và tăng cường ghi nhớ dài hạn. Mỗi lần ôn thành công, khoảng cách đến lần ôn tiếp theo tăng lên (1 ngày → 3 ngày → 1 tuần → 2 tuần → 1 tháng).",
        ],
      },
      {
        heading: "Thuật toán SM-2 — trái tim của SRS hiện đại",
        paragraphs: [
          "SM-2 (SuperMemo 2, 1987) là thuật toán SRS phổ biến nhất, được Anki và nhiều ứng dụng khác sử dụng. Cơ chế: sau mỗi lần ôn, bạn đánh giá độ khó (1-5). Dễ nhớ → khoảng cách lần sau dài hơn. Khó nhớ → lần sau sớm hơn và quay lại đầu. MandoMood Flashcard tích hợp SRS — mỗi thẻ được theo dõi riêng với lịch ôn tập cá nhân hóa.",
          "Hiệu quả thực tế: nghiên cứu của Piotr Woźniak (người tạo ra SM-2) cho thấy SRS giúp duy trì 90%+ retention với chỉ 20 phút ôn tập mỗi ngày — so với học thuộc lòng truyền thống cần 2-3 giờ để đạt kết quả tương đương. Với tiếng Trung — ngôn ngữ có 3000-5000 từ cần thiết cho đọc báo — SRS là con đường duy nhất thực tế để xây dựng kho từ vựng bền vững.",
        ],
      },
      {
        heading: "Cách dùng SRS hiệu quả với tiếng Trung — 3 nguyên tắc",
        paragraphs: [
          "Nguyên tắc 1 — Học ÍT, ôn NHIỀU: thêm tối đa 10-20 từ mới mỗi ngày. Thêm nhiều hơn → số thẻ cần ôn tích lũy nhanh → overwhelm → bỏ cuộc. Nguyên tắc 2 — Luôn có câu ví dụ: học '爱' không chỉ là 'tình yêu' — học '我爱你' + '爱人' + '可爱'. Não nhớ từ trong pattern tốt hơn từ đơn lẻ. Nguyên tắc 3 — Ôn đầu ngày, không cuối ngày: nghiên cứu của Harvard Medical School (2007) cho thấy ôn tập 30 phút sau khi thức dậy hiệu quả hơn ôn tập buổi tối vì não đã được 'consolidate' ký ức trong lúc ngủ.",
          "MandoMood tích hợp SRS trong /my-decks và /review. Khi bạn lưu từ vào Sổ tay từ /reading hoặc /character/[hanzi], từ đó tự động vào SRS queue. /review sẽ nhắc bạn ôn đúng ngày theo lịch SM-2. Đây là vòng lặp học lý tưởng: đọc truyện → gặp từ mới → lưu → SRS ôn lại → nhớ mãi.",
        ],
      },
    ],
  },
  {
    slug: "tieng-trung-cho-nguoi-yeu-k-drama-cdrama",
    title: "Từ K-drama đến C-drama: học tiếng Trung cho fan châu Á",
    description:
      "Nếu bạn đã nghiện K-drama, bạn có nền tảng tốt hơn tưởng để học tiếng Trung qua C-drama. Hướng dẫn chuyển đổi dành cho fan châu Á muốn mở rộng sang ngôn ngữ thứ hai.",
    date: "2026-06-13",
    readMinutes: 6,
    tags: ["C-drama", "K-drama", "fan châu Á", "văn hóa", "immersion"],
    sections: [
      {
        heading: "Fan K-drama có lợi thế gì khi học tiếng Trung?",
        paragraphs: [
          "K-drama đã train não bạn theo nhiều cách quan trọng: bạn đã quen với việc xem phụ đề trong khi theo dõi diễn xuất — khả năng multi-task ngôn ngữ + visual này rất quan trọng cho immersion learning. Bạn đã quen với văn hóa Á Đông: cách thể hiện tình cảm, động lực gia đình, áp lực xã hội — tất cả đều tương đồng giữa drama Hàn và Trung. Và bạn đã có thói quen \"just one more episode\" — thói quen ngồi xem nhiều giờ mà không thấy mệt.",
          "Điều khác biệt: tiếng Hàn và tiếng Trung là hai ngôn ngữ hoàn toàn khác nhau về cấu trúc. Tuy nhiên, nhiều từ vựng văn hóa châu Á tương đồng (K-drama dùng nhiều từ Hán-Hàn có âm gần với Hán-Việt). 드라마 (deurama) ← 戏剧 (xìjù). 사랑 (sarang — tình yêu) ← khác hoàn toàn, nhưng 애인 (aein — người yêu) ← 爱人 (àiren) — cùng gốc Hán.",
        ],
      },
      {
        heading: "5 C-drama nên xem đầu tiên nếu bạn là fan K-drama",
        paragraphs: [
          "Nếu thích romance: 《你好，旧时光》(You Are My Glory) — tình yêu học đường ngọt ngào, ngôn ngữ hiện đại. 《以家人之名》(Go Ahead) — gia đình phi truyền thống, cảm xúc sâu sắc — gần với K-drama melodrama. Nếu thích fantasy: 《陈情令》(The Untamed) — BL bromance fantasy, được fan toàn cầu yêu thích, đối thoại phong phú. Nếu thích lịch sử: 《琅琊榜》(Nirvana in Fire) — cổ trang chính trị, như Game of Thrones nhưng Trung Quốc — ngôn ngữ cổ phức tạp nhưng cốt truyện xuất sắc. Nếu thích nhẹ nhàng: 《请叫我总监》— romcom văn phòng hiện đại, từ vựng thường ngày.",
          "Chiến lược xem: tuần đầu với phụ đề tiếng Việt để hiểu cốt truyện và quen với nhân vật. Tuần 2 thêm phụ đề tiếng Trung bên dưới (dual subtitle). Tuần 3+ chỉ dùng phụ đề tiếng Trung. Mỗi ngày 1 tập (45 phút) = 315 phút tiếng Trung/tuần — tương đương 2 lớp học tại trường. Cảm xúc và nhân vật giúp bạn nhớ từ vựng tốt hơn bất kỳ bài tập nào.",
        ],
      },
      {
        heading: "Từ K-drama sang C-drama: lộ trình 3 tháng",
        paragraphs: [
          "Tháng 1 — Foundation: học 300 từ HSK1-2 (dùng /hsk trên MandoMood), học pinyin trong 2 tuần. Song song: xem C-drama với phụ đề Việt để làm quen ear. Mục tiêu: nhận ra 20-30% từ khi nghe.",
          "Tháng 2 — Immersion: thêm phụ đề tiếng Trung. Mỗi tập dừng lại 3-5 lần để tra từ mới, lưu vào Sổ tay. Dùng Shadowing (lặp lại câu thoại) cho 5 phút mỗi ngày. Tháng 3 — Consolidation: ôn tập SRS hàng ngày (10-15 phút). Thử xem 1 tập không có phụ đề. Đặt mục tiêu: hiểu được 50% cuộc hội thoại thường ngày. Sau 3 tháng, bạn sẽ không chỉ học được tiếng Trung — bạn sẽ thực sự yêu nó.",
        ],
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}
