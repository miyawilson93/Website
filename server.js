require("dotenv").config();
const express = require("express");
const path = require("path");
const Stripe = require("stripe");

const app = express();
const PORT = Number(process.env.PORT || 4242);
const ALLOW_LIVE_MODE = process.env.STRIPE_ALLOW_LIVE_MODE === "true";
const STRIPE_MODE = (process.env.STRIPE_SECRET_KEY || "").startsWith("sk_live_") ? "live" : "test";
const FRONTEND_BASE_URL = (process.env.FRONTEND_BASE_URL || "").trim();

function normalizeOrigin(url) {
  return String(url || "").trim().replace(/\/$/, "");
}

const ALLOWED_ORIGINS = Array.from(
  new Set(
    [FRONTEND_BASE_URL]
      .concat((process.env.ALLOWED_ORIGINS || "").split(","))
      .map(normalizeOrigin)
      .filter(Boolean)
  )
);

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[stripe] STRIPE_SECRET_KEY is not set. Stripe endpoints will fail until it is provided.");
}

if (STRIPE_MODE === "live" && !ALLOW_LIVE_MODE) {
  throw new Error(
    "Refusing to start in live mode. Set test keys in .env, or set STRIPE_ALLOW_LIVE_MODE=true only when you intentionally want live charges."
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_missing", {
  apiVersion: "2026-06-24.dahlia",
});

const PRODUCT_TO_PRICE_ID = {
  "3-Month Home Ready Plan": process.env.STRIPE_PRICE_3_MONTH,
  "6-Month Home Ready Plan": process.env.STRIPE_PRICE_6_MONTH,
  "1-on-1 Coaching - Monthly": process.env.STRIPE_PRICE_COACHING_MONTHLY,
  "1-on-1 Coaching - 6 Month": process.env.STRIPE_PRICE_COACHING_6_MONTH,
  "1-on-1 Coaching - 12 Month": process.env.STRIPE_PRICE_COACHING_12_MONTH,
  "Group Coaching - 6 Month": process.env.STRIPE_PRICE_GROUP_COACHING_6_MONTH,
  "VIP Intensive - 6 Month": process.env.STRIPE_PRICE_VIP_INTENSIVE_6_MONTH,
  "VIP Intensive - 12 Month": process.env.STRIPE_PRICE_VIP_INTENSIVE_12_MONTH,
  "New Agent Starter Kit": process.env.STRIPE_PRICE_NEW_AGENT_STARTER_KIT,
  "Digital Social Media Content Calendar": process.env.STRIPE_PRICE_SOCIAL_MEDIA_CALENDAR,
  "Buyer Consultation Guide": process.env.STRIPE_PRICE_BUYER_CONSULTATION_GUIDE,
  "Seller Consultation Guide": process.env.STRIPE_PRICE_SELLER_CONSULTATION_GUIDE,
  "Custom Business Website": process.env.STRIPE_PRICE_CUSTOM_BUSINESS_WEBSITE,
  "Agent Merch": process.env.STRIPE_PRICE_AGENT_MERCH,
};

function randomSuffix(len) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function toCents(amount) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }
  return Math.round(numeric * 100);
}

function normalizeItems(rawItems) {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item) => {
      const name = typeof item?.name === "string" ? item.name.trim() : "";
      const price = toCents(item?.price);
      const quantity = Number.isFinite(Number(item?.quantity)) && Number(item.quantity) > 0 ? Math.floor(Number(item.quantity)) : 1;
      if (!name || price === null) {
        return null;
      }
      return { name, unitAmount: price, quantity };
    })
    .filter(Boolean);
}

function getBaseUrl(req) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (host) {
    const proto = forwardedProto || req.protocol || "https";
    return `${proto}://${host}`;
  }
  return process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
}

function getFrontendBaseUrl(req) {
  const requestOrigin = normalizeOrigin(req.headers.origin);
  if (FRONTEND_BASE_URL) {
    return normalizeOrigin(FRONTEND_BASE_URL);
  }
  if (requestOrigin) {
    return requestOrigin;
  }
  return getBaseUrl(req);
}

function isAllowedOrigin(origin) {
  const normalized = normalizeOrigin(origin);
  if (!normalized) {
    return true;
  }
  if (ALLOWED_ORIGINS.length === 0) {
    return true;
  }
  return ALLOWED_ORIGINS.includes(normalized);
}

function applyCors(req, res, next) {
  const origin = normalizeOrigin(req.headers.origin);
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Stripe-Signature");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
}

function requireAllowedOrigin(req, res, next) {
  const origin = normalizeOrigin(req.headers.origin);
  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({ error: "Origin not allowed." });
  }
  return next();
}

async function resolveMappedLineItem(mappedId, item) {
  if (!mappedId) {
    return null;
  }

  if (mappedId.startsWith("price_")) {
    return { price: mappedId, quantity: item.quantity };
  }

  if (mappedId.startsWith("prod_")) {
    const product = await stripe.products.retrieve(mappedId, { expand: ["default_price"] });
    const defaultPrice = product?.default_price;
    if (defaultPrice && typeof defaultPrice === "object" && defaultPrice.id) {
      return { price: defaultPrice.id, quantity: item.quantity };
    }
    if (typeof defaultPrice === "string") {
      return { price: defaultPrice, quantity: item.quantity };
    }
    throw new Error(`Product ${mappedId} has no default price. Set a default price in Stripe or use a price_ ID.`);
  }

  throw new Error(`Unsupported mapped Stripe ID format for ${item.name}. Use price_ or prod_.`);
}

app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(501).json({ error: "Webhook secret not configured." });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).json({ error: "Missing Stripe signature header." });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.paid":
    case "invoice.payment_failed":
      break;
    default:
      break;
  }

  return res.json({ received: true });
});

app.use(applyCors);
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/api/stripe-health", (_req, res) => {
  res.json({
    hasSecretKey: Boolean(process.env.STRIPE_SECRET_KEY),
    hasPublishableKey: Boolean(process.env.STRIPE_PUBLISHABLE_KEY),
    hasWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    stripeMode: STRIPE_MODE,
    allowLiveMode: ALLOW_LIVE_MODE,
    frontendBaseUrl: FRONTEND_BASE_URL || null,
    allowedOrigins: ALLOWED_ORIGINS,
  });
});

app.post("/api/create-checkout-session", requireAllowedOrigin, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY on server." });
    }

    const items = normalizeItems(req.body?.items);
    if (items.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid." });
    }

    const lineItems = await Promise.all(
      items.map(async (item) => {
        const mappedStripeId = PRODUCT_TO_PRICE_ID[item.name];
        const mappedItem = await resolveMappedLineItem(mappedStripeId, item);
        if (mappedItem) {
          return mappedItem;
        }

        // Fallback: create dynamic price data if a product has not been mapped yet.
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
              metadata: {
                source: "movewise_dynamic_price",
              },
            },
            unit_amount: item.unitAmount,
          },
          quantity: item.quantity,
        };
      })
    );

    const frontendUrl = getFrontendBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${frontendUrl}/checkout.html?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout.html?status=cancelled`,
      automatic_tax: { enabled: true },
      customer_creation: "always",
      billing_address_collection: "auto",
      invoice_creation: { enabled: true },
      integration_identifier: `movewise_checkout_${randomSuffix(8)}`,
      metadata: {
        business: "MoveWiseAL.com",
        vertical: "real_estate_coaching",
      },
    });

    return res.json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unable to create Checkout session." });
  }
});

app.listen(PORT, () => {
  console.log(`MoveWise server listening on http://localhost:${PORT}`);
});
