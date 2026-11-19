# CrownVotes

CrownVotes is a responsive black-and-gold awards and voting platform starter built for Ghana. It includes public award pages, voter accounts, organiser applications and dashboards, event/category/contestant management, unique contestant codes, commission accounting, organiser payout requests, administrator controls, and a Paystack Mobile Money integration scaffold.

## Features in this build

### Public and voter experience
- Responsive homepage and public event catalogue.
- Published event pages with categories, contestants, biographies, photos and vote totals.
- Voter registration and sign-in.
- Vote history with payment references and amounts.
- Mobile Money checkout interface for MTN, Telecel and AT (subject to gateway account and provider support).
- Vote totals update only after a verified successful payment.

### Organiser experience
- Voter can submit an organiser application; an administrator reviews it.
- Approved organisers can create draft events, add categories and contestants, then publish once at least one contestant exists.
- Each contestant gets a code such as `CV0001` (a contestant ID, not an SMS short code).
- Organiser dashboard shows gross payments, CrownVotes commission, organiser share, available balance, payment history and payout history.
- Organisers can request a payout to a bank or Mobile Money destination.

### Administrator experience
- Overview of users, organisers, events, votes, platform commission and organiser earnings.
- Review and approve/reject organiser applications.
- Review an event's payment approval status.
- Configure the default platform commission and set a commission per event when an administrator creates it; organisers cannot set their own platform fee.
- Review transactions and payout requests; mark payout processing/paid/rejected.
- Event publishing, payment approval and payout controls are separate.

## Commission and organiser settlement

All amounts are stored as integer pesewas (`100` = GHS 1.00). For every verified successful paid-vote transaction:

```text
CrownVotes commission = floor(gross amount × commission basis points / 10,000)
Organiser share       = gross amount − CrownVotes commission
```

The default commission is 10%, configurable from 0% to 30%. An event can have its own rate. The fee and organiser share are frozen at checkout and recorded against the successful payment. The organiser rate is set by CrownVotes and agreed with the organiser before payment approval.

**Important settlement distinction:** this version calculates and accounts for CrownVotes' commission and the organiser's payable balance. Funds are collected into the configured merchant account; the code does not automatically split or transfer funds to organisers. Organisers request payouts and an administrator records processing/payment after an actual bank or MoMo transfer. Automatic marketplace splitting requires an approved payment-provider subaccount/split configuration and is not enabled in this starter.

Payment-provider processing fees are separate from CrownVotes commission. The current calculation does not silently deduct gateway fees from the organiser share; disclose and agree the treatment in organiser contracts.

## Payment compliance and testing

`PAYMENT_PROVIDER=mock` is for local development only. It does not collect real money. Mock confirmation is disabled in production.

Paystack Mobile Money is scaffolded for Ghana provider codes `mtn` (MTN), `vod` (Telecel) and `atl` (ATMoney/Airtel Money), according to the current developer documentation. Paystack describes Mobile Money authorization as an offline customer approval completed through the phone, with a `charge.success` webhook and server-side verification. <https://paystack.com/docs/payments/payment-channels/> **Do not enable paid voting or use live keys until Paystack has confirmed in writing that it permits CrownVotes' exact paid-voting and prize model** (including recognition-only, cash, material and mixed awards), and any required network/regulatory approvals are obtained. A general merchant account approval is not enough. Every event remains `payment_approval=pending` until reviewed by an administrator.

After written approval:
1. Start with Paystack test keys and a test merchant configuration.
2. Set `PAYMENT_PROVIDER=paystack` and `PAYMENT_SECRET` as a server-side environment secret.
3. Configure `https://YOUR-DOMAIN/api/payments/paystack-webhook` in the provider dashboard.
4. Test each supported network, successful/failed/pending payments, duplicate webhooks, refunds, chargebacks, settlement reports and payout reconciliation.
5. Only switch to live keys after independent testing and provider confirmation.

The webhook validates the Paystack signature and verifies the transaction server-side (reference, amount, currency and successful status) before adding votes. The voter can also request a status refresh, which performs a server-side verification if the webhook has not arrived. Never trust a browser redirect or user screenshot as proof of payment.

