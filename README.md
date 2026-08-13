# UZEX Time Telegram Mini App

Mini App `time.uzex.uz` server vaqti bilan sinxronlash uchun `/api/time` server-proksidan foydalanadi. U savdo tizimiga ulanmaydi va zayavka yubormaydi.

## Vercel orqali joylash

1. [vercel.com](https://vercel.com) saytida akkaunt oching va GitHub bilan ulang.
2. Ushbu papkani GitHub'ga yangi repository qilib yuklang.
3. Vercel'da **Add New → Project** ni tanlab, repository'ni import qiling va **Deploy** bosing.
4. Vercel bergan HTTPS manzilni nusxalang, masalan: `https://uzex-time-miniapp.vercel.app`.

## Telegram botga biriktirish

1. Telegram'da `@BotFather` ni oching.
2. `/newbot` bilan bot yarating yoki mavjud botni tanlang.
3. `/mybots` → bot → **Bot Settings** → **Menu Button** → **Configure menu button** ni tanlang.
4. Tugma nomi sifatida `UZEX Time`, URL sifatida Vercel HTTPS manzilini kiriting.

Shundan keyin Telegram'dagi bot pastidagi **UZEX Time** tugmasi Mini App'ni ochadi.
