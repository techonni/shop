const Stripe = require("stripe");
const PRODUCTS = {
  "bauhaus-01": { price: "price_1UGluZJiiPJtcrv29jVWdRPw", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-01/" },
  "bauhaus-02": { price: "price_1UGluaJiiPJtcrv2ZUs1Zblp", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-02/" },
  "bauhaus-03": { price: "price_1UGzfoJiiPJtcrv22R3MO8Ad", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-03/" },
  "bauhaus-04": { price: "price_1UGzlQJiiPJtcrv2YsdmRBwR", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-04/" },
  "bauhaus-05": { price: "price_1UGzlQJiiPJtcrv2dlGwtkmi", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-05/" },
  "bauhaus-06": { price: "price_1UGzsWJiiPJtcrv213JQ1Khl", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-06/" },
  "bauhaus-07": { price: "price_1UGzsWJiiPJtcrv2DsXbvc18", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-07/" },
  "bauhaus-08": { price: "price_1UGzsXJiiPJtcrv2MX8F2nDp", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-08/" },
  "bauhaus-09": { price: "price_1UGzy2JiiPJtcrv2zSTPQRzh", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-09/" },
  "bauhaus-10": { price: "price_1UGzy3JiiPJtcrv22t3t2VC5", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-10/" },
  "bauhaus-11": { price: "price_1UGzy4JiiPJtcrv2g1xPOf2P", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-11/" },
  "bauhaus-12": { price: "price_1UH0FaJiiPJtcrv2sudYih6t", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-12/" },
  "bauhaus-13": { price: "price_1UH0FbJiiPJtcrv2RkARIuKd", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-13/" },
  "bauhaus-14": { price: "price_1UH0FbJiiPJtcrv2jaUwmi5e", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-14/" },
  "bauhaus-15": { price: "price_1UH0LEJiiPJtcrv2vhED6koY", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-15/" },
  "bauhaus-16": { price: "price_1UH0LFJiiPJtcrv2oBOXeofN", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-16/" },
  "bauhaus-17": { price: "price_1UH0LFJiiPJtcrv22pKQYeGQ", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-17/" },
  "bauhaus-bundle": { price: "price_1UH0OPJiiPJtcrv2ExHC2rGT", origin: "https://shop.techonni.com", path: "/prints/bundle/" },
  "fx-vip": { price: "price_1UH1BZJiiPJtcrv2SnMq1S99", origin: "https://fx.techonni.com", path: "/vip/" }
};
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  const sku = String((req.query && req.query.sku) || "");
  const product = PRODUCTS[sku];
  if (!product) { res.status(400).send("Unknown product"); return; }
  const key = process.env.STRIPE_LIVE_KEY || process.env.STRIPE_SECRET_KEY;
  if (!key) { res.status(500).send("Missing STRIPE_LIVE_KEY"); return; }
  const stripe = new Stripe(key);
  const origin = product.origin || "https://shop.techonni.com";
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: [
        "card",
        "link",
        "bancontact",
        "klarna",
        "revolut_pay",
        "amazon_pay",
        "mb_way"
      ],
      line_items: [{ price: product.price, quantity: 1 }],
      success_url: origin + product.path + "?paid=1",
      cancel_url: origin + product.path,
      customer_creation: "always",
      invoice_creation: { enabled: true },
      billing_address_collection: "auto",
      managed_payments: { enabled: false }
    });
    res.writeHead(303, { Location: session.url });
    res.end();
  } catch (err) { res.status(500).send(err.message || "Stripe error"); }
};
