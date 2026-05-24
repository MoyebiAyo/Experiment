import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js';
import { getDb, getStorageInstance, isFirebaseConfigured } from './firebase-app.js';
import { adminSignOut, watchAdminAuth } from './admin-auth.js';
import { fetchProducts, fetchServices, fetchSiteContent } from './catalog.js';
import { SEED_CONTENT, SEED_PRODUCTS, SEED_SERVICES } from './seed-data.js';
import { escapeHtml, setLoading, showToast } from './utils.js';

var currentUser = null;
var editingProductId = null;
var editingServiceId = null;

function tsPair() {
  var now = serverTimestamp();
  return { createdAt: now, updatedAt: now };
}

function openModal(id) {
  var el = document.getElementById(id);
  if (el) {
    el.classList.add('admin-modal--open');
    el.setAttribute('aria-hidden', 'false');
  }
}

function closeModal(id) {
  var el = document.getElementById(id);
  if (el) {
    el.classList.remove('admin-modal--open');
    el.setAttribute('aria-hidden', 'true');
  }
}

function bindModalCloses() {
  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      closeModal(btn.getAttribute('data-close-modal'));
    });
  });
  document.querySelectorAll('.admin-modal').forEach(function (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal(modal.id);
    });
  });
}

async function loadProductsTable() {
  var tbody = document.getElementById('admin-products-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading…</td></tr>';
  var products = await fetchProducts(true);
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--color-muted);">No products. Import defaults or add one.</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(function (p) {
    var status = p.active !== false ? 'Active' : 'Hidden';
    var statusClass = p.active !== false ? 'status--confirmed' : 'status--pending';
    return (
      '<tr data-id="' + escapeHtml(p.docId) + '">' +
        '<td>' + escapeHtml(p.name) + '</td>' +
        '<td>' + escapeHtml(p.category) + '</td>' +
        '<td>' + escapeHtml(p.price) + '</td>' +
        '<td><span class="status ' + statusClass + '">' + status + '</span></td>' +
        '<td class="admin-actions">' +
          '<button type="button" data-product-edit="' + escapeHtml(p.docId) + '">Edit</button>' +
          '<button type="button" data-product-delete="' + escapeHtml(p.docId) + '">Delete</button>' +
        '</td>' +
      '</tr>'
    );
  }).join('');

  tbody.querySelectorAll('[data-product-edit]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openProductForm(btn.getAttribute('data-product-edit'));
    });
  });
  tbody.querySelectorAll('[data-product-delete]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      deleteProduct(btn.getAttribute('data-product-delete'));
    });
  });

  var stat = document.getElementById('stat-products');
  if (stat) stat.textContent = String(products.filter(function (p) { return p.active !== false; }).length);
}

async function loadServicesTable() {
  var tbody = document.getElementById('admin-services-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading…</td></tr>';
  var services = await fetchServices(true);
  tbody.innerHTML = services.length ? services.map(function (s) {
    var status = s.active !== false ? 'Active' : 'Hidden';
    var statusClass = s.active !== false ? 'status--confirmed' : 'status--pending';
    return (
      '<tr data-id="' + escapeHtml(s.docId) + '">' +
        '<td>' + escapeHtml(s.title) + '</td>' +
        '<td>' + escapeHtml(s.price || '—') + '</td>' +
        '<td><span class="status ' + statusClass + '">' + status + '</span></td>' +
        '<td class="admin-actions">' +
          '<button type="button" data-service-edit="' + escapeHtml(s.docId) + '">Edit</button>' +
          '<button type="button" data-service-delete="' + escapeHtml(s.docId) + '">Delete</button>' +
        '</td>' +
      '</tr>'
    );
  }).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--color-muted);">No services yet.</td></tr>';

  tbody.querySelectorAll('[data-service-edit]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openServiceForm(btn.getAttribute('data-service-edit'));
    });
  });
  tbody.querySelectorAll('[data-service-delete]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      deleteService(btn.getAttribute('data-service-delete'));
    });
  });
}

async function openProductForm(docId) {
  editingProductId = docId || null;
  var form = document.getElementById('product-form');
  if (!form) return;
  form.reset();
  document.getElementById('product-form-title').textContent = docId ? 'Edit product' : 'Add product';
  document.getElementById('product-image-preview').innerHTML = '';

  if (docId) {
    var products = await fetchProducts(true);
    var p = products.find(function (x) { return x.docId === docId; });
    if (p) {
      form.name.value = p.name || '';
      form.description.value = p.description || '';
      form.price.value = p.price || '';
      form.priceNote.value = p.priceNote || '';
      form.category.value = p.category || 'dresses';
      form.imageUrl.value = p.imageUrl || '';
      form.badge.value = p.badge || '';
      form.active.checked = p.active !== false;
      form.sortOrder.value = p.sortOrder != null ? p.sortOrder : 0;
      if (p.imageUrl) {
        document.getElementById('product-image-preview').innerHTML =
          '<img src="' + escapeHtml(p.imageUrl) + '" alt="Preview" style="max-width:120px;border-radius:4px;">';
      }
    }
  }
  openModal('modal-product');
}

