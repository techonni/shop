const Stripe = require("stripe");
const PRODUCTS = {
  "bauhaus-01": { price: "price_1UGlwNJiiPJtcrv2C3NEqmOa", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-01/" },
  "bauhaus-02": { price: "price_1UGlwPJiiPJtcrv2e0YX7Cnh", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-02/" },
  "bauhaus-03": { price: "price_1UGzfpJiiPJtcrv2NX8cnHmk", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-03/" },
  "bauhaus-04": { price: "price_1UGzlRJiiPJtcrv2O4RpTCSp", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-04/" },
  "bauhaus-05": { price: "price_1UGzlSJiiPJtcrv24mFsEP4t", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-05/" },
  "bauhaus-06": { price: "price_1UGzsTJiiPJtcrv2fj5Gl0CJ", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-06/" },
  "bauhaus-07": { price: "price_1UGzsUJiiPJtcrv2rpyzsmWJ", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-07/" },
  "bauhaus-08": { price: "price_1UGzsVJiiPJtcrv2Si7tWVeP", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-08/" },
  "bauhaus-09": { price: "price_1UGzy0JiiPJtcrv28ZYWjoNm", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-09/" },
  "bauhaus-10": { price: "price_1UGzy1JiiPJtcrv2epQlLCv8", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-10/" },
  "bauhaus-11": { price: "price_1UGzy1JiiPJtcrv23mE7WFxc", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-11/" },
  "bauhaus-12": { price: "price_1UH0FYJiiPJtcrv2h0UvOG3L", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-12/" },
  "bauhaus-13": { price: "price_1UH0FYJiiPJtcrv2HsRKCYjA", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-13/" },
  "bauhaus-14": { price: "price_1UH0FZJiiPJtcrv22vsFF2nn", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-14/" },
  "bauhaus-15": { price: "price_1UH0LDJiiPJtcrv2vsKFroDm", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-15/" },
  "bauhaus-16": { price: "price_1UH0LDJiiPJtcrv2nlGxZyfu", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-16/" },
  "bauhaus-17": { price: "price_1UH0LDJiiPJtcrv2lTpJTHuc", origin: "https://shop.techonni.com", path: "/prints/bauhaus-print-17/" },
  "bauhaus-bundle": { price: "price_1UH0OPJiiPJtcrv2M0HbXiY4", origin: "https://shop.techonni.com", path: "/prints/bundle/" },
  "fx-vip": {
    price: "price_1UH1BZJiiPJtcrv2SnMq1S99",
    priceTest: "price_1UH1BZJiiPJtcrv2eANwM76a",
    origin: "https://fx.techonni.com",
    path: "/vip/"
  }
};
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  const sku = String((req.query && req.query.sku) || "");
  const product = PRODUCTS[sku];
  if (!product) { res.status(400).send("Unknown product"); return; }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) { res.status(500).send("Missing STRIPE_SECRET_KEY"); return; }
  const stripe = new Stripe(key);
  const origin = product.origin || "https://shop.techonni.com";
  const price = key.startsWith("sk_test") && product.priceTest ? product.priceTest : product.price;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: origin + product.path + "?paid=1",
      cancel_url: origin + product.path,
      customer_creation: "always",
      invoice_creation: { enabled: true },
      billing_address_collection: "auto"
    });
    res.writeHead(303, { Location: session.url });
    res.end();
  } catch (err) { res.status(500).send(err.message || "Stripe error"); }
};
