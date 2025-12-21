# ETAly - Storefront Testing Guide

This guide will help you test the ETAly app on your Shopify store.

## Prerequisites

1. ✅ ETAly app is installed on your Shopify store
2. ✅ You have created at least one delivery rule in the app admin
3. ✅ You have access to your store's theme customizer

## Step 1: Enable the App Theme Extension

### Option A: Via Theme Customizer (Recommended)

1. **Go to your Shopify Admin**
   - Navigate to `Online Store` → `Themes`
   - Click `Customize` on your active theme

2. **Add the Delivery ETA Block**
   - In the theme editor, go to a **Product Page**
   - Click `Add block` or `Add section`
   - Under `Apps`, find **"Delivery ETA"** (provided by ETAly)
   - Click to add the block to your product page

3. **Position the Block**
   - Drag the block to your desired location:
     - **Above Add to Cart** (recommended for maximum visibility)
     - Below product title
     - In product description area

4. **Configure Block Settings**
   - Click on the Delivery ETA block
   - Customize:
     - **Show icon**: On/Off
     - **Icon**: Default is 🚚 (you can change to ⏱️, 📦, etc.)
     - **Message style**: Info (Blue), Success (Green), Warning (Orange)
     - **Show cutoff timer**: On/Off

5. **Save Changes**
   - Click `Save` in the top right corner

### Option B: Via Theme Code (Advanced)

If you need more control or your theme doesn't support app blocks in the customizer:

1. **Go to Theme Code Editor**
   - Navigate to `Online Store` → `Themes`
   - Click `...` → `Edit code` on your active theme

2. **Find Product Template**
   - Open `sections/main-product.liquid` or `templates/product.liquid`

3. **Add App Block**
   - Add this code where you want the ETA to appear:
   ```liquid
   {% render 'app-block', block: block, type: 'delivery_eta' %}
   ```

4. **Save and Preview**

---

## Step 2: Create Your First Delivery Rule

1. **Go to ETAly Admin**
   - In Shopify Admin, click `Apps` → `ETAly`

2. **Navigate to Delivery Rules**
   - Click `Delivery Rules` in the sidebar

3. **Create a Test Rule**
   - Click `+ Create Rule`
   - Configure:
     - **Name**: "Standard Delivery"
     - **Countries**: Select your test country (e.g., Germany, USA, Turkey)
     - **Min Days**: 2
     - **Max Days**: 5
     - **Processing Days**: 1
     - **Cutoff Time**: 15:00 (3 PM)
     - **Message Template**: Choose a template or customize
   - Click `Create Rule`

---

## Step 3: Test on Your Store

1. **Visit a Product Page**
   - Go to your storefront
   - Navigate to any product page

2. **What You Should See**
   - A delivery estimate message like:
     ```
     🚚 Get it between Feb 2 - Feb 5
     ```
   - If you enabled cutoff timer:
     ```
     Order within 3h 45m for same-day processing
     ```

3. **Test Different Scenarios**

   ### Test A: Different Countries
   - Change your browser's location or use a VPN
   - Reload the product page
   - The ETA should change based on the rule for that country

   ### Test B: Multiple Rules
   - Create rules for different countries
   - Test that the correct rule applies

   ### Test C: Weekends & Holidays
   - Go to `Holidays & Weekends` in ETAly admin
   - Load preset holidays for your country
   - Enable "Exclude Weekends" and "Skip Holidays"
   - Delivery dates should now skip weekends and holidays

   ### Test D: Product-Specific Rules
   - Go to `Product Targeting` in ETAly admin
   - Create a rule that targets specific products
   - Visit those products - they should show different ETAs

---

## Step 4: Verify Storefront Integration

### Check 1: Delivery ETA on Product Page

**Expected Behavior:**
- ✅ Shows loading spinner initially
- ✅ Displays estimated delivery date after 1-2 seconds
- ✅ Updates when variant changes (if applicable)
- ✅ Styled correctly (blue/green/orange based on settings)

**If Not Working:**
- Check browser console for errors (F12 → Console)
- Verify you have an active delivery rule
- Ensure the app is enabled in Settings
- Check that your country is covered by a rule

### Check 2: Cart Integration

