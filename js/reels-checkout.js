(function () {
  var CHECKOUT = "https://shop-nu-ten-29.vercel.app/api/checkout?sku=";
  var live = false;
  var hero = document.getElementById("hero-reel");
  var clips = ["./reels/clip-01.mp4", "./reels/clip-02.mp4", "./reels/clip-03.mp4"];
  var posters = ["./reels/poster-01.jpg", "./reels/poster-02.jpg", "./reels/poster-03.jpg"];
  var clipI = 0;
  if (hero) {
    hero.src = clips[0];
    hero.play().catch(function () {});
    hero.addEventListener("ended", function () {
      clipI = (clipI + 1) % clips.length;
      hero.poster = posters[clipI];
      hero.src = clips[clipI];
      hero.play().catch(function () {});
    });
  }
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
