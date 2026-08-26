/* Zap Wrap Naples - progressive enhancement only.
   Content is fully visible without JS; this layer adds the hero timeline,
   the film switcher, scroll reveals and nav state. */
(function () {
  "use strict";

  /* ---- Consent-first analytics.
     Google Analytics and Meta are not requested until the visitor accepts.
     A local gtag queue is created so Consent Mode can default to denied, but
     contact events are never queued before the external tools are loaded. ---- */
  var CONSENT_KEY = "zw-consent";
  var storedConsent = null;
  try { storedConsent = window.localStorage.getItem(CONSENT_KEY); } catch (err) {}
  window.zwConsent = storedConsent;
  window.zwAnalyticsLoaded = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied"
  });

  window.zwLoadAnalytics = function () {
    if (window.zwConsent !== "allow" || window.zwAnalyticsLoaded) return;
    window.zwAnalyticsLoaded = true;

    window.gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted"
    });
    var ga = document.createElement("script");
    ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=G-RLQ14CC2C8";
    document.head.appendChild(ga);
    window.gtag("js", new Date());
    window.gtag("config", "G-RLQ14CC2C8");

    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", "1584101513429246");
    window.fbq("consent", "grant");
    window.fbq("track", "PageView");
  };

  if (storedConsent === "allow") window.zwLoadAnalytics();

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

      chips.forEach(function (c) {
        var selected = c === chip;
        c.classList.toggle("is-active", selected);
        c.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      var surfacePanel = chip.closest && chip.closest(".films__panel");
      if (surfacePanel && surfacePanel.getAttribute("data-surface")) {
        heroCar.setAttribute("data-surface", surfacePanel.getAttribute("data-surface"));
      }

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
      // Drop the will-change hint once the one-shot spring entrance has landed.
      if (e.animationName === "drive-in") heroCar.style.willChange = "auto";
      if (e.animationName === "filmwipe") {
        var next = heroCar.getAttribute("data-film-next");
        if (next) heroCar.setAttribute("data-film", next);
        heroCar.removeAttribute("data-film-next");
        heroCar.classList.remove("is-wiping");
      }
      if (e.animationName === "shine") heroCar.classList.remove("is-revealing");
    });
  }

  var filmsWrap = document.getElementById("films");
  var filmsMore = document.getElementById("films-more");

  /* ---- Compact five-finish catalog.
     The source markup remains a complete no-JS catalog. With JS, every verified
     film is regrouped under the five choices a customer actually understands.
     Material effects such as pearl, metallic, chrome and iridescent stay in the
     film name instead of competing with surface finish at the top level. ---- */
  if (filmsWrap) {
    var sourceTabs = Array.prototype.slice.call(filmsWrap.querySelectorAll("[data-film-tab]"));
    var sourcePanels = Array.prototype.slice.call(filmsWrap.querySelectorAll(".films__panel"));
    var sourceTabList = filmsWrap.querySelector(".films__tabs");
    var neonNote = filmsWrap.querySelector("#fp-neon .films__note");
    var filmByKey = {};
    Array.prototype.slice.call(filmsWrap.querySelectorAll("[data-set-film]")).forEach(function (chip) {
      filmByKey[chip.getAttribute("data-set-film")] = chip;
    });
    var labelFor = function (id) {
      var tab = filmsWrap.querySelector('[data-film-tab="' + id + '"]');
      return tab ? tab.textContent.trim() : id;
    };
    var compactGroups = [
      {
        id: "shift", surface: "shift", label: labelFor("shift"),
        films: ["shift", "coral", "deepspace", "aura", "twsunset", "sunset", "vortex", "ghost", "volcanic", "austral", "purpleblue", "morpheus", "boreal", "redblack", "blueblack"]
      },
      {
        id: "gloss", surface: "gloss", label: labelFor("gloss"),
        films: ["twcherry", "twnova", "chrpurple", "chrpink", "bluemet", "pdiamond", "twcandy", "pink", "rosso", "envy", "midnightp", "fuchsia", "glossblack", "glosswhite", "brightyellow", "intenseblue", "midnightblue", "brightorange", "nardo", "mantis", "pearl", "ppearl"]
      },
      {
        id: "satin", surface: "satin", label: labelFor("satin"),
        films: ["purple", "satin", "vampire", "velvetrose", "hotpink", "berry", "pearlsatin"]
      },
      {
        id: "matte", surface: "matte", label: labelFor("matte"),
        films: ["charcoal", "graphite", "matteblack", "matred", "icedpink", "icedtitan", "strawberry", "mattepurple"]
      },
      {
        id: "neon", surface: "neon", label: labelFor("neon"),
        films: ["neongreen", "neonyellow", "neonorange"]
      }
    ];
    var compactTabs = document.createElement("div");
    compactTabs.className = "films__tabs";
    compactTabs.setAttribute("role", "tablist");
    compactTabs.setAttribute("aria-label", "Finish");
    var compactPanels = document.createDocumentFragment();
    compactGroups.forEach(function (group, index) {
      var tab = document.createElement("button");
      tab.className = "films__tab films__tab--" + group.id;
      tab.type = "button";
      tab.id = "ft-" + group.id;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "fp-" + group.id);
      tab.setAttribute("aria-selected", index === 0 ? "true" : "false");
      tab.setAttribute("data-film-tab", group.id);
      tab.setAttribute("data-i18n", "fc." + group.id);
      tab.textContent = group.label;
      compactTabs.appendChild(tab);

      var panel = document.createElement("div");
      panel.className = "films__panel" + (index === 0 ? " is-on" : "");
      panel.id = "fp-" + group.id;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.setAttribute("data-surface", group.surface);
      panel.setAttribute("data-finish-label", group.label);
      var heading = document.createElement("span");
      heading.className = "films__ph";
      heading.setAttribute("data-i18n", "fc." + group.id);
      heading.textContent = group.label;
      panel.appendChild(heading);
      if (group.id === "neon" && neonNote) panel.appendChild(neonNote);
      var rail = document.createElement("div");
      rail.className = "films__rail";
      group.films.forEach(function (film) {
        if (filmByKey[film]) rail.appendChild(filmByKey[film]);
      });
      panel.appendChild(rail);
      compactPanels.appendChild(panel);
    });
    if (sourceTabList) sourceTabList.replaceWith(compactTabs);
    sourcePanels.forEach(function (panel) { panel.remove(); });
    filmsWrap.appendChild(compactPanels);
    sourceTabs = null;
  }

  /* ---- Finish tabs: one category is on screen at a time. ---- */
  var filmTabs = filmsWrap ? Array.prototype.slice.call(filmsWrap.querySelectorAll("[data-film-tab]")) : [];
  var filmPanels = filmsWrap ? Array.prototype.slice.call(filmsWrap.querySelectorAll(".films__panel")) : [];
  var syncFilmsMore = function (reset) {
    if (!filmsWrap || !filmsMore) return;
    if (reset) {
      filmsWrap.classList.remove("is-expanded");
      filmsMore.setAttribute("aria-expanded", "false");
    }
    var activeRail = filmsWrap.querySelector(".films__panel.is-on .films__rail");
    var hasMore = !!(activeRail && activeRail.querySelectorAll(".fsw").length > 12);
    filmsMore.hidden = !hasMore;
    if (!hasMore) {
      filmsWrap.classList.remove("is-expanded");
      filmsMore.setAttribute("aria-expanded", "false");
    }
  };
  var showFilmClass = function (id, moveFocus) {
    filmTabs.forEach(function (t) {
      var on = t.getAttribute("data-film-tab") === id;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      if (on && moveFocus) t.focus();
    });
    filmPanels.forEach(function (p) { p.classList.toggle("is-on", p.id === "fp-" + id); });
    syncFilmsMore(true);
  };
  var pickFirstFilmInClass = function (id) {
    if (!filmsWrap) return;
    var panel = filmsWrap.querySelector("#fp-" + id);
    if (!panel || panel.querySelector(".fsw.is-active")) return;
    var first = panel.querySelector("[data-set-film]");
    if (first) first.click();
  };
  if (filmsWrap && filmTabs.length) {
    filmsWrap.classList.add("is-tabbed");
    filmTabs.forEach(function (tab, i) {
      tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
      tab.addEventListener("click", function () {
        var id = tab.getAttribute("data-film-tab");
        showFilmClass(id);
        pickFirstFilmInClass(id);
      });
      tab.addEventListener("keydown", function (e) {
        var step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        if (document.documentElement.getAttribute("dir") === "rtl") step = -step;
        e.preventDefault();
        var next = filmTabs[(i + step + filmTabs.length) % filmTabs.length];
        var nextId = next.getAttribute("data-film-tab");
        showFilmClass(nextId, true);
        pickFirstFilmInClass(nextId);
        next.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    });
    syncFilmsMore(false);
  }

  /* A film picked from anywhere else - the finishes swatches, the build CTA, the
     opening demo - has to bring its class forward, or the pick lands off-screen. */
  var revealFilmChip = function (chip) {
    if (!filmsWrap || !filmsWrap.classList.contains("is-tabbed")) return;
    var panel = chip.closest && chip.closest(".films__panel");
    if (panel && panel.id.indexOf("fp-") === 0 && !panel.classList.contains("is-on")) {
      showFilmClass(panel.id.slice(3));
    }
  };

  /* ---- Car switcher: swap the template + body mask, keep the film ---- */
  var CARS = {
    "911": { src: "assets/cars/porsche-911.webp?v=6", mask: "assets/cars/porsche-911-mask8.webp", w: 1600, h: 800, name: "Porsche 911" },
    "audi-q5": { src: "assets/cars/audi-q5.webp", mask: "assets/cars/audi-q5-mask7.webp", w: 1600, h: 800, name: "Audi Q5" },
    "audi-q8": { src: "assets/cars/audi-q8.webp", mask: "assets/cars/audi-q8-mask8.webp", w: 1600, h: 800, name: "Audi Q8" },
    "audi-s5": { src: "assets/cars/audi-s5.webp", mask: "assets/cars/audi-s5-mask7.webp", w: 1600, h: 800, name: "Audi S5" },
    "bentley-continental-gt": { src: "assets/cars/bentley-continental-gt.webp", mask: "assets/cars/bentley-continental-gt-mask8.webp", w: 1600, h: 800, name: "Bentley Continental GT" },
    "bmw-330i": { src: "assets/cars/bmw-330i.webp", mask: "assets/cars/bmw-330i-mask7.webp", w: 1600, h: 800, name: "BMW 330i" },
    "bmw-430i-gran-coupe": { src: "assets/cars/bmw-430i-gran-coupe.webp", mask: "assets/cars/bmw-430i-gran-coupe-mask8.webp", w: 1600, h: 800, name: "BMW 430I Gran Coupe" },
    "bmw-840i": { src: "assets/cars/bmw-840i.webp", mask: "assets/cars/bmw-840i-mask8.webp", w: 1600, h: 800, name: "BMW 840I" },
    "bmw-m3-competition": { src: "assets/cars/bmw-m3-competition.webp", mask: "assets/cars/bmw-m3-competition-mask8.webp", w: 1600, h: 800, name: "BMW M3 Competition" },
    "bmw-m4": { src: "assets/cars/bmw-m4.webp", mask: "assets/cars/bmw-m4-mask8.webp", w: 1600, h: 800, name: "BMW M4" },
    "bmw-m5-competition": { src: "assets/cars/bmw-m5-competition.webp", mask: "assets/cars/bmw-m5-competition-mask8.webp", w: 1600, h: 800, name: "BMW M5 Competition" },
    "bmw-m8": { src: "assets/cars/bmw-m8.webp", mask: "assets/cars/bmw-m8-mask8.webp", w: 1600, h: 800, name: "BMW M8" },
    "bmw-x5": { src: "assets/cars/bmw-x5.webp?v=6", mask: "assets/cars/bmw-x5-mask8.webp", w: 1600, h: 800, name: "BMW X5" },
    "bmw-x6": { src: "assets/cars/bmw-x6.webp", mask: "assets/cars/bmw-x6-mask8.webp", w: 1600, h: 800, name: "BMW X6" },
    "cadillac-ct5-v-blackwing": { src: "assets/cars/cadillac-ct5-v-blackwing.webp", mask: "assets/cars/cadillac-ct5-v-blackwing-mask8.webp", w: 1600, h: 800, name: "Cadillac CT5 V Blackwing" },
    "cadillac-escalade": { src: "assets/cars/cadillac-escalade.webp", mask: "assets/cars/cadillac-escalade-mask8.webp", w: 1600, h: 800, name: "Cadillac Escalade" },
    "chevrolet-camaro": { src: "assets/cars/chevrolet-camaro.webp", mask: "assets/cars/chevrolet-camaro-mask8.webp", w: 1600, h: 800, name: "Chevrolet Camaro" },
    "chevrolet-equinox": { src: "assets/cars/chevrolet-equinox.webp", mask: "assets/cars/chevrolet-equinox-mask8.webp", w: 1600, h: 800, name: "Chevrolet Equinox" },
    "chevrolet-silverado": { src: "assets/cars/chevrolet-silverado.webp", mask: "assets/cars/chevrolet-silverado-mask8.webp", w: 1600, h: 800, name: "Chevrolet Silverado" },
    "chevrolet-tahoe": { src: "assets/cars/chevrolet-tahoe.webp", mask: "assets/cars/chevrolet-tahoe-mask8.webp", w: 1600, h: 800, name: "Chevrolet Tahoe" },
    "chevrolet-trax": { src: "assets/cars/chevrolet-trax.webp", mask: "assets/cars/chevrolet-trax-mask8.webp", w: 1600, h: 800, name: "Chevrolet Trax" },
    "dodge-challenger": { src: "assets/cars/dodge-challenger.webp", mask: "assets/cars/dodge-challenger-mask7.webp", w: 1600, h: 800, name: "Dodge Challenger" },
    "dodge-charger": { src: "assets/cars/dodge-charger.webp", mask: "assets/cars/dodge-charger-mask8.webp", w: 1600, h: 800, name: "Dodge Charger" },
    "dodge-charger-392": { src: "assets/cars/dodge-charger-392.webp", mask: "assets/cars/dodge-charger-392-mask8.webp", w: 1600, h: 800, name: "Dodge Charger 392" },
    "dodge-grand-caravan": { src: "assets/cars/dodge-grand-caravan.webp", mask: "assets/cars/dodge-grand-caravan-mask8.webp", w: 1600, h: 800, name: "Dodge Grand Caravan" },
    "dodge-viper": { src: "assets/cars/dodge-viper.webp", mask: "assets/cars/dodge-viper-mask8.webp", w: 1600, h: 800, name: "Dodge Viper" },
    "ferrari-488": { src: "assets/cars/ferrari-488.webp", mask: "assets/cars/ferrari-488-mask8.webp", w: 1600, h: 800, name: "Ferrari 488" },
    "ford-bronco": { src: "assets/cars/ford-bronco.webp", mask: "assets/cars/ford-bronco-mask8.webp", w: 1600, h: 800, name: "Ford Bronco" },
    "ford-explorer": { src: "assets/cars/ford-explorer.webp", mask: "assets/cars/ford-explorer-mask8.webp", w: 1600, h: 800, name: "Ford Explorer" },
    "ford-f-150": { src: "assets/cars/ford-f-150.webp", mask: "assets/cars/ford-f-150-mask8.webp", w: 1600, h: 800, name: "Ford F 150" },
    "ford-mustang": { src: "assets/cars/ford-mustang.webp", mask: "assets/cars/ford-mustang-mask8.webp", w: 1600, h: 800, name: "Ford Mustang" },
    "ford-transit-connect": { src: "assets/cars/ford-transit-connect.webp", mask: "assets/cars/ford-transit-connect-mask7.webp", w: 1600, h: 800, name: "Ford Transit Connect" },
    "gmc-hummer-ev": { src: "assets/cars/gmc-hummer-ev.webp", mask: "assets/cars/gmc-hummer-ev-mask8.webp", w: 1600, h: 800, name: "GMC Hummer EV" },
    "gmc-sierra": { src: "assets/cars/gmc-sierra.webp", mask: "assets/cars/gmc-sierra-mask8.webp", w: 1600, h: 800, name: "GMC Sierra" },
    "honda-accord": { src: "assets/cars/honda-accord.webp", mask: "assets/cars/honda-accord-mask7.webp", w: 1600, h: 800, name: "Honda Accord" },
    "honda-civic": { src: "assets/cars/honda-civic.webp", mask: "assets/cars/honda-civic-mask8.webp", w: 1600, h: 800, name: "Honda Civic" },
    "honda-cr-v": { src: "assets/cars/honda-cr-v.webp", mask: "assets/cars/honda-cr-v-mask8.webp", w: 1600, h: 800, name: "Honda CR V" },
    "hyundai-sonata": { src: "assets/cars/hyundai-sonata.webp", mask: "assets/cars/hyundai-sonata-mask7.webp", w: 1600, h: 800, name: "Hyundai Sonata" },
    "hyundai-tucson": { src: "assets/cars/hyundai-tucson.webp", mask: "assets/cars/hyundai-tucson-mask8.webp", w: 1600, h: 800, name: "Hyundai Tucson" },
    "jeep-grand-cherokee": { src: "assets/cars/jeep-grand-cherokee.webp", mask: "assets/cars/jeep-grand-cherokee-mask8.webp", w: 1600, h: 800, name: "Jeep Grand Cherokee" },
    "kia-k5": { src: "assets/cars/kia-k5.webp", mask: "assets/cars/kia-k5-mask7.webp", w: 1600, h: 800, name: "Kia K5" },
    "kia-sportage": { src: "assets/cars/kia-sportage.webp", mask: "assets/cars/kia-sportage-mask8.webp", w: 1600, h: 800, name: "Kia Sportage" },
    "lamborghini-huracan": { src: "assets/cars/lamborghini-huracan.webp", mask: "assets/cars/lamborghini-huracan-mask8.webp", w: 1600, h: 800, name: "Lamborghini Huracan" },
    "lamborghini-urus": { src: "assets/cars/lamborghini-urus.webp", mask: "assets/cars/lamborghini-urus-mask8.webp", w: 1600, h: 800, name: "Lamborghini Urus" },
    "land-rover-range-rover": { src: "assets/cars/land-rover-range-rover.webp", mask: "assets/cars/land-rover-range-rover-mask8.webp", w: 1600, h: 800, name: "Land Rover Range Rover" },
    "lexus-is250": { src: "assets/cars/lexus-is250.webp", mask: "assets/cars/lexus-is250-mask8.webp", w: 1600, h: 800, name: "Lexus IS250" },
    "lexus-is350": { src: "assets/cars/lexus-is350.webp?v=6", mask: "assets/cars/lexus-is350-mask8.webp", w: 1600, h: 800, name: "Lexus IS350" },
    "lexus-rx": { src: "assets/cars/lexus-rx.webp", mask: "assets/cars/lexus-rx-mask7.webp", w: 1600, h: 800, name: "Lexus RX" },
    "lincoln-navigator": { src: "assets/cars/lincoln-navigator.webp", mask: "assets/cars/lincoln-navigator-mask8.webp", w: 1600, h: 800, name: "Lincoln Navigator" },
    "maserati-levante": { src: "assets/cars/maserati-levante.webp", mask: "assets/cars/maserati-levante-mask8.webp", w: 1600, h: 800, name: "Maserati Levante" },
    "mazda-3": { src: "assets/cars/mazda-3.webp", mask: "assets/cars/mazda-3-mask8.webp", w: 1600, h: 800, name: "Mazda 3" },
    "mclaren-720s": { src: "assets/cars/mclaren-720s.webp", mask: "assets/cars/mclaren-720s-mask8.webp", w: 1600, h: 800, name: "McLaren 720S" },
    "mercedes-e-class": { src: "assets/cars/mercedes-e-class.webp", mask: "assets/cars/mercedes-e-class-mask7.webp", w: 1600, h: 800, name: "Mercedes E Class" },
    "mercedes-metris": { src: "assets/cars/mercedes-metris.webp", mask: "assets/cars/mercedes-metris-mask7.webp", w: 1600, h: 800, name: "Mercedes Metris" },
    "mercedes-c-class": { src: "assets/cars/mercedes-c-class.webp", mask: "assets/cars/mercedes-c-class-mask8.webp", w: 1600, h: 800, name: "Mercedes C Class" },
    "mercedes-g63": { src: "assets/cars/mercedes-g63.webp", mask: "assets/cars/mercedes-g63-mask8.webp", w: 1600, h: 800, name: "Mercedes G63" },
    "mercedes-gle": { src: "assets/cars/mercedes-gle.webp", mask: "assets/cars/mercedes-gle-mask8.webp", w: 1600, h: 800, name: "Mercedes GLE" },
    "mercedes-sprinter": { src: "assets/cars/mercedes-sprinter.webp", mask: "assets/cars/mercedes-sprinter-mask8.webp", w: 1600, h: 800, name: "Mercedes Sprinter" },
    "nissan-altima": { src: "assets/cars/nissan-altima.webp", mask: "assets/cars/nissan-altima-mask8.webp", w: 1600, h: 800, name: "Nissan Altima" },
    "nissan-rogue": { src: "assets/cars/nissan-rogue.webp", mask: "assets/cars/nissan-rogue-mask8.webp", w: 1600, h: 800, name: "Nissan Rogue" },
    "porsche-macan": { src: "assets/cars/porsche-macan.webp", mask: "assets/cars/porsche-macan-mask7.webp", w: 1600, h: 800, name: "Porsche Macan" },
    "porsche-cayenne": { src: "assets/cars/porsche-cayenne.webp", mask: "assets/cars/porsche-cayenne-mask8.webp", w: 1600, h: 800, name: "Porsche Cayenne" },
    "porsche-panamera": { src: "assets/cars/porsche-panamera.webp", mask: "assets/cars/porsche-panamera-mask8.webp", w: 1600, h: 800, name: "Porsche Panamera" },
    "porsche-taycan": { src: "assets/cars/porsche-taycan.webp", mask: "assets/cars/porsche-taycan-mask8.webp", w: 1600, h: 800, name: "Porsche Taycan" },
    "ram-1500": { src: "assets/cars/ram-1500.webp", mask: "assets/cars/ram-1500-mask8.webp", w: 1600, h: 800, name: "Ram 1500" },
    "ram-promaster": { src: "assets/cars/ram-promaster.webp", mask: "assets/cars/ram-promaster-mask7.webp", w: 1600, h: 800, name: "Ram ProMaster" },
    "subaru-forester": { src: "assets/cars/subaru-forester.webp", mask: "assets/cars/subaru-forester-mask8.webp", w: 1600, h: 800, name: "Subaru Forester" },
    "tesla-cybertruck": { src: "assets/cars/tesla-cybertruck.webp", mask: "assets/cars/tesla-cybertruck-mask8.webp", w: 1600, h: 800, name: "Tesla Cybertruck" },
    "tesla-model-3": { src: "assets/cars/tesla-model-3.webp?v=6", mask: "assets/cars/tesla-model-3-mask8.webp", w: 1600, h: 800, name: "Tesla Model 3" },
    "tesla-model-s": { src: "assets/cars/tesla-model-s.webp", mask: "assets/cars/tesla-model-s-mask8.webp", w: 1600, h: 800, name: "Tesla Model S" },
    "tesla-model-x": { src: "assets/cars/tesla-model-x.webp?v=6", mask: "assets/cars/tesla-model-x-mask8.webp", w: 1600, h: 800, name: "Tesla Model X" },
    "tesla-model-y": { src: "assets/cars/tesla-model-y.webp", mask: "assets/cars/tesla-model-y-mask8.webp", w: 1600, h: 800, name: "Tesla Model Y" },
    "toyota-4runner": { src: "assets/cars/toyota-4runner.webp", mask: "assets/cars/toyota-4runner-mask8.webp", w: 1600, h: 800, name: "Toyota 4RUNNER" },
    "toyota-camry": { src: "assets/cars/toyota-camry.webp", mask: "assets/cars/toyota-camry-mask8.webp", w: 1600, h: 800, name: "Toyota Camry" },
    "toyota-corolla": { src: "assets/cars/toyota-corolla.webp", mask: "assets/cars/toyota-corolla-mask8.webp", w: 1600, h: 800, name: "Toyota Corolla" },
    "toyota-rav4": { src: "assets/cars/toyota-rav4.webp", mask: "assets/cars/toyota-rav4-mask8.webp", w: 1600, h: 800, name: "Toyota RAV4" },
    "toyota-sienna": { src: "assets/cars/toyota-sienna.webp", mask: "assets/cars/toyota-sienna-mask8.webp", w: 1600, h: 800, name: "Toyota Sienna" },
    "toyota-tacoma": { src: "assets/cars/toyota-tacoma.webp?v=6", mask: "assets/cars/toyota-tacoma-mask8.webp", w: 1600, h: 800, name: "Toyota Tacoma" },
    "toyota-tundra": { src: "assets/cars/toyota-tundra.webp", mask: "assets/cars/toyota-tundra-mask7.webp", w: 1600, h: 800, name: "Toyota Tundra" },
  };
  var siteAsset = function (path) {
    if (!path || path.charAt(0) === "/" || /^(?:https?:|data:|blob:)/i.test(path)) return path;
    return "/" + path.replace(/^\.\//, "");
  };
  var carImg = document.querySelector(".car__img");
  var carSelect = document.getElementById("car-select");
  var currentCar = "lamborghini-huracan";
  var carRequest = 0;
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
      var carSrc = siteAsset(car.src);
      var carMask = siteAsset(car.mask);
      var requestId = ++carRequest;
      var loader = new Image();
      var maskLoader = new Image();
      var loadedParts = 0;
      var commitCar = function () {
        loadedParts++;
        if (loadedParts < 2 || requestId !== carRequest) return;
        currentCar = key;
        carImg.src = carSrc;
        carImg.width = car.w;
        carImg.height = car.h;
        carImg.alt = car.name + " side profile on the studio wrap template";
        heroCar.style.setProperty("--mask", 'url("' + carMask + '")');
        /* the sculpt pass re-multiplies the template onto itself so light
           films read on a white body - it has to follow the template swap */
        heroCar.style.setProperty("--shade", 'url("' + carSrc + '")');
        updateCtaLink();
        syncCarToQuote();
        if (!prefersReduced) {
          heroCar.classList.remove("is-revealing");
          void heroCar.offsetWidth;
          heroCar.classList.add("is-revealing");
        }
      };
      var restoreSelection = function () {
        if (requestId === carRequest) carSelect.value = currentCar;
      };
      loader.onload = commitCar;
      maskLoader.onload = commitCar;
      loader.onerror = restoreSelection;
      maskLoader.onerror = restoreSelection;
      loader.src = carSrc;
      maskLoader.src = carMask;
    });
  }

  /* ---- Make -> Model split. A single list of every supported vehicle is too
     long on a phone. The original grouped select remains the no-JS fallback;
     with JS, the first control chooses the make and the second shows its models. ---- */
  if (carSelect) {
    var carGroups = Array.prototype.slice.call(carSelect.querySelectorAll("optgroup"));
    var requestOpt = carSelect.querySelector('option[value="__request"]');
    if (carGroups.length > 1) {
      var modelsByMake = {};
      carGroups.forEach(function (g) {
        modelsByMake[g.label] = Array.prototype.slice.call(g.querySelectorAll("option"))
          .filter(function (o) { return o.value !== "__request"; });
      });
      var makeSelect = document.createElement("select");
      makeSelect.id = "car-make";
      makeSelect.className = "car-select car-select--make";
      makeSelect.setAttribute("aria-label", "Car make");
      Object.keys(modelsByMake).forEach(function (make) {
        var o = document.createElement("option");
        o.value = make;
        o.textContent = make;
        makeSelect.appendChild(o);
      });
      var fillModels = function (make, keep) {
        while (carSelect.firstChild) carSelect.removeChild(carSelect.firstChild);
        modelsByMake[make].forEach(function (o) { carSelect.appendChild(o); });
        if (requestOpt) carSelect.appendChild(requestOpt);
        carSelect.value = keep && carSelect.querySelector('option[value="' + keep + '"]')
          ? keep
          : modelsByMake[make][0].value;
      };
      var currentMake = null;
      carGroups.forEach(function (g) {
        if (g.querySelector('option[value="' + currentCar + '"]')) currentMake = g.label;
      });
      if (!currentMake) currentMake = Object.keys(modelsByMake)[0];
      carSelect.parentNode.insertBefore(makeSelect, carSelect);
      makeSelect.value = currentMake;
      fillModels(currentMake, currentCar);
      makeSelect.addEventListener("change", function () {
        fillModels(makeSelect.value, null);
        carSelect.dispatchEvent(new Event("change"));
      });
    }
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
    // only the class panel that is actually on screen: a tile in a folded panel
    // never runs its animation, so animationend would never clear the class
    var list = Array.prototype.slice.call(chips).filter(function (c) { return c.offsetParent !== null; });
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
  var filmSelectionPaint = document.getElementById("film-selection-paint");
  var filmSelectionName = document.getElementById("film-selection-name");
  var filmSelectionCode = document.getElementById("film-selection-code");
  var filmSelectionEffect = document.getElementById("film-selection-effect");
  var quoteCar = document.getElementById("f-car");
  var quoteFinish = document.getElementById("f-finish");
  var currentFilmName = "";
  var currentFilmCode = "";
  if (quoteCar) quoteCar.addEventListener("input", function () {
    if (quoteCar.dataset.syncing !== "true") quoteCar.dataset.manual = "true";
  });
  if (quoteFinish) quoteFinish.addEventListener("input", function () {
    if (quoteFinish.dataset.syncing !== "true") quoteFinish.dataset.manual = "true";
  });
  var syncCarToQuote = function () {
    if (!quoteCar || quoteCar.dataset.manual === "true") return;
    quoteCar.dataset.syncing = "true";
    quoteCar.value = CARS[currentCar] ? CARS[currentCar].name : "";
    quoteCar.dispatchEvent(new Event("input", { bubbles: true }));
    delete quoteCar.dataset.syncing;
  };
  var syncFilmToQuote = function () {
    if (!quoteFinish || quoteFinish.dataset.manual === "true") return;
    quoteFinish.dataset.syncing = "true";
    quoteFinish.value = currentFilmName + (currentFilmCode ? " (" + currentFilmCode + ")" : "");
    quoteFinish.dispatchEvent(new Event("input", { bubbles: true }));
    delete quoteFinish.dataset.syncing;
  };
  var updateFilmSelection = function (chip) {
    if (!chip) return;
    var film = chip.getAttribute("data-set-film") || "shift";
    var panel = chip.closest && chip.closest(".films__panel");
    var nameNode = chip.querySelector(".fsw__name");
    var nameKey = nameNode && nameNode.getAttribute("data-i18n");
    if (filmSelectionPaint) filmSelectionPaint.className = "film-selection__paint fsw--" + film;
    if (filmSelectionName) {
      if (nameKey) filmSelectionName.setAttribute("data-i18n", nameKey);
      else filmSelectionName.removeAttribute("data-i18n");
      filmSelectionName.textContent = currentFilmName;
    }
    if (filmSelectionCode) filmSelectionCode.textContent = currentFilmCode;
    if (filmSelectionEffect) {
      var finishKey = panel && panel.id.indexOf("fp-") === 0 ? "fc." + panel.id.slice(3) : "fc.shift";
      var heading = panel && panel.querySelector(".films__ph");
      filmSelectionEffect.setAttribute("data-i18n", finishKey);
      filmSelectionEffect.textContent = heading ? heading.textContent.trim() : "Color shift";
    }
  };
  var updateCtaLink = function () {
    if (!filmCtaLink) return;
    var car = CARS[currentCar] ? CARS[currentCar].name : "";
    // the supplier code rides along: the studio gets a quotable lead, not "the purple one"
    var film = (currentFilmName || "color change") + (currentFilmCode ? " (" + currentFilmCode + ")" : "");
    var msg = "Hi! I want a " + film + " wrap on my " + car;
    filmCtaLink.href = "https://wa.me/13527790041?text=" + encodeURIComponent(msg);
  };
  var userFlips = 0;
  var demoTouched = false;
  var demoActive = false;
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      // read the name node, not the whole button: the tile also carries the
      // supplier code, and only the name is translated by i18n
      var nameEl = chip.querySelector(".fsw__name");
      currentFilmName = (nameEl ? nameEl.textContent : chip.textContent).trim();
      currentFilmCode = chip.getAttribute("data-film-code") || "";
      revealFilmChip(chip);
      showToast(currentFilmName);
      updateFilmSelection(chip);
      updateCtaLink();
      if (demoActive) return;
      syncFilmToQuote();
      demoTouched = true;
      userFlips++;
      if (userFlips >= 2 && filmCta && filmCta.hidden) {
        filmCta.hidden = false;
        /* commit the hidden->shown style before the class flips, or the
           420ms entrance collapses into a snap (rAF alone races the recalc) */
        void filmCta.offsetWidth;
        filmCta.classList.add("is-in");
      }
    }, { capture: true });
  });
  if (filmsMore && filmsWrap) {
    filmsMore.addEventListener("click", function () {
      var expanded = filmsMore.getAttribute("aria-expanded") !== "true";
      filmsMore.setAttribute("aria-expanded", expanded ? "true" : "false");
      filmsWrap.classList.toggle("is-expanded", expanded);
    });
  }
  var initialFilmChip = document.querySelector(".fsw.is-active");
  if (initialFilmChip) {
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip === initialFilmChip ? "true" : "false");
    });
    var initialName = initialFilmChip.querySelector(".fsw__name");
    currentFilmName = (initialName ? initialName.textContent : initialFilmChip.textContent).trim();
    currentFilmCode = initialFilmChip.getAttribute("data-film-code") || "";
    updateFilmSelection(initialFilmChip);
    updateCtaLink();
  }
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
    var runFilmDemo = function () {
      if (demoTouched || document.hidden) return;
      if (demoStore) demoStore.setItem("zw-demo", "1");
      // Electric Coral, not the old light blue: the biggest before/after delta
      // off the iridescent default, and it sits in the class tab that is already
      // open - the demo shows the car changing, not the tab strip jumping.
      clickChip("coral");
      chipWave();
      setTimeout(function () { if (!demoTouched) clickChip("shift"); }, 3000);
    };
    var visualizerSection = heroCar.closest && heroCar.closest(".visualizer");
    if (visualizerSection && "IntersectionObserver" in window) {
      var demoIO = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        demoIO.disconnect();
        setTimeout(runFilmDemo, 450);
      }, { threshold: 0.35 });
      demoIO.observe(visualizerSection);
    } else {
      setTimeout(runFilmDemo, 900);
    }
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
        "Car: " + v("f-car"),
        "Service: " + service(),
        v("f-finish") ? "Preferred finish: " + v("f-finish") : "",
        v("f-notes") ? "Notes: " + v("f-notes") : ""
      ].filter(Boolean);
      var campaign = new URLSearchParams(window.location.search);
      var source = ["utm_source", "utm_medium", "utm_campaign", "utm_content"]
        .map(function (key) { return campaign.get(key) ? key + "=" + campaign.get(key) : ""; })
        .filter(Boolean)
        .join("; ");
      lines.push("Page: " + window.location.pathname);
      if (source) lines.push("Source: " + source);
      // Same tab, not window.open: the in-app browsers of Instagram and TikTok
      // block popups, and a blocked popup drops the lead with nothing shown to
      // the visitor, who walks away sure the request was sent.
      window.location.href =
        "https://wa.me/13527790041?text=" + encodeURIComponent(lines.join("\n"));
    });
  }

  /* ---- Compact menu on every screen. The panel is display:none when closed
     so its links stay out of the tab order instead of remaining invisibly
     focusable. ---- */
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

  /* ---- The build button jumps into the visualizer. ---- */
  var applyFilm = function (film) {
    var target = document.querySelector("#visualizer .hero__car");
    if (!target) return;
    target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
    setTimeout(function () {
      var chip = document.querySelector('[data-set-film="' + film + '"]');
      if (chip) chip.click();
    }, prefersReduced ? 100 : 650);
  };
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

  /* ---- v44: one-shot intro on the shutter - the film wipes ON as the block
     arrives on screen, so it reads as a live control, not a static photo.
     The user's hand always wins: any input cancels the flight. ---- */
  if (baStage && baRange && !prefersReduced && "IntersectionObserver" in window) {
    var baTouched = false;
    baRange.addEventListener("input", function () { baTouched = true; }, { once: true });
    /* park the shutter almost-closed until the intro runs; if it never runs
       (no scroll that far), the almost-closed frame still reads correctly */
    baStage.style.setProperty("--cut", "96%");
    baRange.value = 96;
    var baIO = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      baIO.disconnect();
      if (baTouched) return;
      var t0 = null;
      var wipe = function (ts) {
        if (baTouched) return;
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 1100, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        var cut = 96 + (50 - 96) * eased;
        baStage.style.setProperty("--cut", cut + "%");
        baRange.value = cut;
        if (p < 1) requestAnimationFrame(wipe);
      };
      requestAnimationFrame(wipe);
    }, { threshold: 0.45 });
    baIO.observe(baStage);
  }

  /* ---- v44: phones fold the FAQ to the first five; one tap un-folds.
     The fold styles live behind a max-width media query, so the class is
     inert on desktop even if a rotation carries it across the breakpoint. ---- */
  var faqSection = document.querySelector(".faq");
  var faqMore = document.getElementById("faq-more");
  if (faqSection && faqMore) {
    if (window.matchMedia("(max-width: 720px)").matches) faqSection.classList.add("is-folded");
    faqMore.addEventListener("click", function () { faqSection.classList.remove("is-folded"); });
  }

  /* ---- v44: quick-contact bar - on once the hero scrolls away, off while
     the booking section is on screen (the form is the same channels; a bar
     over the submit button would only cover it). Desktop never shows it. ---- */
  var mbar = document.getElementById("mbar");
  var heroSection = document.querySelector(".hero");
  var visualizerForBar = document.getElementById("visualizer");
  var bookSection = document.getElementById("book");
  if (mbar && heroSection && "IntersectionObserver" in window) {
    var mbarHeroGone = false;
    var mbarVisualizerHere = false;
    var mbarBookHere = false;
    /* v45: the consent card and this bar share the bottom edge, and consent
       sits higher (z-index 120 vs 60) - the bar would light up unclickable
       underneath it. Consent wins; the bar joins after Accept/Decline. */
    var mbarConsent = document.getElementById("consent");
    var mbarSync = function () {
      var consentOpen = !!(mbarConsent && !mbarConsent.hidden);
      mbar.classList.toggle("is-on", mbarHeroGone && !mbarVisualizerHere && !mbarBookHere && !consentOpen);
    };
    document.addEventListener("zw:consent", mbarSync);
    var mbarHeroIO = new IntersectionObserver(function (entries) {
      mbarHeroGone = !entries[0].isIntersecting;
      mbarSync();
    }, { rootMargin: "80px 0px 0px" });
    mbarHeroIO.observe(heroSection);
    if (visualizerForBar) {
      var mbarVisualizerIO = new IntersectionObserver(function (entries) {
        mbarVisualizerHere = entries[0].isIntersecting;
        mbarSync();
      }, { threshold: 0.08 });
      mbarVisualizerIO.observe(visualizerForBar);
    }
    if (bookSection) {
      var mbarBookIO = new IntersectionObserver(function (entries) {
        mbarBookHere = entries[0].isIntersecting;
        mbarSync();
      }, { threshold: 0.12 });
      mbarBookIO.observe(bookSection);
    }
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
      // 0-1 scale for the bar's scaleX transform (CSS animates transform, not width)
      submitBtn.style.setProperty("--fill", (ok / reqFields.length).toFixed(3));
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
    b: ["A new color.", "Without a full", "<em>repaint.</em>"],
    c: ["Owner quoted.", "<em>Owner</em> prepped.", "Owner installed."]
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
        void exitbar.offsetWidth;
        exitbar.classList.add("is-in");
      };
      document.addEventListener("mouseout", onExit);
      exitbar.querySelector(".exitbar__close").addEventListener("click", function () {
        exitbar.classList.remove("is-in");
        setTimeout(function () { exitbar.hidden = true; }, 500);
      });
    }
  }

  /* v44: the floating FAB stack is retired - the .mbar quick-contact bar
     (wired above) carries the same three channels with labels. */

  /* ---- Gallery lightbox: an accessible modal dialog ----
     Keyboard: Enter/Space opens a photo, Esc closes, arrows page through, Tab is
     trapped inside the dialog. The rest of the page is made inert while it is up,
     and focus returns to the photo that opened it. Progressive enhancement: with
     no JS the photos stay plain images, so the buttons never exist without a
     working handler behind them. */
  var shots = Array.prototype.slice.call(document.querySelectorAll(".build__shot img"));
  if (shots.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Latest build photo viewer");
    lb.innerHTML =
      '<img alt="" decoding="async" />' +
      '<button class="lightbox__btn lightbox__close" type="button" aria-label="Close photo viewer">&#10005;</button>' +
      '<button class="lightbox__btn lightbox__prev" type="button" aria-label="Previous photo">&#8249;</button>' +
      '<button class="lightbox__btn lightbox__next" type="button" aria-label="Next photo">&#8250;</button>' +
      /* v45: frame counter + caption; aria-hidden because the img alt already
         carries the same words for screen readers */
      '<p class="lightbox__meta" aria-hidden="true"><span class="lightbox__count"></span><span class="lightbox__cap"></span></p>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img");
    var lbCount = lb.querySelector(".lightbox__count");
    var lbCap = lb.querySelector(".lightbox__cap");
    var lbIdx = 0;
    var lbOpener = null;   // the photo to hand focus back to on close
    var lbInerted = [];    // background elements we froze while the dialog is open
    var lbShow = function (i) {
      lbIdx = (i + shots.length) % shots.length;
      // data-full, а не currentSrc: с srcset браузер выбирает для сетки
      // уменьшенный вариант, и лайтбокс открывал бы мелкую картинку.
      var shot = shots[lbIdx];
      lbImg.src = siteAsset(shot.getAttribute("data-full") || shot.currentSrc || shot.src);
      lbImg.alt = shots[lbIdx].alt || "";
      if (lbCount) lbCount.textContent = (lbIdx + 1) + " / " + shots.length;
      if (lbCap) lbCap.textContent = shots[lbIdx].alt || "";
    };
    // Hide the rest of the page from the tab order and screen readers while the
    // dialog is up. inert also implies aria-hidden; the Tab trap below is the
    // fallback for browsers where inert is not yet supported.
    var setBackgroundInert = function (on) {
      if (on) {
        lbInerted = [];
        Array.prototype.forEach.call(document.body.children, function (el) {
          if (el === lb || el.hasAttribute("inert")) return;
          el.setAttribute("inert", "");
          lbInerted.push(el);
        });
      } else {
        lbInerted.forEach(function (el) { el.removeAttribute("inert"); });
        lbInerted = [];
      }
    };
    var lbOpen = function (i, opener) {
      lbOpener = opener || null;
      lbShow(i);
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
      setBackgroundInert(true);
      lb.querySelector(".lightbox__close").focus();
    };
    var lbClose = function () {
      if (!lb.classList.contains("is-open")) return;
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
      setBackgroundInert(false);
      if (lbOpener && typeof lbOpener.focus === "function") lbOpener.focus();
      lbOpener = null;
    };
    shots.forEach(function (img, i) {
      img.setAttribute("role", "button");
      img.setAttribute("tabindex", "0");
      if (!img.getAttribute("aria-label")) {
        img.setAttribute("aria-label", "Open photo" + (img.alt ? ": " + img.alt : ""));
      }
      img.addEventListener("click", function () { lbOpen(i, img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          lbOpen(i, img);
        }
      });
    });
    lb.addEventListener("click", function (e) { if (e.target === lb) lbClose(); });
    lb.querySelector(".lightbox__close").addEventListener("click", lbClose);
    lb.querySelector(".lightbox__prev").addEventListener("click", function () { lbShow(lbIdx - 1); });
    lb.querySelector(".lightbox__next").addEventListener("click", function () { lbShow(lbIdx + 1); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") { lbClose(); return; }
      if (e.key === "ArrowLeft") { lbShow(lbIdx - 1); return; }
      if (e.key === "ArrowRight") { lbShow(lbIdx + 1); return; }
      if (e.key === "Tab") {
        var f = lb.querySelectorAll("button");
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!lb.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---- Contact-intent signals go to Meta and GA4, and the same
     intents go to GA4 as one contact_intent event with a method param
     (phone / sms / whatsapp / messenger / whatsapp_form). GA4 contact_intent
     is the key event behind the Google Ads conversion, so keep the name
     stable. Both are delegated on document, so links added later are covered
     and the same block works on any page that loads this file. Silent when a
     tracker is missing or blocked. ---- */
  var contactSent = {};
  // One intent per link: a double tap is not two events.
  var contactOnce = function (id) {
    var now = Date.now();
    if (now - (contactSent[id] || 0) < 1500) return false;
    contactSent[id] = now;
    return true;
  };
  var trackContact = function (pixelEvent, method, key) {
    if (!window.zwAnalyticsLoaded) return;
    if (!contactOnce(pixelEvent + "|" + key)) return;
    // Both trackers put the hit on the wire without touching the click:
    // no preventDefault, no delay. fbq is synchronous; gtag rides a beacon
    // so the hit survives the navigation to wa.me / m.me.
    if (typeof window.fbq === "function") window.fbq("track", pixelEvent);
    if (typeof window.gtag === "function") {
      window.gtag("event", "contact_intent", {
        method: method, link_url: key, transport_type: "beacon"
      });
    }
  };

  document.addEventListener("submit", function (e) {
    if (!e.target || e.target.id !== "consult-form") return;
    trackContact("Contact", "whatsapp_form", "consult-form");
  }, true);

  document.addEventListener("click", function (e) {
    var link = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!link) return;
    var href = link.getAttribute("href") || "";
    var method = /^tel:/i.test(href) ? "phone"
      : /^sms:/i.test(href) ? "sms"
      : /^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href) ? "whatsapp"
      : /^https?:\/\/m\.me\//i.test(href) ? "messenger"
      : null;
    if (!method) return;
    // The form submit handler already records this intent, so do not duplicate it.
    if (link.closest("#consult-form")) return;
    trackContact("Contact", method, href);
  }, true);
})();

/* ---- Cookie notice. Analytics stays unloaded until Accept. ---- */
(function () {
  "use strict";
  var KEY = "zw-consent";
  var bar = document.getElementById("consent");
  if (!bar) return;

  var stored = null;
  try { stored = window.localStorage.getItem(KEY); } catch (e) {}
  if (stored === "allow" || stored === "deny") return;
  bar.hidden = false;

  function apply(choice) {
    try { window.localStorage.setItem(KEY, choice); } catch (e) {}
    window.zwConsent = choice;
    if (choice === "allow") {
      if (typeof window.zwLoadAnalytics === "function") window.zwLoadAnalytics();
    } else if (window.zwAnalyticsLoaded) {
      window.gtag("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied"
      });
      if (typeof window.fbq === "function") window.fbq("consent", "revoke");
    }
    bar.hidden = true;
    /* v45: the quick-contact bar holds back while consent is open - tell it
       the way is clear now (listener lives in the mbar block above) */
    document.dispatchEvent(new CustomEvent("zw:consent"));
  }

  var ok = document.getElementById("consent-ok");
  var no = document.getElementById("consent-no");
  if (ok) ok.addEventListener("click", function () { apply("allow"); });
  if (no) no.addEventListener("click", function () { apply("deny"); });
})();
