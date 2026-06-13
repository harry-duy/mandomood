import mongoose, { Schema, Document } from "mongoose";

export interface IVocabularyCard extends Document {
  user_id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  example_sentence?: string;
  example_pinyin?: string;
  example_translation?: string;
  source_lesson?: string;
  card_type: "word" | "sentence"; // "word" = từ đơn, "sentence" = câu/cụm
  // SRS fields
  ease_factor: number;   // default 2.5
  interval: number;      // days until next review
  repetitions: number;   // times reviewed correctly
  next_review: Date;
  last_reviewed?: Date;
  // Mastery
  mastery: number;       // 0-5
  created_at: Date;
}

const VocabularySchema = new Schema<IVocabularyCard>({
  user_id:              { type: String, required: true, index: true },
  hanzi:                { type: String, required: true },
  pinyin:               { type: String, required: true },
  meaning:              { type: String, required: true },
  example_sentence:     { type: String },
  example_pinyin:       { type: String },
  example_translation:  { type: String },
  source_lesson:        { type: String },
  card_type:            { type: String, enum: ["word", "sentence"], default: "word" },
  ease_factor:          { type: Number, default: 2.5 },
  interval:             { type: Number, default: 1 },
  repetitions:          { type: Number, default: 0 },
  next_review:          { type: Date, default: () => new Date() },
  last_reviewed:        { type: Date },
  mastery:              { type: Number, default: 0, min: 0, max: 5 },
  created_at:           { type: Date, default: () => new Date() },
});

// Compound index: one card per hanzi per user
VocabularySchema.index({ user_id: 1, hanzi: 1 }, { unique: true });
// Due-for-review index
VocabularySchema.index({ user_id: 1, next_review: 1 });

export default mongoose.models.Vocabulary ||
  mongoose.model<IVocabularyCard>("Vocabulary", VocabularySchema);
