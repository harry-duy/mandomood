import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  provider: "google" | "email";
  level: "beginner" | "hsk1" | "hsk2" | "hsk3" | "hsk4" | "hsk5" | "hsk6";
  xp: number;
  weekly_xp: number;
  weekly_xp_reset: Date;
  streak: number;
  streak_days: number;
  last_active: Date;
  premium: boolean;
  premium_until?: Date;
  tutor_persona: "cold_girl" | "caring_friend" | "funny_bff" | "ceo_mentor" | "idol_style" | "anime_sensei";
  saved_lessons: mongoose.Types.ObjectId[];
  saved_quotes: mongoose.Types.ObjectId[];
  created_at: Date;
  push_subscription?: Record<string, unknown>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    image: { type: String },
    provider: { type: String, enum: ["google", "email"], default: "email" },
    level: {
      type: String,
      enum: ["beginner", "hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6"],
      default: "beginner",
    },
    xp: { type: Number, default: 0 },
    weekly_xp: { type: Number, default: 0 },
    weekly_xp_reset: { type: Date, default: () => getNextMonday() },
    streak: { type: Number, default: 0 },
    streak_days: { type: Number, default: 0 },
    last_active: { type: Date, default: Date.now },
    premium: { type: Boolean, default: false },
    premium_until: { type: Date },
    tutor_persona: {
      type: String,
      enum: ["cold_girl", "caring_friend", "funny_bff", "ceo_mentor", "idol_style", "anime_sensei"],
      default: "caring_friend",
    },
    saved_lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    saved_quotes: [{ type: Schema.Types.ObjectId, ref: "Quote" }],
    push_subscription: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

function getNextMonday(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const User = mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
export default User;
