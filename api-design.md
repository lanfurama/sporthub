# 🔌 API Design — SportHub REST API

**Base URL:** `https://api.sporthub.vn/v1`  
**Version:** v1  
**Auth:** Bearer JWT  
**Format:** JSON  
**Encoding:** UTF-8

---

## 1. Authentication

### POST /auth/register
Đăng ký tài khoản mới

**Request:**
```json
{
  "name": "Nguyễn Văn An",
  "phone": "0901234567",
  "email": "an@example.com",
  "password": "SecurePass123!"
}
```
**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "usr_abc123", "name": "Nguyễn Văn An", "phone": "0901234567", "email": "an@example.com" },
    "tokens": { "accessToken": "eyJ...", "refreshToken": "eyJ...", "expiresIn": 900 }
  }
}
```

---

### POST /auth/login
Đăng nhập

**Request:**
```json
{ "identifier": "0901234567", "password": "SecurePass123!" }
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "usr_abc123", "name": "Nguyễn Văn An", "role": "member", "plan": "prime" },
    "tokens": { "accessToken": "eyJ...", "refreshToken": "eyJ...", "expiresIn": 900 }
  }
}
```

---

### POST /auth/refresh
Làm mới access token

**Request:** `{ "refreshToken": "eyJ..." }`  
**Response 200:** `{ "accessToken": "eyJ...", "expiresIn": 900 }`

---

### POST /auth/forgot-password
Yêu cầu đặt lại mật khẩu — gửi OTP qua SĐT

**Request:** `{ "phone": "0901234567" }`  
**Response 200:** `{ "success": true, "message": "OTP đã gửi", "expiresIn": 300 }`

---

## 2. Courts

### GET /courts
Danh sách sân, hỗ trợ filter

**Query params:** `sport=Tennis`, `indoor=true`, `available=true`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1, "name": "Tennis Court A", "sport": "Tennis",
      "surface": "Hard Court", "indoor": false,
      "price": 150000, "peakPrice": 220000,
      "status": "active"
    }
  ],
  "meta": { "total": 6 }
}
```

---

### GET /courts/:id/availability
Lịch trống của sân theo ngày

**Query params:** `date=2026-03-15`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "courtId": 1, "date": "2026-03-15",
    "slots": [
      { "time": "06:00", "duration": 60, "available": true, "isPeak": false, "price": 150000 },
      { "time": "17:00", "duration": 60, "available": false, "isPeak": true, "price": 220000 }
    ]
  }
}
```

---

### POST /courts (Admin)
Tạo sân mới

**Request:**
```json
{
  "name": "Tennis Court D", "sport": "Tennis", "surface": "Clay Court",
  "indoor": true, "price": 160000, "peakPrice": 230000
}
```
**Response 201:** `{ "success": true, "data": { "id": 7, ... } }`

---

### PATCH /courts/:id (Admin)
Cập nhật thông tin sân  
**DELETE /courts/:id (Admin)** — Soft delete sân

---

## 3. Bookings

### POST /bookings
Tạo đặt sân mới (online — trạng thái pending)

**Request:**
```json
{
  "courtId": 1,
  "date": "2026-03-15",
  "time": "09:00",
  "duration": 1,
  "customer": {
    "name": "Trần Văn Bình",
    "phone": "0912345678",
    "email": "binh@example.com"
  },
  "memberId": "mem_xyz",
  "useCredit": true,
  "creditAmount": 50000,
  "note": "Cần 2 vợt thuê"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "bk_001", "ref": "SH823741",
    "status": "pending",
    "courtName": "Tennis Court A",
    "date": "2026-03-15", "time": "09:00", "duration": 1,
    "pricing": {
      "basePrice": 150000, "memberDiscount": 30000,
      "creditUsed": 50000, "finalPrice": 70000
    },
    "createdAt": "2026-03-11T10:30:00Z"
  }
}
```

---

### POST /bookings/admin (Staff/Admin)
Tạo đặt sân trực tiếp (trạng thái confirmed ngay)

Request tương tự, thêm field: `"source": "admin"`, `"payMethod": "cash"`

---

### GET /bookings
Danh sách đặt sân (Admin: tất cả, Member: của mình)

**Query params:** `status=pending`, `date=2026-03-15`, `source=online`, `page=1&limit=20`

**Response 200:**
```json
{
  "success": true,
  "data": [ { "id": "bk_001", "ref": "SH823741", "status": "confirmed", ... } ],
  "meta": { "total": 42, "page": 1, "limit": 20, "totalPages": 3 }
}
```

---

### PATCH /bookings/:id/status (Admin)
Thay đổi trạng thái booking

**Request:** `{ "status": "confirmed" | "rejected", "reason": "Sân bị hỏng" }`  
**Response 200:** `{ "success": true, "data": { "id": "bk_001", "status": "confirmed" } }`

---

### DELETE /bookings/:id
Hủy đặt sân (Customer: trước 2h, Admin: bất kỳ lúc nào)

**Response 200:** `{ "success": true, "data": { "refunded": 50000, "refundType": "credit" } }`

---

## 4. Members

### GET /members (Admin)
Danh sách thành viên

**Query params:** `plan=vip`, `search=nguyen`, `expiringSoon=true`

---

### GET /members/:id
Chi tiết thành viên (Admin hoặc chính thành viên đó)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "mem_001", "name": "Nguyễn Văn An",
    "phone": "0901234567", "email": "an@example.com",
    "plan": "vip", "joinDate": "2024-01-15", "expiry": "2026-12-15",
    "credit": 850000, "guestPassesRemaining": 3,
    "totalSpent": 12500000,
    "benefits": {
      "courtDiscount": 35, "shopDiscount": 20,
      "priorityBooking": true, "creditPerMonth": 300000
    }
  }
}
```