async function saveProduct(e) {
  e.preventDefault();
  if (!isFirebaseConfigured()) {
    showToast('Configure Firebase first', 'error');
    return;
  }
  var db = getDb();
  var form = e.target;
  var btn = form.querySelector('button[type="submit"]');
  setLoading(btn, true, 'Saving…');

  var data = {
    name: form.name.value.trim(),
    description: form.description.value.trim(),
    price: form.price.value.trim(),
    priceNote: form.priceNote.value.trim(),
    category: form.category.value,
    imageUrl: form.imageUrl.value.trim() || 'images/product-silk-dress.jpg',
    imagePath: form.imagePath ? form.imagePath.value : '',
    badge: form.badge.value.trim(),
    active: form.active.checked,
    sortOrder: parseInt(form.sortOrder.value, 10) || 0,
    updatedAt: serverTimestamp()
  };

  try {
    if (editingProductId) {
      await updateDoc(doc(db, 'products', editingProductId), data);
      showToast('Product updated', 'success');
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'products'), data);
      showToast('Product added', 'success');
    }
    closeModal('modal-product');
    await loadProductsTable();
  } catch (err) {
    showToast(err.message || 'Could not save product', 'error');
  }
  setLoading(btn, false);
}

async function deleteProduct(docId) {
  if (!confirm('Delete this product?')) return;
  try {
    await deleteDoc(doc(getDb(), 'products', docId));
    showToast('Product deleted', 'success');
    await loadProductsTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function openServiceForm(docId) {
  editingServiceId = docId || null;
  var form = document.getElementById('service-form');
  form.reset();
  document.getElementById('service-form-title').textContent = docId ? 'Edit service' : 'Add service';
  if (docId) {
    var services = await fetchServices(true);
    var s = services.find(function (x) { return x.docId === docId; });
    if (s) {
      form.title.value = s.title || '';
      form.description.value = s.description || '';
      form.price.value = s.price || '';
      form.period.value = s.period || '';
      form.icon.value = s.icon || '01';
      form.ctaLabel.value = s.ctaLabel || '';
      form.ctaHref.value = s.ctaHref || '';
      form.whatsappPackage.value = s.whatsappPackage || '';
      form.featured.checked = !!s.featured;
      form.active.checked = s.active !== false;
      form.sortOrder.value = s.sortOrder != null ? s.sortOrder : 0;
      form.features.value = (s.features || []).join('\n');
    }
  }
  openModal('modal-service');
}

async function saveService(e) {
  e.preventDefault();
  var db = getDb();
  var form = e.target;
  var btn = form.querySelector('button[type="submit"]');
  setLoading(btn, true, 'Saving…');
  var features = form.features.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
  var data = {
    title: form.title.value.trim(),
    description: form.description.value.trim(),
    price: form.price.value.trim(),
    period: form.period.value.trim(),
    icon: form.icon.value.trim() || '01',
    ctaLabel: form.ctaLabel.value.trim(),
    ctaHref: form.ctaHref.value.trim(),
    whatsappPackage: form.whatsappPackage.value.trim(),
    features: features,
    featured: form.featured.checked,
    active: form.active.checked,
    sortOrder: parseInt(form.sortOrder.value, 10) || 0,
    updatedAt: serverTimestamp()
  };
  try {
    if (editingServiceId) {
      await updateDoc(doc(db, 'services', editingServiceId), data);
      showToast('Service updated', 'success');
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'services'), data);
      showToast('Service added', 'success');
    }
    closeModal('modal-service');
    await loadServicesTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
  setLoading(btn, false);
}

async function deleteService(docId) {
  if (!confirm('Delete this service?')) return;
  try {
    await deleteDoc(doc(getDb(), 'services', docId));
    showToast('Service deleted', 'success');
    await loadServicesTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadContentEditor() {
  var content = await fetchSiteContent();
  var ta = document.getElementById('content-json');
  if (ta) ta.value = JSON.stringify(content, null, 2);
}

async function saveContentJson() {
  var ta = document.getElementById('content-json');
  var btn = document.getElementById('btn-save-content');
  try {
    var parsed = JSON.parse(ta.value);
    setLoading(btn, true, 'Saving…');
    await setDoc(doc(getDb(), 'content', 'site'), Object.assign({}, parsed, {
      updatedAt: serverTimestamp()
    }));
    showToast('Site content saved', 'success');
  } catch (err) {
    showToast(err.message || 'Invalid JSON', 'error');
  }
  setLoading(btn, false);
}

async function uploadImage(file, folder) {
  var storage = getStorageInstance();
  if (!storage) throw new Error('Storage not available');
  var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  var path = folder + '/' + Date.now() + '_' + safeName;
  var storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  var url = await getDownloadURL(storageRef);
  return { url: url, path: path };
}

function initImageUpload() {
  var input = document.getElementById('admin-image-file');
  var target = document.getElementById('admin-image-target');
  var preview = document.getElementById('admin-image-preview');
  var urlField = document.getElementById('admin-image-url-result');
  if (!input) return;

  input.addEventListener('change', async function () {
    var file = input.files[0];
    if (!file) return;
    var folder = target ? target.value : 'site/general';
    preview.innerHTML = '<p>Uploading…</p>';
    try {
      var result = await uploadImage(file, folder);
      preview.innerHTML = '<img src="' + escapeHtml(result.url) + '" alt="Uploaded" style="max-width:200px;">';
      if (urlField) urlField.value = result.url;
      showToast('Image uploaded', 'success');
    } catch (err) {
      preview.innerHTML = '<p class="form-message error">' + escapeHtml(err.message) + '</p>';
    }
  });

  document.getElementById('btn-copy-image-url')?.addEventListener('click', function () {
    if (!urlField || !urlField.value) return;
    navigator.clipboard.writeText(urlField.value).then(function () {
      showToast('URL copied', 'success');
    });
  });
}

async function seedFirestore() {
  if (!confirm('Import all default products, services, and site copy? Existing IDs are not overwritten.')) return;
  var db = getDb();
  var btn = document.getElementById('btn-seed-data');
  setLoading(btn, true, 'Importing…');
  try {
    for (var i = 0; i < SEED_PRODUCTS.length; i++) {
      var p = SEED_PRODUCTS[i];
      await setDoc(doc(db, 'products', p.id), Object.assign({}, p, {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }), { merge: true });
    }
    for (var j = 0; j < SEED_SERVICES.length; j++) {
      var s = SEED_SERVICES[j];
      await setDoc(doc(db, 'services', s.id), Object.assign({}, s, {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }), { merge: true });
    }
    await setDoc(doc(db, 'content', 'site'), Object.assign({}, SEED_CONTENT, {
      updatedAt: serverTimestamp()
    }), { merge: true });
    showToast('Default data imported', 'success');
    await loadProductsTable();
    await loadServicesTable();
    await loadContentEditor();
  } catch (err) {
    showToast(err.message, 'error');
  }
  setLoading(btn, false);
}

function initAdminNav() {
  document.querySelectorAll('.admin-nav a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var panelId = link.getAttribute('data-panel');
      document.querySelectorAll('.admin-nav a').forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');
      document.querySelectorAll('.admin-panel').forEach(function (p) {
        p.classList.toggle('active', p.getAttribute('data-panel') === panelId);
      });
    });
  });
}

