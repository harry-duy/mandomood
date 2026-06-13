import mongoose, { Schema, Document } from "mongoose";
export interface IFeedback extends Document {
  message: string;
  type: "bug" | "idea" | "other";
  page: string;
  user_email?: string;
  rating?: number;
  created_at: Date;
}
const FeedbackSchema = new Schema<IFeedback>({
  message:    { type: String, required: true, maxlength: 2000 },
  type:       { type: String, enum: ["bug", "idea", "other"], default: "other" },
  page:       { type: String, default: "/" },
  user_email: { type: String },
  rating:     { type: Number, min: 1, max: 5 },
}, { timestamps: { createdAt: "created_at" } });
FeedbackSchema.index({ created_at: -1 });
FeedbackSchema.index({ type: 1 });

const Feedback = mongoose.models.Feedback ?? mongoose.model<IFeedback>("Feedback", FeedbackSchema);
export default Feedback;
