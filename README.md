# Website

## Stripe Checkout Setup

This site has a static frontend and a Node backend for Stripe.

### 1. Local setup

1. Copy `.env.example` to `.env`.
2. Add your Stripe keys and product/price mappings in `.env`.
3. Keep `STRIPE_ALLOW_LIVE_MODE=false` while testing.
4. Run `npm start`.

### 2. Static frontend + hosted backend

If your website is hosted statically, deploy `server.js` on a Node host.

Set these backend environment variables:

- `PUBLIC_BASE_URL` to your backend URL (for example `https://api.movewiseal.com`)
- `FRONTEND_BASE_URL` to your website URL (for example `https://movewiseal.com`)
- `ALLOWED_ORIGINS` to your allowed frontend origins

Then update [checkout.html](checkout.html) meta tag:

`<meta name="movewise-api-base-url" content="https://api.movewiseal.com" />`

### 3. Webhooks

Create a Stripe webhook endpoint for:

- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`

Point it to `/api/webhooks/stripe` on your backend host and set `STRIPE_WEBHOOK_SECRET` in `.env`.

### 4. Live mode safety

The server blocks live keys unless `STRIPE_ALLOW_LIVE_MODE=true`.

Use this only when you intentionally want real charges.