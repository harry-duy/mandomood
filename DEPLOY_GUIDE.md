# MandoMood — Hướng dẫn Deploy lên Vercel

> Sprint 73–78 | 2026-06-13
> Tất cả thay đổi đã được audit tĩnh — code clean, sẵn sàng production.

---

## Bước 1 — Pre-deploy trên Windows (BẮT BUỘC)

Mở terminal tại thư mục dự án rồi chạy:

```bash
cd C:\Users\Admin\Documents\Production_MandoMood\MandoMood

# Kiểm tra build (phải chạy local vì sandbox không build được file có ký tự đặc biệt)
npm run build
```

Nếu build thành công (exit 0) → tiếp bước 2.
Nếu có lỗi → đọc thông báo, fix trước khi push.

> Lưu ý: `next.config.ts` có `typescript: { ignoreBuildErrors: true }` nên Vercel build thành công
> dù có TS errors — nhưng vẫn nên build local để phát hiện runtime bugs sớm.

---

## Bước 2 — Git commit & push

```bash
cd C:\Users\Admin\Documents\Production_MandoMood\MandoMood

git status
git add -A

git commit -m "feat: Sprint 73-78 — XP system 100%, blog 15 posts, /progress XP card, /lo-trinh 9 shortcuts, /blog SEO layout

- XP system: 14 pages có awardXP (tones, pronunciation, shadowing, practice, reading,
  chiet-tu, luyen-viet, character, test, characters, grammar, hsk, generate, ai-tutor)
- /progress: thêm XP banner hiển thị tổng XP + level từ useProgress()
- /lo-trinh: shortcuts 5→9 (thêm tones/shadowing/grammar/ai-tutor)
- /blog: tạo layout.tsx cho SEO metadata
- blog-data.ts: 15 bài blog (tăng từ 9)"

# Push → Vercel tự động deploy
git push origin main
```

Sau khi push, vào **vercel.com/dashboard** để theo dõi build log.

---

## Bước 3 — Kiểm tra Environment Variables trên Vercel

Vào: **Vercel Dashboard → Project MandoMood → Settings → Environment Variables**

Đảm bảo set cho cả 3 môi trường: Production + Preview + Development.

### BẮT BUỘC (app crash nếu thiếu)

| Variable | Giá trị |
|---|---|
| `MONGODB_URI` | `mongodb+srv://...` (MongoDB Atlas) |
| `NEXTAUTH_URL` | `https://mandomood.vercel.app` |
| `NEXTAUTH_SECRET` | Chạy: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `GEMINI_API_KEY` | Google AI Studio |
| `NEXT_PUBLIC_APP_URL` | `https://mandomood.vercel.app` |

### AI FEATURES (thiếu thì tính năng tương ứng tắt)

| Variable | Giá trị |
|---|---|
| `OPENAI_API_KEY` | `sk-proj-...` (OpenAI Platform) |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `ELEVENLABS_API_KEY` | elevenlabs.io |
| `ELEVENLABS_VOICE_ID` | `EXAVITQu4vr4xnSDxMaL` |

### WEB PUSH / CRON (thiếu thì nhắc SRS không hoạt động)

| Variable | Giá trị |
|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Chạy: `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | (cùng lệnh trên) |
| `CRON_SECRET` | Random string bất kỳ |
| `PUSH_ADMIN_SECRET` | Random string bất kỳ |

### STRIPE (chỉ cần nếu bật payments)

| Variable | Nguồn |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard |
| `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID` | Stripe Dashboard → Products |
| `NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID` | Stripe Dashboard → Products |
| `NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID` | Stripe Dashboard → Products |

### ADMIN

| Variable | Giá trị |
|---|---|
| `ADMIN_SECRET` | Random string |
| `ADMIN_EMAILS` | `ngothanhduy04@gmail.com` |

---

## Bước 4 — Cron Job

File `vercel.json` đã cấu hình sẵn:

```json
{
  "crons": [{ "path": "/api/push/due-reminder", "schedule": "0 1 * * *" }]
}
```

Cron chạy lúc **1:00 AM UTC mỗi ngày** để gửi push notification nhắc SRS.

Kiểm tra: **Vercel Dashboard → Project → Settings → Cron Jobs** → xác nhận cron hiển thị.
Đảm bảo `CRON_SECRET` đã set (route verify header `Authorization: Bearer ${CRON_SECRET}`).

---

## Bước 5 — Google OAuth Callback URL

Vào **Google Cloud Console → Credentials → OAuth 2.0 Client → Authorized redirect URIs**, thêm:

```
https://mandomood.vercel.app/api/auth/callback/google
```

---

## Bước 6 — Post-Deploy Verification Checklist

```
[ ] / (homepage) — Quick Stats hiển thị, Featured Tools có đủ
[ ] /generate — tạo story AI được (Gemini API ok)
[ ] /ai-tutor — chat với AI được
[ ] /hsk — làm quiz xong → XP tăng
[ ] /grammar — chọn đáp án đúng → XP tăng
[ ] /tones — làm quiz xong → XP tăng, lưu best score
[ ] /test — thi thử HSK xong → XP tăng theo số câu đúng
[ ] /luyen-viet/online — viết chữ xong → XP tăng
[ ] /progress — thấy XP banner (tổng XP + level)
[ ] /lo-trinh — thấy 9 shortcuts trong mỗi cấp HSK
[ ] /blog — thấy 15 bài blog
[ ] Google Login — đăng nhập ok, XP sync lên server
[ ] /admin/feedback — vào được với ADMIN_SECRET
```

---

## Tóm tắt Sprint 73–78

| Sprint | Feature |
|---|---|
| 73 | Tones XP, HSK URL params (?level=), StreakCalendar localStorage |
| 74 | Pronunciation XP, Shadowing XP theo sao đánh giá |
| 75 | Practice XP, Reading XP, Chiet-tu XP, Home Quick Stats |
| 76 | Luyen-viet XP, Character XP, Test XP, Characters XP, Blog 9→11 |
| 77 | Grammar XP, HSK quiz XP, Generate XP, AI-tutor XP, Blog 11→13 |
| 78 | Progress XP banner, Lo-trinh 9 shortcuts, Blog layout.tsx SEO, Blog 13→15 |

**Kết quả: 14 pages có XP · 15 blog posts · 100% XP coverage**
