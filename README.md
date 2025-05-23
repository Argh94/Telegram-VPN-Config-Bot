![Visitor Count](https://komarev.com/ghpvc/?username=Argh94&repo=Telegram-VPN-Config-Bot&label=بازدیدها)

ربات تلگرامی کانفیگ VPN با Cloudflare Workers

## توضیحات پروژه
این پروژه یه ربات تلگرامی هست که با استفاده از Cloudflare Workers ساخته شده و به کاربران اجازه می‌ده کانفیگ‌ها یا لینک‌های سابسکریپشن VPN رو بر اساس پروتکل (مثل Vless، Vmess)، لوکیشن (مثل آلمان، آمریکا) یا منابع خاص (مثل V2ray Collector) دریافت کنن. هدفش ساده کردن دسترسی به کانفیگ‌های رایگان و به‌روز از منابع عمومی در گیت‌هاب هست.

## قابلیت‌ها
1. **دریافت کانفیگ بر اساس پروتکل**:
   - پشتیبانی از پروتکل‌های Vless، Vmess، Shadowsocks، Trojan، Hysteria و Hysteria2.
   - تا ۵ کانفیگ به صورت متنی یا لینک سابسکریپشن برمی‌گردونه.
2. **دریافت کانفیگ بر اساس لوکیشن**:
   - پشتیبانی از ۱۵ کشور مثل آلمان، آمریکا، ژاپن و غیره.
   - کانفیگ‌هایی که شامل کد کشور باشن رو فیلتر می‌کنه.
3. **کانفیگ‌های ویژه**:
   - لینک مستقیم به منابع معروف مثل V2ray Collector، Free SUB Link، Nirevil و غیره.
4. **سیستم کش**:
   - نتایج رو تا ۱ ساعت توی حافظه نگه می‌داره تا درخواست‌های تکراری به سرورها کم بشه.
5. **رابط کاربری ساده**:
   - منوهای کیبورد تلگرامی برای انتخاب گزینه‌ها.
   - دکمه "بازگشت" برای جابجایی بین منوها.

## پیش‌نیازها
- یه حساب Cloudflare با دسترسی به Workers.
- یه ربات تلگرامی که از طریق [BotFather](https://t.me/BotFather) توی تلگرام ساخته شده باشه.
- توکن ربات تلگرامی (که باید توی تنظیمات Worker به صورت امن وارد بشه).

## نحوه ساخت و راه‌اندازی
### 1. ساخت ربات تلگرامی
- توی تلگرام به [@BotFather](https://t.me/BotFather) برو و دستور `/newbot` رو بزن.
- یه نام و یوزرنیم برای رباتت انتخاب کن (مثلاً `MyVPNConfigBot`).
- توکن ربات رو که BotFather بهت می‌ده کپی کن (مثال: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`).

### 2. تنظیم Cloudflare Worker
- توی داشبورد Cloudflare به بخش **Workers** برو و یه Worker جدید بساز.
- کد پروژه (فایل `index.js` توی این مخزن) رو توی ویرایشگر Worker کپی کن.
- توی تب **Settings** و بخش **Environment Variables** یه متغیر به اسم `TELEGRAM_TOKEN` بساز و توکن رباتت رو اونجا وارد کن.

### 3. تنظیم Webhook
- بعد از دیپلوی Worker، آدرسش رو یادداشت کن (مثلاً `https://your-worker.workers.dev`).
- با یه درخواست HTTP وب‌هوک ربات رو تنظیم کن:
  ```bash
  curl -X GET "https://api.telegram.org/bot<Your-Token>/setWebhook?url=https://your-worker.workers.dev/webhook"
  به جای <Your-Token> توکن رباتت رو بذار.


4. تست ربات

توی تلگرام به رباتت پیام بده و با دستور /start شروع کن.



منوها رو تست کن و مطمئن شو کانفیگ‌ها درست برمی‌گردن.


