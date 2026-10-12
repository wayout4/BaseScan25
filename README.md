# BaseGrid / 25 + Token Safety Lab

A responsive, static contract directory and wallet-first utility for exploring submitted Base addresses. The interface is designed to make inspection, address comparison, and transaction review straightforward.

## Live site

GitHub Pages publishes the site from the `main` branch using the workflow in `.github/workflows/deploy.yml`. Confirm the current release in the repository's Actions tab before treating the site as live.

## What's included

- Searchable directory of 25 submitted Base contract addresses.
- Direct BaseScan links and copy-address actions.
- Responsive layout, reduced-motion support, accessible labels, and installable web-app metadata.
- Multi-chain token research UI with GoPlus EVM risk signals, RugCheck Solana adapter, and DEX Screener market discovery.\n- Cloudflare Worker + D1 backend source for $1.49 USDC orders, Base payment verification, report persistence, and optional Resend email delivery.
- Recipient address is entered by the user at the time of transfer; no receiving wallet is hard-coded into the frontend.
- Service-worker cache versioning so new releases replace stale cached assets.

## Important safety notes

- Listed contract addresses are not independently verified for token identity, ownership, security, liquidity, or tradability. A directory listing is not an endorsement.
- The transfer tool sends native USDC directly to the recipient entered by the user. Verify the complete recipient address from a trusted source before proceeding.
- Backend source is committed but is not live until Cloudflare D1, Worker secrets, and deployment are configured. The frontend blocks paid checkout until its Worker URL is configured.
- Wallet and network fees may apply. Never share a recovery phrase or private key.
- Publishing the website does not itself generate revenue.
- Suggested launch price: free quick scans + $1.49 per emailed brief. Test conversion and support costs before adding subscriptions.\n- Native iOS/Android app builds and signing are not included in this website deployment. See `backend/README.md` for deployment instructions.