## SMS and USSD

Contestant codes such as `CV0001` are identifiers only. They are **not** a live SMS number, USSD code or shortcode. This source build does not yet connect to an SMS/USSD aggregator, does not reserve `*928*624#`, and does not route incoming SMS/USSD sessions. That requires a selected provider, confirmed shortcode availability, provider-specific callback/API documentation, network coverage confirmation and any applicable NCA/network approvals. Do not advertise SMS/USSD voting until this integration is contracted, implemented and tested.

## Security and privacy

- Passwords are hashed with bcrypt.
- API sessions use signed JWTs; use a unique strong `JWT_SECRET`.
- Rate limiting and Helmet security headers are enabled.
- Payout destination details are encrypted at rest with `PAYOUT_DATA_KEY`; set a unique value of at least 32 characters in production and keep it backed up securely. Losing this key means encrypted payout destinations cannot be recovered.
- Keep payment secrets only in the hosting environment, never in browser files or GitHub.
- Use HTTPS, restrict `APP_BASE_URL` to the production domain(s), keep dependencies updated and back up the persistent database.

Before public launch, add/complete email verification, password reset, a formal privacy notice, organiser agreement, voting rules, refund/chargeback policy, retention/deletion process, audit/monitoring, load testing and independent security testing. The starter has not undergone external penetration testing or legal review. Event start/end windows are enforced by the voting API, payout requests are checked in an immediate database transaction, and payout destination details are encrypted at rest. The included Terms and Privacy pages and organiser agreement are draft templates and require legal review and completion before public launch.

## Run locally

Requires Node.js 20+ and npm.

1. Copy `.env.example` to `.env`.
2. Set a unique `JWT_SECRET`, `ADMIN_EMAIL`, and strong `ADMIN_PASSWORD` before the first start. The administrator is seeded only on first startup when both admin values are present.
3. Run `npm install`.
4. Run `npm start` (or `npm run dev`).
5. Run `npm run check` and `npm test` for syntax and commission arithmetic checks.
6. Open `http://localhost:3000`.

SQLite is used for this starter. `DB_PATH` or `DATABASE_FILE` selects the database file. For larger voting campaigns and multiple concurrent workers, migrate to managed PostgreSQL before launch.

## Deploy with Render

A `render.yaml` blueprint is included. It uses a paid Starter web service and a persistent disk because a free ephemeral filesystem is not safe for a SQLite voting database. Review current hosting and disk prices before accepting the deployment cost. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 14 characters), `APP_BASE_URL`, and `PAYOUT_DATA_KEY` (at least 32 characters) in Render's environment settings. Keep `PAYMENT_PROVIDER=mock` until provider approval and test completion.

## Main API routes

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/me`
- `POST /api/organiser/apply`, `GET /api/organiser/application`
- `GET /api/organiser/dashboard`, `POST /api/organiser/events`
- `GET /api/organiser/events/:id`, `PATCH /api/organiser/events/:id`, `PATCH /api/organiser/events/:id/status`
- `POST /api/organiser/events/:id/categories`, `POST /api/organiser/categories/:id/nominees`, `PATCH/DELETE /api/organiser/nominees/:id`
- `POST /api/organiser/payouts`, `GET /api/votes/mine`
- `GET /api/events`, `GET /api/events/:slug`, `GET /api/events/:slug/results`, `GET /api/nominees/:id/vote-code`
- `GET /api/admin/overview`, `GET /api/admin/applications`, `PATCH /api/admin/applications/:id`, `GET /api/admin/audit-logs`
- `GET /api/admin/events`, `PATCH /api/admin/events/:id/payment-approval`, `PATCH /api/admin/events/:id/commission`
- `PATCH /api/admin/settings/commission`, `GET /api/admin/finance`, `PATCH /api/admin/payouts/:id`, `GET /api/admin/results`
- `POST /api/payments/initialize`, `GET /api/payments/status/:reference`, `POST /api/payments/paystack-webhook`
