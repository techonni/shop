# Techonni shop

Luxury lifestyle faceless reels on `shop.techonni.com`. GitHub Pages.

Buy Reels is the shop home: €4.90 per reel, or €29.90 for 10.

## Checkout

Stripe products for reels are **not live**. Catalog: `catalog/reels.json`.

When authorized, create Stripe Prices in EUR:

- `reel-single` — 490 (one reel)
- `reel-bundle-10` — 2990 (bundle of 10)

Set Vercel env:

- `STRIPE_PRICE_REEL_SINGLE`
- `STRIPE_PRICE_REEL_BUNDLE_10`

Existing print and FX SKUs in `api/checkout.js` stay as they are.

## Reels

Placeholder stills loop in the phone frame. Swap in real muted ~2.75–3s clips — see `reels/placeholders/README.md`.

## DNS (Hostinger)

- Host: `shop`
- Points to: `techonni.github.io`

GitHub Pages custom domain: `shop.techonni.com`.
