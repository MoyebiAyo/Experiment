# Firebase setup — Kansy Couture

This project uses **Firebase Auth**, **Cloud Firestore**, and **Firebase Storage** so admins can manage products, services, images, and site copy. The public site (`index.html`, `collections.html`, `pricing.html`) loads catalog data from Firestore with a fallback to built-in seed data when offline or unconfigured.

## Firebase project

| Item | Value |
|------|--------|
| **Project ID (default in `.firebaserc`)** | `kansy-couture` |
| **Admin login URL** | `/admin-login.html` |
| **Admin dashboard** | `/admin.html` (requires Firebase sign-in) |

Change the project ID in `.firebaserc` if you use a different Firebase project name.

## One-time setup (Firebase Console + CLI)

### 1. Sign in to Firebase CLI

```bash
npx -y firebase-tools@latest login
```

In Cursor, you can also use the Firebase MCP **firebase_login** tool.

### 2. Create or link a project

```bash
cd "c:\Users\NEW USER\Desktop\Experiment web"
npx -y firebase-tools@latest projects:create kansy-couture --display-name "Kansy Couture"
# OR link an existing project:
npx -y firebase-tools@latest use --add YOUR_PROJECT_ID
```

### 3. Enable services in [Firebase Console](https://console.firebase.google.com)

1. **Authentication** → Sign-in method → enable **Email/Password**
2. **Firestore Database** → Create database (production mode is fine; deploy rules below)
3. **Storage** → Get started (default bucket)

### 4. Register a web app

Console → Project settings → Your apps → **Web** → use the config values locally or in Vercel env vars (see below).

`js/firebase-config.js` is **gitignored** and never committed. The repo only ships `js/firebase-config.example.js` with placeholders.

### 5. Create admin user

Authentication → Users → **Add user**:

- Email: `admin@kansycouture.com`
- Password: choose a strong password (replace the old demo `admin123` local login)

Optional: add more admins by creating a document `admins/{uid}` in Firestore (UID from Authentication).

### 6. Deploy security rules

```bash
npx -y firebase-tools@latest deploy --only firestore:rules,firestore:indexes,storage
```

### 7. Seed data

**Option A — Admin UI (recommended)**  
Sign in at `admin-login.html` → Overview → **Import site defaults to Firestore**.

**Option B — Node script** (requires a service account key; not committed):

```bash
npm install
set GOOGLE_APPLICATION_CREDENTIALS=path\to\serviceAccount.json
npm run seed
```

## Local development

1. Copy the example config (once per machine):

   ```bash
   cp js/firebase-config.example.js js/firebase-config.js
   ```

2. Edit `js/firebase-config.js` with your Firebase web app values from the Console.
3. Serve the site from the project root (any static server). `js/firebase-config.js` stays on disk only and is listed in `.gitignore`.

## Vercel production

The deploy runs `npm run build`, which runs `scripts/generate-firebase-config.js` and writes `js/firebase-config.js` from environment variables.

### Required Vercel environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (Production, Preview, and Development as needed):

| Variable | Example / notes |
|----------|-----------------|
| `FIREBASE_API_KEY` | Web API key from Firebase Console |
| `FIREBASE_AUTH_DOMAIN` | `kansy-couture.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `kansy-couture` |
| `FIREBASE_STORAGE_BUCKET` | `kansy-couture.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | Numeric sender ID |
| `FIREBASE_APP_ID` | `1:…:web:…` |

`vercel.json` sets `"buildCommand": "npm run build"` so each deployment regenerates the config file.

In Firebase Console → Authentication → **Authorized domains**, add every hostname where the site is served:

- `kansycouture.vercel.app`
- `kancyculture.vercel.app` (if still in use)
- `localhost` (for local testing)

## Security: exposed API key & rotation

GitHub secret scanning flagged a Google API key that was committed in `js/firebase-config.js` (commit `de7dabe5`). **Removing the file from the latest commit does not remove it from git history.** You should still:

1. **Rotate or restrict the key** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (APIs & Services → Credentials), or regenerate from Firebase Console → Project settings → Your apps.
2. **Application restrictions** → HTTP referrers, for example:
   - `https://kancyculture.vercel.app/*`
   - `http://localhost/*`
   - `http://127.0.0.1/*`
3. **API restrictions** → allow only Firebase-related APIs (Identity Toolkit, Firestore, Storage, etc.).
4. Keep **Firestore** and **Storage** rules strict (see below); client keys alone must not grant admin access.

### Optional: purge key from git history

To remove the key from all commits (heavy, rewrites history):

