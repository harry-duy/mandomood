/**
 * communityDemo.ts — KHO bài đăng mẫu cho /community (hiển thị khi DB chưa có bài).
 *
 * Trước đây chỉ có 4 bài CỐ ĐỊNH, lặp y hệt mỗi lần mở → nhàm. Nay gom một KHO lớn
 * (câu nói hay / câu chuyện nhỏ / câu hỏi) đúng tinh thần MandoMood, và `getDemoPosts`
 * TRỘN NGẪU NHIÊN + gán thời gian gần đây mới mỗi lần gọi → mỗi lần vào thấy khác nhau.
 */

import { shuffle } from "@/lib/shuffle";

export interface DemoPost {
  _id: string;
  author_name: string;
  author_image: string | null;
  type: "quote" | "story" | "question";
  chinese_text: string;
  pinyin?: string;
  translation: string;
  mood?: string;
  level?: string;
  like_count: number;
  likes: string[];
  comment_count?: number;
  is_verified: boolean;
  created_at: string;
}

type SeedPost = Omit<DemoPost, "created_at">;

/** Kho bài mẫu — đa dạng mood / level / loại. Thêm bài mới chỉ cần nối vào đây. */
const POOL: SeedPost[] = [
  {
    _id: "s1", author_name: "Hana 花花", author_image: null, type: "quote",
    chinese_text: "再难的路，走着走着就习惯了。",
    pinyin: "Zài nán de lù, zǒuzhe zǒuzhe jiù xíguàn le.",
    translation: "Con đường dù khó đến đâu, đi mãi rồi cũng quen.",
    mood: "motivation", level: "hsk3", like_count: 148, likes: [], is_verified: false, comment_count: 12,
  },
  {
    _id: "s2", author_name: "Trà My 🌸", author_image: null, type: "quote",
    chinese_text: "有时候，沉默是最好的回答。",
    pinyin: "Yǒushíhòu, chénmò shì zuì hǎo de huídá.",
    translation: "Đôi khi, im lặng là câu trả lời tốt nhất.",
    mood: "aesthetic", level: "hsk3", like_count: 92, likes: [], is_verified: true, comment_count: 8,
  },
  {
    _id: "s3", author_name: "Kevin Hoàng", author_image: null, type: "story",
    chinese_text: "那天下雨，她站在咖啡馆门口，低头看手机。我鼓起勇气走过去说：「借我一把伞，好吗？」",
    pinyin: "Nà tiān xià yǔ, tā zhàn zài kāfēiguǎn ménkǒu, dītóu kàn shǒujī. Wǒ gǔqǐ yǒngqì zǒu guòqù shuō: jiè wǒ yì bǎ sǎn, hǎo ma?",
    translation: "Hôm đó trời mưa, cô ấy đứng trước cửa quán cà phê, cúi đầu nhìn điện thoại. Tôi lấy hết can đảm bước tới hỏi: «Cho tôi mượn một chiếc ô được không?»",
    mood: "romantic", level: "hsk4", like_count: 67, likes: [], is_verified: false, comment_count: 5,
  },
  {
    _id: "s4", author_name: "Ngọc Ánh", author_image: null, type: "question",
    chinese_text: "「缘分」和「命运」有什么区别？",
    pinyin: "Yuánfèn hé mìngyùn yǒu shénme qūbié?",
    translation: "«Duyên phận» và «số mệnh» khác nhau như thế nào?",
    mood: "aesthetic", level: "hsk5", like_count: 34, likes: [], is_verified: false, comment_count: 21,
  },
  {
    _id: "s5", author_name: "Minh Tuấn", author_image: null, type: "quote",
    chinese_text: "今天的努力，是明天的运气。",
    pinyin: "Jīntiān de nǔlì, shì míngtiān de yùnqì.",
    translation: "Nỗ lực hôm nay chính là may mắn của ngày mai.",
    mood: "motivation", level: "hsk2", like_count: 203, likes: [], is_verified: true, comment_count: 17,
  },
  {
    _id: "s6", author_name: "Lan Anh", author_image: null, type: "quote",
    chinese_text: "慢慢来，比较快。",
    pinyin: "Màn man lái, bǐjiào kuài.",
    translation: "Cứ từ từ, lại hóa ra nhanh hơn.",
    mood: "healing", level: "hsk2", like_count: 176, likes: [], is_verified: false, comment_count: 9,
  },
  {
    _id: "s7", author_name: "Bảo Long", author_image: null, type: "story",
    chinese_text: "奶奶常说：「家里有饭，心里就不慌。」长大后我才懂这句话的温度。",
    pinyin: "Nǎinai cháng shuō: jiālǐ yǒu fàn, xīnlǐ jiù bù huāng. Zhǎngdà hòu wǒ cái dǒng zhè jù huà de wēndù.",
    translation: "Bà thường nói: «Nhà còn cơm thì lòng không hoảng.» Lớn lên tôi mới hiểu hơi ấm của câu nói ấy.",
    mood: "healing", level: "hsk4", like_count: 88, likes: [], is_verified: false, comment_count: 6,
  },
  {
    _id: "s8", author_name: "Celine Nhi", author_image: null, type: "quote",
    chinese_text: "你那么努力，一定会被生活温柔以待。",
    pinyin: "Nǐ nàme nǔlì, yídìng huì bèi shēnghuó wēnróu yǐ dài.",
    translation: "Bạn cố gắng đến vậy, nhất định sẽ được cuộc đời đối xử dịu dàng.",
    mood: "motivation", level: "hsk4", like_count: 312, likes: [], is_verified: true, comment_count: 24,
  },
  {
    _id: "s9", author_name: "Phương Linh", author_image: null, type: "quote",
    chinese_text: "月亮不会发光，但它依然照亮了夜晚。",
    pinyin: "Yuèliàng bú huì fāguāng, dàn tā yīrán zhàoliàng le yèwǎn.",
    translation: "Mặt trăng không tự phát sáng, nhưng vẫn soi sáng màn đêm.",
    mood: "aesthetic", level: "hsk3", like_count: 145, likes: [], is_verified: false, comment_count: 11,
  },
  {
    _id: "s10", author_name: "Đức Anh", author_image: null, type: "question",
    chinese_text: "学中文时，你觉得最难的是什么？声调还是汉字？",
    pinyin: "Xué zhōngwén shí, nǐ juéde zuì nán de shì shénme? Shēngdiào háishì hànzì?",
    translation: "Khi học tiếng Trung, bạn thấy khó nhất là gì? Thanh điệu hay chữ Hán?",
    mood: "friendship", level: "hsk3", like_count: 56, likes: [], is_verified: false, comment_count: 38,
  },
  {
    _id: "s11", author_name: "Ryan Phúc", author_image: null, type: "quote",
    chinese_text: "别害怕慢，只害怕停。",
    pinyin: "Bié hàipà màn, zhǐ hàipà tíng.",
    translation: "Đừng sợ chậm, chỉ sợ dừng lại.",
    mood: "motivation", level: "hsk2", like_count: 267, likes: [], is_verified: false, comment_count: 14,
  },
  {
    _id: "s12", author_name: "Thu Hà", author_image: null, type: "story",
    chinese_text: "毕业那天，我们都没有哭。只是约定：十年后，还在这家小店见。",
    pinyin: "Bìyè nà tiān, wǒmen dōu méiyǒu kū. Zhǐshì yuēdìng: shí nián hòu, hái zài zhè jiā xiǎo diàn jiàn.",
    translation: "Ngày tốt nghiệp, chúng tôi đều không khóc. Chỉ hẹn nhau: mười năm sau, vẫn gặp ở quán nhỏ này.",
    mood: "friendship", level: "hsk4", like_count: 134, likes: [], is_verified: false, comment_count: 7,
  },
  {
    _id: "s13", author_name: "Gia Hân", author_image: null, type: "quote",
    chinese_text: "有些人，留在回忆里就好。",
    pinyin: "Yǒuxiē rén, liú zài huíyì lǐ jiù hǎo.",
    translation: "Có những người, để lại trong ký ức là đủ rồi.",
    mood: "sad", level: "hsk3", like_count: 198, likes: [], is_verified: false, comment_count: 19,
  },
  {
    _id: "s14", author_name: "小北 Tiểu Bắc", author_image: null, type: "quote",
    chinese_text: "热爱可抵岁月漫长。",
    pinyin: "Rè'ài kě dǐ suìyuè màncháng.",
    translation: "Đam mê có thể chống lại tháng năm dằng dặc.",
    mood: "motivation", level: "hsk5", like_count: 221, likes: [], is_verified: true, comment_count: 16,
  },
  {
    _id: "s15", author_name: "Quỳnh Như", author_image: null, type: "quote",
    chinese_text: "今天也要好好吃饭，好好睡觉，好好爱自己。",
    pinyin: "Jīntiān yě yào hǎohǎo chīfàn, hǎohǎo shuìjiào, hǎohǎo ài zìjǐ.",
    translation: "Hôm nay cũng phải ăn cho ngon, ngủ cho đủ, và yêu lấy bản thân.",
    mood: "healing", level: "hsk2", like_count: 289, likes: [], is_verified: false, comment_count: 22,
  },
  {
    _id: "s16", author_name: "Hoàng Nam", author_image: null, type: "question",
    chinese_text: "如果可以对三年前的自己说一句话，你会说什么？",
    pinyin: "Rúguǒ kěyǐ duì sān nián qián de zìjǐ shuō yí jù huà, nǐ huì shuō shénme?",
    translation: "Nếu được nói một câu với chính mình ba năm trước, bạn sẽ nói gì?",
    mood: "sad", level: "hsk4", like_count: 73, likes: [], is_verified: false, comment_count: 41,
  },
  {
    _id: "s17", author_name: "Mèo Lười 🐱", author_image: null, type: "quote",
    chinese_text: "我不是懒，我只是在节约能量。",
    pinyin: "Wǒ bú shì lǎn, wǒ zhǐshì zài jiéyuē néngliàng.",
    translation: "Tôi không lười đâu, tôi chỉ đang tiết kiệm năng lượng thôi.",
    mood: "funny", level: "hsk2", like_count: 312, likes: [], is_verified: false, comment_count: 28,
  },
  {
    _id: "s18", author_name: "Tuệ Minh", author_image: null, type: "quote",
    chinese_text: "星光不问赶路人，时光不负有心人。",
    pinyin: "Xīngguāng bú wèn gǎnlùrén, shíguāng bú fù yǒuxīnrén.",
    translation: "Ánh sao chẳng hỏi người vội bước, thời gian không phụ kẻ có lòng.",
    mood: "motivation", level: "hsk5", like_count: 256, likes: [], is_verified: true, comment_count: 13,
  },
  {
    _id: "s19", author_name: "Bích Ngọc", author_image: null, type: "story",
    chinese_text: "第一次用中文点奶茶，我紧张到说错了三次。店员笑着说：「没关系，慢慢说。」那一刻我爱上了这门语言。",
    pinyin: "Dì-yī cì yòng zhōngwén diǎn nǎichá, wǒ jǐnzhāng dào shuō cuò le sān cì. Diànyuán xiàozhe shuō: méi guānxi, màn man shuō. Nà yí kè wǒ ài shàng le zhè mén yǔyán.",
    translation: "Lần đầu gọi trà sữa bằng tiếng Trung, tôi run đến mức nói sai ba lần. Cô nhân viên cười bảo: «Không sao, cứ nói từ từ.» Khoảnh khắc ấy tôi đã yêu thứ tiếng này.",
    mood: "healing", level: "hsk4", like_count: 167, likes: [], is_verified: false, comment_count: 15,
  },
  {
    _id: "s20", author_name: "An Nhiên", author_image: null, type: "quote",
    chinese_text: "愿你走出半生，归来仍是少年。",
    pinyin: "Yuàn nǐ zǒuchū bànshēng, guīlái réng shì shàonián.",
    translation: "Mong bạn đi hết nửa đời, trở về vẫn là thiếu niên.",
    mood: "aesthetic", level: "hsk5", like_count: 301, likes: [], is_verified: true, comment_count: 20,
  },
  {
    _id: "s21", author_name: "Khánh Vy", author_image: null, type: "quote",
    chinese_text: "成年人的字典里，没有「容易」两个字。",
    pinyin: "Chéngniánrén de zìdiǎn lǐ, méiyǒu róngyì liǎng ge zì.",
    translation: "Trong từ điển của người lớn, không có hai chữ «dễ dàng».",
    mood: "motivation", level: "hsk3", like_count: 119, likes: [], is_verified: false, comment_count: 10,
  },
  {
    _id: "s22", author_name: "阿福 A Phúc", author_image: null, type: "quote",
    chinese_text: "钱不是问题，问题是没钱。",
    pinyin: "Qián bú shì wèntí, wèntí shì méi qián.",
    translation: "Tiền không phải là vấn đề, vấn đề là không có tiền.",
    mood: "funny", level: "hsk2", like_count: 344, likes: [], is_verified: false, comment_count: 31,
  },
  {
    _id: "s23", author_name: "Diệu Linh", author_image: null, type: "quote",
    chinese_text: "你来人间一趟，要看看太阳。",
    pinyin: "Nǐ lái rénjiān yí tàng, yào kànkan tàiyáng.",
    translation: "Bạn đến nhân gian một chuyến, hãy ngắm nhìn mặt trời.",
    mood: "healing", level: "hsk3", like_count: 188, likes: [], is_verified: false, comment_count: 12,
  },
  {
    _id: "s24", author_name: "Tâm Như", author_image: null, type: "question",
    chinese_text: "你最喜欢的一句中文是什么？为什么？",
    pinyin: "Nǐ zuì xǐhuān de yí jù zhōngwén shì shénme? Wèishéme?",
    translation: "Câu tiếng Trung bạn thích nhất là gì? Vì sao?",
    mood: "friendship", level: "hsk2", like_count: 64, likes: [], is_verified: false, comment_count: 47,
  },
  {
    _id: "s25", author_name: "Vân Khánh", author_image: null, type: "quote",
    chinese_text: "把每一天，过成喜欢的样子。",
    pinyin: "Bǎ měi yì tiān, guò chéng xǐhuān de yàngzi.",
    translation: "Hãy sống mỗi ngày theo cách mà bạn yêu thích.",
    mood: "healing", level: "hsk3", like_count: 174, likes: [], is_verified: false, comment_count: 9,
  },
  {
    _id: "s26", author_name: "Đăng Khoa", author_image: null, type: "quote",
    chinese_text: "努力的意义，是为了将来有得选。",
    pinyin: "Nǔlì de yìyì, shì wèile jiānglái yǒu de xuǎn.",
    translation: "Ý nghĩa của nỗ lực là để tương lai có quyền lựa chọn.",
    mood: "motivation", level: "hsk4", like_count: 233, likes: [], is_verified: true, comment_count: 18,
  },
  {
    _id: "s27", author_name: "Hải Yến", author_image: null, type: "quote",
    chinese_text: "和喜欢的人聊天，连标点符号都在笑。",
    pinyin: "Hé xǐhuān de rén liáotiān, lián biāodiǎn fúhào dōu zài xiào.",
    translation: "Trò chuyện với người mình thích, đến cả dấu câu cũng đang cười.",
    mood: "romantic", level: "hsk4", like_count: 198, likes: [], is_verified: false, comment_count: 11,
  },
  {
    _id: "s28", author_name: "猫小姐 Cô Mèo", author_image: null, type: "quote",
    chinese_text: "周一的我，电量只有百分之一。",
    pinyin: "Zhōuyī de wǒ, diànliàng zhǐyǒu bǎi fēn zhī yī.",
    translation: "Tôi của thứ Hai, pin chỉ còn một phần trăm.",
    mood: "funny", level: "hsk3", like_count: 287, likes: [], is_verified: false, comment_count: 25,
  },
  {
    _id: "s29", author_name: "Thanh Trúc", author_image: null, type: "story",
    chinese_text: "妈妈不会用智能手机，却把我每条朋友圈都点了赞。原来爱，是笨拙地学着靠近你。",
    pinyin: "Māma bú huì yòng zhìnéng shǒujī, què bǎ wǒ měi tiáo péngyǒuquān dōu diǎn le zàn. Yuánlái ài, shì bènzhuō de xuézhe kàojìn nǐ.",
    translation: "Mẹ không biết dùng điện thoại thông minh, nhưng bài đăng nào của tôi mẹ cũng thả tim. Hóa ra yêu thương là vụng về học cách đến gần bạn.",
    mood: "healing", level: "hsk5", like_count: 256, likes: [], is_verified: true, comment_count: 14,
  },
  {
    _id: "s30", author_name: "Quốc Bảo", author_image: null, type: "quote",
    chinese_text: "你只管努力，剩下的交给时间。",
    pinyin: "Nǐ zhǐguǎn nǔlì, shèngxià de jiāo gěi shíjiān.",
    translation: "Bạn cứ cố gắng, phần còn lại hãy giao cho thời gian.",
    mood: "motivation", level: "hsk3", like_count: 211, likes: [], is_verified: false, comment_count: 8,
  },
  {
    _id: "s31", author_name: "Mỹ Duyên", author_image: null, type: "question",
    chinese_text: "你是因为什么开始学中文的？一首歌，还是一个人？",
    pinyin: "Nǐ shì yīnwèi shénme kāishǐ xué zhōngwén de? Yì shǒu gē, háishì yí ge rén?",
    translation: "Bạn bắt đầu học tiếng Trung vì điều gì? Một bài hát, hay một người?",
    mood: "friendship", level: "hsk4", like_count: 88, likes: [], is_verified: false, comment_count: 52,
  },
  {
    _id: "s32", author_name: "Tiến Đạt", author_image: null, type: "quote",
    chinese_text: "慢慢走，别慌，月亮也不慌。",
    pinyin: "Màn man zǒu, bié huāng, yuèliàng yě bù huāng.",
    translation: "Cứ đi từ từ, đừng vội, mặt trăng cũng chẳng vội.",
    mood: "aesthetic", level: "hsk3", like_count: 169, likes: [], is_verified: false, comment_count: 10,
  },
  {
    _id: "s33", author_name: "Linh Đan", author_image: null, type: "quote",
    chinese_text: "难过的时候，记得好好吃饭。",
    pinyin: "Nánguò de shíhòu, jìde hǎohǎo chīfàn.",
    translation: "Lúc buồn, nhớ ăn uống cho tử tế nhé.",
    mood: "sad", level: "hsk2", like_count: 192, likes: [], is_verified: false, comment_count: 13,
  },
  {
    _id: "s34", author_name: "阿哲 A Triết", author_image: null, type: "quote",
    chinese_text: "梦想还是要有的，万一实现了呢？",
    pinyin: "Mèngxiǎng háishì yào yǒu de, wàn yī shíxiàn le ne?",
    translation: "Vẫn cứ phải có ước mơ, lỡ đâu nó thành thật thì sao?",
    mood: "motivation", level: "hsk4", like_count: 245, likes: [], is_verified: true, comment_count: 16,
  },
  {
    _id: "s35", author_name: "Bảo Trân", author_image: null, type: "quote",
    chinese_text: "愿所有的等待，都有温柔的结果。",
    pinyin: "Yuàn suǒyǒu de děngdài, dōu yǒu wēnróu de jiéguǒ.",
    translation: "Mong mọi sự chờ đợi đều có một kết quả dịu dàng.",
    mood: "healing", level: "hsk4", like_count: 218, likes: [], is_verified: false, comment_count: 12,
  },
  {
    _id: "s36", author_name: "Hữu Tài", author_image: null, type: "story",
    chinese_text: "他每天背二十个单词，坚持了三百天。有人问他累不累，他说：「比起后悔，这点累算什么。」",
    pinyin: "Tā měitiān bèi èrshí ge dāncí, jiānchí le sānbǎi tiān. Yǒurén wèn tā lèi bú lèi, tā shuō: bǐqǐ hòuhuǐ, zhè diǎn lèi suàn shénme.",
    translation: "Anh ấy mỗi ngày học hai mươi từ, kiên trì suốt ba trăm ngày. Có người hỏi có mệt không, anh đáp: «So với hối tiếc, chút mệt này là gì.»",
    mood: "motivation", level: "hsk5", like_count: 176, likes: [], is_verified: false, comment_count: 9,
  },
  {
    _id: "s37", author_name: "Ý Nhi", author_image: null, type: "quote",
    chinese_text: "今天的月亮，借你看一眼。",
    pinyin: "Jīntiān de yuèliàng, jiè nǐ kàn yì yǎn.",
    translation: "Mặt trăng hôm nay, cho bạn mượn ngắm một cái.",
    mood: "aesthetic", level: "hsk2", like_count: 203, likes: [], is_verified: false, comment_count: 15,
  },
  {
    _id: "s38", author_name: "Trọng Nhân", author_image: null, type: "question",
    chinese_text: "学一门语言，最幸福的瞬间是什么？",
    pinyin: "Xué yì mén yǔyán, zuì xìngfú de shùnjiān shì shénme?",
    translation: "Khi học một ngôn ngữ, khoảnh khắc hạnh phúc nhất là gì?",
    mood: "friendship", level: "hsk4", like_count: 71, likes: [], is_verified: false, comment_count: 44,
  },
  {
    _id: "s39", author_name: "Cẩm Tú", author_image: null, type: "quote",
    chinese_text: "别让昨天的雨，淋湿今天的太阳。",
    pinyin: "Bié ràng zuótiān de yǔ, lín shī jīntiān de tàiyáng.",
    translation: "Đừng để cơn mưa hôm qua làm ướt mặt trời hôm nay.",
    mood: "motivation", level: "hsk4", like_count: 229, likes: [], is_verified: false, comment_count: 11,
  },
  {
    _id: "s40", author_name: "小鹿 Tiểu Lộc", author_image: null, type: "quote",
    chinese_text: "好好生活，慢慢相遇。",
    pinyin: "Hǎohǎo shēnghuó, màn man xiāngyù.",
    translation: "Sống cho thật tốt, rồi từ từ sẽ gặp được nhau.",
    mood: "romantic", level: "hsk2", like_count: 261, likes: [], is_verified: true, comment_count: 19,
  },
];