---

### POST /members (Admin)
Tạo thành viên mới thủ công

**Request:**
```json
{
  "name": "Lê Thị Cẩm", "phone": "0934567890",
  "email": "cam@example.com", "plan": "prime"
}
```

---

### POST /members/:id/credit (Admin)
Cộng thêm credit thủ công

**Request:** `{ "amount": 100000, "reason": "Khuyến mãi sinh nhật" }`

---

## 5. Membership Plans

### GET /plans
Danh sách gói thành viên (public)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "basic", "name": "Basic", "price": 500000, "duration": 30,
      "benefits": { "courtDiscount": 10, "shopDiscount": 5, "priorityBooking": false, "guestPasses": 0, "creditPerMonth": 0 }
    },
    { "id": "prime", ... },
    { "id": "vip", ... }
  ]
}
```

---

## 6. Shop

### GET /products
Danh sách sản phẩm

**Query params:** `category=Equipment`, `search=vot`, `inStock=true`

---

### POST /orders
Tạo đơn hàng

**Request:**
```json
{
  "items": [
    { "productId": 1, "quantity": 1 },
    { "productId": 6, "quantity": 2 }
  ],
  "memberId": "mem_001",
  "useCredit": true,
  "payMethod": "cash"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "orderId": "ord_001",
    "subtotal": 2870000, "memberDiscount": 574000,
    "creditUsed": 200000, "total": 2096000,
    "payMethod": "cash"
  }
}
```

---

## 7. Dashboard (Admin)

### GET /analytics/dashboard
Tổng quan dashboard

**Response 200:**
```json
{
  "success": true,
  "data": {
    "today": {
      "bookingsCount": 12, "pendingCount": 3, "revenue": 1850000
    },
    "members": { "total": 156, "vip": 23, "prime": 67, "basic": 66 },
    "recentBookings": [ { ... } ],
    "sourceBreakdown": { "online": 8, "admin": 4 }
  }
}
```

---

## 8. Error Responses

Tất cả lỗi dùng format thống nhất:

```json
{
  "success": false,
  "error": {
    "code": "SLOT_NOT_AVAILABLE",
    "message": "Khung giờ 17:00 ngày 15/03/2026 của Tennis Court A đã được đặt.",
    "details": { "courtId": 1, "date": "2026-03-15", "time": "17:00" }
  }
}
```

| HTTP Code | Ý nghĩa |
|-----------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request — sai dữ liệu đầu vào |
| 401 | Unauthorized — thiếu/hết hạn token |
| 403 | Forbidden — không có quyền |
| 404 | Not Found |
| 409 | Conflict — slot đã đặt, tên trùng |
| 422 | Unprocessable Entity — validation lỗi |
| 429 | Too Many Requests — rate limit |
| 500 | Internal Server Error |

---

## 9. Websocket Events (Real-time)

Kết nối: `wss://api.sporthub.vn/ws`

| Event | Direction | Payload |
|-------|-----------|---------|
| `booking.created` | Server → Admin | `{ bookingId, courtName, customerName, time }` |
| `booking.confirmed` | Server → Customer | `{ bookingId, ref, status }` |
| `slot.locked` | Server → All | `{ courtId, date, time }` |
| `slot.released` | Server → All | `{ courtId, date, time }` |
