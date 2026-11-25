/* ==========================================================================
   LUMIÈN — Seller Admin Panel ("Quản lý cho Người bán")
   Opens via #admin hash, subtle footer button, or Ctrl+Shift+A.
   Password: App.CONFIG.adminPassword (default: admin123).
   Tabs: 1) Đơn hàng  2) Tin nhắn tư vấn  3) Yêu cầu liên hệ
   ========================================================================== */

(function (global) {
  'use strict';

  const App = (global.LumienApp = global.LumienApp || {});
  const AUTH_SESSION_KEY = 'lumien_admin_unlocked_v1';

  const adminState = {
    isOpen: false,
    isAuthenticated: false,
    activeTab: 'orders', // 'orders' | 'chats' | 'contacts'
    orderFilter: 'all'
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
    } catch (_err) {
      // Ignore storage errors
    }
  }

  function getStatusMeta(list, value) {
    return (
      list.find(function (s) {
        return s.value === value;
      }) || list[0]
    );
  }

  function renderWebhookBanner() {
    const channels = App.webhook ? App.webhook.getActiveChannels() : [];
    const currentUrl = App.webhook ? App.webhook.getGoogleSheetsUrl() : '';
    const source = App.webhook ? App.webhook.getGoogleSheetsSource() : 'none';

    const statusLine =
      channels.length > 0
        ? `
          <div class="admin-webhook-pill admin-webhook-pill--live">
            <span class="status-dot status-dot--live" aria-hidden="true"></span>
            <span>Đang đồng bộ: <strong>${App.escapeHTML(channels.join(', '))}</strong>${
              source === 'local' ? ' <em>(lưu thử trên trình duyệt — nhớ dán vào js/config.js khi đăng web)</em>' : ''
            }</span>
          </div>
        `
        : `
          <div class="admin-webhook-pill">
            <span class="status-dot" aria-hidden="true"></span>
            <span>Chưa cắm Google Sheets (đang lưu demo <strong>localStorage</strong>)</span>
          </div>
        `;

    return `
      <div class="admin-gsheet-card">
        <div class="admin-gsheet-head">
          ${statusLine}
          <span class="admin-gsheet-guide-note">Mã Apps Script sẵn có tại <code>google-sheets/Code.gs</code></span>
        </div>
        <div class="admin-gsheet-row">
          <input
            type="url"
            class="form-input admin-gsheet-input"
            id="admin-gsheet-url"
            placeholder="Dán link Web App Google Sheets (https://script.google.com/macros/s/.../exec)"
            value="${App.escapeHTML(currentUrl)}"
            aria-label="Đường dẫn Web App Google Sheets"
          />
          <button type="button" class="btn btn-secondary btn-sm" data-admin-action="save-gsheet">
            Lưu link
          </button>
          <button type="button" class="btn btn-gold btn-sm" data-admin-action="test-gsheet">
            Gửi test
          </button>
        </div>
        <p class="admin-gsheet-feedback" id="admin-gsheet-feedback" hidden></p>
      </div>
    `;
  }

  function renderOrdersTab(orders) {
    const filtered =
      adminState.orderFilter === 'all'
        ? orders
        : orders.filter(function (o) {
            return o.status === adminState.orderFilter;
          });

    const filterBtns = [
      { value: 'all', label: `Tất cả (${orders.length})` },
      { value: 'new', label: 'Mới đặt' },
      { value: 'confirmed', label: 'Đã xác nhận' },
      { value: 'shipping', label: 'Đang giao' },
      { value: 'completed', label: 'Hoàn thành' }
    ]
      .map(function (f) {
        const active = adminState.orderFilter === f.value ? ' is-active' : '';
        return `<button type="button" class="admin-filter-chip${active}" data-admin-order-filter="${f.value}">${App.escapeHTML(f.label)}</button>`;
      })
      .join('');

    if (filtered.length === 0) {
      return `
        <div class="admin-filter-row">${filterBtns}</div>
        <div class="admin-empty-state">
          <p>Chưa có đơn hàng nào${adminState.orderFilter !== 'all' ? ' ở trạng thái này' : ''}.</p>
          <span>Khi khách đặt hàng từ website, đơn sẽ hiển thị ngay tại đây.</span>
        </div>
      `;
    }

    const cardsHTML = filtered
      .map(function (order) {
        const meta = getStatusMeta(App.ORDER_STATUSES, order.status);
        const paymentText = order.paymentMethod === 'bank' ? 'Chuyển khoản' : 'COD (Nhận hàng trả tiền)';
        const itemsText = order.items
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
                <span class="admin-record-time">${App.escapeHTML(App.formatDateTime(order.createdAt))}</span>
              </div>
              <div class="admin-record-controls">
                <select
                  class="admin-status-select"
                  data-admin-order-status="${App.escapeHTML(order.orderCode)}"
                  aria-label="Cập nhật trạng thái đơn ${App.escapeHTML(order.orderCode)}"
                >
                  ${statusOptions}
                </select>
                <button
                  type="button"
                  class="admin-delete-btn"
                  data-admin-delete-order="${App.escapeHTML(order.orderCode)}"
                  title="Xóa đơn hàng"
                >Xóa</button>
              </div>
            </div>

            <div class="admin-order-grid">
              <div class="admin-order-customer">
                <p><strong>Khách hàng:</strong> ${App.escapeHTML(order.customerName)}</p>
                <p>
                  <strong>Số điện thoại:</strong>
                  <a class="admin-phone-link" href="tel:${App.escapeHTML(App.validators.normalizePhone(order.phone))}">${App.escapeHTML(order.phone)}</a>
                </p>
                <p><strong>Địa chỉ:</strong> ${App.escapeHTML(order.address)}</p>
                <p><strong>Thanh toán:</strong> ${App.escapeHTML(paymentText)}</p>
                ${order.note ? `<p><strong>Ghi chú:</strong> ${App.escapeHTML(order.note)}</p>` : ''}
              </div>

              <div class="admin-order-items-box">
                <ul class="admin-order-items">${itemsText}</ul>
                <div class="admin-order-total-row">
                  <span>Phí ship: ${order.shippingFee === 0 ? 'Miễn phí' : App.formatVND(order.shippingFee)}</span>
                  <strong>Tổng: ${App.formatVND(order.total)}</strong>
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    return `
      <div class="admin-filter-row">${filterBtns}</div>
      <div class="admin-records-list">${cardsHTML}</div>
    `;
  }

  function renderChatsTab(chatLeads) {
    if (chatLeads.length === 0) {
      return `
        <div class="admin-empty-state">
          <p>Chưa có tin nhắn tư vấn nào từ khung Live Chat.</p>
          <span>Khi khách để lại Tên &amp; SĐT trong khung "Tư vấn ngay", nội dung sẽ lưu vào đây để chủ shop phản hồi.</span>
        </div>
      `;
    }

    const cardsHTML = chatLeads
      .map(function (lead) {
        const meta = getStatusMeta(App.LEAD_STATUSES, lead.status);
        const options = App.LEAD_STATUSES.map(function (s) {
          const selected = s.value === lead.status ? ' selected' : '';
          return `<option value="${s.value}"${selected}>${App.escapeHTML(s.label)}</option>`;
        }).join('');

        const transcriptHTML =
          lead.transcript && lead.transcript.length > 0
            ? `
              <details class="admin-transcript">
                <summary>Xem lịch sử khung chat (${lead.transcript.length} dòng)</summary>
                <ul>
                  ${lead.transcript
                    .map(function (line) {
                      return `<li>${App.escapeHTML(line)}</li>`;
                    })
                    .join('')}
                </ul>
              </details>
            `
            : '';

        return `
          <article class="admin-record-card">
            <div class="admin-record-head">
              <div class="admin-record-title-group">
                <strong>${App.escapeHTML(lead.customerName)}</strong>
                <a class="admin-phone-link" href="tel:${App.escapeHTML(App.validators.normalizePhone(lead.phone))}">${App.escapeHTML(lead.phone)}</a>
                <span class="admin-status-badge admin-status-badge--${meta.tone}">${App.escapeHTML(meta.label)}</span>
                <span class="admin-record-time">${App.escapeHTML(App.formatDateTime(lead.createdAt))}</span>
              </div>
              <div class="admin-record-controls">
                <select
                  class="admin-status-select"
                  data-admin-chat-status="${App.escapeHTML(lead.id)}"
                  aria-label="Trạng thái phản hồi tin nhắn tư vấn"
                >
                  ${options}
                </select>
                <button type="button" class="admin-delete-btn" data-admin-delete-chat="${App.escapeHTML(lead.id)}">Xóa</button>
              </div>
            </div>
            <p class="admin-lead-message">${App.escapeHTML(lead.message)}</p>
            ${transcriptHTML}
          </article>
        `;
      })
      .join('');

    return `<div class="admin-records-list">${cardsHTML}</div>`;
  }

  function renderContactsTab(contacts) {
    if (contacts.length === 0) {
      return `
        <div class="admin-empty-state">
          <p>Chưa có yêu cầu liên hệ nào từ mục "Liên hệ với chúng tôi".</p>
          <span>Khi khách gửi form lời nhắn ở phần Liên hệ, thông tin sẽ xuất hiện tại đây.</span>
        </div>
      `;
    }

    const cardsHTML = contacts
      .map(function (req) {
        const meta = getStatusMeta(App.LEAD_STATUSES, req.status);
        const options = App.LEAD_STATUSES.map(function (s) {
          const selected = s.value === req.status ? ' selected' : '';
          return `<option value="${s.value}"${selected}>${App.escapeHTML(s.label)}</option>`;
        }).join('');

        return `
          <article class="admin-record-card">
            <div class="admin-record-head">
              <div class="admin-record-title-group">
                <strong>${App.escapeHTML(req.customerName)}</strong>
                <a class="admin-phone-link" href="tel:${App.escapeHTML(App.validators.normalizePhone(req.phone))}">${App.escapeHTML(req.phone)}</a>
                <span class="admin-status-badge admin-status-badge--${meta.tone}">${App.escapeHTML(meta.label)}</span>
                <span class="admin-record-time">${App.escapeHTML(App.formatDateTime(req.createdAt))}</span>
              </div>
              <div class="admin-record-controls">
                <select
                  class="admin-status-select"
                  data-admin-contact-status="${App.escapeHTML(req.id)}"
                  aria-label="Trạng thái xử lý yêu cầu liên hệ"
                >
                  ${options}
                </select>
                <button type="button" class="admin-delete-btn" data-admin-delete-contact="${App.escapeHTML(req.id)}">Xóa</button>
              </div>
            </div>
            <p class="admin-lead-message">${App.escapeHTML(req.message)}</p>
          </article>
        `;
      })
      .join('');

    return `<div class="admin-records-list">${cardsHTML}</div>`;
  }

  function renderAdminDashboard() {
    if (!els.dashboardView) return;
    const state = App.store.getState();
    const stats = App.store.getAdminStats();

    let tabBody = '';
    if (adminState.activeTab === 'orders') tabBody = renderOrdersTab(state.orders);
    else if (adminState.activeTab === 'chats') tabBody = renderChatsTab(state.chatLeads);
    else tabBody = renderContactsTab(state.contacts);

    els.dashboardView.innerHTML = `
      <div class="admin-topbar">
        <div>
          <span class="admin-eyebrow">Quản lý cho Người bán · LUMIÈN</span>
          <h3>Bảng theo dõi Đơn hàng &amp; Khách hàng</h3>
        </div>
        <div class="admin-topbar-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-admin-action="export-json">
            Xuất JSON
          </button>
          <button type="button" class="btn btn-outline btn-sm" data-admin-action="logout">
            Đăng xuất
          </button>
        </div>
      </div>

      ${renderWebhookBanner()}

      <div class="admin-stats-grid">
        <div class="admin-stat-card">
          <span class="admin-stat-label">Tổng đơn hàng</span>
          <strong class="admin-stat-value">${stats.ordersCount}</strong>
          <span class="admin-stat-sub">${stats.newOrdersCount} đơn mới chờ xác nhận</span>
        </div>
        <div class="admin-stat-card">
          <span class="admin-stat-label">Doanh thu tạm tính</span>
          <strong class="admin-stat-value">${App.formatVND(stats.revenue)}</strong>
          <span class="admin-stat-sub">Không tính đơn đã hủy</span>
        </div>
        <div class="admin-stat-card">
          <span class="admin-stat-label">Tin nhắn tư vấn</span>
          <strong class="admin-stat-value">${stats.chatLeadsCount}</strong>
          <span class="admin-stat-sub">Từ khung Live Chat</span>
        </div>
        <div class="admin-stat-card">
          <span class="admin-stat-label">Yêu cầu liên hệ</span>
          <strong class="admin-stat-value">${stats.contactsCount}</strong>
          <span class="admin-stat-sub">Từ form Liên hệ</span>
        </div>
      </div>

      <div class="admin-tabs" role="tablist" aria-label="Danh mục quản lý cửa hàng">
        <button
          type="button"
          role="tab"
          class="admin-tab-btn${adminState.activeTab === 'orders' ? ' is-active' : ''}"
          aria-selected="${adminState.activeTab === 'orders'}"
          data-admin-tab="orders"
        >
          Đơn hàng <span class="admin-tab-count">${stats.ordersCount}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="admin-tab-btn${adminState.activeTab === 'chats' ? ' is-active' : ''}"
          aria-selected="${adminState.activeTab === 'chats'}"
          data-admin-tab="chats"
        >
          Tin nhắn tư vấn <span class="admin-tab-count">${stats.chatLeadsCount}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="admin-tab-btn${adminState.activeTab === 'contacts' ? ' is-active' : ''}"
          aria-selected="${adminState.activeTab === 'contacts'}"
          data-admin-tab="contacts"
        >
          Yêu cầu liên hệ <span class="admin-tab-count">${stats.contactsCount}</span>
        </button>
      </div>

      <div class="admin-tab-content">
        ${tabBody}
      </div>
    `;
  }

  function syncAdminView() {
    if (!els.loginView || !els.dashboardView) return;
    els.loginView.hidden = adminState.isAuthenticated;
    els.dashboardView.hidden = !adminState.isAuthenticated;
    if (adminState.isAuthenticated) {
      renderAdminDashboard();
    }
  }

  function exportAllJSON() {
    const state = App.store.getState();
    const exportData = {
      exportedAt: new Date().toISOString(),
      store: App.STORE_INFO.brandName,
      orders: state.orders,
      chatLeads: state.chatLeads,
      contacts: state.contacts
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumien-du-lieu-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    if (typeof App.showToast === 'function') {
      App.showToast('Đã xuất tệp dữ liệu JSON thành công!');
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

  App.admin = {
    open: openAdmin,
    close: closeAdmin,
    isOpen: function () {
      return adminState.isOpen;
    },

    init: function () {
      els.overlay = document.getElementById('admin-modal');
      els.loginView = document.getElementById('admin-login-view');
      els.dashboardView = document.getElementById('admin-dashboard-view');
      els.loginForm = document.getElementById('admin-login-form');
      els.passwordInput = document.getElementById('admin-password-input');
      els.loginError = document.getElementById('admin-login-error');

      if (!els.overlay) return;

      adminState.isAuthenticated = checkSessionAuth();

      // Re-render live whenever store changes while dashboard is open
      App.store.subscribe(function () {
        if (adminState.isOpen && adminState.isAuthenticated) {
          renderAdminDashboard();
        }
      });

      // Login form
      if (els.loginForm) {
        els.loginForm.addEventListener('submit', function (event) {
          event.preventDefault();
          const entered = els.passwordInput ? els.passwordInput.value.trim() : '';
          const expected = (App.CONFIG && App.CONFIG.adminPassword) || 'admin123';

          if (entered !== expected) {
            if (els.loginError) {
              els.loginError.textContent = 'Mật khẩu không đúng. Vui lòng thử lại (mặc định demo: admin123).';
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

      // Delegated dashboard actions
      els.overlay.addEventListener('click', function (event) {
        if (event.target === els.overlay) {
          closeAdmin();
          return;
        }

        const tabBtn = event.target.closest('[data-admin-tab]');
        if (tabBtn) {
          adminState.activeTab = tabBtn.dataset.adminTab;
          renderAdminDashboard();
          return;
        }

        const filterBtn = event.target.closest('[data-admin-order-filter]');
        if (filterBtn) {
          adminState.orderFilter = filterBtn.dataset.adminOrderFilter;
          renderAdminDashboard();
          return;
        }

        const actionBtn = event.target.closest('[data-admin-action]');
        if (actionBtn) {
          const act = actionBtn.dataset.adminAction;
          if (act === 'close') closeAdmin();
          else if (act === 'export-json') exportAllJSON();
          else if (act === 'logout') {
            adminState.isAuthenticated = false;
            saveSessionAuth(false);
            syncAdminView();
          } else if (act === 'save-gsheet' || act === 'test-gsheet') {
            const urlInput = document.getElementById('admin-gsheet-url');
            const feedbackEl = document.getElementById('admin-gsheet-feedback');
            const enteredUrl = urlInput ? urlInput.value.trim() : '';

            if (act === 'save-gsheet') {
              if (enteredUrl && !App.validators.isValidGoogleScriptUrl(enteredUrl)) {
                if (feedbackEl) {
                  feedbackEl.textContent =
                    'Link chưa đúng định dạng Google Apps Script (https://script.google.com/macros/s/.../exec).';
                  feedbackEl.className = 'admin-gsheet-feedback is-error';
                  feedbackEl.hidden = false;
                }
                return;
              }
              App.webhook.setGoogleSheetsUrl(enteredUrl);
              renderAdminDashboard();
              if (typeof App.showToast === 'function') {
                App.showToast(
                  enteredUrl
                    ? 'Đã lưu link Google Sheets! Nhớ dán thêm vào js/config.js khi đưa web lên mạng.'
                    : 'Đã gỡ link Google Sheets cục bộ.'
                );
              }
              return;
            }

            if (act === 'test-gsheet') {
              if (enteredUrl && App.validators.isValidGoogleScriptUrl(enteredUrl)) {
                App.webhook.setGoogleSheetsUrl(enteredUrl);
              }
              App.webhook.testGoogleSheets(enteredUrl).then(function (res) {
                const fb = document.getElementById('admin-gsheet-feedback');
                if (fb) {
                  fb.textContent = res.message;
                  fb.className = 'admin-gsheet-feedback ' + (res.ok ? 'is-ok' : 'is-error');
                  fb.hidden = false;
                }
              });
            }
          }
          return;
        }

        const delOrder = event.target.closest('[data-admin-delete-order]');
        if (delOrder) {
          App.store.deleteOrder(delOrder.dataset.adminDeleteOrder);
          return;
        }

        const delChat = event.target.closest('[data-admin-delete-chat]');
        if (delChat) {
          App.store.deleteChatLead(delChat.dataset.adminDeleteChat);
          return;
        }

        const delContact = event.target.closest('[data-admin-delete-contact]');
        if (delContact) {
          App.store.deleteContact(delContact.dataset.adminDeleteContact);
        }
      });

      els.overlay.addEventListener('change', function (event) {
        const orderSel = event.target.closest('[data-admin-order-status]');
        if (orderSel) {
          App.store.updateOrderStatus(orderSel.dataset.adminOrderStatus, orderSel.value);
          if (typeof App.showToast === 'function') App.showToast('Đã cập nhật trạng thái đơn hàng.');
          return;
        }

        const chatSel = event.target.closest('[data-admin-chat-status]');
        if (chatSel) {
          App.store.updateChatLeadStatus(chatSel.dataset.adminChatStatus, chatSel.value);
          if (typeof App.showToast === 'function') App.showToast('Đã cập nhật trạng thái tin nhắn.');
          return;
        }

        const contactSel = event.target.closest('[data-admin-contact-status]');
        if (contactSel) {
          App.store.updateContactStatus(contactSel.dataset.adminContactStatus, contactSel.value);
          if (typeof App.showToast === 'function') App.showToast('Đã cập nhật trạng thái liên hệ.');
        }
      });

      // Open via #admin hash or Ctrl+Shift+A shortcut
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
