#!/bin/bash

#═══════════════════════════════════════════════════════════════════════════════
# ETAly VPS Complete Setup Script
# Server: 87.106.134.110 (Dedicated VPS for ETAly)
# Specs: 2 vCore | 2GB RAM | 80GB NVMe SSD
#═══════════════════════════════════════════════════════════════════════════════

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="etaly.app"
APP_DIR="/var/www/etaly-app"
REPO_URL="https://github.com/ahmethamdi/etaly-shopify-app.git"
NODE_VERSION="18"

# Shopify API Configuration (Set these before running!)
SHOPIFY_API_KEY="${SHOPIFY_API_KEY:-your_api_key_here}"
SHOPIFY_API_SECRET="${SHOPIFY_API_SECRET:-your_api_secret_here}"

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ███████╗████████╗ █████╗ ██╗  ██╗   ██╗                   ║
║   ██╔════╝╚══██╔══╝██╔══██╗██║  ╚██╗ ██╔╝                   ║
║   █████╗     ██║   ███████║██║   ╚████╔╝                    ║
║   ██╔══╝     ██║   ██╔══██║██║    ╚██╔╝                     ║
║   ███████╗   ██║   ██║  ██║███████╗██║                      ║
║   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝                      ║
║                                                               ║
║            Production VPS Setup - Complete Stack             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${GREEN}🚀 Starting ETAly production setup...${NC}"
echo ""

#═══════════════════════════════════════════════════════════════════════════════
# Step 1: System Update & Basic Packages
#═══════════════════════════════════════════════════════════════════════════════

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 1/8: Updating system packages...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl wget git build-essential ufw htop

echo -e "${GREEN}✅ System updated${NC}"

#═══════════════════════════════════════════════════════════════════════════════
# Step 2: Setup 4GB Swap
#═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 2/8: Setting up 4GB swap...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -f /swapfile ]; then
    echo "📦 Creating 4GB swap file..."
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab

    # Optimize swap usage
    sysctl vm.swappiness=10
    sysctl vm.vfs_cache_pressure=50
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf

    echo -e "${GREEN}✅ Swap created and configured${NC}"
else
    echo -e "${GREEN}✅ Swap already exists${NC}"
fi

free -h

#═══════════════════════════════════════════════════════════════════════════════
# Step 3: Install Node.js 18
#═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 3/8: Installing Node.js ${NODE_VERSION}...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}✅ Node.js installed${NC}"
else
    echo -e "${GREEN}✅ Node.js already installed${NC}"
fi

node --version
npm --version

#═══════════════════════════════════════════════════════════════════════════════
# Step 4: Install PM2
#═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 4/8: Installing PM2...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
    pm2 startup
    echo -e "${GREEN}✅ PM2 installed${NC}"
else
    echo -e "${GREEN}✅ PM2 already installed${NC}"
fi

pm2 --version

#═══════════════════════════════════════════════════════════════════════════════
# Step 5: Install Nginx
#═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 5/8: Installing Nginx...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get install -y nginx
    systemctl enable nginx
    echo -e "${GREEN}✅ Nginx installed${NC}"
else
    echo -e "${GREEN}✅ Nginx already installed${NC}"
fi

nginx -v

#═══════════════════════════════════════════════════════════════════════════════
# Step 6: Clone & Setup Application
#═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 6/8: Cloning and setting up application...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -d "$APP_DIR" ]; then
    echo "📥 Cloning repository..."
    mkdir -p /var/www
    git clone $REPO_URL $APP_DIR
else
    echo "📂 App directory exists, pulling latest..."
    cd $APP_DIR
    git pull origin main
fi

cd $APP_DIR

echo "📦 Installing dependencies..."
npm ci --production=false

echo "📝 Creating .env file..."
cat > .env << EOF
SHOPIFY_API_KEY=$SHOPIFY_API_KEY
SHOPIFY_API_SECRET=$SHOPIFY_API_SECRET
SCOPES=write_products,read_orders
HOST=https://$DOMAIN
NODE_ENV=production
DATABASE_URL=file:./dev.sqlite
SESSION_SECRET=KCWvwlg3r9C84iyt5L44uJ51HmY4itJh8mQRBU3T8XQ=
PORT=3000
EOF

echo "🗄️  Setting up database..."
npx prisma generate
npx prisma migrate deploy

echo "🌱 Seeding database..."
node seed-run.mjs || echo "⚠️  Seeding skipped (might already be seeded)"

echo "🏗️  Building application..."
npm run build

echo -e "${GREEN}✅ Application setup complete${NC}"

#═══════════════════════════════════════════════════════════════════════════════
# Step 7: Create PM2 Ecosystem Config
#═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 7/8: Creating PM2 configuration...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'etaly',
    script: 'npm',
    args: 'run docker-start',
    cwd: '/var/www/etaly-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1500M',
    node_args: '--max-old-space-size=1536',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/etaly-error.log',
    out_file: '/var/log/etaly-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10
  }]
}
EOF

echo "🚀 Starting application with PM2..."
pm2 delete etaly 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo -e "${GREEN}✅ PM2 configured and app started${NC}"

#═══════════════════════════════════════════════════════════════════════════════
# Step 8: Configure Nginx
#═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 8/8: Configuring Nginx...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name etaly.app www.etaly.app;

    # Redirect to HTTPS (will be configured after SSL setup)
    # return 301 https://$server_name$request_uri;

    # Temporary: Proxy to Node.js until SSL is configured
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

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Access logs
    access_log /var/log/nginx/etaly-access.log;
    error_log /var/log/nginx/etaly-error.log;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx

echo -e "${GREEN}✅ Nginx configured${NC}"

#═══════════════════════════════════════════════════════════════════════════════
# Final Summary
#═══════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                   ✅ SETUP COMPLETE! ✅                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${GREEN}📊 System Status:${NC}"
echo ""
echo "🔧 Swap:"
free -h | grep Swap

echo ""
echo "📦 Node.js:"
node --version

echo ""
echo "🚀 PM2 Status:"
pm2 status

echo ""
echo "🌐 Nginx:"
systemctl status nginx --no-pager | grep Active

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📝 NEXT STEPS:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1️⃣  Update DNS to point etaly.app to this server IP"
echo "2️⃣  Install SSL certificate:"
echo "    ${BLUE}apt-get install -y certbot python3-certbot-nginx${NC}"
echo "    ${BLUE}certbot --nginx -d etaly.app -d www.etaly.app${NC}"
echo ""
echo "3️⃣  Update Shopify app URLs to https://etaly.app"
echo ""
echo "4️⃣  Test the app:"
echo "    ${BLUE}curl http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔧 Useful Commands:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  ${BLUE}pm2 status${NC}         - Check app status"
echo "  ${BLUE}pm2 logs etaly${NC}     - View app logs"
echo "  ${BLUE}pm2 restart etaly${NC}  - Restart app"
echo "  ${BLUE}pm2 monit${NC}          - Real-time monitoring"
echo "  ${BLUE}nginx -t${NC}           - Test nginx config"
echo "  ${BLUE}systemctl status nginx${NC} - Check nginx status"
echo ""
echo -e "${GREEN}🎉 ETAly is now running at: http://$(hostname -I | awk '{print $1}'):80${NC}"
echo ""
