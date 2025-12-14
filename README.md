# Etaly Shopify Uygulaması

İlk Shopify uygulamanız! Bu proje ile Shopify mağazanız için özel bir uygulama geliştirebilirsiniz.

## 🚀 Kurulum

### 1. Gerekli paketleri yükleyin

```bash
npm install
```

### 2. Shopify Partner Hesabı Oluşturun

1. [partners.shopify.com](https://partners.shopify.com) adresine gidin
2. Ücretsiz bir hesap oluşturun
3. Partner Dashboard'a giriş yapın

### 3. Yeni Bir App Oluşturun

1. Partner Dashboard'da **Apps** bölümüne gidin
2. **Create app** butonuna tıklayın
3. **Create app manually** seçeneğini seçin
4. Uygulama adını girin (örn: "Etaly App")
5. **Create** butonuna tıklayın

### 4. API Anahtarlarını Alın

1. Oluşturduğunuz app'e tıklayın
2. **Configuration** sekmesine gidin
3. **Client ID** (API Key) ve **Client Secret** (API Secret) değerlerini kopyalayın
4. `.env` dosyasını açın ve bu değerleri girin:

```env
SHOPIFY_API_KEY=sizin_api_key_buraya
SHOPIFY_API_SECRET=sizin_api_secret_buraya
```

### 5. Geliştirme Mağazası Oluşturun (Opsiyonel)

1. Partner Dashboard'da **Stores** bölümüne gidin
2. **Add store** butonuna tıklayın
3. **Development store** seçeneğini seçin
4. Mağaza bilgilerini doldurun ve oluşturun

## 💻 Kullanım

### Sunucuyu Başlatın

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## 📁 Proje Yapısı

```
etaly/
├── server.js          # Ana sunucu dosyası
├── package.json       # Proje bağımlılıkları
├── .env              # Gizli API anahtarları (GIT'e eklemeyin!)
├── .gitignore        # Git tarafından göz ardı edilecek dosyalar
└── README.md         # Bu dosya
```

## 🔑 Önemli Notlar

- **.env dosyasını asla Git'e eklemeyin!** (Zaten .gitignore'da)
- API anahtarlarınızı kimseyle paylaşmayın
- Geliştirme için her zaman geliştirme mağazası kullanın

## 📚 Sonraki Adımlar

1. Shopify Admin API ile ürün ekleme/düzenleme
2. Shopify App Bridge ile embedded app oluşturma
3. Webhook'lar ile event dinleme
4. GraphQL API kullanımı

## 🆘 Yardım

Shopify dokümantasyonu: [shopify.dev](https://shopify.dev)

## 🎯 Ne Öğrendiniz?

- ✅ Node.js ve Express ile sunucu oluşturma
- ✅ Shopify API entegrasyonu
- ✅ Environment variables (.env) kullanımı
- ✅ REST API endpoint'leri oluşturma

Başarılar! 🎉
