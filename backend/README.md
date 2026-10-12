# BaseGrid Safety API

Cloudflare Workers + D1 backend for multi-chain token research, Base USDC payment verification, private report retrieval, and optional email/AI explanations.

## Product behavior

- Free instant lookup; $1.49 USDC per paid research brief on Base Mainnet.
- The research asset can be on another supported network; payment is always native USDC on Base.
- Payment monitor matches USDC contract, recipient, exact amount, payer, order creation block and expiry, then waits for 12 confirmations.
- Security adapters: GoPlus for mapped EVM networks, RugCheck for Solana, and DEX Screener for market discovery. Unsupported chains return explicit unknown coverage, not a fake all-chain score.
- Reports are stored in D1 and can be retrieved with the unguessable order UUID. Resend email and OpenAI-generated explanations are optional.
- AI is an evidence-bound explanation, not a security verdict or audit. API usage may incur charges.

## Deploy through GitHub Actions

The repository includes `.github/workflows/deploy-worker.yml`. It is a manual workflow and requires Cloudflare resources and GitHub Actions secrets. No backend can be deployed until those account-specific values exist.

1. In Cloudflare, create a D1 database named `basegrid-safety` and copy its database ID.
2. Add these repository Actions secrets under **Settings → Secrets and variables → Actions**:
   - `CLOUDFLARE_API_TOKEN` — scoped to Workers Scripts edit and D1 edit for the account.
   - `CLOUDFLARE_ACCOUNT_ID`
   - `D1_DATABASE_ID`
   - `PAYMENT_RECIPIENT` — verify this is your receiving wallet before launch.
   - `ADMIN_SECRET` — a long random secret for the protected manual verifier.
   - Optional: `RESEND_API_KEY`, `FROM_EMAIL` (sender verified in Resend), `OPENAI_API_KEY`.
3. Run **Actions → Deploy BaseGrid Safety API to Cloudflare → Run workflow**.
4. After a successful deployment, open the Worker URL and verify `/api/health`. The URL normally resembles `https://basegrid-safety-api.<account-subdomain>.workers.dev`.
5. Put the exact Worker URL in the `content` of `<meta name="basegrid-api" content="">` in both `index.html` and `safety.html`, commit, and wait for GitHub Pages deployment to succeed.
6. Test a real low-value order end-to-end before announcing paid service.

The Worker is configured for a one-minute scheduled payment check. A reliable Base RPC endpoint is recommended for production; public RPC may rate-limit log scans.

## Local deploy alternative

Requires Node.js, Wrangler, Cloudflare login, a D1 database, and account access.

```sh
npm install -g wrangler
wrangler login
wrangler d1 create basegrid-safety
# Put the returned database ID in root wrangler.toml.
wrangler d1 execute basegrid-safety --remote --file=backend/schema.sql
wrangler secret put PAYMENT_RECIPIENT
wrangler secret put ADMIN_SECRET
wrangler secret put RESEND_API_KEY  # optional
wrangler secret put FROM_EMAIL      # optional, verified sender
wrangler secret put OPENAI_API_KEY  # optional
wrangler deploy
```

## API

- `GET /api/health` — configuration status.
- `GET /api/scan?network=base&asset=0x...` — provider aggregation.
- `POST /api/order` — create a $1.49 order.
- `GET /api/order/{uuid}` — order status.
- `GET /api/order/{uuid}/report` — report JSON (UUID is a bearer secret).
- `POST /api/admin/verify` — manual payment-monitor run; requires `Authorization: Bearer $ADMIN_SECRET`.

## Launch checklist

- Configure D1 and Worker secrets; deploy the Worker; set the API URL in both page meta tags.
- Confirm the receiving address and verified email sender.
- Add rate limits, anti-spam controls, data retention/deletion, a support contact, terms and refund policy.
- Test payment confirmation, duplicate transaction handling, report generation, email delivery and error paths.
- Do not market this as a complete auditor of every chain. Sui, TON, Bitcoin and other unconfigured ecosystems still need dedicated adapters and independent test coverage.
