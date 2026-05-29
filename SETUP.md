# 🚀 MandoMood — Hướng dẫn Setup & Chạy Code

> Dành cho: Ngô Thành Duy (Fullstack Fresher — HUTECH)
> Stack quen thuộc: React + Node.js + MongoDB + Zustand + OpenAI ✅

---

## 📁 Cấu trúc project

```
MandoMood/
├── src/
│   ├── app/                    ← Next.js App Router (pages + API)
│   │   ├── page.tsx            ← Trang chủ (Daily Quote)
│   │   ├── feed/page.tsx       ← Feed bài học
│   │   ├── ai-tutor/page.tsx   ← Chat AI Tutor
│   │   ├── profile/page.tsx    ← Hồ sơ người dùng
│   │   ├── layout.tsx          ← Layout chung (Navbar + BottomNav)
│   │   ├── globals.css         ← Global CSS + Tailwind
│   │   └── api/                ← API Routes (như Express routes)
│   │       ├── quotes/
│   │       │   ├── route.ts    ← GET/POST /api/quotes
│   │       │   └── daily/route.ts  ← GET /api/quotes/daily
│   │       ├── lessons/route.ts    ← GET/POST /api/lessons
│   │       └── ai/
│   │           ├── story/route.ts  ← POST /api/ai/story
│   │           └── chat/route.ts   ← POST /api/ai/chat
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      ← Header cố định
│   │   │   └── BottomNav.tsx   ← Navigation dưới
│   │   └── ui/
│   │       ├── QuoteCard.tsx   ← Card quote có audio + save + share
│   │       └── MoodFilter.tsx  ← Filter theo mood
│   ├── lib/
│   │   ├── mongodb.ts          ← MongoDB connection (singleton)
│   │   ├── openai.ts           ← OpenAI client + prompts
│   │   └── utils.ts            ← Helpers (cn, MOOD_COLORS, ...)
│   ├── models/
│   │   ├── Quote.ts            ← Mongoose schema cho Quote
│   │   ├── Lesson.ts           ← Mongoose schema cho Lesson
│   │   └── User.ts             ← Mongoose schema cho User
│   ├── store/
│   │   └── useAppStore.ts      ← Zustand global store (giống Trello project)
│   └── scripts/
│       └── seed.ts             ← Script thêm data mẫu vào MongoDB
├── .env.example                ← Template biến môi trường
├── .env.local                  ← (TỰ TẠO) Biến thực tế — KHÔNG commit!
├── .vscode/
│   ├── settings.json           ← VS Code settings tối ưu
│   └── extensions.json         ← Extensions khuyên dùng
├── index.html                  ← Landing page (deploy riêng)
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── SETUP.md                    ← File này
└── PROGRESS_LOG.md             ← Nhật ký tiến trình
```

---

## 🛠️ BƯỚC 1: Cài đặt môi trường

### 1.1 Yêu cầu

