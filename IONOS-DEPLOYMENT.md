# ETAly - Ionos VPS Deployment Guide

## Server Bilgileri
- **IP:** 212.227.142.108
- **OS:** Ubuntu 24.04 + Plesk
- **Domain:** etaly.app
- **User:** root

## Deployment Adımları

### 1️⃣ DNS Ayarlarını Yap (İlk Önce!)

Ionos domain yönetim panelinde `etaly.app` için:

**A Record ekle:**
- Host: `@`
- Points to: `212.227.142.108`
- TTL: Auto (veya 3600)

**A Record ekle (www için):**
- Host: `www`
- Points to: `212.227.142.108`
- TTL: Auto (veya 3600)

⏰ DNS propagation 5-30 dakika sürer.

---

### 2️⃣ Shopify API Secret Al

1. https://partners.shopify.com
2. Apps → ETAly → App setup
3. "Client secret" kopyala
4. Not et, sonra `.env` dosyasına ekleyeceğiz

---

### 3️⃣ Deployment Script'ini Çalıştır

Terminal'de (Mac'inde):

```bash
cd ~/Desktop/etaly
chmod +x deploy-to-ionos.sh
./deploy-to-ionos.sh
```

Script şunları yapacak:
- Node.js kurulumu
- Repository clone
- Dependencies yükleme
- Database migration & seed
- PM2 ile app başlatma

**SSH password sor

ulacak:** Plesk'teki "Passwort anzeigen" butonuna tıkla

---

### 4️⃣ Environment Variables Güncelle

SSH ile sunucuya bağlan:

```bash
ssh root@212.227.142.108
```

`.env` dosyasını düzenle:

```bash
cd /var/www/vhosts/etaly.app/etaly-app
nano .env
```

`SHOPIFY_API_SECRET` satırını güncelle:
```
SHOPIFY_API_SECRET=YOUR_ACTUAL_SECRET_HERE
```

Ctrl+O (save), Ctrl+X (exit)

App'i restart et:
```bash
pm2 restart etaly
```

---

### 5️⃣ Nginx + SSL Setup

Terminal'de (Mac'inde):

```bash
chmod +x setup-nginx-ssl.sh
./setup-nginx-ssl.sh
```

DNS propagation tamamlandıktan sonra, SSL sertifikası al:

```bash
ssh root@212.227.142.108
certbot --nginx -d etaly.app -d www.etaly.app
```

Email adresini gir, şartları kabul et.

---

### 6️⃣ Shopify App URL'lerini Güncelle

1. https://partners.shopify.com → ETAly → App setup
2. **App URL:** `https://etaly.app`
3. **Allowed redirection URLs:**
   - `https://etaly.app/auth/callback`
   - `https://etaly.app/auth/shopify/callback`
4. Save

---

### 7️⃣ Test Et!

1. https://etaly.app - Ana sayfa açılmalı
2. Shopify store'a git: https://etaly-test-2.myshopify.com/admin/apps
3. ETAly app'ini aç
4. Tüm sayfaları test et:
   - Dashboard
   - Delivery Rules
   - Holidays
   - Analytics
   - Settings

---

## Faydalı Komutlar

### App durumunu kontrol et:
```bash
ssh root@212.227.142.108
pm2 status
pm2 logs etaly
```

### App'i restart et:
```bash
ssh root@212.227.142.108
pm2 restart etaly
```

### Yeni kod deploy et:
```bash
ssh root@212.227.142.108
cd /var/www/vhosts/etaly.app/etaly-app
git pull origin main
npm ci
npm run build
pm2 restart etaly
```

### Database'i sıfırla ve tekrar seed et:
```bash
ssh root@212.227.142.108
cd /var/www/vhosts/etaly.app/etaly-app
rm dev.sqlite
npx prisma migrate deploy
node seed-run.mjs
pm2 restart etaly
```

---

## Troubleshooting

### App yüklenmiyor:
```bash
pm2 logs etaly --lines 100
```

### Port 3000 kullanımda hatası:
```bash
lsof -ti:3000 | xargs kill -9
pm2 restart etaly
```

### SSL sertifikası yenilenmiyor:
```bash
certbot renew --dry-run
```

---

## Güvenlik Notları

- ✅ Firewall: Plesk otomatik yönetiyor
- ✅ SSL: Let's Encrypt otomatik yenileniyor
- ✅ PM2: Crash durumunda otomatik restart
- ⚠️  `.env` dosyasını asla commit etme!
