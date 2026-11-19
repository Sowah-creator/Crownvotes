# CrownVotes
A black-and-gold awards and voting platform starter with a public awards page, voter accounts, administrator dashboard, event/category/nominee management, vote history endpoint, and a mock payment workflow.

## Requirements
- Node.js 20+
- npm

## Run locally
1. Copy `.env.example` to `.env`.
2. Set a long random `JWT_SECRET`, and change `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Install dependencies: `npm install`
4. Start: `npm run dev` (or `npm start`)
5. Open `http://localhost:3000`.

The database is created automatically as `crownvotes.sqlite`. The admin account is seeded on first start using the credentials in `.env`.

## Admin workflow
1. Sign in using the configured admin email/password.
2. Open the account menu to access the admin dashboard.
3. Create an event. Publish it when ready.
4. Add a category, then add nominees.

For the initial version, add one category and its nominees from the event-creation panel. Additional categories and nominees can be added with the documented API endpoints.

## Payment and production readiness
`PAYMENT_PROVIDER=mock` is a local demonstration only. It does not collect money. Do not present mock confirmations as real payments. To accept real Mobile Money payments, choose a supported payment gateway and implement its server-side payment initialization and signed webhook verification. Never trust a browser redirect or client-side confirmation to mark a payment as paid. Keep provider secret keys only in environment variables. Reconcile provider transaction IDs and make webhook processing idempotent before counting votes.

Before public launch, also configure HTTPS, a production database with backups, a strong JWT secret, CORS allow-list, monitoring, privacy policy, terms/refund policy, event-specific vote limits, audit logs, and independent security testing. SQLite is suitable for local development, not a high-volume production launch.

## Main API
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/me`
- `GET /api/events`, `GET /api/events/:slug`
- `POST /api/admin/events` (admin)
- `POST /api/admin/events/:id/categories` (admin)
- `POST /api/admin/categories/:id/nominees` (admin)
- `GET /api/admin/overview`, `GET /api/admin/results` (admin)
- `POST /api/payments/initialize` (signed-in voter)
- `GET /api/votes/mine` (signed-in voter)
- `POST /api/payments/mock-confirm/:reference` (development mock mode only)

## Notes
Vote prices are stored in pesewas (e.g. `100` = GHS 1.00). Payment status and vote creation happen server-side. The mock confirmation route is disabled when `NODE_ENV=production` or the provider is not `mock`.