- Use [git-filter-repo](https://github.com/newren/git-filter-repo) or [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/), then force-push and coordinate with anyone who cloned the repo.

Even after a history rewrite, **rotate the key** if it was ever public.

## Collections schema

### `products/{id}`

| Field | Type | Notes |
|-------|------|--------|
| `name` | string | Display name |
| `description` | string | Meta line under title |
| `price` | string | e.g. `From $890` |
| `priceNote` | string? | e.g. consultation note |
| `category` | string | `dresses`, `outerwear`, `footwear`, `accessories` |
| `imageUrl` | string | Local path or Storage URL |
| `imagePath` | string? | Storage path |
| `badge` | string? | e.g. `Bespoke`, `Popular` |
| `active` | boolean | `false` = hidden on public site |
| `sortOrder` | number | Gallery order |
| `createdAt`, `updatedAt` | timestamp | |

### `services/{id}`

| Field | Type | Notes |
|-------|------|--------|
| `title`, `description` | string | |
| `price`, `period` | string? | Pricing page |
| `features` | string[]? | Bullet list |
| `icon`, `ctaLabel`, `ctaHref` | string | Home / CTA |
| `whatsappPackage` | string? | WhatsApp order label |
| `featured`, `active` | boolean | |
| `sortOrder` | number | |
| `createdAt`, `updatedAt` | timestamp | |

### `content/site` (single document)

| Field | Type | Notes |
|-------|------|--------|
| `utilityBar` | map | Top bar message + link |
| `heroSlides` | array | Carousel copy + images |
| `promo` | map | Promo banner |
| `stories` | array | Style journal |
| `features` | array | Home feature strip |
| `about` | map | Footer about text |
| `paymentInfo` | map | Pricing page payment block |
| `updatedAt` | timestamp | |

### `admins/{uid}`

Read-only via rules; create manually in Console for extra admin UIDs.

## Security rules summary

- **Products / services**: public read only when `active == true`; admins can read/write all.
- **Content**: public read; admin write only.
- **Storage** `products/*`, `site/*`: public read; admin write (images only, max 5MB).
- **Admin**: `admin@kansycouture.com` or document in `admins/{uid}`.

Review `firestore.rules` and `storage.rules` before production traffic.

## Admin workflow

1. Open **https://kansycouture.vercel.app/admin-login.html** (or local equivalent).
2. Sign in with the Firebase admin user.
3. Use **Products**, **Services**, **Write-ups**, and **Images** panels.
4. WhatsApp order buttons on the public site are unchanged (`script.js`).

## Files added

| File | Purpose |
|------|---------|
| `firebase.json`, `.firebaserc` | CLI project config |
| `firestore.rules`, `storage.rules` | Security |
| `js/firebase-config.example.js` | Committed template (placeholders) |
| `js/firebase-config.js` | Local or build-generated config (**gitignored**) |
| `scripts/generate-firebase-config.js` | Vercel build: writes config from env vars |
| `vercel.json` | Build command for static deploy |
| `js/firebase-app.js` | SDK init |
| `js/catalog.js` | Public Firestore loading |
| `js/admin-auth.js`, `js/admin-dashboard.js` | Admin auth + CRUD |
| `js/seed-data.js` | Default catalog/copy |
| `admin-login.html` | Firebase admin sign-in |
| `scripts/seed-firestore.mjs` | Optional CLI seed |

## Troubleshooting

### `Firebase: Error (auth/configuration-not-found)`

This means **Firebase Authentication is not set up** for the project (Identity Toolkit has no sign-in configuration), not that the password is wrong.

**Fix in Firebase Console (required at least once):**

1. Open [Authentication](https://console.firebase.google.com/project/kansy-couture/authentication) for project `kansy-couture`.
2. Click **Get started** if you have not opened Auth before.
3. **Sign-in method** → enable **Email/Password** → Save.
4. **Users** → **Add user** → `admin@kansycouture.com` and a strong password (replace demo `admin123`).
5. **Settings** → **Authorized domains** → add `kansycouture.vercel.app` (and any other Vercel preview/production hostnames).

**Fix on Vercel (production config file):**

1. Project → **Settings** → **Environment Variables** → set all six (names must match exactly):

   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN` (e.g. `kansy-couture.firebaseapp.com`)
   - `FIREBASE_PROJECT_ID` (`kansy-couture`)
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

2. **Redeploy** so `npm run build` runs `scripts/generate-firebase-config.js` and writes `js/firebase-config.js`.

3. Confirm production serves config: open `https://YOUR-DOMAIN/js/firebase-config.js` — it must return real values, not 404 or `YOUR_API_KEY` placeholders.

**Optional — enable Email/Password via CLI** (same project directory):

```bash
# firebase.json should include:
# "auth": { "providers": { "emailPassword": true } }
npx -y firebase-tools@latest deploy --only auth
```

Then create the admin user in Console → Authentication → Users (CLI cannot set passwords for you without a service account import file).

**If `kansycouture.vercel.app` shows “deployment not found”:** the Vercel alias points to a deleted deployment — reconnect the domain in Vercel → Project → Settings → Domains, or deploy from the linked Git repo to `main`.

### Other issues

| Issue | Fix |
|-------|-----|
| Permission denied on save | Deploy rules; confirm signed-in user is admin |
| Empty gallery | Run **Import site defaults** or check `active` flags |
| Firebase not configured banner | Copy example → `js/firebase-config.js` locally; on Vercel, set env vars and redeploy |
| `auth/unauthorized-domain` | Add the site hostname under Authentication → Authorized domains |
| `auth/invalid-api-key` | Regenerate web app config; update all six Vercel env vars and redeploy |
| Index errors | Deploy indexes: `firebase deploy --only firestore:indexes` |
