#!/bin/bash

# ETAly Ionos VPS Deployment Script
# Server: 212.227.142.108
# Domain: etaly.app

echo "🚀 Starting ETAly deployment to Ionos VPS..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SERVER_IP="212.227.142.108"
DOMAIN="etaly.app"
APP_DIR="/var/www/vhosts/$DOMAIN/etaly-app"
REPO_URL="https://github.com/ahmethamdi/etaly-shopify-app.git"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Server: $SERVER_IP"
echo "  Domain: $DOMAIN"
echo "  App Directory: $APP_DIR"
echo ""

# SSH into server and run deployment commands
echo -e "${GREEN}Step 1: Connecting to server and setting up...${NC}"

ssh root@$SERVER_IP << 'ENDSSH'
set -e

# Update system
echo "📦 Updating system packages..."
apt-get update -qq

# Install Node.js 18 if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install Git if not installed
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    apt-get install -y git
fi

# Create app directory
echo "📁 Creating app directory..."
mkdir -p /var/www/vhosts/etaly.app
cd /var/www/vhosts/etaly.app

# Clone repository
if [ -d "etaly-app" ]; then
    echo "🔄 Updating existing repository..."
    cd etaly-app
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone https://github.com/ahmethamdi/etaly-shopify-app.git etaly-app
    cd etaly-app
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Create .env file
echo "📝 Creating environment file..."
cat > .env << 'EOF'
SHOPIFY_API_KEY=e0143e253cb68f1db0a1037c8cdf1411
SHOPIFY_API_SECRET=REPLACE_WITH_YOUR_SECRET
SCOPES=
HOST=https://etaly.app
NODE_ENV=production
DATABASE_URL=file:./dev.sqlite
SESSION_SECRET=KCWvwlg3r9C84iyt5L44uJ51HmY4itJh8mQRBU3T8XQ=
PORT=3000
EOF

# Run Prisma migrations
echo "🗄️  Running database migrations..."
npx prisma generate
npx prisma migrate deploy

# Seed database
echo "🌱 Seeding database..."
node seed-run.mjs || echo "⚠️  Seeding skipped (might already be seeded)"

# Build application
echo "🏗️  Building application..."
npm run build

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop existing process
echo "🛑 Stopping existing process..."
pm2 stop etaly || true
pm2 delete etaly || true

# Start application with PM2
echo "🚀 Starting application..."
pm2 start npm --name "etaly" -- run docker-start
pm2 save
pm2 startup

echo "✅ Deployment completed!"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "🌐 Next steps:"
echo "1. Configure Nginx reverse proxy (port 3000 -> 80/443)"
echo "2. Setup SSL certificate with Let's Encrypt"
echo "3. Point domain DNS to this server"
echo "4. Update SHOPIFY_API_SECRET in /var/www/vhosts/etaly.app/etaly-app/.env"

ENDSSH

echo -e "${GREEN}✅ Deployment script completed!${NC}"
