/* ==========================================================================
   LUMIÈN Seller Studio — Full-Featured Store Management Console
   Access: #admin URL hash, Ctrl+Shift+A, or 5 rapid taps on footer copyright.
   Modules: Tổng quan, Đơn hàng, Tin nhắn tư vấn, Yêu cầu liên hệ, Khách hàng, Cài đặt
   ========================================================================== */

(function (global) {
  'use strict';

  const App = (global.LumienApp = global.LumienApp || {});
  const AUTH_SESSION_KEY = 'lumien_admin_unlocked_v1';

  const adminState = {
    isOpen: false,
    isAuthenticated: false,
    activeTab: 'overview', // 'overview' | 'orders' | 'chats' | 'contacts' | 'customers' | 'settings'
    orderFilter: 'all',
    paymentFilter: 'all',
    leadFilter: 'all',
    searchQuery: '',
    showManualOrderForm: false
  };

  const els = {};

  function checkSessionAuth() {
    try {
      return global.sessionStorage.getItem(AUTH_SESSION_KEY) === '1';
    } catch (_err) {
      return false;
    }
  }

  function saveSessionAuth(val) {
    try {
      if (val) global.sessionStorage.setItem(AUTH_SESSION_KEY, '1');
      else global.sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch (_err) {}
  }

  function normalizeSearch(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
  }

  function getStatusMeta(list, value) {
    return (
      list.find(function (s) {
        return s.value === value;
      }) || list[0]
    );
  }

  function buildZaloHref(phone) {
    const clean = App.validators ? App.validators.normalizePhone(phone) : String(phone || '').replace(/\D/g, '');
    return 'https://zalo.me/' + encodeURIComponent(clean.replace(/^\+?84/, '0'));
  }

  function buildTelHref(phone) {
    const clean = App.validators ? App.validators.normalizePhone(phone) : String(phone || '').replace(/\D/g, '');
    return 'tel:' + clean;
  }

  /* ------------------------------------------------------------------------
     CSV (UTF-8 BOM for Vietnamese Excel) & JSON Export Helpers
     ------------------------------------------------------------------------ */
  function csvCell(val) {
    const text = String(val == null ? '' : val).replace(/"/g, '""');
    return `"${text}"`;
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportOrdersCSV() {
    const orders = App.store.getState().orders;
    if (orders.length === 0) {
      if (App.showToast) App.showToast('Chưa có đơn hàng nào để xuất Excel.');
      return;
    }

    const headers = [
      'Mã đơn',
      'Thời gian',
      'Kênh đặt',
      'Họ tên',
      'Số điện thoại',
      'Địa chỉ',
      'Sản phẩm',
      'Tạm tính',
      'Phí ship',
      'Tổng tiền',
      'Thanh toán',
      'Trạng thái',
      'Ghi chú khách',
      'Ghi chú nội bộ'
    ];

    const rows = orders.map(function (o) {
      const itemsText = (o.items || [])
        .map(function (it) {
          return `${it.name} x ${it.qty}`;
        })
        .join('; ');
      const statusLabel = getStatusMeta(App.ORDER_STATUSES, o.status).label;
      return [
        o.orderCode,
        App.formatDateTime(o.createdAt),
        o.channel || 'Website',
        o.customerName,
        "'" + o.phone,
        o.address,
        itemsText,
        o.subtotal,
        o.shippingFee,
        o.total,
        o.paymentMethod === 'bank' ? 'Chuyển khoản' : 'COD',
        statusLabel,
        o.note || '',
        o.internalNote || ''
      ]
        .map(csvCell)
        .join(',');
    });

    const csv = '\uFEFF' + [headers.map(csvCell).join(',')].concat(rows).join('\r\n');
    downloadFile(csv, `lumien-don-hang-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    if (App.showToast) App.showToast(`Đã xuất ${orders.length} đơn hàng ra file Excel (CSV)!`);
  }

  function exportLeadsCSV(type) {
    const state = App.store.getState();
    const list = type === 'chats' ? state.chatLeads : state.contacts;
    if (list.length === 0) {
      if (App.showToast) App.showToast('Chưa có dữ liệu để xuất.');
      return;
    }

    const headers = ['Mã', 'Thời gian', 'Họ tên', 'Số điện thoại', 'Nội dung', 'Trạng thái', 'Ghi chú nội bộ'];
    const rows = list.map(function (item) {
      const statusLabel = getStatusMeta(App.LEAD_STATUSES, item.status).label;
      return [
        item.id,
        App.formatDateTime(item.createdAt),
        item.customerName,
        "'" + item.phone,
        item.message,
        statusLabel,
        item.sellerNote || ''
      ]
        .map(csvCell)
        .join(',');
    });

    const csv = '\uFEFF' + [headers.map(csvCell).join(',')].concat(rows).join('\r\n');
    const prefix = type === 'chats' ? 'lumien-tu-van' : 'lumien-lien-he';
    downloadFile(csv, `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    if (App.showToast) App.showToast('Đã xuất dữ liệu ra file Excel (CSV)!');
  }

  function exportAllJSON() {
    const state = App.store.getState();
    const payload = {
      exportedAt: new Date().toISOString(),
      store: App.STORE_INFO.brandName,
      orders: state.orders,
      chatLeads: state.chatLeads,
      contacts: state.contacts
    };
    downloadFile(
      JSON.stringify(payload, null, 2),
      `lumien-sao-luu-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
    if (App.showToast) App.showToast('Đã tải xuống bản sao lưu JSON!');
  }

  /* ------------------------------------------------------------------------
     Printable Packing Slip / Mini Shipping Invoice
     ------------------------------------------------------------------------ */
  function printOrderSlip(orderCode) {
    const order = App.store.getState().orders.find(function (o) {
      return o.orderCode === orderCode;
    });
    if (!order) return;

    const win = global.open('', '_blank', 'width=640,height=780');
    if (!win) {
      if (App.showToast) App.showToast('Trình duyệt đang chặn cửa sổ in — vui lòng cho phép popup.');
      return;
    }

    const itemsRows = (order.items || [])
      .map(function (it) {
        return `
          <tr>
            <td>${App.escapeHTML(it.name)} (LUMIÈN)</td>
            <td style="text-align:center;">${it.qty}</td>
            <td style="text-align:right;">${App.formatVND(it.price * it.qty)}</td>
          </tr>
        `;
      })
      .join('');

    const codLabel =
      order.paymentMethod === 'bank'
        ? '0₫ (KHÁCH ĐÃ / CHỌN CHUYỂN KHOẢN)'
        : App.formatVND(order.total);

    win.document.write(`<!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Phiếu giao hàng ${App.escapeHTML(order.orderCode)}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #2D2620; padding: 24px; max-width: 560px; margin: 0 auto; }
          .slip { border: 2px solid #4A3F35; border-radius: 12px; padding: 20px; }
          .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px dashed #999; padding-bottom: 12px; margin-bottom: 14px; }
          .brand { font-size: 20px; font-weight: 700; letter-spacing: 0.08em; }
          .sub { font-size: 12px; color: #666; }
          .code { font-family: Consolas, monospace; font-size: 16px; font-weight: 700; }
          .box { background: #FFFDF7; border: 1px solid #DFCFA2; border-radius: 8px; padding: 12px; margin-bottom: 14px; font-size: 13px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px; }
          th, td { border-bottom: 1px solid #E5DFD5; padding: 8px 4px; text-align: left; }
          th { background: #FDF5D7; }
          .cod { border: 2px dashed #C99A3B; background: #FDF5D7; border-radius: 8px; padding: 12px; text-align: center; margin-top: 12px; }
          .cod-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #726558; }
          .cod-val { font-size: 22px; font-weight: 700; color: #4A3F35; margin-top: 4px; }
          .foot { text-align: center; font-size: 11px; color: #777; margin-top: 14px; }
          @media print { .no-print { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="slip">
          <div class="head">
            <div>
              <div class="brand">LUMIÈN STUDIO</div>
              <div class="sub">Hotline: ${App.escapeHTML(App.STORE_INFO.phone)}</div>
              <div class="sub">${App.escapeHTML(App.STORE_INFO.address)}</div>
            </div>
            <div style="text-align:right;">
              <div class="sub">MÃ ĐƠN HÀNG</div>
              <div class="code">${App.escapeHTML(order.orderCode)}</div>
              <div class="sub">${App.escapeHTML(App.formatDateTime(order.createdAt))}</div>
            </div>
          </div>

          <div class="box">
            <div><strong>Người nhận:</strong> ${App.escapeHTML(order.customerName)}</div>
            <div><strong>Số điện thoại:</strong> ${App.escapeHTML(order.phone)}</div>
            <div><strong>Địa chỉ:</strong> ${App.escapeHTML(order.address)}</div>
            ${order.note ? `<div><strong>Ghi chú khách:</strong> ${App.escapeHTML(order.note)}</div>` : ''}
            ${order.internalNote ? `<div><strong>Ghi chú đóng gói:</strong> ${App.escapeHTML(order.internalNote)}</div>` : ''}
          </div>

          <table>
            <thead>
              <tr><th>Sản phẩm</th><th style="text-align:center;">SL</th><th style="text-align:right;">Thành tiền</th></tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>

          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
            <span>Phí giao hàng:</span>
            <span>${order.shippingFee === 0 ? 'Miễn phí' : App.formatVND(order.shippingFee)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:700;">
            <span>Tổng giá trị đơn:</span>
            <span>${App.formatVND(order.total)}</span>
          </div>

          <div class="cod">
            <div class="cod-label">Tiền thu hộ người nhận (COD)</div>
            <div class="cod-val">${codLabel}</div>
          </div>

          <div class="foot">Hàng dễ vỡ (thủy tinh) · Vui lòng nhẹ tay · Cho khách kiểm tra hàng trước khi thanh toán</div>
        </div>
        <div class="no-print" style="text-align:center;margin-top:16px;">
          <button onclick="window.print()" style="padding:10px 22px;border-radius:999px;background:#4A3F35;color:#FFFDF7;border:none;cursor:pointer;font-weight:600;">In phiếu giao hàng</button>
        </div>
      </body>
      </html>`);
    win.document.close();
  }

  /* ------------------------------------------------------------------------
     Tab Renderers
     ------------------------------------------------------------------------ */
  function renderOverviewTab(analytics) {
    const scentRows = analytics.scentBreakdown
      .map(function (s) {
        const product = App.getProductById(s.id);
        return `
          <div class="admin-scent-bar-item">
            <div class="admin-scent-bar-top">
              <div class="admin-scent-identity">
                ${product ? `<img class="admin-scent-thumb" src="${App.escapeHTML(product.image)}" alt="${App.escapeHTML(s.name)}" />` : ''}
                <div>
                  <strong>${App.escapeHTML(s.name)}</strong>
                  <span>${s.units} bộ · ${App.formatVND(s.revenue)}</span>
                </div>
              </div>
              <strong class="admin-scent-pct">${s.percent}%</strong>
            </div>
            <div class="admin-progress-track">
              <div class="admin-progress-fill admin-progress-fill--${App.escapeHTML(s.id)}" style="width:${s.percent}%"></div>
            </div>
          </div>
        `;
      })
      .join('');

    const funnelRows = App.ORDER_STATUSES.map(function (st) {
      const count = analytics.statusCounts[st.value] || 0;
      const pct = analytics.ordersCount > 0 ? Math.round((count / analytics.ordersCount) * 100) : 0;
      return `
        <button type="button" class="admin-funnel-row" data-admin-jump-order-status="${st.value}">
          <span class="admin-status-badge admin-status-badge--${st.tone}">${App.escapeHTML(st.label)}</span>
          <div class="admin-funnel-track">
            <div class="admin-funnel-fill admin-funnel-fill--${st.tone}" style="width:${pct}%"></div>
          </div>
          <strong class="admin-funnel-count">${count}</strong>
        </button>
      `;
    }).join('');

    const activityHTML =
      analytics.recentActivity.length > 0
        ? analytics.recentActivity
            .map(function (ev) {
              const iconLabel = ev.type === 'order' ? 'Đơn' : ev.type === 'chat' ? 'Chat' : 'LH';
              return `
                <button type="button" class="admin-activity-row" data-admin-tab="${ev.tab}">
                  <span class="admin-activity-pill admin-activity-pill--${ev.type}">${iconLabel}</span>
                  <div class="admin-activity-info">
                    <strong>${App.escapeHTML(ev.title)}</strong>
                    <span>${App.escapeHTML(ev.meta)}</span>
                  </div>
                  <time class="admin-record-time">${App.escapeHTML(App.formatDateTime(ev.createdAt))}</time>
                </button>
              `;
            })
            .join('')
        : `<div class="admin-empty-compact">Chưa có hoạt động gần đây. Khi có đơn hàng hoặc tin nhắn mới, dòng thời gian sẽ hiện tại đây.</div>`;

    return `
      <div class="admin-page-head">
        <div>
          <h3>Tổng quan kinh doanh</h3>
          <p>Theo dõi nhanh doanh thu, tình trạng đơn hàng và phản hồi khách hàng.</p>
        </div>
        <div class="admin-head-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-admin-action="export-orders-csv">
            Xuất Excel đơn hàng
          </button>
          <button type="button" class="btn btn-primary btn-sm" data-admin-action="open-manual-order">
            + Tạo đơn thủ công
          </button>
        </div>
      </div>

      <div class="admin-stats-grid">
        <div class="admin-stat-card admin-stat-card--accent">
          <span class="admin-stat-label">Doanh thu tạm tính</span>
          <strong class="admin-stat-value">${App.formatVND(analytics.grossRevenue)}</strong>
          <span class="admin-stat-sub">Hoàn thành: ${App.formatVND(analytics.completedRevenue)}</span>
        </div>
        <div class="admin-stat-card">
          <span class="admin-stat-label">Tổng đơn hàng</span>
          <strong class="admin-stat-value">${analytics.ordersCount}</strong>
          <span class="admin-stat-sub">${analytics.statusCounts.new} đơn mới · ${analytics.totalUnits} bộ sản phẩm</span>
        </div>
        <div class="admin-stat-card">
          <span class="admin-stat-label">Giá trị đơn trung bình</span>
          <strong class="admin-stat-value">${App.formatVND(analytics.avgOrderValue)}</strong>
          <span class="admin-stat-sub">Bộ đèn 190.000₫ · Nến lẻ 45.000₫</span>
        </div>
        <div class="admin-stat-card">
          <span class="admin-stat-label">Khách chờ phản hồi</span>
          <strong class="admin-stat-value">${analytics.pendingTotalLeads}</strong>
          <span class="admin-stat-sub">${analytics.pendingChatsCount} tư vấn · ${analytics.pendingContactsCount} liên hệ</span>
        </div>
      </div>

      <div class="admin-analytics-grid">
        <section class="admin-panel-card">
          <div class="admin-panel-card-head">
            <h4>Hiệu suất theo mùi hương</h4>
            <span>Tỷ lệ bộ đã bán</span>
          </div>
          <div class="admin-scent-bars">${scentRows}</div>
        </section>

        <section class="admin-panel-card">
          <div class="admin-panel-card-head">
            <h4>Trạng thái xử lý đơn</h4>
            <span>Bấm để lọc nhanh</span>
          </div>
          <div class="admin-funnel-list">${funnelRows}</div>
        </section>
      </div>

      <section class="admin-panel-card">
        <div class="admin-panel-card-head">
          <h4>Hoạt động mới nhất</h4>
          <span>Cập nhật tức thì</span>
        </div>
        <div class="admin-activity-list">${activityHTML}</div>
      </section>
    `;
  }

  function renderManualOrderForm() {
    if (!adminState.showManualOrderForm) return '';

    const productInputs = App.PRODUCTS.map(function (p) {
      return `
        <label class="manual-scent-picker">
          <img src="${App.escapeHTML(p.image)}" alt="${App.escapeHTML(p.name)}" />
          <span class="manual-scent-info">
            <strong>${App.escapeHTML(p.name)}</strong>
            <small>${App.formatVND(p.price)}</small>
          </span>
          <input
            type="number"
            min="0"
            max="50"
            value="${p.id === 'ocean' ? '1' : '0'}"
            name="qty_${App.escapeHTML(p.id)}"
            class="form-input manual-qty-input"
          />
        </label>
      `;
    }).join('');

    return `
      <form class="admin-manual-order-card" id="admin-manual-order-form" novalidate>
        <div class="admin-manual-order-head">
          <div>
            <h4>Tạo đơn hàng thủ công</h4>
            <p>Dùng khi khách chốt qua Zalo, gọi điện hoặc mua trực tiếp — đơn sẽ tự đẩy lên Google Sheets.</p>
          </div>
          <button type="button" class="btn btn-outline btn-sm" data-admin-action="toggle-manual-order">Đóng</button>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Họ và tên khách *</label>
            <input class="form-input" name="customerName" type="text" placeholder="Ví dụ: Nguyễn Lan Anh" required />
          </div>
          <div class="form-group">
            <label class="form-label">Số điện thoại *</label>
            <input class="form-input" name="phone" type="tel" placeholder="Ví dụ: 0908 123 456" required />
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Địa chỉ giao hàng *</label>
            <input class="form-input" name="address" type="text" placeholder="Số nhà, đường, quận/huyện, tỉnh/thành" required />
          </div>
          <div class="form-group">
            <label class="form-label">Kênh chốt &amp; Thanh toán</label>
            <div class="manual-inline-selects">
              <select class="form-input" name="channel">
                <option value="Zalo">Chốt qua Zalo</option>
                <option value="Hotline">Chốt qua Hotline</option>
                <option value="Facebook">Chốt qua Facebook</option>
                <option value="Tại cửa hàng">Mua tại cửa hàng</option>
              </select>
              <select class="form-input" name="paymentMethod">
                <option value="cod">COD</option>
                <option value="bank">Chuyển khoản</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-group">
          <span class="form-label">Chọn số lượng từng mùi hương</span>
          <div class="manual-scent-grid">${productInputs}</div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Ghi chú của khách</label>
            <input class="form-input" name="note" type="text" placeholder="VD: Gói quà, giao giờ hành chính..." />
          </div>
          <div class="form-group">
            <label class="form-label">Ghi chú nội bộ shop</label>
            <input class="form-input" name="internalNote" type="text" placeholder="VD: Đã cọc, mã vận đơn..." />
          </div>
        </div>

        <div class="manual-order-footer">
          <label class="manual-checkbox">
            <input type="checkbox" name="freeShip" />
            <span>Miễn phí giao hàng cho đơn này</span>
          </label>
          <div class="admin-head-actions">
            <span class="field-error" id="manual-order-error" hidden></span>
            <button type="submit" class="btn btn-primary btn-sm">Lưu đơn &amp; đồng bộ Sheet</button>
          </div>
        </div>
      </form>
    `;
  }

  function renderOrderCardsList() {
    const orders = App.store.getState().orders;
    const q = normalizeSearch(adminState.searchQuery);

    const filtered = orders.filter(function (o) {
      if (adminState.orderFilter !== 'all' && o.status !== adminState.orderFilter) return false;
      if (adminState.paymentFilter !== 'all' && o.paymentMethod !== adminState.paymentFilter) return false;
      if (q) {
        const hay = normalizeSearch(`${o.orderCode} ${o.customerName} ${o.phone} ${o.address} ${o.note || ''} ${o.internalNote || ''}`);
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      return `
        <div class="admin-empty-state">
          <p>Không tìm thấy đơn hàng phù hợp.</p>
          <span>Thử đổi bộ lọc hoặc bấm "+ Tạo đơn thủ công" để thêm đơn chốt qua Zalo/Hotline.</span>
        </div>
      `;
    }

    return `<div class="admin-records-list">${filtered
      .map(function (order) {
        const meta = getStatusMeta(App.ORDER_STATUSES, order.status);
        const paymentText = order.paymentMethod === 'bank' ? 'Chuyển khoản' : 'COD';
        const itemsText = (order.items || [])
          .map(function (it) {
            return `<li><span>${App.escapeHTML(it.name)} × <strong>${it.qty}</strong></span><span>${App.formatVND(it.price * it.qty)}</span></li>`;
          })
          .join('');

        const statusOptions = App.ORDER_STATUSES.map(function (s) {
          const selected = s.value === order.status ? ' selected' : '';
          return `<option value="${s.value}"${selected}>${App.escapeHTML(s.label)}</option>`;
        }).join('');

        return `
          <article class="admin-record-card">
            <div class="admin-record-head">
              <div class="admin-record-title-group">
                <strong class="admin-order-code">${App.escapeHTML(order.orderCode)}</strong>
                <span class="admin-status-badge admin-status-badge--${meta.tone}">${App.escapeHTML(meta.label)}</span>
                <span class="admin-channel-tag">${App.escapeHTML(order.channel || 'Website')}</span>
                <span class="admin-channel-tag">${App.escapeHTML(paymentText)}</span>
                <span class="admin-record-time">${App.escapeHTML(App.formatDateTime(order.createdAt))}</span>
              </div>
              <div class="admin-record-controls">
                <select
                  class="admin-status-select"
                  data-admin-order-status="${App.escapeHTML(order.orderCode)}"
                  aria-label="Cập nhật trạng thái đơn ${App.escapeHTML(order.orderCode)}"
                >${statusOptions}</select>
                <button
                  type="button"
                  class="admin-mini-btn"
                  data-admin-print-order="${App.escapeHTML(order.orderCode)}"
                  title="In phiếu giao hàng"
                >In phiếu</button>
                <button
                  type="button"
                  class="admin-mini-btn"
                  data-admin-resync-order="${App.escapeHTML(order.orderCode)}"
                  title="Đẩy lại đơn này lên Google Sheets"
                >Đẩy Sheet</button>
                <button
                  type="button"
                  class="admin-delete-btn"
                  data-admin-delete-order="${App.escapeHTML(order.orderCode)}"
                >Xóa</button>
              </div>
            </div>

            <div class="admin-order-grid">
              <div class="admin-order-customer">
                <p><strong>Khách hàng:</strong> ${App.escapeHTML(order.customerName)}</p>
                <p class="admin-phone-line">
                  <strong>SĐT:</strong>
                  <a class="admin-phone-link" href="${buildTelHref(order.phone)}">${App.escapeHTML(order.phone)}</a>
                  <a class="admin-quick-pill" href="${buildTelHref(order.phone)}">Gọi</a>
                  <a class="admin-quick-pill" href="${buildZaloHref(order.phone)}" target="_blank" rel="noopener noreferrer">Zalo</a>
                </p>
                <p><strong>Địa chỉ:</strong> ${App.escapeHTML(order.address)}</p>
                ${order.note ? `<p><strong>Ghi chú khách:</strong> ${App.escapeHTML(order.note)}</p>` : ''}
              </div>

              <div class="admin-order-items-box">
                <ul class="admin-order-items">${itemsText}</ul>
                <div class="admin-order-total-row">
                  <span>Phí ship: ${order.shippingFee === 0 ? 'Miễn phí' : App.formatVND(order.shippingFee)}</span>
                  <strong>Tổng: ${App.formatVND(order.total)}</strong>
                </div>
              </div>
            </div>

            <div class="admin-internal-note-row">
              <input
                type="text"
                class="admin-note-input"
                value="${App.escapeHTML(order.internalNote || '')}"
                placeholder="Thêm ghi chú nội bộ (mã vận đơn, giờ giao, đã xác nhận...)"
                data-order-note-input="${App.escapeHTML(order.orderCode)}"
              />
              <button
                type="button"
                class="admin-mini-btn"
                data-admin-save-order-note="${App.escapeHTML(order.orderCode)}"
              >Lưu ghi chú</button>
            </div>
          </article>
        `;
      })
      .join('')}</div>`;
  }

  function renderOrdersTab() {
    const orders = App.store.getState().orders;
    const filterBtns = [
      { value: 'all', label: `Tất cả (${orders.length})` },
      { value: 'new', label: 'Mới đặt' },
      { value: 'confirmed', label: 'Đã xác nhận' },
      { value: 'shipping', label: 'Đang giao' },
      { value: 'completed', label: 'Hoàn thành' },
      { value: 'cancelled', label: 'Đã hủy' }
    ]
      .map(function (f) {
        const active = adminState.orderFilter === f.value ? ' is-active' : '';
        return `<button type="button" class="admin-filter-chip${active}" data-admin-order-filter="${f.value}">${App.escapeHTML(f.label)}</button>`;
      })
      .join('');

    return `
      <div class="admin-page-head">
        <div>
          <h3>Quản lý đơn hàng</h3>
          <p>Tìm kiếm, cập nhật trạng thái, in phiếu giao hàng và ghi chú vận đơn.</p>
        </div>
        <div class="admin-head-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-admin-action="export-orders-csv">
            Xuất Excel (CSV)
          </button>
          <button type="button" class="btn btn-primary btn-sm" data-admin-action="toggle-manual-order">
            ${adminState.showManualOrderForm ? 'Ẩn form tạo đơn' : '+ Tạo đơn thủ công'}
          </button>
        </div>
      </div>

      ${renderManualOrderForm()}

      <div class="admin-toolbar">
        <input
          type="search"
          class="form-input admin-search-input"
          id="admin-search-input"
          value="${App.escapeHTML(adminState.searchQuery)}"
          placeholder="Tìm mã đơn, tên khách, SĐT, địa chỉ..."
        />
        <select class="form-input admin-payment-filter" id="admin-payment-filter" aria-label="Lọc theo phương thức thanh toán">
          <option value="all"${adminState.paymentFilter === 'all' ? ' selected' : ''}>Tất cả thanh toán</option>
          <option value="cod"${adminState.paymentFilter === 'cod' ? ' selected' : ''}>Thanh toán COD</option>
          <option value="bank"${adminState.paymentFilter === 'bank' ? ' selected' : ''}>Chuyển khoản</option>
        </select>
      </div>

      <div class="admin-filter-row">${filterBtns}</div>
      <div id="admin-list-slot">${renderOrderCardsList()}</div>
    `;
  }

  function renderLeadCardsList(type) {
    const state = App.store.getState();
    const rawList = type === 'chats' ? state.chatLeads : state.contacts;
    const q = normalizeSearch(adminState.searchQuery);

    const filtered = rawList.filter(function (item) {
      if (adminState.leadFilter !== 'all' && item.status !== adminState.leadFilter) return false;
      if (q) {
        const hay = normalizeSearch(`${item.customerName} ${item.phone} ${item.message} ${item.sellerNote || ''}`);
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      return `
        <div class="admin-empty-state">
          <p>Chưa có ${type === 'chats' ? 'tin nhắn tư vấn' : 'yêu cầu liên hệ'} nào phù hợp.</p>
          <span>Dữ liệu mới từ khách hàng sẽ tự động hiển thị tại đây và đồng bộ về Google Sheets.</span>
        </div>
      `;
    }

    return `<div class="admin-records-list">${filtered
      .map(function (item) {
        const meta = getStatusMeta(App.LEAD_STATUSES, item.status);
        const options = App.LEAD_STATUSES.map(function (s) {
          const selected = s.value === item.status ? ' selected' : '';
          return `<option value="${s.value}"${selected}>${App.escapeHTML(s.label)}</option>`;
        }).join('');

        const transcriptHTML =
          type === 'chats' && item.transcript && item.transcript.length > 0
            ? `
              <details class="admin-transcript">
                <summary>Xem lại lịch sử khung chat (${item.transcript.length} dòng)</summary>
                <ul>
                  ${item.transcript
                    .map(function (line) {
                      return `<li>${App.escapeHTML(line)}</li>`;
                    })
                    .join('')}
                </ul>
              </details>
            `
            : '';

        const statusAttr = type === 'chats' ? 'data-admin-chat-status' : 'data-admin-contact-status';
        const delAttr = type === 'chats' ? 'data-admin-delete-chat' : 'data-admin-delete-contact';
        const noteInputAttr = type === 'chats' ? 'data-chat-note-input' : 'data-contact-note-input';
        const noteSaveAttr = type === 'chats' ? 'data-admin-save-chat-note' : 'data-admin-save-contact-note';

        return `
          <article class="admin-record-card">
            <div class="admin-record-head">
              <div class="admin-record-title-group">
                <strong>${App.escapeHTML(item.customerName)}</strong>
                <a class="admin-phone-link" href="${buildTelHref(item.phone)}">${App.escapeHTML(item.phone)}</a>
                <a class="admin-quick-pill" href="${buildTelHref(item.phone)}">Gọi</a>
                <a class="admin-quick-pill" href="${buildZaloHref(item.phone)}" target="_blank" rel="noopener noreferrer">Zalo</a>
                <span class="admin-status-badge admin-status-badge--${meta.tone}">${App.escapeHTML(meta.label)}</span>
                <span class="admin-record-time">${App.escapeHTML(App.formatDateTime(item.createdAt))}</span>
              </div>
              <div class="admin-record-controls">
                <select class="admin-status-select" ${statusAttr}="${App.escapeHTML(item.id)}">${options}</select>
                <button type="button" class="admin-delete-btn" ${delAttr}="${App.escapeHTML(item.id)}">Xóa</button>
              </div>
            </div>

            <p class="admin-lead-message">${App.escapeHTML(item.message)}</p>
            ${transcriptHTML}

            <div class="admin-internal-note-row">
              <input
                type="text"
                class="admin-note-input"
                value="${App.escapeHTML(item.sellerNote || '')}"
                placeholder="Ghi chú chăm sóc (đã gọi, khách hẹn đặt, tư vấn mùi...)"
                ${noteInputAttr}="${App.escapeHTML(item.id)}"
              />
              <button type="button" class="admin-mini-btn" ${noteSaveAttr}="${App.escapeHTML(item.id)}">Lưu ghi chú</button>
            </div>
          </article>
        `;
      })
      .join('')}</div>`;
  }

  function renderLeadsTab(type) {
    const isChat = type === 'chats';
    const title = isChat ? 'Tin nhắn tư vấn (Live Chat)' : 'Yêu cầu liên hệ';
    const sub = isChat
      ? 'Khách để lại Tên & SĐT trong khung chat tư vấn, kèm lịch sử câu hỏi đã trao đổi.'
      : 'Lời nhắn khách gửi trực tiếp từ mục "Liên hệ với chúng tôi".';

    const chips = [
      { value: 'all', label: 'Tất cả' },
      { value: 'pending', label: 'Chờ phản hồi' },
      { value: 'replied', label: 'Đã liên hệ' }
    ]
      .map(function (c) {
        const active = adminState.leadFilter === c.value ? ' is-active' : '';
        return `<button type="button" class="admin-filter-chip${active}" data-admin-lead-filter="${c.value}">${c.label}</button>`;
      })
      .join('');

    return `
      <div class="admin-page-head">
        <div>
          <h3>${title}</h3>
          <p>${sub}</p>
        </div>
        <div class="admin-head-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-admin-action="${isChat ? 'export-chats-csv' : 'export-contacts-csv'}">
            Xuất Excel (CSV)
          </button>
        </div>
      </div>

      <div class="admin-toolbar">
        <input
          type="search"
          class="form-input admin-search-input"
          id="admin-search-input"
          value="${App.escapeHTML(adminState.searchQuery)}"
          placeholder="Tìm theo tên khách, SĐT hoặc nội dung..."
        />
      </div>

      <div class="admin-filter-row">${chips}</div>
      <div id="admin-list-slot">${renderLeadCardsList(type)}</div>
    `;
  }

  function renderCustomersList() {
    const customers = App.store.getCustomerDirectory();
    const q = normalizeSearch(adminState.searchQuery);

    const filtered = customers.filter(function (c) {
      if (!q) return true;
      return normalizeSearch(`${c.name} ${c.phone} ${c.favoriteScent}`).indexOf(q) !== -1;
    });

    if (filtered.length === 0) {
      return `
        <div class="admin-empty-state">
          <p>Chưa có dữ liệu khách hàng.</p>
          <span>Danh bạ sẽ tự động tổng hợp từ tất cả khách đặt hàng, nhắn Live Chat và gửi Liên hệ.</span>
        </div>
      `;
    }

    const rows = filtered
      .map(function (c) {
        const sourcePills = c.sources
          .map(function (s) {
            return `<span class="admin-channel-tag">${App.escapeHTML(s)}</span>`;
          })
          .join('');
        return `
          <article class="admin-customer-card">
            <div class="admin-customer-main">
              <div class="admin-customer-avatar">${App.escapeHTML(c.name.charAt(0).toUpperCase())}</div>
              <div>
                <strong>${App.escapeHTML(c.name)}</strong>
                <div class="admin-phone-line">
                  <a class="admin-phone-link" href="${buildTelHref(c.phone)}">${App.escapeHTML(c.phone)}</a>
                  <a class="admin-quick-pill" href="${buildTelHref(c.phone)}">Gọi</a>
                  <a class="admin-quick-pill" href="${buildZaloHref(c.phone)}" target="_blank" rel="noopener noreferrer">Zalo</a>
                </div>
                <div class="admin-customer-sources">${sourcePills}</div>
              </div>
            </div>
            <div class="admin-customer-metrics">
              <div>
                <span>Số đơn</span>
                <strong>${c.orderCount}</strong>
              </div>
              <div>
                <span>Tổng chi tiêu</span>
                <strong class="text-honey">${App.formatVND(c.totalSpent)}</strong>
              </div>
              <div>
                <span>Mùi ưa thích</span>
                <strong>${App.escapeHTML(c.favoriteScent)}</strong>
              </div>
              <div>
                <span>Gần nhất</span>
                <small>${App.escapeHTML(App.formatDateTime(c.lastActivity))}</small>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    return `<div class="admin-records-list">${rows}</div>`;
  }

  function renderCustomersTab() {
    return `
      <div class="admin-page-head">
        <div>
          <h3>Danh bạ khách hàng</h3>
          <p>Tự động gom lịch sử mua hàng, tổng chi tiêu và mùi hương ưa thích theo từng số điện thoại.</p>
        </div>
      </div>

      <div class="admin-toolbar">
        <input
          type="search"
          class="form-input admin-search-input"
          id="admin-search-input"
          value="${App.escapeHTML(adminState.searchQuery)}"
          placeholder="Tìm tên khách, số điện thoại hoặc mùi hương..."
        />
      </div>

      <div id="admin-list-slot">${renderCustomersList()}</div>
    `;
  }

  function renderSettingsTab() {
    const sheetUrl = (App.CONFIG && App.CONFIG.googleSheetViewUrl) || '';
    const activeChannels = App.webhook ? App.webhook.getActiveChannels() : [];
    const syncConnected = activeChannels.length > 0;

    return `
      <div class="admin-page-head">
        <div>
          <h3>Cài đặt &amp; Sao lưu</h3>
          <p>Quản lý đồng bộ dữ liệu, xuất báo cáo và bảo mật đăng nhập cửa hàng.</p>
        </div>
      </div>

      <div class="admin-settings-grid">
        <section class="admin-panel-card">
          <div class="admin-panel-card-head">
            <h4>Đồng bộ Google Sheets</h4>
            <span class="admin-status-badge ${syncConnected ? 'admin-status-badge--green' : 'admin-status-badge--gold'}">
              ${syncConnected ? 'Đang hoạt động' : 'Chưa kích hoạt'}
            </span>
          </div>
          <p class="admin-setting-desc">
            Mọi đơn hàng, tin nhắn tư vấn và liên hệ mới đều tự động lưu sang bảng tính Google Sheets của cửa hàng.
          </p>
          <div class="admin-setting-actions">
            ${
              sheetUrl
                ? `<a href="${App.escapeHTML(sheetUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Mở Google Sheets ↗</a>`
                : ''
            }
            <button type="button" class="btn btn-secondary btn-sm" data-admin-action="test-sync-quiet">
              Kiểm tra đồng bộ
            </button>
          </div>
          <p class="admin-gsheet-feedback" id="admin-sync-feedback" hidden></p>
        </section>

        <section class="admin-panel-card">
          <div class="admin-panel-card-head">
            <h4>Xuất báo cáo &amp; Sao lưu</h4>
          </div>
          <p class="admin-setting-desc">
            Xuất file Excel (CSV hỗ trợ đầy đủ tiếng Việt) hoặc sao lưu toàn bộ dữ liệu định dạng JSON.
          </p>
          <div class="admin-setting-actions">
            <button type="button" class="btn btn-secondary btn-sm" data-admin-action="export-orders-csv">Excel Đơn hàng</button>
            <button type="button" class="btn btn-secondary btn-sm" data-admin-action="export-chats-csv">Excel Tư vấn</button>
            <button type="button" class="btn btn-secondary btn-sm" data-admin-action="export-json">Sao lưu JSON</button>
          </div>
        </section>

        <section class="admin-panel-card">
          <div class="admin-panel-card-head">
            <h4>Đổi mật khẩu quản trị</h4>
          </div>
          <form class="admin-pass-form" id="admin-change-pass-form" novalidate>
            <div class="form-group">
              <label class="form-label">Mật khẩu mới (tối thiểu 6 ký tự)</label>
              <input class="form-input" name="newPassword" type="password" placeholder="Nhập mật khẩu mới..." required />
            </div>
            <button type="submit" class="btn btn-primary btn-sm">Cập nhật mật khẩu</button>
          </form>
          <p class="admin-setting-note">Mật khẩu mới sẽ áp dụng ngay trên trình duyệt hiện tại của chủ shop.</p>
        </section>

        <section class="admin-panel-card admin-panel-card--danger">
          <div class="admin-panel-card-head">
            <h4>Dọn dữ liệu trên trình duyệt</h4>
          </div>
          <p class="admin-setting-desc">
            Xóa toàn bộ đơn hàng và tin nhắn thử nghiệm đang lưu trên trình duyệt này (không xóa dữ liệu đã ghi trên Google Sheets).
          </p>
          <div class="admin-setting-actions">
            <button type="button" class="btn btn-outline btn-sm admin-danger-btn" data-admin-action="clear-local-data">
              Xóa dữ liệu cục bộ
            </button>
          </div>
        </section>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     Main Full-Workspace Renderer
     ------------------------------------------------------------------------ */
  function renderAdminDashboard() {
    if (!els.dashboardView) return;
    const analytics = App.store.getAnalytics();
    const customersCount = App.store.getCustomerDirectory().length;
    const sheetUrl = (App.CONFIG && App.CONFIG.googleSheetViewUrl) || '';
    const syncLive = App.webhook && App.webhook.getActiveChannels().length > 0;

    let mainContent = '';
    if (adminState.activeTab === 'overview') mainContent = renderOverviewTab(analytics);
    else if (adminState.activeTab === 'orders') mainContent = renderOrdersTab();
    else if (adminState.activeTab === 'chats') mainContent = renderLeadsTab('chats');
    else if (adminState.activeTab === 'contacts') mainContent = renderLeadsTab('contacts');
    else if (adminState.activeTab === 'customers') mainContent = renderCustomersTab();
    else mainContent = renderSettingsTab();

    const navItems = [
      { id: 'overview', label: 'Tổng quan', badge: '' },
      { id: 'orders', label: 'Đơn hàng', badge: analytics.ordersCount },
      { id: 'chats', label: 'Tin nhắn tư vấn', badge: analytics.pendingChatsCount || analytics.chatLeadsCount },
      { id: 'contacts', label: 'Yêu cầu liên hệ', badge: analytics.pendingContactsCount || analytics.contactsCount },
      { id: 'customers', label: 'Khách hàng', badge: customersCount },
      { id: 'settings', label: 'Cài đặt', badge: '' }
    ]
      .map(function (item) {
        const active = adminState.activeTab === item.id ? ' is-active' : '';
        const countBadge =
          item.badge !== '' ? `<span class="admin-nav-badge">${item.badge}</span>` : '';
        return `
          <button
            type="button"
            class="admin-nav-item${active}"
            data-admin-tab="${item.id}"
            aria-current="${adminState.activeTab === item.id ? 'page' : 'false'}"
          >
            <span>${item.label}</span>
            ${countBadge}
          </button>
        `;
      })
      .join('');

    els.dashboardView.innerHTML = `
      <aside class="admin-sidebar">
        <div class="admin-sidebar-brand">
          <div class="brand-mark admin-brand-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3c1.8 2.4 3 4.3 3 6.2a3 3 0 1 1-6 0C9 7.3 10.2 5.4 12 3z" />
              <path d="M7 15h10v3.5A2.5 2.5 0 0 1 14.5 21h-5A2.5 2.5 0 0 1 7 18.5V15z" />
            </svg>
          </div>
          <div>
            <strong class="admin-sidebar-name">LUMIÈN</strong>
            <span class="admin-sidebar-role">Seller Studio</span>
          </div>
        </div>

        <nav class="admin-sidebar-nav" aria-label="Menu quản trị cửa hàng">
          ${navItems}
        </nav>

        <div class="admin-sidebar-footer">
          <div class="admin-sync-mini ${syncLive ? 'is-live' : ''}">
            <span class="status-dot ${syncLive ? 'status-dot--live' : ''}" aria-hidden="true"></span>
            <span>${syncLive ? 'Google Sheets sẵn sàng' : 'Chế độ cục bộ'}</span>
          </div>
          ${
            sheetUrl
              ? `<a href="${App.escapeHTML(sheetUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-sm btn-full">Mở Google Sheets ↗</a>`
              : ''
          }
          <button type="button" class="btn btn-outline btn-sm btn-full" data-admin-action="logout">
            Đăng xuất
          </button>
        </div>
      </aside>

      <div class="admin-main-pane">
        ${mainContent}
      </div>
    `;
  }

  function refreshActiveListOnly() {
    const slot = document.getElementById('admin-list-slot');
    if (!slot) return;
    if (adminState.activeTab === 'orders') slot.innerHTML = renderOrderCardsList();
    else if (adminState.activeTab === 'chats') slot.innerHTML = renderLeadCardsList('chats');
    else if (adminState.activeTab === 'contacts') slot.innerHTML = renderLeadCardsList('contacts');
    else if (adminState.activeTab === 'customers') slot.innerHTML = renderCustomersList();
  }

  function syncAdminView() {
    if (!els.loginView || !els.dashboardView || !els.dialog) return;
    els.loginView.hidden = adminState.isAuthenticated;
    els.dashboardView.hidden = !adminState.isAuthenticated;
    els.dialog.classList.toggle('is-authenticated', adminState.isAuthenticated);
    if (adminState.isAuthenticated) {
      renderAdminDashboard();
    }
  }

  function openAdmin() {
    if (!els.overlay) return;
    adminState.isOpen = true;
    adminState.isAuthenticated = checkSessionAuth();
    syncAdminView();

    els.overlay.classList.add('is-open');
    els.overlay.setAttribute('aria-hidden', 'false');
    if (typeof App.syncBodyLock === 'function') App.syncBodyLock();

    if (!adminState.isAuthenticated && els.passwordInput) {
      setTimeout(function () {
        els.passwordInput.focus();
      }, 120);
    }
  }

  function closeAdmin() {
    if (!els.overlay) return;
    adminState.isOpen = false;
    els.overlay.classList.remove('is-open');
    els.overlay.setAttribute('aria-hidden', 'true');
    if (global.location.hash === '#admin') {
      try {
        global.history.replaceState(null, '', global.location.pathname + global.location.search);
      } catch (_err) {
        global.location.hash = '';
      }
    }
    if (typeof App.syncBodyLock === 'function') App.syncBodyLock();
  }

  function handleHashCheck() {
    if (global.location.hash === '#admin') {
      openAdmin();
    }
  }

  /* ------------------------------------------------------------------------
     Secret 5-Tap Mobile Access on Footer Copyright (Zero Visible UI Clutter)
     ------------------------------------------------------------------------ */
  function bindSecretCopyrightTap() {
    const copyrightEl = document.getElementById('footer-copyright');
    if (!copyrightEl) return;
    let tapCount = 0;
    let tapTimer = null;

    copyrightEl.addEventListener('click', function () {
      tapCount++;
      clearTimeout(tapTimer);
      if (tapCount >= 5) {
        tapCount = 0;
        openAdmin();
        return;
      }
      tapTimer = setTimeout(function () {
        tapCount = 0;
      }, 2200);
    });
  }

  App.admin = {
    open: openAdmin,
    close: closeAdmin,
    isOpen: function () {
      return adminState.isOpen;
    },

    init: function () {
      els.overlay = document.getElementById('admin-modal');
      els.dialog = els.overlay ? els.overlay.querySelector('.modal-dialog--admin') : null;
      els.loginView = document.getElementById('admin-login-view');
      els.dashboardView = document.getElementById('admin-dashboard-view');
      els.loginForm = document.getElementById('admin-login-form');
      els.passwordInput = document.getElementById('admin-password-input');
      els.loginError = document.getElementById('admin-login-error');

      if (!els.overlay) return;

      adminState.isAuthenticated = checkSessionAuth();

      App.store.subscribe(function () {
        if (adminState.isOpen && adminState.isAuthenticated) {
          renderAdminDashboard();
        }
      });

      // Login Gate
      if (els.loginForm) {
        els.loginForm.addEventListener('submit', function (event) {
          event.preventDefault();
          const entered = els.passwordInput ? els.passwordInput.value.trim() : '';
          const expected = App.store.getAdminPassword();

          if (entered !== expected) {
            if (els.loginError) {
              els.loginError.textContent = 'Mật khẩu quản trị chưa chính xác.';
              els.loginError.hidden = false;
            }
            return;
          }

          if (els.loginError) els.loginError.hidden = true;
          if (els.passwordInput) els.passwordInput.value = '';
          adminState.isAuthenticated = true;
          saveSessionAuth(true);
          syncAdminView();
        });
      }

      // Search input live filter (keeps focus cleanly!)
      els.overlay.addEventListener('input', function (event) {
        if (event.target.id === 'admin-search-input') {
          adminState.searchQuery = event.target.value;
          refreshActiveListOnly();
        }
      });

      // Form submissions inside Admin (Manual Order & Change Password)
      els.overlay.addEventListener('submit', function (event) {
        if (event.target.id === 'admin-manual-order-form') {
          event.preventDefault();
          const form = event.target;
          const errEl = document.getElementById('manual-order-error');
          const customerName = form.elements.customerName.value.trim();
          const phone = form.elements.phone.value.trim();
          const address = form.elements.address.value.trim();

          const items = App.PRODUCTS.map(function (p) {
            return { id: p.id, qty: Number(form.elements['qty_' + p.id]?.value) || 0 };
          }).filter(function (it) {
            return it.qty > 0;
          });

          let msg = '';
          if (customerName.length < 2) msg = 'Vui lòng nhập họ tên khách hàng.';
          else if (!App.validators.isValidVNPhone(phone)) msg = 'Số điện thoại không đúng định dạng.';
          else if (address.length < 5) msg = 'Vui lòng nhập địa chỉ giao hàng.';
          else if (items.length === 0) msg = 'Chọn ít nhất 1 sản phẩm để tạo đơn.';

          if (msg) {
            if (errEl) {
              errEl.textContent = msg;
              errEl.hidden = false;
            }
            return;
          }

          const created = App.store.createManualOrder({
            customerName: customerName,
            phone: phone,
            address: address,
            channel: form.elements.channel.value,
            paymentMethod: form.elements.paymentMethod.value,
            note: form.elements.note.value,
            internalNote: form.elements.internalNote.value,
            freeShip: form.elements.freeShip.checked,
            items: items
          });

          if (created) {
            adminState.showManualOrderForm = false;
            adminState.orderFilter = 'all';
            renderAdminDashboard();
            if (App.showToast) App.showToast(`Đã tạo đơn ${created.orderCode} & đồng bộ Google Sheets!`);
          }
          return;
        }

        if (event.target.id === 'admin-change-pass-form') {
          event.preventDefault();
          const newPass = event.target.elements.newPassword.value.trim();
          if (newPass.length < 6) {
            if (App.showToast) App.showToast('Mật khẩu mới cần ít nhất 6 ký tự.');
            return;
          }
          App.store.setAdminPassword(newPass);
          event.target.reset();
          if (App.showToast) App.showToast('Đã cập nhật mật khẩu quản trị mới!');
        }
      });

      // Delegated Click Events
      els.overlay.addEventListener('click', function (event) {
        if (event.target === els.overlay) {
          closeAdmin();
          return;
        }

        const jumpOrder = event.target.closest('[data-admin-jump-order-status]');
        if (jumpOrder) {
          adminState.activeTab = 'orders';
          adminState.orderFilter = jumpOrder.dataset.adminJumpOrderStatus;
          adminState.searchQuery = '';
          renderAdminDashboard();
          return;
        }

        const tabBtn = event.target.closest('[data-admin-tab]');
        if (tabBtn) {
          adminState.activeTab = tabBtn.dataset.adminTab;
          adminState.searchQuery = '';
          adminState.leadFilter = 'all';
          renderAdminDashboard();
          return;
        }

        const filterBtn = event.target.closest('[data-admin-order-filter]');
        if (filterBtn) {
          adminState.orderFilter = filterBtn.dataset.adminOrderFilter;
          renderAdminDashboard();
          return;
        }

        const leadFilterBtn = event.target.closest('[data-admin-lead-filter]');
        if (leadFilterBtn) {
          adminState.leadFilter = leadFilterBtn.dataset.adminLeadFilter;
          renderAdminDashboard();
          return;
        }

        const printBtn = event.target.closest('[data-admin-print-order]');
        if (printBtn) {
          printOrderSlip(printBtn.dataset.adminPrintOrder);
          return;
        }

        const resyncBtn = event.target.closest('[data-admin-resync-order]');
        if (resyncBtn) {
          const code = resyncBtn.dataset.adminResyncOrder;
          App.store.resyncOrderToWebhook(code).then(function () {
            if (App.showToast) App.showToast(`Đã đẩy lại đơn ${code} lên Google Sheets!`);
          });
          return;
        }

        const saveOrderNoteBtn = event.target.closest('[data-admin-save-order-note]');
        if (saveOrderNoteBtn) {
          const code = saveOrderNoteBtn.dataset.adminSaveOrderNote;
          const input = els.overlay.querySelector(`[data-order-note-input="${code}"]`);
          App.store.updateOrderInternalNote(code, input ? input.value : '');
          if (App.showToast) App.showToast('Đã lưu ghi chú nội bộ đơn hàng.');
          return;
        }

        const saveChatNoteBtn = event.target.closest('[data-admin-save-chat-note]');
        if (saveChatNoteBtn) {
          const id = saveChatNoteBtn.dataset.adminSaveChatNote;
          const input = els.overlay.querySelector(`[data-chat-note-input="${id}"]`);
          App.store.updateChatLeadNote(id, input ? input.value : '');
          if (App.showToast) App.showToast('Đã lưu ghi chú tư vấn.');
          return;
        }

        const saveContactNoteBtn = event.target.closest('[data-admin-save-contact-note]');
        if (saveContactNoteBtn) {
          const id = saveContactNoteBtn.dataset.adminSaveContactNote;
          const input = els.overlay.querySelector(`[data-contact-note-input="${id}"]`);
          App.store.updateContactNote(id, input ? input.value : '');
          if (App.showToast) App.showToast('Đã lưu ghi chú liên hệ.');
          return;
        }

        const actionBtn = event.target.closest('[data-admin-action]');
        if (actionBtn) {
          const act = actionBtn.dataset.adminAction;
          if (act === 'close') closeAdmin();
          else if (act === 'export-orders-csv') exportOrdersCSV();
          else if (act === 'export-chats-csv') exportLeadsCSV('chats');
          else if (act === 'export-contacts-csv') exportLeadsCSV('contacts');
          else if (act === 'export-json') exportAllJSON();
          else if (act === 'open-manual-order') {
            adminState.activeTab = 'orders';
            adminState.showManualOrderForm = true;
            renderAdminDashboard();
          } else if (act === 'toggle-manual-order') {
            adminState.showManualOrderForm = !adminState.showManualOrderForm;
            renderAdminDashboard();
          } else if (act === 'test-sync-quiet') {
            App.webhook.testGoogleSheets().then(function (res) {
              const fb = document.getElementById('admin-sync-feedback');
              if (fb) {
                fb.textContent = res.message;
                fb.className = 'admin-gsheet-feedback ' + (res.ok ? 'is-ok' : 'is-error');
                fb.hidden = false;
              }
            });
          } else if (act === 'clear-local-data') {
            if (global.confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu thử nghiệm trên trình duyệt này? (Dữ liệu trên Google Sheets vẫn được giữ nguyên.)')) {
              App.store.clearAllRecords();
              if (App.showToast) App.showToast('Đã dọn sạch dữ liệu cục bộ.');
            }
          } else if (act === 'logout') {
            adminState.isAuthenticated = false;
            saveSessionAuth(false);
            syncAdminView();
          }
          return;
        }

        const delOrder = event.target.closest('[data-admin-delete-order]');
        if (delOrder) {
          const code = delOrder.dataset.adminDeleteOrder;
          if (global.confirm(`Xóa đơn hàng ${code} khỏi danh sách hiển thị?`)) {
            App.store.deleteOrder(code);
          }
          return;
        }

        const delChat = event.target.closest('[data-admin-delete-chat]');
        if (delChat) {
          if (global.confirm('Xóa tin nhắn tư vấn này?')) {
            App.store.deleteChatLead(delChat.dataset.adminDeleteChat);
          }
          return;
        }

        const delContact = event.target.closest('[data-admin-delete-contact]');
        if (delContact) {
          if (global.confirm('Xóa yêu cầu liên hệ này?')) {
            App.store.deleteContact(delContact.dataset.adminDeleteContact);
          }
        }
      });

      // Change Events (Dropdown filters & Status updates)
      els.overlay.addEventListener('change', function (event) {
        if (event.target.id === 'admin-payment-filter') {
          adminState.paymentFilter = event.target.value;
          refreshActiveListOnly();
          return;
        }

        const orderSel = event.target.closest('[data-admin-order-status]');
        if (orderSel) {
          App.store.updateOrderStatus(orderSel.dataset.adminOrderStatus, orderSel.value);
          if (App.showToast) App.showToast('Đã cập nhật trạng thái đơn hàng.');
          return;
        }

        const chatSel = event.target.closest('[data-admin-chat-status]');
        if (chatSel) {
          App.store.updateChatLeadStatus(chatSel.dataset.adminChatStatus, chatSel.value);
          if (App.showToast) App.showToast('Đã cập nhật trạng thái tư vấn.');
          return;
        }

        const contactSel = event.target.closest('[data-admin-contact-status]');
        if (contactSel) {
          App.store.updateContactStatus(contactSel.dataset.adminContactStatus, contactSel.value);
          if (App.showToast) App.showToast('Đã cập nhật trạng thái liên hệ.');
        }
      });

      bindSecretCopyrightTap();

      global.addEventListener('hashchange', handleHashCheck);
      global.addEventListener('keydown', function (event) {
        if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
          event.preventDefault();
          openAdmin();
        }
      });

      handleHashCheck();
    }
  };
})(window);
