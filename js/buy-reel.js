(function () {
  var PAGE = 24;
  var CHECKOUT = "https://shop-nu-ten-29.vercel.app/api/checkout?sku=reel-single";
  var FOLDERS = ["essente", "ma", "viral"];
  var state = {};
  var seenId = Object.create(null);
  var seenThumb = Object.create(null);

  function thumb(id) {
    return "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w540";
  }
  function sourceUrls(id) {
    return [
      thumb(id),
      "https://lh3.googleusercontent.com/d/" + id + "=w540",
      "https://drive.google.com/uc?id=" + encodeURIComponent(id) + "&export=download",
    ];
  }
  function claim(id) {
    if (!id || seenId[id]) return false;
    var urls = sourceUrls(id);
    for (var i = 0; i < urls.length; i++) {
      if (seenThumb[urls[i]]) return false;
    }
    seenId[id] = true;
    for (var j = 0; j < urls.length; j++) seenThumb[urls[j]] = true;
    return true;
  }
  function uniqueList(ids) {
    var out = [];
    if (!ids) return out;
    for (var i = 0; i < ids.length; i++) {
      var id = String(ids[i] || "").trim();
      if (claim(id)) out.push(id);
    }
    return out;
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
    var s = state[slug];
    var html = "";
    var added = 0;
    while (s.i < s.ids.length && added < PAGE) {
      html += card(s.ids[s.i]);
      s.i += 1;
      added += 1;
    }
    if (html) document.getElementById("grid-" + slug).insertAdjacentHTML("beforeend", html);
    if (s.i >= s.ids.length) {
      var btn = document.querySelector('[data-more="' + slug + '"]');
      if (btn) btn.hidden = true;
    }
  }
  fetch("../catalog/drive-ids.json")
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      FOLDERS.forEach(function (slug) {
        state[slug] = { ids: uniqueList(data[slug] || []), i: 0 };
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
