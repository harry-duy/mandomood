/**
 * OpenAI client — bạn đã dùng OpenAI API trong Trello project rồi,
 * cách setup tương tự nhưng dùng cho language learning
 */

import OpenAI from "openai";

/**
 * Khởi tạo client OpenAI LƯỜI (lazy): SDK v4 NÉM lỗi ngay trong constructor nếu
 * thiếu OPENAI_API_KEY. Nếu khởi tạo ở top-level, một deploy CHỈ cấu hình
 * GEMINI_API_KEY (được phép theo DEPLOY_READINESS) sẽ crash NGAY khi import
 * "@/lib/openai" → mọi route AI (story, grade, chat, hint…) 500. Lazy hoá để
 * import luôn an toàn; chỉ dựng client khi THỰC SỰ đi nhánh OpenAI (không có Gemini).
 */
let _openai: OpenAI | null = null;
export function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY chưa được cấu hình (và không có GEMINI_API_KEY để fallback).");
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

async function generateGeminiText(
  parts: GeminiPart[],
  options: { temperature?: number; maxOutputTokens?: number; json?: boolean } = {}
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: options.temperature ?? 0.5,
        maxOutputTokens: options.maxOutputTokens ?? 1200,
        ...(options.json ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.error?.message ?? "Gemini request failed");
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("")
    .trim();

  if (!text) throw new Error("Gemini returned empty content");
  return text;
}

/**
 * Parse JSON từ output của model LLM — chịu được markdown fence, text thừa,
 * dấu phẩy cuối (khi bị cắt ngắn). Dùng CHUNG cho cả Gemini lẫn OpenAI để 2
 * đường đi cùng độ bền (trước đây chỉ Gemini có repair, OpenAI parse trần → 500
 * khi model trả JSON hỏng/bị truncate ở max_tokens).
 */
