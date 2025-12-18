#!/bin/bash
set -e

echo "🚀 ETAly VPS Complete Setup"
echo "================================"
echo ""

# 1. Setup SSH Key First
echo "🔑 Step 1/10: Setting up SSH key..."
mkdir -p ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPth24yhlESz2KJUNxwYJS3y53yDsmYAsW0j/N79qa4t etaly-vps" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
echo "✅ SSH key configured"
echo ""

# 2. Update system
echo "📦 Step 2/10: Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y curl wget git build-essential
echo "✅ System updated"
echo ""

# 3. Setup 4GB Swap
echo "💾 Step 3/10: Setting up 4GB swap..."
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "✅ 4GB swap created"
else
    echo "✅ Swap already exists"
fi
echo ""

# 4. Install Node.js 18
echo "📦 Step 4/10: Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
echo "✅ Node.js $(node -v) installed"
echo ""

# 5. Install PM2
echo "📦 Step 5/10: Installing PM2..."
npm install -g pm2
echo "✅ PM2 installed"
echo ""

# 6. Install Nginx
echo "📦 Step 6/10: Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx
echo "✅ Nginx installed"
echo ""

# 7. Clone app
echo "📥 Step 7/10: Cloning ETAly app from GitHub..."
mkdir -p /var/www
cd /var/www
if [ -d "etaly-app" ]; then
    echo "⚠️  etaly-app directory exists, removing..."
    rm -rf etaly-app
fi
git clone https://github.com/ahmethamdi/etaly-shopify-app.git etaly-app
cd etaly-app
echo "✅ App cloned"
echo ""

# 8. Install dependencies & setup
echo "📦 Step 8/10: Installing dependencies (this may take 3-5 minutes)..."
npm ci --production=false

# Create .env (Replace with your actual credentials!)
cat > .env << EOF
SHOPIFY_API_KEY=${SHOPIFY_API_KEY:-your_api_key_here}
SHOPIFY_API_SECRET=${SHOPIFY_API_SECRET:-your_api_secret_here}
SCOPES=write_products,read_orders
HOST=https://etaly.app
NODE_ENV=production
DATABASE_URL=file:./prisma/prod.sqlite
SESSION_SECRET=${SESSION_SECRET:-$(openssl rand -base64 32)}
PORT=3000
EOF

# Database setup
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma migrate deploy
node seed-run.mjs || true

# Build
echo "🏗️  Building application..."
npm run build
echo "✅ App built successfully"
echo ""

# 9. Start with PM2
echo "🚀 Step 9/10: Starting app with PM2..."
pm2 start npm --name "etaly" -- run docker-start
pm2 save
pm2 startup systemd -u root --hp /root | tail -n 1 | bash
echo "✅ App started with PM2"
echo ""

# 10. Configure Nginx
echo "🔧 Step 10/10: Configuring Nginx..."
cat > /etc/nginx/sites-available/etaly.app << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name etaly.app www.etaly.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/etaly.app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
echo "✅ Nginx configured"
echo ""

echo "================================"
echo "✅ ✅ ✅ SETUP COMPLETE! ✅ ✅ ✅"
echo "================================"
echo ""
echo "🧪 Test your app:"
echo "   http://87.106.134.110"
echo "   http://etaly.app (after DNS propagates)"
echo ""
echo "📊 Check status:"
pm2 status
echo ""
echo "🔍 View logs:"
echo "   pm2 logs etaly"
echo ""
echo "🔒 Next step: Install SSL certificate"
echo "   apt-get install -y certbot python3-certbot-nginx"
echo "   certbot --nginx -d etaly.app -d www.etaly.app"
echo ""
