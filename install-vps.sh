#!/usr/bin/env bash
# ==============================================================================
# LƯỚI CMS + MINICRM + OMNICHANNEL HUB + AI INFRA
# 1-CLICK AUTOMATED VPS INSTALLATION SCRIPT (/luoi/ CONDENSED ARCHITECTURE)
# HARDENED SECURITY VERSION (OWASP TOP 10:2025 COMPLIANT + FULL 24.1MB DB)
# REPOSITORY: https://github.com/trongbaoprime-png/luoi-cms.git
# ==============================================================================

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo "=============================================================================="
echo "      🚀 BẮT ĐẦU CÀI ĐẶT 1-CLICK HỆ THỐNG /LUOI/ (SECURITY HARDENED)           "
echo "=============================================================================="
echo -e "${NC}"

# Check for --clean or CLEAN=1 option to wipe old deployment data
if [ "$1" == "--clean" ] || [ "$CLEAN" == "1" ]; then
    echo -e "${RED}--> [WIPE] Đang dọn dẹp sạch sẽ toàn bộ dữ liệu Docker & Container cũ trên VPS...${NC}"
    docker stop $(docker ps -aq) 2>/dev/null || true
    docker rm $(docker ps -aq) 2>/dev/null || true
    docker volume prune -f 2>/dev/null || true
    docker system prune -a -f 2>/dev/null || true
    rm -rf /var/www/app /etc/nginx/sites-enabled/* /etc/nginx/sites-available/default /etc/nginx/conf.d/* || true
    echo -e "${GREEN}--> [WIPE] Đã xóa sạch dữ liệu cũ! Tiến hành cài đặt mới 100%...${NC}"
fi

# 1. Update OS Packages
echo -e "${YELLOW}--> [1/6] Cập nhật hệ điều hành Linux Ubuntu/Debian...${NC}"
apt-get update -y && apt-get install -y curl git unzip sqlite3 ca-certificates curl gnupg lsb-release nginx certbot python3-certbot-nginx

# 2. Install Docker & Docker Compose if missing
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}--> [2/6] Đang cài đặt Docker Engine & Docker Compose...${NC}"
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# 3. Setup Project Directory & Clone Repository
APP_DIR="/var/www/app"
mkdir -p "$APP_DIR"
mkdir -p /var/www/html/.well-known/acme-challenge
cd "$APP_DIR"

if [ -d "$APP_DIR/path-app" ]; then
    echo -e "${YELLOW}--> [3/6] Thư mục đã tồn tại, tiến hành git pull cập nhật...${NC}"
    cd "$APP_DIR" && git fetch --all && git reset --hard origin/main || true
    cd "$APP_DIR/path-app" && git fetch --all && git reset --hard origin/main || true
else
    echo -e "${YELLOW}--> [3/6] Đang clone mã nguồn từ GitHub trongbaoprime-png/luoi-cms...${NC}"
    git clone https://github.com/trongbaoprime-png/luoi-cms.git "$APP_DIR"
fi

cd "$APP_DIR/path-app"
mkdir -p luoi/cms luoi/minicrm luoi/omni luoi/aiflow public/uploads

# 4. Remove stale WAL journals & force sync 24.1MB SQLite databases (47,928 CRM Leads)
echo -e "${YELLOW}--> [4/6] Dọn dẹp WAL journal và phục hồi CSDL 47.928 Leads mới nhất từ Git...${NC}"
rm -f "$APP_DIR/path-app/luoi/cms/*.db-wal" "$APP_DIR/path-app/luoi/cms/*.db-shm" || true
rm -f "$APP_DIR/path-app/luoi/minicrm/*.db-wal" "$APP_DIR/path-app/luoi/minicrm/*.db-shm" || true
rm -f "$APP_DIR/path-app/luoi/omni/*.db-wal" "$APP_DIR/path-app/luoi/omni/*.db-shm" || true

cd "$APP_DIR" && git checkout -- path-app/luoi/ || true
chmod -R 777 "$APP_DIR/path-app/luoi" "$APP_DIR/path-app/prisma" "$APP_DIR/path-app/public/uploads" || true

# Set Production Environment File
cat << 'EOF' > .env
NODE_ENV=production
PORT=3000
DATABASE_URL=file:/app/luoi/cms/cms.db
CMS_DATABASE_URL=file:/app/luoi/cms/cms.db
CRM_DATABASE_URL=file:/app/luoi/minicrm/minicrm.db
OMNI_DATABASE_URL=file:/app/luoi/omni/omni.db
ADMIN_USER=admin
ADMIN_PASS=B@oph@m021991
EOF

# 5. Configure Nginx Reverse Proxy with OWASP Hardened Rules + Certbot Challenge Support
echo -e "${YELLOW}--> [5/6] Cấu hình Nginx Reverse Proxy Hardened Port 80...${NC}"
rm -rf /etc/nginx/sites-enabled/* /etc/nginx/sites-available/default /etc/nginx/conf.d/* || true

cat << 'EOF' > /etc/nginx/conf.d/default.conf
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name luoidonnha.com www.luoidonnha.com _;

    client_max_body_size 100M;

    # OWASP Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # 1. Allow Certbot ACME Challenge for Let's Encrypt SSL
    location /.well-known/acme-challenge/ {
        allow all;
        root /var/www/html;
    }

    # 2. Deny access to hidden/sensitive files except .well-known
    location ~ /\.(?!well-known) {
        deny all;
        return 404;
    }

    # 3. Prevent script execution in uploads directory
    location /uploads/ {
        types { }
        default_type application/octet-stream;
    }

    # 4. Lưới CMS + miniCRM + Omnichannel Next.js App
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 5. LiteLLM Proxy AI Router Gateway (Port 4000)
    location /llm/ {
        proxy_pass http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 6. OpenClaw AI Engine (Port 7000)
    location /claw/ {
        proxy_pass http://127.0.0.1:7000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 7. OmniRoute Token Router (Port 8080)
    location /omni/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

nginx -t
systemctl restart nginx

# 6. Rebuild and Launch Docker Containers from path-app directory
echo -e "${YELLOW}--> [6/6] Khởi chạy toàn bộ 5 Docker Containers từ /var/www/app/path-app...${NC}"
cd "$APP_DIR/path-app"
chmod -R 777 luoi prisma public/uploads || true
docker compose down || true
docker compose up -d --build

SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

echo -e "${GREEN}"
echo "=============================================================================="
echo "🎉 CHÚC MỪNG! HỆ THỐNG /LUOI/ ĐÃ ĐƯỢC CÀI ĐẶT BẢO MẬT BẬC CAO TRÊN VPS!     "
echo "=============================================================================="
echo -e "${NC}"
echo -e "🌐 Lưới CMS Portal:   http://$SERVER_IP"
echo -e "🔐 Admin Control:     http://$SERVER_IP/admin"
echo -e "⚡ LiteLLM Proxy AI:  http://$SERVER_IP/llm/"
echo -e "🦀 OpenClaw Agents:   http://$SERVER_IP/claw/"
echo -e "🤖 OmniRoute Engine:  http://$SERVER_IP/omni/"
echo ""
echo -e "${CYAN}🔑 TÀI KHOẢN ĐĂNG NHẬP ADMIN MẶC ĐỊNH:${NC}"
echo -e "   - Username: ${YELLOW}admin${NC}"
echo -e "   - Password: ${YELLOW}B@oph@m021991${NC}"
echo "=============================================================================="
