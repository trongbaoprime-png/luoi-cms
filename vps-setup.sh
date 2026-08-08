#!/bin/bash
# ==============================================================================
# SCRIPT CÀI ĐẶT 1-CLICK TỰ ĐỘNG CHO GOOGLE CLOUD VPS (4 vCPU / 16GB RAM)
# Tự động cài Docker, Nginx, LiteLLM Proxy, OpenClaw & Đóng gói Next.js System
# ==============================================================================

set -e

echo "🚀 [1/5] Cập nhật hệ thống & Cài đặt phần mềm nền tảng..."
sudo apt-get update -y
sudo apt-get install -y curl git ufw htop jq certbot python3-certbot-nginx ca-certificates

echo "🐳 [2/5] Cài đặt Docker & Docker Compose..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

echo "📁 [3/5] Khởi tạo thư mục hệ thống..."
sudo mkdir -p /var/www/app /var/www/litellm /var/www/openclaw /var/www/data
sudo chown -R $USER:$USER /var/www

echo "🔒 [4/5] Mở Port tường lửa (UFW)..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable

echo "✅ [5/5] Hoàn tất chuẩn bị hạ tầng VPS!"
echo "--------------------------------------------------------"
echo "👉 Bước tiếp theo: Kéo code từ Git và gõ: docker compose up -d --build"
echo "--------------------------------------------------------"
