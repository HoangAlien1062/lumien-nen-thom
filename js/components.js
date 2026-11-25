/* ==========================================================================
   LUMIÈN — UI Component Renderers (Phase 1 + Phase 2)
   Products, Detail Modal, Cart Drawer, Checkout Summary & Order Confirmation
   ========================================================================== */

(function (global) {
  'use strict';

  const App = (global.LumienApp = global.LumienApp || {});

  function escapeHTML(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  App.escapeHTML = escapeHTML;

  function renderScentMotifSVG(variant) {
    if (variant === 'ocean') {
      return `
        <svg class="placeholder-art" viewBox="0 0 180 210" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="glow-ocean" cx="50%" cy="38%" r="52%">
              <stop offset="0%" stop-color="#F6E5A7" stop-opacity="0.88" />
              <stop offset="65%" stop-color="#FDF5D7" stop-opacity="0.28" />
              <stop offset="100%" stop-color="#FDF5D7" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="jar-ocean" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.96" />
              <stop offset="100%" stop-color="#DCE9EB" stop-opacity="0.9" />
            </linearGradient>
          </defs>
          <circle cx="90" cy="84" r="72" fill="url(#glow-ocean)" />
          <path d="M48 178H134" stroke="#4A3F35" stroke-width="3" stroke-linecap="round" />
          <path d="M132 178V52C132 30 116 20 104 20C95 20 90 26 90 35" stroke="#C99A3B" stroke-width="2.6" stroke-linecap="round" />
          <rect x="81" y="34" width="18" height="6" rx="3" fill="#C99A3B" />
          <path d="M52 64C52 48 68 38 90 38C112 38 128 48 128 64H52Z" fill="#FFFDF7" stroke="#C99A3B" stroke-width="1.8" />
          <ellipse cx="90" cy="64" rx="38" ry="5.5" fill="#F6E5A7" opacity="0.82" />
          <path d="M58 68L68 118H112L122 68H58Z" fill="#F6E5A7" opacity="0.32" />
          <rect x="64" y="114" width="52" height="60" rx="10" fill="url(#jar-ocean)" stroke="#5D8991" stroke-opacity="0.45" stroke-width="1.5" />
          <rect x="64" y="114" width="52" height="12" rx="6" fill="#FFFDF7" opacity="0.9" />
          <path d="M74 142C79 138 85 138 90 142C95 146 101 146 106 142" stroke="#5D8991" stroke-width="1.5" stroke-linecap="round" />
          <path d="M74 151C79 147 85 147 90 151C95 155 101 155 106 151" stroke="#5D8991" stroke-width="1.2" stroke-linecap="round" opacity="0.65" />
          <rect x="78" y="131" width="24" height="3" rx="1.5" fill="#C99A3B" opacity="0.7" />
        </svg>
      `;
    }

    if (variant === 'blue-mint') {
      return `
        <svg class="placeholder-art" viewBox="0 0 180 210" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="glow-mint" cx="50%" cy="38%" r="52%">
              <stop offset="0%" stop-color="#F6E5A7" stop-opacity="0.88" />
              <stop offset="65%" stop-color="#FDF5D7" stop-opacity="0.28" />
              <stop offset="100%" stop-color="#FDF5D7" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="jar-mint" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.96" />
              <stop offset="100%" stop-color="#DAEBE1" stop-opacity="0.92" />
            </linearGradient>
          </defs>
          <circle cx="90" cy="84" r="72" fill="url(#glow-mint)" />
          <path d="M48 178H134" stroke="#4A3F35" stroke-width="3" stroke-linecap="round" />
          <path d="M132 178V52C132 30 116 20 104 20C95 20 90 26 90 35" stroke="#C99A3B" stroke-width="2.6" stroke-linecap="round" />
          <rect x="81" y="34" width="18" height="6" rx="3" fill="#C99A3B" />
          <path d="M52 64C52 48 68 38 90 38C112 38 128 48 128 64H52Z" fill="#FFFDF7" stroke="#C99A3B" stroke-width="1.8" />
          <ellipse cx="90" cy="64" rx="38" ry="5.5" fill="#F6E5A7" opacity="0.82" />
          <path d="M58 68L68 118H112L122 68H58Z" fill="#F6E5A7" opacity="0.32" />
          <rect x="64" y="114" width="52" height="60" rx="10" fill="url(#jar-mint)" stroke="#5C8E74" stroke-opacity="0.45" stroke-width="1.5" />
          <rect x="64" y="114" width="52" height="12" rx="6" fill="#FFFDF7" opacity="0.9" />
          <path d="M90 158V134" stroke="#5C8E74" stroke-width="1.4" stroke-linecap="round" />
          <path d="M90 148C81 147 77 141 79 135C86 135 90 140 90 148Z" fill="#5C8E74" fill-opacity="0.24" stroke="#5C8E74" stroke-width="1.3" />
          <path d="M90 144C99 143 103 137 101 131C94 131 90 136 90 144Z" fill="#5C8E74" fill-opacity="0.24" stroke="#5C8E74" stroke-width="1.3" />
        </svg>
      `;
    }

    return `
      <svg class="placeholder-art" viewBox="0 0 180 210" fill="none" aria-hidden="true">
        <defs>
          <radialGradient id="glow-blossom" cx="50%" cy="38%" r="52%">
            <stop offset="0%" stop-color="#F6E5A7" stop-opacity="0.9" />
            <stop offset="65%" stop-color="#FDF5D7" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#FDF5D7" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="jar-blossom" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.96" />
            <stop offset="100%" stop-color="#F6E1DB" stop-opacity="0.92" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="84" r="72" fill="url(#glow-blossom)" />
        <path d="M48 178H134" stroke="#4A3F35" stroke-width="3" stroke-linecap="round" />
        <path d="M132 178V52C132 30 116 20 104 20C95 20 90 26 90 35" stroke="#C99A3B" stroke-width="2.6" stroke-linecap="round" />
        <rect x="81" y="34" width="18" height="6" rx="3" fill="#C99A3B" />
        <path d="M52 64C52 48 68 38 90 38C112 38 128 48 128 64H52Z" fill="#FFFDF7" stroke="#C99A3B" stroke-width="1.8" />
        <ellipse cx="90" cy="64" rx="38" ry="5.5" fill="#F6E5A7" opacity="0.82" />
        <path d="M58 68L68 118H112L122 68H58Z" fill="#F6E5A7" opacity="0.32" />
        <rect x="64" y="114" width="52" height="60" rx="10" fill="url(#jar-blossom)" stroke="#B87B72" stroke-opacity="0.42" stroke-width="1.5" />
        <rect x="64" y="114" width="52" height="12" rx="6" fill="#FFFDF7" opacity="0.9" />
        <circle cx="90" cy="144" r="3" fill="#C99A3B" />
        <circle cx="90" cy="136.5" r="4.5" fill="#B87B72" fill-opacity="0.22" stroke="#B87B72" stroke-width="1.2" />
        <circle cx="97" cy="141.5" r="4.5" fill="#B87B72" fill-opacity="0.22" stroke="#B87B72" stroke-width="1.2" />
        <circle cx="94.5" cy="150" r="4.5" fill="#B87B72" fill-opacity="0.22" stroke="#B87B72" stroke-width="1.2" />
        <circle cx="85.5" cy="150" r="4.5" fill="#B87B72" fill-opacity="0.22" stroke="#B87B72" stroke-width="1.2" />
        <circle cx="83" cy="141.5" r="4.5" fill="#B87B72" fill-opacity="0.22" stroke="#B87B72" stroke-width="1.2" />
      </svg>
    `;
  }

  function renderProductPlaceholder(product) {
    return `
      <div class="product-placeholder product-placeholder--${escapeHTML(product.placeholderVariant)}">
        ${renderScentMotifSVG(product.placeholderVariant)}
        <span class="placeholder-label">${escapeHTML(product.name)}</span>
        <span class="placeholder-sub">${escapeHTML(product.placeholderCaption)}</span>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     1. Product Card
     ------------------------------------------------------------------------ */
  App.renderProductCard = function renderProductCard(product, index) {
    const delayClass = index > 0 ? ' reveal-delay-' + index : '';
    const notesMarkup = product.notes
      .map(function (note) {
        return `<span class="note-chip">${escapeHTML(note)}</span>`;
      })
      .join('');

    return `
      <article class="product-card reveal${delayClass}" data-product-id="${escapeHTML(product.id)}">
        <div
          class="product-media"
          role="button"
          tabindex="0"
          aria-label="Xem chi tiết sản phẩm ${escapeHTML(product.name)}"
          data-action="open-detail"
          data-product-id="${escapeHTML(product.id)}"
        >
          <span class="product-badge">${escapeHTML(product.badge)}</span>
          ${renderProductPlaceholder(product)}
          <img
            class="product-img"
            data-product-img
            src="${escapeHTML(product.image)}"
            alt="Đèn thư giãn tích hợp nến thơm đuổi muỗi ${escapeHTML(product.name)}"
            loading="lazy"
          />
          <span class="product-quick-view-pill">Xem chi tiết</span>
        </div>

        <div class="product-body">
          <div class="product-top-row">
            <h3
              class="product-title"
              data-action="open-detail"
              data-product-id="${escapeHTML(product.id)}"
            >${escapeHTML(product.name)}</h3>
            <span class="product-price">${App.formatVND(product.price)}</span>
          </div>

          <p class="product-scent-subtitle">${escapeHTML(product.subtitle)}</p>
          <p class="product-desc">${escapeHTML(product.shortDesc)}</p>

          <div class="product-notes" aria-label="Nốt hương chính">
            ${notesMarkup}
          </div>

          <div class="product-actions">
            <button
              type="button"
              class="btn btn-secondary"
              data-action="open-detail"
              data-product-id="${escapeHTML(product.id)}"
            >
              Xem chi tiết
            </button>
            <button
              type="button"
              class="btn btn-primary"
              data-action="buy-now"
              data-product-id="${escapeHTML(product.id)}"
            >
              Đặt mua ngay
            </button>
          </div>
        </div>
      </article>
    `;
  };

  /* ------------------------------------------------------------------------
     2. Product Detail Modal
     ------------------------------------------------------------------------ */
  App.renderProductModalContent = function renderProductModalContent(product, qty) {
    const specsMarkup = product.specs
      .map(function (spec) {
        return `
          <div class="spec-item">
            <span class="spec-label">${escapeHTML(spec.label)}</span>
            <span class="spec-value">${escapeHTML(spec.value)}</span>
          </div>
        `;
      })
      .join('');

    return `
      <div class="product-modal-grid">
        <div class="modal-media">
          <span class="product-badge">${escapeHTML(product.badge)}</span>
          ${renderProductPlaceholder(product)}
          <img
            class="product-img"
            data-product-img
            src="${escapeHTML(product.image)}"
            alt="Đèn thư giãn nến thơm đuổi muỗi ${escapeHTML(product.name)}"
          />
        </div>

        <div class="modal-body">
          <div class="modal-header-block">
            <span class="modal-mood-pill">${escapeHTML(product.subtitle)}</span>
            <h3 class="modal-title" id="product-modal-title">${escapeHTML(product.name)}</h3>
            <div class="modal-price-row">
              <span class="modal-price">${App.formatVND(product.price)}</span>
              <span class="modal-stock">Sẵn hàng · Trọn bộ đèn &amp; nến</span>
            </div>
          </div>

          <p class="modal-desc">${escapeHTML(product.fullDesc)}</p>

          <div class="scent-pyramid">
            <h4 class="scent-pyramid-heading">Tầng hương đặc trưng</h4>
            <div class="scent-tiers">
              <div class="scent-tier">
                <span class="scent-tier-label">Hương đầu</span>
                <span class="scent-tier-value">${escapeHTML(product.scentPyramid.top)}</span>
              </div>
              <div class="scent-tier">
                <span class="scent-tier-label">Hương giữa</span>
                <span class="scent-tier-value">${escapeHTML(product.scentPyramid.heart)}</span>
              </div>
              <div class="scent-tier">
                <span class="scent-tier-label">Hương cuối</span>
                <span class="scent-tier-value">${escapeHTML(product.scentPyramid.base)}</span>
              </div>
            </div>
          </div>

          <div class="specs-grid">
            ${specsMarkup}
          </div>

          <div class="modal-purchase-bar">
            <div class="qty-row">
              <span class="qty-label">Số lượng</span>
              <div class="qty-stepper" role="group" aria-label="Chọn số lượng">
                <button type="button" class="qty-btn" data-action="modal-qty-dec" aria-label="Giảm số lượng">−</button>
                <span class="qty-value" id="modal-qty-value">${qty}</span>
                <button type="button" class="qty-btn" data-action="modal-qty-inc" aria-label="Tăng số lượng">+</button>
              </div>
            </div>

            <div class="modal-cta-row">
              <button
                type="button"
                class="btn btn-secondary"
                data-action="modal-add-cart"
                data-product-id="${escapeHTML(product.id)}"
              >
                Thêm vào giỏ
              </button>
              <button
                type="button"
                class="btn btn-primary"
                data-action="modal-buy-now"
                data-product-id="${escapeHTML(product.id)}"
              >
                Đặt mua ngay · ${App.formatVND(product.price * qty)}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  /* ------------------------------------------------------------------------
     3. Cart Drawer
     ------------------------------------------------------------------------ */
  App.renderCartDrawerContent = function renderCartDrawerContent(state) {
    const totalQty = App.store.getTotalItems();
    const subtotal = App.store.getSubtotal();
    const shippingFee = App.store.getShippingFee();
    const grandTotal = App.store.getGrandTotal();

    if (state.cart.length === 0) {
      return {
        bodyHTML: `
          <div class="cart-empty">
            <div class="cart-empty-icon" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <h4>Giỏ hàng đang trống</h4>
            <p>Hãy chọn mùi hương đèn nến yêu thích để mang ánh sáng ấm áp về phòng ngủ của bạn.</p>
            <button type="button" class="btn btn-primary" data-action="cart-explore">
              Khám phá 3 mùi hương
            </button>
          </div>
        `,
        footerHTML: ''
      };
    }

    const itemsHTML = state.cart
      .map(function (entry) {
        const product = App.getProductById(entry.id);
        if (!product) return '';
        return `
          <li class="cart-item">
            <div class="cart-item-thumb product-placeholder--${escapeHTML(product.placeholderVariant)}">
              <span class="cart-item-thumb-code">${escapeHTML(product.name)}</span>
              <img
                data-product-img
                src="${escapeHTML(product.image)}"
                alt="${escapeHTML(product.name)}"
              />
            </div>
            <div class="cart-item-info">
              <div>
                <div class="cart-item-top">
                  <span class="cart-item-name">${escapeHTML(product.name)}</span>
                  <button
                    type="button"
                    class="cart-item-remove"
                    data-action="cart-remove"
                    data-product-id="${escapeHTML(product.id)}"
                    aria-label="Xóa ${escapeHTML(product.name)}"
                  >Xóa</button>
                </div>
                <p class="cart-item-meta">${App.formatVND(product.price)} / bộ</p>
              </div>
              <div class="cart-item-bottom">
                <span class="cart-item-price">${App.formatVND(product.price * entry.qty)}</span>
                <div class="cart-item-stepper">
                  <button
                    type="button"
                    data-action="cart-dec"
                    data-product-id="${escapeHTML(product.id)}"
                    aria-label="Giảm số lượng ${escapeHTML(product.name)}"
                  >−</button>
                  <span>${entry.qty}</span>
                  <button
                    type="button"
                    data-action="cart-inc"
                    data-product-id="${escapeHTML(product.id)}"
                    aria-label="Tăng số lượng ${escapeHTML(product.name)}"
                  >+</button>
                </div>
              </div>
            </div>
          </li>
        `;
      })
      .join('');

    const freeShipNeed = Math.max(0, App.STORE_INFO.freeShippingThreshold - totalQty);
    const shippingMessage =
      freeShipNeed === 0
        ? 'Bạn đã nhận ưu đãi <strong>Miễn phí giao hàng toàn quốc</strong>.'
        : `Thêm <strong>${freeShipNeed} bộ</strong> nữa để được miễn phí giao hàng (hiện tại ${App.formatVND(shippingFee)}).`;

    return {
      bodyHTML: `<ul class="cart-list">${itemsHTML}</ul>`,
      footerHTML: `
        <div class="cart-shipping-note">${shippingMessage}</div>
        <div class="cart-totals-stack">
          <div class="cart-summary-row cart-summary-row--sub">
            <span class="cart-summary-label">Tạm tính (${totalQty} bộ)</span>
            <span>${App.formatVND(subtotal)}</span>
          </div>
          <div class="cart-summary-row cart-summary-row--sub">
            <span class="cart-summary-label">Phí giao hàng</span>
            <span>${shippingFee === 0 ? 'Miễn phí' : App.formatVND(shippingFee)}</span>
          </div>
          <div class="cart-summary-row cart-summary-row--grand">
            <span class="cart-summary-label">Tổng thanh toán</span>
            <span class="cart-summary-total">${App.formatVND(grandTotal)}</span>
          </div>
        </div>
        <button type="button" class="btn btn-primary btn-full" data-action="open-checkout">
          Tiến hành đặt hàng · ${App.formatVND(grandTotal)}
        </button>
      `
    };
  };

  /* ------------------------------------------------------------------------
     4. Checkout Modal Summary
     ------------------------------------------------------------------------ */
  App.renderCheckoutSummary = function renderCheckoutSummary(state) {
    const subtotal = App.store.getSubtotal();
    const shippingFee = App.store.getShippingFee();
    const grandTotal = App.store.getGrandTotal();

    const rowsHTML = state.cart
      .map(function (entry) {
        const product = App.getProductById(entry.id);
        if (!product) return '';
        return `
          <li class="checkout-item-row">
            <div class="checkout-item-thumb product-placeholder--${escapeHTML(product.placeholderVariant)}">
              <img data-product-img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" />
            </div>
            <div class="checkout-item-meta">
              <span class="checkout-item-name">${escapeHTML(product.name)}</span>
              <span class="checkout-item-qty">Số lượng: ${entry.qty} × ${App.formatVND(product.price)}</span>
            </div>
            <strong class="checkout-item-price">${App.formatVND(product.price * entry.qty)}</strong>
          </li>
        `;
      })
      .join('');

    return `
      <h4 class="checkout-summary-title">Đơn hàng của bạn</h4>
      <ul class="checkout-item-list">${rowsHTML}</ul>
      <div class="checkout-summary-totals">
        <div class="checkout-total-row">
          <span>Tạm tính</span>
          <span>${App.formatVND(subtotal)}</span>
        </div>
        <div class="checkout-total-row">
          <span>Phí giao hàng</span>
          <span>${shippingFee === 0 ? 'Miễn phí' : App.formatVND(shippingFee)}</span>
        </div>
        <div class="checkout-total-row checkout-total-row--final">
          <span>Tổng cộng</span>
          <strong>${App.formatVND(grandTotal)}</strong>
        </div>
      </div>
    `;
  };

  /* ------------------------------------------------------------------------
     5. Order Confirmation Popup Content
     ------------------------------------------------------------------------ */
  App.renderOrderSuccessContent = function renderOrderSuccessContent(order) {
    const bank = (App.CONFIG && App.CONFIG.bankTransfer) || {};
    const paymentLabel =
      order.paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng (COD)';

    const itemsHTML = order.items
      .map(function (item) {
        return `
          <li class="order-receipt-item">
            <span>${escapeHTML(item.name)} <em>× ${item.qty}</em></span>
            <strong>${App.formatVND(item.price * item.qty)}</strong>
          </li>
        `;
      })
      .join('');

    const bankBoxHTML =
      order.paymentMethod === 'bank'
        ? `
          <div class="bank-transfer-receipt">
            <p class="bank-receipt-title">Thông tin chuyển khoản nhanh</p>
            <p><strong>${escapeHTML(bank.bankName)}</strong> · STK: <strong class="mono-text">${escapeHTML(bank.accountNumber)}</strong></p>
            <p>Chủ TK: ${escapeHTML(bank.accountName)}</p>
            <p>Nội dung CK: <strong class="mono-text">${escapeHTML(order.orderCode)}</strong></p>
          </div>
        `
        : '';

    return `
      <div class="order-success-view">
        <div class="consult-success-icon order-success-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <span class="order-success-eyebrow">Đặt hàng thành công</span>
        <h3 id="order-success-title">Cảm ơn ${escapeHTML(order.customerName)}!</h3>
        <p class="order-success-lead">
          Đơn hàng của bạn đã được LUMIÈN tiếp nhận. Nhân viên sẽ sớm gọi xác nhận trước khi gửi giao hàng.
        </p>

        <div class="order-code-card">
          <div>
            <span class="order-code-label">Mã đơn hàng của bạn</span>
            <strong class="order-code-value" id="confirmed-order-code">${escapeHTML(order.orderCode)}</strong>
          </div>
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            data-action="copy-text"
            data-copy="${escapeHTML(order.orderCode)}"
          >
            Sao chép mã
          </button>
        </div>

        <div class="order-receipt-box">
          <div class="order-receipt-section">
            <h4>Tóm tắt sản phẩm</h4>
            <ul class="order-receipt-list">${itemsHTML}</ul>
            <div class="order-receipt-totals">
              <div>
                <span>Phí giao hàng</span>
                <span>${order.shippingFee === 0 ? 'Miễn phí' : App.formatVND(order.shippingFee)}</span>
              </div>
              <div class="order-receipt-grand">
                <span>Tổng thanh toán</span>
                <strong>${App.formatVND(order.total)}</strong>
              </div>
            </div>
          </div>

          <div class="order-receipt-section order-receipt-customer">
            <h4>Thông tin nhận hàng</h4>
            <p><strong>Người nhận:</strong> ${escapeHTML(order.customerName)} · ${escapeHTML(order.phone)}</p>
            <p><strong>Địa chỉ:</strong> ${escapeHTML(order.address)}</p>
            <p><strong>Thanh toán:</strong> ${escapeHTML(paymentLabel)}</p>
            ${order.note ? `<p><strong>Ghi chú:</strong> ${escapeHTML(order.note)}</p>` : ''}
            <p><strong>Thời gian:</strong> ${escapeHTML(App.formatDateTime(order.createdAt))}</p>
          </div>

          ${bankBoxHTML}
        </div>

        <div class="order-success-actions">
          <button type="button" class="btn btn-primary" data-action="close-order-success">
            Tiếp tục khám phá LUMIÈN
          </button>
        </div>
      </div>
    `;
  };

  /* ------------------------------------------------------------------------
     Progressive Image Binder
     ------------------------------------------------------------------------ */
  App.bindProductImages = function bindProductImages(rootEl) {
    const container = rootEl || document;
    const imgs = container.querySelectorAll('img[data-product-img]');

    imgs.forEach(function (img) {
      if (img.dataset.bound === 'true') return;
      img.dataset.bound = 'true';

      function markLoaded() {
        if (img.naturalWidth > 0) {
          img.classList.add('is-loaded');
        }
      }

      function markFallback() {
        img.classList.remove('is-loaded');
      }

      img.addEventListener('load', markLoaded);
      img.addEventListener('error', markFallback);

      if (img.complete) {
        if (img.naturalWidth > 0) markLoaded();
        else markFallback();
      }
    });
  };
})(window);