export function repairModelJson<T>(raw: string): T {
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  // Thử parse trực tiếp trước
  try {
    return JSON.parse(stripped) as T;
  } catch { /* fall through to repair */ }

  // Trích object { ... } ngoài cùng bằng cách đếm độ sâu ngoặc
  let depth = 0;
  let start = -1;
  let end = -1;
  for (let i = 0; i < stripped.length; i++) {
    if (stripped[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (stripped[i] === "}") {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }

  if (start === -1 || end === -1) {
    throw new Error(`Model returned no JSON object: ${stripped.slice(0, 200)}`);
  }

  const repaired = stripped
    .slice(start, end + 1)
    .replace(/,\s*([}\]])/g, "$1")          // dấu phẩy cuối trước } hoặc ]
    .replace(/([{,])\s*\n?\s*,/g, "$1");    // dấu phẩy đôi

  try {
    return JSON.parse(repaired) as T;
  } catch (e) {
    throw new Error(`Model JSON parse failed: ${String(e)} | raw: ${stripped.slice(0, 300)}`);
  }
}

async function generateGeminiJson<T>(
  parts: GeminiPart[],
  options: { temperature?: number; maxOutputTokens?: number } = {}
): Promise<T> {
  const jsonInstruction = {
    text: "IMPORTANT: Your response must be ONLY a single valid JSON object. No markdown fences, no backticks, no explanations, no trailing text. Start with { and end with }. No trailing commas.",
  };
  const text = await generateGeminiText([...parts, jsonInstruction], { ...options, json: true });
  return repairModelJson<T>(text);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type StoryLevel = "beginner" | "hsk1" | "hsk2" | "hsk3" | "hsk4" | "hsk5";
export type StoryMood =
  | "romantic"
  | "healing"
  | "motivation"
  | "sad"
  | "friendship"
  | "aesthetic"
  | "funny";

export interface GeneratedStory {
  title: string;
  chinese_text: string;
  pinyin: string;
  translation: string;
  vocabulary: {
    hanzi: string;
    pinyin: string;
    meaning: string;
    example: string;
  }[];
  grammar_notes: string;
  cultural_note: string;
  mood: StoryMood;
}

// ─── Story Generator ──────────────────────────────────────────────────────────

export async function generateStory(
  level: StoryLevel,
  mood: StoryMood,
  theme?: string
): Promise<GeneratedStory> {
  const prompt = `Bạn là chuyên gia ngôn ngữ Trung Quốc và nhà văn sáng tạo.
Tạo một câu chuyện ngắn (5–8 câu) bằng tiếng Trung với:
- Level: ${level}
- Mood: ${mood}
- Theme: ${theme || "cuộc sống hàng ngày"}

Yêu cầu:
- Câu chuyện phải tạo cảm xúc thật sự, KHÔNG giáo khoa
- Ngôn ngữ tự nhiên, phù hợp level
- Phân tích 4–6 từ vựng quan trọng nhất
- Có ghi chú ngữ pháp ngắn gọn
- Có ghi chú văn hóa/cảm xúc (nếu phù hợp)

Trả về JSON với format CHÍNH XÁC này:
{
  "title": "tiêu đề câu chuyện",
  "chinese_text": "nội dung bằng tiếng Trung",
  "pinyin": "phiên âm pinyin đầy đủ",
  "translation": "dịch nghĩa tiếng Việt",
  "vocabulary": [
    { "hanzi": "字", "pinyin": "zì", "meaning": "nghĩa", "example": "ví dụ câu" }
  ],
  "grammar_notes": "ghi chú ngữ pháp",
  "cultural_note": "ghi chú văn hóa hoặc cảm xúc",
  "mood": "${mood}"
}`;

  if (GEMINI_API_KEY) {
    return generateGeminiJson<GeneratedStory>(
      [{ text: prompt }],
      { temperature: 0.8, maxOutputTokens: 1500 }
    );
  }

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini", // Rẻ hơn gpt-4o, đủ tốt cho task này
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 1500,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("OpenAI không trả về content");

  return repairModelJson<GeneratedStory>(content);
}

// ─── AI Tutor Chat ────────────────────────────────────────────────────────────

export type TutorPersona =
  | "cold_girl"
  | "caring_friend"
  | "funny_bff"
  | "ceo_mentor"
  | "idol_style"
  | "anime_sensei";

const PERSONA_PROMPTS: Record<TutorPersona, string> = {
  cold_girl: `Bạn là 冰冰 (Bīng Bīng) - gia sư tiếng Trung lạnh lùng, thẳng thắn.
    Dạy hiệu quả, không vòng vo. Sửa lỗi trực tiếp nhưng không thô.
    Dùng tiếng Việt xen tiếng Trung. Thỉnh thoảng dùng "嗯" hoặc "行了".`,
  caring_friend: `Bạn là 小暖 (Xiǎo Nuǎn) - người bạn thân ấm áp, luôn khuyến khích.
    Kiên nhẫn, giải thích nhiều lần khi cần. Hay khen ngợi.
    Dùng "加油！" và emoji thường xuyên.`,
  funny_bff: `Bạn là 哈哈 (Hā Hā) - người bạn hài hước, năng lượng cao.
    Dạy qua meme và tình huống funny. Hay dùng slang tiếng Trung.
    Học mà như đang chơi game.`,
  ceo_mentor: `Bạn là 总总 (Zǒng Zǒng) - mentor CEO chuyên nghiệp.
    Tập trung vào business Chinese và giao tiếp chuyên nghiệp.
    Định hướng mục tiêu rõ ràng. Ngôn ngữ trang trọng.`,
  idol_style: `Bạn là 星星 (Xīng Xīng) - idol C-pop.
    Dạy qua lyrics, drama, và văn hóa pop Trung Quốc.
    Cuồng nhiệt, aesthetic. Hay đề cập C-drama và idol.`,
  anime_sensei: `Bạn là 先生 (Xiān Shēng) - thầy giáo anime.
    Nghiêm túc nhưng gentle. Giải thích cực kỳ rõ ràng.
    Có kiến thức sâu về lịch sử và văn hóa Trung Quốc.`,
};

export async function chatWithTutor(
  messages: { role: "user" | "assistant"; content: string }[],
  persona: TutorPersona,
  userLevel: StoryLevel,
  scenario?: string
): Promise<string> {
  const scenarioPrompt = scenario
    ? `

CHẾ ĐỘ ROLEPLAY — TÌNH HUỐNG: "${scenario}"
- Bạn ĐÓNG VAI nhân vật trong tình huống (vd: phục vụ quán ăn, lễ tân khách sạn, người phỏng vấn…), nói tiếng Trung là chính.
- Mỗi lượt: nói 1-2 câu tiếng Trung ngắn (kèm pinyin trong ngoặc), rồi dịch tiếng Việt ở dòng riêng bắt đầu bằng "→".
- Nếu học viên nói sai/không tự nhiên: sửa nhẹ nhàng ở cuối, dòng bắt đầu bằng "💡 Sửa:".
- Giữ hội thoại tiến triển theo tình huống; nếu học viên bí, gợi ý 1 câu họ có thể nói tiếp.
- Nếu đây là tin nhắn đầu tiên, hãy mở màn tình huống.`
    : "";

  const systemPrompt = `${PERSONA_PROMPTS[persona]}

Level của người dùng: ${userLevel}
Hãy điều chỉnh độ khó từ vựng phù hợp.
Khi sửa lỗi, hãy giải thích TẠI SAO sai và đưa ra ví dụ đúng.
Đôi khi hỏi thêm câu hỏi để kiểm tra hiểu biết.${scenarioPrompt}`;

  if (GEMINI_API_KEY) {
    const conversation = messages
      .map((m) => `${m.role === "user" ? "Hoc vien" : "Gia su"}: ${m.content}`)
      .join("\n");
    return generateGeminiText(
      [{ text: `${systemPrompt}\n\nHoi thoai:\n${conversation}\n\nTra loi ngan gon, huu ich, bang tieng Viet xen tieng Trung khi can.` }],
      { temperature: 0.85, maxOutputTokens: 700 }
    );
  }

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    temperature: 0.85,
    max_tokens: 500,
  });

  return response.choices[0].message.content ?? "Xin lỗi, mình không hiểu. Bạn thử lại nhé!";
}

// ─── Smart Lesson: Analyze Content (Image or Text) ───────────────────────────

export interface VocabItem {
  hanzi: string;
  pinyin: string;
  meaning: string;
  part_of_speech: string;
  example: string;
  example_translation: string;
}

export interface Exercise {
  id: string;
  type: "fill_blank" | "translate_to_viet" | "translate_to_chinese" | "multiple_choice" | "pinyin";
  question: string;
  answer: string;
  options?: string[];
  hint?: string;
  context?: string;
}

export interface AnalyzedContent {
  detected_text: string;
  level: string;
  summary: string;
  vocabulary: VocabItem[];
  exercises: Exercise[];
  cultural_notes: string;
}

const EXERCISE_TYPES = ["fill_blank", "translate_to_viet", "translate_to_chinese", "multiple_choice", "pinyin"];

function clampStr(v: unknown, max: number): string {
  return typeof v === "string" ? v.slice(0, max) : "";
}

/**
 * Làm sạch HÌNH DẠNG nội dung AI phân tích trước khi trả cho client (phòng thủ
 * tầng sâu giống sanitizeGrade): đảm bảo vocabulary/exercises LUÔN là mảng (đã
 * cap), ép chuỗi + kẹp dài, validate type bài tập/level → client không bao giờ
 * crash `.map`/nhận field rác kể cả khi model trả thiếu/sai cấu trúc.
 */
export function sanitizeAnalyzed(raw: AnalyzedContent): AnalyzedContent {
  const r = (raw ?? {}) as Partial<AnalyzedContent>;
  const vocabulary: VocabItem[] = Array.isArray(r.vocabulary)
    ? r.vocabulary.slice(0, 20).map((v) => {
        const x = (v ?? {}) as Partial<VocabItem>;
        return {
          hanzi: clampStr(x.hanzi, 50),
          pinyin: clampStr(x.pinyin, 100),
          meaning: clampStr(x.meaning, 300),
          part_of_speech: clampStr(x.part_of_speech, 50),
          example: clampStr(x.example, 300),
          example_translation: clampStr(x.example_translation, 300),
        };
      })
    : [];
  const exercises: Exercise[] = Array.isArray(r.exercises)
    ? r.exercises.slice(0, 20).map((e, i) => {
        const x = (e ?? {}) as Partial<Exercise>;
        const type = EXERCISE_TYPES.includes(x.type as string)
          ? (x.type as Exercise["type"])
          : "translate_to_viet";
        return {
          id: clampStr(x.id, 40) || `ex${i + 1}`,
          type,
          question: clampStr(x.question, 500),
          answer: clampStr(x.answer, 500),
          ...(Array.isArray(x.options) ? { options: x.options.slice(0, 8).map((op) => clampStr(op, 200)) } : {}),
          ...(x.hint ? { hint: clampStr(x.hint, 300) } : {}),
          ...(x.context ? { context: clampStr(x.context, 500) } : {}),
        };
      })
    : [];
  return {
    detected_text: clampStr(r.detected_text, 4000),
    level: clampStr(r.level, 20) || "hsk2",
    summary: clampStr(r.summary, 1000),
    vocabulary,
    exercises,
    cultural_notes: clampStr(r.cultural_notes, 1000),
  };
}

export async function analyzeImageContent(base64: string, mimeType: string): Promise<AnalyzedContent> {
  const prompt = `Bạn là chuyên gia ngôn ngữ học tiếng Trung. Phân tích hình ảnh này chứa văn bản tiếng Trung.

Yêu cầu:
1. Đọc toàn bộ văn bản tiếng Trung trong ảnh
2. Đánh giá level (beginner/hsk1/hsk2/hsk3/hsk4/hsk5)
3. Chọn 5-8 từ vựng quan trọng nhất để dạy
4. Tạo 5 bài tập đa dạng (fill_blank, translate_to_viet, translate_to_chinese, multiple_choice, pinyin)
5. Ghi chú văn hóa nếu có

Trả về JSON CHÍNH XÁC:
{
  "detected_text": "toàn bộ văn bản tìm được trong ảnh",
  "level": "hsk2",
  "summary": "tóm tắt nội dung 1-2 câu bằng tiếng Việt",
  "vocabulary": [
    {
      "hanzi": "字",
      "pinyin": "zì",
      "meaning": "nghĩa tiếng Việt",
      "part_of_speech": "danh từ/động từ/tính từ...",
      "example": "câu ví dụ tiếng Trung",
      "example_translation": "dịch câu ví dụ"
    }
  ],
  "exercises": [
    {
      "id": "ex1",
      "type": "fill_blank",
      "question": "câu có ___ cần điền",
      "answer": "đáp án đúng",
      "hint": "gợi ý nhỏ",
      "context": "ngữ cảnh"
    },
    {
      "id": "ex2",
      "type": "multiple_choice",
      "question": "câu hỏi",
      "answer": "đáp án đúng",
      "options": ["A", "B", "C", "D"],
      "context": "ngữ cảnh"
    }
  ],
  "cultural_notes": "ghi chú văn hóa hoặc để trống"
}`;

  if (GEMINI_API_KEY) {
    return generateGeminiJson<AnalyzedContent>(
      [
        { text: prompt },
        { inlineData: { mimeType, data: base64 } },
      ],
      { temperature: 0.6, maxOutputTokens: 2500 }
    );
  }

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" } },
        ],
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
    max_tokens: 2500,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("GPT-4o Vision không trả về content");
  return repairModelJson<AnalyzedContent>(content);
}

