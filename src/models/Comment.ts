import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  post_id: mongoose.Types.ObjectId;
  author_email: string;
  author_name: string;
  author_image?: string;
  content: string;
  like_count: number;
  created_at: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    post_id:      { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    author_email: { type: String, required: true },
    author_name:  { type: String, required: true },
    author_image: { type: String },
    content:      { type: String, required: true, maxlength: 500 },
    like_count:   { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

export default mongoose.models.Comment ?? mongoose.model<IComment>("Comment", CommentSchema);
