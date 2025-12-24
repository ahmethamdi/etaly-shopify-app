# ETAly - Webhook & GDPR Compliance Documentation

## Overview
This document explains how ETAly handles Shopify webhooks and GDPR compliance requirements.

## Mandatory Compliance Webhooks

Shopify requires all apps to implement three GDPR compliance webhooks:

### 1. Customer Data Request (`customers/data_request`)
**File:** `app/routes/webhooks.customers.data_request.tsx`
**Purpose:** Handle customer requests for their data (GDPR Article 15)

**What it does:**
- Logs the data request in the `ComplianceLog` table
- Records customer ID, email, and timestamp
- Returns 200 OK to acknowledge receipt

**Implementation Status:** ✅ Implemented with HMAC verification

**Note:** ETAly doesn't store personal customer data directly. We only track:
- Anonymous analytics (which delivery rules were shown)
- No PII (Personally Identifiable Information) is stored

---

### 2. Customer Redaction (`customers/redact`)
**File:** `app/routes/webhooks.customers.redact.tsx`
**Purpose:** Delete customer data 48 hours after store owner requests deletion (GDPR Article 17)

**What it does:**
- Logs the redaction request in `ComplianceLog`
- Deletes all analytics events related to the customer ID
- Removes any metadata containing customer email
- Returns 200 OK to acknowledge completion

**Implementation Status:** ✅ Implemented with HMAC verification

**Data Deleted:**
- `AnalyticsEvent` records matching customer ID
- Any metadata containing customer email

---

### 3. Shop Redaction (`shop/redact`)
**File:** `app/routes/webhooks.shop.redact.tsx`
**Purpose:** Delete all store data 48 hours after app uninstallation (GDPR Article 17)

**What it does:**
- Logs the redaction request in `ComplianceLog`
- Deletes all store-related data in correct order:
  1. Analytics events
  2. Product targeting
  3. Delivery rules
  4. Holidays
  5. Settings
  6. Cart/Checkout settings
  7. Message templates
  8. Sessions
  9. Store record itself

**Implementation Status:** ✅ Implemented with HMAC verification

**Important:** This webhook is automatically triggered 48 hours after `app/uninstalled` webhook.

---

## HMAC Webhook Verification

### How It Works

All webhooks use `authenticate.webhook(request)` from `@shopify/shopify-app-remix`:

```typescript
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);
  // ... handle webhook
};
```

**What `authenticate.webhook()` does:**
1. Extracts the `X-Shopify-Hmac-SHA256` header
2. Computes HMAC using your `SHOPIFY_API_SECRET`
3. Compares computed HMAC with received HMAC
4. Throws error if verification fails
5. Returns validated payload if successful

**HMAC Algorithm:**
- Hash Function: SHA-256
- Secret Key: `process.env.SHOPIFY_API_SECRET`
- Message: Raw request body
- Encoding: Base64

### Security Benefits
- ✅ Prevents webhook spoofing
- ✅ Ensures webhooks are from Shopify
- ✅ Protects against replay attacks (with timestamp validation)
- ✅ Required for App Store approval

---

## Webhook Configuration

### File: `shopify.app.toml`

```toml
[webhooks]
api_version = "2025-10"

  # App Lifecycle
  [[webhooks.subscriptions]]
  topics = [ "app/uninstalled" ]
  uri = "/webhooks/app/uninstalled"

  # GDPR Compliance (MANDATORY)
  [[webhooks.subscriptions]]
  topics = [ "customers/data_request" ]
  uri = "/webhooks/customers/data_request"
  compliance_topics = [ "customers/data_request" ]

  [[webhooks.subscriptions]]
  topics = [ "customers/redact" ]
  uri = "/webhooks/customers/redact"
  compliance_topics = [ "customers/redact" ]

  [[webhooks.subscriptions]]
  topics = [ "shop/redact" ]
  uri = "/webhooks/shop/redact"
  compliance_topics = [ "shop/redact" ]
```

### Webhook URLs (Production)

- `https://etaly.app/webhooks/app/uninstalled`
- `https://etaly.app/webhooks/customers/data_request`
- `https://etaly.app/webhooks/customers/redact`
- `https://etaly.app/webhooks/shop/redact`

---

## Database Schema

### ComplianceLog Table
Stores all GDPR-related requests for audit trail:

```prisma
model ComplianceLog {
  id            String   @id @default(cuid())
  shop          String
  requestType   String   // customer_data_request, customer_redaction, shop_redaction
  customerId    String
  customerEmail String
  requestedAt   DateTime
  processedAt   DateTime?
  payload       String   // JSON payload from Shopify
  createdAt     DateTime @default(now())

  @@index([shop, requestType])
}
```

