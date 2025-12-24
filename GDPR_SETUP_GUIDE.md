# ETAly - GDPR Webhook Setup Guide

## Shopify Partner Dashboard'da GDPR URL'lerini Ekleme

### Adım 1: Partner Dashboard'a Git

1. https://partners.shopify.com
2. **Apps** → **ETAly** seç
3. Sol menüden **App setup** tıkla

---

### Adım 2: Data Protection Bölümünü Bul

Aşağı kaydır, **"Data protection"** başlığını bul.

Bu bölümde 3 URL alanı olacak:

---

### Adım 3: URL'leri Ekle

#### 1. Customer data request endpoint
```
https://etaly.app/webhooks/customers/data_request
```

**Açıklama:** GDPR Article 15 - Customer requests their data

---

#### 2. Customer data erasure endpoint
```
https://etaly.app/webhooks/customers/redact
```

**Açıklama:** GDPR Article 17 - Customer requests data deletion

---

#### 3. Shop data erasure endpoint
```
https://etaly.app/webhooks/shop/redact
```

**Açıklama:** Delete all shop data after app uninstallation

---

### Adım 4: Test Et

Her URL'yi ekledikten sonra **Save** butonuna tıkla.

Shopify otomatik olarak:
1. Her endpoint'e test webhook gönderecek
2. HMAC signature ile doğrulayacak
3. 200 OK dönerse ✅ yeşil tik verecek
4. Hata dönerse ❌ kırmızı tik verecek

---

### Adım 5: Kontrol Et

Tüm 3 endpoint için **yeşil tik** ✅ görmelisin.

Eğer kırmızı tik görürsen:
- Endpoint'in erişilebilir olduğunu kontrol et
- Server loglarına bak
- HMAC doğrulamasının çalıştığını kontrol et

---

## Beklenen Sonuç

```
✅ Customer data request endpoint: https://etaly.app/webhooks/customers/data_request
✅ Customer data erasure endpoint: https://etaly.app/webhooks/customers/redact
✅ Shop data erasure endpoint: https://etaly.app/webhooks/shop/redact
```

---

## Troubleshooting

### Hata: "Endpoint not responding"
**Çözüm:**
```bash
# Server'ın çalıştığını kontrol et
pm2 status etaly

# Endpoint'i test et
curl -I https://etaly.app/webhooks/customers/data_request
```

### Hata: "HMAC verification failed"
**Çözüm:**
- `SHOPIFY_API_SECRET` environment variable'ının doğru olduğunu kontrol et
- Webhook route'larında `authenticate.webhook()` kullanıldığını doğrula

### Hata: "Timeout"
**Çözüm:**
- Webhook'ların 5 saniye içinde response dönmesi gerekiyor
- Database query'lerini optimize et
- Ağır işlemleri background job'a taşı

---

## Server Logs

Test sırasında server loglarını izle:

```bash
ssh your-server
pm2 logs etaly --lines 100
```

Görmesi gereken loglar:
```
[GDPR] Received customers/data_request for shop: test-store.myshopify.com
[GDPR] Data request logged for customer test@example.com
```

---

## Son Kontrol

URL'leri ekledikten sonra:

1. ✅ Her 3 endpoint yeşil tik aldı mı?
2. ✅ Server logs'da webhook'lar görünüyor mu?
3. ✅ App setup sayfasında "Data protection" bölümü tamamlandı mı?

Hepsi ✅ ise → **App Store'a submission yapabilirsin!**