export async function analyzeTextContent(text: string): Promise<AnalyzedContent> {
  const prompt = `Bạn là chuyên gia ngôn ngữ học tiếng Trung. Phân tích đoạn văn tiếng Trung sau:

"${text.slice(0, 3000)}"

Yêu cầu:
1. Đánh giá level (beginner/hsk1/hsk2/hsk3/hsk4/hsk5)
2. Chọn 5-8 từ vựng quan trọng nhất
3. Tạo 5 bài tập đa dạng
4. Ghi chú văn hóa nếu có

Trả về JSON CHÍNH XÁC:
{
  "detected_text": "${text.slice(0, 200).replace(/"/g, "'")}...",
  "level": "hsk2",
  "summary": "tóm tắt 1-2 câu tiếng Việt",
  "vocabulary": [
    { "hanzi": "字", "pinyin": "zì", "meaning": "nghĩa", "part_of_speech": "loại từ", "example": "câu ví dụ", "example_translation": "dịch" }
  ],
  "exercises": [
    { "id": "ex1", "type": "fill_blank", "question": "câu ___ cần điền", "answer": "đáp án", "hint": "gợi ý", "context": "ngữ cảnh" },
    { "id": "ex2", "type": "translate_to_viet", "question": "dịch câu này sang tiếng Việt: ...", "answer": "bản dịch đúng", "hint": "gợi ý" },
    { "id": "ex3", "type": "multiple_choice", "question": "câu hỏi", "answer": "đáp án đúng", "options": ["A","B","C","D"] },
    { "id": "ex4", "type": "pinyin", "question": "Đọc pinyin của từ: 你好", "answer": "nǐ hǎo", "hint": "2 thanh điệu" },
    { "id": "ex5", "type": "translate_to_chinese", "question": "Dịch sang tiếng Trung: ...", "answer": "câu đúng", "hint": "gợi ý" }
  ],
  "cultural_notes": "ghi chú hoặc để trống"
}`;

  if (GEMINI_API_KEY) {
    return generateGeminiJson<AnalyzedContent>(
      [{ text: prompt }],
      { temperature: 0.6, maxOutputTokens: 2500 }
    );
  }

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.6,
    max_tokens: 2500,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("GPT-4o không trả về content");
  return repairModelJson<AnalyzedContent>(content);
}

