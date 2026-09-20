# Landing Page — خانم غفوری

## فایل‌ها
- `index.html` — ساختار Semantic و محتوای صفحه
- `styles.css` — Design System، Responsive، Glassmorphism و Animation
- `app.js` — تعاملات، Carousel، FAQ، Mobile Menu، Scroll Reveal، Form و Cursor Glow
- `config.js` — تنها محل ورود اطلاعات واقعی برند

## تنظیم اطلاعات واقعی
در `config.js` این موارد را وارد کنید:
`portrait`, `phone`, `whatsapp`, `address`, `hours`, `canonical`, `ogImage`, `formEndpoint`

هیچ شماره تلفن، آدرس، سابقه، مدرک، تعداد مراجعه‌کننده یا قیمت ساختگی در پروژه قرار داده نشده است.

## اتصال فرم
یک endpoint واقعی در `formEndpoint` قرار دهید. Frontend درخواست JSON با متد POST ارسال می‌کند:
`name`, `phone`, `type`, `subject`, `message`

## تصویر
بهتر است تصویر اصلی خانم غفوری را با WebP/AVIF و ابعاد مناسب برای موبایل و دسکتاپ، داخل `assets/` قرار دهید و مسیر آن را در `config.js` تنظیم کنید.

## Production
برای Production بهتر است فونت Vazirmatn را Self-host کنید تا وابستگی شبکه‌ای به Google Fonts حذف شود.
