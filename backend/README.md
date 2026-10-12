# BaseGrid Safety API

Cloudflare Workers + D1 backend for multi-chain research orders, Base USDC payment verification, report persistence and optional email delivery.

## Launch offer

- Free instant lookup in the browser.
- **$1.49 USDC per generated email brief** on Base Mainnet.
- Research target can be on another network; payment is always USDC on Base.
- Payment monitor matches the configured USDC contract, recipient, exact amount, payer wallet, order creation block and order expiry; waits for 12 confirmations. It enforces one open order per payer wallet and makes transaction hashes unique.
- Supported security adapters: GoPlus for mapped EVM networks, RugCheck for Solana, DEX Screener for indexed market discovery. Other chains return explicit unknown coverage, not a fake all-chain score.
- Email delivery requires a Resend API key and verified sender. If email is not configured, the report is stored in D1 and status remains `report_ready`.
- Optional AI-assisted explanation is available when `OPENAI_API_KEY` is configured. It summarizes only collected provider data, is not a security verdict, and is omitted if the model call fails. No AI key is committed or configured by this repository change.

## Deploy the backend

Requires a Cloudflare account and a machine with Node.js and Wrangler. These account-specific resources cannot be created just by committing repository files.

```sh
npm install -g wrangler
wrangler login
wrangler d1 create basegrid-safety
```

Copy the returned database ID into `wrangler.toml` in place of `REPLACE_WITH_D1_DATABASE_ID`, then run:

```sh
wrangler d1 execute basegrid-safety --file=./backend/schema.sql
wrangler secret put PAYMENT_RECIPIENT
# Set to the intended receiving wallet; verify every character before saving.
wrangler secret put ADMIN_SECRET
# Long random secret for the protected manual verification endpoint.
wrangler secret put OPENAI_API_KEY\n# Optional; enables evidence-bound plain-language explanations. Monitor usage and cost.\nwrangler secret put RESEND_API_KEY
# Optional for automatic email delivery.
wrangler secret put FROM_EMAIL
# Optional; set to a sender verified in Resend, e.g. BaseGrid Reports <reports@example.com>.
wrangler deploy
```

Set `FROM_EMAIL` as a Worker variable or secret. Optional `AI_MODEL` can be configured as a Worker variable; default is `gpt-4.1-mini`. Keep API keys and secrets out of GitHub. The default origin in `wrangler.toml` is the origin `https://wayout4.github.io`; if using a custom domain, update it and redeploy.

The Worker URL will look like `https://basegrid-safety-api.<your-account>.workers.dev`. Add it as the `content` value of `<meta name="basegrid-api" content="..."> in both `index.html` and `safety.html`, then commit and redeploy GitHub Pages. Until this is configured, the UI must not claim that backend checkout verification or automated fulfillment is live.

## Verify

```sh
curl https://YOUR-WORKER.workers.dev/api/health
curl 'https://YOUR-WORKER.workers.dev/api/scan?network=base&asset=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
curl -X POST https://YOUR-WORKER.workers.dev/api/order \
  -H 'content-type: application/json' \
  -d '{"network":"solana","asset":"TOKEN_MINT","payerAddress":"0xYOUR_BASE_WALLET","email":"you@example.com"}'
```

The protected manual monitor endpoint is `POST /api/admin/verify` with `Authorization: Bearer $ADMIN_SECRET`. A scheduled cron also checks Base USDC Transfer logs every minute. The first scan covers a bounded recent block range; use a dedicated reliable Base RPC endpoint if public RPC rate limits.

## API endpoints

- `GET /api/health` — readiness/configuration status.
- `GET /api/scan?network=base&asset=0x...` — provider aggregation.
- `POST /api/order` — records an order and expected payer.
- `GET /api/order/{uuid}` — returns order status.
- `POST /api/admin/verify` — authenticated payment-monitor run.

## Before public launch

- Configure D1 and Worker secrets, deploy the Worker, set `API_BASE` meta content in the site and test a low-value order end-to-end.
- Verify that the wallet address is yours and that the Resend sender is verified.
- Add rate limits, anti-spam controls, data retention/deletion, support contact, terms/refund policy, and provider rate-limit handling.
- A public RPC can be rate-limited; production payment verification should use a dependable RPC provider. Never tell users a transfer is confirmed until the Worker returns a paid/report status.
- Do not market this as a complete auditor of every chain. Sui, TON, Bitcoin and other unconfigured ecosystems need dedicated adapters and independent test coverage.
