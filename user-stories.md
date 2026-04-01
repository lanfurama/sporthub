# 👤 User Stories — SportHub Platform

**Phiên bản:** 1.0  
**Ngày:** 11/03/2026

---

## Personas

| Persona | Mô tả |
|---------|-------|
| **Khách lẻ (Guest)** | Người chơi thể thao chưa đăng ký, đặt sân theo nhu cầu |
| **Thành viên (Member)** | Đã đăng ký gói Basic/Prime/VIP, thường xuyên sử dụng |
| **Nhân viên (Staff)** | Tiếp tân, xử lý đặt sân tại quầy |
| **Quản trị viên (Admin)** | Quản lý toàn bộ hệ thống |

---

## Epic 1: Đặt Sân Online

### US-001 — Xem danh sách sân
> **Là** khách lẻ,  
> **Tôi muốn** xem danh sách tất cả các sân theo môn thể thao,  
> **Để** chọn sân phù hợp với nhu cầu của tôi.

**Tiêu chí chấp nhận:**
- [ ] Hiển thị sân theo tab: Tất cả / Tennis / Pickleball / Badminton
- [ ] Mỗi sân hiển thị: tên, bề mặt, trong/ngoài nhà, giá thường, giá peak
- [ ] Tải trong < 2 giây với tối thiểu 10 sân

---

### US-002 — Kiểm tra lịch trống
> **Là** khách lẻ,  
> **Tôi muốn** xem lịch trống của từng sân theo ngày,  
> **Để** biết giờ nào còn có thể đặt.

**Tiêu chí chấp nhận:**
- [ ] Hiển thị tất cả slot giờ trong ngày (06:00–21:00)
- [ ] Slot đã đặt hiển thị màu xám, không thể chọn
- [ ] Slot giờ peak hiển thị nhãn "PEAK" màu vàng
- [ ] Có thể chuyển ngày xem lịch dễ dàng

---

### US-003 — Đặt sân không cần tài khoản
> **Là** khách lẻ chưa có tài khoản,  
> **Tôi muốn** đặt sân chỉ bằng tên và số điện thoại,  
> **Để** không phải mất thời gian đăng ký trước khi chơi.

**Tiêu chí chấp nhận:**
- [ ] Không bắt buộc đăng ký để đặt sân
- [ ] Chỉ cần: tên, SĐT (email tùy chọn)
- [ ] Nhận mã xác nhận (booking ref) sau khi đặt
- [ ] Hệ thống thông báo qua SĐT đã cung cấp

---

### US-004 — Liên kết tài khoản thành viên khi đặt
> **Là** thành viên Prime,  
> **Tôi muốn** liên kết tài khoản thành viên khi đặt sân online,  
> **Để** được hưởng 20% giảm giá mà không cần gọi điện thông báo.

**Tiêu chí chấp nhận:**
- [ ] Có ô nhập SĐT/email để tra cứu tài khoản thành viên
- [ ] Hiển thị tên, gói thành viên và % giảm giá sau khi liên kết
- [ ] Giá tự động cập nhật sau khi liên kết thành công
- [ ] Có thể hủy liên kết và đặt như khách thường

---

### US-005 — Dùng credit khi đặt sân
> **Là** thành viên VIP với 500,000 VND credit,  
> **Tôi muốn** dùng credit để thanh toán một phần tiền sân,  
> **Để** tận dụng quyền lợi thành viên của mình.

**Tiêu chí chấp nhận:**
- [ ] Hiển thị số credit khả dụng khi đặt
- [ ] Checkbox "Dùng credit" với số tiền được trừ tối đa = min(credit, tổng tiền)
- [ ] Số tiền còn lại thanh toán bằng phương thức khác
- [ ] Credit bị trừ ngay khi booking được xác nhận

---

### US-006 — Nhận xác nhận đặt sân
> **Là** khách đặt sân online,  
> **Tôi muốn** nhận xác nhận sau khi đặt thành công,  
> **Để** có bằng chứng khi đến sân.

**Tiêu chí chấp nhận:**
- [ ] Hiển thị trang xác nhận với mã booking ref (VD: SH123456)
- [ ] Tóm tắt: sân, ngày, giờ, thời lượng, tổng tiền
- [ ] Thông báo "Sẽ xác nhận qua SĐT trong 5 phút"
- [ ] Có nút "Đặt sân mới"

---

## Epic 2: Quản Lý Thành Viên

### US-007 — Đăng ký gói thành viên
> **Là** khách chơi thể thao thường xuyên,  
> **Tôi muốn** đăng ký gói thành viên phù hợp,  
> **Để** tiết kiệm chi phí và có thêm quyền lợi.

**Tiêu chí chấp nhận:**
- [ ] Hiển thị bảng so sánh 3 gói rõ ràng
- [ ] Mỗi gói liệt kê đầy đủ quyền lợi
- [ ] Có thể đăng ký từ website (thanh toán online)
- [ ] Tự động nhận credit và guest pass sau khi đăng ký

---

### US-008 — Xem quyền lợi thành viên còn lại
> **Là** thành viên đang hoạt động,  
> **Tôi muốn** xem credit và guest pass còn lại của mình,  
> **Để** biết còn được hưởng những gì trong tháng này.

