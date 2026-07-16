/* Zap Wrap Naples — progressive enhancement only.
   Content is fully visible without JS; this layer adds the hero timeline,
   the film switcher, scroll reveals and nav state. */
(function () {
  "use strict";

  // Mark JS available so the choreography CSS can take over.
  document.documentElement.classList.add("js");

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Film switcher: recolor the hero car, fire the shine beat ---- */
  var heroCar = document.querySelector(".hero__car .car");
  var chips = document.querySelectorAll("[data-set-film]");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      if (!heroCar) return;
      var film = chip.getAttribute("data-set-film");
      if (heroCar.getAttribute("data-film") === film) return;

      heroCar.setAttribute("data-film", film);
      chips.forEach(function (c) { c.classList.toggle("is-active", c === chip); });

      // reveal beat: restart the shine sweep
      if (!prefersReduced) {
        heroCar.classList.remove("is-revealing");
        void heroCar.offsetWidth; // reflow to restart the animation
        heroCar.classList.add("is-revealing");
      }
    });
  });
  if (heroCar) {
    heroCar.addEventListener("animationend", function (e) {
      if (e.animationName === "shine") heroCar.classList.remove("is-revealing");
    });
  }

  /* ---- Car switcher: swap the template + body mask, keep the film ---- */
  var CARS = {
    "911":          { src: "assets/porsche-911.webp",        mask: "assets/porsche-911-mask.webp?v=2", w: 1600, h: 856, name: "Porsche 911" },
    "urus":         { src: "assets/cars/urus.webp",          mask: "assets/cars/urus-mask.webp",          w: 1600, h: 800, name: "Lamborghini Urus" },
    "g63":          { src: "assets/cars/g63.webp",           mask: "assets/cars/g63-mask.webp",           w: 1600, h: 800, name: "Mercedes-AMG G63" },
    "ferrari-488":  { src: "assets/cars/ferrari-488.webp",   mask: "assets/cars/ferrari-488-mask.webp",   w: 1600, h: 800, name: "Ferrari 488" },
    "mclaren-720s": { src: "assets/cars/mclaren-720s.webp",  mask: "assets/cars/mclaren-720s-mask.webp",  w: 1600, h: 800, name: "McLaren 720S" },
    "model-s":      { src: "assets/cars/model-s.webp",       mask: "assets/cars/model-s-mask.webp",       w: 1600, h: 800, name: "Tesla Model S" },
    "cybertruck":   { src: "assets/cars/cybertruck.webp",    mask: "assets/cars/cybertruck-mask.webp",    w: 1600, h: 800, name: "Tesla Cybertruck" },
    "r8":           { src: "assets/cars/r8.webp",            mask: "assets/cars/r8-mask.webp",            w: 1600, h: 800, name: "Audi R8" }
  };
  var carImg = document.querySelector(".car__img");
  var carChips = document.querySelectorAll("[data-set-car]");
  var currentCar = "911";
  carChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var key = chip.getAttribute("data-set-car");
      var car = CARS[key];
      if (!heroCar || !carImg || !car || key === currentCar) return;
      var loader = new Image();
      loader.onload = function () {
        currentCar = key;
        carImg.src = car.src;
        carImg.width = car.w;
        carImg.height = car.h;
        carImg.alt = car.name + " side profile on the studio wrap template";
        heroCar.style.setProperty("--mask", 'url("' + car.mask + '")');
        carChips.forEach(function (c) { c.classList.toggle("is-active", c === chip); });
        if (!prefersReduced) {
          heroCar.classList.remove("is-revealing");
          void heroCar.offsetWidth;
          heroCar.classList.add("is-revealing");
        }
      };
      loader.src = car.src;
    });
  });

  /* ---- Scroll reveals: hide only below-fold elements, un-hide as they arrive ---- */
  if (!prefersReduced && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("will-reveal");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("will-reveal");
        io.observe(el);
      }
    });
  }

  /* ---- Consult form: build a prefilled WhatsApp message from the fields.
     Without JS the form's GET action still lands the visitor on the studio's WhatsApp chat. ---- */
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

  /* ---- Nav border once the hero is scrolled past a touch ---- */
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () {
      nav.setAttribute("data-scrolled", window.scrollY > 24 ? "true" : "false");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
