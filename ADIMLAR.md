# 🎯 Shopify App Geliştirme - Adım Adım Rehber

## ✅ Tamamlanan İşlemler

- [x] Node.js kurulumu kontrol edildi (v24.8.0)
- [x] NPM kurulumu kontrol edildi (v11.6.0)
- [x] Shopify CLI kuruldu (v3.84.1)
- [x] Proje dosyaları oluşturuldu
- [x] Gerekli paketler yüklendi

## 📝 ŞİMDİ YAPMANIZ GEREKENLER

### 1. Shopify Partner Hesabı Oluşturun (5 dakika)

1. Tarayıcınızı açın
2. [https://partners.shopify.com](https://partners.shopify.com) adresine gidin
3. **"Sign Up"** butonuna tıklayın
4. Formu doldurun ve hesabınızı oluşturun
5. Email adresinizi doğrulayın

### 2. Yeni Bir App Oluşturun (3 dakika)

Partner Dashboard'da:

1. Sol menüden **"Apps"** seçeneğine tıklayın
2. Sağ üstteki **"Create app"** butonuna tıklayın
3. **"Create app manually"** seçeneğini seçin
4. App ismi girin: **"Etaly App"** (veya istediğiniz isim)
5. **"Create"** butonuna tıklayın

### 3. API Anahtarlarını Alın (2 dakika)

Oluşturduğunuz app'te:

1. **"Configuration"** sekmesine gidin
2. **"Client ID"** değerini kopyalayın
3. **"Client secret"** değerini kopyalayın (View butonuna tıklayın)

### 4. .env Dosyasını Düzenleyin

Terminal'de şu komutu çalıştırın:

```bash
open .env
```

Dosyayı düzenleyin:

```env
SHOPIFY_API_KEY=BURAYA_CLIENT_ID_YAPISTIR
SHOPIFY_API_SECRET=BURAYA_CLIENT_SECRET_YAPISTIR
SCOPES=write_products,read_products
HOST=http://localhost:3000
PORT=3000
```

### 5. Uygulamayı Başlatın

Terminal'de:

```bash
npm run dev
```

Tarayıcınızda açın: [http://localhost:3000](http://localhost:3000)

## 🎊 BAŞARDINIZ!

Artık çalışan bir Shopify uygulamanız var!

## 🚀 Sonraki Adımlar

1. **App'i Shopify mağazanıza yükleyin**
2. **Ürünleri yönetme özellikleri ekleyin**
3. **Sipariş takibi ekleyin**
4. **Özel raporlar oluşturun**

## 📞 Yardıma mı ihtiyacınız var?

Shopify dokümantasyonu: [shopify.dev](https://shopify.dev)
