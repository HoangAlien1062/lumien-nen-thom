/* ==========================================================================
   LUMIÈN — Cấu hình Kinh doanh, Thanh toán, Quản trị & Webhook (Giai đoạn 2)
   Chủ shop chỉ cần điền URL / Token tại đây để nhận thông báo thực tế ngay.
   ========================================================================== */

(function (global) {
  'use strict';

  const App = (global.LumienApp = global.LumienApp || {});

  App.CONFIG = {
    brandName: 'LUMIÈN',
    tagline: 'Ánh sáng & Hương thơm',

    // Mật khẩu mở Panel Quản lý cho Người bán (#admin)
    adminPassword: 'admin123',

    // Link mở trực tiếp bảng tính Google Sheets của chủ shop (chỉ hiện trong giao diện quản trị)
    googleSheetViewUrl: 'https://docs.google.com/spreadsheets/d/1RHtymsEv5LUWOnby5hfO8lSl_03h-Iqag2A4JZWMFl8/edit',

    // Chính sách vận chuyển
    shippingFee: 25000,
    freeShippingMinAmount: 350000, // Miễn phí ship cho đơn từ 350.000₫ (ví dụ 2 bộ đèn)

    // Thông tin liên hệ cửa hàng
    contact: {
      phone: '0397 133 716',
      phoneHref: 'tel:0397133716',
      zaloUrl: 'https://zalo.me/0397133716',
      facebookUrl: 'https://facebook.com',
      instagramUrl: 'https://instagram.com',
      tiktokUrl: 'https://tiktok.com',
      email: 'dangthienkim260509@gmail.com',
      address: 'THPT Bà Điểm',
      hours: 'Thứ 2 – Chủ Nhật: 08:30 – 21:30'
    },

    // Thông tin chuyển khoản ngân hàng (hiển thị khi khách chọn Chuyển khoản)
    bankTransfer: {
      bankName: 'Vietcombank (VCB)',
      accountNumber: '1028 6824 6888',
      accountName: 'NGUYEN MINH ANH · LUMIEN STUDIO',
      branch: 'Chi nhánh TP. Thủ Đức'
    },

    /* ----------------------------------------------------------------------
       CẤU HÌNH KẾT NỐI GOOGLE SHEETS & WEBHOOK CHO CHỦ SHOP
       - Xem hướng dẫn chi tiết 4 bước tại: google-sheets/HUONG-DAN-CAM-GOOGLE-SHEETS.md
       - Khi đã có URL Web App từ Google Apps Script, đổi `enabled: true` và dán URL
         vào `url` bên dưới để MỌI khách truy cập web đặt hàng đều đổ về Google Sheets.
       ---------------------------------------------------------------------- */
    webhooks: {
      // 1. Google Sheets (Khuyên dùng — Miễn phí 100%, dùng mã google-sheets/Code.gs)
      googleSheets: {
        enabled: true,
        url: 'https://script.google.com/macros/s/AKfycbzKoeld8xk_-ozEc-cugyavar9pB9lauRBTXfn0OvyUTwyk17c3kuMPfkgN12OgJyh3/exec'
      },

      // 2. Telegram Bot (gửi thông báo đơn hàng / tin nhắn ngay về điện thoại)
      telegram: {
        enabled: false,
        botToken: '', // Ví dụ: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz'
        chatId: ''    // Ví dụ: '987654321' hoặc '-100xxxxxxxxxx' (nhóm)
      },

      // 3. Formspree (gửi email thông báo tự động không cần backend)
      formspree: {
        enabled: false,
        endpoint: ''  // Ví dụ: 'https://formspree.io/f/YOUR_FORM_ID'
      },

      // 4. Custom Webhook / Email API riêng (Make.com, Zapier, n8n, backend riêng)
      customWebhook: {
        enabled: false,
        url: ''       // Ví dụ: 'https://hook.eu2.make.com/xxxxxxxx'
      }
    }
  };
})(window);
