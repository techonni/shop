const Stripe = require("stripe");
const PRODUCTS = {
  "bauhaus-01": { price: "price_1UGlwNJiiPJtcrv2C3NEqmOa", path: "/prints/bauhaus-print-01/" },
  "bauhaus-02": { price: "price_1UGlwPJiiPJtcrv2e0YX7Cnh", path: "/prints/bauhaus-print-02/" },
  "bauhaus-03": { price: "price_1UGzfpJiiPJtcrv2NX8cnHmk", path: "/prints/bauhaus-print-03/" },
  "bauhaus-04": { price: "price_1UGzlRJiiPJtcrv2O4RpTCSp", path: "/prints/bauhaus-print-04/" },
  "bauhaus-05": { price: "price_1UGzlSJiiPJtcrv24mFsEP4t", path: "/prints/bauhaus-print-05/" },
  "bauhaus-06": { price: "price_1UGzsTJiiPJtcrv2fj5Gl0CJ", path: "/prints/bauhaus-print-06/" },
  "bauhaus-07": { price: "price_1UGzsUJiiPJtcrv2rpyzsmWJ", path: "/prints/bauhaus-print-07/" },
  "bauhaus-08": { price: "price_1UGzsVJiiPJtcrv2Si7tWVeP", path: "/prints/bauhaus-print-08/" },
  "bauhaus-09": { price: "price_1UGzy0JiiPJtcrv28ZYWjoNm", path: "/prints/bauhaus-print-09/" },
  "bauhaus-10": { price: "price_1UGzy1JiiPJtcrv2epQlLCv8", path: "/prints/bauhaus-print-10/" },
  "bauhaus-11": { price: "price_1UGzy1JiiPJtcrv23mE7WFxc", path: "/prints/bauhaus-print-11/" },
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
  const origin = "https://shop.techonni.com";
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: product.price, quantity: 1 }],
      success_url: origin + product.path + "?paid=1",
      cancel_url: origin + product.path,
      customer_creation: "always",
      invoice_creation: { enabled: true },
      billing_address_collection: "auto",
    });
    res.writeHead(303, { Location: session.url });
    res.end();
  } catch (err) { res.status(500).send(err.message || "Stripe error"); }
};
