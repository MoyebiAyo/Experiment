import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js';
import { firebaseConfig } from './firebase-config.js';

let app = null;
let auth = null;
let db = null;
let storage = null;
let initError = null;

const PLACEHOLDER_VALUES = new Set([
  'YOUR_API_KEY',
  'YOUR_PROJECT_ID',
  'YOUR_SENDER_ID',
  'YOUR_APP_ID'
]);

export function getFirebaseConfigIssues() {
  const issues = [];
  const c = firebaseConfig || {};

  if (!c.apiKey || PLACEHOLDER_VALUES.has(c.apiKey)) {
    issues.push('apiKey is missing or still a placeholder');
  }
  if (!c.authDomain || PLACEHOLDER_VALUES.has(c.authDomain) || !String(c.authDomain).includes('.')) {
    issues.push('authDomain is missing or invalid');
  }
  if (!c.projectId || PLACEHOLDER_VALUES.has(c.projectId)) {
    issues.push('projectId is missing or still a placeholder');
  }
  if (!c.storageBucket || PLACEHOLDER_VALUES.has(c.storageBucket)) {
    issues.push('storageBucket is missing or still a placeholder');
  }
  if (!c.messagingSenderId || PLACEHOLDER_VALUES.has(String(c.messagingSenderId))) {
    issues.push('messagingSenderId is missing or still a placeholder');
  }
  if (!c.appId || PLACEHOLDER_VALUES.has(c.appId)) {
    issues.push('appId is missing or still a placeholder');
  }

  return issues;
}

export function isFirebaseConfigured() {
  return getFirebaseConfigIssues().length === 0;
}

export function getFirebaseConfigMessage() {
  const issues = getFirebaseConfigIssues();
  if (!issues.length) return '';
  return (
    'Firebase is not configured for this deployment. ' +
    issues.join('; ') +
    '. On Vercel, set all six FIREBASE_* environment variables and redeploy. ' +
    'Locally, copy js/firebase-config.example.js to js/firebase-config.js. See README-FIREBASE.md.'
  );
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
    } catch (err) {
      initError = err;
      console.error('Firebase init failed', err);
      return null;
    }
  }
  return app;
}

export function getAuthInstance() {
  getFirebaseApp();
  return auth;
}

export function getDb() {
  getFirebaseApp();
  return db;
}

export function getStorageInstance() {
  getFirebaseApp();
  return storage;
}

export function getInitError() {
  return initError;
}

export { firebaseConfig };
