import mongoose, { Schema, Document } from "mongoose";
import type { SyncPayload } from "@/lib/mergeSync";

/**
 * SyncData — bản sao cloud của dữ liệu học lưu localStorage
 * (sổ tay từ, bộ thẻ tự tạo, lịch sử truyện, điểm quiz HSK, huy hiệu).
 * 1 document / user. Merge phía server bằng lib/mergeSync (không mất tiến độ).
 */
export interface ISyncData extends Document {
  user_email: string;
  data: SyncPayload;
  updated_at: Date;
}

const SyncDataSchema = new Schema<ISyncData>(
  {
    user_email: { type: String, required: true, unique: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: false, updatedAt: "updated_at" }, minimize: false }
);

export default mongoose.models.SyncData ??
  mongoose.model<ISyncData>("SyncData", SyncDataSchema);
