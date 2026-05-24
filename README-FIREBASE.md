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

Console → Project settings → Your apps → **Web** → copy config into `js/firebase-config.js` (see `js/firebase-config.example.js`).

Web API keys are public by design; security comes from **Firestore/Storage rules** and **Auth**.

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

## Vercel production

1. Add the same values from `js/firebase-config.js` to the Vercel project (optional if you commit config with real keys).
2. Ensure `js/firebase-config.js` is deployed (not only `.example`).
3. In Firebase Console → Authentication → **Authorized domains**, add:
   - `kancyculture.vercel.app`
   - `localhost` (for local testing)

No server-side env vars are required for this static site unless you add a build step to inject config.

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

1. Open **https://kancyculture.vercel.app/admin-login.html** (or local equivalent).
2. Sign in with the Firebase admin user.
3. Use **Products**, **Services**, **Write-ups**, and **Images** panels.
4. WhatsApp order buttons on the public site are unchanged (`script.js`).

## Files added

| File | Purpose |
|------|---------|
| `firebase.json`, `.firebaserc` | CLI project config |
| `firestore.rules`, `storage.rules` | Security |
| `js/firebase-config.js` | Web app config |
| `js/firebase-app.js` | SDK init |
| `js/catalog.js` | Public Firestore loading |
| `js/admin-auth.js`, `js/admin-dashboard.js` | Admin auth + CRUD |
| `js/seed-data.js` | Default catalog/copy |
| `admin-login.html` | Firebase admin sign-in |
| `scripts/seed-firestore.mjs` | Optional CLI seed |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Permission denied on save | Deploy rules; confirm signed-in user is admin |
| Empty gallery | Run **Import site defaults** or check `active` flags |
| Firebase not configured banner | Fill in `js/firebase-config.js` |
| Index errors | Deploy indexes: `firebase deploy --only firestore:indexes` |
