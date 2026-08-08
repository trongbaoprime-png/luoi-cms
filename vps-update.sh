#!/bin/bash
# ==============================================================================
# SCRIPT CẬP NHẬT VPS CHO luoidonnha.com
# Kéo code mới + Build Docker + Fix Nginx
# ==============================================================================
set -e

REPO_DIR="/var/www/app"
APP_DIR="/var/www/app/path-app"
NGINX_CONF="/etc/nginx/sites-available/luoidonnha"
DOMAIN="luoidonnha.com"

echo "====================================================="
echo "🔄 [1/6] Kiểm tra Git remote và kéo code mới nhất..."
echo "====================================================="
if [ ! -d "$REPO_DIR/.git" ]; then
  echo "❌ Thư mục $REPO_DIR chưa có Git. Khởi tạo..."
  cd /var/www/app
  git init
  git remote add origin https://github.com/trongbaoprime-png/luoi-cms.git
  git fetch origin main
  git checkout -b main origin/main
else
  cd "$REPO_DIR"
  git fetch origin main
  git reset --hard origin/main
  echo "✅ Code đã được cập nhật lên phiên bản mới nhất"
fi

echo ""
echo "====================================================="
echo "🔒 [2/6] Dọn dẹp WAL journal SQLite (nếu cần)..."
echo "====================================================="
WAL_FILE="$APP_DIR/data/leads.db-wal"
if [ -f "$WAL_FILE" ]; then
  rm -f "$WAL_FILE"
  echo "✅ Đã xóa WAL journal: $WAL_FILE"
else
  echo "✅ Không có WAL journal cần dọn dẹp"
fi

echo ""
echo "====================================================="
echo "🌐 [3/6] Cấu hình Nginx Reverse Proxy cho $DOMAIN..."
echo "====================================================="
cat > "$NGINX_CONF" <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name luoidonnha.com www.luoidonnha.com;

    proxy_connect_timeout       300;
    proxy_send_timeout          300;
    proxy_read_timeout          300;
    send_timeout                300;

    proxy_buffer_size           128k;
    proxy_buffers               4 256k;
    proxy_busy_buffers_size     256k;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /llm/ {
        proxy_pass http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /claw/ {
        proxy_pass http://127.0.0.1:7000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/luoidonnha 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t
echo "✅ Nginx config hợp lệ"

echo ""
echo "====================================================="
echo "🐳 [4/6] Build và khởi động Docker Containers..."
echo "====================================================="
cd "$APP_DIR"
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d --build
echo "✅ Docker containers đã khởi động"

echo ""
echo "====================================================="
echo "⏳ [5/6] Chờ Next.js app khởi động (30 giây)..."
echo "====================================================="
sleep 30

MAX_WAIT=60
WAITED=0
while ! curl -s http://127.0.0.1:3000 > /dev/null; do
  echo "   Chờ port 3000... ($WAITED/$MAX_WAIT giây)"
  sleep 5
  WAITED=$((WAITED+5))
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo "⚠️  Port 3000 chưa sẵn sàng sau $MAX_WAIT giây. Xem logs:"
    docker compose logs --tail=30 luoi_app
    break
  fi
done

echo ""
echo "====================================================="
echo "🔄 [6/6] Khởi động lại Nginx..."
echo "====================================================="
systemctl restart nginx
systemctl status nginx --no-pager

echo ""
echo "====================================================="
echo "✅ HOÀN TẤT! Kiểm tra kết quả:"
echo "====================================================="
docker compose ps
echo ""
curl -s -o /dev/null -w "Port 3000: HTTP %{http_code}\n" http://127.0.0.1:3000 || echo "Port 3000: ❌ Chưa phản hồi"
echo ""
echo "🌍 Website: http://$DOMAIN"
echo ""
echo "👉 Bật HTTPS:"
echo "   certbot --nginx -d $DOMAIN -d www.$DOMAIN --expand --non-interactive --agree-tos -m trongbaoprime@gmail.com --redirect"
echo "====================================================="
