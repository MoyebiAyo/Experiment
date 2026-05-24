/**
 * Template for local development. Copy to firebase-config.js (gitignored):
 *
 *   cp js/firebase-config.example.js js/firebase-config.js
 *
 * Fill values from Firebase Console → Project settings → Your apps → Web app.
 * Production (Vercel) generates js/firebase-config.js from env vars at build time.
 */
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
};
