export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatDisplayDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return iso;
  }
}

export function showToast(message, type) {
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

export function setLoading(el, isLoading, label) {
  if (!el) return;
  if (isLoading) {
    el.setAttribute('aria-busy', 'true');
    el.dataset.loadingLabel = el.textContent;
    if (label) el.textContent = label;
    el.disabled = true;
  } else {
    el.removeAttribute('aria-busy');
    if (el.dataset.loadingLabel) {
      el.textContent = el.dataset.loadingLabel;
      delete el.dataset.loadingLabel;
    }
    el.disabled = false;
  }
}
