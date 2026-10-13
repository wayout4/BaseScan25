# BaseScan25 — Business and launch plan
Version 1.0 · 13 October 2026

## Executive summary
BaseScan25 is a lightweight consumer research service that turns available public token-security indicators and market data into a readable, source-linked brief. It does not determine or guarantee that a token is safe. The launch offer is a $1.49 one-time report with a free preview to build trust and reduce purchase uncertainty.

## Target customers
- Newer Base users who want a plain-language starting point before interacting with a token.
- Community moderators and independent researchers who need a repeatable checklist.
- Token creators who want to understand third-party public signals, without purchasing an endorsement.

Avoid fear-based claims, guaranteed outcomes and claims of investment performance.

## Offer and pricing
| Offer | Price | Status | Scope |
|---|---:|---|---|
| Quick preview | $0 | Launch | Best-effort public-data snapshot, source links and unknowns |
| Token Safety Brief | $1.49 one-time | Existing checkout implementation | One asset, available automated indicators, market context when returned and limitations |
| Research bundle | Not for sale | Future experiment | Multi-asset comparison only after delivery is implemented and tested |
| Creator due-diligence report | Not for sale | Future experiment | Only after a clear evidence-based deliverable and review process exist |

Do not advertise additional packages as purchasable until checkout amounts, order metadata, fulfillment, refunds and delivery are implemented end-to-end. Do not add subscriptions until repeat usage is demonstrated.

## Product promise and boundaries
Promise: show available evidence, explain it carefully, link sources and label unknowns. Do not promise an audit, safe/scam verdict, prediction, guaranteed returns, exhaustive coverage or human review. Every report should show the asset/network, timestamp, provider names, findings, coverage limits and a clear disclaimer. Missing provider data must never be presented as a clean result.

## Customer journey
1. Visitor understands the offer and limitations on a responsive page.
2. Visitor enters a network and exact asset identifier for a free preview.
3. Preview shows available indicators and unknowns.
4. Visitor chooses the $1.49 brief and enters an email.
5. Browser redirects to Stripe-hosted Checkout; Stripe credentials stay server-side.
6. A verified Stripe webhook confirms a paid order and triggers report generation.
7. User sees the report on return and receives email only if email delivery is configured.
8. Support and refund paths remain visible.

## Revenue model and unit economics
Use actual Stripe fees, provider costs and actual completed orders before making profitability claims. At $1.49, processing fees can consume a meaningful share of gross revenue. Illustrative gross sales before fees, refunds, taxes, hosting, support and provider costs:
- 100 orders/month × $1.49 = $149 gross
- 500 orders/month × $1.49 = $745 gross
- 1,000 orders/month × $1.49 = $1,490 gross

These are arithmetic scenarios, not forecasts. Measure conversion, report completion, refunds/disputes, support minutes per order, provider availability and contribution margin. Test higher pricing or a clearly better bundle only after customer interviews and fulfillment validation.

## Distribution plan
First two weeks: publish sample reports clearly labeled as examples; share educational posts about ownership, minting, pause, liquidity and source-verification indicators; invite feedback from small Base communities; add a monitored support channel. Weeks three to four: review real checkout outcomes, ask preview users what was unclear, publish methodology and known limitations, and test one landing-page message at a time. Expand only after the core product works reliably.

## Trust, privacy and operations
- Never request wallet seed phrases or private keys.
- Keep Stripe secret and webhook signing secrets in server environment variables, never public HTML.
- Do not collect wallet addresses for card checkout unless needed.
- Minimize personal data and document retention/deletion.
- Verify webhook signature, amount, currency, product identifier, order/session binding and paid status before fulfillment.
- Make fulfillment idempotent and recover paid-but-undelivered orders.
- Add support/refund details that match actual practice.
- Ensure the name and design do not imply affiliation with Base or BaseScan.

## Technical scope
Static frontend on GitHub Pages; existing Node backend on Render for scans, order state, Stripe Checkout and webhook fulfillment. Use hosted Checkout and existing Stripe credentials. No secret key belongs in browser code. The site can avoid new customer-facing API keys, but the server still needs Stripe credentials, and current scan adapters call public provider endpoints that may have their own limits and outages. A connected Stripe account does not automatically populate Render environment variables.

## Launch checklist
- [ ] Render has DATABASE_URL, STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET set privately.
- [ ] Health endpoint reports database and Stripe configuration true.
- [ ] Schema initialized and backend startup healthy.
- [ ] Signed Stripe webhook succeeds; invalid signatures fail.
- [ ] Customer-initiated checkout tested without charging anyone unless they expressly complete payment.
- [ ] Successful paid order creates a report; failures are observable and recoverable.
- [ ] Privacy, terms, support and refund policies reviewed and accurate.
- [ ] Mobile, keyboard accessibility, slow network and provider error states tested.
- [ ] Review revenue and refund metrics weekly.

## Weekly metrics
Visits → preview starts → preview completions → checkout starts → paid checkouts → delivered reports. Track conversion by step, median report latency, provider error rate, refunds/disputes, support minutes per order and contribution margin.

## Decision rule
Do not expand the catalog until the $1.49 offer has reliable fulfillment, a clear value proposition, support/refund handling and positive contribution margin or a deliberately funded validation budget.
