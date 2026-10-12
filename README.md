# BaseGrid 25

Responsive static directory for 25 user-submitted Base addresses with BaseScan links and an optional direct native-USDC transfer flow on Base Mainnet.

## Cloudflare Pages deployment

The repository is configured to deploy to Cloudflare Pages through GitHub Actions. One-time setup is required:

1. In the Cloudflare dashboard, open **Workers & Pages** and create a Pages project named **basescan25**. Choose **Direct Upload** if prompted; this repository deploys with Wrangler from GitHub Actions.
2. In Cloudflare, create an API token with the permissions required to deploy to Pages for the correct account. Store it in GitHub repository **Settings → Secrets and variables → Actions** as `CLOUDFLARE_API_TOKEN`.
3. Add the Cloudflare account ID as repository secret `CLOUDFLARE_ACCOUNT_ID`.
4. Push to `main`, or manually run the **Deploy BaseGrid 25 to Cloudflare Pages** workflow in the Actions tab.

After a successful run, the expected Pages URL is https://basescan25.pages.dev/ (verify it in Cloudflare Pages; this URL is not proof of a completed deployment).

## Important safety notes

- The listed addresses were supplied by the site owner; this project does not verify token identity, liquidity, security, or tradability.
- The payment interface sends native USDC on Base (chain ID 8453) to the fixed recipient displayed on the page. Confirm that recipient is yours and correct before using it.
- This is a static frontend, not a production checkout system. It has no order database, fulfillment, backend transaction verification, or abuse/fraud monitoring.
- Wallets and network fees may apply. Never share a recovery phrase or private key.
- Native iOS/Android app builds and signing are not included in this website deployment.
