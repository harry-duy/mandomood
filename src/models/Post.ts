/**
 * Post — user-generated content (UGC)
 * Dùng cho Community Feed: quote, story, hoặc câu hỏi
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  author_email: string;
  author_name: string;
  author_image?: string;
  type: "quote" | "story" | "question";
  chinese_text: string;
  pinyin?: string;
  translation: string;
  mood?: string;
  level?: string;
  likes: string[];       // array of user emails
  like_count: number;
  comment_count: number;
  is_verified: boolean;  // staff pick
  created_at: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author_email: { type: String, required: true, index: true },
    author_name:  { type: String, required: true },
    author_image: { type: String },
    type:         { type: String, enum: ["quote", "story", "question"], default: "quote" },
    chinese_text: { type: String, required: true },
    pinyin:       { type: String },
    translation:  { type: String, required: true },
    mood:         { type: String },
    level:        { type: String },
    likes:        [{ type: String }],
    like_count:   { type: Number, default: 0 },
    comment_count:{ type: Number, default: 0 },
    is_verified:  { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

PostSchema.index({ created_at: -1 });
PostSchema.index({ like_count: -1 });

const Post = mongoose.models.Post ?? mongoose.model<IPost>("Post", PostSchema);
export default Post;
