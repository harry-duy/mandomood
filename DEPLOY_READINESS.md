# 🚀 MandoMood — Deploy Readiness (cập nhật 2026-06-24)

Tài liệu này tổng hợp **mọi thay đổi đang CHỜ DEPLOY** (Sprint 112→138) + cách kiểm
chứng sau khi lên production. Dùng kèm `DEPLOY_CHECKLIST.md` (hướng dẫn setup
Vercel + MongoDB Atlas) và `PROGRESS_LOG.md` (chi tiết từng sprint).

> ⚠️ **Git trong sandbox bị hỏng index** → mọi fix nằm sẵn trong thư mục làm việc
> nhưng **chưa được commit/push**. Cần **bạn push từ máy** để lên production.

---

## 0. Trạng thái build hiện tại
- `tsc --noEmit`: **0 lỗi**
- `npm test`: **230/230 PASS** (mọi lib logic thuần đều có test)
- `eslint`: 0 error (chỉ vài warning `set-state-in-effect` pre-existing, vô hại)

**Trước khi push, chạy lại trên máy bạn để chắc chắn:**
```bash
npm run verify   # = strip-null + test + tsc + eslint
# hoặc từng bước:
npm test && npx tsc --noEmit && npm run build
```

---

## 1. Lệnh deploy (push từ máy bạn)
```bash
git add -A
git commit -m "fix: 18 bug + hardening + test coverage (sprint 112-138)"
git push            # Vercel tự build & deploy nhánh production
```

---

## 2. Biến môi trường (kiểm tra trên Vercel → Settings → Environment Variables)
Đã đối chiếu: **mọi biến code dùng đều có trong `.env.example`** (chỉ `NODE_ENV` là
Vercel tự set). Bắt buộc có để chạy đúng:

| Nhóm | Biến | Bắt buộc |
|---|---|---|
| DB | `MONGODB_URI` | ✅ |
| Auth | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | ✅ (NEXTAUTH_SECRET **buộc** có ở prod — code throw nếu thiếu) |
| AI | `OPENAI_API_KEY` hoặc `GEMINI_API_KEY` (+`GEMINI_MODEL`) | ✅ (ít nhất 1) |
| TTS | `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` | ⬜ (thiếu → tự fallback Web Speech) |
| Thanh toán | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, 3×`..._PRICE_ID` | ⬜ (cần nếu bật Premium) |
| Push | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PUSH_ADMIN_SECRET` | ⬜ (cần nếu bật thông báo) |
| Cron/Admin | `CRON_SECRET`, `ADMIN_SECRET`, `ADMIN_EMAILS` | ✅ (ADMIN_EMAILS để vào trang admin) |
| App | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME` | ✅ (APP_URL dùng cho sitemap/OG/canonical) |

> Sau khi đổi domain thật → cập nhật `NEXT_PUBLIC_APP_URL` + `NEXTAUTH_URL` +
> Google OAuth redirect + Stripe webhook URL.

---

## 3. Các FIX đang chờ deploy & cách KIỂM CHỨNG trên production

### 🔴 Tác động lớn (nên test kỹ)
1. **Daily-plan tính vào streak/lịch/mục tiêu/radar** (Sprint 130, 132)
   → Vào `/daily-plan`, tick vài nhiệm vụ → xem `/progress`: biểu đồ 14 ngày + streak
   tăng; vòng "mục tiêu hôm nay" ở trang chủ chạy; radar kỹ năng nhận điểm.
2. **Quota AI không vượt trần khi gọi song song** (Sprint 122)
   → User free: tạo truyện liên tục/nhiều tab → dừng đúng ở 3 lượt/ngày (không lố).
3. **Thông báo mốc XP hiện đúng** (Sprint 131)
   → Học đủ ≥100 XP → vào `/notifications` thấy "⚡ Đạt 100 XP!".
4. **Bảng xếp hạng "tuần" chỉ tính tuần hiện tại** (Sprint 116)
   → `/leaderboard` tab Tuần: người nghỉ tuần này không còn đứng đầu bằng điểm cũ.
5. **Thưởng mốc streak chỉ 1 lần/ngày** (Sprint 115)
   → Ngày đạt mốc 7/30/100: làm nhiều bài cùng ngày chỉ +bonus 1 lần.

### 🟠 Sửa lỗi / hành vi
6. Streak nhất quán + ân hạn hôm nay, đúng giờ VN (Sprint 113, 124, 125) → lịch chuỗi
   học tô đúng ô buổi sáng; mood check-in/banner reset đúng nửa đêm local.
7. Bấm thông báo push **focus đúng cửa sổ**, không mở tab mới (Sprint 114).
8. Tắt thông báo **gỡ ngay phía server** (Sprint 134).
9. Lưu quote/like **chống double-click** nhân đôi (Sprint 121).
10. Luyện phát âm không **kẹt nút mic** khi im lặng (Sprint 119).
11. `/api/lessons` **kẹp limit** (chống `limit=0` trả tất cả) (Sprint 123).
12. `theme` truyện AI được **vệ sinh** (chống prompt injection + tốn token) (Sprint 117).
13. % tiến độ cấp đúng giữa /progress và báo cáo tuần (Sprint 111).

### 🟢 Tính năng / nội dung / cứng hoá
14. **Huy hiệu từ vựng** (lưu 30/100/300 từ) (Sprint 112).
15. Bài cộng đồng **ngẫu nhiên 40 bài** + tab "Hot" đúng (Sprint 118, 120, 126).
16. Task **"Luyện viết chữ Hán"** vào daily-plan (Sprint 133).
17. **29 trang chữ Hán vào sitemap** (SEO long-tail) + đồng bộ cấp HSK (Sprint 128, 129).
18. Làm cứng dữ liệu leaderboard (clamp 0–100), trần XP thi tường minh (Sprint 135, 136).

---

## 4. Smoke test nhanh sau deploy (5 phút)
- [ ] Trang chủ `/` load + câu nói hôm nay hiện.
- [ ] Đăng nhập Google OK (nhận 30 ngày trial).
- [ ] Tạo 1 truyện AI ở `/generate` (kiểm AI key).
- [ ] `/daily-plan` tick task → `/progress` thấy hoạt động tăng.
- [ ] `/test` thi 1 đề → có điểm + XP.
- [ ] `/sitemap.xml` mở được, có URL `/character/...`.
- [ ] (Nếu bật) thanh toán Stripe test mode → webhook kích hoạt premium.
- [ ] Google Search Console: submit `sitemap.xml`.

---

## 5. Ghi chú vận hành
- **Vercel Cron** `/api/push/due-reminder` cần `CRON_SECRET` (nhắc ôn hằng ngày).
- TTS thiếu ElevenLabs → tự fallback Web Speech (không lỗi).
- DB lỗi → quota/premium fail-safe coi như free (không chặn user vì lỗi hệ thống).
- Chi tiết kỹ thuật từng sprint: xem `PROGRESS_LOG.md` (Sprint 112→138).
