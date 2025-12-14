import 'dotenv/config';
import express from 'express';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

const PORT = process.env.PORT || 3000;

// Express uygulaması oluştur
const app = express();
app.use(express.json());

// Shopify API yapılandırması
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES?.split(',') || [],
  hostName: process.env.HOST?.replace(/https?:\/\//, '') || 'localhost',
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

// Ana sayfa
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Etaly Shopify App</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: #f6f6f7;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #202223;
          margin-bottom: 10px;
        }
        .status {
          color: #008060;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .info {
          background: #f6f6f7;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .info h2 {
          margin-top: 0;
          color: #202223;
          font-size: 18px;
        }
        .info ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .info li {
          margin: 8px 0;
          color: #6d7175;
        }
        code {
          background: #e4e5e7;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 13px;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎉 Tebrikler!</h1>
        <p class="status">✓ Shopify App sunucunuz çalışıyor</p>

        <div class="info">
          <h2>📋 Yapılacaklar Listesi</h2>
          <ul>
            <li><strong>Shopify Partner hesabı oluşturun:</strong> <a href="https://partners.shopify.com" target="_blank">partners.shopify.com</a></li>
            <li><strong>Partner Dashboard'dan yeni bir app oluşturun</strong></li>
            <li><strong>API anahtarlarınızı alın</strong> ve <code>.env</code> dosyasına ekleyin</li>
            <li><strong>Geliştirme mağazası oluşturun</strong> (ücretsiz)</li>
            <li><strong>App'i test etmeye başlayın</strong></li>
          </ul>
        </div>

        <div class="warning">
          <strong>⚠️ Önemli:</strong> <code>.env</code> dosyasındaki <code>SHOPIFY_API_KEY</code> ve <code>SHOPIFY_API_SECRET</code> değerlerini gerçek değerlerle değiştirmeyi unutmayın!
        </div>

        <div class="info">
          <h2>🚀 Başlarken</h2>
          <p>Terminal'de şu komutu çalıştırın:</p>
          <code>npm run dev</code>
          <p style="margin-top: 15px;">Sunucu şu adreste çalışıyor: <strong>http://localhost:${PORT}</strong></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Sağlık kontrolü endpoint'i
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Shopify App çalışıyor',
    timestamp: new Date().toISOString()
  });
});

// Örnek API endpoint'i - Ürünleri listele
app.get('/api/products', async (req, res) => {
  try {
    res.json({
      message: 'Ürün listesi için önce Shopify mağazanıza bağlanmanız gerekiyor',
      tip: '.env dosyasındaki API anahtarlarınızı ekleyin'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║                                                ║');
  console.log('║   🎉 Shopify App Başarıyla Başlatıldı!       ║');
  console.log('║                                                ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🌐 Sunucu çalışıyor: http://localhost:${PORT}`);
  console.log('');
  console.log('📚 Yapılacaklar:');
  console.log('  1. Shopify Partner hesabı oluşturun');
  console.log('  2. .env dosyasına API anahtarlarınızı ekleyin');
  console.log('  3. App geliştirmeye başlayın!');
  console.log('');
  console.log('⚡ Durdurmak için Ctrl+C kullanın');
  console.log('');
});