// ─── Smart Grading ────────────────────────────────────────────────────────────

export interface ErrorDetail {
  type: "tone" | "character" | "meaning" | "grammar" | "pinyin" | "spelling";
  position?: string;
  user_input: string;
  correct: string;
  explanation: string;
}

export interface GradeResult {
  score: number;
  correct: boolean;
  errors: ErrorDetail[];
  feedback: string;
  suggestion: string;
}

/**
 * Làm sạch kết quả chấm từ AI trước khi trả cho client: kẹp score về 0–100
 * (AI có thể ảo giác score>100 hoặc NaN), ép kiểu các trường để UI không nhận
 * dữ liệu rác. Tương tự cách làm cứng leaderboard.
 */
export function sanitizeGrade(g: GradeResult): GradeResult {
  const rawScore = Number(g?.score);
  const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : 0;
  return {
    score,
    correct: g?.correct === true,
    errors: Array.isArray(g?.errors) ? g.errors : [],
    feedback: typeof g?.feedback === "string" ? g.feedback : "",
    suggestion: typeof g?.suggestion === "string" ? g.suggestion : "",
  };
}

export async function gradeAnswer(
  questionType: string,
  question: string,
  correctAnswer: string,
  userAnswer: string,
  context?: string
): Promise<GradeResult> {
  const prompt = `Bạn là giáo viên tiếng Trung nghiêm khắc nhưng công bằng. Chấm bài tập sau:

Loại bài tập: ${questionType}
Câu hỏi: ${question}
${context ? `Ngữ cảnh: ${context}` : ""}
Đáp án đúng: ${correctAnswer}
Câu trả lời của học viên: ${userAnswer}

Hãy:
1. Chấm điểm 0-100 (100 = hoàn toàn đúng)
2. Chỉ ra TẤT CẢ lỗi nhỏ nhất: thanh điệu sai, thiếu dấu, sai chữ, sai nghĩa, ngữ pháp...
3. Nếu là pinyin: kiểm tra từng thanh điệu (ā á ǎ à), dấu câu, khoảng cách
4. Nếu là dịch: chấp nhận các cách diễn đạt tương đương nhưng ghi chú khác biệt
5. Cho feedback tích cực kèm hướng cải thiện

Trả về JSON:
{
  "score": 85,
  "correct": false,
  "errors": [
    {
      "type": "tone",
      "position": "từ thứ 2",
      "user_input": "ni hao",
      "correct": "nǐ hǎo",
      "explanation": "Thiếu dấu thanh điệu: nǐ (thanh 3) và hǎo (thanh 3)"
    }
  ],
  "feedback": "Rất gần đúng rồi! Chỉ cần chú ý thanh điệu.",
  "suggestion": "Ôn lại 4 thanh điệu cơ bản trong tiếng Trung: ā á ǎ à"
}`;

  if (GEMINI_API_KEY) {
    return sanitizeGrade(
      await generateGeminiJson<GradeResult>(
        [{ text: prompt }],
        { temperature: 0.2, maxOutputTokens: 3000 }
      )
    );
  }

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 1500,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("GPT grade error");
  return sanitizeGrade(repairModelJson<GradeResult>(content));
}