**Purpose:**
- Legal compliance audit trail
- Track when data requests were received
- Monitor GDPR compliance over time

**Retention:** Keep indefinitely for legal compliance

---

### AnalyticsEvent Table
Stores anonymized analytics that may need redaction:

```prisma
model AnalyticsEvent {
  id         String   @id @default(cuid())
  storeId    String
  customerId String?
  eventType  String
  metadata   String?  // JSON metadata
  createdAt  DateTime @default(now())

  @@index([customerId])
  @@index([storeId])
}
```

**GDPR Handling:**
- Customer redaction deletes all events matching `customerId`
- Shop redaction deletes all events for the store
- No PII stored in metadata

---

## Testing Webhooks

### Local Testing (Development)

1. Start local server:
```bash
npm run dev
```

2. Use Shopify CLI to trigger test webhooks:
```bash
shopify app webhook trigger --topic customers/data_request
shopify app webhook trigger --topic customers/redact
shopify app webhook trigger --topic shop/redact
```

3. Check console logs for webhook processing

### Production Testing

**Important:** You cannot manually trigger compliance webhooks in production. They are only triggered by:
- Customer data requests (via store admin or customer portal)
- Store owner deleting customer data
- App uninstallation (triggers `shop/redact` after 48 hours)

**Monitoring:**
- Check production logs for webhook receipt
- Query `ComplianceLog` table to verify logging
- Ensure webhooks return 200 OK within 5 seconds

---

## Deployment Checklist

Before deploying to production, ensure:

- [x] All 3 GDPR webhooks are implemented
- [x] HMAC verification is enabled on all webhooks
- [x] Webhooks are registered in `shopify.app.toml`
- [x] Database schema includes `ComplianceLog` table
- [x] Webhooks return 200 OK within 5 seconds
- [x] Logging is enabled for audit trail
- [x] Error handling prevents webhook failures

### Deploy Steps

1. **Update configuration:**
```bash
git add shopify.app.toml
git commit -m "Add GDPR compliance webhooks"
git push origin main
```

2. **Deploy to production server:**
```bash
ssh your-server
cd /path/to/etaly
git pull origin main
npm run build
pm2 restart etaly
```

3. **Register webhooks with Shopify:**
```bash
shopify app deploy
```

Or via Shopify Partner Dashboard:
- Go to your app settings
- Navigate to "Webhooks"
- Verify all 3 GDPR webhooks are listed
- Check webhook URLs are correct

4. **Verify webhook status:**
```bash
shopify app webhook list
```

Expected output:
```
✓ app/uninstalled
✓ customers/data_request
✓ customers/redact
✓ shop/redact
```

---

## Compliance Checklist for App Store

### Required for App Store Approval:

- ✅ **Provides mandatory compliance webhooks**
  - `customers/data_request` - Implemented
  - `customers/redact` - Implemented
  - `shop/redact` - Implemented

- ✅ **Verifies webhooks with HMAC signatures**
  - Using `authenticate.webhook()` from Shopify SDK
  - Automatic HMAC-SHA256 verification
  - Rejects invalid webhooks

- ✅ **Responds to webhooks within 5 seconds**
  - All webhooks return 200 OK immediately
  - Heavy processing logged for async handling

- ✅ **Audit trail for compliance**
  - All requests logged to `ComplianceLog` table
  - Includes timestamp, customer info, and payload

- ✅ **Data deletion compliance**
  - Customer data deleted within 48 hours
  - Shop data deleted after uninstallation
  - No PII retained after redaction

---

## Troubleshooting

### Webhook Not Receiving Requests

**Check:**
1. Webhook URL is accessible publicly (test with curl)
2. Webhooks are registered in Shopify Partner Dashboard
3. Server is running and healthy
4. No firewall blocking Shopify IPs

### HMAC Verification Failing

**Check:**
1. `SHOPIFY_API_SECRET` environment variable is correct
2. Secret matches the one in Partner Dashboard
3. No middleware modifying request body before verification
4. Using raw body, not parsed JSON

### Database Errors

**Check:**
1. `ComplianceLog` table exists (run migrations)
2. `AnalyticsEvent` table exists
3. Database connection is working
4. No schema mismatches

---

## Support & Resources

- **Shopify GDPR Docs:** https://shopify.dev/docs/apps/build/privacy-law-compliance
- **Webhook Docs:** https://shopify.dev/docs/apps/build/webhooks
- **HMAC Verification:** https://shopify.dev/docs/apps/build/webhooks/subscribe/https#step-5-verify-the-webhook

---

## Last Updated
2024-12-24 - All GDPR webhooks implemented and verified
