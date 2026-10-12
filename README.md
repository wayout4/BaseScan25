# BaseGrid 25

Responsive static directory for 25 user-submitted Base addresses with BaseScan links and an optional direct native-USDC transfer flow on Base Mainnet.

## Website deployment

GitHub Actions deploys the root static website to GitHub Pages on each push to `main`. In repository **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**. Public URL: https://wayout4.github.io/BaseScan25/

## Important safety notes

- The listed addresses were supplied by the site owner; this project does not verify token identity, liquidity, security, or tradability.
- The payment interface sends native USDC on Base (chain ID 8453) to the fixed recipient displayed on the page. Confirm that recipient is yours and correct before using it.
- This is a static frontend, not a production checkout system. It has no order database, fulfillment, backend transaction verification, or abuse/fraud monitoring.
- Wallets and network fees may apply. Never share a recovery phrase or private key.
- Native iOS/Android app builds and signing are not included in this website deployment.
