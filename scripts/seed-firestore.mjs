/**
 * Optional CLI seed — requires Firebase Admin SDK credentials.
 *
 *   npm install
 *   set GOOGLE_APPLICATION_CREDENTIALS=path\to\serviceAccountKey.json
 *   set FIREBASE_PROJECT_ID=kansy-couture
 *   npm run seed
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectId = process.env.FIREBASE_PROJECT_ID || 'kansy-couture';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON file.');
  process.exit(1);
}

admin.initializeApp({ projectId });
const db = admin.firestore();

const seedPath = join(__dirname, '../js/seed-data.js');
const raw = readFileSync(seedPath, 'utf8');
const productsMatch = raw.match(/export const SEED_PRODUCTS = (\[[\s\S]*?\]);/);
const servicesMatch = raw.match(/export const SEED_SERVICES = (\[[\s\S]*?\]);/);
const contentMatch = raw.match(/export const SEED_CONTENT = (\{[\s\S]*?\});/);

if (!productsMatch || !servicesMatch || !contentMatch) {
  console.error('Could not parse seed-data.js');
  process.exit(1);
}

const SEED_PRODUCTS = eval(productsMatch[1]);
const SEED_SERVICES = eval(servicesMatch[1]);
const SEED_CONTENT = eval(contentMatch[1]);

const now = admin.firestore.FieldValue.serverTimestamp();

async function seed() {
  const batch = db.batch();
  for (const p of SEED_PRODUCTS) {
    const ref = db.collection('products').doc(p.id);
    batch.set(ref, { ...p, createdAt: now, updatedAt: now }, { merge: true });
  }
  for (const s of SEED_SERVICES) {
    const ref = db.collection('services').doc(s.id);
    batch.set(ref, { ...s, createdAt: now, updatedAt: now }, { merge: true });
  }
  batch.set(db.collection('content').doc('site'), { ...SEED_CONTENT, updatedAt: now }, { merge: true });
  await batch.commit();
  console.log('Seeded', SEED_PRODUCTS.length, 'products,', SEED_SERVICES.length, 'services, and content/site');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
