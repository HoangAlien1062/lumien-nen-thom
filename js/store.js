/* ==========================================================================
   LUMIÈN — Reactive State Store (Cart, Orders, Chat Leads & Contact Requests)
   Persists locally in localStorage + triggers Webhook notifications for seller.
   ========================================================================== */

(function (global) {
  'use strict';

  const App = (global.LumienApp = global.LumienApp || {});

  const KEYS = {
    CART: 'lumien_phase2_cart_v1',
    LEGACY_CART: 'lumien_phase1_cart_v1',
    ORDERS: 'lumien_phase2_orders_v1',
    CHAT_LEADS: 'lumien_phase2_chat_leads_v1',
    CONTACTS: 'lumien_phase2_contacts_v1'
  };

  const listeners = new Set();

  function safeReadJSON(key, fallback) {
    try {
      const raw = global.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch (_err) {
      return fallback;
    }
  }

  function safeWriteJSON(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
    } catch (_err) {
      // Ignore storage quota or private mode restrictions gracefully
    }
  }

  function loadInitialCart() {
    let list = safeReadJSON(KEYS.CART, null);
    if (!Array.isArray(list)) {
      list = safeReadJSON(KEYS.LEGACY_CART, []);
    }
    if (!Array.isArray(list)) return [];
    return list.filter(function (entry) {
      return entry && App.getProductById(entry.id) && Number(entry.qty) > 0;
    });
  }

  function generateOrderCode() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `LM-${yy}${mm}${dd}-${rand}`;
  }

  function generateRecordId(prefix) {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  }

  const state = {
    cart: loadInitialCart(),
    orders: safeReadJSON(KEYS.ORDERS, []),
    chatLeads: safeReadJSON(KEYS.CHAT_LEADS, []),
    contacts: safeReadJSON(KEYS.CONTACTS, []),
    activeProductId: null,
    modalQty: 1,
    lastOrder: null
  };

  function notify() {
    listeners.forEach(function (fn) {
      fn(state);
    });
  }

  App.store = {
    subscribe: function (listener) {
      listeners.add(listener);
      return function unsubscribe() {
        listeners.delete(listener);
      };
    },

    getState: function () {
      return state;
    },

    /* ---- Cart Operations ---- */
    getTotalItems: function () {
      return state.cart.reduce(function (sum, item) {
        return sum + item.qty;
      }, 0);
    },

    getSubtotal: function () {
      return state.cart.reduce(function (sum, item) {
        const product = App.getProductById(item.id);
        return product ? sum + product.price * item.qty : sum;
      }, 0);
    },

    getShippingFee: function () {
      const totalQty = App.store.getTotalItems();
      if (totalQty === 0) return 0;
      return totalQty >= App.STORE_INFO.freeShippingThreshold ? 0 : App.STORE_INFO.shippingFee;
    },

    getGrandTotal: function () {
      return App.store.getSubtotal() + App.store.getShippingFee();
    },

    addToCart: function (productId, qty) {
      const amount = Math.max(1, Number(qty) || 1);
      const product = App.getProductById(productId);
      if (!product) return;

      const existing = state.cart.find(function (item) {
        return item.id === productId;
      });

      if (existing) {
        existing.qty = Math.min(99, existing.qty + amount);
      } else {
        state.cart.push({ id: productId, qty: Math.min(99, amount) });
      }

      safeWriteJSON(KEYS.CART, state.cart);
      notify();
    },

    updateQty: function (productId, delta) {
      const idx = state.cart.findIndex(function (item) {
        return item.id === productId;
      });
      if (idx === -1) return;

      const nextQty = state.cart[idx].qty + delta;
      if (nextQty <= 0) {
        state.cart.splice(idx, 1);
      } else {
        state.cart[idx].qty = Math.min(99, nextQty);
      }

      safeWriteJSON(KEYS.CART, state.cart);
      notify();
    },

    removeItem: function (productId) {
      state.cart = state.cart.filter(function (item) {
        return item.id !== productId;
      });
      safeWriteJSON(KEYS.CART, state.cart);
      notify();
    },

    clearCart: function () {
      state.cart = [];
      safeWriteJSON(KEYS.CART, state.cart);
      notify();
    },

    /* ---- Modal State ---- */
    setActiveProduct: function (productId) {
      state.activeProductId = productId;
      state.modalQty = 1;
      notify();
    },

    setModalQty: function (delta) {
      state.modalQty = Math.min(20, Math.max(1, state.modalQty + delta));
      notify();
    },

    /* ---- Orders (Checkout -> Seller Panel + Webhook) ---- */
    createOrder: function (input) {
      const items = state.cart
        .map(function (entry) {
          const product = App.getProductById(entry.id);
          if (!product) return null;
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            qty: entry.qty
          };
        })
        .filter(Boolean);

      if (items.length === 0) return null;

      const subtotal = App.store.getSubtotal();
      const shippingFee = App.store.getShippingFee();
      const order = {
        orderCode: generateOrderCode(),
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        address: input.address.trim(),
        paymentMethod: input.paymentMethod === 'bank' ? 'bank' : 'cod',
        note: (input.note || '').trim(),
        items: items,
        subtotal: subtotal,
        shippingFee: shippingFee,
        total: subtotal + shippingFee,
        status: 'new',
        createdAt: new Date().toISOString()
      };

      state.orders.unshift(order);
      state.lastOrder = order;
      state.cart = [];

      safeWriteJSON(KEYS.ORDERS, state.orders);
      safeWriteJSON(KEYS.CART, state.cart);
      notify();

      if (App.webhook) {
        App.webhook.dispatch('order', order);
      }

      return order;
    },

    updateOrderStatus: function (orderCode, nextStatus) {
      const target = state.orders.find(function (o) {
        return o.orderCode === orderCode;
      });
      if (!target) return;
      target.status = nextStatus;
      safeWriteJSON(KEYS.ORDERS, state.orders);
      notify();
    },

    deleteOrder: function (orderCode) {
      state.orders = state.orders.filter(function (o) {
        return o.orderCode !== orderCode;
      });
      safeWriteJSON(KEYS.ORDERS, state.orders);
      notify();
    },

    /* ---- Live Chat Consultation Leads ---- */
    addChatLead: function (input) {
      const lead = {
        id: generateRecordId('CHAT'),
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        message: input.message.trim(),
        transcript: Array.isArray(input.transcript) ? input.transcript.slice(-12) : [],
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      state.chatLeads.unshift(lead);
      safeWriteJSON(KEYS.CHAT_LEADS, state.chatLeads);
      notify();

      if (App.webhook) {
        App.webhook.dispatch('chat_lead', lead);
      }

      return lead;
    },

    updateChatLeadStatus: function (id, nextStatus) {
      const target = state.chatLeads.find(function (item) {
        return item.id === id;
      });
      if (!target) return;
      target.status = nextStatus;
      safeWriteJSON(KEYS.CHAT_LEADS, state.chatLeads);
      notify();
    },

    deleteChatLead: function (id) {
      state.chatLeads = state.chatLeads.filter(function (item) {
        return item.id !== id;
      });
      safeWriteJSON(KEYS.CHAT_LEADS, state.chatLeads);
      notify();
    },

    /* ---- Contact Form Requests ---- */
    addContactRequest: function (input) {
      const req = {
        id: generateRecordId('LH'),
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        message: input.message.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      state.contacts.unshift(req);
      safeWriteJSON(KEYS.CONTACTS, state.contacts);
      notify();

      if (App.webhook) {
        App.webhook.dispatch('contact', req);
      }

      return req;
    },

    updateContactStatus: function (id, nextStatus) {
      const target = state.contacts.find(function (item) {
        return item.id === id;
      });
      if (!target) return;
      target.status = nextStatus;
      safeWriteJSON(KEYS.CONTACTS, state.contacts);
      notify();
    },

    deleteContact: function (id) {
      state.contacts = state.contacts.filter(function (item) {
        return item.id !== id;
      });
      safeWriteJSON(KEYS.CONTACTS, state.contacts);
      notify();
    },

    /* ---- Seller Admin Aggregates ---- */
    getAdminStats: function () {
      const revenue = state.orders.reduce(function (sum, order) {
        return order.status === 'cancelled' ? sum : sum + (Number(order.total) || 0);
      }, 0);

      return {
        ordersCount: state.orders.length,
        newOrdersCount: state.orders.filter(function (o) {
          return o.status === 'new';
        }).length,
        revenue: revenue,
        chatLeadsCount: state.chatLeads.length,
        contactsCount: state.contacts.length
      };
    }
  };
})(window);
