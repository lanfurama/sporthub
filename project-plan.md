# 📋 Kế Hoạch Dự Án — SportHub Platform

**Phiên bản:** 1.0  
**Ngày cập nhật:** 11/03/2026  
**Trạng thái:** 🟢 Đang triển khai

---

## 1. Tổng Quan Dự Án

| Trường | Thông tin |
|--------|-----------|
| **Tên dự án** | SportHub — Nền tảng Quản lý & Đặt Sân Thể Thao |
| **Loại sản phẩm** | Web Application (SaaS) |
| **Khách hàng mục tiêu** | Trung tâm thể thao, câu lạc bộ Tennis/Pickleball/Badminton |
| **Thời gian dự án** | 6 tháng (Q1–Q2 2026) |
| **Ngân sách** | 450,000,000 VND |
| **Project Manager** | Nguyễn Thị Hoa |

---

## 2. Mục Tiêu Dự Án

### 2.1 Mục Tiêu Kinh Doanh
- Tăng tỷ lệ lấp đầy sân lên **30%** trong 6 tháng đầu vận hành
- Giảm thời gian xử lý đặt sân thủ công xuống **80%**
- Thu hút **500 thành viên đăng ký** trong năm đầu tiên
- Đạt doanh thu từ phí gói thành viên **200 triệu VND/tháng** sau 12 tháng

### 2.2 Mục Tiêu Kỹ Thuật
- Thời gian uptime **≥ 99.5%**
- Thời gian phản hồi trang **< 2 giây**
- Hỗ trợ **1,000 người dùng đồng thời**
- Triển khai CI/CD pipeline hoàn chỉnh

### 2.3 Mục Tiêu Sản Phẩm
- Website đặt sân dành cho khách hàng (Customer Portal)
- Hệ thống quản lý nội bộ (Admin Portal)
- Ứng dụng di động (giai đoạn 2)
- Tích hợp thanh toán online

---

## 3. Phạm Vi Dự Án

### 3.1 Trong Phạm Vi (In-Scope)
- ✅ Website đặt sân online cho khách
- ✅ Hệ thống quản lý sân và lịch đặt
- ✅ Quản lý thành viên & gói membership
- ✅ Cửa hàng bán lẻ thiết bị thể thao
- ✅ AI Chat Assistant tư vấn khách hàng
- ✅ Quản lý doanh thu và báo cáo
- ✅ Xác thực & phân quyền người dùng
- ✅ Tích hợp thanh toán VNPay / MoMo

### 3.2 Ngoài Phạm Vi (Out-of-Scope)
- ❌ Ứng dụng mobile native (iOS/Android) — Giai đoạn 2
- ❌ Hệ thống kiểm soát cửa tự động (IoT)
- ❌ Quản lý giải đấu (Tournament bracket)
- ❌ Livestream buổi tập

---

## 4. Timeline & Milestones

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

### Milestone Chi Tiết

| # | Milestone | Deadline | Deliverable |
|---|-----------|----------|-------------|
| M1 | Kickoff & Design Complete | 31/01/2026 | Wireframe, ERD, API spec |
| M2 | Backend API MVP | 28/02/2026 | Auth, Courts, Bookings API |
| M3 | Frontend Alpha | 31/03/2026 | Customer Portal hoạt động |
| M4 | Admin Portal Complete | 30/04/2026 | Đầy đủ tính năng admin |
| M5 | Beta Testing | 15/05/2026 | UAT với 50 người dùng thử |
| M6 | Production Launch | 01/06/2026 | Go-live toàn bộ hệ thống |
| M7 | Post-launch Stabilization | 30/06/2026 | Hotfix, performance tuning |

---

## 5. Phân Công Nhân Sự

### 5.1 Cơ Cấu Nhóm

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

### 5.2 Chi Tiết Phân Công

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

### 5.3 Ma Trận RACI

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

---

## 6. Quản Lý Rủi Ro

| Rủi ro | Xác suất | Tác động | Biện pháp |
|--------|----------|----------|-----------|
| Thay đổi yêu cầu giữa dự án | Cao | Trung bình | Change control process, sprint review |
| Nhân sự nghỉ việc | Thấp | Cao | Knowledge sharing, documentation |
| Tích hợp thanh toán bị delay | Trung bình | Cao | Mockup payment, parallel development |
| Hiệu suất không đạt | Thấp | Trung bình | Load testing sớm, caching strategy |
| Bảo mật dữ liệu | Thấp | Rất cao | Security audit, penetration testing |

---

## 7. Ngân Sách

| Hạng mục | Chi phí | % |
|----------|---------|---|
| Nhân sự (6 tháng) | 360,000,000 VND | 80% |
| Hạ tầng AWS/Cloud | 36,000,000 VND | 8% |
| Công cụ & License | 18,000,000 VND | 4% |
| Testing & QA | 18,000,000 VND | 4% |
| Dự phòng (10%) | 18,000,000 VND | 4% |
| **Tổng** | **450,000,000 VND** | **100%** |
