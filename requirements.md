# 📄 Tài Liệu Yêu Cầu Hệ Thống — SportHub

**Phiên bản:** 1.2  
**Ngày:** 11/03/2026  
**Tác giả:** Business Analyst Team

---

## 1. Yêu Cầu Chức Năng (Functional Requirements)

### Module 1: Xác thực & Phân quyền

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| FR-AUTH-01 | Khách hàng đăng ký tài khoản bằng email/SĐT + mật khẩu | P0 |
| FR-AUTH-02 | Đăng nhập bằng email/SĐT + mật khẩu | P0 |
| FR-AUTH-03 | Đăng nhập bằng Google OAuth 2.0 | P1 |
| FR-AUTH-04 | Đặt lại mật khẩu qua email/OTP SMS | P0 |
| FR-AUTH-05 | Admin đăng nhập riêng với 2FA bắt buộc | P0 |
| FR-AUTH-06 | Phân quyền: Guest / Member / Staff / Admin / Super Admin | P0 |
| FR-AUTH-07 | JWT access token (15 phút) + refresh token (30 ngày) | P0 |

### Module 2: Quản Lý Sân

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| FR-COURT-01 | Admin tạo/sửa/xoá thông tin sân | P0 |
| FR-COURT-02 | Mỗi sân có: tên, loại (Tennis/Pickleball/Badminton), bề mặt, trong/ngoài nhà, giá thường, giá peak | P0 |
| FR-COURT-03 | Hiển thị lịch sân theo ngày với các slot thời gian | P0 |
| FR-COURT-04 | Tự động khóa slot đã được đặt | P0 |
| FR-COURT-05 | Admin đánh dấu sân bảo trì (maintenance mode) | P1 |
| FR-COURT-06 | Giờ peak tự động theo cấu hình (mặc định 17:00–21:00) | P1 |

### Module 3: Đặt Sân (Booking)

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| FR-BOOK-01 | Khách chọn môn → sân → ngày → giờ → nhập thông tin → xác nhận | P0 |
| FR-BOOK-02 | Hệ thống tự động tính giá (thường/peak × thời lượng × % discount thành viên) | P0 |
| FR-BOOK-03 | Đặt sân online tạo trạng thái "Pending" — admin duyệt | P0 |
| FR-BOOK-04 | Admin đặt sân trực tiếp → trạng thái "Confirmed" ngay | P0 |
| FR-BOOK-05 | Admin có thể Approve/Reject đơn online | P0 |
| FR-BOOK-06 | Gửi email/SMS xác nhận sau khi đặt thành công | P1 |
| FR-BOOK-07 | Khách có thể hủy đặt sân trước 2 giờ, được hoàn credit | P1 |
| FR-BOOK-08 | Hệ thống danh sách chờ (waitlist) khi sân đầy | P2 |
| FR-BOOK-09 | Tạo booking lặp lại (recurring booking) theo tuần | P2 |
| FR-BOOK-10 | Mã xác nhận (booking ref) duy nhất dạng "SH" + 6 chữ số | P0 |

### Module 4: Thành Viên (Membership)

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| FR-MEM-01 | 3 gói: Basic (500K), Prime (1.2M), VIP (2.5M) — 30 ngày/gói | P0 |
| FR-MEM-02 | Mỗi gói có: % giảm giá sân, % giảm giá shop, credit/tháng, guest pass/tháng | P0 |
| FR-MEM-03 | Credit được cộng tự động vào đầu mỗi chu kỳ | P0 |
| FR-MEM-04 | Credit trừ dần khi thanh toán, không âm | P0 |
| FR-MEM-05 | Guest pass cho phép người không phải thành viên được hưởng ưu đãi | P1 |
| FR-MEM-06 | Cảnh báo email 7 ngày trước khi gói hết hạn | P1 |
| FR-MEM-07 | Lịch sử sử dụng credit và guest pass | P1 |
| FR-MEM-08 | Admin tặng thêm credit thủ công | P2 |

### Module 5: Cửa Hàng (Shop)

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| FR-SHOP-01 | Hiển thị sản phẩm theo danh mục | P1 |
| FR-SHOP-02 | Giỏ hàng, thêm/xoá/cập nhật số lượng | P1 |
| FR-SHOP-03 | Tự động áp dụng % giảm giá shop theo gói thành viên | P1 |
| FR-SHOP-04 | Dùng credit để thanh toán sản phẩm | P1 |
| FR-SHOP-05 | Admin quản lý kho (stock) | P1 |
| FR-SHOP-06 | Thanh toán tiền mặt, thẻ, chuyển khoản, VNPay, MoMo | P1 |

### Module 6: Thanh Toán

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| FR-PAY-01 | Hỗ trợ: tiền mặt, thẻ ngân hàng, chuyển khoản | P0 |
| FR-PAY-02 | Tích hợp VNPay gateway | P1 |
| FR-PAY-03 | Tích hợp MoMo | P1 |
| FR-PAY-04 | Lịch sử giao dịch đầy đủ | P0 |
| FR-PAY-05 | Xuất hóa đơn PDF | P2 |