- Node.js >= 18 ([nodejs.org](https://nodejs.org))
- Git
- VS Code

### 1.2 Kiểm tra

```bash
node -v    # phải >= 18
npm -v     # phải >= 9
```

---

## 🗄️ BƯỚC 2: Setup MongoDB Atlas (MIỄN PHÍ)

1. Vào [mongodb.com/atlas](https://www.mongodb.com/atlas) → **Sign up free**
2. Tạo **Cluster M0 (Free)**
3. **Database Access**: Tạo user `mandomood` + password (lưu lại)
4. **Network Access**: Add IP `0.0.0.0/0` (allow all - để dev)
5. **Connect** → **Drivers** → Copy connection string:
   ```
   mongodb+srv://mandomood:<password>@cluster0.xxxxx.mongodb.net/
   ```

---

## 🔑 BƯỚC 3: Setup Environment Variables

```bash
# Copy template
cp .env.example .env.local
```

Mở `.env.local` và điền:

```env
# MongoDB (từ Bước 2)
MONGODB_URI=mongodb+srv://mandomood:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mandomood

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=abc123xyz789  # random string, bất kỳ cũng được

# OpenAI (tạo tại platform.openai.com → API Keys)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx

# Google OAuth (TÙY CHỌN - skip nếu chưa cần)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

> **Lưu ý**: Bạn đã làm JWT + OAuth2 trong Trello project rồi,
> Google OAuth ở đây cũng setup tương tự tại console.cloud.google.com

---

## 📦 BƯỚC 4: Cài packages và chạy

```bash
# Vào thư mục project
cd "C:\Users\Admin\Documents\Production_MandoMood\MandoMood"

# Cài dependencies
npm install

# Chạy development server
npm run dev
```

Mở browser: **http://localhost:3000** 🎉

---

## 🌱 BƯỚC 5: Seed data mẫu vào MongoDB

Sau khi đã có MONGODB_URI trong .env.local:

```bash
npm run seed
```

Output mong đợi:
```
🌱 Bắt đầu seed data...
✅ Đã kết nối MongoDB
🗑️  Đã xóa data cũ
✅ Đã thêm 8 quotes
✅ Đã thêm 2 lessons
🎉 Seed hoàn tất!
```

Reload **http://localhost:3000** để xem quotes từ DB.

---

## 💻 BƯỚC 6: Mở VS Code đúng cách

```bash
# Từ terminal, trong thư mục project:
code .
```

VS Code sẽ suggest cài extensions (từ `.vscode/extensions.json`):
- **Tailwind CSS IntelliSense** — autocomplete class names
- **Prettier** — format code tự động
- **ES7+ React Snippets** — snippet nhanh
- **MongoDB for VS Code** — xem DB trực tiếp trong editor

---

## 🗂️ BƯỚC 7: Hiểu cách code được tổ chức

### So sánh với Trello project của bạn:

| Trello Project          | MandoMood                          |
|-------------------------|------------------------------------|
| React 18 + Vite         | Next.js 14 (React 18 bên trong)    |
| Express API routes      | Next.js API Routes (cú pháp gần giống) |
| MongoDB + Mongoose      | MongoDB + Mongoose ✅ giống y chang |
| Zustand store           | Zustand store ✅ giống y chang      |
| OpenAI API              | OpenAI API ✅ giống y chang         |
| TailwindCSS             | TailwindCSS ✅ giống y chang        |
| JWT Auth                | NextAuth (wrapper JWT)             |

### Next.js API Route vs Express:

```typescript
// Express (Trello project)
router.get('/quotes', async (req, res) => {
  const quotes = await Quote.find();
  res.json(quotes);
});

// Next.js API Route (MandoMood) — tương tự!
export async function GET(req: NextRequest) {
  const quotes = await Quote.find();
  return NextResponse.json(quotes);
}
```

---

## 🔧 Commands thường dùng

```bash
npm run dev          # Chạy development (hot reload)
npm run build        # Build production
npm run start        # Chạy production build
npm run seed         # Thêm data mẫu vào MongoDB
npm run lint         # Check lỗi code
```

---

## 🌐 Test API với Postman (bạn đã quen rồi!)

Import collection hoặc test thủ công:

```
GET  http://localhost:3000/api/quotes/daily
GET  http://localhost:3000/api/quotes?mood=romantic&limit=5
GET  http://localhost:3000/api/lessons?level=hsk2

POST http://localhost:3000/api/ai/story
Body: { "level": "hsk2", "mood": "romantic", "theme": "mùa hè" }

POST http://localhost:3000/api/ai/chat
Body: {
  "messages": [{ "role": "user", "content": "Xin chào, dạy mình tiếng Trung nhé" }],
  "persona": "caring_friend"
}
```

---

## ❓ Troubleshooting

### Lỗi "Cannot find module 'next'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Lỗi MongoDB connection
- Kiểm tra MONGODB_URI trong `.env.local` có đúng không
- Kiểm tra Network Access trong Atlas đã allow IP chưa
- Kiểm tra username/password đúng chưa

### Lỗi OpenAI API
- Kiểm tra OPENAI_API_KEY bắt đầu bằng `sk-`
- Kiểm tra account có credit không tại platform.openai.com
- App vẫn chạy được với fallback data dù không có OpenAI

### TypeScript errors
```bash
npx tsc --noEmit    # xem danh sách lỗi type
```

### Port 3000 đang bận
```bash
npm run dev -- -p 3001   # Dùng port 3001
```

---

## 🚀 Deploy lên Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Sau đó vào Vercel dashboard → Environment Variables → Thêm tất cả biến từ `.env.local`.

---

## 📅 Các bước tiếp theo

Xem [PROGRESS_LOG.md](./PROGRESS_LOG.md) để biết những gì đã làm và việc tiếp theo.
