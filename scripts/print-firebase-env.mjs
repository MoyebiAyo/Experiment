/**
 * Prints the six FIREBASE_* env vars for Vercel (from Firebase CLI sdkconfig).
 * Usage: node scripts/print-firebase-env.mjs [project-id]
 * Requires: firebase login (npx firebase-tools uses your session).
 */
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function projectIdFromFirebaserc() {
  try {
    const rc = JSON.parse(readFileSync(join(root, '.firebaserc'), 'utf8'));
    return rc.projects?.default;
  } catch {
    return undefined;
  }
}

const projectId = process.argv[2] || projectIdFromFirebaserc() || 'kansy-couture';

let raw;
try {
  raw = execSync(
    `npx -y firebase-tools@latest apps:sdkconfig WEB --project ${projectId}`,
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
  );
} catch (err) {
  console.error('Failed to fetch Firebase web config. Run: npx firebase-tools@latest login');
  console.error(err.stderr?.toString() || err.message);
  process.exit(1);
}

const match = raw.match(/\{[\s\S]*\}/);
if (!match) {
  console.error('Could not parse sdkconfig output.');
  process.exit(1);
}

const cfg = JSON.parse(match[0]);
const vars = {
  FIREBASE_API_KEY: cfg.apiKey,
  FIREBASE_AUTH_DOMAIN: cfg.authDomain,
  FIREBASE_PROJECT_ID: cfg.projectId,
  FIREBASE_STORAGE_BUCKET: cfg.storageBucket,
  FIREBASE_MESSAGING_SENDER_ID: cfg.messagingSenderId,
  FIREBASE_APP_ID: cfg.appId
};

const missing = Object.entries(vars).filter(([, v]) => !v);
if (missing.length) {
  console.error('Incomplete sdkconfig:', missing.map(([k]) => k).join(', '));
  process.exit(1);
}

console.log(`# Firebase web config for project: ${projectId}`);
console.log('# Vercel → Project → Settings → Environment Variables');
console.log('# Enable: Production, Preview, Development → Save → Redeploy\n');

for (const [name, value] of Object.entries(vars)) {
  console.log(`${name}=${value}`);
}

console.log('\n# Dashboard: add each name/value pair separately (do not commit this output to git).');
