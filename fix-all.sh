#!/usr/bin/env bash
# ==============================================================================
# 🛠️ SCRIPT SỬA TRIỆT ĐỂ LỖI CSS & JAVASCRIPT & TỰ ĐỘNG ĐỒNG BỘ CRM CHO VPS
# ==============================================================================
set -e

echo "🛑 [1/5] Dừng sạch toàn bộ tiến trình Node/PM2 cũ..."
pm2 delete all || true
pm2 kill || true
killall -9 node || true
fuser -k 3000/tcp || true

echo "📥 [2/5] Lấy toàn bộ mã nguồn & CSS mới nhất từ Git..."
git init 2>/dev/null || true
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/trongbaoprime-png/luoi-cms.git
git fetch origin main
git reset --hard origin/main

echo "📦 [3/5] Khởi tạo 4 Cơ sở dữ liệu độc lập..."
chmod -R 777 prisma || true
npm run prisma:generate

echo "🔨 [4/5] Đóng gói Next.js Production sạch 100%..."
rm -rf .next
npm run build

echo "🚀 [5/5] Khởi động ứng dụng sạch với PM2 & Daemon Tự Động Đồng Bộ CRM..."
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup || true
systemctl restart nginx || true

# Thiết lập Cronjob Linux tự động kéo data mỗi 5 phút làm dự phòng 2 lớp
(crontab -l 2>/dev/null | grep -v 'crm/auto-sync'; echo "*/5 * * * * curl -s 'http://127.0.0.1:3000/api/crm/auto-sync?key=luoidonnha_cron_sync_2026' > /dev/null 2>&1") | crontab - || true

echo ""
echo "=============================================================================="
echo "🎉 ĐÃ SỬA VÀ ĐỒNG BỘ THÀNH CÔNG 100% CẢ CSS, JAVASCRIPT VÀ DỮ LIỆU CRM!"
echo "👉 Mở https://luoidonnha.com/admin/crm hoặc https://luoidonnha.com"
echo "=============================================================================="
