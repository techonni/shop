(function () {
  var PAGE = 24;
  var CHECKOUT = "https://shop-nu-ten-29.vercel.app/api/checkout?sku=reel-single";
  var state = {};
  function thumb(id) {
    return "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w540";
  }
  function card(id) {
    return (
      '<li><div class="print-card"><figure class="print-plate"><img class="reel-shot" src="' +
      thumb(id) +
      '" alt="Reel" loading="lazy" /></figure><p class="print-name">Reel</p><p class="print-meta">€4.90</p><a class="buy" href="' +
      CHECKOUT +
      '" data-sku="reel-single" data-eur="4.90">Buy reel</a></div></li>'
    );
  }
  function render(slug) {
    var ids = state[slug].ids;
    var i = state[slug].i;
    var end = Math.min(i + PAGE, ids.length);
    var html = "";
    for (; i < end; i++) html += card(ids[i]);
    state[slug].i = i;
    document.getElementById("grid-" + slug).insertAdjacentHTML("beforeend", html);
    if (i >= ids.length) {
      var btn = document.querySelector('[data-more="' + slug + '"]');
      if (btn) btn.hidden = true;
    }
  }
  fetch("../catalog/drive-ids.json")
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      ["essente", "ma", "viral"].forEach(function (slug) {
        state[slug] = { ids: data[slug] || [], i: 0 };
        render(slug);
      });
    });
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-more]");
    if (!btn) return;
    var slug = btn.getAttribute("data-more");
    if (state[slug]) render(slug);
  });
})();
