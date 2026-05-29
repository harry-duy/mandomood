# 📋 PROMPT_MASTER.md — MandoMood Decision Log
> Mọi quyết định kỹ thuật, tính năng, bug fix đều được ghi vào đây.
> Format: `[DATE] [SPRINT] Quyết định — Lý do`

---

## 🏗️ KIẾN TRÚC & STACK

| Quyết định | Lý do |
|---|---|
| Next.js 14 App Router + TypeScript | SEO tốt, server components, type safety |
| MongoDB + Mongoose (không Supabase) | Flexible schema cho content đa dạng, đã quen từ Trello project |
| Gemini 2.5 Flash là AI chính | Nhanh + rẻ + JSON mode tốt; OpenAI GPT-4o làm fallback |
| Zustand cho client state | Nhẹ, persist localStorage dễ, không cần Redux |
| Framer Motion cho animation | Gen Z cần visual đẹp; performance tốt hơn CSS animation phức tạp |
| Canvas API (không html2canvas) | html2canvas không tương thích sandbox VM; Canvas API thuần là đủ |
| SM-2 algorithm cho SRS | Thuật toán proven nhất cho spaced repetition, implement đơn giản |
| Web Speech API (tạm thời) | Free, built-in browsers; sẽ replace bằng ElevenLabs sau |

---

## 🐛 BUGS ĐÃ FIX (quan trọng)

| Sprint | Bug | Fix |
|---|---|---|
| 5 | `package.json` null bytes → npm install fail | Ghi lại bằng Python write() thay Edit tool |
| 5 | next-auth v5→v4 conflict | Rewrite sang `NextAuthOptions`/`getServerSession()` |
| 5 | TypeScript parser nhầm `...nextauth` là spread | Tách `authOptions` ra `src/lib/auth-config.ts` riêng |
| 6 | ShareCard: JSX template literal lồng nhau | Dùng bash heredoc thay Write tool |
| 11 | QuoteCard save chỉ dùng Zustand, không gọi API | Thêm POST /api/user/saved-quotes cho logged-in users |
| 11 | TextSelectionTooltip sai vị trí khi scroll | Dùng getBoundingClientRect() thay vì scrollY offset |
| 11 | layout.tsx + BottomNav.tsx bị corrupt bởi Edit tool | Rewrite qua bash heredoc |
| 11 | Feed demo data: 13 lỗi Chinese/Vietnamese sai | Fix từng lỗi hanzi, pinyin, translation |
| 13 | gradeAnswer fallback vì Gemini JSON parse sai | Brace-depth tracking thay regex greedy + tăng maxTokens |

---

## ✅ WINDOWS FILESYSTEM RULE (QUAN TRỌNG)

> **Windows pad null bytes vào cuối file khi Edit tool ghi.**
> → LUÔN dùng `bash heredoc` để ghi file lớn (>50 lines):
> ```bash
> cat > /path/file.tsx << 'EOF'
> ...nội dung...
> EOF
> ```
> → File nhỏ (<30 lines) dùng Edit tool bình thường.

---

## 🎯 TÍNH NĂNG — TRẠNG THÁI

### ✅ Hoàn thành (Sprint 1-13)

| Tính năng | Route | API |
|---|---|---|
| Daily Quote | `/` | `/api/quotes/daily` |
| Feed bài học | `/feed` | `/api/lessons` |
| Lesson detail + Quiz | `/lesson/[id]` | `/api/lessons/[id]` |
| AI Story Generator | `/generate` | `/api/ai/story` |
| AI Tutor (6 personas) | `/ai-tutor` | `/api/ai/chat` |
| Character detail + hanzi-writer | `/character/[hanzi]` | static |
| Search | `/search` | `/api/search` |
| Dictionary (static 60 từ) | `/dictionary` | — |
| Smart Lesson (upload + OCR) | `/smart-lesson` | `/api/ai/analyze-upload`, `/api/ai/grade-answer` |
| Flashcards SRS | `/flashcards` | `/api/user/vocabulary` |
| Profile + saved quotes | `/profile` | `/api/user/progress`, `/api/user/saved-quotes` |
| Onboarding | `/onboarding` | — |
| Login Google OAuth | `/login` | NextAuth |
| XP + Streak gamification | — | `/api/user/progress` |
| TextSelectionTooltip (global) | layout | `/api/ai/word-hint` |
| PWA manifest | — | — |
| Share Quote Card (1080×1080 PNG) | — | — |

