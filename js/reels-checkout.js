(function () {
  var CHECKOUT = "https://shop-nu-ten-29.vercel.app/api/checkout?sku=";
  var live = false;
  if (/[?&]paid=1\b/.test(location.search)) {
    var paid = document.getElementById("checkout-note");
    if (paid) paid.textContent = "Payment received. Download files will appear here when reels are attached.";
  }

  function note(el, text) {
    var p = document.getElementById("checkout-note");
    if (p) p.textContent = text;
    if (el) el.focus();
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-sku]");
    if (!a) return;
    var sku = a.getAttribute("data-sku");
    if (!sku) return;
    if (!live) {
      e.preventDefault();
      note(a, "Checkout is wired for " + sku + " at €" + (a.getAttribute("data-eur") || "") + ". Stripe products are not live yet — no charge is sent.");
      return;
    }
    a.href = CHECKOUT + encodeURIComponent(sku);
  });
})();
