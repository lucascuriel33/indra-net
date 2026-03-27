# Indra Net — Cloudflare Pages Edition

A premium, cinematic e-commerce storefront running entirely on **Cloudflare Pages + Functions + D1**, with **MercadoPago** payment integration. Zero servers. Global edge deployment.

---

## Architecture

```
indra-net/
├── public/                    ← Static assets (served by Cloudflare Pages)
│   ├── index.html             ← Storefront (home / shop)
│   ├── product.html           ← Product detail (?slug=xxx)
│   ├── checkout.html          ← Checkout with MercadoPago
│   ├── admin.html             ← Admin login
│   ├── dashboard.html         ← Admin dashboard (CRUD)
│   ├── success.html           ← Payment success
│   ├── failure.html           ← Payment failure
│   ├── pending.html           ← Payment pending
│   ├── _routes.json           ← Route config (static vs functions)
│   └── static/
│       ├── css/style.css      ← Full design system
│       └── js/main.js         ← Cart, toasts, spotlights
│
├── functions/                 ← Cloudflare Pages Functions (edge JS)
│   ├── _middleware.js         ← Auth parsing + CORS
│   ├── api/
│   │   ├── products/
│   │   │   ├── index.js       ← GET list / POST create
│   │   │   ├── [id].js       ← GET / PUT / DELETE single
│   │   │   └── by-slug/
│   │   │       └── [slug].js  ← GET by slug
│   │   ├── categories/
│   │   │   └── index.js       ← GET categories
│   │   ├── orders/
│   │   │   ├── index.js       ← GET all orders
│   │   │   └── [id]/
│   │   │       └── status.js  ← PUT update status
│   │   ├── checkout/
│   │   │   └── index.js       ← POST create order + MP pref
│   │   └── webhook/
│   │       └── mp.js          ← POST MercadoPago IPN
│   └── admin/
│       ├── login.js           ← POST authenticate
│       ├── logout.js          ← GET clear session
│       └── check.js           ← GET check auth status
│
├── schema.sql                 ← D1 database schema
├── seed.sql                   ← Sample product data
├── wrangler.toml              ← Cloudflare config + D1 binding
├── package.json               ← Scripts for dev/deploy/db
├── .dev.vars.example          ← Local dev secrets template
└── .gitignore
```

---

## Step-by-Step: Git + Cloudflare Pages Deployment

### Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)
- A [GitHub](https://github.com/) or [GitLab](https://gitlab.com/) account
- (Optional) [MercadoPago developer account](https://www.mercadopago.com/developers)

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

This opens your browser to authenticate with your Cloudflare account.

### 2. Clone / Init the repo

```bash
cd indra-net
git init
git add .
git commit -m "Initial commit: Indra Net e-commerce"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USER/indra-net.git
git branch -M main
git push -u origin main
```

### 3. Create the D1 Database

```bash
npx wrangler d1 create indra-net-db
```

This prints a `database_id` — copy it. Open `wrangler.toml` and paste:

```toml
[[d1_databases]]
binding = "DB"
database_name = "indra-net-db"
database_id = "paste-your-id-here"   # ← PASTE HERE
```

Commit this change:

```bash
git add wrangler.toml
git commit -m "Add D1 database ID"
git push
```

### 4. Initialize the Database

**Remote (production):**

```bash
npx wrangler d1 execute indra-net-db --file=schema.sql --remote
npx wrangler d1 execute indra-net-db --file=seed.sql --remote
```

**Local (development):**

```bash
npx wrangler d1 execute indra-net-db --file=schema.sql --local
npx wrangler d1 execute indra-net-db --file=seed.sql --local
```

Or use the shortcut: `npm run db:reset:local`

### 5. Set Up Local Development Secrets

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your values. This file is gitignored.

### 6. Test Locally

```bash
npx wrangler pages dev public
```

Open [http://localhost:8788](http://localhost:8788). You'll see the full storefront with products from D1.

### 7. Connect to Cloudflare Pages (Git Integration)

This is the recommended deployment method — auto-deploys on every push.

1. Go to [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
2. Click **Create** → **Pages** → **Connect to Git**
3. Select your GitHub/GitLab repo (`indra-net`)
4. Configure build settings:
   - **Build command:** _(leave blank — no build needed)_
   - **Build output directory:** `public`
5. Click **Save and Deploy**

Cloudflare will deploy the static files from `public/` and automatically detect the `functions/` directory for serverless functions.

### 8. Add D1 Binding in Dashboard

After the first deploy:

1. Go to **Workers & Pages** → select **indra-net**
2. Go to **Settings** → **Bindings**
3. Click **Add** → **D1 database**
4. Variable name: `DB`
5. Select your `indra-net-db` database
6. Click **Save**

> **Alternative:** If `wrangler.toml` has the correct `database_id`, the binding is applied automatically on the next deploy.

### 9. Set Environment Variables (Secrets)

In the Cloudflare Dashboard:

1. Go to **Workers & Pages** → **indra-net** → **Settings** → **Environment variables**
2. Add these **Production** variables:

| Variable | Value | Type |
|----------|-------|------|
| `ADMIN_USERNAME` | Your admin username | Encrypt |
| `ADMIN_PASSWORD` | Your admin password | Encrypt |
| `ADMIN_SECRET` | A random 32+ char string | Encrypt |
| `MP_ACCESS_TOKEN` | Your MercadoPago access token | Encrypt |
| `MP_PUBLIC_KEY` | Your MercadoPago public key | Plain |
| `SITE_URL` | `https://indra-net.pages.dev` (your URL) | Plain |
| `CURRENCY` | `ARS` (or your currency) | Plain |

3. Click **Save and Deploy** to apply.

### 10. Redeploy

Push any commit to trigger a new deployment:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

Or deploy manually:

```bash
npx wrangler pages deploy public
```

### 11. Verify

- Visit `https://indra-net.pages.dev` (or your custom domain)
- Browse products, add to cart, test checkout
- Go to `/admin.html`, log in, manage products and orders

---

## Custom Domain (Optional)

1. In the Pages project settings, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `shop.yourdomain.com`)
4. Cloudflare will auto-configure DNS if the domain is on Cloudflare

---

## MercadoPago Setup

1. Go to [mercadopago.com/developers](https://www.mercadopago.com/developers)
2. Create an application
3. Go to **Credentials**
4. Copy your **Access Token** and **Public Key**
5. For testing: use the **Test / Sandbox** credentials
6. Add them as environment variables (step 9 above)
7. Set `SITE_URL` to your deployed URL (for webhook callbacks)

**Webhook:** MercadoPago will send IPN notifications to `https://your-site.pages.dev/api/webhook/mp`. Configure this URL in your MercadoPago application settings under **Webhooks / IPN**.

---

## API Reference

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/products` | List products (`?category=`, `?search=`) |
| `GET` | `/api/products/:id` | Single product by ID |
| `GET` | `/api/products/by-slug/:slug` | Single product by slug |
| `GET` | `/api/categories` | List unique categories |
| `POST` | `/api/checkout` | Create order + MercadoPago preference |
| `POST` | `/api/webhook/mp` | MercadoPago IPN handler |

### Admin Endpoints (cookie-authenticated)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/admin/login` | Authenticate (sets HttpOnly cookie) |
| `GET` | `/admin/logout` | Clear session |
| `GET` | `/admin/check` | Check auth status |
| `POST` | `/api/products` | Create product |
| `PUT` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Delete product |
| `GET` | `/api/orders` | List all orders |
| `PUT` | `/api/orders/:id/status` | Update order status |

### Pages

| URL | Description |
|-----|-------------|
| `/` | Storefront (index.html) |
| `/product.html?slug=xxx` | Product detail |
| `/checkout.html` | Checkout |
| `/admin.html` | Admin login |
| `/dashboard.html` | Admin dashboard |
| `/success.html` | Payment success |
| `/failure.html` | Payment failure |
| `/pending.html` | Payment pending |

---

## Development Workflow

```bash
# Local dev with hot reload
npx wrangler pages dev public

# Reset local database
npm run db:reset:local

# Deploy to production
git push   # (auto-deploys via Git integration)
# — or —
npx wrangler pages deploy public
```

---

## Design System Highlights

- **Background layers:** Radial gradient base + SVG noise (1.8% opacity) + 3 animated blobs (120px blur) + Indra Net web motif (2.5% opacity)
- **Colors:** Near-black backgrounds (`#020203`), Indigo accent (`#5E6AD2`), high-contrast text hierarchy
- **Cards:** Multi-layered shadows + 1px top highlight + mouse-tracking spotlight (radial gradient follows cursor)
- **Animations:** Staggered `fadeInUp` on page load, 300ms expo-out transitions
- **Generative placeholders:** Each product without an image gets a unique constellation SVG seeded by its ID

---

## Costs

Cloudflare Pages + Functions + D1 on the **free tier** includes:
- 500 deploys/month
- 100,000 Function requests/day
- 5 million D1 reads/day, 100K writes/day
- 5 GB D1 storage

This is more than sufficient for a small-to-medium e-commerce store.
