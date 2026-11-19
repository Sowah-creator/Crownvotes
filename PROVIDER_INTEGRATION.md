# Payment, SMS and USSD provider integration notes

## Paystack Mobile Money
Current Paystack developer documentation lists Ghana Mobile Money provider identifiers:
- MTN: `mtn`
- Telecel: `vod`
- ATMoney & Airtel Money: `atl`

The charge response may require the customer to authorize the payment on their phone. Show the provider's `display_text`, listen for the `charge.success` webhook, and verify the transaction server-side before counting votes. See https://paystack.com/docs/payments/payment-channels/.

The current source contains a charge + webhook + server-side verification scaffold. It does not guarantee merchant eligibility or automatic split settlement. Do not switch live keys on without written approval for the exact voting/prize model.

## Organiser revenue
CrownVotes calculates a platform fee and organiser payable share for each verified transaction. The current release records the organiser balance and supports manual payout requests/administrative reconciliation. It does not automatically transfer the organiser's share or use Paystack subaccounts/split groups.

Automatic split settlement requires each organiser to be onboarded to an eligible provider subaccount, payout account validation, the provider's written approval, fee-bearer agreement, and integration tests. Paystack's current split documentation: https://paystack.com/docs/payments/split-payments/ and https://paystack.com/docs/payments/multi-split-payments/.

## SMS and USSD
The application currently generates contestant reference codes (e.g. CV0001), but those are not shortcodes. An SMS/USSD provider must provision a service, supply API/callback specifications, confirm coverage and pricing, and complete any NCA/network approvals. Only then should provider callbacks be connected to the vote/payment ledger.

NCA shortcode information: https://nca.org.gh/faqs/.
