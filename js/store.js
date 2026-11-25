/* ==========================================================================
   LUMIÈN — Reactive State Store (Cart, Orders, Chat Leads, Contacts & Analytics)
   ========================================================================== */

(function (global) {
  'use strict';

  const App = (global.LumienApp = global.LumienApp || {});

  const KEYS = {
    CART: 'lumien_phase2_cart_v1',
    LEGACY_CART: 'lumien_phase1_cart_v1',
    ORDERS: 'lumien_phase2_orders_v1',
    CHAT_LEADS: 'lumien_phase2_chat_leads_v1',
    CONTACTS: 'lumien_phase2_contacts_v1',
    ADMIN_PASS: 'lumien_admin_pass_override_v1'
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

    /* ---- Admin Password Helper ---- */
    getAdminPassword: function () {
      try {
        const custom = global.localStorage.getItem(KEYS.ADMIN_PASS);
        if (custom && custom.trim()) return custom.trim();
      } catch (_err) {}
      return (App.CONFIG && App.CONFIG.adminPassword) || 'admin123';
    },

    setAdminPassword: function (newPass) {
      const clean = String(newPass || '').trim();
      try {
        if (clean) global.localStorage.setItem(KEYS.ADMIN_PASS, clean);
        else global.localStorage.removeItem(KEYS.ADMIN_PASS);
      } catch (_err) {}
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
      const subtotal = App.store.getSubtotal();
      if (subtotal === 0) return 0;
      return subtotal >= App.STORE_INFO.freeShippingMinAmount ? 0 : App.STORE_INFO.shippingFee;
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

    /* ---- Orders ---- */
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
        internalNote: '',
        channel: 'Website',
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

    createManualOrder: function (input) {
      const items = (input.items || [])
        .map(function (entry) {
          const product = App.getProductById(entry.id);
          const qty = Number(entry.qty) || 0;
          if (!product || qty <= 0) return null;
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            qty: qty
          };
        })
        .filter(Boolean);

      if (items.length === 0) return null;

      const subtotal = items.reduce(function (sum, it) {
        return sum + it.price * it.qty;
      }, 0);
      const shippingFee =
        input.freeShip || subtotal >= App.STORE_INFO.freeShippingMinAmount
          ? 0
          : App.STORE_INFO.shippingFee;

      const order = {
        orderCode: generateOrderCode(),
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        address: input.address.trim(),
        paymentMethod: input.paymentMethod === 'bank' ? 'bank' : 'cod',
        note: (input.note || '').trim(),
        internalNote: (input.internalNote || '').trim(),
        channel: input.channel || 'Zalo / Hotline',
        items: items,
        subtotal: subtotal,
        shippingFee: shippingFee,
        total: subtotal + shippingFee,
        status: input.status || 'confirmed',
        createdAt: new Date().toISOString()
      };

      state.orders.unshift(order);
      safeWriteJSON(KEYS.ORDERS, state.orders);
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

    updateOrderInternalNote: function (orderCode, noteText) {
      const target = state.orders.find(function (o) {
        return o.orderCode === orderCode;
      });
      if (!target) return;
      target.internalNote = String(noteText || '').trim();
      safeWriteJSON(KEYS.ORDERS, state.orders);
      notify();
    },

    resyncOrderToWebhook: async function (orderCode) {
      const target = state.orders.find(function (o) {
        return o.orderCode === orderCode;
      });
      if (!target || !App.webhook) return false;
      await App.webhook.dispatch('order', target);
      return true;
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
        transcript: Array.isArray(input.transcript) ? input.transcript.slice(-16) : [],
        sellerNote: '',
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

    updateChatLeadNote: function (id, noteText) {
      const target = state.chatLeads.find(function (item) {
        return item.id === id;
      });
      if (!target) return;
      target.sellerNote = String(noteText || '').trim();
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
        sellerNote: '',
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

    updateContactNote: function (id, noteText) {
      const target = state.contacts.find(function (item) {
        return item.id === id;
      });
      if (!target) return;
      target.sellerNote = String(noteText || '').trim();
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

    clearAllRecords: function () {
      state.orders = [];
      state.chatLeads = [];
      state.contacts = [];
      safeWriteJSON(KEYS.ORDERS, []);
      safeWriteJSON(KEYS.CHAT_LEADS, []);
      safeWriteJSON(KEYS.CONTACTS, []);
      notify();
    },

    /* ---- Rich Seller Analytics & CRM Directory ---- */
    getAnalytics: function () {
      const statusCounts = { new: 0, confirmed: 0, shipping: 0, completed: 0, cancelled: 0 };
      const scentMap = {};
      App.PRODUCTS.forEach(function (p) {
        scentMap[p.id] = { id: p.id, name: p.name, units: 0, revenue: 0 };
      });

      let grossRevenue = 0;
      let completedRevenue = 0;
      let activeOrdersCount = 0;
      let totalUnits = 0;

      state.orders.forEach(function (order) {
        const st = order.status || 'new';
        if (statusCounts[st] !== undefined) statusCounts[st]++;

        if (st !== 'cancelled') {
          activeOrdersCount++;
          grossRevenue += Number(order.total) || 0;
          if (st === 'completed') {
            completedRevenue += Number(order.total) || 0;
          }

          (order.items || []).forEach(function (it) {
            const qty = Number(it.qty) || 0;
            totalUnits += qty;
            if (scentMap[it.id]) {
              scentMap[it.id].units += qty;
              scentMap[it.id].revenue += (Number(it.price) || 0) * qty;
            }
          });
        }
      });

      const scentBreakdown = Object.keys(scentMap).map(function (key) {
        const row = scentMap[key];
        return {
          id: row.id,
          name: row.name,
          units: row.units,
          revenue: row.revenue,
          percent: totalUnits > 0 ? Math.round((row.units / totalUnits) * 100) : 0
        };
      });

      const pendingChatsCount = state.chatLeads.filter(function (c) {
        return c.status !== 'replied';
      }).length;
      const pendingContactsCount = state.contacts.filter(function (c) {
        return c.status !== 'replied';
      }).length;

      // Combined recent activity feed
      const feed = [];
      state.orders.slice(0, 6).forEach(function (o) {
        feed.push({
          type: 'order',
          title: `Đơn ${o.orderCode} · ${o.customerName}`,
          meta: `${App.formatVND(o.total)} · ${o.paymentMethod === 'bank' ? 'Chuyển khoản' : 'COD'}`,
          createdAt: o.createdAt,
          tab: 'orders'
        });
      });
      state.chatLeads.slice(0, 4).forEach(function (c) {
        feed.push({
          type: 'chat',
          title: `Tư vấn · ${c.customerName} (${c.phone})`,
          meta: c.message,
          createdAt: c.createdAt,
          tab: 'chats'
        });
      });
      state.contacts.slice(0, 4).forEach(function (l) {
        feed.push({
          type: 'contact',
          title: `Liên hệ · ${l.customerName} (${l.phone})`,
          meta: l.message,
          createdAt: l.createdAt,
          tab: 'contacts'
        });
      });

      feed.sort(function (a, b) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return {
        ordersCount: state.orders.length,
        activeOrdersCount: activeOrdersCount,
        totalUnits: totalUnits,
        statusCounts: statusCounts,
        grossRevenue: grossRevenue,
        completedRevenue: completedRevenue,
        avgOrderValue: activeOrdersCount > 0 ? Math.round(grossRevenue / activeOrdersCount) : 0,
        chatLeadsCount: state.chatLeads.length,
        pendingChatsCount: pendingChatsCount,
        contactsCount: state.contacts.length,
        pendingContactsCount: pendingContactsCount,
        pendingTotalLeads: pendingChatsCount + pendingContactsCount,
        scentBreakdown: scentBreakdown,
        recentActivity: feed.slice(0, 8)
      };
    },

    getCustomerDirectory: function () {
      const map = {};

      function touch(phoneRaw, name, createdAt, sourceTag) {
        const key = App.validators ? App.validators.normalizePhone(phoneRaw) : String(phoneRaw || '').trim();
        if (!key) return null;
        if (!map[key]) {
          map[key] = {
            phoneKey: key,
            phone: String(phoneRaw || '').trim(),
            name: name || 'Khách hàng',
            orderCount: 0,
            totalSpent: 0,
            scentCounts: {},
            interactions: 0,
            sources: new Set(),
            lastActivity: createdAt || ''
          };
        }
        const rec = map[key];
        if (name && rec.name === 'Khách hàng') rec.name = name;
        rec.interactions++;
        rec.sources.add(sourceTag);
        if (createdAt && (!rec.lastActivity || new Date(createdAt) > new Date(rec.lastActivity))) {
          rec.lastActivity = createdAt;
        }
        return rec;
      }

      state.orders.forEach(function (o) {
        const rec = touch(o.phone, o.customerName, o.createdAt, 'Mua hàng');
        if (!rec) return;
        if (o.status !== 'cancelled') {
          rec.orderCount++;
          rec.totalSpent += Number(o.total) || 0;
          (o.items || []).forEach(function (it) {
            rec.scentCounts[it.name] = (rec.scentCounts[it.name] || 0) + (Number(it.qty) || 0);
          });
        }
      });

      state.chatLeads.forEach(function (c) {
        touch(c.phone, c.customerName, c.createdAt, 'Live Chat');
      });

      state.contacts.forEach(function (l) {
        touch(l.phone, l.customerName, l.createdAt, 'Liên hệ');
      });

      return Object.keys(map)
        .map(function (k) {
          const r = map[k];
          let topScent = 'Chưa chọn';
          let topQty = 0;
          Object.keys(r.scentCounts).forEach(function (sName) {
            if (r.scentCounts[sName] > topQty) {
              topQty = r.scentCounts[sName];
              topScent = sName;
            }
          });
          return {
            phoneKey: r.phoneKey,
            phone: r.phone,
            name: r.name,
            orderCount: r.orderCount,
            totalSpent: r.totalSpent,
            favoriteScent: topScent,
            interactions: r.interactions,
            sources: Array.from(r.sources),
            lastActivity: r.lastActivity
          };
        })
        .sort(function (a, b) {
          if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent;
          return new Date(b.lastActivity || 0).getTime() - new Date(a.lastActivity || 0).getTime();
        });
    }
  };
})(window);
