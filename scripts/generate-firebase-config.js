/**
 * Writes js/firebase-config.js from environment variables at build time (Vercel).
 * Required: FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID,
 * FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(root, 'js', 'firebase-config.js');

const envKeys = [
  ['apiKey', 'FIREBASE_API_KEY'],
  ['authDomain', 'FIREBASE_AUTH_DOMAIN'],
  ['projectId', 'FIREBASE_PROJECT_ID'],
  ['storageBucket', 'FIREBASE_STORAGE_BUCKET'],
  ['messagingSenderId', 'FIREBASE_MESSAGING_SENDER_ID'],
  ['appId', 'FIREBASE_APP_ID']
];

const missing = envKeys.filter(([, env]) => !process.env[env]?.trim()).map(([, env]) => env);
if (missing.length) {
  console.error('generate-firebase-config: missing environment variables:\n  ' + missing.join('\n  '));
  console.error(
    '\nVercel: Project → Settings → Environment Variables → add all six (Production + Preview + Development), then Redeploy.\n' +
      'Local: copy .env.example → .env.local, fill values, or run: npm run firebase:print-env\n' +
      'See README-FIREBASE.md → "Vercel production".'
  );
  process.exit(1);
}

const config = Object.fromEntries(
  envKeys.map(([key, env]) => [key, process.env[env].trim()])
);

const lines = Object.entries(config).map(([k, v]) => `  ${k}: ${JSON.stringify(v)},`);

const content = `/**
 * Generated at build time from environment variables. Do not commit.
 * Local dev: copy js/firebase-config.example.js to js/firebase-config.js
 */
export const firebaseConfig = {
${lines.join('\n')}
};
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, content, 'utf8');
console.log('Wrote', outPath);
