# ETAly - Railway Deployment Guide

## 1. Railway Setup

1. Go to https://railway.app
2. Click "Start a New Project"
3. Login with GitHub
4. Select "Deploy from GitHub repo"
5. Choose `ahmethamdi/etaly-shopify-app`
6. Railway will auto-detect Dockerfile and deploy

## 2. Environment Variables

Go to Railway dashboard → Your Project → Variables tab

Add these variables:

```
SHOPIFY_API_KEY=e0143e253cb68f1db0a1037c8cdf1411
SHOPIFY_API_SECRET=<get from Shopify Partners>
SCOPES=
HOST=https://etaly.app
NODE_ENV=production
DATABASE_URL=file:./dev.sqlite
SESSION_SECRET=KCWvwlg3r9C84iyt5L44uJ51HmY4itJh8mQRBU3T8XQ=
```

## 3. Get SHOPIFY_API_SECRET

1. Go to https://partners.shopify.com
2. Navigate to Apps → ETAly
3. Go to "App setup" tab
4. Find "Client secret" and copy it
5. Paste it as SHOPIFY_API_SECRET in Railway

## 4. Configure Custom Domain

1. In Railway dashboard → Settings → Domains
2. Click "Add Custom Domain"
3. Enter: `etaly.app`
4. Railway will show you DNS settings

## 5. Update Ionos DNS

In your Ionos domain settings for etaly.app:

1. Add CNAME record:
   - Name: `@` or `www`
   - Value: [Railway will provide this]
   - TTL: Auto

2. Wait 5-30 minutes for DNS propagation

## 6. Update Shopify App URLs

1. Go to Shopify Partners → ETAly → App setup
2. Update "App URL" to: `https://etaly.app`
3. Update "Allowed redirection URLs" to: `https://etaly.app/auth/callback`

## 7. Test Deployment

1. Visit: `https://etaly.app`
2. Install app on test store: `https://etaly-test-2.myshopify.com/admin/apps`
3. Test all pages: Dashboard, Delivery Rules, Holidays, Analytics, Settings

## 8. Run Database Seed (if needed)

In Railway dashboard → Deployments → Select latest → Shell:

```bash
node seed-run.mjs
```

## Troubleshooting

- If Railway build fails, check build logs
- If app doesn't load, check environment variables
- If Shopify auth fails, verify API key/secret
- If database errors, check DATABASE_URL

## Current Status

- ✅ GitHub repo ready
- ✅ Dockerfile configured
- ✅ Environment variables prepared
- ⏳ Waiting for Railway deployment
- ⏳ Waiting for domain DNS propagation
