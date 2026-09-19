(function () {
  var CHECKOUT = "https://shop-nu-ten-29.vercel.app/api/checkout?sku=";
  var live = false;
  if (/[?&]paid=1\b/.test(location.search)) {
    var paid = document.getElementById("checkout-note");
    if (paid) paid.textContent = "Payment received. Download files will appear here when reels are attached.";
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-sku]");
    if (!a) return;
    if (live) {
      a.href = CHECKOUT + encodeURIComponent(a.getAttribute("data-sku"));
      return;
    }
    e.preventDefault();
    var p = document.getElementById("checkout-note");
    if (p) {
      p.textContent = "Checkout is wired for " + a.getAttribute("data-sku") + " at €" + (a.getAttribute("data-eur") || "") + ". Stripe products are not live yet — no charge is sent.";
    }
  });
})();
