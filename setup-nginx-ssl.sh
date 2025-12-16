#!/bin/bash

# Nginx + SSL Setup for ETAly
# Run this AFTER deploy-to-ionos.sh

echo "🔧 Setting up Nginx reverse proxy and SSL..."

ssh root@212.227.142.108 << 'ENDSSH'
set -e

DOMAIN="etaly.app"

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get install -y nginx
fi

# Install Certbot for SSL
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    apt-get install -y certbot python3-certbot-nginx
fi

# Create Nginx configuration
echo "📝 Creating Nginx configuration..."
cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
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

# Enable site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo "✅ Nginx configured!"
echo ""
echo "🔒 Next: Setup SSL certificate"
echo "Run this command AFTER DNS is pointing to this server:"
echo ""
echo "  certbot --nginx -d etaly.app -d www.etaly.app"
echo ""

ENDSSH

echo "✅ Nginx setup completed!"
