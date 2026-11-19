# CrownVotes production deployment checklist

## Before deployment
- [ ] Create the CrownVotes GitHub repository and upload the project contents.
- [ ] Create a Render account and deploy the included `render.yaml` blueprint.
- [ ] Use a persistent disk for the SQLite database; do not deploy a voting database to ephemeral storage.
- [ ] Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (14+ characters), `APP_BASE_URL`, and `PAYOUT_DATA_KEY` in Render environment settings.
- [ ] Back up `PAYOUT_DATA_KEY` securely. Losing it makes encrypted organiser payout destinations unreadable.
- [ ] Confirm the generated `JWT_SECRET` is retained and not exposed.
- [ ] Keep `PAYMENT_PROVIDER=mock` until provider and regulatory approval is documented.
- [ ] Register a domain only after checking availability and the total renewal cost; connect DNS and HTTPS after deployment.

## Before accepting money
- [ ] Obtain written approval for the precise CrownVotes business model, including paid voting and every prize type (recognition, cash, material, mixed).
- [ ] Obtain any required Ghana regulatory, network, NCA, data-protection, tax and consumer-protection advice/approvals.
- [ ] Sign an organiser agreement stating commission, fee treatment, payout timetable, refund/chargeback treatment and dispute handling.
- [ ] Confirm each organiser's identity and payout destination; verify bank/MoMo ownership.
- [ ] Complete Paystack test transactions for MTN (`mtn`), Telecel (`vod`) and ATMoney/Airtel Money (`atl`) where enabled on the merchant account.
- [ ] Test successful, failed, pending, timed-out, duplicate webhook, under/overpayment, refund and chargeback cases.
- [ ] Reconcile gateway settlement reports against CrownVotes payment, commission, organiser payable and payout ledgers.
- [ ] Independently review authentication, access controls, API validation, backups, rate limits and load behaviour.
- [ ] Replace draft policy templates with legal-reviewed Terms, Privacy Notice, Voting Rules, Refund Policy and Organiser Agreement.

## Operational controls
- Paid voting remains locked until an administrator records the provider/compliance approval note for that event.
- A published event page is not the same as approval to collect paid votes.
- A payout marked `paid` must correspond to a completed bank/MoMo transfer and its transfer reference.
- Do not publish a shortcode or SMS voting instruction until an aggregator has contracted, provisioned and tested it.
