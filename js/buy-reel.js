(function () {
  var PAGE = 9;
  var CHECKOUT = "https://shop-nu-ten-29.vercel.app/api/checkout?sku=reel-single";
  var FOLDERS = ["essente", "ma", "viral"];
  var NAMES = [
    "Midnight Riviera",
    "Villa Quiet",
    "Gold Hour Yacht",
    "Amalfi Dawn",
    "Desert G-Wagon",
    "Lake Como Night",
    "Private Jet Tarmac",
    "Marble Lobby",
    "Saint-Tropez Dusk",
    "Rooftop Infinity",
    "Silk Suite",
    "Coastal Estate",
    "Monaco Morning",
    "Black Yacht Deck",
    "Palm Springs Drive",
    "Quiet Penthouse",
    "Alpine Chalet",
    "Capri Terrace",
    "Neon Lobby",
    "Ivory Villa",
    "Lagoon Runabout",
    "City Penthouse",
    "Garden Courtyard",
    "Sunset Highway",
    "White Sand Club",
    "Steel Garage",
    "Linen Bedroom",
    "Harbor Lights",
    "Olive Grove",
    "Crystal Pool",
    "Night Concierge",
    "Warm Limousine",
    "Glass Pavilion",
    "Upper East Dawn",
    "Mykonos White",
    "Velvet Lounge",
  ];
  var state = { ids: [], page: 1 };
  var seenId = Object.create(null);
  var seenThumb = Object.create(null);

  function thumb(id) {
    return "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w540";
  }
  function videoUrl(id) {
    return "/api/reel?id=" + encodeURIComponent(id);
  }
  function driveVideoUrl(id) {
    return (
      "https://drive.usercontent.google.com/download?id=" +
      encodeURIComponent(id) +
      "&export=download&confirm=t"
    );
  }
  function sourceUrls(id) {
    return [
      thumb(id),
      "https://lh3.googleusercontent.com/d/" + id + "=w540",
      videoUrl(id),
      driveVideoUrl(id),
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
  function hashId(id) {
    var h = 2166136261;
    for (var i = 0; i < id.length; i++) {
      h ^= id.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function luxuryName(id) {
    var h = hashId(id);
    return NAMES[h % NAMES.length];
  }
  function card(id) {
    var name = luxuryName(id);
    return (
      '<li><div class="print-card"><figure class="print-plate"><img class="print-shot" src="' +
      thumb(id) +
      '" alt="' +
      name +
      '" loading="lazy" /></figure><p class="print-name">' +
      name +
      '</p><p class="print-meta">€4.90</p><a class="buy" href="' +
      CHECKOUT +
      '" data-sku="reel-single" data-eur="4.90">Buy reel</a></div></li>'
    );
  }
  function armVideos(root) {
    var nodes = (root || document).querySelectorAll("video.print-shot");
    for (var i = 0; i < nodes.length; i++) {
      (function (v) {
        v.muted = true;
        v.defaultMuted = true;
        v.loop = true;
        v.playsInline = true;
        v.setAttribute("playsinline", "");
        v.setAttribute("webkit-playsinline", "");
        var play = function () {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        };
        v.addEventListener("canplay", play);
        if ("IntersectionObserver" in window) {
          if (!v._io) {
            v._io = new IntersectionObserver(
              function (entries) {
                entries.forEach(function (e) {
                  if (e.isIntersecting) play();
                  else v.pause();
                });
              },
              { threshold: 0.25 }
            );
            v._io.observe(v);
          }
        } else {
          play();
        }
      })(nodes[i]);
    }
  }
  function pageCount() {
    return Math.max(1, Math.ceil(state.ids.length / PAGE));
  }
  function currentPage() {
    var n = parseInt((location.hash.match(/p=(\d+)/) || [])[1], 10);
    if (!n || n < 1) n = state.page || 1;
    return Math.min(n, pageCount());
  }
  function renderPager() {
    var nav = document.getElementById("reel-pager");
    if (!nav) return;
    var pages = pageCount();
    var cur = state.page;
    var html = "";
    for (var n = 1; n <= pages; n++) {
      html +=
        '<button class="pager-btn' +
        (n === cur ? " is-current" : "") +
        '" type="button" data-page="' +
        n +
        '"' +
        (n === cur ? ' aria-current="page"' : "") +
        ">" +
        n +
        "</button>";
    }
    nav.innerHTML = html;
  }
  function renderPage(page) {
    var pages = pageCount();
    if (page < 1) page = 1;
    if (page > pages) page = pages;
    state.page = page;
    if (location.hash !== "#p=" + page) {
      history.replaceState(null, "", "#p=" + page);
    }
    var start = (page - 1) * PAGE;
    var slice = state.ids.slice(start, start + PAGE);
    var html = "";
    for (var i = 0; i < slice.length; i++) html += card(slice[i]);
    var grid = document.getElementById("grid-reels");
    grid.innerHTML = html;
    renderPager();
    window.scrollTo(0, 0);
  }
  fetch("../catalog/drive-ids.json")
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      var ids = [];
      FOLDERS.forEach(function (slug) {
        ids = ids.concat(uniqueList(data[slug] || []));
      });
      state = { ids: ids, page: 1 };
      renderPage(currentPage());
    });
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-page]");
    if (!btn) return;
    renderPage(parseInt(btn.getAttribute("data-page"), 10));
  });
  window.addEventListener("hashchange", function () {
    if (state.ids.length) renderPage(currentPage());
  });
})();
