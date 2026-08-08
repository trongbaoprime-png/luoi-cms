#!/bin/bash

# =================================================================
# LƯỜI CMS / MINICRM - AUTOMATED 1-CLICK VPS DEPLOYMENT SCRIPT
# OS: Ubuntu 20.04 / 22.04 LTS
# Specs: 2+ Cores, 4GB+ RAM
# =================================================================

set -e

echo "🚀 Starting 1-Click Automated Setup for Lưới CMS / miniCRM on VPS..."

# 1. Update System Packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip build-essential nginx certbot python3-certbot-nginx

# 2. Install Node.js 20 LTS & PM2
if ! command -v node &> /dev/null; then
    echo "🟢 Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo "⚡ Installing PM2 Process Manager..."
sudo npm install -g pm2

# 3. Environment & Workspace Setup
APP_DIR="/var/www/path-app"
echo "📂 Setting up application directory at $APP_DIR..."

if [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
fi

# If repository files present in current folder, copy them over
if [ -f "package.json" ]; then
    cp -r ./* $APP_DIR/
    cd $APP_DIR
fi

# 4. Install Dependencies & Build Application
echo "🛠️ Installing NPM dependencies..."
npm install

echo "🗄️ Setting up SQLite / Database schema..."
npx prisma db push
npx prisma db push --schema=prisma/omnichannel.prisma

echo "🏗️ Building Next.js production bundle..."
npm run build

# 5. PM2 Cluster Launch
echo "🚀 Launching Node.js PM2 Cluster (2 Cores)..."
pm2 stop luoi-cms || true
pm2 delete luoi-cms || true
pm2 start npm --name "luoi-cms" -i max -- run start
pm2 save
pm2 startup | tail -n 1 | bash || true

# 6. Nginx Reverse Proxy & SSL Setup
DOMAIN="luoidonnha.com"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

echo "🌐 Configuring Nginx Reverse Proxy for $DOMAIN..."
sudo bash -c "cat > $NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /images/ {
        alias $APP_DIR/public/images/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default || true
sudo nginx -t
sudo systemctl restart nginx

echo "✅ 1-CLICK DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "--------------------------------------------------------"
echo "🌐 Your App is Live at: http://$DOMAIN (or http://YOUR_VPS_IP)"
echo "🔒 To enable Free SSL HTTPS, run: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "--------------------------------------------------------"
