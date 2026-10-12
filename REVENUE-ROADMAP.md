# BaseGrid 25 — Revenue Roadmap

## What the product is today

BaseGrid 25 is a static directory and wallet-transfer frontend. It does not currently have user accounts, paid listing fulfillment, a backend, order records, analytics, or payment reconciliation. **No revenue is guaranteed or generated merely by publishing the website.** The existing USDC transfer button is a direct wallet transfer, not a complete merchant checkout.

## Best initial business model: recurring B2B listings

Sell measurable visibility and developer tools to legitimate Base ecosystem projects—not investment returns or token-price promises.

1. **Free listing:** verified contract address, BaseScan link, basic project details.
2. **Verified profile — test at $29/month:** project description, official links, verification checklist, update history.
3. **Featured profile — test at $99/month:** clearly labelled sponsored placement, richer profile, click/report metrics.
4. **Ecosystem sponsor — test at $299/month:** labelled banner or newsletter placement and a monthly performance summary.

These are price hypotheses to test, not validated market prices. Do not sell verification, rankings, or positive reviews. Sponsored placements must be conspicuously labelled and separated from independent risk indicators.

### Gross recurring-revenue scenarios (illustrative only)

- 10 verified profiles × $29 = $290/month gross.
- 10 verified + 5 featured profiles × their respective prices = $785/month gross.
- 25 verified + 10 featured + 2 sponsors = $2,615/month gross.

These are arithmetic scenarios, not forecasts. They exclude fees, taxes, refunds, legal/accounting costs, support, and acquisition costs; actual revenue may be $0.

## Launch sequence

1. Interview 15–20 Base ecosystem builders and ask what discovery or analytics problem they already pay to solve.
2. Recruit 3–5 pilot projects. Track qualified clicks and inbound leads before charging.
3. Add an actual listing submission flow, moderation queue, account ownership checks, and a durable database.
4. Integrate a proper checkout with order IDs, server-side transaction confirmation, receipts, refund/support policy, and fraud controls. Never treat a wallet-submitted transaction as paid until confirmed on-chain and reconciled to an order.
5. Add privacy-conscious analytics and a public methodology for any verification/risk labels.
6. Measure conversion, churn, gross margin, support time, and acquisition cost. Keep free listings useful and paid benefits transparent.

## Security and trust requirements before accepting commercial payments

- Verify contract addresses and project ownership independently; label unverified entries.
- Never promise token returns or imply Base/Coinbase endorsement.
- Do not request seed phrases or private keys.
- Confirm payments against a unique order and expected amount/chain/asset/recipient; handle underpayments, duplicates, and reorgs.
- Publish terms, privacy policy, contact/support, cancellation/refund rules, and sponsor disclosure.
- Obtain appropriate legal and tax advice before monetizing token promotions or financial claims.
