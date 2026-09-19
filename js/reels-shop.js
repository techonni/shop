(function () {
  var CHECKOUT = "https://shop-nu-ten-29.vercel.app/api/checkout?sku=";
  var live = false;
  var base = document.body.getAttribute("data-base") || "./";
  var collection = document.body.getAttribute("data-collection") || "";

  function note(text) {
    var p = document.getElementById("checkout-note");
    if (p) p.textContent = text;
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-sku]");
    if (!a) return;
    var sku = a.getAttribute("data-sku");
    if (!sku) return;
    if (!live) {
      e.preventDefault();
      note("Checkout is wired for " + sku + " at €" + (a.getAttribute("data-eur") || "") + ". Stripe products are not live yet — no charge is sent.");
      return;
    }
    a.href = CHECKOUT + encodeURIComponent(sku);
  });

  if (/[?&]paid=1\b/.test(location.search)) {
    note("Payment received. Download files will appear here when fulfillment is attached.");
  }

  function asset(path) {
    return path.replace(/^\.\//, base);
  }

  function phone(src, poster, loop) {
    var inner = src
      ? '<video class="reel-clip" muted playsinline ' + (loop ? "loop " : "") + 'autoplay poster="' + poster + '"><source src="' + src + '" type="video/mp4"></video>'
      : '<img src="' + poster + '" alt="">';
    return '<div class="phone phone-sm"><div class="phone-notch"></div><div class="phone-screen">' + inner + "</div></div>";
  }

  function card(opts) {
    return (
      '<li><div class="print-card"><figure class="print-plate phone-plate">' +
      phone(opts.src, opts.poster, true) +
      '</figure><p class="print-name">' +
      opts.name +
      '</p><p class="print-meta">' +
      opts.meta +
      '</p><a class="buy" href="' +
      CHECKOUT +
      "reel-single" +
      '" data-sku="reel-single" data-eur="4.90">Buy reel</a></div></li>'
    );
  }

  fetch(asset("catalog/collections.json"))
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      var hero = document.getElementById("hero-reel");
      if (hero) {
        var cycle = data.previews.filter(function (p) {
          return p.n <= 2;
        });
        var i = 0;
        function show(p) {
          hero.poster = asset(p.poster);
          hero.src = asset(p.src);
          hero.play().catch(function () {});
        }
        if (cycle.length) {
          show(cycle[0]);
          hero.addEventListener("ended", function () {
            i = (i + 1) % cycle.length;
            show(cycle[i]);
          });
        }
      }

      var homeGrid = document.getElementById("collection-cards");
      if (homeGrid) {
        homeGrid.innerHTML = data.collections
          .map(function (c) {
            var p = data.previews.find(function (x) {
              return x.slug === c.slug && x.n === 1;
            });
            return (
              '<li><a class="print-card" href="' +
              asset("collections/" + c.slug + "/") +
              '"><figure class="print-plate phone-plate">' +
              phone(p ? asset(p.src) : "", p ? asset(p.poster) : "", true) +
              '</figure><p class="print-name">' +
              c.name +
              '</p><p class="print-meta">' +
              c.count.toLocaleString("en-GB") +
              " reels · €4.90</p></a></li>"
            );
          })
          .join("");
      }

      if (!collection) return;
      var col = data.collections.find(function (c) {
        return c.slug === collection;
      });
      var locals = data.previews.filter(function (p) {
        return p.slug === collection;
      });
      var title = document.getElementById("collection-title");
      var lead = document.getElementById("collection-lead");
      if (title && col) title.textContent = col.name;
      if (lead && col) {
        lead.textContent =
          col.count.toLocaleString("en-GB") +
          " reels in this collection. Previews below; the full library fulfills after checkout. €4.90 each, or 10 for €29.90.";
      }
      var grid = document.getElementById("reel-grid");
      if (grid) {
        grid.innerHTML = locals
          .map(function (p, idx) {
            return card({
              src: asset(p.src),
              poster: asset(p.poster),
              name: "Reel " + String(idx + 1).padStart(2, "0"),
              meta: "€4.90"
            });
          })
          .join("");
      }

      var moreBtn = document.getElementById("load-more");
      if (!moreBtn || !col) return;
      var used = {};
      locals.forEach(function (p) {
        if (p.driveId) used[p.driveId] = true;
      });
      var cursor = 0;
      var ids = [];
      moreBtn.addEventListener("click", function () {
        var run = function () {
          var added = 0;
          while (cursor < ids.length && added < 24) {
            var id = ids[cursor++];
            if (used[id]) continue;
            used[id] = true;
            added++;
            if (grid) {
              grid.insertAdjacentHTML(
                "beforeend",
                card({
                  src: "",
                  poster: "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w540",
                  name: "Reel",
                  meta: "€4.90"
                })
              );
            }
          }
          if (cursor >= ids.length) moreBtn.hidden = true;
        };
        if (ids.length) {
          run();
          return;
        }
        moreBtn.textContent = "Loading…";
        fetch(asset("catalog/" + collection + "-ids.json"))
          .then(function (r) {
            return r.json();
          })
          .then(function (list) {
            ids = list;
            moreBtn.textContent = "Load more";
            run();
          })
          .catch(function () {
            moreBtn.textContent = "Catalog unavailable";
          });
      });
    });
})();
