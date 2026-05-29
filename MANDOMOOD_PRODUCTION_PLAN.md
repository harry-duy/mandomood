# 🌸 MandoMood — KẾ HOẠCH PRODUCTION TOÀN DIỆN
> *"The most emotional way to learn Chinese."*
> Version 1.0 | Ngày lập: 28/05/2026

---

## MỤC LỤC

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Định Vị Thương Hiệu](#2-định-vị-thương-hiệu)
3. [Kiến Trúc Kỹ Thuật](#3-kiến-trúc-kỹ-thuật)
4. [Database Schema](#4-database-schema)
5. [Roadmap Theo Phase](#5-roadmap-theo-phase)
6. [Tính Năng Chi Tiết](#6-tính-năng-chi-tiết)
7. [UI/UX Design System](#7-uiux-design-system)
8. [AI & Content Engine](#8-ai--content-engine)
9. [Hệ Thống Gamification](#9-hệ-thống-gamification)
10. [Business Model & Pricing](#10-business-model--pricing)
11. [Marketing & Growth Strategy](#11-marketing--growth-strategy)
12. [Team Structure](#12-team-structure)
13. [Budget Estimation](#13-budget-estimation)
14. [KPIs & Metrics](#14-kpis--metrics)
15. [Risk Management](#15-risk-management)

---

## 1. TỔNG QUAN DỰ ÁN

### Thông tin cơ bản

| Hạng mục | Chi tiết |
|---|---|
| **Tên sản phẩm** | MandoMood |
| **Tên thay thế** | HanStory / HanVibe / ZhongLife |
| **Loại sản phẩm** | Web App (PWA) → Mobile App |
| **Ngôn ngữ dạy** | Tiếng Trung Phổ Thông (Mandarin) |
| **Thị trường mục tiêu** | Việt Nam → Đông Nam Á → Toàn cầu |
| **Target user** | Gen Z, 16–30 tuổi |
| **Mô hình kinh doanh** | Freemium + Subscription |

### Vấn đề cần giải quyết

Các app học ngoại ngữ hiện tại (Duolingo, HelloChinese, Drops) quá cứng nhắc:
- Bài tập lặp đi lặp lại nhàm chán
- Không có kết nối cảm xúc
- Không phù hợp với cách não Gen Z tiếp thu
- Thiếu tính giải trí và viral

### Giải pháp MandoMood

Học tiếng Trung qua **cảm xúc + kể chuyện + AI cá nhân hóa**:
- Mỗi bài học là một câu chuyện mini, câu nói hay, tình huống đời thực
- AI tạo nội dung cá nhân hóa theo mood và level
- Giao diện đẹp như social media, không như ứng dụng học
- Viral tự nhiên qua quote cards và social sharing

---

## 2. ĐỊNH VỊ THƯƠNG HIỆU

### Brand Identity

**Tagline chính:**
> "Học tiếng Trung qua cảm xúc, câu chuyện và cuộc sống."

**Tagline phụ (English):**
> "Learn Chinese through stories, feelings, and real life."

**Brand personality:**
- Emotional & Empathetic (hiểu cảm xúc người dùng)
- Aesthetic & Cinematic (đẹp như phim)
- Playful & Addictive (thú vị, không thể bỏ)
- Gen Z Native (nói ngôn ngữ của người dùng)

### Color System

```
Primary:
  Cream White:   #FFF8F0
  Warm Beige:    #F5E6D3
  Soft Red:      #E8504A
  Deep Black:    #1A1A1A

Accent:
  Gold:          #D4AF37
  Muted Rose:    #C9878A
  Sage Green:    #8FAF8F

Dark Mode:
  Background:    #0D0D0D
  Surface:       #1C1C1E
  Text:          #F5F5F0
  Accent Glow:   #E8504A (with opacity)
```

### Typography

```
Display Font:    Playfair Display (emotional, literary feel)
Body Font:       Inter (clean, modern)
Chinese Font:    Noto Serif SC / Source Han Serif
Accent Font:     Cormorant Garamond (cinematic)
```

---

## 3. KIẾN TRÚC KỸ THUẬT

### Tech Stack Overview

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  Next.js 14 (App Router) + TypeScript           │
│  TailwindCSS + Framer Motion                    │
│  PWA (Service Worker + Manifest)                │
└───────────────────┬─────────────────────────────┘
                    │ HTTPS / WebSocket
┌───────────────────▼─────────────────────────────┐
│                   BACKEND                        │
│  Next.js API Routes / Edge Functions            │
│  Supabase (PostgreSQL + Auth + Storage)         │
│  Redis (caching, rate limiting)                 │
└───────────┬───────────────────┬─────────────────┘
            │                   │
┌───────────▼──────┐  ┌────────▼────────────────┐
│   AI SERVICES    │  │   MEDIA SERVICES         │
│  OpenAI GPT-4o   │  │  ElevenLabs (TTS)       │
│  Claude 3.5      │  │  Cloudflare R2 (media)  │
│  Pinecone (vector│  │  Vercel Edge CDN         │
│  memory)         │  └─────────────────────────┘
└──────────────────┘
```

### Frontend Architecture

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth pages
│   │   ├── login/
│   │   └── register/
│   ├── (main)/                 # Main app
│   │   ├── feed/               # TikTok-style feed
│   │   ├── learn/              # Story-based lessons
│   │   │   ├── [lessonId]/
│   │   │   └── generate/       # AI story generator
│   │   ├── character/          # Character memory system
│   │   │   └── [hanzi]/
│   │   ├── practice/           # Speaking & shadowing
│   │   ├── ai-tutor/           # AI companion chat
│   │   ├── daily/              # Daily quote
│   │   ├── community/          # Social features
│   │   └── profile/
│   ├── api/                    # API routes
│   │   ├── ai/
│   │   │   ├── story/
│   │   │   ├── chat/
│   │   │   └── pronunciation/
│   │   ├── content/
│   │   └── user/
│   └── layout.tsx
├── components/
│   ├── ui/                     # Base components
│   ├── feed/                   # Feed components
│   ├── lesson/                 # Lesson components
│   ├── character/              # Hanzi components
│   └── shared/
├── lib/
│   ├── supabase/
│   ├── ai/
│   ├── audio/
│   └── hooks/
└── stores/                     # Zustand state management
```

### Backend / API Architecture

```
API Routes:
POST /api/ai/story/generate     → Tạo câu chuyện AI
POST /api/ai/chat               → Chat với AI tutor
POST /api/ai/pronunciation      → Chấm điểm phát âm
GET  /api/content/feed          → Feed nội dung
GET  /api/content/daily-quote   → Quote ngày hôm nay
POST /api/user/progress         → Lưu tiến trình
GET  /api/character/[hanzi]     → Thông tin chữ Hán
POST /api/community/post        → Đăng bài cộng đồng
```

### Infrastructure

```
Hosting:         Vercel (Frontend + API)
Database:        Supabase (PostgreSQL)
Storage:         Cloudflare R2 (audio, images)
CDN:             Vercel Edge Network
Cache:           Redis (Upstash)
AI:              OpenAI API + Anthropic API
TTS:             ElevenLabs API
Monitoring:      Vercel Analytics + Sentry
Auth:            Supabase Auth
Email:           Resend
```

---

## 4. DATABASE SCHEMA

### Core Tables

```sql
-- USERS
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  username        TEXT UNIQUE NOT NULL,
  display_name    TEXT,
  avatar_url      TEXT,
  level           VARCHAR(10) DEFAULT 'beginner',  -- beginner/hsk1-6
  xp              INTEGER DEFAULT 0,
  streak_days     INTEGER DEFAULT 0,
  last_active     TIMESTAMPTZ DEFAULT NOW(),
  premium         BOOLEAN DEFAULT FALSE,
  premium_until   TIMESTAMPTZ,
  tutor_persona   VARCHAR(50) DEFAULT 'caring_friend',
  preferences     JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- LESSONS (Story-based)
CREATE TABLE lessons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  content_type    VARCHAR(50),  -- story/quote/dialogue/meme/diary
  level           VARCHAR(10),  -- beginner/hsk1-6
  mood            VARCHAR(50),  -- romantic/healing/motivation/sad
  chinese_text    TEXT NOT NULL,
  pinyin          TEXT,
  translation     TEXT NOT NULL,
  vocabulary      JSONB,        -- [{hanzi, pinyin, meaning, example}]
  grammar_notes   TEXT,
  cultural_notes  TEXT,
  audio_url       TEXT,
  image_url       TEXT,
  tags            TEXT[],
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES users(id),
  view_count      INTEGER DEFAULT 0,
  save_count      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CHARACTERS (Hanzi System)
CREATE TABLE characters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hanzi           TEXT UNIQUE NOT NULL,
  pinyin          TEXT NOT NULL,
  tone            INTEGER,      -- 1-4
  meaning         TEXT[],
  radical         TEXT,
  stroke_count    INTEGER,
  stroke_order_gif TEXT,
  origin_story    TEXT,
  visual_mnemonic TEXT,
  emotional_hook  TEXT,
  hsk_level       INTEGER,
  example_sentences JSONB,
  related_chars   TEXT[]
);

-- USER PROGRESS
CREATE TABLE user_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  lesson_id       UUID REFERENCES lessons(id),
  status          VARCHAR(20) DEFAULT 'started',  -- started/completed
  score           INTEGER,
  time_spent      INTEGER,     -- seconds
  completed_at    TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

-- CHARACTER MASTERY
CREATE TABLE character_mastery (
  user_id         UUID REFERENCES users(id),
  character_id    UUID REFERENCES characters(id),
  mastery_level   INTEGER DEFAULT 0,   -- 0-5 (SRS levels)
  next_review     TIMESTAMPTZ,
  review_count    INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, character_id)
);

-- DAILY QUOTES
CREATE TABLE daily_quotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date            DATE UNIQUE NOT NULL,
  chinese_text    TEXT NOT NULL,
  pinyin          TEXT,
  translation     TEXT NOT NULL,
  author          TEXT,
  source          TEXT,
  mood            VARCHAR(50),
  audio_url       TEXT,
  background_url  TEXT,
  cultural_note   TEXT
);

-- FEED POSTS
CREATE TABLE feed_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       UUID REFERENCES lessons(id),
  post_type       VARCHAR(50),  -- quote/story/meme/pronunciation
  media_url       TEXT,
  thumbnail_url   TEXT,
  duration        INTEGER,      -- seconds (for video)
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- USER SAVES / COLLECTIONS
CREATE TABLE user_collections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  name            TEXT NOT NULL,
  description     TEXT,
  is_public       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE collection_items (
  collection_id   UUID REFERENCES user_collections(id),
  lesson_id       UUID REFERENCES lessons(id),
  added_at        TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, lesson_id)
);

-- AI CHAT SESSIONS
CREATE TABLE ai_chat_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  tutor_persona   VARCHAR(50),
  messages        JSONB DEFAULT '[]',
  summary         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ACHIEVEMENTS
CREATE TABLE achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key             TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  icon_url        TEXT,
  xp_reward       INTEGER DEFAULT 0,
  condition_type  VARCHAR(50),
  condition_value INTEGER
);

CREATE TABLE user_achievements (
  user_id         UUID REFERENCES users(id),
  achievement_id  UUID REFERENCES achievements(id),
  earned_at       TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);
```

---

## 5. ROADMAP THEO PHASE

### PHASE 0 — Foundation (Tuần 1-2)
**Mục tiêu:** Setup môi trường, khung dự án

- [ ] Khởi tạo Next.js 14 project + TypeScript
- [ ] Setup Supabase (Auth + Database)
- [ ] Cấu hình TailwindCSS + Framer Motion
- [ ] Design system cơ bản (colors, typography, components)
- [ ] CI/CD pipeline (Vercel + GitHub Actions)
- [ ] Domain + SSL setup
- [ ] Tạo database schema đầy đủ
- [ ] Seeding data ban đầu (100 câu quote, 200 chữ Hán)

**Deliverable:** Khung app chạy được, auth hoạt động

---

### PHASE 1 — MVP Core (Tuần 3-6)
**Mục tiêu:** Sản phẩm có thể dùng được với tính năng cốt lõi

#### Tuần 3: Content Foundation
- [ ] Story-based lesson viewer
- [ ] Daily Quote page (trang chính khi mở app)
- [ ] Character detail page (Hanzi card)
- [ ] Audio player (TTS với ElevenLabs)
- [ ] Basic lesson list + filter

#### Tuần 4: User System
- [ ] Google OAuth login
- [ ] User profile page
- [ ] Progress tracking
- [ ] Save/bookmark lessons
- [ ] XP system cơ bản

#### Tuần 5: Feed & Discovery
- [ ] TikTok-style vertical feed
- [ ] Swipe navigation
- [ ] Filter theo mood/level
- [ ] Search functionality
- [ ] Quote card share image generator

#### Tuần 6: Polish & PWA
- [ ] PWA setup (offline support, installable)
- [ ] Dark mode
- [ ] Mobile responsive hoàn thiện
- [ ] Performance optimization (LCP < 2s)
- [ ] Beta testing với 50 users

**Deliverable:** MVP có thể launch, test với người dùng thật

---

### PHASE 2 — AI Features (Tuần 7-10)
**Mục tiêu:** Tích hợp AI, tạo trải nghiệm cá nhân hóa

#### Tuần 7: AI Story Generator
- [ ] Giao diện request story ("Tạo câu chuyện lãng mạn với từ HSK2")
- [ ] OpenAI GPT-4o integration cho story generation
- [ ] Prompt engineering tinh chỉnh
- [ ] Story auto-breakdown (vocab + grammar)
- [ ] Rate limiting (free: 3 stories/day, premium: unlimited)

#### Tuần 8: AI Tutor Chat
- [ ] Chat interface với AI tutor
- [ ] 6 tutor personas (cold girl, caring friend, CEO mentor...)
- [ ] Claude API integration
- [ ] Conversation memory (Pinecone vector DB)
- [ ] Adaptive level detection
- [ ] Grammar correction gentleness

#### Tuần 9: Pronunciation Practice
- [ ] Microphone recording trong browser
- [ ] AI pronunciation scoring
- [ ] Waveform visualization
- [ ] Comparison với native audio
- [ ] Tone accuracy feedback

#### Tuần 10: Personalization Engine
- [ ] Learning path recommendation
- [ ] Mood-based content serving
- [ ] Adaptive difficulty
- [ ] "For You" feed algorithm
- [ ] Weekly learning report

**Deliverable:** App có đầy đủ AI features, ready for public launch

---

### PHASE 3 — Social & Community (Tuần 11-14)
**Mục tiêu:** Viral growth, community building

- [ ] Community feed (user-generated posts)
- [ ] Collections sharing
- [ ] Follow system
- [ ] Comment & reaction
- [ ] Weekly challenges
- [ ] Leaderboard
- [ ] Creator program (upload learning packs)
- [ ] Referral system

**Deliverable:** Social features live, viral loops active

---

### PHASE 4 — Growth & Scale (Tháng 4-6)
**Mục tiêu:** Tăng trưởng, tối ưu, mở rộng

- [ ] Analytics dashboard nội bộ
- [ ] A/B testing framework
- [ ] Email marketing automation (Resend)
- [ ] TikTok/Instagram content pipeline
- [ ] SEO optimization
- [ ] Premium subscription launch
- [ ] Affiliate program
- [ ] iOS/Android native app (React Native / Flutter)

---

### PHASE 5 — Scale & Expansion (Tháng 7-12)
**Mục tiêu:** Mở rộng thị trường, thêm ngôn ngữ

- [ ] Thêm tiếng Anh song song tiếng Trung
- [ ] Thêm tiếng Nhật / Hàn (future)
- [ ] HSK roadmap chính thức
- [ ] B2B (trường học, trung tâm)
- [ ] Creator marketplace
- [ ] Series nội dung (C-drama vocabulary, Business Chinese...)

---

## 6. TÍNH NĂNG CHI TIẾT

### 6.1 Daily Quote System (Feature #1 — HIGH PRIORITY)

**Luồng hoạt động:**
```
Mở app → Daily Quote xuất hiện fullscreen
  → Chữ Trung to, đẹp + Pinyin + Dịch nghĩa
  → Audio tự động phát (ElevenLabs giọng native)
  → Swipe lên → Chi tiết vocab + grammar
  → Nút: [Lưu] [Chia sẻ] [Học thêm]
  → Tạo ảnh quote card đẹp để share lên Story
```

**Categories mood:**
- 💔 Heartbreak (tâm trạng buồn)
- 🌸 Healing (chữa lành)
- 🔥 Motivation (động lực)
- 💚 Friendship (tình bạn)
- ✨ Self-growth (phát triển bản thân)
- 🌙 Aesthetic (thơ văn đẹp)
- 😂 Funny/Meme (hài hước)

### 6.2 Story-Based Lesson (Feature #2 — CORE)

**Cấu trúc mỗi lesson:**
```
1. HOOK (0-3s)
   → Ảnh/video thumbnail gợi cảm xúc
   → Câu opening bằng tiếng Trung

2. STORY (Main content)
   → Chinese text (từng câu highlight)
   → Pinyin bên dưới (có thể ẩn để thực hành)
   → Translation (tiếng Việt + tiếng Anh)
   → Audio tự phát, hoặc tap để nghe

3. BREAKDOWN
   → Vocabulary: [Chữ → Pinyin → Nghĩa → Ví dụ]
   → Grammar pattern highlight
   → Cultural note (nếu có)

4. QUIZ MINI (không bắt buộc)
   → 3 câu hỏi nhanh, gamified
   → +XP khi hoàn thành

5. EMOTION CONNECTION
   → "Câu này làm bạn nghĩ đến điều gì?"
   → User có thể note cảm xúc cá nhân
```

**Content types:**
- 📖 Mini Story (truyện ngắn 5-10 câu)
- 💬 Dialogue (hội thoại 2 người)
- 🎬 Movie Line (trích câu thoại phim)
- 📓 Diary Entry (nhật ký)
- 😂 Meme Format (hài hước)
- 💌 Love Letter (thư tình)
- 🌿 Poetry (thơ cổ điển + hiện đại)

### 6.3 AI Tutor System (Feature #3 — PREMIUM)

**6 Personas:**

| Persona | Tên | Phong cách |
|---|---|---|
| cold_girl | 冰冰 (Bīng Bīng) | Lạnh lùng, thẳng thắn, hiệu quả |
| caring_friend | 小暖 (Xiǎo Nuǎn) | Ấm áp, khuyến khích, kiên nhẫn |
| funny_bff | 哈哈 (Hā Hā) | Hài hước, meme, năng lượng cao |
| ceo_mentor | 总总 (Zǒng Zǒng) | Chuyên nghiệp, định hướng mục tiêu |
| idol_style | 星星 (Xīng Xīng) | Cuồng nhiệt, K-pop/C-pop vibe |
| anime_sensei | 先生 (Xiān Shēng) | Nghiêm túc nhưng gentle |

**Chức năng:**
- Chat tự nhiên bằng Trung + Việt xen kẽ
- Sửa lỗi nhẹ nhàng, không làm xấu hổ
- Tạo mini-quiz trong cuộc trò chuyện
- Gợi ý từ mới dựa theo level
- Nhớ lịch sử học (vector memory)

### 6.4 Character Memory System (Feature #4)

**Mỗi chữ Hán có:**
```
爱 (ài) — Tình yêu

📖 Origin Story:
"Chữ 爱 gồm 心 (tim) ở giữa — vì tình yêu
 xuất phát từ trái tim..."

🧠 Visual Mnemonic:
[Animation: tim đập trong chữ 爱]

✍️ Stroke Order:
[GIF 13 nét, chậm → nhanh]

💬 Emotional Hook:
"Người ta nói 爱 mà không cần 心 là giả dối..."

📚 Example sentences (HSK level tương ứng)

🔗 Related chars: 爱好/爱人/可爱
```

### 6.5 Short Video Feed (Feature #5)

**TikTok-style feed:**
- Full-screen vertical cards
- Auto-play audio khi dừng
- Swipe up = next, swipe right = save
- Double tap = react
- Tap chữ = xem nghĩa popup

**Content cards:**
- Quote card (ảnh đẹp + text)
- Pronunciation clip (audio sóng âm)
- Story snippet (scroll dọc)
- Meme Chinese (format phổ biến)
- C-drama dialogue (kèm clip nếu được phép)

---

## 7. UI/UX DESIGN SYSTEM

### Page Structure

```
Mobile First Layout (375px base):

┌────────────────────┐
│  Status Bar        │
├────────────────────┤
│  Header (56px)     │  ← Logo + Search + Avatar
├────────────────────┤
│                    │
│                    │
│   MAIN CONTENT     │  ← Full screen / scrollable
│                    │
│                    │
├────────────────────┤
│  Bottom Nav (64px) │  ← Feed | Learn | AI | Profile
└────────────────────┘
```

### Component Library

**Lesson Card:**
```
┌─────────────────────────────┐
│  [Mood Badge] [Level Badge] │
│                             │
│  Chinese Text (32px bold)   │
│  Pinyin (14px, muted)       │
│                             │
│  Translation (16px)         │
│                             │
│  ─────────────────────────  │
│  [🔊 Audio] [💾 Save] [↗]  │
└─────────────────────────────┘
```

**Hanzi Card:**
```
┌─────────────────────────────┐
│         爱                  │  ← 120px, animated
│      ài / tình yêu          │
│                             │
│  ❤️ Origin  ✏️ Strokes      │
│  🧠 Memory  💬 Examples     │
│                             │
│  [Mastery Level: ████░ 4/5] │
└─────────────────────────────┘
```

### Animation Guidelines

```javascript
// Page transitions
pageTransition: {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  duration: 0.3
}

// Card hover
cardHover: {
  scale: 1.02,
  transition: { type: "spring", stiffness: 300 }
}

// Swipe feed
swipeFeed: {
  drag: "y",
  dragConstraints: { top: 0, bottom: 0 },
  onDragEnd: handleSwipe
}
```

### Dark Mode

Dark mode thiết kế như **giao diện rạp chiếu phim:**
- Background: `#0D0D0D` (không phải pure black)
- Text: `#F5F5F0` (không phải pure white)
- Cards: `#1C1C1E` với subtle glow
- Accent: `#E8504A` với bloom effect
- Pinyin: muted gold `#B8963E`

---

## 8. AI & CONTENT ENGINE

### Content Generation Pipeline

```
1. SEED DATA (Manual)
   → 500 quotes chọn lọc
   → 1000 Hanzi + stories
   → 50 lesson templates

2. AI GENERATION (Daily)
   → GPT-4o tạo 20 câu chuyện mới/ngày
   → Review bán tự động (human-in-loop)
   → Auto-publish những cái đủ chất lượng

3. USER REQUESTS (Real-time)
   → User request → AI generate → instant delivery
   → Cache stories phổ biến

4. COMMUNITY CONTENT
   → Users tạo → moderator review → publish
   → Creator badges + rewards
```

### Prompt Templates

**Story Generation Prompt:**
```
Bạn là chuyên gia ngôn ngữ và nhà văn sáng tạo.
Tạo một câu chuyện ngắn (5-8 câu) bằng tiếng Trung với:
- Level: {level}
- Mood: {mood}
- Theme: {theme}
- Vocabulary focus: {vocab_list} (nếu có)

Yêu cầu:
- Câu chuyện phải tạo cảm xúc thật sự
- Ngôn ngữ tự nhiên, không giáo khoa
- Kèm breakdown vocab + grammar note
- Thêm cultural/emotional hook

Format trả về: JSON với fields:
title, chinese_text, pinyin, translation,
vocabulary[], grammar_notes, cultural_note, mood
```

### AI Pronunciation Scoring

```
Stack: Azure Speech Services / OpenAI Whisper
Flow:
  User records → Upload audio →
  AI transcribe → Compare với original →
  Score: Tone accuracy (40%) + Pronunciation (40%) + Fluency (20%) →
  Feedback: "Tone 2 của 你 cần lên cao hơn..."
```

### Adaptive Learning Algorithm

```python
def recommend_next_lesson(user):
    # Factors:
    # 1. Current level (beginner/hsk1-6)
    # 2. Recent mood (từ interaction patterns)
    # 3. Weak vocabulary (từ quiz results)
    # 4. Time of day (morning = motivation, evening = relaxing)
    # 5. Streak status (streak at risk? → easier content)

    score = (
        level_match * 0.3 +
        mood_match * 0.25 +
        vocab_gap * 0.25 +
        time_context * 0.1 +
        streak_boost * 0.1
    )
    return sorted(candidates, key=score)
```

---

## 9. HỆ THỐNG GAMIFICATION

### XP System

| Hành động | XP |
|---|---|
| Xem lesson | +5 XP |
| Hoàn thành lesson | +20 XP |
| Quiz đúng 100% | +30 XP |
| Luyện phát âm | +15 XP |
| Chat AI tutor | +10 XP |
| Daily streak | +25 XP × streak_multiplier |
| Chia sẻ quote | +5 XP |
| Nhận follower | +10 XP |

### Level System

```
Tên cấp độ (có chủ đề): 
Lv1:   初见   (Chūjiàn)    — "Lần đầu gặp gỡ"        0-100 XP
Lv2:   好奇   (Hàoqí)     — "Tò mò"                  100-300 XP
Lv3:   迷恋   (Míliàn)    — "Say mê"                  300-700 XP
Lv4:   心动   (Xīndòng)   — "Rung động"               700-1500 XP
Lv5:   相知   (Xiāngzhī)  — "Hiểu nhau"               1500-3000 XP
Lv6:   深情   (Shēnqíng)  — "Sâu đậm"                 3000-6000 XP
Lv7:   灵魂   (Línghún)   — "Linh hồn"                6000+ XP
```

### Achievement Badges

```
🌸 "初心者"   — Học bài đầu tiên
🔥 "热情"    — 7 ngày streak liên tục
💯 "完美"    — Quiz 100% lần đầu
🌙 "夜归人"  — Học lúc 11PM-1AM (10 lần)
💌 "情话王"  — Lưu 50 câu lãng mạn
🐉 "懂王"    — Học 100 chữ Hán
✨ "分享者"  — Share 20 quote card
🤝 "朋友"    — Có 10 followers
```

### Streak System

```
Streak ≥ 3:  🔥 Fire badge
Streak ≥ 7:  🌟 Star badge  
Streak ≥ 30: 💎 Diamond badge
Streak ≥ 100: 🐉 Dragon badge

Streak protection:
- Free users: 1 freeze/tháng
- Premium: 3 freeze/tháng
```

### Collectible Quote Cards

Mỗi quote có một "card" collectible với:
- Rare level: Common / Rare / Epic / Legendary
- Design đặc biệt (animated particles cho Legendary)
- Có thể hiển thị trong profile
- Có thể share ra ngoài (watermark MandoMood)

---

## 10. BUSINESS MODEL & PRICING

### Free Tier

```
✅ Unlimited feed browsing
✅ 5 lessons/ngày
✅ Daily quote
✅ Basic character lookup (50/ngày)
✅ 3 AI-generated stories/tháng
✅ 5 AI tutor messages/ngày
✅ Community access
✅ Basic analytics

❌ AI tutor (limited)
❌ Pronunciation scoring
❌ Offline mode
❌ Streak freeze
❌ All personas
```

### Premium — "MandoMood Pro"

**Pricing:**
```
Monthly:    $5.99 / tháng   (~150,000 VNĐ)
Yearly:     $49.99 / năm    (~1,250,000 VNĐ) → tiết kiệm 30%
Lifetime:   $149.99          (~3,750,000 VNĐ) — Early bird
```

**Included:**
```
✅ Unlimited lessons
✅ Unlimited AI story generation
✅ Unlimited AI tutor + tất cả personas
✅ Pronunciation scoring (không giới hạn)
✅ Offline mode
✅ 3 streak freeze/tháng
✅ Early access to new features
✅ No ads (khi có ads)
✅ Priority AI processing
✅ Export collections (PDF/Image)
✅ HSK roadmap cá nhân hóa
✅ Advanced analytics
```

### Revenue Streams

```
Primary:
  → Premium subscriptions
  → Lifetime deals

Secondary:
  → Creator program commission (10-20%)
  → B2B licenses (trường học)
  → Sponsored content (thương hiệu phù hợp)
  → White-label platform (tương lai)
```

### Revenue Projection

```
Month 3:   500 users   → 50 premium  → $300/month
Month 6:   2,000 users → 200 premium → $1,200/month
Month 12:  10,000 users → 1,000 premium → $6,000/month
Month 24:  50,000 users → 5,000 premium → $30,000/month
```

---

## 11. MARKETING & GROWTH STRATEGY

### Phase 1: Pre-Launch (Trước khi launch)

**Waitlist Building:**
- Landing page đẹp với email capture
- "Be the first 1000 users" — exclusive perks
- Share để vào sớm hơn (referral waitlist)
- TikTok teaser content (7-14 ngày trước launch)

**Content Seeding:**
```
Tạo trước 30 piece content:
- 15 quote cards tiếng Trung siêu đẹp
- 5 "Did you know?" về tiếng Trung
- 5 C-drama dialogue clips
- 5 hướng dẫn "học tiếng Trung không boring"
```

### Phase 2: Launch Week

**Viral Hook:**
```
"Học tiếng Trung trong 60 giây — mỗi ngày một câu cảm xúc"
→ TikTok / Reels với format: Quote → Nghĩa → Cách dùng
→ CTA: "Tải MandoMood học thêm hàng ngàn câu như này"
```

**Platform Strategy:**
```
TikTok:         Emotional Chinese quotes (main channel)
Instagram:      Quote card aesthetics + stories
YouTube Shorts: "60s Chinese lesson" series
Facebook:       Groups học tiếng Trung Việt Nam
Xiaohongshu:    Target users đang học tiếng Trung
Pinterest:      Quote card boards
Reddit:         r/languagelearning, r/ChineseLanguage
```

### Content Pillars

```
Pillar 1: EMOTIONAL QUOTES (40%)
"5 câu tiếng Trung hay nhất về tình yêu"
"Người Trung Quốc nói gì khi bị thất tình"

Pillar 2: CULTURAL INSIGHTS (25%)
"Tại sao người Trung không nói 'I love you' trực tiếp"
"Ý nghĩa thật sự của chữ 缘分"

Pillar 3: LEARNING HACKS (20%)
"Học 10 chữ Hán trong 5 phút bằng cách này"
"Tại sao học từ phim C-drama hiệu quả hơn sách"

Pillar 4: APP SHOWCASE (15%)
"AI dạy tôi tiếng Trung như thế nào"
"Tôi đã học tiếng Trung 30 ngày với MandoMood"
```

### Growth Loops

```
Viral Loop 1: SHARE TO GROW
User thích quote → Tạo quote card đẹp → Share lên Story
→ Bạn bè thấy → Tải app → Cycle lặp lại

Viral Loop 2: STREAK PRESSURE
Streak dài → Không dám bỏ → Invite bạn học cùng
→ Challenge nhau → Community grows

Viral Loop 3: AI MAGIC
User tạo AI story → Chia sẻ câu chuyện độc đáo
→ Viral vì unique content → FOMO → Downloads
```

### SEO Strategy

```
Target keywords (Việt Nam):
- "học tiếng Trung online miễn phí"
- "app học tiếng Trung hiệu quả"
- "câu nói hay tiếng Trung"
- "tiếng Trung qua phim"
- "HSK học ở đâu"

Content SEO:
- Blog: "100 câu tiếng Trung hay nhất về tình yêu"
- Landing pages cho từng HSK level
- Character lookup pages (SEO goldmine)
```

---

## 12. TEAM STRUCTURE

### Giai đoạn khởi đầu (MVP — 1-2 người)

```
Founder/Dev:
  - Full-stack development (Next.js + Supabase)
  - AI integration
  - Product decisions

Nếu có co-founder:
  - Content creation (quotes, stories)
  - Marketing (TikTok, Instagram)
  - User research
```

### Giai đoạn growth (Scale — 5-8 người)

```
Tech:
  → Lead Developer (full-stack)
  → Frontend Developer (UI/animations)
  → AI/ML Engineer

Content:
  → Content Lead (Chinese language expert)
  → Content Creator (video/graphic)

Business:
  → Growth/Marketing Manager
  → Customer Success

Optional:
  → Designer (UI/UX)
  → Community Manager
```

### Outsource giai đoạn đầu

```
Không cần thuê full-time, thuê theo project:
  → Voice actor (Chinese native) — ElevenLabs thay thế được
  → Illustrator — AI image tools
  → Translator/Language checker — Freelance
  → Logo & brand design — Fiverr/Behance
```

---

## 13. BUDGET ESTIMATION

### MVP Phase (3 tháng đầu)

| Chi phí | Monthly | Notes |
|---|---|---|
| Vercel Pro | $20 | Hosting + CDN |
| Supabase Pro | $25 | DB + Auth + Storage |
| OpenAI API | $50-200 | Tùy usage |
| Anthropic API | $30-100 | Claude for chat |
| ElevenLabs | $22 | TTS audio |
| Upstash Redis | $0-10 | Cache |
| Domain | $1/month | MandoMood.com |
| **Total** | **~$150-380/month** | |

### Growth Phase (6-12 tháng)

| Chi phí | Monthly | Notes |
|---|---|---|
| Vercel Team | $50 | More bandwidth |
| Supabase | $25-100 | Scale with users |
| OpenAI | $200-500 | More requests |
| ElevenLabs | $99 | Creator tier |
| Pinecone | $0-70 | Vector DB |
| Cloudflare R2 | $15 | Media storage |
| Resend | $20 | Email |
| Monitoring | $30 | Sentry + analytics |
| **Total** | **~$450-900/month** | |

### Break-even Point

```
Monthly costs: ~$500
Revenue needed: $500 / $5.99 = ~84 premium users
Target month: Month 4-5
```

---

## 14. KPIs & METRICS

### North Star Metric

> **"Daily Active Learners"** — Số người học ít nhất 1 bài/ngày

### Core Metrics

```
Acquisition:
  DAU/MAU ratio          → Target: >30%
  Install → Register     → Target: >60%
  Register → D1 active   → Target: >50%

Engagement:
  Session length         → Target: >8 minutes
  Sessions/day           → Target: >1.5
  Streak completion rate → Target: >40%
  Lessons/session        → Target: >3

Retention:
  D1 retention           → Target: >50%
  D7 retention           → Target: >30%
  D30 retention          → Target: >20%
  Monthly churn          → Target: <5%

Revenue:
  Free → Premium         → Target: >5%
  MRR growth             → Target: >20%/month
  LTV                    → Target: >$30
  CAC                    → Target: <$5
```

### Weekly Review Checklist

```
[ ] New users this week
[ ] Streak completion rate
[ ] Most-saved lessons
[ ] AI feature usage rate
[ ] Churn signals (users not returning)
[ ] Top performing content
[ ] User feedback themes
[ ] Revenue metrics
```

---

## 15. RISK MANAGEMENT

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI API costs vượt budget | Cao | Cao | Rate limiting, caching aggressive |
| TTS latency cao | Trung | Cao | Pre-generate audio, CDN |
| Pronunciation scoring không chính xác | Trung | Trung | Multiple AI models, fallback |
| Database scale issues | Thấp | Cao | Supabase auto-scale, index tốt |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Low conversion free→premium | Cao | Cao | Feature gates được thiết kế kỹ |
| Cạnh tranh từ app lớn | Trung | Trung | Niche emotional learning, không đối đầu trực tiếp |
| Content quality không đủ | Trung | Cao | Editorial review process |
| User churn sau 7 ngày | Cao | Cao | Streak + notification strategy |

### Mitigation Strategies

```
1. AI Costs → Cache aggressively, pre-generate popular content
2. Retention → Streak system + daily push notification
3. Quality → Human review của AI content trước khi publish
4. Competition → Focus vào emotional niche, không cố thành Duolingo
5. Legal → Không dùng copyrighted C-drama dialogue, tự tạo content
```

---

## QUICK START CHECKLIST

### Tuần 1 — Bắt đầu ngay:

```
[ ] Đăng ký domain: mandomood.com (hoặc .app / .io)
[ ] Tạo GitHub repo: mandomood/mandomood
[ ] Setup Supabase project (free tier)
[ ] Khởi tạo Next.js 14 project
[ ] Deploy skeleton lên Vercel
[ ] Thiết kế Figma: 3 screens (Daily Quote, Lesson, Feed)
[ ] Viết 20 câu quote đầu tiên
[ ] Setup OpenAI API key
[ ] Tạo TikTok account @mandomood
```

### Commands để start:

```bash
# Khởi tạo project
npx create-next-app@latest mandomood \
  --typescript --tailwind --eslint --app

# Install dependencies
cd mandomood
npm install @supabase/supabase-js @supabase/ssr \
  framer-motion zustand @tanstack/react-query \
  lucide-react clsx tailwind-merge

# Setup Supabase
npm install supabase --save-dev
npx supabase init
npx supabase start

# Deploy preview
npx vercel
```

---

*Kế hoạch này là living document — cập nhật sau mỗi sprint.*
*Ưu tiên: Build → Measure → Learn → Iterate*

> 🌸 "不积跬步，无以至千里" — Không tích lũy từng bước nhỏ, không thể đi nghìn dặm.
> *Bắt đầu nhỏ. Cảm xúc lớn. Grow together.*