### Module 7: Dashboard & Báo Cáo

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| FR-RPT-01 | Dashboard: đặt sân hôm nay, doanh thu, thành viên | P0 |
| FR-RPT-02 | Biểu đồ doanh thu theo ngày/tuần/tháng | P1 |
| FR-RPT-03 | Tỷ lệ lấp đầy sân theo sân/thời gian | P1 |
| FR-RPT-04 | Xuất báo cáo Excel/CSV | P2 |

### Module 8: AI Assistant

| ID | Yêu cầu | Ưu tiên |
|----|---------|---------|
| FR-AI-01 | Chat widget nổi trên website khách hàng | P1 |
| FR-AI-02 | Trả lời câu hỏi về giá, lịch sân, gói thành viên | P1 |
| FR-AI-03 | Hỗ trợ tiếng Việt, context-aware | P1 |
| FR-AI-04 | Lưu lịch sử chat trong session | P2 |

---

## 2. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)

### 2.1 Hiệu Suất (Performance)

| ID | Yêu cầu | Ngưỡng |
|----|---------|--------|
| NFR-PERF-01 | Thời gian tải trang đầu tiên (FCP) | ≤ 1.5 giây |
| NFR-PERF-02 | Thời gian phản hồi API | ≤ 300ms (P95) |
| NFR-PERF-03 | Số người dùng đồng thời | ≥ 1,000 |
| NFR-PERF-04 | Throughput API | ≥ 500 req/giây |
| NFR-PERF-05 | Core Web Vitals (LCP) | ≤ 2.5 giây |

### 2.2 Khả Dụng (Availability)

| ID | Yêu cầu | Ngưỡng |
|----|---------|--------|
| NFR-AVAIL-01 | Uptime hệ thống | ≥ 99.5% / tháng |
| NFR-AVAIL-02 | Recovery Time Objective (RTO) | ≤ 1 giờ |
| NFR-AVAIL-03 | Recovery Point Objective (RPO) | ≤ 15 phút |
| NFR-AVAIL-04 | Planned maintenance window | Chủ nhật 02:00–04:00 |

### 2.3 Bảo Mật (Security)

| ID | Yêu cầu |
|----|---------|
| NFR-SEC-01 | HTTPS bắt buộc cho mọi endpoint |
| NFR-SEC-02 | Mật khẩu hash bằng bcrypt (salt rounds ≥ 12) |
| NFR-SEC-03 | SQL Injection protection (parameterized queries) |
| NFR-SEC-04 | Rate limiting: 100 req/phút/IP cho API công khai |
| NFR-SEC-05 | XSS protection, CSRF tokens |
| NFR-SEC-06 | Dữ liệu nhạy cảm mã hóa AES-256 ở trạng thái lưu trữ |
| NFR-SEC-07 | PCI DSS compliance cho thanh toán thẻ |
| NFR-SEC-08 | Audit log mọi thao tác admin |

### 2.4 Khả Năng Mở Rộng (Scalability)

| ID | Yêu cầu |
|----|---------|
| NFR-SCALE-01 | Horizontal scaling cho backend services |
| NFR-SCALE-02 | Database read replicas cho query nặng |
| NFR-SCALE-03 | CDN cho static assets |
| NFR-SCALE-04 | Kiến trúc có thể thêm sân/môn mới không cần code |

### 2.5 Khả Năng Bảo Trì (Maintainability)

| ID | Yêu cầu |
|----|---------|
| NFR-MAINT-01 | Code coverage ≥ 80% (unit + integration tests) |
| NFR-MAINT-02 | API documentation tự động (OpenAPI/Swagger) |
| NFR-MAINT-03 | Structured logging (JSON format) |
| NFR-MAINT-04 | Health check endpoints cho mọi service |

### 2.6 Trải Nghiệm Người Dùng (UX)

| ID | Yêu cầu |
|----|---------|
| NFR-UX-01 | Responsive design: Mobile (≥360px), Tablet, Desktop |
| NFR-UX-02 | Hỗ trợ trình duyệt: Chrome, Firefox, Safari, Edge (2 phiên bản mới nhất) |
| NFR-UX-03 | Luồng đặt sân hoàn tất trong ≤ 5 bước, ≤ 2 phút |
| NFR-UX-04 | Thông báo lỗi rõ ràng bằng tiếng Việt |

---

## 3. Ràng Buộc Kỹ Thuật

- Hệ thống phải chạy trên AWS (ap-southeast-1 — Singapore)
- Database: PostgreSQL 15+ (không dùng NoSQL cho dữ liệu chính)
- Backend ngôn ngữ: Node.js / TypeScript
- Frontend: React 18+
- Thanh toán: Phải tích hợp VNPay (yêu cầu từ chủ dự án)
- GDPR/PDPA compliance cho dữ liệu người dùng
