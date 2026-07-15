/* Zap Wrap Naples — progressive enhancement only.
   Content is fully visible without JS; this layer adds reveal + nav state. */
(function () {
  "use strict";

  // Mark JS available so the reveal CSS can take over (CSS hides .reveal only under .js).
  document.documentElement.classList.add("js");

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // If reduced motion, show everything immediately and skip observers.
  function showAll() {
    var els = document.querySelectorAll(".reveal, .reveal--stagger");
    for (var i = 0; i < els.length; i++) els[i].setAttribute("data-shown", "true");
  }

  if (prefersReduced || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;

          // Stagger children with a small per-item delay for grouped lists.
          if (el.classList.contains("reveal--stagger")) {
            var kids = el.children;
            for (var k = 0; k < kids.length; k++) {
              kids[k].style.animationDelay = k * 70 + "ms";
            }
          }
          el.setAttribute("data-shown", "true");
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    var targets = document.querySelectorAll(".reveal, .reveal--stagger");
    for (var t = 0; t < targets.length; t++) io.observe(targets[t]);
  }

  // Consult form: build a prefilled WhatsApp message from the fields.
  // Without JS the form's GET action still lands the visitor on the studio's WhatsApp chat.
  var form = document.getElementById("consult-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = function (id) {
        var el = document.getElementById(id);
        return el && el.value ? el.value.trim() : "";
      };
      var lines = [
        "Consult request from zapwrapnaples site",
        "Name: " + v("f-name"),
        "Phone: " + v("f-phone"),
        v("f-email") ? "Email: " + v("f-email") : "",
        "Car: " + v("f-car"),
        "Service: " + v("f-service"),
        v("f-notes") ? "Notes: " + v("f-notes") : ""
      ].filter(Boolean);
      window.open(
        "https://wa.me/13527790041?text=" + encodeURIComponent(lines.join("\n")),
        "_blank",
        "noopener"
      );
    });
  }

  // Nav border/background once the hero is scrolled past a touch.
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () {
      nav.setAttribute("data-scrolled", window.scrollY > 24 ? "true" : "false");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
