# Payou — Cloudflare Workers

نسخة المتجر الكاملة: 33 منتجًا، لوحة إدارة مستقلة، D1، وإحصاءات دخولها محمي بكلمة مرور بايو.

## إعدادات Cloudflare Builds

- Project/Worker name: `payou`
- Build command: leave empty (or `npm run build` for a dry-run validation).
- Deploy command: `npx wrangler deploy`
- Disable preview builds while setting up the production database.

Wrangler 4.92 provisions the `DB` D1 binding on first deploy when authorized. The Worker creates missing tables idempotently; it never resets existing catalog data. Review the deployment output to confirm the database binding. If the account's build token cannot provision D1, create `payou-db` in the dashboard and add its `database_id` to `wrangler.jsonc`.

## تفعيل الإدارة — بعد النشر

أنشئ أسرارًا جديدة في Cloudflare Settings → Variables and Secrets:

- `PAYOU_ADMIN_PEPPER`: قيمة عشوائية آمنة 32 بايت.
- `PAYOU_ADMIN_SETUP_HASH`: SHA-256 لرمز تفعيل عشوائي جديد (32 بايت).

لا تضع الأسرار أو رمز التفعيل في GitHub. افتح `/admin#setup=TOKEN` باستخدام رمز التفعيل الجديد، وأنشئ كلمة مرور جديدة واحفظ رمز الاسترداد. من الموقع القديم نزّل أحدث نسخة JSON للكتالوج، ثم استرجعها في الإدارة الجديدة، وراجع الأسعار والباقات. كلمات مرور وجلسات وإحصاءات الموقع القديم لا تُنسخ تلقائيًا.

## التحقق

`npm test` ثم `npm run build`. تحقق بعد النشر من الطلب عبر واتساب، تغيير لغة الموقع، حفظ سعر، وإعادة فتحه. العنوان الأصلي يظل يعمل أثناء النقل.
