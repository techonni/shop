# Techonni shop

Luxury lifestyle faceless reels on `shop.techonni.com`.

Buy Reels is home: €4.90 per reel, €29.90 for 10.

## Collections

Drive parent `LUXURY 4K VIDEOS` (`12PJSdiD-iEjst_suZdVLwxwh-xVbUpKT`):

- Essente (`1lOy4HSe49sMJWtiOGKR_Oz0JKV287zU-`)
- MA (`15g9JGaDxPMylGigh6NLRWl4NiHKUqbSx`)
- Viral Aetherium (`15NJvlqenZi8LT4EmWJRJ-JTqwSXkNwa_`)

Git holds compressed ~2.8s previews only (`reels/{essente,ma,viral}/`). Full 4K files stay on Drive. ID lists: `catalog/*-ids.json`.

## Checkout

Stripe reel prices are **not live**. Set Vercel env `STRIPE_PRICE_REEL_SINGLE` and `STRIPE_PRICE_REEL_BUNDLE_10` when authorized. Print and FX SKUs in `api/checkout.js` stay as they are.
