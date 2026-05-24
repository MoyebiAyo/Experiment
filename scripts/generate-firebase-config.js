/**
 * Writes js/firebase-config.js at build time (Vercel / local).
 * Prefers FIREBASE_* env vars; falls back to kansy-couture public web config
 * so deploys succeed when Vercel env vars are not yet set.
 * Env vars override fallbacks for rotation without code changes.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(root, 'js', 'firebase-config.js');

// Public Firebase web app config (client-side keys are not secret).
// Override via FIREBASE_* env vars in Vercel or .env.local.
const FALLBACK_CONFIG = {
  apiKey: 'AIzaSyA30guWlg0lJCaIF-FTQJ8KmX_puLGa23E',
  authDomain: 'kansy-couture.firebaseapp.com',
  projectId: 'kansy-couture',
  storageBucket: 'kansy-couture.firebasestorage.app',
  messagingSenderId: '377264310869',
  appId: '1:377264310869:web:6d5b343d9ee6cf76f762dc'
};

const envKeys = [
  ['apiKey', 'FIREBASE_API_KEY'],
  ['authDomain', 'FIREBASE_AUTH_DOMAIN'],
  ['projectId', 'FIREBASE_PROJECT_ID'],
  ['storageBucket', 'FIREBASE_STORAGE_BUCKET'],
  ['messagingSenderId', 'FIREBASE_MESSAGING_SENDER_ID'],
  ['appId', 'FIREBASE_APP_ID']
];

const missing = envKeys.filter(([, env]) => !process.env[env]?.trim()).map(([, env]) => env);

const config = Object.fromEntries(
  envKeys.map(([key, env]) => {
    const fromEnv = process.env[env]?.trim();
    return [key, fromEnv || FALLBACK_CONFIG[key]];
  })
);

const usingEnv = missing.length === 0;
const usingFallback = missing.length > 0;

if (usingFallback) {
  console.warn(
    'generate-firebase-config: missing environment variables (using kansy-couture fallback):\n  ' +
      missing.join('\n  ')
  );
  if (process.env.VERCEL === '1') {
    console.warn(
      'Vercel: set all six FIREBASE_* in Project → Settings → Environment Variables (Production, Preview, Development) to override fallback, then redeploy.'
    );
  } else {
    console.warn(
      'Local: copy .env.example → .env.local, fill values, or run: npm run firebase:print-env'
    );
  }
} else {
  console.log('generate-firebase-config: using FIREBASE_* environment variables.');
}

const lines = Object.entries(config).map(([k, v]) => `  ${k}: ${JSON.stringify(v)},`);

const sourceNote = usingEnv
  ? 'Generated at build time from environment variables.'
  : 'Generated at build time using kansy-couture fallback (set FIREBASE_* env vars to override).';

const content = `/**
 * ${sourceNote} Do not commit.
 * Local dev: copy js/firebase-config.example.js to js/firebase-config.js
 */
export const firebaseConfig = {
${lines.join('\n')}
};
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, content, 'utf8');
console.log('Wrote', outPath, usingEnv ? '(env)' : '(fallback)');
