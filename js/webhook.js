/* ==========================================================================
   LUMIÈN — Validators, Date Formatter & Google Sheets / Webhook Dispatcher
   ========================================================================== */

(function (global) {
  'use strict';

  const App = (global.LumienApp = global.LumienApp || {});
  const GSHEET_STORAGE_KEY = 'lumien_gsheets_url_override_v1';

  /* ------------------------------------------------------------------------
     Validation & Formatting Helpers
     ------------------------------------------------------------------------ */
  App.validators = {
    normalizePhone: function (raw) {
      return String(raw || '').replace(/[\s.\-()]/g, '');
    },

    isValidVNPhone: function (raw) {
      const cleaned = App.validators.normalizePhone(raw);
      return (
        /^(?:(?:\+?84)|0)(?:3|5|7|8|9)\d{8}$/.test(cleaned) ||
        /^(?:(?:\+?84)|0)2\d{8,9}$/.test(cleaned)
      );
    },

    isValidGoogleScriptUrl: function (raw) {
      const value = String(raw || '').trim();
      return /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(value);
    }
  };

  App.formatDateTime = function formatDateTime(isoString) {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (_err) {
      return String(isoString || '');
    }
  };

  function readSavedGoogleSheetsUrl() {
    try {
      return (global.localStorage.getItem(GSHEET_STORAGE_KEY) || '').trim();
    } catch (_err) {
      return '';
    }
  }

  function resolveGoogleSheetsUrl() {
    const wh = (App.CONFIG && App.CONFIG.webhooks) || {};
    if (wh.googleSheets && wh.googleSheets.enabled && wh.googleSheets.url) {
      return String(wh.googleSheets.url).trim();
    }
    return readSavedGoogleSheetsUrl();
  }

  function buildTelegramText(eventType, payload) {
    if (eventType === 'order') {
      const itemsText = payload.items
        .map(function (it) {
          return `• ${it.name} × ${it.qty} (${App.formatVND(it.price * it.qty)})`;
        })
        .join('\n');
      const paymentLabel =
        payload.paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng (COD)';
      return [
        `ĐƠN HÀNG MỚI — ${payload.orderCode}`,
        `Khách hàng: ${payload.customerName}`,
        `SĐT: ${payload.phone}`,
        `Địa chỉ: ${payload.address}`,
        `Thanh toán: ${paymentLabel}`,
        payload.note ? `Ghi chú: ${payload.note}` : '',
        `Sản phẩm:\n${itemsText}`,
        `Tổng thanh toán: ${App.formatVND(payload.total)}`,
        `Thời gian: ${App.formatDateTime(payload.createdAt)}`
      ]
        .filter(Boolean)
        .join('\n');
    }

    if (eventType === 'chat_lead') {
      return [
        `TIN NHẮN TƯ VẤN MỚI — LUMIÈN`,
        `Khách hàng: ${payload.customerName}`,
        `SĐT: ${payload.phone}`,
        `Nội dung: ${payload.message}`,
        `Thời gian: ${App.formatDateTime(payload.createdAt)}`
      ].join('\n');
    }

    return [
      `YÊU CẦU LIÊN HỆ MỚI — LUMIÈN`,
      `Khách hàng: ${payload.customerName}`,
      `SĐT: ${payload.phone}`,
      `Nội dung: ${payload.message}`,
      `Thời gian: ${App.formatDateTime(payload.createdAt)}`
    ].join('\n');
  }

  App.webhook = {
    getGoogleSheetsUrl: function () {
      return resolveGoogleSheetsUrl();
    },

    getGoogleSheetsSource: function () {
      const wh = (App.CONFIG && App.CONFIG.webhooks) || {};
      if (wh.googleSheets && wh.googleSheets.enabled && wh.googleSheets.url) {
        return 'config';
      }
      if (readSavedGoogleSheetsUrl()) {
        return 'local';
      }
      return 'none';
    },

    setGoogleSheetsUrl: function (url) {
      const clean = String(url || '').trim();
      try {
        if (clean) global.localStorage.setItem(GSHEET_STORAGE_KEY, clean);
        else global.localStorage.removeItem(GSHEET_STORAGE_KEY);
      } catch (_err) {
        // Ignore storage errors
      }
      return clean;
    },

    getActiveChannels: function () {
      const wh = (App.CONFIG && App.CONFIG.webhooks) || {};
      const active = [];
      if (resolveGoogleSheetsUrl()) active.push('Google Sheets');
      if (wh.telegram && wh.telegram.enabled && wh.telegram.botToken && wh.telegram.chatId) active.push('Telegram');
      if (wh.formspree && wh.formspree.enabled && wh.formspree.endpoint) active.push('Formspree');
      if (wh.customWebhook && wh.customWebhook.enabled && wh.customWebhook.url) active.push('Custom Webhook');
      return active;
    },

    dispatch: async function (eventType, payload) {
      const wh = (App.CONFIG && App.CONFIG.webhooks) || {};
      const gsheetUrl = resolveGoogleSheetsUrl();

      const envelope = {
        source: 'LUMIÈN Website',
        eventType: eventType,
        sentAt: new Date().toISOString(),
        data: payload
      };

      const tasks = [];

      // 1. Google Sheets Apps Script (text/plain + no-cors tránh lỗi preflight CORS)
      if (gsheetUrl) {
        tasks.push(
          fetch(gsheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(envelope)
          }).catch(function () {})
        );
      }

      // 2. Telegram Bot API
      if (wh.telegram && wh.telegram.enabled && wh.telegram.botToken && wh.telegram.chatId) {
        const tgUrl = `https://api.telegram.org/bot${wh.telegram.botToken}/sendMessage`;
        tasks.push(
          fetch(tgUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: wh.telegram.chatId,
              text: buildTelegramText(eventType, payload)
            })
          }).catch(function () {})
        );
      }

      // 3. Formspree Email Notification
      if (wh.formspree && wh.formspree.enabled && wh.formspree.endpoint) {
        tasks.push(
          fetch(wh.formspree.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            body: JSON.stringify({
              _subject: `[LUMIÈN] Thông báo mới: ${eventType}`,
              summary: buildTelegramText(eventType, payload),
              payload: payload
            })
          }).catch(function () {})
        );
      }

      // 4. Custom Webhook
      if (wh.customWebhook && wh.customWebhook.enabled && wh.customWebhook.url) {
        tasks.push(
          fetch(wh.customWebhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(envelope)
          }).catch(function () {})
        );
      }

      if (tasks.length === 0) {
        return { mode: 'demo_local', sentCount: 0 };
      }

      await Promise.allSettled(tasks);
      return { mode: 'webhook', sentCount: tasks.length };
    },

    testGoogleSheets: async function (explicitUrl) {
      const url = String(explicitUrl || resolveGoogleSheetsUrl()).trim();
      if (!App.validators.isValidGoogleScriptUrl(url)) {
        return {
          ok: false,
          message: 'URL chưa đúng định dạng Google Apps Script (phải bắt đầu bằng https://script.google.com/macros/s/... và kết thúc bằng /exec).'
        };
      }

      try {
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            source: 'LUMIÈN Admin Test',
            eventType: 'test_connection',
            sentAt: new Date().toISOString(),
            data: {
              createdAt: new Date().toISOString(),
              message: 'Kiểm tra kết nối từ Panel Quản lý LUMIÈN thành công!'
            }
          })
        });
        return {
          ok: true,
          message: 'Đã gửi dữ liệu test sang Google Sheets! Hãy mở tab YeuCauLienHe trong file Sheet của bạn để kiểm tra.'
        };
      } catch (_err) {
        return {
          ok: false,
          message: 'Không thể gửi yêu cầu. Vui lòng kiểm tra kết nối mạng và quyền truy cập "Bất kỳ ai" (Anyone) của Web App.'
        };
      }
    }
  };
})(window);
