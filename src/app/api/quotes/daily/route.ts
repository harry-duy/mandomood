/**
 * GET /api/quotes/daily
 * Lấy quote của ngày hôm nay
 * Khi DB trống → xoay 15 câu tĩnh theo ngày trong năm (không bao giờ nhàm)
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import { dailyRotationIndex } from "@/lib/daily";
import { toVnTime, vnDayStart } from "@/lib/premium";

// ── Static fallback pool (xoay theo ngày) ─────────────────────────────────────
const STATIC_QUOTES = [
  {
    chinese_text: "有些人只能陪你走一段路",
    pinyin: "Yǒu xiē rén zhǐ néng péi nǐ zǒu yī duàn lù",
    translation: "Có những người chỉ có thể đồng hành cùng bạn một đoạn đường.",
    mood: "romantic", level: "hsk2",
    cultural_note: "Câu này phản ánh triết lý Phật giáo về vô thường trong mối quan hệ — mọi người đến và đi đều có ý nghĩa.",
    author: null,
  },
  {
    chinese_text: "你不需要完美，你只需要真实",
    pinyin: "Nǐ bù xūyào wánměi, nǐ zhǐ xūyào zhēnshí",
    translation: "Bạn không cần hoàn hảo, bạn chỉ cần chân thật.",
    mood: "healing", level: "hsk3",
    cultural_note: "Giá trị 真实 (chân thật) được đề cao trong văn hóa Trung Quốc hiện đại, đặc biệt với Gen Z.",
    author: null,
  },
  {
    chinese_text: "不积跬步，无以至千里",
    pinyin: "Bù jī kuǐbù, wúyǐ zhì qiānlǐ",
    translation: "Không tích lũy từng bước nhỏ, không thể đi nghìn dặm.",
    mood: "motivation", level: "hsk4",
    cultural_note: "Thành ngữ cổ điển từ Tuân Tử, vẫn được dùng rộng rãi trong tiếng Trung hiện đại để nói về sự kiên trì.",
    author: "荀子",
  },
  {
    chinese_text: "人生若只如初见",
    pinyin: "Rénshēng ruò zhǐ rú chū jiàn",
    translation: "Giá như cuộc đời mãi đẹp như lần đầu gặp gỡ.",
    mood: "aesthetic", level: "hsk5",
    cultural_note: "Câu thơ nổi tiếng nhất của Nạp Lan Tính Đức (清朝). Được yêu thích nhất trên Weibo trong nhiều năm liền.",
    author: "纳兰性德",
  },
  {
    chinese_text: "缘分这东西，说来就来，说走就走",
    pinyin: "Yuánfèn zhè dōngxi, shuō lái jiù lái, shuō zǒu jiù zǒu",
    translation: "Duyên phận thứ đó, nói đến thì đến, nói đi thì đi.",
    mood: "sad", level: "hsk4",
    cultural_note: "缘分 (yuánfèn) là khái niệm văn hóa không có từ tương đương trong tiếng Anh — mối liên hệ định mệnh.",
    author: null,
  },
  {
    chinese_text: "再难的路，走着走着就习惯了",
    pinyin: "Zài nán de lù, zǒuzhe zǒuzhe jiù xíguàn le",
    translation: "Con đường dù khó đến đâu, đi mãi rồi cũng quen.",
    mood: "motivation", level: "hsk3",
    cultural_note: "Triết lý kiên nhẫn của người Trung Hoa — không phải vượt qua, mà là đi qua và thích nghi.",
    author: null,
  },
  {
    chinese_text: "有时候，沉默是最好的回答",
    pinyin: "Yǒushíhòu, chénmò shì zuì hǎo de huídá",
    translation: "Đôi khi, im lặng là câu trả lời tốt nhất.",
    mood: "aesthetic", level: "hsk3",
    cultural_note: "Sự im lặng trong văn hóa Trung Hoa mang nhiều tầng ý nghĩa — bất đồng, tôn trọng, hoặc cảm xúc không thể diễn đạt.",
    author: null,
  },
  {
    chinese_text: "思念是一种病，你是我的药",
    pinyin: "Sīniàn shì yī zhǒng bìng, nǐ shì wǒ de yào",
    translation: "Nỗi nhớ là một căn bệnh, và bạn là thuốc của tôi.",
    mood: "romantic", level: "hsk4",
    cultural_note: "Câu nói viral trên Weibo — dùng phép ẩn dụ y học để nói về tình yêu, kiểu cách rất Gen Z Trung Quốc.",
    author: null,
  },
  {
    chinese_text: "山高水长，情深义重",
    pinyin: "Shān gāo shuǐ cháng, qíng shēn yì zhòng",
    translation: "Núi cao sông dài, tình nghĩa sâu nặng.",
    mood: "healing", level: "hsk4",
    cultural_note: "Thành ngữ dùng thiên nhiên để diễn tả độ sâu của tình cảm — cách nói về tình nghĩa đặc trưng của văn học cổ điển Trung Hoa.",
    author: null,
  },
  {
    chinese_text: "你若安好，便是晴天",
    pinyin: "Nǐ ruò ān hǎo, biàn shì qíngtiān",
    translation: "Nếu bạn bình an, đó chính là trời quang.",
    mood: "healing", level: "hsk3",
    cultural_note: "Được lấy cảm hứng từ Từ Chí Ma. Câu này nói rằng hạnh phúc của người mình yêu chính là ánh sáng trong ngày của bạn.",
    author: null,
  },
  {
    chinese_text: "忍一时风平浪静，退一步海阔天空",
    pinyin: "Rěn yī shí fēng píng làng jìng, tuì yī bù hǎi kuò tiān kōng",
    translation: "Nhẫn một lúc gió yên sóng lặng, lùi một bước biển rộng trời cao.",
    mood: "motivation", level: "hsk5",
    cultural_note: "Triết lý nhẫn nhịn của người Trung Hoa — không phải thua, mà là khôn ngoan. Lùi để tiến xa hơn.",
    author: null,
  },
  {
    chinese_text: "落叶归根，游子思乡",
    pinyin: "Luò yè guī gēn, yóuzǐ sī xiāng",
    translation: "Lá rụng về cội, người xa nhớ quê.",
    mood: "sad", level: "hsk4",
    cultural_note: "Nỗi nhớ quê hương (思乡) là chủ đề lớn nhất của thơ Trung Hoa 3000 năm. Người Hoa ở bất kỳ đâu cũng mang nỗi nhớ này.",
    author: null,
  },
  {
    chinese_text: "心有灵犀一点通",
    pinyin: "Xīn yǒu língxī yī diǎn tōng",
    translation: "Hai tâm hồn kết nối — chạm nhau là hiểu nhau ngay.",
    mood: "romantic", level: "hsk5",
    cultural_note: "Từ thơ Lý Thương Ẩn — 灵犀 là sừng tê giác huyền bí tương truyền thông linh khi đặt gần nhau. Ý nói hai tâm hồn cộng hưởng.",
    author: "李商隐",
  },
  {
    chinese_text: "梦里不知身是客，一晌贪欢",
    pinyin: "Mèng lǐ bù zhī shēn shì kè, yī shǎng tān huān",
    translation: "Trong mơ quên mình là khách tha hương, vui hưởng một lúc ngắn ngủi.",
    mood: "aesthetic", level: "hsk5",
    cultural_note: "Thơ của Lý Dục — vị vua cuối nhà Nam Đường bị bắt làm tù binh. Câu thơ về việc tìm quên lãng trong giấc mơ, nổi tiếng nhất trong lịch sử thơ từ Trung Hoa.",
    author: "李煜",
  },
  {
    chinese_text: "我们都是过客，何必太认真",
    pinyin: "Wǒmen dōu shì guòkè, hébì tài rènzhēn",
    translation: "Chúng ta đều là người qua đường, sao phải quá nghiêm túc.",
    mood: "sad", level: "hsk3",
    cultural_note: "Triết lý Đạo gia về sự vô thường — đời người là cuộc hành trình, không phải điểm đến. Buông bỏ chấp nhặt để sống nhẹ hơn.",
    author: null,
  },
];

function getDailyStaticQuote() {
  const now = new Date();
  const idx = dailyRotationIndex(toVnTime(now), STATIC_QUOTES.length);
  const q = STATIC_QUOTES[idx];
  const today = vnDayStart(now);
  return {
    _id: `static_${idx}`,
    ...q,
    view_count: 0,
    save_count: 0,
    is_daily: true,
    daily_date: today,
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();

    // Ranh giới "hôm nay" theo GIỜ VN (đổi câu nói lúc nửa đêm VN, không phải 07:00).
    const today = vnDayStart();
    const tomorrow = new Date(today.getTime() + 24 * 3600 * 1000);

    // Tìm quote DB đã set làm daily hôm nay
    let dailyQuote = await Quote.findOne({
      is_daily: true,
      daily_date: { $gte: today, $lt: tomorrow },
    }).lean();

    if (!dailyQuote) {
      const count = await Quote.countDocuments();

      if (count === 0) {
        // DB trống → xoay static quotes theo ngày
        return NextResponse.json(getDailyStaticQuote());
      }

      const random = Math.floor(Math.random() * count);
      const randomQuote = await Quote.findOne().skip(random);

      if (randomQuote) {
        randomQuote.is_daily = true;
        randomQuote.daily_date = today;
        await randomQuote.save();
        dailyQuote = randomQuote.toObject();
      }
    }

    const quoteDoc = dailyQuote as Record<string, unknown> | null;

    // Phòng trường hợp count>0 nhưng skip/race trả null → tránh trả về `null`
    // (client sẽ crash) và tránh findByIdAndUpdate(undefined).
    if (!quoteDoc?._id) {
      return NextResponse.json(getDailyStaticQuote(), {
        headers: { "Cache-Control": "no-store, max-age=0" },
      });
    }

    await Quote.findByIdAndUpdate(quoteDoc._id, { $inc: { view_count: 1 } });

    return NextResponse.json(dailyQuote, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("[GET /api/quotes/daily]", error);
    return NextResponse.json(getDailyStaticQuote(), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
}
