# SportHub — Tài Liệu Tổng Hợp

---

# Mục Lục

1. [Tài Khoản Mẫu](#1-tài-khoản-mẫu)
2. [Kế Hoạch Dự Án](#2-kế-hoạch-dự-án)
3. [Yêu Cầu Hệ Thống](#3-yêu-cầu-hệ-thống)
4. [User Stories](#4-user-stories)
5. [API Design](#5-api-design)
6. [Tech Stack](#6-tech-stack)
7. [Coding Standards](#7-coding-standards)
8. [Deployment Guide](#8-deployment-guide)
9. [Database Schema](#9-database-schema)

---

# 1. Tài Khoản Mẫu

Mật khẩu chung: `password123`

| Role | Tên | Email | SĐT | Membership |
|------|-----|-------|------|------------|
| Admin | Admin User | admin@sporthub.vn | 0901234567 | — |
| Staff | Staff User | staff@sporthub.vn | 0901234568 | — |
| Member | Nguyễn Văn A | member1@example.com | 0901234569 | Prime |
| Member | Trần Thị B | member2@example.com | 0901234570 | VIP |
| Guest | Khách Vãng Lai | guest@example.com | 0901234571 | — |

> Guest không có password, chỉ browse.

---

# 2. Kế Hoạch Dự Án

**Phiên bản:** 1.0
**Ngày cập nhật:** 11/03/2026
**Trạng thái:** Đang triển khai

## 2.1 Tổng Quan

| Trường | Thông tin |
|--------|-----------|
| **Tên dự án** | SportHub — Nền tảng Quản lý & Đặt Sân Thể Thao |
| **Loại sản phẩm** | Web Application (SaaS) |
| **Khách hàng mục tiêu** | Trung tâm thể thao, câu lạc bộ Tennis/Pickleball/Badminton |
| **Thời gian dự án** | 6 tháng (Q1–Q2 2026) |
| **Ngân sách** | 450,000,000 VND |
| **Project Manager** | Nguyễn Thị Hoa |

## 2.2 Mục Tiêu

### Kinh Doanh
- Tăng tỷ lệ lấp đầy sân lên **30%** trong 6 tháng đầu vận hành
- Giảm thời gian xử lý đặt sân thủ công xuống **80%**
- Thu hút **500 thành viên đăng ký** trong năm đầu tiên
- Đạt doanh thu từ phí gói thành viên **200 triệu VND/tháng** sau 12 tháng

### Kỹ Thuật
- Thời gian uptime **≥ 99.5%**
- Thời gian phản hồi trang **< 2 giây**
- Hỗ trợ **1,000 người dùng đồng thời**
- Triển khai CI/CD pipeline hoàn chỉnh

### Sản Phẩm
- Website đặt sân dành cho khách hàng (Customer Portal)
- Hệ thống quản lý nội bộ (Admin Portal)
- Ứng dụng di động (giai đoạn 2)
- Tích hợp thanh toán online

## 2.3 Phạm Vi

### Trong Phạm Vi (In-Scope)
- Website đặt sân online cho khách
- Hệ thống quản lý sân và lịch đặt
- Quản lý thành viên & gói membership
- Cửa hàng bán lẻ thiết bị thể thao
- AI Chat Assistant tư vấn khách hàng
- Quản lý doanh thu và báo cáo
- Xác thực & phân quyền người dùng
- Tích hợp thanh toán VNPay / MoMo

### Ngoài Phạm Vi (Out-of-Scope)
- Ứng dụng mobile native (iOS/Android) — Giai đoạn 2
- Hệ thống kiểm soát cửa tự động (IoT)
- Quản lý giải đấu (Tournament bracket)
- Livestream buổi tập

## 2.4 Timeline & Milestones

```
Q1 2026                          Q2 2026
Jan    Feb    Mar    Apr    May    Jun
 |      |      |      |      |      |
 ████████                              Phase 1: Thiết kế & Kiến trúc
        ████████████                  Phase 2: Core Development
              ████████████            Phase 3: Feature Development
                    ████████          Phase 4: Testing & QA
                          ████████    Phase 5: Launch & Stabilization
```

| # | Milestone | Deadline | Deliverable |
|---|-----------|----------|-------------|
| M1 | Kickoff & Design Complete | 31/01/2026 | Wireframe, ERD, API spec |
| M2 | Backend API MVP | 28/02/2026 | Auth, Courts, Bookings API |
| M3 | Frontend Alpha | 31/03/2026 | Customer Portal hoạt động |
| M4 | Admin Portal Complete | 30/04/2026 | Đầy đủ tính năng admin |
| M5 | Beta Testing | 15/05/2026 | UAT với 50 người dùng thử |
| M6 | Production Launch | 01/06/2026 | Go-live toàn bộ hệ thống |
| M7 | Post-launch Stabilization | 30/06/2026 | Hotfix, performance tuning |

## 2.5 Phân Công Nhân Sự

```
Project Manager
├── Tech Lead
│   ├── Backend Developer (2)
│   ├── Frontend Developer (2)
│   └── DevOps Engineer (1)
├── Product Designer (1)
├── QA Engineer (1)
└── Business Analyst (1)
```

| Vai trò | Tên | Trách nhiệm | Allocation |
|---------|-----|-------------|------------|
| **Project Manager** | Nguyễn Thị Hoa | Điều phối, timeline, stakeholder | 100% |
| **Tech Lead** | Trần Văn Minh | Kiến trúc, code review, technical decisions | 80% |
| **Backend Dev 1** | Lê Hoàng Nam | Auth, Users, Members API | 100% |
| **Backend Dev 2** | Phạm Thị Liên | Courts, Bookings, Payments API | 100% |
| **Frontend Dev 1** | Đỗ Quang Huy | Customer Portal, Booking Flow | 100% |
| **Frontend Dev 2** | Nguyễn Lan Anh | Admin Portal, Dashboard | 100% |
| **DevOps** | Vũ Đình Khoa | CI/CD, Docker, AWS, Monitoring | 60% |
| **Product Designer** | Trương Mỹ Linh | UI/UX Design, Design System | 100% |
| **QA Engineer** | Bùi Thanh Tâm | Test planning, automation, UAT | 100% |
| **Business Analyst** | Cao Thị Mai | Requirements, user stories, acceptance criteria | 80% |

### Ma Trận RACI

| Task | PM | Tech Lead | BE Dev | FE Dev | DevOps | QA |
|------|----|-----------|--------|--------|--------|-----|
| Requirements | A | C | I | I | I | C |
| Architecture | I | A | R | R | C | I |
| Backend Dev | I | A | R | I | C | C |
| Frontend Dev | I | A | I | R | C | C |
| Infrastructure | I | C | I | I | A | I |
| Testing | C | C | R | R | C | A |
| Deployment | A | C | C | C | R | C |

*R=Responsible, A=Accountable, C=Consulted, I=Informed*

## 2.6 Quản Lý Rủi Ro

| Rủi ro | Xác suất | Tác động | Biện pháp |
|--------|----------|----------|-----------|
| Thay đổi yêu cầu giữa dự án | Cao | Trung bình | Change control process, sprint review |
| Nhân sự nghỉ việc | Thấp | Cao | Knowledge sharing, documentation |
| Tích hợp thanh toán bị delay | Trung bình | Cao | Mockup payment, parallel development |
| Hiệu suất không đạt | Thấp | Trung bình | Load testing sớm, caching strategy |
| Bảo mật dữ liệu | Thấp | Rất cao | Security audit, penetration testing |

## 2.7 Ngân Sách

| Hạng mục | Chi phí | % |
|----------|---------|---|
| Nhân sự (6 tháng) | 360,000,000 VND | 80% |
| Hạ tầng AWS/Cloud | 36,000,000 VND | 8% |
| Công cụ & License | 18,000,000 VND | 4% |
| Testing & QA | 18,000,000 VND | 4% |
| Dự phòng (10%) | 18,000,000 VND | 4% |
| **Tổng** | **450,000,000 VND** | **100%** |

---

# 3. Yêu Cầu Hệ Thống

**Phiên bản:** 1.2
**Ngày:** 11/03/2026

## 3.1 Yêu Cầu Chức Năng

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

## 3.2 Yêu Cầu Phi Chức Năng

### Hiệu Suất

| ID | Yêu cầu | Ngưỡng |
|----|---------|--------|
| NFR-PERF-01 | Thời gian tải trang đầu tiên (FCP) | ≤ 1.5 giây |
| NFR-PERF-02 | Thời gian phản hồi API | ≤ 300ms (P95) |
| NFR-PERF-03 | Số người dùng đồng thời | ≥ 1,000 |
| NFR-PERF-04 | Throughput API | ≥ 500 req/giây |
| NFR-PERF-05 | Core Web Vitals (LCP) | ≤ 2.5 giây |

### Khả Dụng

| ID | Yêu cầu | Ngưỡng |
|----|---------|--------|
| NFR-AVAIL-01 | Uptime hệ thống | ≥ 99.5% / tháng |
| NFR-AVAIL-02 | Recovery Time Objective (RTO) | ≤ 1 giờ |
| NFR-AVAIL-03 | Recovery Point Objective (RPO) | ≤ 15 phút |
| NFR-AVAIL-04 | Planned maintenance window | Chủ nhật 02:00–04:00 |

### Bảo Mật

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

### Khả Năng Mở Rộng

| ID | Yêu cầu |
|----|---------|
| NFR-SCALE-01 | Horizontal scaling cho backend services |
| NFR-SCALE-02 | Database read replicas cho query nặng |
| NFR-SCALE-03 | CDN cho static assets |
| NFR-SCALE-04 | Kiến trúc có thể thêm sân/môn mới không cần code |

### Khả Năng Bảo Trì

| ID | Yêu cầu |
|----|---------|
| NFR-MAINT-01 | Code coverage ≥ 80% (unit + integration tests) |
| NFR-MAINT-02 | API documentation tự động (OpenAPI/Swagger) |
| NFR-MAINT-03 | Structured logging (JSON format) |
| NFR-MAINT-04 | Health check endpoints cho mọi service |

### Trải Nghiệm Người Dùng

| ID | Yêu cầu |
|----|---------|
| NFR-UX-01 | Responsive design: Mobile (≥360px), Tablet, Desktop |
| NFR-UX-02 | Hỗ trợ trình duyệt: Chrome, Firefox, Safari, Edge (2 phiên bản mới nhất) |
| NFR-UX-03 | Luồng đặt sân hoàn tất trong ≤ 5 bước, ≤ 2 phút |
| NFR-UX-04 | Thông báo lỗi rõ ràng bằng tiếng Việt |

## 3.3 Ràng Buộc Kỹ Thuật

- Hệ thống phải chạy trên AWS (ap-southeast-1 — Singapore)
- Database: PostgreSQL 15+ (không dùng NoSQL cho dữ liệu chính)
- Backend ngôn ngữ: Node.js / TypeScript
- Frontend: React 18+
- Thanh toán: Phải tích hợp VNPay (yêu cầu từ chủ dự án)
- GDPR/PDPA compliance cho dữ liệu người dùng

---

# 4. User Stories

**Phiên bản:** 1.0
**Ngày:** 11/03/2026

## Personas

| Persona | Mô tả |
|---------|-------|
| **Khách lẻ (Guest)** | Người chơi thể thao chưa đăng ký, đặt sân theo nhu cầu |
| **Thành viên (Member)** | Đã đăng ký gói Basic/Prime/VIP, thường xuyên sử dụng |
| **Nhân viên (Staff)** | Tiếp tân, xử lý đặt sân tại quầy |
| **Quản trị viên (Admin)** | Quản lý toàn bộ hệ thống |

## Epic 1: Đặt Sân Online

### US-001 — Xem danh sách sân
> **Là** khách lẻ, **tôi muốn** xem danh sách tất cả các sân theo môn thể thao, **để** chọn sân phù hợp với nhu cầu của tôi.

- [ ] Hiển thị sân theo tab: Tất cả / Tennis / Pickleball / Badminton
- [ ] Mỗi sân hiển thị: tên, bề mặt, trong/ngoài nhà, giá thường, giá peak
- [ ] Tải trong < 2 giây với tối thiểu 10 sân

### US-002 — Kiểm tra lịch trống
> **Là** khách lẻ, **tôi muốn** xem lịch trống của từng sân theo ngày, **để** biết giờ nào còn có thể đặt.

- [ ] Hiển thị tất cả slot giờ trong ngày (06:00–21:00)
- [ ] Slot đã đặt hiển thị màu xám, không thể chọn
- [ ] Slot giờ peak hiển thị nhãn "PEAK" màu vàng
- [ ] Có thể chuyển ngày xem lịch dễ dàng

### US-003 — Đặt sân không cần tài khoản
> **Là** khách lẻ chưa có tài khoản, **tôi muốn** đặt sân chỉ bằng tên và số điện thoại, **để** không phải mất thời gian đăng ký trước khi chơi.

- [ ] Không bắt buộc đăng ký để đặt sân
- [ ] Chỉ cần: tên, SĐT (email tùy chọn)
- [ ] Nhận mã xác nhận (booking ref) sau khi đặt
- [ ] Hệ thống thông báo qua SĐT đã cung cấp

### US-004 — Liên kết tài khoản thành viên khi đặt
> **Là** thành viên Prime, **tôi muốn** liên kết tài khoản thành viên khi đặt sân online, **để** được hưởng 20% giảm giá mà không cần gọi điện thông báo.

- [ ] Có ô nhập SĐT/email để tra cứu tài khoản thành viên
- [ ] Hiển thị tên, gói thành viên và % giảm giá sau khi liên kết
- [ ] Giá tự động cập nhật sau khi liên kết thành công
- [ ] Có thể hủy liên kết và đặt như khách thường

### US-005 — Dùng credit khi đặt sân
> **Là** thành viên VIP với 500,000 VND credit, **tôi muốn** dùng credit để thanh toán một phần tiền sân, **để** tận dụng quyền lợi thành viên của mình.

- [ ] Hiển thị số credit khả dụng khi đặt
- [ ] Checkbox "Dùng credit" với số tiền được trừ tối đa = min(credit, tổng tiền)
- [ ] Số tiền còn lại thanh toán bằng phương thức khác
- [ ] Credit bị trừ ngay khi booking được xác nhận

### US-006 — Nhận xác nhận đặt sân
> **Là** khách đặt sân online, **tôi muốn** nhận xác nhận sau khi đặt thành công, **để** có bằng chứng khi đến sân.

- [ ] Hiển thị trang xác nhận với mã booking ref (VD: SH123456)
- [ ] Tóm tắt: sân, ngày, giờ, thời lượng, tổng tiền
- [ ] Thông báo "Sẽ xác nhận qua SĐT trong 5 phút"
- [ ] Có nút "Đặt sân mới"

## Epic 2: Quản Lý Thành Viên

### US-007 — Đăng ký gói thành viên
> **Là** khách chơi thể thao thường xuyên, **tôi muốn** đăng ký gói thành viên phù hợp, **để** tiết kiệm chi phí và có thêm quyền lợi.

- [ ] Hiển thị bảng so sánh 3 gói rõ ràng
- [ ] Mỗi gói liệt kê đầy đủ quyền lợi
- [ ] Có thể đăng ký từ website (thanh toán online)
- [ ] Tự động nhận credit và guest pass sau khi đăng ký

### US-008 — Xem quyền lợi thành viên còn lại
> **Là** thành viên đang hoạt động, **tôi muốn** xem credit và guest pass còn lại của mình, **để** biết còn được hưởng những gì trong tháng này.

- [ ] Dashboard thành viên hiển thị: gói hiện tại, ngày hết hạn, credit còn lại, guest pass còn lại
- [ ] Lịch sử sử dụng credit (cộng/trừ theo từng giao dịch)
- [ ] Cảnh báo khi còn < 7 ngày hết hạn

### US-009 — Mời khách bằng guest pass
> **Là** thành viên VIP với 5 guest pass, **tôi muốn** cho bạn bè của mình đặt sân với giá ưu đãi, **để** chia sẻ quyền lợi thành viên.

- [ ] Khi đặt sân, có thể đánh dấu "dùng guest pass"
- [ ] Guest pass trừ dần từ tài khoản thành viên
- [ ] Khách được hưởng giá thành viên cho lượt đó
- [ ] Thông báo khi guest pass về 0

## Epic 3: Quản Trị Hệ Thống

### US-010 — Duyệt đơn đặt sân online
> **Là** nhân viên tiếp tân, **tôi muốn** xem và duyệt các đơn đặt sân từ website, **để** xác nhận lịch sân và liên hệ khách hàng kịp thời.

- [ ] Tab "Online" hiển thị tất cả đơn đang chờ duyệt
- [ ] Badge đỏ thông báo số đơn mới
- [ ] Mỗi đơn hiển thị: sân, ngày giờ, tên khách, SĐT, gói thành viên, tổng tiền, ghi chú
- [ ] Nút "Xác nhận" và "Từ chối" với hiệu lực ngay lập tức
- [ ] Slot sân tự động bị khóa sau khi xác nhận

### US-011 — Đặt sân thủ công tại quầy
> **Là** nhân viên tiếp tân, **tôi muốn** đặt sân nhanh chóng cho khách đến trực tiếp, **để** giảm thời gian chờ đợi và xử lý sai sót.

- [ ] Chọn sân bằng bảng lịch trực quan
- [ ] Tìm kiếm thành viên theo SĐT/tên để áp dụng giảm giá
- [ ] Tính tiền tự động (kể cả credit nếu có)
- [ ] Booking được confirmed ngay, không qua pending

### US-012 — Quản lý thành viên
> **Là** quản trị viên, **tôi muốn** xem và quản lý toàn bộ danh sách thành viên, **để** theo dõi tình trạng tài khoản và hỗ trợ khi cần.

- [ ] Danh sách thành viên có thể lọc theo gói, tìm kiếm theo tên/SĐT
- [ ] Xem chi tiết từng thành viên: thông tin cá nhân, gói, lịch sử đặt sân
- [ ] Admin có thể thêm thành viên mới thủ công
- [ ] Cảnh báo thành viên sắp hết hạn (màu đỏ)

### US-013 — Xem dashboard tổng quan
> **Là** quản trị viên, **tôi muốn** xem tổng quan kinh doanh trong ngày trên một màn hình, **để** nắm bắt tình hình nhanh chóng mà không cần xem nhiều báo cáo.

- [ ] 4 số liệu chính: đặt sân hôm nay, đơn chờ duyệt, doanh thu hôm nay, tổng thành viên
- [ ] Danh sách đặt sân gần đây (5–10 mục)
- [ ] Biểu đồ tỷ lệ online vs trực tiếp
- [ ] Dữ liệu realtime, refresh tự động

### US-014 — Bán hàng tại cửa hàng
> **Là** nhân viên bán hàng, **tôi muốn** xử lý đơn hàng nhanh tại cửa hàng, **để** giảm thời gian thanh toán cho khách.

- [ ] Bấm vào sản phẩm để thêm vào giỏ
- [ ] Tìm thành viên để áp dụng giảm giá shop tự động
- [ ] Hỗ trợ thanh toán bằng credit
- [ ] Hoàn tất đơn trong < 1 phút

## Epic 4: AI Assistant

### US-015 — Hỏi đáp tự động về sân
> **Là** khách hàng trên website, **tôi muốn** hỏi ngay về giá sân và giờ trống mà không cần gọi điện, **để** quyết định đặt sân nhanh hơn.

- [ ] Chat widget hiển thị nổi ở góc phải website
- [ ] Trả lời được: giá sân, giờ peak, gói thành viên, cách đặt sân
- [ ] Phản hồi bằng tiếng Việt, tự nhiên
- [ ] Phản hồi trong < 3 giây

## Story Map

```
Backbone:    [Tìm sân] → [Chọn giờ] → [Nhập thông tin] → [Thanh toán] → [Xác nhận]

Walking Skeleton:
Guest:       Xem sân    Xem lịch    Điền form       Chọn phương thức  Nhận mã
Member:      + Giảm giá + Thành viên + Credit/Pass  + Credit offset   + Email
Admin:       Quản lý    Duyệt đơn   Đặt trực tiếp  Báo cáo           Phân tích
```

---

# 5. API Design

**Base URL:** `https://api.sporthub.vn/v1`
**Auth:** Bearer JWT | **Format:** JSON | **Encoding:** UTF-8

## 5.1 Authentication

### POST /auth/register
```json
// Request
{ "name": "Nguyễn Văn An", "phone": "0901234567", "email": "an@example.com", "password": "SecurePass123!" }

// Response 201
{
  "success": true,
  "data": {
    "user": { "id": "usr_abc123", "name": "Nguyễn Văn An", "phone": "0901234567", "email": "an@example.com" },
    "tokens": { "accessToken": "eyJ...", "refreshToken": "eyJ...", "expiresIn": 900 }
  }
}
```

### POST /auth/login
```json
// Request
{ "identifier": "0901234567", "password": "SecurePass123!" }

// Response 200
{
  "success": true,
  "data": {
    "user": { "id": "usr_abc123", "name": "Nguyễn Văn An", "role": "member", "plan": "prime" },
    "tokens": { "accessToken": "eyJ...", "refreshToken": "eyJ...", "expiresIn": 900 }
  }
}
```

### POST /auth/refresh
```json
// Request
{ "refreshToken": "eyJ..." }
// Response 200
{ "accessToken": "eyJ...", "expiresIn": 900 }
```

### POST /auth/forgot-password
```json
// Request
{ "phone": "0901234567" }
// Response 200
{ "success": true, "message": "OTP đã gửi", "expiresIn": 300 }
```

## 5.2 Courts

### GET /courts
Query params: `sport=Tennis`, `indoor=true`, `available=true`

```json
// Response 200
{
  "success": true,
  "data": [
    { "id": 1, "name": "Tennis Court A", "sport": "Tennis", "surface": "Hard Court", "indoor": false, "price": 150000, "peakPrice": 220000, "status": "active" }
  ],
  "meta": { "total": 6 }
}
```

### GET /courts/:id/availability
Query params: `date=2026-03-15`

```json
// Response 200
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

### POST /courts (Admin)
### PATCH /courts/:id (Admin)
### DELETE /courts/:id (Admin) — Soft delete

## 5.3 Bookings

### POST /bookings
Tạo đặt sân mới (online — trạng thái pending)

```json
// Request
{
  "courtId": 1, "date": "2026-03-15", "time": "09:00", "duration": 1,
  "customer": { "name": "Trần Văn Bình", "phone": "0912345678", "email": "binh@example.com" },
  "memberId": "mem_xyz", "useCredit": true, "creditAmount": 50000, "note": "Cần 2 vợt thuê"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "bk_001", "ref": "SH823741", "status": "pending",
    "courtName": "Tennis Court A", "date": "2026-03-15", "time": "09:00", "duration": 1,
    "pricing": { "basePrice": 150000, "memberDiscount": 30000, "creditUsed": 50000, "finalPrice": 70000 },
    "createdAt": "2026-03-11T10:30:00Z"
  }
}
```

### POST /bookings/admin (Staff/Admin)
Tạo đặt sân trực tiếp (confirmed ngay). Thêm: `"source": "admin"`, `"payMethod": "cash"`

### GET /bookings
Query params: `status=pending`, `date=2026-03-15`, `source=online`, `page=1&limit=20`

### PATCH /bookings/:id/status (Admin)
```json
// Request
{ "status": "confirmed" | "rejected", "reason": "Sân bị hỏng" }
```

### DELETE /bookings/:id
Hủy đặt sân (Customer: trước 2h, Admin: bất kỳ lúc nào)

## 5.4 Members

### GET /members (Admin)
Query params: `plan=vip`, `search=nguyen`, `expiringSoon=true`

### GET /members/:id
### POST /members (Admin)
### POST /members/:id/credit (Admin)
```json
{ "amount": 100000, "reason": "Khuyến mãi sinh nhật" }
```

## 5.5 Membership Plans

### GET /plans (public)
```json
{
  "success": true,
  "data": [
    { "id": "basic", "name": "Basic", "price": 500000, "duration": 30,
      "benefits": { "courtDiscount": 10, "shopDiscount": 5, "priorityBooking": false, "guestPasses": 0, "creditPerMonth": 0 } }
  ]
}
```

## 5.6 Shop

### GET /products
Query params: `category=Equipment`, `search=vot`, `inStock=true`

### POST /orders
```json
// Request
{
  "items": [{ "productId": 1, "quantity": 1 }, { "productId": 6, "quantity": 2 }],
  "memberId": "mem_001", "useCredit": true, "payMethod": "cash"
}

// Response 201
{
  "success": true,
  "data": { "orderId": "ord_001", "subtotal": 2870000, "memberDiscount": 574000, "creditUsed": 200000, "total": 2096000, "payMethod": "cash" }
}
```

## 5.7 Dashboard (Admin)

### GET /analytics/dashboard
```json
{
  "success": true,
  "data": {
    "today": { "bookingsCount": 12, "pendingCount": 3, "revenue": 1850000 },
    "members": { "total": 156, "vip": 23, "prime": 67, "basic": 66 },
    "recentBookings": [ { ... } ],
    "sourceBreakdown": { "online": 8, "admin": 4 }
  }
}
```

## 5.8 Error Responses

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

## 5.9 Websocket Events

Kết nối: `wss://api.sporthub.vn/ws`

| Event | Direction | Payload |
|-------|-----------|---------|
| `booking.created` | Server → Admin | `{ bookingId, courtName, customerName, time }` |
| `booking.confirmed` | Server → Customer | `{ bookingId, ref, status }` |
| `slot.locked` | Server → All | `{ courtId, date, time }` |
| `slot.released` | Server → All | `{ courtId, date, time }` |

---

# 6. Tech Stack

## 6.1 Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  Customer Website (React)  │  Admin Portal (React)       │
│  Mobile Web (Responsive)   │  PWA Support                │
└──────────────┬─────────────────────────────┬─────────────┘
               │ HTTPS / WSS                  │
┌──────────────▼─────────────────────────────▼─────────────┐
│                    API GATEWAY (AWS API GW)               │
│         Rate Limiting │ Auth │ Load Balancing             │
└──────────────┬──────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────┐
│                   BACKEND SERVICES                        │
│  Node.js/Express API  │  WebSocket Server                │
│  REST API v1          │  Real-time Events                │
└──────────────┬──────────────────────────────────────────┘
       ┌───────┼───────────────┐
       ▼       ▼               ▼
   PostgreSQL  Redis         S3/CloudFront
   (Primary)   (Cache/Queue) (Static Assets)
```

## 6.2 Frontend

| Công nghệ | Phiên bản | Lý do chọn |
|-----------|-----------|-----------|
| **React** | 18.x | Component model mạnh, ecosystem lớn |
| **TypeScript** | 5.x | Type safety, IDE support tốt |
| **Vite** | 5.x | Build tool nhanh, HMR tức thì |
| **React Router** | 6.x | Routing declarative, code splitting |
| **Zustand** | 4.x | State management nhẹ |
| **TanStack Query** | 5.x | Server state, caching, refetch tự động |
| **Tailwind CSS** | 3.x | Utility-first CSS |
| **Recharts** | 2.x | Biểu đồ dashboard |
| **Axios** | 1.x | HTTP client, interceptors |
| **date-fns** | 3.x | Xử lý ngày tháng |

## 6.3 Backend

| Công nghệ | Phiên bản | Lý do chọn |
|-----------|-----------|-----------|
| **Node.js** | 20 LTS | JavaScript full-stack, event-driven |
| **TypeScript** | 5.x | Consistency với frontend |
| **Express.js** | 4.x | Lightweight, middleware ecosystem |
| **Prisma ORM** | 5.x | Type-safe DB client, migration tự động |
| **JWT** | jsonwebtoken | Stateless auth |
| **bcrypt** | 5.x | Password hashing |
| **Socket.io** | 4.x | Real-time notifications |
| **Zod** | 3.x | Request validation |
| **Helmet** | 7.x | Security headers |

## 6.4 Database

| Công nghệ | Phiên bản | Lý do chọn |
|-----------|-----------|-----------|
| **PostgreSQL** | 15.x | ACID, relational, mạnh về concurrent writes |
| **Redis** | 7.x | Session cache, rate limiting, pub/sub, job queue |

## 6.5 AI & Integrations

| Dịch vụ | Mục đích |
|---------|---------|
| **Anthropic Claude API** | AI Chat Assistant tư vấn khách hàng |
| **VNPay Gateway** | Thanh toán thẻ nội địa |
| **MoMo** | Ví điện tử |
| **Twilio / ESMS** | OTP SMS, thông báo booking |
| **SendGrid** | Email transactional |

## 6.6 Infrastructure & DevOps

| Công nghệ | Mục đích |
|-----------|---------|
| **AWS EC2** (t3.medium) | Application servers |
| **AWS RDS PostgreSQL** | Managed database, multi-AZ |
| **AWS ElastiCache Redis** | Managed Redis |
| **AWS S3 + CloudFront** | Static assets CDN |
| **Docker** + **Docker Compose** | Containerization |
| **GitHub Actions** | CI/CD pipeline |
| **Nginx** | Reverse proxy, load balancer |
| **PM2** | Node.js process manager |
| **Datadog** | Monitoring, APM, alerts |
| **Sentry** | Error tracking |

## 6.7 Quyết Định Kiến Trúc (ADR)

- **ADR-001: Monorepo** với npm workspaces — chia sẻ types, dễ atomic commits
- **ADR-002: REST API** — team quen thuộc, dễ cache
- **ADR-003: PostgreSQL** — ACID cho booking/payment, relational rõ ràng
- **ADR-004: CSR (Vite + React)** — không cần SEO cao, đơn giản hơn SSR

---

# 7. Coding Standards

**Enforce bằng:** ESLint + Prettier + Husky pre-commit hooks

## 7.1 Quy Tắc Đặt Tên

```typescript
// Variables & Functions: camelCase
const bookingCount = 0;
function calculateFinalPrice(basePrice: number, discount: number): number { }

// Classes & Interfaces: PascalCase
class BookingService { }
interface CourtAvailability { }

// Constants: SCREAMING_SNAKE_CASE
const MAX_BOOKING_DURATION = 3;

// Files: kebab-case
// booking-service.ts, court-controller.ts, use-booking-form.ts
```

## 7.2 TypeScript

```typescript
// Luôn type rõ ràng cho parameters và return types
// Dùng interface cho objects, type cho unions/primitives
// Tránh 'any', dùng 'unknown' nếu cần
// Optional chaining và nullish coalescing
const discount = member?.plan ? planDiscounts[member.plan] : 0;
```

## 7.3 React Components

```tsx
// Functional components với TypeScript
// State ở trên cùng, derived values, event handlers (prefix 'handle')
// Named export cho components, default export cho pages
```

## 7.4 Git Conventions

### Branch Naming
```
feature/booking-cancellation
bugfix/slot-double-booking
hotfix/payment-timeout
chore/update-dependencies
```

### Commit Messages (Conventional Commits)
```
feat(booking): thêm tính năng hủy đặt sân với hoàn credit
fix(auth): sửa lỗi JWT refresh token hết hạn sớm
docs(api): cập nhật endpoint /bookings/admin
```

### Pull Request Process
1. Tạo branch từ `develop`
2. PR: mô tả rõ ràng, test coverage, screenshots (UI changes)
3. Cần ít nhất 1 reviewer approve
4. Squash commits khi merge vào `develop`
5. Chỉ Tech Lead merge `develop` → `main`

## 7.5 Folder Structure (Backend)

```
src/
├── config/           # App config, env validation
├── controllers/      # HTTP handlers (thin layer)
├── services/         # Business logic
├── middleware/        # Auth, rate limit, error handler
├── types/            # TypeScript types/interfaces
├── utils/            # Pure utility functions
├── jobs/             # Background jobs
├── events/           # WebSocket event handlers
└── __tests__/        # Tests mirror src structure
```

---

# 8. Deployment Guide

**Target:** AWS (ap-southeast-1 Singapore)
**Strategy:** Blue-Green Deployment
**CI/CD:** GitHub Actions

## 8.1 Kiến Trúc Hạ Tầng

```
Internet → Route 53 → CloudFront CDN
  ├── /static/* → S3 (React builds)
  └── /api/*    → ALB → EC2 (AZ-a, AZ-b) t3.medium
                          ├── RDS PostgreSQL 15 (Multi-AZ)
                          └── ElastiCache Redis 7
```

## 8.2 Environment Variables

Lưu trong **AWS Secrets Manager** hoặc **Parameter Store**.

Checklist trước deploy:
- [ ] `NODE_ENV=production`
- [ ] JWT secrets đủ mạnh (≥ 64 chars)
- [ ] Database URL trỏ đúng RDS endpoint
- [ ] Redis URL trỏ đúng ElastiCache endpoint
- [ ] VNPay credentials production
- [ ] `CORS_ORIGINS` chỉ cho phép domain production

## 8.3 Docker

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
USER node
CMD ["node", "dist/server.js"]
```

## 8.4 Database Migration (Production)

```bash
# Chạy migrations production
NODE_ENV=production npx prisma migrate deploy

# Kiểm tra migration status
npx prisma migrate status

# KHÔNG BAO GIỜ chạy migrate reset trên production!
```

## 8.5 Zero-Downtime Deploy Checklist

```
Before Deploy:
□ Backup database (AWS automated snapshot)
□ Notify team via Slack #deployments
□ Review CHANGELOG và commit messages

Deploy Steps:
□ Run: npm run deploy:staging (test staging trước)
□ Smoke test staging (5 phút)
□ Run: npm run deploy:production
□ Monitor error rate trong 15 phút đầu

After Deploy:
□ Update deployment log
□ Close related tickets/issues
```

## 8.6 Monitoring & Alerting

| Alert | Threshold | Hành động |
|-------|-----------|-----------|
| API Error Rate | > 1% trong 5 phút | Notify #on-call Slack |
| P95 Latency | > 1 giây | Notify Tech Lead |
| DB Connections | > 80% pool | Scale hoặc investigate |
| Disk Usage | > 80% | Expand hoặc cleanup |
| Uptime | < 99.5% / tháng | SLA breach alert |

## 8.7 Domain & SSL

```
Domain: sporthub.vn (Route 53)
API:    api.sporthub.vn
Admin:  admin.sporthub.vn
App:    app.sporthub.vn
SSL:    AWS Certificate Manager (auto-renew)
```

---

# 9. Database Schema

> Chi tiết đầy đủ xem file `sporthub_database.sql`

## 9.1 Tổng quan bảng

| Bảng | Mô tả |
|------|-------|
| `users` | Platform users — customers, staff, admins |
| `membership_plans` | Static plan definitions — Basic / Prime / VIP |
| `memberships` | Active/past membership subscriptions per user |
| `courts` | Physical courts available for booking |
| `bookings` | Court booking records |
| `products` | Shop products and rentable services |
| `orders` | Shop purchase orders |
| `order_items` | Line items for each shop order |
| `credit_transactions` | Ledger of credit additions/deductions |
| `otp_codes` | One-time passwords for password reset and admin 2FA |
| `oauth_accounts` | Linked OAuth provider accounts (Google) |
| `role_permissions` | RBAC permission matrix |
| `audit_logs` | Immutable audit trail for admin/staff actions |
| `guest_pass_transactions` | Guest pass usage ledger |
| `waitlists` | Customers waiting for a slot |
| `recurring_bookings` | Weekly recurring booking schedules |
| `notifications` | Outbound notification log (email/SMS) |
| `chat_sessions` / `chat_messages` | AI assistant chat |

## 9.2 Enums

```sql
user_role:        guest | member | staff | admin | super_admin
membership_plan:  basic | prime | vip
membership_status: active | expired | cancelled
sport_type:       Tennis | Pickleball | Badminton
court_status:     active | maintenance | inactive
booking_status:   pending | confirmed | rejected | cancelled | completed
booking_source:   online | admin
order_status:     pending | paid | cancelled | refunded
product_status:   active | inactive
```