**Tiêu chí chấp nhận:**
- [ ] Dashboard thành viên hiển thị: gói hiện tại, ngày hết hạn, credit còn lại, guest pass còn lại
- [ ] Lịch sử sử dụng credit (cộng/trừ theo từng giao dịch)
- [ ] Cảnh báo khi còn < 7 ngày hết hạn

---

### US-009 — Mời khách bằng guest pass
> **Là** thành viên VIP với 5 guest pass,  
> **Tôi muốn** cho bạn bè của mình đặt sân với giá ưu đãi,  
> **Để** chia sẻ quyền lợi thành viên.

**Tiêu chí chấp nhận:**
- [ ] Khi đặt sân, có thể đánh dấu "dùng guest pass"
- [ ] Guest pass trừ dần từ tài khoản thành viên
- [ ] Khách được hưởng giá thành viên cho lượt đó
- [ ] Thông báo khi guest pass về 0

---

## Epic 3: Quản Trị Hệ Thống

### US-010 — Duyệt đơn đặt sân online
> **Là** nhân viên tiếp tân,  
> **Tôi muốn** xem và duyệt các đơn đặt sân từ website,  
> **Để** xác nhận lịch sân và liên hệ khách hàng kịp thời.

**Tiêu chí chấp nhận:**
- [ ] Tab "Online" hiển thị tất cả đơn đang chờ duyệt
- [ ] Badge đỏ thông báo số đơn mới
- [ ] Mỗi đơn hiển thị: sân, ngày giờ, tên khách, SĐT, gói thành viên, tổng tiền, ghi chú
- [ ] Nút "Xác nhận" và "Từ chối" với hiệu lực ngay lập tức
- [ ] Slot sân tự động bị khóa sau khi xác nhận

---

### US-011 — Đặt sân thủ công tại quầy
> **Là** nhân viên tiếp tân,  
> **Tôi muốn** đặt sân nhanh chóng cho khách đến trực tiếp,  
> **Để** giảm thời gian chờ đợi và xử lý sai sót.

**Tiêu chí chấp nhận:**
- [ ] Chọn sân bằng bảng lịch trực quan
- [ ] Tìm kiếm thành viên theo SĐT/tên để áp dụng giảm giá
- [ ] Tính tiền tự động (kể cả credit nếu có)
- [ ] Booking được confirmed ngay, không qua pending

---

### US-012 — Quản lý thành viên
> **Là** quản trị viên,  
> **Tôi muốn** xem và quản lý toàn bộ danh sách thành viên,  
> **Để** theo dõi tình trạng tài khoản và hỗ trợ khi cần.

**Tiêu chí chấp nhận:**
- [ ] Danh sách thành viên có thể lọc theo gói, tìm kiếm theo tên/SĐT
- [ ] Xem chi tiết từng thành viên: thông tin cá nhân, gói, lịch sử đặt sân
- [ ] Admin có thể thêm thành viên mới thủ công
- [ ] Cảnh báo thành viên sắp hết hạn (màu đỏ)

---

### US-013 — Xem dashboard tổng quan
> **Là** quản trị viên,  
> **Tôi muốn** xem tổng quan kinh doanh trong ngày trên một màn hình,  
> **Để** nắm bắt tình hình nhanh chóng mà không cần xem nhiều báo cáo.

**Tiêu chí chấp nhận:**
- [ ] 4 số liệu chính: đặt sân hôm nay, đơn chờ duyệt, doanh thu hôm nay, tổng thành viên
- [ ] Danh sách đặt sân gần đây (5–10 mục)
- [ ] Biểu đồ tỷ lệ online vs trực tiếp
- [ ] Dữ liệu realtime, refresh tự động

---

### US-014 — Bán hàng tại cửa hàng
> **Là** nhân viên bán hàng,  
> **Tôi muốn** xử lý đơn hàng nhanh tại cửa hàng,  
> **Để** giảm thời gian thanh toán cho khách.

**Tiêu chí chấp nhận:**
- [ ] Bấm vào sản phẩm để thêm vào giỏ
- [ ] Tìm thành viên để áp dụng giảm giá shop tự động
- [ ] Hỗ trợ thanh toán bằng credit
- [ ] Hoàn tất đơn trong < 1 phút

---

## Epic 4: AI Assistant

### US-015 — Hỏi đáp tự động về sân
> **Là** khách hàng trên website,  
> **Tôi muốn** hỏi ngay về giá sân và giờ trống mà không cần gọi điện,  
> **Để** quyết định đặt sân nhanh hơn.

**Tiêu chí chấp nhận:**
- [ ] Chat widget hiển thị nổi ở góc phải website
- [ ] Trả lời được: giá sân, giờ peak, gói thành viên, cách đặt sân
- [ ] Phản hồi bằng tiếng Việt, tự nhiên
- [ ] Phản hồi trong < 3 giây

---

## Story Map tóm tắt

```
Backbone:    [Tìm sân] → [Chọn giờ] → [Nhập thông tin] → [Thanh toán] → [Xác nhận]
                                                                        
Walking Skeleton:
Guest:       Xem sân    Xem lịch    Điền form       Chọn phương thức  Nhận mã
Member:      + Giảm giá + Thành viên + Credit/Pass  + Credit offset   + Email
Admin:       Quản lý    Duyệt đơn   Đặt trực tiếp  Báo cáo           Phân tích
```
