# ETAly - Basit Theme Entegrasyonu

## Seçenek 1: Theme App Extension (Önerilen)

Theme Customizer'dan kolayca ekle/kaldır yapabilirsin.

### Adımlar:

1. **Shopify Admin → Apps → ETAly → Settings**
2. **"Enable App Embed" tıkla**
3. **Online Store → Themes → Customize**
4. **Product page'de "Add block"**
5. **Apps altında "Delivery ETA" bloğunu seç**
6. **Bloğu istediğin yere sürükle (Add to Cart üstüne önerilir)**
7. **Save**

✅ **Avantajları:**
- Theme editor'den açıp kapatabilirsin
- Kod düzenlemesi gerekmez
- Stil ve ayarları kolayca değiştir

---

## Seçenek 2: Manuel Kod Ekleme

Daha fazla kontrol istiyorsan, direkt theme koduna ekle.

### Adımlar:

1. **Shopify Admin → Online Store → Themes → ... → Edit code**

2. **`sections/main-product.liquid` dosyasını aç**

3. **"Add to Cart" butonunu bul** (şuna benzer):
```liquid
<button type="submit" name="add">
  {{ 'products.product.add_to_cart' | t }}
</button>
```

4. **Bu kodun HEMEN ÜSTüNE yapıştır:**

```liquid
<!-- ETAly Delivery Estimate -->
<div id="etaly-delivery-eta" style="margin: 16px 0;">
  <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; color: #6b7280; text-align: center;">
    ⏳ Calculating delivery estimate...
  </div>
</div>

<script>
(function() {
  const container = document.getElementById('etaly-delivery-eta');
  const productId = {{ product.id | json }};

  const formData = new FormData();
  formData.append('countryCode', 'TR'); // Varsayılan ülke (değiştirebilirsin)
  formData.append('productId', `gid://shopify/Product/${productId}`);

  fetch('/api/storefront/calculate-eta', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      container.innerHTML = `
        <div style="padding: 14px; background: #d1fae5; border: 1px solid #86efac; border-radius: 8px; display: flex; align-items: center; gap: 12px;">
          <svg width="24" height="24" fill="none" stroke="#047857" viewBox="0 0 24 24" style="flex-shrink: 0; stroke-width: 2;">
            <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
          </svg>
          <div style="flex: 1;">
            <div style="color: #047857; font-weight: 600; font-size: 14px;">
              ${data.eta.message}
            </div>
            <div style="color: #059669; font-size: 12px; margin-top: 2px;">
              ${data.eta.ruleName}
            </div>
          </div>
        </div>
      `;
    } else {
      container.style.display = 'none';
    }
  })
  .catch(error => {
    console.error('ETAly Error:', error);
    container.style.display = 'none';
  });
})();
</script>
```

5. **Save**

---

## Test Et

1. **Delivery rule oluştur:**
   - Admin → ETAly → Delivery Rules
   - Create Rule
   - Turkey (TR) ekle
   - Min: 2, Max: 5 days

2. **Bir ürün sayfasını aç**

3. **Görmeni beklediğim:**
```
🚚 Get it between Dec 23 - Dec 26
Standard Delivery
```

---

## Sorun Giderme

### "Calculating..." sonsuza kadar dönüyor

**Sebep:** API çalışmıyor veya delivery rule yok

**Çözüm:**
```bash
# Server loglarına bak
pm2 logs etaly

# Aradığın log:
# "Storefront API - Shop: senin-site.myshopify.com"
```

### 404 hatası

**Sebep:** Build edilmemiş

**Çözüm:**
```bash
git pull origin main
npm run build
pm2 restart etaly
```

### Ülke otomatik algılanmıyor

**Geçici Çözüm:** Script'teki `countryCode: 'TR'` kısmını değiştir

**Kalıcı Çözüm:** Shopify Markets kullan (otomatik algılar)

---

## Gelişmiş Özelleştirme

### Ülkeyi otomatik algıla:

```javascript
// Script kısmını şununla değiştir:
async function loadETA() {
  const container = document.getElementById('etaly-delivery-eta');
  const productId = {{ product.id | json }};

  // Ülkeyi algıla
  let countryCode = 'TR';
  if (typeof Shopify !== 'undefined' && Shopify.country) {
    countryCode = Shopify.country;
  }

  const formData = new FormData();
  formData.append('countryCode', countryCode);
  formData.append('productId', `gid://shopify/Product/${productId}`);

  const response = await fetch('/api/storefront/calculate-eta', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();

  if (data.success) {
    container.innerHTML = `
      <div style="padding: 14px; background: #d1fae5; border: 1px solid #86efac; border-radius: 8px;">
        🚚 ${data.eta.message}
      </div>
    `;
  } else {
    container.style.display = 'none';
  }
}

loadETA();
```

### Variant değiştiğinde güncelle:

```javascript
// En alta ekle
document.addEventListener('change', function(e) {
  if (e.target.name === 'id') {
    const variantId = e.target.value;
    // Yeniden fetch et...
    loadETA();
  }
});
```

---

## Canlıya Almadan Önce Kontrol Et

- ✅ En az 1 delivery rule var
- ✅ Rule, gönderim yaptığın ülkeleri kapsıyor
- ✅ Test ettin ve çalışıyor
- ✅ Mobilde de test ettin
- ✅ Theme değişikliklerini yedekledin

**Hazırsın! 🚀**
