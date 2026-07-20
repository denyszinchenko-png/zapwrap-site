/* Zap Wrap Naples — progressive enhancement only.
   Content is fully visible without JS; this layer adds the hero timeline,
   the film switcher, scroll reveals and nav state. */
(function () {
  "use strict";

  // Mark JS available so the choreography CSS can take over.
  document.documentElement.classList.add("js");

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Film switcher: squeegee wipe, the new film is laid on across the body ---- */
  var heroCar = document.querySelector(".hero__car .car");
  var chips = document.querySelectorAll("[data-set-film]");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      if (!heroCar) return;
      var film = chip.getAttribute("data-set-film");
      var pending = heroCar.getAttribute("data-film-next");
      if ((pending || heroCar.getAttribute("data-film")) === film) return;

      chips.forEach(function (c) { c.classList.toggle("is-active", c === chip); });

      if (prefersReduced) {
        heroCar.setAttribute("data-film", film);
        return;
      }
      // a wipe is mid-flight: commit it instantly, then start the new one
      if (pending) {
        heroCar.setAttribute("data-film", pending);
        heroCar.removeAttribute("data-film-next");
        heroCar.classList.remove("is-wiping");
        void heroCar.offsetWidth;
      }
      heroCar.setAttribute("data-film-next", film);
      heroCar.classList.add("is-wiping");
    });
  });
  if (heroCar) {
    heroCar.addEventListener("animationend", function (e) {
      if (e.animationName === "filmwipe") {
        var next = heroCar.getAttribute("data-film-next");
        if (next) heroCar.setAttribute("data-film", next);
        heroCar.removeAttribute("data-film-next");
        heroCar.classList.remove("is-wiping");
      }
      if (e.animationName === "shine") heroCar.classList.remove("is-revealing");
    });
  }

  /* ---- Car switcher: swap the template + body mask, keep the film ---- */
  var CARS = {
    "911": { src: "assets/cars/porsche-911.webp?v=6", mask: "assets/cars/porsche-911-mask4.webp", w: 1600, h: 800, name: "Porsche 911" },
    "audi-q8": { src: "assets/cars/audi-q8.webp", mask: "assets/cars/audi-q8-mask4.webp", w: 1600, h: 800, name: "Audi Q8" },
    "audi-r8": { src: "assets/cars/audi-r8.webp", mask: "assets/cars/audi-r8-mask4.webp", w: 1600, h: 800, name: "Audi R8" },
    "bentley-continental-gt": { src: "assets/cars/bentley-continental-gt.webp", mask: "assets/cars/bentley-continental-gt-mask4.webp", w: 1600, h: 800, name: "Bentley Continental GT" },
    "bmw-430i-gran-coupe": { src: "assets/cars/bmw-430i-gran-coupe.webp", mask: "assets/cars/bmw-430i-gran-coupe-mask4.webp", w: 1600, h: 800, name: "BMW 430I Gran Coupe" },
    "bmw-840i": { src: "assets/cars/bmw-840i.webp", mask: "assets/cars/bmw-840i-mask4.webp", w: 1600, h: 800, name: "BMW 840I" },
    "bmw-m3-competition": { src: "assets/cars/bmw-m3-competition.webp", mask: "assets/cars/bmw-m3-competition-mask4.webp", w: 1600, h: 800, name: "BMW M3 Competition" },
    "bmw-m4": { src: "assets/cars/bmw-m4.webp", mask: "assets/cars/bmw-m4-mask4.webp", w: 1600, h: 800, name: "BMW M4" },
    "bmw-m5-competition": { src: "assets/cars/bmw-m5-competition.webp", mask: "assets/cars/bmw-m5-competition-mask4.webp", w: 1600, h: 800, name: "BMW M5 Competition" },
    "bmw-m8": { src: "assets/cars/bmw-m8.webp", mask: "assets/cars/bmw-m8-mask4.webp", w: 1600, h: 800, name: "BMW M8" },
    "bmw-x5": { src: "assets/cars/bmw-x5.webp?v=6", mask: "assets/cars/bmw-x5-mask4.webp", w: 1600, h: 800, name: "BMW X5" },
    "bmw-x6": { src: "assets/cars/bmw-x6.webp", mask: "assets/cars/bmw-x6-mask4.webp", w: 1600, h: 800, name: "BMW X6" },
    "cadillac-ct5-v-blackwing": { src: "assets/cars/cadillac-ct5-v-blackwing.webp", mask: "assets/cars/cadillac-ct5-v-blackwing-mask4.webp", w: 1600, h: 800, name: "Cadillac CT5 V Blackwing" },
    "cadillac-escalade": { src: "assets/cars/cadillac-escalade.webp", mask: "assets/cars/cadillac-escalade-mask4.webp", w: 1600, h: 800, name: "Cadillac Escalade" },
    "chevrolet-camaro": { src: "assets/cars/chevrolet-camaro.webp", mask: "assets/cars/chevrolet-camaro-mask4.webp", w: 1600, h: 800, name: "Chevrolet Camaro" },
    "chevrolet-equinox": { src: "assets/cars/chevrolet-equinox.webp", mask: "assets/cars/chevrolet-equinox-mask4.webp", w: 1600, h: 800, name: "Chevrolet Equinox" },
    "chevrolet-silverado": { src: "assets/cars/chevrolet-silverado.webp", mask: "assets/cars/chevrolet-silverado-mask4.webp", w: 1600, h: 800, name: "Chevrolet Silverado" },
    "chevrolet-tahoe": { src: "assets/cars/chevrolet-tahoe.webp", mask: "assets/cars/chevrolet-tahoe-mask4.webp", w: 1600, h: 800, name: "Chevrolet Tahoe" },
    "chevrolet-trax": { src: "assets/cars/chevrolet-trax.webp", mask: "assets/cars/chevrolet-trax-mask4.webp", w: 1600, h: 800, name: "Chevrolet Trax" },
    "dodge-charger": { src: "assets/cars/dodge-charger.webp", mask: "assets/cars/dodge-charger-mask4.webp", w: 1600, h: 800, name: "Dodge Charger" },
    "dodge-charger-392": { src: "assets/cars/dodge-charger-392.webp", mask: "assets/cars/dodge-charger-392-mask4.webp", w: 1600, h: 800, name: "Dodge Charger 392" },
    "dodge-grand-caravan": { src: "assets/cars/dodge-grand-caravan.webp", mask: "assets/cars/dodge-grand-caravan-mask4.webp", w: 1600, h: 800, name: "Dodge Grand Caravan" },
    "dodge-viper": { src: "assets/cars/dodge-viper.webp", mask: "assets/cars/dodge-viper-mask4.webp", w: 1600, h: 800, name: "Dodge Viper" },
    "ferrari-488": { src: "assets/cars/ferrari-488.webp", mask: "assets/cars/ferrari-488-mask4.webp", w: 1600, h: 800, name: "Ferrari 488" },
    "ford-bronco": { src: "assets/cars/ford-bronco.webp", mask: "assets/cars/ford-bronco-mask4.webp", w: 1600, h: 800, name: "Ford Bronco" },
    "ford-explorer": { src: "assets/cars/ford-explorer.webp", mask: "assets/cars/ford-explorer-mask4.webp", w: 1600, h: 800, name: "Ford Explorer" },
    "ford-f-150": { src: "assets/cars/ford-f-150.webp", mask: "assets/cars/ford-f-150-mask4.webp", w: 1600, h: 800, name: "Ford F 150" },
    "ford-mustang": { src: "assets/cars/ford-mustang.webp", mask: "assets/cars/ford-mustang-mask4.webp", w: 1600, h: 800, name: "Ford Mustang" },
    "gmc-hummer-ev": { src: "assets/cars/gmc-hummer-ev.webp", mask: "assets/cars/gmc-hummer-ev-mask4.webp", w: 1600, h: 800, name: "GMC Hummer EV" },
    "gmc-sierra": { src: "assets/cars/gmc-sierra.webp", mask: "assets/cars/gmc-sierra-mask4.webp", w: 1600, h: 800, name: "GMC Sierra" },
    "honda-civic": { src: "assets/cars/honda-civic.webp", mask: "assets/cars/honda-civic-mask4.webp", w: 1600, h: 800, name: "Honda Civic" },
    "honda-cr-v": { src: "assets/cars/honda-cr-v.webp", mask: "assets/cars/honda-cr-v-mask4.webp", w: 1600, h: 800, name: "Honda CR V" },
    "hyundai-tucson": { src: "assets/cars/hyundai-tucson.webp", mask: "assets/cars/hyundai-tucson-mask4.webp", w: 1600, h: 800, name: "Hyundai Tucson" },
    "jeep-grand-cherokee": { src: "assets/cars/jeep-grand-cherokee.webp", mask: "assets/cars/jeep-grand-cherokee-mask4.webp", w: 1600, h: 800, name: "Jeep Grand Cherokee" },
    "kia-sportage": { src: "assets/cars/kia-sportage.webp", mask: "assets/cars/kia-sportage-mask4.webp", w: 1600, h: 800, name: "Kia Sportage" },
    "lamborghini-huracan": { src: "assets/cars/lamborghini-huracan.webp", mask: "assets/cars/lamborghini-huracan-mask4.webp", w: 1600, h: 800, name: "Lamborghini Huracan" },
    "lamborghini-urus": { src: "assets/cars/lamborghini-urus.webp", mask: "assets/cars/lamborghini-urus-mask4.webp", w: 1600, h: 800, name: "Lamborghini Urus" },
    "land-rover-range-rover": { src: "assets/cars/land-rover-range-rover.webp", mask: "assets/cars/land-rover-range-rover-mask4.webp", w: 1600, h: 800, name: "Land Rover Range Rover" },
    "lexus-is250": { src: "assets/cars/lexus-is250.webp", mask: "assets/cars/lexus-is250-mask4.webp", w: 1600, h: 800, name: "Lexus IS250" },
    "lexus-is350": { src: "assets/cars/lexus-is350.webp?v=6", mask: "assets/cars/lexus-is350-mask4.webp", w: 1600, h: 800, name: "Lexus IS350" },
    "lincoln-navigator": { src: "assets/cars/lincoln-navigator.webp", mask: "assets/cars/lincoln-navigator-mask4.webp", w: 1600, h: 800, name: "Lincoln Navigator" },
    "maserati-levante": { src: "assets/cars/maserati-levante.webp", mask: "assets/cars/maserati-levante-mask4.webp", w: 1600, h: 800, name: "Maserati Levante" },
    "mazda-3": { src: "assets/cars/mazda-3.webp", mask: "assets/cars/mazda-3-mask4.webp", w: 1600, h: 800, name: "Mazda 3" },
    "mclaren-720s": { src: "assets/cars/mclaren-720s.webp", mask: "assets/cars/mclaren-720s-mask4.webp", w: 1600, h: 800, name: "McLaren 720S" },
    "mercedes-c-class": { src: "assets/cars/mercedes-c-class.webp", mask: "assets/cars/mercedes-c-class-mask4.webp", w: 1600, h: 800, name: "Mercedes C Class" },
    "mercedes-g63": { src: "assets/cars/mercedes-g63.webp", mask: "assets/cars/mercedes-g63-mask4.webp", w: 1600, h: 800, name: "Mercedes G63" },
    "mercedes-gle": { src: "assets/cars/mercedes-gle.webp", mask: "assets/cars/mercedes-gle-mask4.webp", w: 1600, h: 800, name: "Mercedes GLE" },
    "mercedes-sprinter": { src: "assets/cars/mercedes-sprinter.webp", mask: "assets/cars/mercedes-sprinter-mask4.webp", w: 1600, h: 800, name: "Mercedes Sprinter" },
    "nissan-altima": { src: "assets/cars/nissan-altima.webp", mask: "assets/cars/nissan-altima-mask4.webp", w: 1600, h: 800, name: "Nissan Altima" },
    "nissan-rogue": { src: "assets/cars/nissan-rogue.webp", mask: "assets/cars/nissan-rogue-mask4.webp", w: 1600, h: 800, name: "Nissan Rogue" },
    "porsche-cayenne": { src: "assets/cars/porsche-cayenne.webp", mask: "assets/cars/porsche-cayenne-mask4.webp", w: 1600, h: 800, name: "Porsche Cayenne" },
    "porsche-panamera": { src: "assets/cars/porsche-panamera.webp", mask: "assets/cars/porsche-panamera-mask4.webp", w: 1600, h: 800, name: "Porsche Panamera" },
    "porsche-taycan": { src: "assets/cars/porsche-taycan.webp", mask: "assets/cars/porsche-taycan-mask4.webp", w: 1600, h: 800, name: "Porsche Taycan" },
    "ram-1500": { src: "assets/cars/ram-1500.webp", mask: "assets/cars/ram-1500-mask4.webp", w: 1600, h: 800, name: "Ram 1500" },
    "subaru-forester": { src: "assets/cars/subaru-forester.webp", mask: "assets/cars/subaru-forester-mask4.webp", w: 1600, h: 800, name: "Subaru Forester" },
    "tesla-cybertruck": { src: "assets/cars/tesla-cybertruck.webp", mask: "assets/cars/tesla-cybertruck-mask4.webp", w: 1600, h: 800, name: "Tesla Cybertruck" },
    "tesla-model-3": { src: "assets/cars/tesla-model-3.webp?v=6", mask: "assets/cars/tesla-model-3-mask4.webp", w: 1600, h: 800, name: "Tesla Model 3" },
    "tesla-model-s": { src: "assets/cars/tesla-model-s.webp", mask: "assets/cars/tesla-model-s-mask4.webp", w: 1600, h: 800, name: "Tesla Model S" },
    "tesla-model-x": { src: "assets/cars/tesla-model-x.webp?v=6", mask: "assets/cars/tesla-model-x-mask4.webp", w: 1600, h: 800, name: "Tesla Model X" },
    "tesla-model-y": { src: "assets/cars/tesla-model-y.webp", mask: "assets/cars/tesla-model-y-mask4.webp", w: 1600, h: 800, name: "Tesla Model Y" },
    "toyota-4runner": { src: "assets/cars/toyota-4runner.webp", mask: "assets/cars/toyota-4runner-mask4.webp", w: 1600, h: 800, name: "Toyota 4RUNNER" },
    "toyota-camry": { src: "assets/cars/toyota-camry.webp", mask: "assets/cars/toyota-camry-mask4.webp", w: 1600, h: 800, name: "Toyota Camry" },
    "toyota-corolla": { src: "assets/cars/toyota-corolla.webp", mask: "assets/cars/toyota-corolla-mask4.webp", w: 1600, h: 800, name: "Toyota Corolla" },
    "toyota-rav4": { src: "assets/cars/toyota-rav4.webp", mask: "assets/cars/toyota-rav4-mask4.webp", w: 1600, h: 800, name: "Toyota RAV4" },
    "toyota-sienna": { src: "assets/cars/toyota-sienna.webp", mask: "assets/cars/toyota-sienna-mask4.webp", w: 1600, h: 800, name: "Toyota Sienna" },
    "toyota-tacoma": { src: "assets/cars/toyota-tacoma.webp?v=6", mask: "assets/cars/toyota-tacoma-mask4.webp", w: 1600, h: 800, name: "Toyota Tacoma" }
  };
  var carImg = document.querySelector(".car__img");
  var carSelect = document.getElementById("car-select");
  var currentCar = "lamborghini-huracan";
  if (carSelect) {
    carSelect.addEventListener("change", function () {
      var key = carSelect.value;
      if (key === "__request") {
        window.open(
          "https://wa.me/13527790041?text=" + encodeURIComponent("Hi! Please add my car to the wrap configurator: "),
          "_blank",
          "noopener"
        );
        carSelect.value = currentCar;
        return;
      }
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
        if (!prefersReduced) {
          heroCar.classList.remove("is-revealing");
          void heroCar.offsetWidth;
          heroCar.classList.add("is-revealing");
        }
      };
      loader.src = car.src;
    });
  }

  /* ---- Discoverability choreography (staged like a timeline):
     0.0s picker enters (translate/scale/opacity, expo-out) -> 0.7s pulse
     2.2s demo wipe starts -> chips cascade left-to-right under it
     Labels get a one-shot yellow underline sweep as their control wakes up. ---- */
  var picker = document.getElementById("car-picker");
  var pickerLabel = document.querySelector(".car__picker-label");
  var filmLabel = document.querySelector(".filmbar__row .filmbar__label");
  if (picker && carSelect) {
    picker.classList.add(prefersReduced ? "is-idle" : "is-entering");
    if (pickerLabel && !prefersReduced) pickerLabel.classList.add("label-sweep");
    var stopIdle = function () { picker.classList.remove("is-idle", "is-entering"); };
    carSelect.addEventListener("focus", stopIdle);
    carSelect.addEventListener("change", stopIdle);
    picker.addEventListener("pointerdown", stopIdle);
  }
  var chipWave = function () {
    if (filmLabel) filmLabel.classList.add("label-sweep");
    var list = Array.prototype.slice.call(chips);
    list.forEach(function (chip, i) {
      setTimeout(function () {
        chip.classList.add("is-wave");
        chip.addEventListener("animationend", function () { chip.classList.remove("is-wave"); }, { once: true });
      }, i * 70);
    });
  };
  /* film-name toast + warm CTA after the 2nd flip the visitor makes */
  var toast = document.getElementById("car-toast");
  var toastTimer = null;
  var showToast = function (name) {
    if (!toast || !name) return;
    toast.textContent = name;
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-show"); }, 1800);
  };
  var filmCta = document.getElementById("film-cta");
  var filmCtaLink = document.getElementById("film-cta-link");
  var currentFilmName = "";
  var updateCtaLink = function () {
    if (!filmCtaLink) return;
    var car = CARS[currentCar] ? CARS[currentCar].name : "";
    var msg = "Hi! I want a " + (currentFilmName || "color change") + " wrap on my " + car;
    filmCtaLink.href = "https://wa.me/13527790041?text=" + encodeURIComponent(msg);
  };
  var userFlips = 0;
  var demoTouched = false;
  var demoActive = false;
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      currentFilmName = chip.textContent.trim();
      showToast(currentFilmName);
      updateCtaLink();
      if (demoActive) return;
      demoTouched = true;
      userFlips++;
      if (userFlips >= 2 && filmCta && filmCta.hidden) {
        filmCta.hidden = false;
        requestAnimationFrame(function () { filmCta.classList.add("is-in"); });
      }
    }, { capture: true });
  });
  if (carSelect) carSelect.addEventListener("change", updateCtaLink);
  var demoStore;
  try { demoStore = window.sessionStorage; } catch (err) { demoStore = null; }
  if (heroCar && !prefersReduced && (!demoStore || !demoStore.getItem("zw-demo"))) {
    var clickChip = function (film) {
      var chip = document.querySelector('[data-set-film="' + film + '"]');
      if (!chip) return;
      demoActive = true;
      chip.click();
      demoActive = false;
    };
    setTimeout(function () {
      if (demoTouched || document.hidden) return;
      if (demoStore) demoStore.setItem("zw-demo", "1");
      clickChip("miami");
      chipWave();
      setTimeout(function () { if (!demoTouched) clickChip("shift"); }, 3000);
    }, 2200);
  }

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
      // Service goes out as "visible label (stable-key)": the label reads in
      // whatever language the visitor used, the key stays the same across all
      // five, so requests can still be counted and sorted by service.
      var service = function () {
        var el = document.getElementById("f-service");
        var opt = el && el.selectedOptions ? el.selectedOptions[0] : null;
        if (!opt) return v("f-service");
        var text = opt.textContent.trim();
        return opt.value ? text + " (" + opt.value + ")" : text;
      };
      var lines = [
        "Consult request from zapwrapnaples site",
        "Name: " + v("f-name"),
        "Phone: " + v("f-phone"),
        v("f-email") ? "Email: " + v("f-email") : "",
        "Car: " + v("f-car"),
        "Service: " + service(),
        v("f-notes") ? "Notes: " + v("f-notes") : ""
      ].filter(Boolean);
      // Same tab, not window.open: the in-app browsers of Instagram and TikTok
      // block popups, and a blocked popup drops the lead with nothing shown to
      // the visitor, who walks away sure the request was sent.
      window.location.href =
        "https://wa.me/13527790041?text=" + encodeURIComponent(lines.join("\n"));
    });
  }

  /* ---- Mobile menu. Below 720px the nav links used to be hidden with no way
     to reach them: no menu at all on a phone, which is most of our traffic.
     The panel is display:none when closed on purpose, so the links stay out of
     the tab order instead of being invisible but focusable. ---- */
  var burger = document.getElementById("nav-burger");
  var navLinks = document.getElementById("nav-links");
  if (burger && navLinks) {
    var setMenu = function (open) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      navLinks.classList.toggle("is-open", open);
    };
    var closeMenu = function (refocus) {
      if (burger.getAttribute("aria-expanded") !== "true") return;
      setMenu(false);
      if (refocus) burger.focus();
    };

    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
    // Tapping a link navigates to the anchor: leaving the panel open would
    // cover the section the visitor just asked for.
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu(true);
    });
    document.addEventListener("click", function (e) {
      if (!navLinks.contains(e.target) && !burger.contains(e.target)) closeMenu(false);
    });
    // Rotating to landscape can cross the breakpoint: the panel would stay
    // flagged open while the desktop layout shows the links inline.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) closeMenu(false);
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

  /* ---- v28: shine sweep over the WRAP word, once ---- */
  var heroEm = document.querySelector(".hero__h em");
  if (heroEm && !prefersReduced) {
    setTimeout(function () {
      heroEm.classList.add("is-shine");
      heroEm.addEventListener("animationend", function () { heroEm.classList.remove("is-shine"); }, { once: true });
    }, 1400);
  }

  /* ---- v28: reviews wake up - score rolls, stars light one by one ---- */
  var revScore = document.getElementById("rev-score");
  var revStars = document.getElementById("rev-stars");
  if (revScore && revStars && "IntersectionObserver" in window) {
    var revDone = false;
    var revIO = new IntersectionObserver(function (entries) {
      if (revDone || !entries[0].isIntersecting) return;
      revDone = true;
      revIO.disconnect();
      var stars = revStars.querySelectorAll("span");
      if (prefersReduced) {
        stars.forEach(function (s) { s.classList.add("is-lit"); });
        return;
      }
      var t0 = null;
      var roll = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 900, 1);
        revScore.textContent = (5 * (1 - Math.pow(1 - p, 3))).toFixed(1);
        if (p < 1) requestAnimationFrame(roll);
      };
      requestAnimationFrame(roll);
      stars.forEach(function (s, i) {
        setTimeout(function () { s.classList.add("is-lit"); }, 300 + i * 120);
      });
    }, { threshold: 0.4 });
    revIO.observe(revStars);
  }

  /* ---- v28: swatches and the build button jump into the configurator ---- */
  var applyFilm = function (film) {
    var target = document.querySelector(".hero__car");
    if (!target) return;
    target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
    setTimeout(function () {
      var chip = document.querySelector('[data-set-film="' + film + '"]');
      if (chip) chip.click();
    }, prefersReduced ? 100 : 650);
  };
  document.querySelectorAll("[data-apply-film]").forEach(function (btn) {
    btn.addEventListener("click", function () { applyFilm(btn.getAttribute("data-apply-film")); });
  });
  var tryBuild = document.getElementById("try-build-film");
  if (tryBuild) tryBuild.addEventListener("click", function () { applyFilm("graphite"); });

  /* ---- v28: before/after shutter ---- */
  var baStage = document.getElementById("ba-stage");
  var baRange = document.getElementById("ba-range");
  if (baStage && baRange) {
    baRange.addEventListener("input", function () {
      baStage.style.setProperty("--cut", baRange.value + "%");
    });
  }

  /* ---- v28: the submit button charges as required fields fill ---- */
  var form = document.getElementById("consult-form");
  var submitBtn = form && form.querySelector(".form__submit");
  if (form && submitBtn) {
    var reqFields = Array.prototype.slice.call(form.querySelectorAll("[required]"));
    var wasReady = false;
    var charge = function () {
      var ok = reqFields.filter(function (f) { return f.value && f.checkValidity(); }).length;
      var ready = ok === reqFields.length;
      submitBtn.classList.toggle("is-charging", !ready);
      submitBtn.style.setProperty("--fill", Math.round((ok / reqFields.length) * 100) + "%");
      if (ready && !wasReady) {
        submitBtn.classList.add("is-ready");
        submitBtn.addEventListener("animationend", function () { submitBtn.classList.remove("is-ready"); }, { once: true });
      }
      wasReady = ready;
    };
    reqFields.forEach(function (f) {
      f.addEventListener("input", charge);
      f.addEventListener("change", charge);
    });
    charge();
  }

  /* ---- v28: headline variants, preview via ?hl=b|c (EN only; A stays default
     until analytics can judge a real split) ---- */
  var HEADLINES = {
    b: ["Stop repainting", "your car. <em>Wrap</em>", "it instead."],
    c: ["Factory paint.", "<em>New</em> color.", "5 days flat."]
  };
  var hlKey = (location.search.match(/[?&]hl=([bc])/) || [])[1];
  var langNow = null;
  try { langNow = window.localStorage.getItem("zw-lang"); } catch (err) { langNow = null; }
  if (hlKey && HEADLINES[hlKey] && (!langNow || langNow === "en")) {
    document.querySelectorAll(".hero__line").forEach(function (line, i) {
      if (HEADLINES[hlKey][i]) line.innerHTML = HEADLINES[hlKey][i];
    });
  }

  /* ---- v28: stamp the tagline as it passes center ---- */
  var hotSpans = document.querySelectorAll(".ticker__hot");
  if (hotSpans.length && !prefersReduced) {
    var hotState = [];
    hotSpans.forEach(function () { hotState.push(false); });
    setInterval(function () {
      if (document.hidden) return;
      var mid = window.innerWidth / 2;
      hotSpans.forEach(function (s, i) {
        var r = s.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var inZone = Math.abs((r.left + r.right) / 2 - mid) < 90;
        if (inZone && !hotState[i]) {
          s.classList.add("is-stamp");
          s.addEventListener("animationend", function () { s.classList.remove("is-stamp"); }, { once: true });
        }
        hotState[i] = inZone;
      });
    }, 250);
  }

  /* ---- v28: exit-intent bar, desktop, once per session ---- */
  var exitbar = document.getElementById("exitbar");
  if (exitbar && window.matchMedia("(min-width: 721px) and (pointer: fine)").matches) {
    var exitStore;
    try { exitStore = window.sessionStorage; } catch (err) { exitStore = null; }
    if (!exitStore || !exitStore.getItem("zw-exit")) {
      var onExit = function (e) {
        if (e.clientY > 8 || e.relatedTarget) return;
        document.removeEventListener("mouseout", onExit);
        if (exitStore) exitStore.setItem("zw-exit", "1");
        exitbar.hidden = false;
        requestAnimationFrame(function () { exitbar.classList.add("is-in"); });
      };
      document.addEventListener("mouseout", onExit);
      exitbar.querySelector(".exitbar__close").addEventListener("click", function () {
        exitbar.classList.remove("is-in");
        setTimeout(function () { exitbar.hidden = true; }, 500);
      });
    }
  }

  /* ---- WhatsApp fab: enters after the hero, nudges rarely ---- */
  var fab = document.querySelector(".wa-fab");
  var heroEl = document.querySelector(".hero");
  if (fab && heroEl) {
    var fabShown = false;
    var fabCheck = function () {
      var on = window.scrollY > heroEl.offsetHeight * 0.6;
      if (on !== fabShown) {
        fabShown = on;
        fab.classList.toggle("is-on", on);
      }
    };
    fabCheck();
    window.addEventListener("scroll", fabCheck, { passive: true });
    if (!prefersReduced) {
      setInterval(function () {
        if (!fabShown || document.hidden) return;
        fab.classList.add("is-nudge");
      }, 15000);
      fab.addEventListener("animationend", function () { fab.classList.remove("is-nudge"); });
    }
  }

  /* ---- Gallery lightbox ---- */
  var shots = Array.prototype.slice.call(document.querySelectorAll(".build__shot img"));
  if (shots.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Photo viewer");
    lb.innerHTML =
      '<img alt="" decoding="async" />' +
      '<button class="lightbox__btn lightbox__close" type="button" aria-label="Close">&#10005;</button>' +
      '<button class="lightbox__btn lightbox__prev" type="button" aria-label="Previous photo">&#8249;</button>' +
      '<button class="lightbox__btn lightbox__next" type="button" aria-label="Next photo">&#8250;</button>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img");
    var lbIdx = 0;
    var lbShow = function (i) {
      lbIdx = (i + shots.length) % shots.length;
      // data-full, а не currentSrc: с srcset браузер выбирает для сетки
      // уменьшенный вариант, и лайтбокс открывал бы мелкую картинку.
      var shot = shots[lbIdx];
      lbImg.src = shot.getAttribute("data-full") || shot.currentSrc || shot.src;
      lbImg.alt = shots[lbIdx].alt || "";
    };
    var lbClose = function () {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    shots.forEach(function (img, i) {
      img.addEventListener("click", function () {
        lbShow(i);
        lb.classList.add("is-open");
        document.body.style.overflow = "hidden";
        lb.querySelector(".lightbox__close").focus();
      });
    });
    lb.addEventListener("click", function (e) { if (e.target === lb) lbClose(); });
    lb.querySelector(".lightbox__close").addEventListener("click", lbClose);
    lb.querySelector(".lightbox__prev").addEventListener("click", function () { lbShow(lbIdx - 1); });
    lb.querySelector(".lightbox__next").addEventListener("click", function () { lbShow(lbIdx + 1); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") lbClose();
      if (e.key === "ArrowLeft") lbShow(lbIdx - 1);
      if (e.key === "ArrowRight") lbShow(lbIdx + 1);
    });
  }

  /* ---- Meta Pixel: Lead when the consult form is sent, Contact when a
     WhatsApp link or the studio number is tapped. Both are delegated on
     document, so links added later are covered and the same block works on any
     page that loads this file. Nothing but the event name is sent. Silent when
     the pixel is missing or blocked. ---- */
  var pixelSent = {};
  var pixelTrack = function (event, key) {
    if (typeof window.fbq !== "function") return;
    var id = event + "|" + key;
    var now = Date.now();
    // One intent per link: a double tap is not two events.
    if (now - (pixelSent[id] || 0) < 1500) return;
    pixelSent[id] = now;
    // fbq puts the request on the wire synchronously, before the link
    // navigates, so the click stays untouched: no preventDefault, no delay.
    window.fbq("track", event);
  };

  document.addEventListener("submit", function (e) {
    if (!e.target || e.target.id !== "consult-form") return;
    pixelTrack("Lead", "consult-form");
  }, true);

  document.addEventListener("click", function (e) {
    var link = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!link) return;
    var href = link.getAttribute("href") || "";
    if (!/^(tel:|https?:\/\/(wa\.me|api\.whatsapp\.com)\/)/i.test(href)) return;
    // Sending the form already counts as a Lead - never also as a Contact.
    if (link.closest("#consult-form")) return;
    pixelTrack("Contact", href);
  }, true);
})();
