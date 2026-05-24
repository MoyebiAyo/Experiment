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

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
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
