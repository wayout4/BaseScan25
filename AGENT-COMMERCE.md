# BaseScan25 Agent Commerce Plan

## Current live products

- Token Safety Brief, one asset, $1.49: https://buy.stripe.com/fZubJ31Sn0EI4Q71dYdIA08
- 10-Asset Research Bundle, up to 10 assets, $7.99: https://buy.stripe.com/4gM00ldB59be0zR09UdIA09
- 25-Asset Research Bundle, up to 25 assets, $14.99: https://buy.stripe.com/8x200laoT3QU1DVcWGdIA0a
- Catalog: https://wayout4.github.io/BaseScan25/catalog.json
- Agent summary: https://wayout4.github.io/BaseScan25/llms.txt

## What is implemented

- Public machine-readable product catalog and concise agent-readable service summary.
- Live Stripe Payment Links for one-time purchases.
- The two multi-asset payment links request a comma-separated asset list during checkout.
- Stripe's hosted confirmation message explicitly discloses that bundle reports are not generated automatically yet.

## Fulfillment status — manual, not automatic

Payment collection is not the same as report delivery. Current Stripe Payment Links are not wired to create an order record, verify a completed Checkout Session through a signed webhook, run the required asset scans, package a report, and deliver it to the buyer. Staff must reconcile successful payments and fulfill orders manually. Do not promise instant delivery or automated fulfillment until this workflow is implemented and tested end-to-end.

## Required next engineering work

1. Add a server-side Stripe webhook endpoint using the raw request body and `STRIPE_WEBHOOK_SECRET`; verify signatures and handle duplicate events idempotently.
2. Reconcile successful Checkout Sessions against the known Payment Link/product IDs and amounts. Never trust a browser redirect or client-submitted payment status.
3. Persist orders and fulfillment state in PostgreSQL with unique Stripe session/payment identifiers, bounded asset lists, timestamps, and a status lifecycle.
4. Validate the checkout custom field, split the list safely, cap it at the purchased tier, normalize network/address inputs, and reject invalid entries before expensive provider calls.
5. Run asset scans with rate limits and timeouts; store source timestamps and partial-coverage warnings; generate a downloadable or emailed result only after payment verification.
6. Add a secure order-status endpoint with unguessable order tokens, privacy retention rules, retries, refund/support handling, and observability.
7. Test webhook signature failures, duplicate and out-of-order events, expired sessions, provider timeouts, malicious asset input, refunds, and email failures in Stripe test mode before enabling automatic delivery.
8. Then implement an agent-facing documented API or MCP tool. Add quotas, scoped authorization, abuse controls, idempotency, and a machine-readable error schema. Keep all credentials server-side.
9. Apply to relevant agentic-commerce directories/channels individually. Catalog files alone do not automatically list the business on every AI platform.

## Agent commerce channels

Stripe documents the Agentic Commerce Suite, Stripe Directory, and Machine Payments Protocol. Eligibility and onboarding are platform-specific; verify current availability in the connected Stripe account before claiming enrollment. Official resources:

- https://stripe.com/use-cases/agentic-commerce
- https://stripe.com/guides/agentic-commerce-primer-software-providers
- https://stripe.com/blog/machine-payments-protocol

## Security and product claims

Never expose secret keys, webhook secrets, database credentials, or admin tokens to the browser or agent. Do not allow an AI agent to spend money without explicit authorization and appropriate per-transaction controls. Results are informational, provider coverage can be partial, and no report guarantees token safety or investment outcomes.
