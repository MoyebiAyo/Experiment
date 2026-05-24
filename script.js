(function () {
  'use strict';

  var WHATSAPP_NUMBER = '2348166163717';

  var APPOINTMENT_TYPE_LABELS = {
    consultation: 'Style Consultation',
    fitting: 'Private Fitting',
    followup: 'Follow-up Fitting',
    pickup: 'Garment Pickup'
  };

  function orderOnWhatsApp(message) {
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function generalOrderMessage() {
    return 'Hello Kansy Couture, I\'d like to place an order.';
  }

  function productOrderMessage(name, price) {
    return 'Hello Kansy Couture, I\'d like to order: ' + name + ' - ' + price;
  }

  function bookingIntentMessage() {
    return 'Hello Kansy Couture, I\'d like to book an appointment.';
  }

  function packageBookingMessage(packageName) {
    return 'Hello Kansy Couture, I\'d like to book: ' + packageName + '.';
  }

  function appointmentWhatsAppMessage(data) {
    var service = APPOINTMENT_TYPE_LABELS[data.type] || data.type;
    var lines = [
      'Hello Kansy Couture, I\'d like to book an appointment.',
      '',
      'Name: ' + data.firstName + ' ' + data.lastName,
      'Email: ' + data.email,
      'Phone: ' + data.phone,
      'Service: ' + service,
      'Date: ' + data.date,
      'Time: ' + data.time
    ];
    if (data.notes) lines.push('Notes: ' + data.notes);
    return lines.join('\n');
  }

  function getProductFromCard(card) {
    var name = card.getAttribute('data-name');
    if (!name) {
      var nameEl = card.querySelector('.product-card__name');
      name = nameEl ? nameEl.textContent.trim() : 'Item';
    }
    var priceEl = card.querySelector('.product-card__price');
    var price = priceEl ? priceEl.textContent.trim().replace(/\s+/g, ' ') : '';
    return { name: name, price: price };
  }

  window.KansyWhatsApp = {
    WHATSAPP_NUMBER: WHATSAPP_NUMBER,
    orderOnWhatsApp: orderOnWhatsApp,
    generalOrderMessage: generalOrderMessage,
    productOrderMessage: productOrderMessage,
    bookingIntentMessage: bookingIntentMessage,
    appointmentWhatsAppMessage: appointmentWhatsAppMessage
  };

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-whatsapp]');
    if (!trigger) return;

    var action = trigger.getAttribute('data-whatsapp');
    var card = trigger.closest('.product-card');

    if (action === 'product' && card) {
      e.preventDefault();
      var product = getProductFromCard(card);
      orderOnWhatsApp(productOrderMessage(product.name, product.price));
      return;
    }

    if (action === 'general') {
      e.preventDefault();
      orderOnWhatsApp(generalOrderMessage());
      return;
    }

    if (action === 'booking') {
      e.preventDefault();
      orderOnWhatsApp(bookingIntentMessage());
      return;
    }

    if (action === 'package') {
      e.preventDefault();
      var pkg = trigger.getAttribute('data-package') || 'service';
      orderOnWhatsApp(packageBookingMessage(pkg));
    }
  });

  var STORAGE_KEYS = {
    user: 'kansy_user',
    users: 'kansy_users',
    appointments: 'kansy_appointments',
    chat: 'kansy_chat'
  };

  /* Utilities */
  function getStorage(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* ignore */ }
  }

  function formatTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* Toast notifications (FR-10) */
  function showToast(message, type) {
    var container = document.getElementById('toast-container');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + (type || 'info');
    toast.setAttribute('role', 'alert');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(function () { toast.remove(); }, 300);
    }, 4000);
  }

  /* Auth state in nav (FR-1) */
  function updateAuthUI() {
    var user = getStorage(STORAGE_KEYS.user, null);
    var navLink = document.getElementById('nav-auth-link');
    var accountLink = document.getElementById('header-account');
    if (navLink) {
      if (user) {
        navLink.textContent = user.name ? user.name.split(' ')[0] : 'Account';
        navLink.href = 'appointment.html';
        navLink.setAttribute('aria-label', 'My account');
      } else {
        navLink.textContent = 'Login';
        navLink.href = 'login.html';
      }
    }
    if (accountLink && user) {
      accountLink.href = 'appointment.html';
    }
  }

  /* Hero Carousel */
  var slides = document.querySelectorAll('.hero__slide');
  var dots = document.querySelectorAll('.hero__dot');
  var prevBtn = document.getElementById('hero-prev');
  var nextBtn = document.getElementById('hero-next');
  var currentSlide = 0;
  var autoplayTimer;

  function goToSlide(index) {
    if (!slides.length) return;
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) {
      dots[currentSlide].classList.remove('active');
      dots[currentSlide].setAttribute('aria-selected', 'false');
    }
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) {
      dots[currentSlide].classList.add('active');
      dots[currentSlide].setAttribute('aria-selected', 'true');
    }
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlideFn() { goToSlide(currentSlide - 1); }

  function startAutoplay() {
    stopAutoplay();
    if (slides.length > 1) autoplayTimer = setInterval(nextSlide, 6000);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { prevSlideFn(); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { nextSlide(); startAutoplay(); });
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goToSlide(parseInt(dot.dataset.index, 10));
      startAutoplay();
    });
  });
  var hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', stopAutoplay);
    hero.addEventListener('mouseleave', startAutoplay);
    startAutoplay();
  }

  /* Mobile Navigation */
  var navToggle = document.querySelector('.nav-toggle');
  var mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    function setNavOpen(isOpen) {
      mainNav.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    navToggle.addEventListener('click', function () {
      setNavOpen(!mainNav.classList.contains('open'));
    });
    mainNav.querySelectorAll('.main-nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        setNavOpen(false);
      });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && mainNav.classList.contains('open')) {
        setNavOpen(false);
      }
    });
  }

  /* Smooth scroll */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* Newsletter */
  var newsletterForm = document.getElementById('newsletter-form');
  var newsletterMessage = document.getElementById('newsletter-message');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = document.getElementById('newsletter-email');
      var email = emailInput.value.trim();
      newsletterMessage.className = 'newsletter__message';
      if (!isValidEmail(email)) {
        newsletterMessage.textContent = 'Please enter a valid email address.';
        newsletterMessage.classList.add('error');
        return;
      }
      newsletterMessage.textContent = 'Thank you for subscribing to Kansy Couture.';
      newsletterMessage.classList.add('success');
      emailInput.value = '';
      showToast('Welcome to Kansy Couture — you\'re subscribed!', 'success');
    });
  }

  /* Collections filter & search (FR-2, FR-8) */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var collectionSearch = document.getElementById('collection-search');
  var collectionsGrid = document.getElementById('collections-grid');
  var noResults = document.getElementById('no-results');
  var activeFilter = 'all';

  function applyCollectionFilters() {
    if (!collectionsGrid) return;
    var query = collectionSearch ? collectionSearch.value.trim().toLowerCase() : '';
    var cards = collectionsGrid.querySelectorAll('.product-card');
    var visible = 0;
    cards.forEach(function (card) {
      var cat = card.getAttribute('data-category') || '';
      var name = (card.getAttribute('data-name') || card.textContent || '').toLowerCase();
      var matchCat = activeFilter === 'all' || cat === activeFilter;
      var matchSearch = !query || name.indexOf(query) !== -1;
      var show = matchCat && matchSearch;
      card.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      applyCollectionFilters();
    });
  });

  if (collectionSearch) {
    collectionSearch.addEventListener('input', applyCollectionFilters);
  }

  /* URL params: category filter & search */
  function initFromUrlParams() {
    var params = new URLSearchParams(window.location.search);
    var category = params.get('category');
    var q = params.get('q');

    if (category && collectionsGrid) {
      var map = { dresses: 'dresses', shoes: 'footwear', footwear: 'footwear', accessories: 'accessories', new: 'dresses', outerwear: 'outerwear' };
      activeFilter = map[category] || category;
      filterBtns.forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === activeFilter);
      });
      applyCollectionFilters();
    }

    if (q && collectionSearch) {
      collectionSearch.value = q;
      applyCollectionFilters();
    }
  }

  if (document.body.getAttribute('data-page') === 'collections') {
    initFromUrlParams();
    if (!window.location.search) applyCollectionFilters();
  }

  /* Register (FR-1) */
  var registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('register-message');
      var name = document.getElementById('reg-name').value.trim();
      var email = document.getElementById('reg-email').value.trim();
      var password = document.getElementById('reg-password').value;
      var confirm = document.getElementById('reg-confirm').value;
      msg.className = 'form-message';
      if (!name || !isValidEmail(email) || password.length < 6) {
        msg.textContent = 'Please complete all fields with a valid email and password (6+ characters).';
        msg.classList.add('error');
        return;
      }
      if (password !== confirm) {
        msg.textContent = 'Passwords do not match.';
        msg.classList.add('error');
        return;
      }
      var users = getStorage(STORAGE_KEYS.users, []);
      if (users.some(function (u) { return u.email === email; })) {
        msg.textContent = 'An account with this email already exists.';
        msg.classList.add('error');
        return;
      }
      users.push({ name: name, email: email, password: password });
      setStorage(STORAGE_KEYS.users, users);
      setStorage(STORAGE_KEYS.user, { name: name, email: email });
      msg.textContent = 'Account created! Redirecting...';
      msg.classList.add('success');
      showToast('Welcome to Kansy Couture, ' + name.split(' ')[0] + '!', 'success');
      setTimeout(function () { window.location.href = 'index.html'; }, 1200);
    });
  }

  /* Login (FR-1) */
  var loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('login-message');
      var email = document.getElementById('login-email').value.trim();
      var password = document.getElementById('login-password').value;
      msg.className = 'form-message';
      var users = getStorage(STORAGE_KEYS.users, []);
      var found = users.find(function (u) { return u.email === email && u.password === password; });
      if (!found) {
        if (email === 'admin@kansycouture.com' && password === 'admin123') {
          found = { name: 'Admin', email: email, role: 'admin' };
        } else {
          msg.textContent = 'Invalid email or password. Try registering first.';
          msg.classList.add('error');
          return;
        }
      }
      setStorage(STORAGE_KEYS.user, found);
      msg.textContent = 'Signed in! Redirecting...';
      msg.classList.add('success');
      showToast('Welcome back!', 'success');
      var dest = found.role === 'admin' ? 'admin.html' : 'index.html';
      setTimeout(function () { window.location.href = dest; }, 1000);
    });
  }

  /* Appointment booking (FR-4) */
  var appointmentForm = document.getElementById('appointment-form');
  if (appointmentForm) {
    var dateInput = document.getElementById('appt-date');
    if (dateInput) {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.min = tomorrow.toISOString().split('T')[0];
    }

    appointmentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('appointment-message');
      msg.className = 'form-message';
      var data = {
        id: Date.now(),
        firstName: document.getElementById('appt-first').value.trim(),
        lastName: document.getElementById('appt-last').value.trim(),
        email: document.getElementById('appt-email').value.trim(),
        phone: document.getElementById('appt-phone').value.trim(),
        type: document.getElementById('appt-type').value,
        date: document.getElementById('appt-date').value,
        time: document.getElementById('appt-time').value,
        notes: document.getElementById('appt-notes').value.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      if (!data.firstName || !data.lastName || !isValidEmail(data.email) || !data.phone || !data.type || !data.date || !data.time) {
        msg.textContent = 'Please fill in all required fields.';
        msg.classList.add('error');
        return;
      }
      var appointments = getStorage(STORAGE_KEYS.appointments, []);
      appointments.push(data);
      setStorage(STORAGE_KEYS.appointments, appointments);
      msg.textContent = 'Appointment saved! Opening WhatsApp to confirm with our designer…';
      msg.classList.add('success');
      appointmentForm.reset();
      showToast('Appointment booked — opening WhatsApp', 'success');
      orderOnWhatsApp(appointmentWhatsAppMessage(data));
    });
  }

  /* Designer chat (FR-5) */
  var chatForm = document.getElementById('chat-form');
  var chatMessages = document.getElementById('chat-messages');
  var designerReplies = [
    'That sounds wonderful! I\'d love to discuss fabrics and silhouette options at your consultation.',
    'Our bespoke gowns typically start at $890. I can prepare swatches for your appointment.',
    'Absolutely — I have availability this week. Would you like me to reserve a fitting slot?',
    'For alterations, turnaround is 5–7 days. Bring the garment to your appointment for an exact quote.',
    'Thank you for sharing! I\'ll note your preferences in your client file.'
  ];

  function appendChatMessage(text, isUser) {
    if (!chatMessages) return;
    var div = document.createElement('div');
    div.className = 'chat-message ' + (isUser ? 'chat-message--user' : 'chat-message--designer');
    div.innerHTML = text + '<span class="chat-message__time">' + formatTime() + '</span>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (chatForm && chatMessages) {
    var savedChat = getStorage(STORAGE_KEYS.chat, []);
    savedChat.forEach(function (m) {
      appendChatMessage(m.text, m.isUser);
    });

    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('chat-input');
      var text = input.value.trim();
      if (!text) return;
      appendChatMessage(text, true);
      savedChat.push({ text: text, isUser: true });
      input.value = '';
      setTimeout(function () {
        var reply = designerReplies[Math.floor(Math.random() * designerReplies.length)];
        appendChatMessage(reply, false);
        savedChat.push({ text: reply, isUser: false });
        setStorage(STORAGE_KEYS.chat, savedChat);
        showToast('Designer replied', 'info');
      }, 1200);
      setStorage(STORAGE_KEYS.chat, savedChat);
    });
  }

  /* Admin dashboard (FR-6, FR-7) */
  function renderAdminAppointments() {
    var tbody = document.getElementById('admin-appointments-body');
    if (!tbody) return;
    var appointments = getStorage(STORAGE_KEYS.appointments, []);
    var pending = appointments.filter(function (a) { return a.status === 'pending'; });
    var statAppt = document.getElementById('stat-appointments');
    if (statAppt) statAppt.textContent = pending.length;

    if (!appointments.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--color-muted);">No appointments yet</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    appointments.forEach(function (a, idx) {
      var tr = document.createElement('tr');
      var statusClass = a.status === 'confirmed' ? 'status--confirmed' : a.status === 'completed' ? 'status--completed' : 'status--pending';
      tr.innerHTML =
        '<td>' + a.firstName + ' ' + a.lastName + '</td>' +
        '<td>' + a.type + '</td>' +
        '<td>' + a.date + '</td>' +
        '<td>' + a.time + '</td>' +
        '<td><span class="status ' + statusClass + '">' + a.status + '</span></td>' +
        '<td class="admin-actions">' +
        '<button type="button" data-action="confirm" data-idx="' + idx + '">Confirm</button>' +
        '<button type="button" data-action="complete" data-idx="' + idx + '">Complete</button>' +
        '</td>';
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.getAttribute('data-idx'), 10);
        var action = btn.getAttribute('data-action');
        var list = getStorage(STORAGE_KEYS.appointments, []);
        if (action === 'confirm') list[i].status = 'confirmed';
        if (action === 'complete') list[i].status = 'completed';
        setStorage(STORAGE_KEYS.appointments, list);
        renderAdminAppointments();
        showToast('Appointment updated', 'success');
      });
    });
  }

  var adminNavLinks = document.querySelectorAll('.admin-nav a');
  adminNavLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var panelId = link.getAttribute('data-panel');
      adminNavLinks.forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');
      document.querySelectorAll('.admin-panel').forEach(function (p) {
        p.classList.toggle('active', p.getAttribute('data-panel') === panelId);
      });
    });
  });

  document.querySelectorAll('#admin-collections-body button[data-action="toggle"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var row = btn.closest('tr');
      var statusEl = row.querySelector('.status');
      if (statusEl.textContent === 'Active') {
        statusEl.textContent = 'Hidden';
        statusEl.className = 'status status--pending';
      } else {
        statusEl.textContent = 'Active';
        statusEl.className = 'status status--confirmed';
      }
      showToast('Collection status updated', 'success');
    });
  });

  if (document.body.getAttribute('data-page') === 'admin') {
    renderAdminAppointments();
    var users = getStorage(STORAGE_KEYS.users, []);
    var statClients = document.getElementById('stat-clients');
    if (statClients) statClients.textContent = users.length;
  }

  /* Search form redirect */
  document.querySelectorAll('.search-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var input = form.querySelector('input[type="search"]');
      if (input && input.value.trim() && form.getAttribute('action') === 'collections.html') {
        return;
      }
      if (input && input.value.trim()) {
        e.preventDefault();
        window.location.href = 'collections.html?q=' + encodeURIComponent(input.value.trim());
      }
    });
  });

  updateAuthUI();
})();