function initDashboard(user) {
  currentUser = user;
  var emailEl = document.getElementById('admin-user-email');
  if (emailEl) emailEl.textContent = user.email;

  document.getElementById('btn-admin-signout')?.addEventListener('click', async function () {
    await adminSignOut();
    window.location.href = 'admin-login.html';
  });

  document.getElementById('btn-add-product')?.addEventListener('click', function () { openProductForm(null); });
  document.getElementById('btn-add-service')?.addEventListener('click', function () { openServiceForm(null); });
  document.getElementById('product-form')?.addEventListener('submit', saveProduct);
  document.getElementById('service-form')?.addEventListener('submit', saveService);
  document.getElementById('btn-save-content')?.addEventListener('click', saveContentJson);
  document.getElementById('btn-seed-data')?.addEventListener('click', seedFirestore);

  document.getElementById('product-image-file')?.addEventListener('change', async function (e) {
    var file = e.target.files[0];
    if (!file) return;
    try {
      var id = editingProductId || 'new';
      var result = await uploadImage(file, 'products/' + id);
      document.getElementById('product-form').imageUrl.value = result.url;
      document.getElementById('product-image-preview').innerHTML =
        '<img src="' + escapeHtml(result.url) + '" alt="Preview" style="max-width:120px;">';
      showToast('Product image uploaded', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  bindModalCloses();
  initAdminNav();
  initImageUpload();
  loadProductsTable();
  loadServicesTable();
  loadContentEditor();

  if (typeof window.renderAdminAppointments === 'function') {
    window.renderAdminAppointments();
  }
}

async function guardAdminPage() {
  if (!isFirebaseConfigured()) {
    var banner = document.getElementById('admin-config-banner');
    if (banner) banner.hidden = false;
    return;
  }
  var auth = (await import('./firebase-app.js')).getAuthInstance();
  if (!auth) return;
  await auth.authStateReady();
  watchAdminAuth(function (user, err) {
    if (user) {
      initDashboard(user);
    } else if (err) {
      showToast(err.message, 'error');
      window.location.href = 'admin-login.html';
    } else {
      window.location.href = 'admin-login.html?next=' + encodeURIComponent('admin.html');
    }
  });
}

if (document.body.getAttribute('data-page') === 'admin') {
  guardAdminPage();
}
