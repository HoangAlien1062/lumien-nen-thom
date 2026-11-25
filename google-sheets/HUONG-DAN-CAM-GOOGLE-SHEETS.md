# Hướng dẫn cắm Website LUMIÈN vào Google Sheets (Miễn phí 100%)

Chỉ mất khoảng **2 phút**, mọi **Đơn hàng**, **Tin nhắn tư vấn** và **Yêu cầu liên hệ** từ khách hàng sẽ tự động đổ về file Google Sheets của bạn (chia sẵn 3 tab: `DonHang`, `TinNhanTuVan`, `YeuCauLienHe`).

---

## Bước 1: Tạo Google Sheets và mở Apps Script
1. Truy cập [Google Sheets](https://sheets.google.com) và tạo một bảng tính mới (đặt tên ví dụ: `LUMIÈN - Quản lý đơn hàng`).
2. Trên thanh menu, bấm **Tiện ích mở rộng (Extensions)** -> **Apps Script**.

## Bước 2: Dán mã `Code.gs`
1. Xóa toàn bộ code mẫu mặc định trong khung soạn thảo `Code.gs`.
2. Mở file `google-sheets/Code.gs` trong thư mục dự án, copy toàn bộ và dán vào Apps Script.
3. *(Tùy chọn)* Nếu muốn Google tự gửi thêm **Email báo đơn mới**, điền Gmail của bạn vào dòng:
   ```javascript
   const EMAIL_THONG_BAO = 'emailcuaban@gmail.com';
   ```
4. Bấm **Lưu** (`Ctrl + S`).

## Bước 3: Triển khai thành Web App
1. Ở góc trên bên phải Apps Script, bấm **Triển khai (Deploy)** -> **Tùy chọn triển khai mới (New deployment)**.
2. Bấm biểu tượng bánh răng -> chọn **Ứng dụng web (Web app)**.
3. Thiết lập đúng 2 dòng sau:
   - **Thực thi dưới danh nghĩa (Execute as):** `Tôi (Me)`
   - **Ai có quyền truy cập (Who has access):** `Bất kỳ ai (Anyone)`
4. Bấm **Triển khai (Deploy)** -> Chọn tài khoản Google -> nếu hiện cảnh báo *"Google chưa xác minh ứng dụng này"*, bấm **Nâng cao (Advanced)** -> **Đi tới ... (không an toàn)** -> **Cho phép (Allow)**.
5. Copy đường dẫn **URL ứng dụng web** (có dạng `https://script.google.com/macros/s/AKfycb.../exec`).

## Bước 4: Dán URL vào Website LUMIÈN
- **Cách 1 (Khuyên dùng khi đưa web lên mạng để MỌI khách đặt đều đổ về Sheet):**
  Mở file `js/config.js`, tìm mục `googleSheets` và cập nhật:
  ```javascript
  googleSheets: {
    enabled: true,
    url: 'https://script.google.com/macros/s/DÁN_LINK_CỦA_BẠN_VÀO_ĐÂY/exec'
  }
  ```
- **Cách 2 (Test nhanh trực tiếp trên trình duyệt):**
  Mở website -> vào `index.html#admin` (mật khẩu `admin123`) -> dán URL vào mục **Kết nối Google Sheets** -> bấm **Lưu & Gửi test**. Mở lại file Google Sheets sẽ thấy ngay tab `YeuCauLienHe` có dòng test xuất hiện!

---

### Lưu ý khi sửa lại `Code.gs` sau này
Mỗi lần chỉnh sửa `Code.gs` trên Google Apps Script, hãy chọn **Triển khai -> Quản lý các bản triển khai -> Bấm biểu tượng cây bút -> Phiên bản mới -> Triển khai** để cập nhật thay đổi mà không đổi URL.
