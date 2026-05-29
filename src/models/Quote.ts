/**
 * Quote Model — MongoDB Schema
 * Giống cách bạn đã define schema trong Trello project
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IQuote extends Document {
  chinese_text: string;
  pinyin: string;
  translation: string;
  author?: string;
  source?: string;
  mood: "romantic" | "healing" | "motivation" | "sad" | "friendship" | "aesthetic" | "funny";
  level: "beginner" | "hsk1" | "hsk2" | "hsk3" | "hsk4" | "hsk5" | "hsk6";
  tags: string[];
  audio_url?: string;
  background_url?: string;
  cultural_note?: string;
  view_count: number;
  save_count: number;
  is_daily: boolean;
  daily_date?: Date;
  created_at: Date;
}

const QuoteSchema = new Schema<IQuote>(
  {
    chinese_text: { type: String, required: true },
    pinyin: { type: String, required: true },
    translation: { type: String, required: true },
    author: { type: String },
    source: { type: String },
    mood: {
      type: String,
      enum: ["romantic", "healing", "motivation", "sad", "friendship", "aesthetic", "funny"],
      required: true,
    },
    level: {
      type: String,
      enum: ["beginner", "hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6"],
      default: "hsk2",
    },
    tags: [{ type: String }],
    audio_url: { type: String },
    background_url: { type: String },
    cultural_note: { type: String },
    view_count: { type: Number, default: 0 },
    save_count: { type: Number, default: 0 },
    is_daily: { type: Boolean, default: false },
    daily_date: { type: Date },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Index để query nhanh
QuoteSchema.index({ mood: 1, level: 1 });
QuoteSchema.index({ daily_date: 1 });
QuoteSchema.index({ is_daily: 1, daily_date: -1 });

const Quote = mongoose.models.Quote ?? mongoose.model<IQuote>("Quote", QuoteSchema);
export default Quote;