1. **Go to ETAly Admin → Cart & Checkout**
2. **Enable Cart Display**
   - Toggle "Show in Cart" to ON
   - Choose position and style
   - Save settings

3. **Add Product to Cart**
   - Go to a product page
   - Add product to cart
   - View cart page
   - You should see delivery estimate in cart

### Check 3: Analytics Tracking

1. **Browse Products**
   - Visit several product pages with ETAly enabled
   - Click on the delivery estimate message

2. **Check Analytics**
   - Go to ETAly Admin → Analytics
   - You should see:
     - Impression count (how many times ETA was shown)
     - Click count (how many times users clicked on it)
     - Conversion tracking (if orders were placed)

---

## Troubleshooting

### Problem: "Calculating delivery estimate..." never finishes

**Possible Causes:**
1. No active delivery rule exists
2. Rule doesn't match customer's country
3. App is disabled in Settings

**Solutions:**
- Go to ETAly Admin → Delivery Rules
- Ensure you have at least one active rule
- Check rule countries include the test country
- Go to Settings → ensure "App Status" is ON

---

### Problem: ETA Block doesn't appear in theme customizer

**Possible Causes:**
1. Theme doesn't support app blocks (very old themes)
2. App extension not deployed

**Solutions:**
1. Try Option B (manual code integration)
2. Contact theme developer for app block support
3. Redeploy app: Run `shopify app deploy` in terminal

---

### Problem: Wrong delivery dates calculated

**Possible Causes:**
1. Timezone mismatch
2. Weekends/holidays not configured correctly

**Solutions:**
- Check Settings → Timezone settings
- Verify Holidays & Weekends configuration
- Check Processing Days in the delivery rule

---

### Problem: ETA doesn't update when changing variants

**Possible Causes:**
1. Theme uses custom variant selector
2. JavaScript conflict

**Solutions:**
- Check browser console for errors
- Test on another theme temporarily
- Contact support if issue persists

---

## API Endpoints (For Developers)

If you're building custom integrations, these endpoints are available:

### Get Country (Auto-detect)
```
GET /api/storefront/detect-country
```

### Calculate ETA
```
POST /api/storefront/calculate-eta
Body:
  - productId: string
  - variantId: string
  - countryCode: string
```

### Track Events
```
POST /api/storefront/track
Body:
  - eventType: 'impression' | 'click'
  - sessionId: string
  - productId: string
  - variantId: string
  - ruleId: string
  - countryCode: string
```

---

## Advanced Configuration

### Custom Styling

You can override the default styles by adding custom CSS in:
**Settings → Custom CSS**

```css
/* Example: Change colors */
.etaly-style-success .etaly-eta-content {
  background: #your-color !important;
  border-color: #your-border-color !important;
}

/* Example: Change font */
.etaly-delivery-eta {
  font-family: 'Your Font', sans-serif;
}

/* Example: Larger text */
.etaly-eta-text {
  font-size: 16px !important;
}
```

### Multi-Language Support

ETAly supports 6 languages out of the box:
- 🇬🇧 English
- 🇹🇷 Turkish
- 🇩🇪 German
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇮🇹 Italian

**Change Language:**
1. Go to Settings
2. Select "Default Language"
3. Save
4. Admin interface will update automatically

---

## Getting Help

If you encounter issues:

1. **Check App Status**
   - Go to Settings
   - Verify "App Status" is ON

2. **Review Rules**
   - Go to Delivery Rules
   - Ensure rules are active and countries are configured

3. **Check Browser Console**
   - Press F12
   - Look for error messages in Console tab

4. **Contact Support**
   - Email: support@etaly.app (if you have this set up)
   - Or create an issue in your app repository

---

## Success Checklist

Before going live, ensure:

- ✅ At least one delivery rule is active
- ✅ Rules cover all countries you ship to
- ✅ Holidays loaded for your main markets
- ✅ Weekend exclusion enabled (if needed)
- ✅ ETA block positioned well on product page
- ✅ Cart integration enabled and tested
- ✅ Message templates customized to your brand
- ✅ Tested on mobile devices
- ✅ Analytics tracking working
- ✅ Custom CSS applied (if needed)

---

**Happy Testing! 🚀**
