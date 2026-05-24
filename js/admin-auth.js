import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import {
  getAuthInstance,
  getDb,
  getFirebaseConfigMessage,
  isFirebaseConfigured
} from './firebase-app.js';
import { showToast } from './utils.js';

var ADMIN_EMAIL = 'admin@kansycouture.com';

function formatAuthError(err) {
  const code = err && (err.code || err.errorCode);
  const message = (err && err.message) || 'Sign in failed.';

  if (code === 'auth/configuration-not-found') {
    return (
      'Firebase Authentication is not enabled for this project. In Firebase Console → Authentication, click Get started, ' +
      'enable Email/Password under Sign-in method, create the admin user under Users, and add this site hostname under Authorized domains. ' +
      'See README-FIREBASE.md.'
    );
  }
  if (code === 'auth/invalid-api-key' || code === 'auth/api-key-not-valid') {
    return 'Invalid Firebase API key in js/firebase-config.js. Regenerate the web app config and update Vercel FIREBASE_* env vars, then redeploy.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized for Firebase Auth. Add it under Firebase Console → Authentication → Settings → Authorized domains.';
  }
  if (/CONFIGURATION_NOT_FOUND/i.test(message)) {
    return formatAuthError({ code: 'auth/configuration-not-found' });
  }
  if (!isFirebaseConfigured()) {
    return getFirebaseConfigMessage() || message;
  }
  return message;
}

export async function isUserAdmin(user) {
  if (!user) return false;
  if (user.email === ADMIN_EMAIL) return true;
  var db = getDb();
  if (!db) return user.email === ADMIN_EMAIL;
  try {
    var snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch (e) {
    return user.email === ADMIN_EMAIL;
  }
}

export function watchAdminAuth(callback) {
  if (!isFirebaseConfigured()) {
    callback(null, new Error('Firebase is not configured. See README-FIREBASE.md'));
    return function () {};
  }
  var auth = getAuthInstance();
  return onAuthStateChanged(auth, async function (user) {
    if (!user) {
      callback(null);
      return;
    }
    var admin = await isUserAdmin(user);
    if (!admin) {
      await signOut(auth);
      callback(null, new Error('This account does not have admin access.'));
      return;
    }
    callback(user);
  });
}

export function requireAdminPage(redirectUrl) {
  var target = redirectUrl || 'admin-login.html';
  return watchAdminAuth(function (user, err) {
    if (err) {
      showToast(err.message, 'error');
      window.location.href = target;
      return;
    }
    if (!user) {
      window.location.href = target + '?next=' + encodeURIComponent(window.location.pathname);
    }
  });
}

export async function adminSignIn(email, password) {
  if (!isFirebaseConfigured()) {
    throw new Error(getFirebaseConfigMessage() || 'Firebase is not configured yet.');
  }
  var auth = getAuthInstance();
  if (!auth) {
    throw new Error(getFirebaseConfigMessage() || 'Firebase Auth could not be initialized.');
  }
  var cred;
  try {
    cred = await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    throw new Error(formatAuthError(err));
  }
  var admin = await isUserAdmin(cred.user);
  if (!admin) {
    await signOut(auth);
    throw new Error('This account is not authorized for admin access.');
  }
  return cred.user;
}

export async function adminSignOut() {
  var auth = getAuthInstance();
  if (auth) await signOut(auth);
}

export function initAdminLoginForm() {
  var form = document.getElementById('admin-login-form');
  if (!form) return;

  if (!isFirebaseConfigured()) {
    var configMsg = document.getElementById('admin-login-message');
    if (configMsg) {
      configMsg.textContent = getFirebaseConfigMessage();
      configMsg.className = 'form-message error';
    }
    return;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var msg = document.getElementById('admin-login-message');
    var btn = form.querySelector('button[type="submit"]');
    var email = document.getElementById('admin-email').value.trim();
    var password = document.getElementById('admin-password').value;
    msg.className = 'form-message';
    btn.disabled = true;
    msg.textContent = 'Signing in…';
    try {
      await adminSignIn(email, password);
      msg.textContent = 'Success! Redirecting…';
      msg.classList.add('success');
      var params = new URLSearchParams(window.location.search);
      var next = params.get('next') || 'admin.html';
      setTimeout(function () { window.location.href = next; }, 800);
    } catch (err) {
      msg.textContent = formatAuthError(err);
      msg.classList.add('error');
      btn.disabled = false;
    }
  });
}
