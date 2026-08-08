# 🚀 HƯỚNG DẪN ĐÓNG GÓI & DEPLOY LƯỜI CMS LÊN VPS

Tài liệu này hướng dẫn đầy đủ các bước đưa phiên bản mới nhất từ localhost lên VPS, bảo toàn 100% dữ liệu khách hàng (`miniCRM`, `luoi-cms.db`, `omnichannel.db`, `dev.db`), tối ưu hiệu năng và tránh lặp lại các lỗi trước đó.

---

## 1. 📦 Cấu Trúc Các File Database Cần Bảo Toàn
Trong thư mục `prisma/` gồm có 4 file SQLite quan trọng:
- `prisma/minicrm.db`: Chứa toàn bộ dữ liệu **Khách hàng miniCRM**, tiến trình CAPI, Checkin, Doanh thu, Telesale.
- `prisma/luoi-cms.db`: Chứa Pages builder (Puck studio), Cài đặt header/footer/logo.
- `prisma/omnichannel.db`: Chứa dữ liệu AI Agent, báo cáo đa kênh.
- `prisma/dev.db`: Cơ sở dữ liệu chính hệ thống.

> ⚠️ **LƯU Ý QUAN TRỌNG KHI CẬP NHẬT VPS:**
> 💡 **Lệnh copy nhanh qua SCP từ máy tính:**
> ```bash
> scp prisma/*.db root@IP_VPS_CỦA_BẠN:/var/www/app/path-app/luoi/prisma/
> ```
> Sau khi copy, cấp quyền đọc ghi trên VPS:
> ```bash
> chmod -R 775 /var/www/app/path-app/luoi/prisma/
> ```

---

## 2. 🛠️ Cách Đóng Gói Từ Localhost Để Đẩy Lên VPS

### Cách 1: Nén file ZIP sạch nhất (Đã loại bỏ rác & node_modules)
Mở PowerShell tại thư mục dự án và chạy:
```powershell
# Chạy script đóng gói sạch tự động:
.\package-for-vps.ps1
```
Hoặc nén thủ công các thư mục/file sau:
- `src/`
- `prisma/` (Bao gồm file `.db` chứa dữ liệu khách hàng)
- `public/`
- `next.config.ts`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `ecosystem.config.cjs`
- `deploy-vps.sh`
- `.env`

*(Không nén: `node_modules`, `.next`, `.git`)*

---

## 3. 🌐 Các Bước Triển Khai Trên VPS (Ubuntu / Debian / Rocky Linux)

### Bước 1: Upload và giải nén lên VPS
```bash
# Thư mục dự án chính xác trên VPS:
cd /var/www/app/path-app/luoi
```

### Bước 2: Cấp quyền chạy script deploy
```bash
cd /var/www/app/path-app/luoi
chmod +x deploy-vps.sh
chmod -R 775 prisma/
```

### Bước 3: Chạy 1 lệnh duy nhất để Deploy
```bash
cd /var/www/app/path-app/luoi
./deploy-vps.sh
```
*Script sẽ tự động: Cài npm packages -> Generate Prisma -> Build Production Next.js -> Khởi động/Reload PM2 Zero-downtime trên cổng 3000.*

---

## 4. ⚙️ Cấu Hình Nginx Reverse Proxy & SSL (HTTPS)

File cấu hình Nginx mẫu tại `/etc/nginx/sites-available/luoi-cms`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

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

    # Tối ưu upload file lớn & timeout cho Webhooks CAPI
    client_max_body_size 50M;
    proxy_read_timeout 120s;
    proxy_connect_timeout 120s;
}
```

Bật site & cài SSL tự động miễn phí:
```bash
sudo ln -s /etc/nginx/sites-available/luoi-cms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 5. 🔍 Các Lỗi Trước Đó Đã Được Khắc Phục Để Tránh Lặp Lại

1. **Lỗi Kẹt Cổng / Internal Server Error (500):**
   - Đã cấu hình `ecosystem.config.cjs` cho PM2 tự động quản lý vòng đời process, tránh các zombie process chạy ngầm chiếm cổng.
2. **Lỗi `missing required error components`:**
   - Đã thêm đầy đủ `src/app/error.tsx`, `src/app/global-error.tsx`, `src/app/not-found.tsx` chuẩn Next.js App Router.
3. **Lỗi Reload lặp do Custom Cache Headers:**
   - Đã loại bỏ các header tĩnh xung đột trong `next.config.ts`.
4. **Lỗi Menu Header không đồng bộ giữa các trang:**
   - Đã thống nhất toàn bộ trang (Home, Blog, Sản Phẩm, Admin) dùng chung font-mono uppercase tracking-wider sang trọng (`#0d4f4a`).