/** Số bài mẫu tối đa lấy mỗi lần. */
const DEFAULT_COUNT = 12;

/**
 * Lấy danh sách bài mẫu ĐÃ TRỘN ngẫu nhiên (mỗi lần gọi khác nhau) + gán thời gian
 * gần đây (mới → cũ) để timeAgo sống động và sort "mới" hợp lý.
 * @param opts.mood lọc theo mood (bỏ qua nếu "all"/rỗng hoặc mood không có bài).
 * @param opts.count số bài tối đa.
 */
export function getDemoPosts(
  opts: { mood?: string; count?: number; sort?: "new" | "hot" } = {}
): DemoPost[] {
  const { mood, count = DEFAULT_COUNT, sort = "new" } = opts;

  let pool = POOL;
  if (mood && mood !== "all") {
    const filtered = POOL.filter((p) => p.mood === mood);
    if (filtered.length > 0) pool = filtered;
  }

  // Trộn để chọn ngẫu nhiên; nếu "hot" thì xếp lại theo like_count giảm dần
  // (đúng nghĩa tab "Hot" — trước đây tab Hot trên data mẫu vẫn ra thứ tự thời gian).
  let picked = shuffle(pool).slice(0, count);
  if (sort === "hot") {
    picked = [...picked].sort((a, b) => b.like_count - a.like_count);
  }

  const now = Date.now();
  let acc = 0; // cộng dồn để thời gian LUÔN giảm dần (bài đầu mới nhất).
  return picked.map((p, i) => {
    if (i > 0) acc += 2_700_000 + Math.floor(Math.random() * 7_200_000); // cách nhau 0.75–2.75h
    return { ...p, created_at: new Date(now - acc).toISOString() };
  });
}

/** Tập tĩnh (KHÔNG random) để render lần đầu (SSR) tránh lệch hydrate; client sẽ trộn lại. */
export const DEMO_POSTS_STATIC: DemoPost[] = POOL.slice(0, 6).map((p, i) => ({
  ...p,
  created_at: new Date(Date.now() - (i + 1) * 5_400_000).toISOString(),
}));
