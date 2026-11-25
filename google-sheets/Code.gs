/**
 * ==========================================================================
 * LUMIÈN — Google Apps Script nhận Đơn hàng, Tin nhắn tư vấn & Liên hệ
 * ==========================================================================
 * Tự động tạo 3 sheet (tab) trong Google Sheets của bạn:
 *   1. DonHang       — Danh sách đơn đặt hàng từ giỏ hàng / Checkout
 *   2. TinNhanTuVan  — Tin nhắn khách để lại SĐT trong khung Live Chat
 *   3. YeuCauLienHe  — Lời nhắn khách gửi từ mục "Liên hệ với chúng tôi"
 *
 * HƯỚNG DẪN CÀI ĐẶT NHANH:
 *   1. Mở Google Sheets mới -> chọn menu "Tiện ích mở rộng" -> "Apps Script".
 *   2. Xóa toàn bộ code mẫu trong Code.gs -> dán toàn bộ file này vào -> Lưu (Ctrl+S).
 *   3. Bấm "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment)
 *      -> Chọn loại "Ứng dụng web" (Web app)
 *      -> Thực thi dưới danh nghĩa: "Tôi" (Me)
 *      -> Ai có quyền truy cập: "Bất kỳ ai" (Anyone)
 *      -> Bấm "Triển khai" và cấp quyền.
 *   4. Copy đường dẫn Web App (https://script.google.com/macros/s/.../exec)
 *      rồi dán vào `js/config.js` (mục webhooks.googleSheets.url, bật enabled: true).
 */

// Dán ID file Google Sheets của bạn vào đây (đoạn nằm giữa /d/ và /edit trên URL Google Sheet).
// Ví dụ URL: https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit
// -> SPREADSHEET_ID = '1AbCdEfGhIjKlMnOpQrStUvWxYz'
// (Nếu để trống '', script sẽ thử lấy Sheet đang gắn trực tiếp với Apps Script.)
const SPREADSHEET_ID = '';

// (Tùy chọn) Điền Gmail chủ shop nếu muốn nhận thêm email báo ngay khi có khách mới.
// Để trống '' nếu chỉ cần lưu vào Google Sheets.
const EMAIL_THONG_BAO = '';

// Múi giờ Việt Nam
const TIMEZONE = 'Asia/Ho_Chi_Minh';

const SHEET_CONFIG = {
  order: {
    name: 'DonHang',
    headers: [
      'Mã đơn',
      'Thời gian đặt',
      'Họ và tên',
      'Số điện thoại',
      'Địa chỉ giao hàng',
      'Sản phẩm & Số lượng',
      'Tạm tính (VNĐ)',
      'Phí ship (VNĐ)',
      'Tổng tiền (VNĐ)',
      'Thanh toán',
      'Ghi chú',
      'Trạng thái'
    ]
  },
  chat_lead: {
    name: 'TinNhanTuVan',
    headers: [
      'Mã tin',
      'Thời gian gửi',
      'Họ và tên',
      'Số điện thoại',
      'Nội dung nhắn',
      'Lịch sử khung chat',
      'Trạng thái'
    ]
  },
  contact: {
    name: 'YeuCauLienHe',
    headers: [
      'Mã liên hệ',
      'Thời gian gửi',
      'Họ và tên',
      'Số điện thoại',
      'Nội dung liên hệ',
      'Trạng thái'
    ]
  }
};

/**
 * Mở URL Web App trên trình duyệt để kiểm tra kết nối nhanh
 */
