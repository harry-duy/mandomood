import mongoose, { Schema, Document } from "mongoose";

export interface IVocab {
  hanzi: string;
  pinyin: string;
  meaning: string;
  example: string;
}

export interface ILesson extends Document {
  title: string;
  content_type: "story" | "quote" | "dialogue" | "meme" | "diary" | "poetry";
  level: "beginner" | "hsk1" | "hsk2" | "hsk3" | "hsk4" | "hsk5" | "hsk6";
  mood: "romantic" | "healing" | "motivation" | "sad" | "friendship" | "aesthetic" | "funny";
  chinese_text: string;
  pinyin: string;
  translation: string;
  vocabulary: IVocab[];
  grammar_notes?: string;
  cultural_note?: string;
  audio_url?: string;
  image_url?: string;
  tags: string[];
  is_ai_generated: boolean;
  view_count: number;
  save_count: number;
  created_at: Date;
}

const VocabSchema = new Schema<IVocab>({
  hanzi: { type: String, required: true },
  pinyin: { type: String, required: true },
  meaning: { type: String, required: true },
  example: { type: String },
}, { _id: false });

const LessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    content_type: {
      type: String,
      enum: ["story", "quote", "dialogue", "meme", "diary", "poetry"],
      default: "story",
    },
    level: {
      type: String,
      enum: ["beginner", "hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6"],
      required: true,
    },
    mood: {
      type: String,
      enum: ["romantic", "healing", "motivation", "sad", "friendship", "aesthetic", "funny"],
      required: true,
    },
    chinese_text: { type: String, required: true },
    pinyin: { type: String, required: true },
    translation: { type: String, required: true },
    vocabulary: [VocabSchema],
    grammar_notes: { type: String },
    cultural_note: { type: String },
    audio_url: { type: String },
    image_url: { type: String },
    tags: [{ type: String }],
    is_ai_generated: { type: Boolean, default: false },
    view_count: { type: Number, default: 0 },
    save_count: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

LessonSchema.index({ mood: 1, level: 1 });
LessonSchema.index({ content_type: 1 });
LessonSchema.index({ tags: 1 });

const Lesson = mongoose.models.Lesson ?? mongoose.model<ILesson>("Lesson", LessonSchema);
export default Lesson;
