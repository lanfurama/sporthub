## 🏸 SportHub — Nền tảng Quản lý & Đặt Sân Thể Thao

SportHub là ứng dụng web giúp trung tâm thể thao quản lý sân, lịch đặt sân, thành viên, gói membership và doanh thu. Dự án được tổ chức dạng **monorepo** với 2 workspace:
- `server`: Backend API (Node.js, Express, Prisma, PostgreSQL)
- `client`: Frontend web (React + Vite)

---

## 1. Yêu cầu hệ thống

- **Node.js**: >= 18
- **npm**: >= 9
- **PostgreSQL**: >= 14
- Hệ điều hành: macOS / Linux / Windows

---

## 2. Cài đặt dependencies

Clone repository:

```bash
git clone <your-repo-url> sporthub
cd sporthub
```

Cài đặt tất cả dependencies cho root, server và client:

```bash
npm run install:all
```

Hoặc cài đặt thủ công:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

---

## 3. Cấu hình môi trường

### 3.1. Backend (`server/.env`)

Tạo file `.env` trong thư mục `server` (nếu chưa có) với nội dung tương tự:

```bash
cd server
cp .env.example .env # nếu có
```

Hoặc tạo thủ công:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/sporthub?schema=public"
JWT_SECRET="your_jwt_secret_here"
PORT=4000
NODE_ENV=development
```

Điều chỉnh `username`, `password`, `host`, `port` và `database name` theo cấu hình PostgreSQL trên máy bạn.

### 3.2. Frontend (`client/.env`)

Tạo file `.env` trong thư mục `client` (hoặc `.env.local` tùy config Vite) trỏ đến API backend, ví dụ:

```bash
cd client
echo "VITE_API_URL=http://localhost:4000" > .env
```

---

## 4. Thiết lập cơ sở dữ liệu

1. Khởi tạo database trong PostgreSQL (ví dụ `sporthub`):

```sql
CREATE DATABASE sporthub;
```

2. Chạy migration Prisma từ root:

```bash
npm run db:migrate
```

Lệnh này sẽ gọi `npm run db:migrate -w server` và áp dụng toàn bộ schema vào database.

3. (Tuỳ chọn) Generate Prisma Client:

```bash
npm run db:generate
```

---

## 5. Seed dữ liệu mẫu

Từ thư mục `server`, chạy:

```bash
cd server
npm run db:seed
```

> **Lưu ý:** Nếu lệnh seed báo lỗi liên quan tới `PrismaClientUnknownRequestError` hoặc `insufficient data left in message`, hãy kiểm tra:
> - Database đã được tạo đúng tên như trong `DATABASE_URL` chưa
> - Đã chạy `npm run db:migrate` trước khi seed chưa
> - Kết nối PostgreSQL có hoạt động bình thường không

Nếu lỗi vẫn tiếp diễn, có thể tạm thời bỏ qua bước seed và tự tạo dữ liệu qua API/Admin sau khi hệ thống chạy.

---

## 6. Chạy dự án trong môi trường development

### 6.1. Chạy backend và frontend cùng lúc

Từ thư mục gốc:

```bash
npm run dev
```

Lệnh này sẽ:
- Chạy `server` ở chế độ dev (qua `nodemon`)
- Chạy `client` bằng Vite

Thường địa chỉ truy cập:
- Frontend: `http://localhost:5173` (hoặc port Vite khác)
- Backend API: `http://localhost:4000`

### 6.2. Chạy riêng từng phần

- **Chỉ backend:**

```bash
npm run dev:server
```

- **Chỉ frontend:**

```bash
npm run dev:client
```

---

## 7. Build & chạy production

### 7.1. Build toàn bộ

Từ thư mục gốc:

```bash
npm run build
```

Lệnh này sẽ build:
- `server` → `dist/`
- `client` → `dist/`

### 7.2. Chạy backend production

Từ thư mục `server`:

```bash
cd server
npm run start
```

Frontend build (`client/dist`) có thể được serve qua Nginx, một static file server bất kỳ, hoặc tích hợp vào backend tuỳ chiến lược deploy.

---

## 8. Scripts hữu ích

Từ thư mục gốc:

- **Chạy test backend:**

```bash
npm test
```

- **Xem coverage test backend:**

```bash
npm run test:coverage
```

- **Mở Prisma Studio:**

```bash
npm run db:studio
```

---

## 9. Cấu trúc thư mục (tóm tắt)

```bash
sporthub/
├── package.json          # Scripts & workspaces cho monorepo
├── server/               # Backend API (Express, Prisma)
│   ├── prisma/           # Schema & migration
│   ├── src/              # Source code backend
│   └── package.json
├── client/               # Frontend React + Vite
│   ├── src/              # Source code frontend
│   └── package.json
└── project-plan.md       # Tài liệu kế hoạch dự án
```

---

## 10. Góp ý & Phát triển thêm

- Tạo issue hoặc mở pull request trên repository GitHub để đề xuất tính năng mới hoặc báo lỗi.
- Cải tiến thêm:
  - Tích hợp CI/CD
  - Docker hóa toàn bộ hệ thống
  - Monitoring & logging nâng cao

