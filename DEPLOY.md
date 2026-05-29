# 🚀 MandoMood — Huong Dan Deploy

> Cap nhat: 2026-05-28

---

## ✅ CHECKLIST TRUOC KHI DEPLOY

- [ ] Da co tai khoan MongoDB Atlas
- [ ] Da co tai khoan Google Cloud Console
- [ ] Da co tai khoan OpenAI (API key)
- [ ] Da co tai khoan Vercel
- [ ] Da tao file `.env.local` day du
- [ ] `npx tsc --noEmit` khong co loi
- [ ] Test chay duoc o local (`npm run dev`)

---

## 1. SETUP MONGODB ATLAS

### Tao Cluster
1. Vao https://cloud.mongodb.com → New Project → "MandoMood"
2. Build a Database → **Free (M0)** → chon region gan nhat (Singapore)
3. Cluster name: `mandomood-cluster`

### Tao Database User
1. Database Access → Add New User
   - Username: `mandomood`
   - Password: (tao password manh, luu lai)
   - Role: **Atlas Admin**

### Whitelist IP
1. Network Access → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
   - (Vercel dung dynamic IP nen phai allow all)

### Lay Connection String
1. Clusters → Connect → Drivers → Node.js
2. Copy string dang: `mongodb+srv://mandomood:<password>@mandomood-cluster.xxxxx.mongodb.net/`
3. Thay `<password>` bang password thuc
4. Them `/mandomood?retryWrites=true&w=majority` vao cuoi

```
MONGODB_URI=mongodb+srv://mandomood:YOURPASSWORD@mandomood-cluster.xxxxx.mongodb.net/mandomood?retryWrites=true&w=majority
```

---

## 2. SETUP GOOGLE OAUTH

1. Vao https://console.cloud.google.com
2. New Project → "MandoMood"
3. APIs & Services → OAuth consent screen:
   - User Type: **External**
   - App name: MandoMood
   - Support email: ngothanhduy04@gmail.com
4. Credentials → Create Credentials → **OAuth client ID**:
   - Type: Web application
   - Name: MandoMood Web
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://mandomood.vercel.app/api/auth/callback/google
     https://yourdomain.com/api/auth/callback/google
     ```
5. Copy **Client ID** va **Client Secret**

```
GOOGLE_CLIENT_ID=xxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
```

---

## 3. TAO .env.local

Tao file `.env.local` trong thu muc `MandoMood/`:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://mandomood:PASSWORD@cluster.mongodb.net/mandomood?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=random_secret_32_chars_minimum

# Google OAuth
GOOGLE_CLIENT_ID=xxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Tao NEXTAUTH_SECRET
Chay lenh nay de tao secret ngau nhien:
```bash
openssl rand -base64 32
```

---

## 4. SEED DATA VAO MONGODB

```bash
# Cai dep truoc
npm install

# Chay app local
npm run dev

# Trong terminal moi, seed data
npx tsx src/scripts/seed.ts
```

Sau khi seed, MongoDB se co:
- 8 quotes (cac mood khac nhau)
- 2 lessons mau

---

## 5. TEST LOCAL

```bash
npm run dev
# Mo browser: http://localhost:3000
```

Kiem tra cac trang:
- `/` — Trang chu (Daily Quote)
- `/feed` — Feed bai hoc
- `/lesson/l1` — Bai hoc chi tiet
- `/dictionary` — Tu dien
- `/ai-tutor` — AI Tutor chat
- `/generate` — Tao story AI
- `/search` — Tim kiem
- `/profile` — Ho so nguoi dung
- `/login` — Dang nhap Google

---

## 6. DEPLOY LEN VERCEL

### Buoc 1 — Push code len GitHub
```bash
cd MandoMood
git init
git add .
git commit -m "feat: MandoMood MVP v1.0"
git remote add origin https://github.com/YOURUSERNAME/mandomood.git
git push -u origin main
```

### Buoc 2 — Import vao Vercel
1. Vao https://vercel.com → New Project
2. Import Git Repository → chon repo `mandomood`
3. Framework Preset: **Next.js** (tu dong detect)
4. Root Directory: `MandoMood` (neu repo co nhieu folder)

### Buoc 3 — Them Environment Variables
Trong Vercel Dashboard → Settings → Environment Variables, them tung bien:

| Name | Value | Environments |
|------|-------|-------------|
| MONGODB_URI | mongodb+srv://... | Production, Preview |
| NEXTAUTH_URL | https://mandomood.vercel.app | Production |
| NEXTAUTH_SECRET | (openssl rand -base64 32) | All |
| GOOGLE_CLIENT_ID | xxxxxx.apps.googleusercontent.com | All |
| GOOGLE_CLIENT_SECRET | GOCSPX-xxx | All |
| OPENAI_API_KEY | sk-proj-xxx | All |

### Buoc 4 — Deploy
Click **Deploy** → doi 2-3 phut

### Buoc 5 — Cap nhat Google OAuth redirect
Quay lai Google Cloud Console → Credentials → Them URI:
```
https://mandomood.vercel.app/api/auth/callback/google
```

---

## 7. CUSTOM DOMAIN (tuy chon)

1. Vercel Dashboard → Settings → Domains → Add Domain
2. Nhap: `mandomood.com` (hoac subdomain ban muon)
3. Them DNS records theo huong dan Vercel:
   - A Record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`
4. Cap nhat `NEXTAUTH_URL` trong Vercel env vars

---

## 8. SAU KHI DEPLOY

### Seed production data
```bash
# Set MONGODB_URI production trong terminal
MONGODB_URI="mongodb+srv://..." npx tsx src/scripts/seed.ts
```

### Kiem tra
- [ ] Trang chu load duoc quotes
- [ ] Login Google hoat dong
- [ ] AI Tutor tra loi duoc
- [ ] Share card download duoc

---

## 🐛 TROUBLESHOOTING

### "NEXTAUTH_URL must be set"
```
NEXTAUTH_URL=https://yourdomain.vercel.app
```

### "MongoServerError: Authentication failed"
- Kiem tra lai MONGODB_URI co dung password khong
- Kiem tra Network Access da allow 0.0.0.0/0

### "OAuthCallbackError: Invalid callback URL"
- Kiem tra NEXTAUTH_URL khop voi domain thuc
- Kiem tra Google OAuth redirect URI da them domain moi

### Build loi "SWC binary not found"
- Khong phai loi code — Vercel se build thanh cong vi ho dung x64 Linux chuan
- Local sandbox bi crash do CPU instruction set khong tuong thich

---

## 📋 ENV VARS CHECKLIST

```
✓ MONGODB_URI          — Atlas connection string
✓ NEXTAUTH_URL         — https://yourdomain.vercel.app
✓ NEXTAUTH_SECRET      — Random 32+ char string
✓ GOOGLE_CLIENT_ID     — From Google Cloud Console
✓ GOOGLE_CLIENT_SECRET — From Google Cloud Console
✓ OPENAI_API_KEY       — From platform.openai.com
```

---

*MandoMood — Hoc tieng Trung qua cam xuc 🐼*
