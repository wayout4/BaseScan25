# BaseGrid / 25

A responsive, static contract directory and wallet-first utility for exploring submitted Base addresses. The interface is designed to make inspection, address comparison, and transaction review straightforward.

## Live site

GitHub Pages publishes the site from the `main` branch using the workflow in `.github/workflows/deploy.yml`. Confirm the current release in the repository's Actions tab before treating the site as live.

## What's included

- Searchable directory of 25 submitted Base contract addresses.
- Direct BaseScan links and copy-address actions.
- Responsive layout, reduced-motion support, accessible labels, and installable web-app metadata.
- Optional direct native-USDC transfer flow on Base Mainnet (chain ID 8453).
- Recipient address is entered by the user at the time of transfer; no receiving wallet is hard-coded into the frontend.
- Service-worker cache versioning so new releases replace stale cached assets.

## Important safety notes

- Listed contract addresses are not independently verified for token identity, ownership, security, liquidity, or tradability. A directory listing is not an endorsement.
- The transfer tool sends native USDC directly to the recipient entered by the user. Verify the complete recipient address from a trusted source before proceeding.
- This is a static frontend, not a production checkout system. It has no order database, fulfillment, backend transaction verification, payment reconciliation, or fraud monitoring.
- Wallet and network fees may apply. Never share a recovery phrase or private key.
- Publishing the website does not itself generate revenue.
- Native iOS/Android app builds and signing are not included in this website deployment.
