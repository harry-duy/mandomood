# 🚀 Deploy MandoMood Landing Page — Hướng dẫn từng bước

## Bước 1: Cài Vercel CLI (1 lần duy nhất)

```bash
npm install -g vercel
```

## Bước 2: Deploy lên Vercel

Mở terminal, `cd` vào thư mục project rồi chạy:

```bash
cd "C:\Users\Admin\Documents\Production_MandoMood\MandoMood"
vercel
```

Vercel sẽ hỏi:
- Set up and deploy? → `Y`
- Which scope? → chọn account của bạn
- Link to existing project? → `N`
- Project name → `mandomood` (hoặc để mặc định)
- In which directory? → `.` (Enter)

Xong! Vercel tự deploy và cho bạn link preview ngay.

## Bước 3: Deploy lên production

```bash
vercel --prod
```

## Bước 4: Gắn custom domain (nếu có)

Vào [vercel.com/dashboard](https://vercel.com) → Project → Settings → Domains
→ Add domain: `mandomood.com`

## Alternative: GitHub + Vercel (khuyên dùng cho lâu dài)

1. Tạo repo GitHub: `github.com/new` → tên `mandomood`
2. Push code:
   ```bash
   git init
   git add .
   git commit -m "🌸 initial: MandoMood landing page"
   git remote add origin https://github.com/YOUR_USERNAME/mandomood.git
   git push -u origin main
   ```
3. Vào [vercel.com](https://vercel.com) → Import Git Repository → chọn repo vừa tạo
4. Deploy tự động mỗi khi push code!

## Kết nối Waitlist với Formspree (không cần backend)

Thay form action trong `index.html`:

```html
<!-- Tìm dòng này trong index.html -->
<form class="waitlist-form" id="waitlist-form">

<!-- Thêm action Formspree (đăng ký tại formspree.io) -->
<form class="waitlist-form" id="waitlist-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

Formspree miễn phí cho 50 submissions/tháng, trả phí $8/tháng cho unlimited.

## Alternative: Collect emails với Mailchimp embedded form

Hoặc dùng Beehiiv / ConvertKit để collect email và tự động gửi welcome email.

---

**Files trong project:**
```
MandoMood/
├── index.html              ← Landing page chính
├── vercel.json             ← Config deploy
├── DEPLOY_GUIDE.md         ← File này
└── MANDOMOOD_PRODUCTION_PLAN.md  ← Kế hoạch đầy đủ
```
