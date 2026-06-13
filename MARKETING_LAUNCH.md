# 🚀 MandoMood — Kế hoạch Deploy & Marketing Launch

> Cập nhật: 2026-06-11. Trạng thái code: build + lint + test xanh (xem PROGRESS_LOG).

## 1. Checklist deploy production (Vercel)

### Trước khi bấm deploy
- [ ] `npm run verify` xanh (strip-null + test + tsc + eslint)
- [ ] `npm run build` xanh trên Windows
- [ ] Env Vercel đầy đủ: `MONGODB_URI`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `OPENAI_API_KEY` hoặc `GEMINI_API_KEY`, `ELEVENLABS_API_KEY` (TTS), `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY`, `CRON_SECRET`
- [ ] Stripe webhook trỏ đúng domain production
- [ ] ⚠️ KHÔNG commit/chia sẻ `deploy.bat` (chứa token Vercel)

### Smoke test sau deploy (15 phút)
- [ ] Đăng nhập Google → /profile hiện card "Đồng bộ đám mây"
- [ ] Tạo 1 truyện AI ở /generate (kiểm tra AI key hoạt động)
- [ ] Nghe TTS 1 từ bất kỳ (kiểm tra TTS route)
- [ ] Sync 2 trình duyệt: lưu từ ở A → Đồng bộ → thấy ở B; xóa ở B → mất ở A
- [ ] Light theme toggle; /search tra "nhan nai" ra 忍耐
- [ ] PWA: Cài app từ menu, mở offline thấy trang /offline
- [ ] Mua Premium test mode (Stripe) → webhook ghi nhận

## 2. Định vị & thông điệp

**Một câu**: *Học tiếng Trung bằng cảm xúc — qua truyện ngắn AI, câu nói hay và âm Hán Việt — không phải bài tập khô khan.*

**Khác biệt** (so Duolingo/HelloChinese):
1. **Truyện AI theo tâm trạng** — chọn mood (chữa lành/động lực/lãng mạn...) → truyện riêng cho bạn
2. **Âm Hán Việt** — lợi thế độc quyền cho người Việt (缘分 = "duyên phận", nhớ ngay)
3. **Chiết tự + câu chuyện chữ Hán** — nhớ chữ qua hình ảnh và cảm xúc, không học vẹt
4. Offline-first + đồng bộ đám mây, free không cần đăng nhập

**Đối tượng**: Gen Z Việt 16–28 — fan C-drama/C-pop, người tự học HSK, du học sinh tương lai.

## 3. Kênh & chiến thuật (0đ budget, tận dụng tính năng sẵn có)

### TikTok / Reels (kênh chính)
- Format 1: "1 chữ Hán 1 câu chuyện" — quay màn hình trang /character (chiết tự 忍 = dao đâm vào tim...) — 3 video/tuần
- Format 2: "Câu nói C-drama hôm nay" — dùng ảnh ShareCard 1080×1080 xuất từ app + voiceover
- Format 3: "Đố bạn" — quiz nhanh từ /test, kết bằng CTA vào app
- Hashtag: #hoctiengtrung #hsk #cdrama #mandomood

### Cộng đồng có sẵn
- Nhóm Facebook "Tự học tiếng Trung", "Hội mê phim Trung" — chia sẻ truyện AI hay (ảnh ShareCard), không spam link
- Threads/X: mỗi ngày 1 câu quote song ngữ từ /api/quotes/daily

### SEO (đã có nền tốt: sitemap, JSON-LD Course, OG động)
- Viết 5 bài blog đầu: "Học tiếng Trung bằng âm Hán Việt", "150 từ HSK1 kèm Hán Việt", "Chiết tự 10 chữ Hán đẹp nhất", "Lộ trình HSK cho người mới", "Học tiếng Trung qua C-drama"
- Mục tiêu keyword: "học tiếng trung cho người việt", "âm hán việt", "hsk1 từ vựng"

### Trong sản phẩm (growth loop)
- ShareCard truyện/quote → ảnh đẹp có logo + URL → mỗi share là 1 quảng cáo
- Push notification nhắc ôn (đã có) → giữ retention
- Leaderboard tuần → cạnh tranh nhẹ

## 4. Lịch 4 tuần đầu

| Tuần | Việc |
|---|---|
| 1 | Deploy + smoke test. Lập kênh TikTok/FB page. Đăng 3 video đầu. Mời 10–20 bạn bè dùng thử + feedback widget |
| 2 | 3 video + 2 bài blog. Đăng nhóm FB lần đầu. Sửa bug từ feedback |
| 3 | 3 video + 2 bài blog. Thử 1 video "viral format" (đố vui/chiết tự sốc). Theo dõi retention qua /admin/feedback |
| 4 | Tổng kết số liệu: signup, D7 retention, share count. Quyết định: đẩy kênh nào mạnh nhất |

## 5. Số liệu cần theo dõi (KPI tháng đầu)
- 500 lượt truy cập, 100 tài khoản, D7 retention ≥ 15%
- 50 ảnh ShareCard được tải/chia sẻ
- 10 phản hồi qua feedback widget
- (Chưa kỳ vọng doanh thu Premium tháng đầu — tập trung học viên trung thành)

## 6. Việc kỹ thuật hỗ trợ marketing (đợt sau, nếu cần)
- [ ] Analytics nhẹ (Vercel Analytics / Umami) — hiện chưa có số liệu truy cập
- [ ] UTM landing: /?utm_source=tiktok để đo kênh
- [ ] Trang /blog (SEO content) — hiện chưa có khung blog
- [ ] Referral code đơn giản (+XP khi mời bạn)