function doGet() {
  return ContentService
    .createTextOutput(
      JSON.stringify({
        ok: true,
        service: 'LUMIÈN Google Sheets Webhook',
        status: 'READY',
        time: formatVNTime(new Date())
      })
    )
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Nhận dữ liệu POST từ website LUMIÈN
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const rawBody = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    const body = JSON.parse(rawBody);
    const eventType = body.eventType || 'contact';
    const data = body.data || {};
    const timeStr = formatVNTime(data.createdAt ? new Date(data.createdAt) : new Date());

    // Cho phép chủ shop bấm nút "Gửi thử kết nối" từ Panel #admin
    if (eventType === 'test_connection') {
      const sheet = getOrCreateSheet(SHEET_CONFIG.contact);
      sheet.appendRow([
        'TEST-' + Utilities.formatDate(new Date(), TIMEZONE, 'HHmmss'),
        timeStr,
        'Kiểm tra kết nối LUMIÈN',
        "'0908682468",
        data.message || 'Kết nối Google Sheets thành công từ Panel Quản lý!',
        'Đã kiểm tra'
      ]);
      return jsonResponse({ ok: true, eventType: 'test_connection' });
    }

    if (eventType === 'order') {
      const sheet = getOrCreateSheet(SHEET_CONFIG.order);
      const itemsText = Array.isArray(data.items)
        ? data.items.map(function (it) { return it.name + ' x ' + it.qty; }).join('\n')
        : '';
      const paymentLabel =
        data.paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : 'COD (Nhận hàng trả tiền)';

      sheet.appendRow([
        data.orderCode || '',
        timeStr,
        data.customerName || '',
        preservePhone(data.phone),
        data.address || '',
        itemsText,
        Number(data.subtotal) || 0,
        Number(data.shippingFee) || 0,
        Number(data.total) || 0,
        paymentLabel,
        data.note || '',
        'Mới đặt'
      ]);

      sendOptionalEmail(
        '[LUMIÈN] Đơn hàng mới ' + (data.orderCode || ''),
        'Khách hàng: ' + (data.customerName || '') + '\n' +
        'SĐT: ' + (data.phone || '') + '\n' +
        'Địa chỉ: ' + (data.address || '') + '\n' +
        'Sản phẩm:\n' + itemsText + '\n' +
        'Tổng thanh toán: ' + formatVND(data.total) + '\n' +
        'Thanh toán: ' + paymentLabel + '\n' +
        'Ghi chú: ' + (data.note || '(Không có)')
      );
    } else if (eventType === 'chat_lead') {
      const sheet = getOrCreateSheet(SHEET_CONFIG.chat_lead);
      const transcriptText = Array.isArray(data.transcript) ? data.transcript.join('\n') : '';

      sheet.appendRow([
        data.id || '',
        timeStr,
        data.customerName || '',
        preservePhone(data.phone),
        data.message || '',
        transcriptText,
        'Chờ phản hồi'
      ]);

      sendOptionalEmail(
        '[LUMIÈN] Tin nhắn tư vấn mới từ ' + (data.customerName || 'Khách'),
        'Khách hàng: ' + (data.customerName || '') + '\n' +
        'SĐT: ' + (data.phone || '') + '\n' +
        'Nội dung: ' + (data.message || '') + '\n\n' +
        'Lịch sử chat:\n' + transcriptText
      );
    } else {
      const sheet = getOrCreateSheet(SHEET_CONFIG.contact);

      sheet.appendRow([
        data.id || '',
        timeStr,
        data.customerName || '',
        preservePhone(data.phone),
        data.message || '',
        'Chờ phản hồi'
      ]);

      sendOptionalEmail(
        '[LUMIÈN] Yêu cầu liên hệ mới từ ' + (data.customerName || 'Khách'),
        'Khách hàng: ' + (data.customerName || '') + '\n' +
        'SĐT: ' + (data.phone || '') + '\n' +
        'Nội dung: ' + (data.message || '')
      );
    }

    return jsonResponse({ ok: true, eventType: eventType });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ==========================================================================
   Hàm hỗ trợ định dạng Sheet tự động
   ========================================================================== */
function getSpreadsheet() {
  if (SPREADSHEET_ID && String(SPREADSHEET_ID).trim()) {
    return SpreadsheetApp.openById(String(SPREADSHEET_ID).trim());
  }
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error(
      'Chưa gắn được file Google Sheets. Hãy điền SPREADSHEET_ID ở đầu file Code.gs (đoạn nằm giữa /d/ và /edit trên đường dẫn Google Sheet).'
    );
  }
  return active;
}

function getOrCreateSheet(cfg) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(cfg.name);

  if (!sheet) {
    sheet = ss.insertSheet(cfg.name);
    const headerRange = sheet.getRange(1, 1, 1, cfg.headers.length);
    headerRange.setValues([cfg.headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#FDF5D7');
    headerRange.setFontColor('#4A3F35');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, cfg.headers.length);
  }

  return sheet;
}

// Giữ nguyên số 0 ở đầu số điện thoại Việt Nam trong Google Sheets
function preservePhone(phone) {
  const clean = String(phone || '').trim();
  return clean ? "'" + clean : '';
}

function formatVNTime(date) {
  return Utilities.formatDate(date, TIMEZONE, 'HH:mm dd/MM/yyyy');
}

function formatVND(amount) {
  return Number(amount || 0).toLocaleString('vi-VN') + 'đ';
}

function sendOptionalEmail(subject, body) {
  if (!EMAIL_THONG_BAO) return;
  try {
    MailApp.sendEmail(EMAIL_THONG_BAO, subject, body);
  } catch (_err) {
    // Bỏ qua nếu chưa cấp quyền MailApp
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
