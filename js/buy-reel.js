(function () {
  var PAGE = 24;
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
  var state = { ids: [], i: 0 };
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
      '<li><div class="print-card"><figure class="print-plate"><video class="print-shot" muted loop playsinline autoplay preload="auto" poster="' +
      thumb(id) +
      '"><source src="' +
      videoUrl(id) +
      '" type="video/mp4" /><source src="' +
      driveVideoUrl(id) +
      '" type="video/mp4" /></video></figure><p class="print-name">' +
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
  function render() {
    var html = "";
    var added = 0;
    while (state.i < state.ids.length && added < PAGE) {
      html += card(state.ids[state.i]);
      state.i += 1;
      added += 1;
    }
    if (html) {
      document.getElementById("grid-reels").insertAdjacentHTML("beforeend", html);
      armVideos(document.getElementById("grid-reels"));
    }
    if (state.i >= state.ids.length) {
      var btn = document.querySelector("[data-more]");
      if (btn) btn.hidden = true;
    }
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
      state = { ids: ids, i: 0 };
      render();
    });
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-more]");
    if (!btn) return;
    render();
  });
})();
