/* ==========================================================================
   LUMIÈN — Main Application Controller (Phase 1 + Phase 2)
   Handles Storefront, Modals, Cart, Full Checkout, Contact Form, Chat & Admin
   ========================================================================== */

(function (global) {
  'use strict';

  const App = (global.LumienApp = global.LumienApp || {});

  const DOM = {};
  let toastTimer = null;

  function cacheDOM() {
    DOM.header = document.getElementById('site-header');
    DOM.productsGrid = document.getElementById('products-grid');
    DOM.cartBadge = document.getElementById('cart-badge');

    // Mobile Nav
    DOM.mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    DOM.menuToggle = document.getElementById('menu-toggle');
    DOM.mobileNavClose = document.getElementById('mobile-nav-close');

    // Product Detail Modal
    DOM.productModal = document.getElementById('product-modal');
    DOM.productModalSlot = document.getElementById('product-modal-slot');

    // Cart Drawer
    DOM.cartOverlay = document.getElementById('cart-drawer-overlay');
    DOM.cartBody = document.getElementById('cart-drawer-body');
    DOM.cartFooter = document.getElementById('cart-drawer-footer');

    // Checkout Modal & Order Confirmation Popup
    DOM.checkoutModal = document.getElementById('checkout-modal');
    DOM.checkoutSummarySlot = document.getElementById('checkout-summary-slot');
    DOM.checkoutForm = document.getElementById('checkout-form');
    DOM.bankInfoBox = document.getElementById('checkout-bank-info');
    DOM.orderSuccessModal = document.getElementById('order-success-modal');
    DOM.orderSuccessSlot = document.getElementById('order-success-slot');

    // Contact Section Form
    DOM.contactForm = document.getElementById('contact-section-form');
    DOM.contactSuccessBanner = document.getElementById('contact-success-banner');

    // Hero Showcase (Real Photo Switcher + Interactive Light Dimmer)
    DOM.lampStage = document.getElementById('hero-lamp-stage');
    DOM.heroShowcaseImg = document.getElementById('hero-showcase-img');
    DOM.heroScentLabel = document.getElementById('hero-scent-label');
    DOM.dimmerBtns = document.querySelectorAll('[data-dimmer-level]');
    DOM.heroScentBtns = document.querySelectorAll('[data-hero-scent]');

    // Toast & Nav
    DOM.toastContainer = document.getElementById('toast-container');
    DOM.navLinks = document.querySelectorAll('.nav-desktop .nav-link');
  }

  /* ------------------------------------------------------------------------
     Body Scroll Lock & Toast Helper (Shared on App)
     ------------------------------------------------------------------------ */
  function syncBodyLock() {
    const adminOpen = App.admin && App.admin.isOpen();
    const anyOpen =
      (DOM.mobileNavOverlay && DOM.mobileNavOverlay.classList.contains('is-open')) ||
      (DOM.productModal && DOM.productModal.classList.contains('is-open')) ||
      (DOM.cartOverlay && DOM.cartOverlay.classList.contains('is-open')) ||
      (DOM.checkoutModal && DOM.checkoutModal.classList.contains('is-open')) ||
      (DOM.orderSuccessModal && DOM.orderSuccessModal.classList.contains('is-open')) ||
      adminOpen;

    document.body.classList.toggle('no-scroll', Boolean(anyOpen));
  }

  function showToast(message) {
    if (!DOM.toastContainer) return;

    DOM.toastContainer.textContent = '';

    const toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');

    const dotEl = document.createElement('span');
    dotEl.className = 'toast-dot';
    dotEl.setAttribute('aria-hidden', 'true');

    const textEl = document.createElement('span');
    textEl.textContent = message;

    toastEl.appendChild(dotEl);
    toastEl.appendChild(textEl);
    DOM.toastContainer.appendChild(toastEl);

    void toastEl.offsetWidth;
    toastEl.classList.add('is-visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 3000);
  }

  App.syncBodyLock = syncBodyLock;
  App.showToast = showToast;

  /* ------------------------------------------------------------------------
     Inline Form Error Helpers
     ------------------------------------------------------------------------ */
  function setFieldError(formEl, fieldName, message) {
    const input = formEl.elements[fieldName];
    const errEl = formEl.querySelector(`[data-error-for="${fieldName}"]`);
    if (input) {
      input.classList.toggle('is-invalid', Boolean(message));
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
    if (errEl) {
      errEl.textContent = message || '';
      errEl.hidden = !message;
    }
  }

  function clearAllFieldErrors(formEl) {
    if (!formEl) return;
    formEl.querySelectorAll('.is-invalid').forEach(function (el) {
      el.classList.remove('is-invalid');
      el.setAttribute('aria-invalid', 'false');
    });
    formEl.querySelectorAll('[data-error-for]').forEach(function (el) {
      el.textContent = '';
      el.hidden = true;
    });
  }

  /* ------------------------------------------------------------------------
     Overlays Open / Close
     ------------------------------------------------------------------------ */
  function openMobileNav() {
    DOM.mobileNavOverlay.classList.add('is-open');
    DOM.mobileNavOverlay.setAttribute('aria-hidden', 'false');
    DOM.menuToggle.setAttribute('aria-expanded', 'true');
    syncBodyLock();
  }

  function closeMobileNav() {
    if (!DOM.mobileNavOverlay) return;
    DOM.mobileNavOverlay.classList.remove('is-open');
    DOM.mobileNavOverlay.setAttribute('aria-hidden', 'true');
    if (DOM.menuToggle) DOM.menuToggle.setAttribute('aria-expanded', 'false');
    syncBodyLock();
  }

  function openProductModal(productId) {
    const product = App.getProductById(productId);
    if (!product) return;

    App.store.setActiveProduct(productId);
    DOM.productModal.classList.add('is-open');
    DOM.productModal.setAttribute('aria-hidden', 'false');
    syncBodyLock();
  }

  function closeProductModal() {
    if (!DOM.productModal) return;
    DOM.productModal.classList.remove('is-open');
    DOM.productModal.setAttribute('aria-hidden', 'true');
    App.store.setActiveProduct(null);
    syncBodyLock();
  }

  function openCartDrawer() {
    DOM.cartOverlay.classList.add('is-open');
    DOM.cartOverlay.setAttribute('aria-hidden', 'false');
    syncBodyLock();
  }

  function closeCartDrawer() {
    if (!DOM.cartOverlay) return;
    DOM.cartOverlay.classList.remove('is-open');
    DOM.cartOverlay.setAttribute('aria-hidden', 'true');
    syncBodyLock();
  }

  function openCheckoutModal() {
    if (App.store.getTotalItems() === 0) {
      showToast('Giỏ hàng của bạn đang trống.');
      return;
    }
    closeCartDrawer();
    clearAllFieldErrors(DOM.checkoutForm);
    renderCheckoutSummaryPanel();
    DOM.checkoutModal.classList.add('is-open');
    DOM.checkoutModal.setAttribute('aria-hidden', 'false');
    syncBodyLock();
  }

  function closeCheckoutModal() {
    if (!DOM.checkoutModal) return;
    DOM.checkoutModal.classList.remove('is-open');
    DOM.checkoutModal.setAttribute('aria-hidden', 'true');
    syncBodyLock();
  }

  function openOrderSuccessModal(order) {
    if (!DOM.orderSuccessModal || !DOM.orderSuccessSlot) return;
    DOM.orderSuccessSlot.innerHTML = App.renderOrderSuccessContent(order);
    DOM.orderSuccessModal.classList.add('is-open');
    DOM.orderSuccessModal.setAttribute('aria-hidden', 'false');
    syncBodyLock();
  }

  function closeOrderSuccessModal() {
    if (!DOM.orderSuccessModal) return;
    DOM.orderSuccessModal.classList.remove('is-open');
    DOM.orderSuccessModal.setAttribute('aria-hidden', 'true');
    syncBodyLock();
  }

  /* ------------------------------------------------------------------------
     Renderers Synced with Store
     ------------------------------------------------------------------------ */
  function renderProductsSection() {
    if (!DOM.productsGrid) return;
    DOM.productsGrid.innerHTML = App.PRODUCTS.map(function (product, idx) {
      return App.renderProductCard(product, idx);
    }).join('');
    App.bindProductImages(DOM.productsGrid);
  }

  function renderCartBadge(animate) {
    if (!DOM.cartBadge) return;
    const total = App.store.getTotalItems();
    DOM.cartBadge.textContent = String(total);
    DOM.cartBadge.hidden = total === 0;

    if (animate && total > 0) {
      DOM.cartBadge.classList.remove('is-bump');
      void DOM.cartBadge.offsetWidth;
      DOM.cartBadge.classList.add('is-bump');
    }
  }

  function renderCheckoutSummaryPanel() {
    if (!DOM.checkoutSummarySlot) return;
    DOM.checkoutSummarySlot.innerHTML = App.renderCheckoutSummary(App.store.getState());
    App.bindProductImages(DOM.checkoutSummarySlot);
  }

  function renderFromState(state) {
    renderCartBadge(false);

    if (state.activeProductId && DOM.productModalSlot) {
      const product = App.getProductById(state.activeProductId);
      if (product) {
        DOM.productModalSlot.innerHTML = App.renderProductModalContent(product, state.modalQty);
        App.bindProductImages(DOM.productModalSlot);
      }
    }

    if (DOM.cartBody && DOM.cartFooter) {
      const rendered = App.renderCartDrawerContent(state);
      DOM.cartBody.innerHTML = rendered.bodyHTML;
      DOM.cartFooter.innerHTML = rendered.footerHTML;
      DOM.cartFooter.hidden = rendered.footerHTML === '';
      App.bindProductImages(DOM.cartBody);
    }

    if (DOM.checkoutModal && DOM.checkoutModal.classList.contains('is-open')) {
      renderCheckoutSummaryPanel();
    }
  }

  /* ------------------------------------------------------------------------
     Clipboard Helper
     ------------------------------------------------------------------------ */
  function copyToClipboard(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(function () {
          showToast(`Đã sao chép: ${text}`);
        })
        .catch(function () {
          showToast(`Mã: ${text}`);
        });
    } else {
      showToast(`Mã: ${text}`);
    }
  }

  /* ------------------------------------------------------------------------
     Event Delegation
     ------------------------------------------------------------------------ */
  function handleDocumentClick(event) {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const productId = target.dataset.productId;

    switch (action) {
      case 'open-detail':
        openProductModal(productId);
        break;

      case 'buy-now': {
        const product = App.getProductById(productId);
        if (!product) break;
        App.store.addToCart(productId, 1);
        renderCartBadge(true);
        showToast(`Đã thêm "${product.name}" vào giỏ hàng`);
        openCartDrawer();
        break;
      }

      case 'open-cart':
        openCartDrawer();
        break;

      case 'close-cart':
        closeCartDrawer();
        break;

      case 'open-checkout':
        openCheckoutModal();
        break;

      case 'close-checkout':
        closeCheckoutModal();
        break;

      case 'back-to-cart':
        closeCheckoutModal();
        openCartDrawer();
        break;

      case 'close-order-success':
        closeOrderSuccessModal();
        break;

      case 'close-product-modal':
        closeProductModal();
        break;

      case 'open-consult':
      case 'open-chat':
        closeMobileNav();
        if (App.chat) App.chat.open({ expandContact: action === 'open-consult' });
        break;

      case 'open-admin':
        closeMobileNav();
        if (App.admin) App.admin.open();
        break;

      case 'copy-text':
        copyToClipboard(target.dataset.copy);
        break;

      case 'modal-qty-dec':
        App.store.setModalQty(-1);
        break;

      case 'modal-qty-inc':
        App.store.setModalQty(1);
        break;

      case 'modal-add-cart': {
        const state = App.store.getState();
        const product = App.getProductById(productId);
        if (!product) break;
        App.store.addToCart(productId, state.modalQty);
        renderCartBadge(true);
        closeProductModal();
        showToast(`Đã thêm ${state.modalQty} bộ "${product.name}" vào giỏ`);
        break;
      }

      case 'modal-buy-now': {
        const state = App.store.getState();
        const product = App.getProductById(productId);
        if (!product) break;
        App.store.addToCart(productId, state.modalQty);
        renderCartBadge(true);
        closeProductModal();
        openCheckoutModal();
        break;
      }

      case 'cart-inc':
        App.store.updateQty(productId, 1);
        break;

      case 'cart-dec':
        App.store.updateQty(productId, -1);
        break;

      case 'cart-remove':
        App.store.removeItem(productId);
        break;

      case 'cart-explore':
        closeCartDrawer();
        document.getElementById('san-pham')?.scrollIntoView({ behavior: 'smooth' });
        break;

      default:
        break;
    }
  }

  function handleDocumentKeydown(event) {
    if (event.key === 'Escape') {
      closeProductModal();
      closeCheckoutModal();
      closeOrderSuccessModal();
      closeCartDrawer();
      closeMobileNav();
      if (App.chat && App.chat.isOpen()) App.chat.close();
      if (App.admin && App.admin.isOpen()) App.admin.close();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      const trigger = event.target.closest('.product-media[data-action="open-detail"]');
      if (trigger) {
        event.preventDefault();
        openProductModal(trigger.dataset.productId);
      }
    }
  }

  function handleBackdropClick(overlay, closeFn) {
    if (!overlay) return;
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeFn();
    });
  }

  /* ------------------------------------------------------------------------
     Checkout Form & Contact Section Form Validation
     ------------------------------------------------------------------------ */
  function bindCheckoutForm() {
    if (!DOM.checkoutForm) return;

    // Toggle bank transfer details box when payment radio changes
    DOM.checkoutForm.addEventListener('change', function (event) {
      if (event.target.name === 'paymentMethod' && DOM.bankInfoBox) {
        DOM.bankInfoBox.hidden = event.target.value !== 'bank';
      }
    });

    // Clear inline error as customer types
    DOM.checkoutForm.addEventListener('input', function (event) {
      if (event.target.name) {
        setFieldError(DOM.checkoutForm, event.target.name, '');
      }
    });

    DOM.checkoutForm.addEventListener('submit', function (event) {
      event.preventDefault();
      clearAllFieldErrors(DOM.checkoutForm);

      const name = DOM.checkoutForm.elements.customerName.value.trim();
      const phone = DOM.checkoutForm.elements.phone.value.trim();
      const address = DOM.checkoutForm.elements.address.value.trim();
      const paymentMethod = DOM.checkoutForm.elements.paymentMethod.value || 'cod';
      const note = DOM.checkoutForm.elements.note.value.trim();

      let firstInvalid = null;

      if (name.length < 2) {
        setFieldError(DOM.checkoutForm, 'customerName', 'Vui lòng nhập họ và tên người nhận.');
        firstInvalid = firstInvalid || DOM.checkoutForm.elements.customerName;
      }

      if (!phone) {
        setFieldError(DOM.checkoutForm, 'phone', 'Vui lòng nhập số điện thoại liên hệ.');
        firstInvalid = firstInvalid || DOM.checkoutForm.elements.phone;
      } else if (!App.validators.isValidVNPhone(phone)) {
        setFieldError(DOM.checkoutForm, 'phone', 'Số điện thoại không hợp lệ (VD: 0908 682 468).');
        firstInvalid = firstInvalid || DOM.checkoutForm.elements.phone;
      }

      if (address.length < 8) {
        setFieldError(DOM.checkoutForm, 'address', 'Vui lòng nhập địa chỉ giao hàng cụ thể hơn.');
        firstInvalid = firstInvalid || DOM.checkoutForm.elements.address;
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const createdOrder = App.store.createOrder({
        customerName: name,
        phone: phone,
        address: address,
        paymentMethod: paymentMethod,
        note: note
      });

      if (!createdOrder) {
        showToast('Giỏ hàng đang trống, vui lòng chọn sản phẩm trước.');
        return;
      }

      DOM.checkoutForm.reset();
      if (DOM.bankInfoBox) DOM.bankInfoBox.hidden = true;
      closeCheckoutModal();
      openOrderSuccessModal(createdOrder);
      showToast(`Đặt hàng thành công! Mã đơn: ${createdOrder.orderCode}`);
    });
  }

  function bindContactSectionForm() {
    if (!DOM.contactForm) return;

    DOM.contactForm.addEventListener('input', function (event) {
      if (event.target.name) {
        setFieldError(DOM.contactForm, event.target.name, '');
      }
      if (DOM.contactSuccessBanner) {
        DOM.contactSuccessBanner.hidden = true;
      }
    });

    DOM.contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      clearAllFieldErrors(DOM.contactForm);

      const name = DOM.contactForm.elements.customerName.value.trim();
      const phone = DOM.contactForm.elements.phone.value.trim();
      const message = DOM.contactForm.elements.message.value.trim();

      let firstInvalid = null;

      if (name.length < 2) {
        setFieldError(DOM.contactForm, 'customerName', 'Vui lòng nhập tên của bạn.');
        firstInvalid = firstInvalid || DOM.contactForm.elements.customerName;
      }

      if (!phone) {
        setFieldError(DOM.contactForm, 'phone', 'Vui lòng nhập số điện thoại để shop phản hồi.');
        firstInvalid = firstInvalid || DOM.contactForm.elements.phone;
      } else if (!App.validators.isValidVNPhone(phone)) {
        setFieldError(DOM.contactForm, 'phone', 'Số điện thoại chưa đúng định dạng (VD: 0908 682 468).');
        firstInvalid = firstInvalid || DOM.contactForm.elements.phone;
      }

      if (message.length < 5) {
        setFieldError(DOM.contactForm, 'message', 'Vui lòng nhập nội dung bạn cần hỗ trợ.');
        firstInvalid = firstInvalid || DOM.contactForm.elements.message;
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      App.store.addContactRequest({
        customerName: name,
        phone: phone,
        message: message
      });

      DOM.contactForm.reset();
      if (DOM.contactSuccessBanner) {
        DOM.contactSuccessBanner.hidden = false;
      }
      showToast('LUMIÈN đã nhận lời nhắn và sẽ liên hệ bạn sớm!');
    });
  }

  /* ------------------------------------------------------------------------
     Hero Interactive Photo Switcher & Dimmer
     ------------------------------------------------------------------------ */
  function bindHeroShowcase() {
    if (DOM.heroShowcaseImg) {
      App.bindProductImages(DOM.lampStage);
    }

    if (DOM.lampStage && DOM.dimmerBtns.length) {
      DOM.dimmerBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const level = btn.dataset.dimmerLevel;
          DOM.lampStage.style.setProperty('--lamp-glow', level);
          DOM.dimmerBtns.forEach(function (item) {
            const active = item === btn;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-pressed', String(active));
          });
        });
      });
    }

    if (DOM.heroScentBtns.length && DOM.heroShowcaseImg) {
      DOM.heroScentBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const product = App.getProductById(btn.dataset.heroScent);
          if (!product) return;

          DOM.heroShowcaseImg.src = product.image;
          DOM.heroShowcaseImg.alt = `Đèn thư giãn tích hợp nến thơm đuổi muỗi ${product.name}`;
          if (DOM.heroScentLabel) {
            DOM.heroScentLabel.textContent = `${product.name} · ${App.formatVND(product.price)}`;
          }

          DOM.heroScentBtns.forEach(function (item) {
            const active = item === btn;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-pressed', String(active));
          });
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     Header Scroll State, Active Nav Highlight & Scroll Reveal
     ------------------------------------------------------------------------ */
  function bindScrollEnhancements() {
    function onScroll() {
      if (DOM.header) {
        DOM.header.classList.toggle('is-scrolled', window.scrollY > 18);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
      );

      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });

      const sectionIds = ['trang-chu', 'cong-dung', 'san-pham', 'lien-he'];
      const navObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            const activeId = entry.target.id;
            DOM.navLinks.forEach(function (link) {
              link.classList.toggle('is-active', link.getAttribute('href') === '#' + activeId);
            });
          });
        },
        { rootMargin: '-35% 0px -55% 0px' }
      );

      sectionIds.forEach(function (id) {
        const el = document.getElementById(id);
        if (el) navObserver.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  }

  /* ------------------------------------------------------------------------
     Bootstrap
     ------------------------------------------------------------------------ */
  function init() {
    cacheDOM();
    renderProductsSection();

    App.store.subscribe(renderFromState);
    renderFromState(App.store.getState());

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleDocumentKeydown);

    if (DOM.menuToggle) DOM.menuToggle.addEventListener('click', openMobileNav);
    if (DOM.mobileNavClose) DOM.mobileNavClose.addEventListener('click', closeMobileNav);

    document.querySelectorAll('.mobile-nav-link').forEach(function (link) {
      link.addEventListener('click', closeMobileNav);
    });

    handleBackdropClick(DOM.mobileNavOverlay, closeMobileNav);
    handleBackdropClick(DOM.productModal, closeProductModal);
    handleBackdropClick(DOM.cartOverlay, closeCartDrawer);
    handleBackdropClick(DOM.checkoutModal, closeCheckoutModal);
    handleBackdropClick(DOM.orderSuccessModal, closeOrderSuccessModal);

    bindCheckoutForm();
    bindContactSectionForm();
    bindHeroShowcase();
    bindScrollEnhancements();

    if (App.chat) App.chat.init();
    if (App.admin) App.admin.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