// ─── Word Hint (Text Selection) ───────────────────────────────────────────────

export interface WordHint {
  hint: string;
  category: string;
  level: string;
  usage_note: string;
  is_correct?: boolean;
  explanation?: string;
}

export async function getWordHint(
  selectedText: string,
  context?: string
): Promise<WordHint> {
  const prompt = `Bạn là trợ lý học tiếng Trung. Người dùng đã chọn đoạn văn bản: "${selectedText}"
${context ? `Ngữ cảnh xung quanh: "${context}"` : ""}

Tạo một GỢI Ý để người dùng TỰ ĐOÁN nghĩa - KHÔNG dịch trực tiếp.
Gợi ý phải:
- Mô tả cảm xúc/tình huống/khái niệm liên quan
- Gợi ý bằng hình ảnh hoặc so sánh thú vị
- Ngắn gọn (1-2 câu)
- Bằng tiếng Việt

Ví dụ:
- "思念" → gợi ý: "Cảm giác khi nhớ về người thân ở xa..."
- "勇敢" → gợi ý: "Phẩm chất của người dám làm điều khó khăn..."

Trả về JSON:
{
  "hint": "gợi ý để đoán nghĩa (KHÔNG dịch trực tiếp)",
  "category": "emotion/action/object/concept/adjective",
  "level": "hsk1/hsk2/hsk3/hsk4/beginner",
  "usage_note": "ghi chú cách dùng ngắn (VD: thường dùng trong văn nói)"
}`;

  if (GEMINI_API_KEY) {
    return generateGeminiJson<WordHint>(
      [{ text: prompt }],
      { temperature: 0.5, maxOutputTokens: 800 }
    );
  }

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 300,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("GPT hint error");
  return repairModelJson<WordHint>(content);
}

export async function checkGuess(
  selectedText: string,
  userGuess: string
): Promise<{ correct: boolean; score: number; actual_meaning: string; feedback: string }> {
  const prompt = `Người dùng đang học tiếng Trung. Họ đoán nghĩa của "${selectedText}" là: "${userGuess}"

Đánh giá mức độ đúng (0-100) và giải thích.
Chấp nhận các diễn đạt tương đương, gần nghĩa.

Trả về JSON:
{
  "correct": true/false,
  "score": 80,
  "actual_meaning": "nghĩa chính xác đầy đủ",
  "feedback": "nhận xét ngắn gọn, tích cực"
}`;

  if (GEMINI_API_KEY) {
    return generateGeminiJson<{ correct: boolean; score: number; actual_meaning: string; feedback: string }>(
      [{ text: prompt }],
      { temperature: 0.2, maxOutputTokens: 700 }
    );
  }

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 200,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("GPT check error");
  return repairModelJson<{ correct: boolean; score: number; actual_meaning: string; feedback: string }>(content);
}
