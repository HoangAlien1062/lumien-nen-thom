/* ==========================================================================
   LUMIÈN — Live Chat Consultation Widget (Phase 2 Enhanced)
   Powered by zero-API 24-intent Vietnamese FAQ Engine (js/chatbot-kb.js)
   + Contextual Follow-up Chips + Seller Lead Capture (localStorage & Google Sheets)
   ========================================================================== */

(function (global) {
  'use strict';

  const App = (global.LumienApp = global.LumienApp || {});

  const chatState = {
    isOpen: false,
    initialized: false,
    messages: [],
    contactBarExpanded: false,
    quickPackIndex: 0,
    currentQuickQuestions: []
  };

  const els = {};

  function getNowTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function appendMessage(sender, text) {
    chatState.messages.push({
      sender: sender,
      text: text,
      time: getNowTime()
    });
    renderMessages();
  }

  function renderMessages() {
    if (!els.messagesList) return;

    els.messagesList.innerHTML = chatState.messages
      .map(function (msg) {
        const cls = msg.sender === 'user' ? 'chat-msg chat-msg--user' : 'chat-msg chat-msg--bot';
        const safeText = App.escapeHTML(msg.text).replace(/\n/g, '<br />');
        return `
          <div class="${cls}">
            <div class="chat-bubble">${safeText}</div>
            <span class="chat-time">${App.escapeHTML(msg.time)}</span>
          </div>
        `;
      })
      .join('');

    els.messagesList.scrollTop = els.messagesList.scrollHeight;
  }

  function setQuickQuestions(list) {
    const fallback = App.chatbotKB
      ? App.chatbotKB.getDefaultQuickQuestions()
      : App.CHAT_QUICK_QUESTIONS || [];
    chatState.currentQuickQuestions = Array.isArray(list) && list.length ? list.slice(0, 4) : fallback;
    renderQuickReplies();
  }

  function renderQuickReplies() {
    if (!els.quickReplies) return;

    const chipsHTML = chatState.currentQuickQuestions
      .map(function (q) {
        return `<button type="button" class="chat-quick-chip" data-chat-quick="${App.escapeHTML(q)}">${App.escapeHTML(q)}</button>`;
      })
      .join('');

    const moreChip =
      App.chatbotKB && App.chatbotKB.QUICK_PACKS && App.chatbotKB.QUICK_PACKS.length > 1
        ? `<button type="button" class="chat-quick-chip chat-quick-chip--more" data-chat-more="true">Câu hỏi khác ↻</button>`
        : '';

    els.quickReplies.innerHTML = chipsHTML + moreChip;
  }

  function syncContactBarUI() {
    if (!els.contactFields || !els.contactToggle) return;
    els.contactFields.hidden = !chatState.contactBarExpanded;
    els.contactToggle.setAttribute('aria-expanded', String(chatState.contactBarExpanded));
    els.contactToggle.textContent = chatState.contactBarExpanded
      ? 'Ẩn khung SĐT'
      : 'Để lại Tên & SĐT cho người bán';
  }

  function sendUserMessage(rawText) {
    const text = String(rawText || '').trim();
    const customerName = els.nameInput ? els.nameInput.value.trim() : '';
    const phone = els.phoneInput ? els.phoneInput.value.trim() : '';

    if (!text && !customerName && !phone) return;

    if (phone && !App.validators.isValidVNPhone(phone)) {
      if (els.errorBox) {
        els.errorBox.textContent = 'Số điện thoại chưa đúng định dạng (VD: 0908 682 468).';
        els.errorBox.hidden = false;
      }
      if (els.phoneInput) els.phoneInput.focus();
      return;
    }

    if (els.errorBox) {
      els.errorBox.hidden = true;
      els.errorBox.textContent = '';
    }

    const messageToLog = text || 'Yêu cầu nhân viên tư vấn liên hệ lại';
    appendMessage('user', messageToLog);

    if (els.messageInput) {
      els.messageInput.value = '';
    }

    // If customer filled phone -> save immediately to Seller Admin & Google Sheets
    if (phone) {
      const savedName = customerName || 'Khách tư vấn';
      const transcript = chatState.messages.map(function (m) {
        return `${m.sender === 'user' ? 'Khách' : 'LUMIÈN'} (${m.time}): ${m.text}`;
      });

      App.store.addChatLead({
        customerName: savedName,
        phone: phone,
        message: messageToLog,
        transcript: transcript
      });

      setTimeout(function () {
        appendMessage(
          'bot',
          `Cảm ơn ${savedName}! LUMIÈN đã lưu tin nhắn cùng SĐT ${phone} gửi tới nhân viên cửa hàng. Shop sẽ liên hệ tư vấn cho bạn trong ít phút nữa nhé.`
        );
        if (typeof App.showToast === 'function') {
          App.showToast('Đã gửi tin nhắn tư vấn tới người bán!');
        }
      }, 240);
      return;
    }

    // Zero-API Smart Knowledge Base Auto-Reply
    const matched = App.chatbotKB
      ? App.chatbotKB.match(messageToLog)
      : {
          text: 'Cảm ơn bạn đã nhắn tin cho LUMIÈN! Bạn có thể để lại Tên & SĐT bên dưới để chủ shop tư vấn chi tiết nhé.',
          followUps: App.CHAT_QUICK_QUESTIONS,
          suggestContact: false
        };

    setTimeout(function () {
      appendMessage('bot', matched.text);
      if (matched.followUps) {
        setQuickQuestions(matched.followUps);
      }
      if (matched.suggestContact) {
        chatState.contactBarExpanded = true;
        syncContactBarUI();
        if (els.nameInput) els.nameInput.focus();
      }
    }, 260);
  }

  function openChat(options) {
    if (!els.panel || !els.launcher) return;

    if (!chatState.initialized) {
      chatState.initialized = true;
      appendMessage(
        'bot',
        'Xin chào bạn đến với LUMIÈN! Mình có thể tư vấn nhanh về 3 bộ đèn nến thơm đuổi muỗi (Ocean, Blue mint, Blossom — đồng giá 190.000₫) và hũ nến thơm bán lẻ Scented Candle (45.000₫). Bạn chọn gợi ý bên dưới hoặc nhắn câu hỏi nhé!'
      );
    }

    if (options && options.expandContact) {
      chatState.contactBarExpanded = true;
      syncContactBarUI();
    }

    chatState.isOpen = true;
    els.panel.classList.add('is-open');
    els.panel.setAttribute('aria-hidden', 'false');
    els.launcher.setAttribute('aria-expanded', 'true');
    if (els.dock) els.dock.classList.add('is-chat-open');

    if (els.messagesList) {
      els.messagesList.scrollTop = els.messagesList.scrollHeight;
    }
  }

  function closeChat() {
    if (!els.panel || !els.launcher) return;
    chatState.isOpen = false;
    els.panel.classList.remove('is-open');
    els.panel.setAttribute('aria-hidden', 'true');
    els.launcher.setAttribute('aria-expanded', 'false');
    if (els.dock) els.dock.classList.remove('is-chat-open');
  }

  function toggleChat() {
    if (chatState.isOpen) closeChat();
    else openChat();
  }

  App.chat = {
    open: openChat,
    close: closeChat,
    toggle: toggleChat,
    isOpen: function () {
      return chatState.isOpen;
    },

    init: function () {
      els.dock = document.querySelector('.floating-dock');
      els.launcher = document.getElementById('chat-launcher');
      els.panel = document.getElementById('chat-widget-panel');
      els.closeBtn = document.getElementById('chat-close-btn');
      els.messagesList = document.getElementById('chat-messages');
      els.quickReplies = document.getElementById('chat-quick-replies');
      els.form = document.getElementById('chat-form');
      els.messageInput = document.getElementById('chat-message-input');
      els.nameInput = document.getElementById('chat-customer-name');
      els.phoneInput = document.getElementById('chat-customer-phone');
      els.contactToggle = document.getElementById('chat-contact-toggle');
      els.contactFields = document.getElementById('chat-contact-fields');
      els.errorBox = document.getElementById('chat-form-error');

      if (!els.launcher || !els.panel) return;

      setQuickQuestions();
      syncContactBarUI();

      els.launcher.addEventListener('click', toggleChat);
      if (els.closeBtn) els.closeBtn.addEventListener('click', closeChat);

      if (els.contactToggle) {
        els.contactToggle.addEventListener('click', function () {
          chatState.contactBarExpanded = !chatState.contactBarExpanded;
          syncContactBarUI();
          if (chatState.contactBarExpanded && els.nameInput) {
            els.nameInput.focus();
          }
        });
      }

      if (els.quickReplies) {
        els.quickReplies.addEventListener('click', function (event) {
          const moreBtn = event.target.closest('[data-chat-more]');
          if (moreBtn && App.chatbotKB) {
            chatState.quickPackIndex =
              (chatState.quickPackIndex + 1) % App.chatbotKB.QUICK_PACKS.length;
            setQuickQuestions(App.chatbotKB.QUICK_PACKS[chatState.quickPackIndex]);
            return;
          }

          const btn = event.target.closest('[data-chat-quick]');
          if (!btn) return;
          sendUserMessage(btn.dataset.chatQuick);
        });
      }

      if (els.form) {
        els.form.addEventListener('submit', function (event) {
          event.preventDefault();
          sendUserMessage(els.messageInput ? els.messageInput.value : '');
        });
      }
    }
  };
})(window);
