import mongoose, { Schema, Document } from "mongoose";

export interface IAnalyticsEvent extends Document {
  name: string; // "pageview" | tên sự kiện tùy ý
  path: string;
  referrer?: string;
  anon_id: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_at: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>({
  name:         { type: String, required: true, maxlength: 60 },
  path:         { type: String, required: true, maxlength: 200 },
  referrer:     { type: String, maxlength: 200 },
  anon_id:      { type: String, required: true, maxlength: 64 },
  utm_source:   { type: String, maxlength: 100 },
  utm_medium:   { type: String, maxlength: 100 },
  utm_campaign: { type: String, maxlength: 100 },
}, { timestamps: { createdAt: "created_at", updatedAt: false } });

AnalyticsEventSchema.index({ created_at: -1 });
AnalyticsEventSchema.index({ name: 1, created_at: -1 });
AnalyticsEventSchema.index({ utm_source: 1, created_at: -1 });
// TTL 90 ngày — số liệu cũ tự xóa, DB không phình (free tier MongoDB Atlas 512MB)
AnalyticsEventSchema.index({ created_at: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });

const AnalyticsEvent = mongoose.models.AnalyticsEvent
  ?? mongoose.model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);
export default AnalyticsEvent;
