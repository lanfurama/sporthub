# 🚀 Setup Guide — Hướng Dẫn Cài Đặt Môi Trường Dev

**Yêu cầu:** macOS 13+, Ubuntu 22.04+, hoặc Windows 11 + WSL2

---

## 1. Yêu Cầu Hệ Thống

| Tool | Phiên bản tối thiểu | Kiểm tra |
|------|---------------------|---------|
| Node.js | 20.x LTS | `node --version` |
| npm | 10.x | `npm --version` |
| Docker Desktop | 4.x | `docker --version` |
| Git | 2.40+ | `git --version` |
| PostgreSQL | 15.x (hoặc Docker) | `psql --version` |
| Redis | 7.x (hoặc Docker) | `redis-cli --version` |

---

## 2. Clone & Cấu Trúc Dự Án

```bash
git clone https://github.com/sporthub-vn/sporthub.git
cd sporthub
```

**Cấu trúc thư mục:**
```
sporthub/
├── apps/
│   ├── api/          # Backend Express + Node.js
│   ├── web/          # Customer website (React)
│   └── admin/        # Admin portal (React)
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── utils/        # Shared utilities
│   └── ui/           # Shared UI components
├── docker/
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
├── docs/             # Tài liệu dự án
├── scripts/          # Helper scripts
├── package.json      # Root workspace config
└── turbo.json        # Turborepo config
```

---

## 3. Cài Đặt Dependencies

```bash
# Cài tất cả dependencies (root + tất cả apps)
npm install

# Nếu dùng Turborepo
npx turbo install
```

---

## 4. Biến Môi Trường

### 4.1 Backend (`apps/api/.env`)

```bash
cp apps/api/.env.example apps/api/.env
```

Chỉnh sửa file `.env`:
```env
# App
NODE_ENV=development
PORT=3001
APP_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://sporthub:password@localhost:5432/sporthub_dev
DATABASE_URL_SHADOW=postgresql://sporthub:password@localhost:5432/sporthub_shadow

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-different-from-access
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@sporthub.vn

# SMS (ESMS)
ESMS_API_KEY=xxxxx
ESMS_SECRET_KEY=xxxxx

# VNPay
VNPAY_TMN_CODE=xxxxx
VNPAY_HASH_SECRET=xxxxx
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# AWS (chỉ cần nếu dùng S3)
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=sporthub-assets
```

### 4.2 Frontend Customer (`apps/web/.env`)

```env
VITE_API_URL=http://localhost:3001/v1
VITE_WS_URL=ws://localhost:3001
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 4.3 Admin Portal (`apps/admin/.env`)

```env
VITE_API_URL=http://localhost:3001/v1
VITE_WS_URL=ws://localhost:3001
```

---

## 5. Khởi Động Database & Redis

### Option A: Docker Compose (Khuyến nghị)

```bash
# Khởi động PostgreSQL + Redis
docker-compose -f docker/docker-compose.dev.yml up -d

# Kiểm tra đang chạy
docker ps

# Kết quả mong đợi:
# sporthub-postgres   Up   0.0.0.0:5432->5432/tcp
# sporthub-redis      Up   0.0.0.0:6379->6379/tcp
```

### Option B: Local Installation

```bash
# macOS (Homebrew)
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis

# Ubuntu
sudo apt install postgresql-15 redis-server
sudo systemctl start postgresql redis-server

# Tạo database
psql -U postgres -c "CREATE USER sporthub WITH PASSWORD 'password';"
psql -U postgres -c "CREATE DATABASE sporthub_dev OWNER sporthub;"
psql -U postgres -c "CREATE DATABASE sporthub_shadow OWNER sporthub;"
```

---

## 6. Database Migration & Seeding

```bash
# Di chuyển vào thư mục API
cd apps/api

# Chạy migrations (tạo tables)
npx prisma migrate dev

# Seed dữ liệu mẫu (sân, admin account, membership plans)
npx prisma db seed

# Xem database trong Prisma Studio (GUI)
npx prisma studio
# → Mở http://localhost:5555
```

**Tài khoản sau khi seed:**
| Role | Email | Mật khẩu |
|------|-------|---------|
| Super Admin | admin@sporthub.vn | Admin@123456 |
| Staff | staff@sporthub.vn | Staff@123456 |
| Member (VIP) | member@sporthub.vn | Member@123456 |

---

## 7. Khởi Động Development Server

### Chạy tất cả cùng lúc (Turborepo)

```bash
# Từ root directory
npx turbo dev

# Hoặc với npm workspaces
npm run dev
```

### Chạy từng app riêng lẻ

```bash
# Terminal 1 — Backend API
cd apps/api
npm run dev
# → API chạy tại http://localhost:3001
# → API Docs: http://localhost:3001/docs

# Terminal 2 — Customer Website
cd apps/web
npm run dev
# → http://localhost:5173

# Terminal 3 — Admin Portal
cd apps/admin
npm run dev
# → http://localhost:5174
```

---

## 8. Kiểm Tra Cài Đặt

```bash
# Health check API
curl http://localhost:3001/health
# Kết quả: { "status": "ok", "db": "connected", "redis": "connected" }

# Test đăng nhập admin
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@sporthub.vn","password":"Admin@123456"}'
```

---

## 9. Công Cụ Hỗ Trợ (Tùy Chọn)

```bash
# pgAdmin (Database GUI)
docker run -p 5050:80 \
  -e PGADMIN_DEFAULT_EMAIL=dev@local.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  dpage/pgadmin4

# Redis Commander (Redis GUI)
docker run -p 8081:8081 rediscommander/redis-commander \
  --redis-host=localhost

# Mailhog (Bắt email dev)
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
# → Email UI: http://localhost:8025
```

---

## 10. Troubleshooting

**Lỗi: `EADDRINUSE port 3001`**
```bash
lsof -ti:3001 | xargs kill -9
```

**Lỗi: Prisma migration failed**
```bash
cd apps/api
npx prisma migrate reset  # Xóa toàn bộ DB và reset
npx prisma migrate dev
npx prisma db seed
```

**Lỗi: `Cannot connect to Redis`**
```bash
docker restart sporthub-redis
# Hoặc
redis-cli ping  # Phải trả về PONG
```

**Lỗi: Node modules không tương thích**
```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```
