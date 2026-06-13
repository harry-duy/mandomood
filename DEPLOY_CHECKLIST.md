# 🚀 MandoMood — Deploy Checklist (Vercel + MongoDB Atlas)
> Làm theo thứ tự này để deploy production thành công

---

## BƯỚC 1 — MongoDB Atlas (15 phút)

1. Vào https://cloud.mongodb.com → Đăng ký / Đăng nhập
2. **Create Project** → Đặt tên "MandoMood"
3. **Build a Database** → chọn **M0 FREE** (512MB miễn phí)
4. Provider: **AWS**, Region: **ap-southeast-1** (Singapore — gần VN nhất)
5. **Create Cluster** → đặt tên "mandomood-cluster"
6. **Security Quickstart**:
   - Username: `mandomood_user`
   - Password: tạo password mạnh → **Copy lại**
   - IP Access: **Add My Current IP** + thêm `0.0.0.0/0` (cho Vercel)
7. **Connect** → **Drivers** → Copy connection string:
   ```
   mongodb+srv://mandomood_user:<password>@mandomood-cluster.xxxxx.mongodb.net/mandomood?retryWrites=true&w=majority
   ```
8. Thay `<password>` bằng password vừa tạo → đây là `MONGODB_URI`

---

## BƯỚC 2 — Google OAuth (10 phút)

1. Vào https://console.cloud.google.com
2. **New Project** → "MandoMood"
3. **APIs & Services** → **OAuth consent screen**:
   - User Type: **External**
   - App name: "MandoMood"
   - User support email: ngothanhduy04@gmail.com
   - Save and Continue (có thể bỏ qua các bước optional)
4. **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs: thêm 2 URI:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://mandomood.vercel.app/api/auth/callback/google`
5. **Copy** Client ID → `GOOGLE_CLIENT_ID`
6. **Copy** Client Secret → `GOOGLE_CLIENT_SECRET`

---

## BƯỚC 3 — Tạo .env.local

Tạo file `.env.local` trong thư mục gốc dự án (KHÔNG commit lên git):

```bash
# MongoDB
MONGODB_URI=mongodb+srv://mandomood_user:PASSWORD@mandomood-cluster.xxxxx.mongodb.net/mandomood?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<chạy: openssl rand -base64 32>

# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# AI
GEMINI_API_KEY=AIzaSy-xxxxx
GEMINI_MODEL=gemini-2.5-flash

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MandoMood

# Admin
ADMIN_SECRET=random-secret-min-32-chars
ADMIN_EMAILS=ngothanhduy04@gmail.com

# Optional (ElevenLabs TTS)
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL

# Optional (Stripe - để sau)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=
NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID=

# Optional (Web Push)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
PUSH_ADMIN_SECRET=
```

---

## BƯỚC 4 — Test local

```bash
cd MandoMood
npm install
npm run dev
```

Mở http://localhost:3000 — kiểm tra:
- [ ] Trang chủ load được
- [ ] Daily quote hiện
- [ ] Feed hoạt động
- [ ] Google Login hoạt động
- [ ] AI Tutor chat được (cần GEMINI_API_KEY)

Seed data:
```bash
npm run seed
```

---

## BƯỚC 5 — Deploy lên Vercel

### Option A: Vercel CLI (nhanh nhất)
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option B: GitHub + Vercel Dashboard
1. Push code lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: MandoMood v1.0 MVP"
   git remote add origin https://github.com/YOUR_USERNAME/mandomood.git
   git push -u origin main
   ```
2. Vào https://vercel.com → **Add New Project** → Import từ GitHub
3. Framework: **Next.js** (auto-detect)
4. **Environment Variables**: Copy từng biến trong `.env.local` vào Vercel

### Sau khi deploy:
- [ ] Cập nhật `NEXTAUTH_URL` → `https://mandomood.vercel.app`
- [ ] Cập nhật Google OAuth redirect URI (thêm production URL)
- [ ] Test toàn bộ flow trên production URL

---

## BƯỚC 6 — Sau deploy

### Cập nhật NEXTAUTH_URL trên Vercel:
Vercel Dashboard → Project Settings → Environment Variables:
```
NEXTAUTH_URL = https://mandomood.vercel.app
NEXT_PUBLIC_APP_URL = https://mandomood.vercel.app
```

### Custom Domain (tùy chọn):
Vercel Dashboard → Domains → Add → nhập domain của bạn

### Stripe Webhook (khi cần):
```
Stripe Dashboard → Webhooks → Add endpoint:
URL: https://mandomood.vercel.app/api/stripe/webhook
Events: checkout.session.completed, customer.subscription.deleted
```

---

## CHECKLIST CUỐI

- [ ] MongoDB Atlas cluster đang chạy
- [ ] `.env.local` đầy đủ
- [ ] `npm run dev` hoạt động local
- [ ] Google OAuth test được local
- [ ] `npm run seed` đã chạy (có data mẫu)
- [ ] Deploy lên Vercel thành công
- [ ] NEXTAUTH_URL cập nhật đúng production URL
- [ ] Google OAuth redirect URI cập nhật production URL
- [ ] Test login Google trên production
- [ ] Test AI features trên production

---

## TROUBLESHOOTING

| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| `ECONNREFUSED` | MONGODB_URI sai | Kiểm tra password + IP whitelist |
| OAuth `redirect_uri_mismatch` | Chưa thêm production URI | Google Console → thêm URI mới |
| `NEXTAUTH_SECRET` missing | Chưa set env | `openssl rand -base64 32` |
| Build error `SWC` | Chỉ xảy ra trên VM | Build trên máy thật / Vercel là OK |
| TTS không có tiếng | Chưa set `ELEVENLABS_API_KEY` | Bình thường — fallback Web Speech |
