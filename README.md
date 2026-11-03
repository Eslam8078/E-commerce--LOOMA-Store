# LOOMA — The Everyday Edit

A full-stack fashion e-commerce platform built around a warm, editorial shopping experience. LOOMA includes a public storefront, customer account area, and a protected administration studio.

![LOOMA fashion campaign photography](https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=85)

## Highlights

### Shopping experience
- Responsive editorial storefront with curated collections, new arrivals, best sellers, customer notes, and service highlights.
- Product catalogue with keyword search, category/subcategory filters, and season filters.
- Quick add-to-bag from the homepage and product listing.
- Persistent wishlist saved in the current browser, with a header counter and dedicated saved-items page.
- Guest shopping bag stored locally and merged into the customer cart after sign-in.
- Product details, stock validation, and price-change detection before checkout.
- Customer accounts, profile and address management, order history, cancellation/refund flows, notifications, and testimonials.
- Cash-on-delivery checkout and governorate-based delivery fees.
- FAQ, contact, privacy, and terms pages.

### Admin studio
- Protected dashboard with sales summaries and operational notifications.
- Product, category, and subcategory management.
- Product activation, soft deletion/restoration, best-seller and new-arrival merchandising flags.
- Order and customer management.
- Testimonials, FAQs, delivery-fee management, reports, and database backup/restore utilities.

### Technology
| Layer | Stack |
|---|---|
| Frontend | Angular 22, TypeScript, RxJS, Bootstrap 5, Bootstrap Icons |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JWT and bcrypt |
| Uploads | Multer |
| Logging | Winston |

## Repository layout

```text
looma-store/
├── Backend/             # Express API, MongoDB models, controllers, services, seed
├── Frontend/            # Angular storefront and admin application
├── docker-compose.yml   # Optional local MongoDB service
├── package.json         # Root convenience scripts
└── README.md
```

## Requirements

- Node.js 22.22.3+ or 24.15.0+ (required by the locked Angular 22 toolchain)
- npm 10+
- MongoDB 7+ or Docker Desktop with Docker Compose

## Run locally

### 1. Start MongoDB

Using Docker Compose:

```bash
docker compose up -d mongodb
```

Or use a local MongoDB installation and adjust `Backend/.env` accordingly.

### 2. Configure the API

```bash
cd Backend
cp .env.example .env
npm install
```

Set a private `SECRET_KEY` before starting the server. Keep `.env` out of Git.

### 3. Seed the demo catalogue

```bash
npm run seed
```

The seed creates sample categories, subcategories, 20 products, demo customers, FAQs, testimonials, and a local admin account. It also refreshes product image URLs and merchandising flags for existing demo products.

**Local demo accounts**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@looma.demo` | `Admin@123` |
| Customer | `ahmed@example.com` | `Customer@123` |
| Customer | `mona@example.com` | `Customer@123` |
| Customer | `youssef@example.com` | `Customer@123` |

These are development-only credentials. Change or remove them before deploying a public instance. Never use demo credentials in production.

### 4. Start the backend

```bash
cd Backend
npm run dev
```

The API listens on `http://localhost:3000` by default.

### 5. Configure and start Angular

In a second terminal:

```bash
cd Frontend
npm install
npm start
```

Open `http://localhost:4200`.

The default development environment targets `http://localhost:3000/api`. Update `Frontend/src/environment/env.prod.ts` with your deployed API URL and support email before building for production.

## Useful scripts

Run these from the repository root:

```bash
npm run dev:backend       # Start API with nodemon
npm run dev:frontend      # Start Angular dev server
npm run build:frontend    # Production Angular build
npm run seed              # Insert or refresh demo data
npm run seed:reset        # Recreate demo catalogue and users
```

Or run each script from its corresponding `Backend` or `Frontend` directory.

## Product photography in demo data

The demo seed uses stable Unsplash CDN image URLs so the catalogue is populated immediately without checking binary image files into Git. The site accepts both absolute image URLs and filenames served from `Backend/uploads/`. Internet access is required to load the remote sample photos. Replace the demo URLs with original or properly licensed product photography before a commercial launch, and review the [Unsplash licence](https://unsplash.com/license), image-specific terms, and attribution requirements for your use case.

## Production checklist

- [ ] Set a strong, unique `SECRET_KEY` and production database credentials.
- [ ] Restrict `ALLOWED_ORIGINS` to the deployed frontend origin(s).
- [ ] Replace the API/static URLs in `Frontend/src/environment/env.prod.ts`.
- [ ] Configure `supportEmail` in both environment files.
- [ ] Replace sample accounts and passwords; do not expose admin demo credentials.
- [ ] Replace demo product images and testimonials with approved business content.
- [ ] Configure HTTPS, secure hosting, database backups, and production logging.
- [ ] Review privacy, returns, delivery, and terms copy for the actual business.

## Notes

- The wishlist is intentionally browser-local and is not synchronised between devices or accounts.
- Guest cart contents are stored in local storage until a customer signs in and merges them with the server cart.
- The contact page opens the visitor's configured email application. Set a real `supportEmail` value before launch.
- Database backup/restore features require MongoDB Database Tools (`mongodump` and `mongorestore`) to be installed on the API host.