### 🚧 Chưa làm

| Tính năng | Priority | Sprint dự kiến |
|---|---|---|
| **Leaderboard** | 🔴 HIGH | Sprint 14 |
| ElevenLabs TTS | 🟡 MEDIUM | Sprint 15 |
| Stripe Subscription | 🟡 MEDIUM | Sprint 16 |
| Community Feed (UGC) | 🟡 MEDIUM | Sprint 17 |
| Push Notifications (streak reminder) | 🟢 LOW | Sprint 18 |
| Flutter Mobile App | 🟢 LOW | Phase 5 |

---

## 🔧 ENV VARIABLES CẦN THIẾT

```env
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.5-flash
NEXTAUTH_SECRET=random-string-32chars
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 📐 AI PROMPTING PATTERNS (dùng trong project)

### 1. Story Generation (Gemini Flash)
```
Hãy tạo một câu chuyện ngắn bằng tiếng Trung cho người học [LEVEL].
Mood: [MOOD], Chủ đề: [THEME]
Return JSON: { title, chinese_text, pinyin, translation, vocabulary[], grammar_notes, cultural_note }
```

### 2. Word Hint (không reveal trực tiếp)
```
Người dùng chọn từ "[WORD]" trong ngữ cảnh "[CONTEXT]".
Hãy cho 1 gợi ý ngữ cảnh (không dịch thẳng).
Ví dụ: "Từ này thường dùng khi nói về cảm xúc trong C-drama"
```

### 3. Grade Answer (SM-2 compatible)
```
Câu hỏi: [TYPE] — "[QUESTION]"
Đáp án đúng: [CORRECT]
Đáp án user: [USER_ANSWER]
Chấm điểm 0-100, liệt kê lỗi theo type: tone/char/meaning/grammar/pinyin
```

### 4. JSON hardening (Gemini quirk)
- Strip markdown fences trước khi parse
- Dùng brace-depth tracking thay regex greedy
- Repair trailing commas
- System: "Start your response with { and end with }. No trailing text."

---

## 📊 PROJECT STATS (Sprint 13 end)

- **57 TypeScript files**
- **13 pages** (+ 2 dynamic routes)
- **15 API routes**
- **9 UI components**
- **4 Mongoose models**
- **2 custom hooks**
- TypeScript: **0 errors**

---

## 🗓️ SPRINT LOG TÓM TẮT

| Sprint | Ngày | Nội dung chính |
|---|---|---|
| 1 | 2026-05-28 | Foundation: package.json, config, DB models, API routes, pages cơ bản |
| 2 | 2026-05-28 | UI components: VocabCard, MiniQuiz, XPToast; Lesson/Generate/Character/Login pages |
| 3 | 2026-05-28 | Auth (NextAuth v4), XP+Streak API, Search, PWA manifest, HanziWriter |
| 4 | 2026-05-28 | Wire useProgress, rebuild Profile, PWA icons, TypeScript clean |
| 5 | 2026-05-28 | Logo integration, brand colors, CRITICAL bug fixes (null bytes, auth v5→v4) |
| 6 | 2026-05-28 | ShareCard (Canvas 1080×1080), Dictionary page, TS clean |
| 7-8 | 2026-05-28 | Logo placeholder, next.config production, saved-quotes API, seed data mở rộng |
| 9 | 2026-05-29 | useSavedQuotes hook, Profile real API integration, SavedQuoteCard component |
| 10 | 2026-05-29 | Smart Lesson (GPT-4o Vision), TextSelectionTooltip, word-hint API |
| 11 | 2026-05-29 | Bug audit: QuoteCard save, Tooltip position, layout corruption, demo data cleanup |
| 12 | 2026-05-29 | Flashcard SRS (SM-2), Vocabulary model/API, Add to Deck button |
| 13 | 2026-05-29 | Gemini JSON parser hardening, gradeAnswer token bump |
| **14** | **2026-05-29** | **Leaderboard + Social** ← _đang làm_ |


---

## ✅ SPRINT 14 — [2026-05-29] Leaderboard + Social

### Files Added / Changed

| File | Action | Mô tả |
|------|--------|-------|
| `src/app/leaderboard/page.tsx` | NEW | Trang bảng xếp hạng đầy đủ |
| `src/app/api/leaderboard/route.ts` | NEW | GET top users theo weekly_xp / xp |
| `src/models/User.ts` | Updated | Thêm `weekly_xp`, `weekly_xp_reset`, `streak` fields |
| `src/app/api/user/progress/route.ts` | Updated | Cộng weekly_xp + auto-reset mỗi thứ Hai |
| `src/components/layout/BottomNav.tsx` | Updated | Smart AI → Leaderboard (Trophy icon) |
| `PROMPT_MASTER.md` | NEW | File log quyết định tổng hợp |

### Quyết định thiết kế

| Quyết định | Lý do |
|---|---|
| Tab Leaderboard thay Smart AI trong BottomNav | Smart AI vẫn accessible qua /smart-lesson từ home; Leaderboard là social hook cần daily visibility |
| Demo data fallback khi DB trống | App vẫn đẹp khi chưa có users thật; real data load khi API trả về > 0 users |
| Podium layout (2nd-1st-3rd) | Visual quen thuộc từ game/esport, Gen Z recognizable |
| Weekly XP reset mỗi thứ Hai 00:00 | Tạo urgency hàng tuần, tăng DAU vào cuối tuần |
| "Bạn đang ở vị trí #X" banner | Personalization = engagement, social comparison |

### TypeScript Status
- `npx tsc --noEmit` → **0 errors** ✓

### Project size (Sprint 14 end)
- **60 TypeScript files** (+3)
- **14 pages** (+1: /leaderboard)
- **16 API routes** (+1: /api/leaderboard)


---

## ✅ SPRINT 15 — [2026-05-29] ElevenLabs TTS

### Quyết định
| Quyết định | Lý do |
|---|---|
| `useTTS` hook + `playTTS` utility | Hai patterns: hook (với loading state) cho components, fire-and-forget cho simple calls |
| ElevenLabs → Web Speech API fallback | App vẫn hoạt động khi chưa có API key. `zh-CN` + rate 0.85 đủ dùng |
| In-memory blob cache trong hook | Tránh re-fetch cùng text, tiết kiệm quota ElevenLabs |
| In-memory Map cache trên server | Max 200 entries, LRU-lite. Đủ cho dev/small prod, sau có thể dùng Redis |
| Voice: Sarah (EXAVITQu4vr4xnSDxMaL) | Multilingual v2, hỗ trợ tiếng Trung tốt nhất trong ElevenLabs free tier |
| `/api/tts` trả 503 khi không có key | Client biết để fallback ngay, không retry |

### Files Changed
- `src/app/api/tts/route.ts` — NEW: GET /api/tts?text=... → MP3 blob
- `src/hooks/useTTS.ts` — NEW: `useTTS()` hook + `playTTS()` utility
- 8 files patched: QuoteCard, VocabCard, feed, generate, lesson/[id], character/[hanzi], dictionary, HanziWriterDisplay
- `.env.example` — +ELEVENLABS_API_KEY, +ELEVENLABS_VOICE_ID

---

## ✅ SPRINT 16 — [2026-05-29] Stripe Subscription + Premium Gate

### Quyết định
| Quyết định | Lý do |
|---|---|
| `stripe` dynamic import trong API routes | Tránh crash khi STRIPE_SECRET_KEY chưa set, trả 503 thay vì 500 |
| Type shim `src/types/stripe-shims.d.ts` | stripe v22 thiếu root index.d.ts — pattern tương tự next-auth Sprint 5 |
| Lifetime = `mode: "payment"` (one-time) | Không dùng subscription cho lifetime; Stripe phân biệt rõ |
| `PremiumGate` component 2 mode | `alwaysShow=true` → show với limit badge; default → blur + overlay |
| +500 XP khi upgrade | Gamification hook ngay khi mua, tạo cảm giác ngay lập tức |
| Weekly XP auto-reset mỗi thứ Hai | Competitive urgency, tăng DAU cuối tuần |
| `session.user.premium` exposed từ NextAuth | PremiumGate và các component đọc trực tiếp từ session, không cần API call thêm |

### Files Added / Changed
| File | Action |
|------|--------|
| `src/app/pricing/page.tsx` | NEW — Plans selector, comparison table, social proof |
| `src/app/pricing/success/page.tsx` | NEW — Success page sau thanh toán |
| `src/app/api/stripe/checkout/route.ts` | NEW — POST: tạo Checkout Session |
| `src/app/api/stripe/webhook/route.ts` | NEW — POST: xử lý checkout.session.completed + subscription.deleted |
| `src/components/ui/PremiumGate.tsx` | NEW — Wrapper component gate tính năng premium |
| `src/types/stripe-shims.d.ts` | NEW — Type declarations cho stripe v22 |
| `src/lib/auth-config.ts` | Updated — expose `session.user.premium` từ DB |
| `package.json` | Updated — thêm stripe dependency |
| `.env.example` | Updated — Stripe keys + Price IDs |

### Setup Stripe (hướng dẫn)
1. Tạo tài khoản tại stripe.com
2. Dashboard → Products → tạo 3 products (Monthly/Yearly/Lifetime)
3. Copy Price IDs vào .env.local
4. Dashboard → Developers → Webhooks → add endpoint `/api/stripe/webhook`
5. Events: `checkout.session.completed`, `customer.subscription.deleted`
6. Copy Webhook Secret vào .env.local

### TypeScript Status
- `npx tsc --noEmit` → **0 errors** ✓

### Project size (Sprint 16 end)
- **66 TypeScript files** (+6)
- **17 pages** (+2: /pricing, /pricing/success)
- **19 API routes** (+3: /api/tts, /api/stripe/checkout, /api/stripe/webhook)
- **10 UI components** (+1: PremiumGate)


---

## ✅ SPRINT 17 — [2026-05-29] Community Feed

### Quyết định
| Quyết định | Lý do |
|---|---|
| Community thay Leaderboard trong BottomNav | Community = daily engagement; Leaderboard vẫn accessible qua /leaderboard |
| 3 type: quote/story/question | Question type tạo discussion, viral hơn chỉ share quote |
| Optimistic like update | UX instant, revert khi API fail |
| Demo 4 posts fallback | App không trống khi DB chưa có UGC |
| is_verified (staff pick) | Chất lượng curation, trust signal |
| PostForm bottom sheet (không trang riêng) | Ít friction hơn, user post nhanh hơn |

---

## ✅ SPRINT 18 — [2026-05-29] Push Notifications

### Quyết định
| Quyết định | Lý do |
|---|---|
| web-push type shim (không install package) | Tránh npm install fail trong sandbox; web-push chỉ dùng server-side khi có VAPID keys |
| sw.js thuần (không next-pwa) | next-pwa thêm complexity; sw.js thủ công cho phép kiểm soát tốt hơn |
| `/api/push/send` admin-secret gated | Chỉ dùng từ cron job, không expose public |
| Offline cache cho /, /feed, /leaderboard, /flashcards | Core pages quan trọng nhất khi mất mạng |
| push_subscription lưu trên User model | Tránh thêm collection mới, đủ cho scale nhỏ |

### Cách dùng sau khi setup
```bash
# Gửi streak reminder hàng ngày lúc 20:00
curl -X POST https://mandomood.vercel.app/api/push/send \
  -H "Content-Type: application/json" \
  -d '{"title":"MandoMood","body":"Streak của bạn đang chờ! 🔥","secret":"YOUR_ADMIN_SECRET"}'
```

### Project size (Sprint 18 end)
- **72 TypeScript files**
- **18 pages** | **23 API routes** | **5 models** | **4 hooks**
- TypeScript: **0 errors** ✓

