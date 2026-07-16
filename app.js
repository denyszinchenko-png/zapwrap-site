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
    "911": { src: "assets/cars/porsche-911.webp", mask: "assets/cars/porsche-911-mask.webp", w: 1600, h: 800, name: "Porsche 911" },
    "audi-q8": { src: "assets/cars/audi-q8.webp", mask: "assets/cars/audi-q8-mask.webp", w: 1600, h: 800, name: "Audi Q8" },
    "audi-r8": { src: "assets/cars/audi-r8.webp", mask: "assets/cars/audi-r8-mask.webp", w: 1600, h: 800, name: "Audi R8" },
    "bentley-continental-gt": { src: "assets/cars/bentley-continental-gt.webp", mask: "assets/cars/bentley-continental-gt-mask.webp", w: 1600, h: 800, name: "Bentley Continental GT" },
    "bmw-430i-gran-coupe": { src: "assets/cars/bmw-430i-gran-coupe.webp", mask: "assets/cars/bmw-430i-gran-coupe-mask.webp", w: 1600, h: 800, name: "BMW 430I Gran Coupe" },
    "bmw-840i": { src: "assets/cars/bmw-840i.webp", mask: "assets/cars/bmw-840i-mask.webp", w: 1600, h: 800, name: "BMW 840I" },
    "bmw-m3-competition": { src: "assets/cars/bmw-m3-competition.webp", mask: "assets/cars/bmw-m3-competition-mask.webp", w: 1600, h: 800, name: "BMW M3 Competition" },
    "bmw-m4": { src: "assets/cars/bmw-m4.webp", mask: "assets/cars/bmw-m4-mask.webp", w: 1600, h: 800, name: "BMW M4" },
    "bmw-m5-competition": { src: "assets/cars/bmw-m5-competition.webp", mask: "assets/cars/bmw-m5-competition-mask.webp", w: 1600, h: 800, name: "BMW M5 Competition" },
    "bmw-m8": { src: "assets/cars/bmw-m8.webp", mask: "assets/cars/bmw-m8-mask.webp", w: 1600, h: 800, name: "BMW M8" },
    "bmw-x5": { src: "assets/cars/bmw-x5.webp", mask: "assets/cars/bmw-x5-mask.webp", w: 1600, h: 800, name: "BMW X5" },
    "bmw-x6": { src: "assets/cars/bmw-x6.webp", mask: "assets/cars/bmw-x6-mask.webp", w: 1600, h: 800, name: "BMW X6" },
    "cadillac-ct5-v-blackwing": { src: "assets/cars/cadillac-ct5-v-blackwing.webp", mask: "assets/cars/cadillac-ct5-v-blackwing-mask.webp", w: 1600, h: 800, name: "Cadillac CT5 V Blackwing" },
    "cadillac-escalade": { src: "assets/cars/cadillac-escalade.webp", mask: "assets/cars/cadillac-escalade-mask.webp", w: 1600, h: 800, name: "Cadillac Escalade" },
    "chevrolet-camaro": { src: "assets/cars/chevrolet-camaro.webp", mask: "assets/cars/chevrolet-camaro-mask.webp", w: 1600, h: 800, name: "Chevrolet Camaro" },
    "chevrolet-equinox": { src: "assets/cars/chevrolet-equinox.webp", mask: "assets/cars/chevrolet-equinox-mask.webp", w: 1600, h: 800, name: "Chevrolet Equinox" },
    "chevrolet-silverado": { src: "assets/cars/chevrolet-silverado.webp", mask: "assets/cars/chevrolet-silverado-mask.webp", w: 1600, h: 800, name: "Chevrolet Silverado" },
    "chevrolet-tahoe": { src: "assets/cars/chevrolet-tahoe.webp", mask: "assets/cars/chevrolet-tahoe-mask.webp", w: 1600, h: 800, name: "Chevrolet Tahoe" },
    "chevrolet-trax": { src: "assets/cars/chevrolet-trax.webp", mask: "assets/cars/chevrolet-trax-mask.webp", w: 1600, h: 800, name: "Chevrolet Trax" },
    "dodge-charger": { src: "assets/cars/dodge-charger.webp", mask: "assets/cars/dodge-charger-mask.webp", w: 1600, h: 800, name: "Dodge Charger" },
    "dodge-charger-392": { src: "assets/cars/dodge-charger-392.webp", mask: "assets/cars/dodge-charger-392-mask.webp", w: 1600, h: 800, name: "Dodge Charger 392" },
    "dodge-grand-caravan": { src: "assets/cars/dodge-grand-caravan.webp", mask: "assets/cars/dodge-grand-caravan-mask.webp", w: 1600, h: 800, name: "Dodge Grand Caravan" },
    "dodge-viper": { src: "assets/cars/dodge-viper.webp", mask: "assets/cars/dodge-viper-mask.webp", w: 1600, h: 800, name: "Dodge Viper" },
    "ferrari-488": { src: "assets/cars/ferrari-488.webp", mask: "assets/cars/ferrari-488-mask.webp", w: 1600, h: 800, name: "Ferrari 488" },
    "ford-bronco": { src: "assets/cars/ford-bronco.webp", mask: "assets/cars/ford-bronco-mask.webp", w: 1600, h: 800, name: "Ford Bronco" },
    "ford-explorer": { src: "assets/cars/ford-explorer.webp", mask: "assets/cars/ford-explorer-mask.webp", w: 1600, h: 800, name: "Ford Explorer" },
    "ford-f-150": { src: "assets/cars/ford-f-150.webp", mask: "assets/cars/ford-f-150-mask.webp", w: 1600, h: 800, name: "Ford F 150" },
    "ford-mustang": { src: "assets/cars/ford-mustang.webp", mask: "assets/cars/ford-mustang-mask.webp", w: 1600, h: 800, name: "Ford Mustang" },
    "gmc-hummer-ev": { src: "assets/cars/gmc-hummer-ev.webp", mask: "assets/cars/gmc-hummer-ev-mask.webp", w: 1600, h: 800, name: "GMC Hummer EV" },
    "gmc-sierra": { src: "assets/cars/gmc-sierra.webp", mask: "assets/cars/gmc-sierra-mask.webp", w: 1600, h: 800, name: "GMC Sierra" },
    "honda-civic": { src: "assets/cars/honda-civic.webp", mask: "assets/cars/honda-civic-mask.webp", w: 1600, h: 800, name: "Honda Civic" },
    "honda-cr-v": { src: "assets/cars/honda-cr-v.webp", mask: "assets/cars/honda-cr-v-mask.webp", w: 1600, h: 800, name: "Honda CR V" },
    "hyundai-tucson": { src: "assets/cars/hyundai-tucson.webp", mask: "assets/cars/hyundai-tucson-mask.webp", w: 1600, h: 800, name: "Hyundai Tucson" },
    "jeep-grand-cherokee": { src: "assets/cars/jeep-grand-cherokee.webp", mask: "assets/cars/jeep-grand-cherokee-mask.webp", w: 1600, h: 800, name: "Jeep Grand Cherokee" },
    "kia-sportage": { src: "assets/cars/kia-sportage.webp", mask: "assets/cars/kia-sportage-mask.webp", w: 1600, h: 800, name: "Kia Sportage" },
    "lamborghini-huracan": { src: "assets/cars/lamborghini-huracan.webp", mask: "assets/cars/lamborghini-huracan-mask.webp", w: 1600, h: 800, name: "Lamborghini Huracan" },
    "lamborghini-urus": { src: "assets/cars/lamborghini-urus.webp", mask: "assets/cars/lamborghini-urus-mask.webp", w: 1600, h: 800, name: "Lamborghini Urus" },
    "land-rover-range-rover": { src: "assets/cars/land-rover-range-rover.webp", mask: "assets/cars/land-rover-range-rover-mask.webp", w: 1600, h: 800, name: "Land Rover Range Rover" },
    "lexus-is250": { src: "assets/cars/lexus-is250.webp", mask: "assets/cars/lexus-is250-mask.webp", w: 1600, h: 800, name: "Lexus IS250" },
    "lexus-is350": { src: "assets/cars/lexus-is350.webp", mask: "assets/cars/lexus-is350-mask.webp", w: 1600, h: 800, name: "Lexus IS350" },
    "lincoln-navigator": { src: "assets/cars/lincoln-navigator.webp", mask: "assets/cars/lincoln-navigator-mask.webp", w: 1600, h: 800, name: "Lincoln Navigator" },
    "maserati-levante": { src: "assets/cars/maserati-levante.webp", mask: "assets/cars/maserati-levante-mask.webp", w: 1600, h: 800, name: "Maserati Levante" },
    "mazda-3": { src: "assets/cars/mazda-3.webp", mask: "assets/cars/mazda-3-mask.webp", w: 1600, h: 800, name: "Mazda 3" },
    "mclaren-720s": { src: "assets/cars/mclaren-720s.webp", mask: "assets/cars/mclaren-720s-mask.webp", w: 1600, h: 800, name: "McLaren 720S" },
    "mercedes-c-class": { src: "assets/cars/mercedes-c-class.webp", mask: "assets/cars/mercedes-c-class-mask.webp", w: 1600, h: 800, name: "Mercedes C Class" },
    "mercedes-g63": { src: "assets/cars/mercedes-g63.webp", mask: "assets/cars/mercedes-g63-mask.webp", w: 1600, h: 800, name: "Mercedes G63" },
    "mercedes-gle": { src: "assets/cars/mercedes-gle.webp", mask: "assets/cars/mercedes-gle-mask.webp", w: 1600, h: 800, name: "Mercedes GLE" },
    "mercedes-sprinter": { src: "assets/cars/mercedes-sprinter.webp", mask: "assets/cars/mercedes-sprinter-mask.webp", w: 1600, h: 800, name: "Mercedes Sprinter" },
    "nissan-altima": { src: "assets/cars/nissan-altima.webp", mask: "assets/cars/nissan-altima-mask.webp", w: 1600, h: 800, name: "Nissan Altima" },
    "nissan-rogue": { src: "assets/cars/nissan-rogue.webp", mask: "assets/cars/nissan-rogue-mask.webp", w: 1600, h: 800, name: "Nissan Rogue" },
    "porsche-cayenne": { src: "assets/cars/porsche-cayenne.webp", mask: "assets/cars/porsche-cayenne-mask.webp", w: 1600, h: 800, name: "Porsche Cayenne" },
    "porsche-panamera": { src: "assets/cars/porsche-panamera.webp", mask: "assets/cars/porsche-panamera-mask.webp", w: 1600, h: 800, name: "Porsche Panamera" },
    "porsche-taycan": { src: "assets/cars/porsche-taycan.webp", mask: "assets/cars/porsche-taycan-mask.webp", w: 1600, h: 800, name: "Porsche Taycan" },
    "ram-1500": { src: "assets/cars/ram-1500.webp", mask: "assets/cars/ram-1500-mask.webp", w: 1600, h: 800, name: "Ram 1500" },
    "school-bus-short-white": { src: "assets/cars/school-bus-short-white.webp", mask: "assets/cars/school-bus-short-white-mask.webp", w: 1600, h: 800, name: "School Bus Short White" },
    "subaru-forester": { src: "assets/cars/subaru-forester.webp", mask: "assets/cars/subaru-forester-mask.webp", w: 1600, h: 800, name: "Subaru Forester" },
    "tesla-cybertruck": { src: "assets/cars/tesla-cybertruck.webp", mask: "assets/cars/tesla-cybertruck-mask.webp", w: 1600, h: 800, name: "Tesla Cybertruck" },
    "tesla-model-3": { src: "assets/cars/tesla-model-3.webp", mask: "assets/cars/tesla-model-3-mask.webp", w: 1600, h: 800, name: "Tesla Model 3" },
    "tesla-model-s": { src: "assets/cars/tesla-model-s.webp", mask: "assets/cars/tesla-model-s-mask.webp", w: 1600, h: 800, name: "Tesla Model S" },
    "tesla-model-x": { src: "assets/cars/tesla-model-x.webp", mask: "assets/cars/tesla-model-x-mask.webp", w: 1600, h: 800, name: "Tesla Model X" },
    "tesla-model-y": { src: "assets/cars/tesla-model-y.webp", mask: "assets/cars/tesla-model-y-mask.webp", w: 1600, h: 800, name: "Tesla Model Y" },
    "toyota-4runner": { src: "assets/cars/toyota-4runner.webp", mask: "assets/cars/toyota-4runner-mask.webp", w: 1600, h: 800, name: "Toyota 4RUNNER" },
    "toyota-camry": { src: "assets/cars/toyota-camry.webp", mask: "assets/cars/toyota-camry-mask.webp", w: 1600, h: 800, name: "Toyota Camry" },
    "toyota-corolla": { src: "assets/cars/toyota-corolla.webp", mask: "assets/cars/toyota-corolla-mask.webp", w: 1600, h: 800, name: "Toyota Corolla" },
    "toyota-rav4": { src: "assets/cars/toyota-rav4.webp", mask: "assets/cars/toyota-rav4-mask.webp", w: 1600, h: 800, name: "Toyota RAV4" },
    "toyota-sienna": { src: "assets/cars/toyota-sienna.webp", mask: "assets/cars/toyota-sienna-mask.webp", w: 1600, h: 800, name: "Toyota Sienna" },
    "toyota-tacoma": { src: "assets/cars/toyota-tacoma.webp", mask: "assets/cars/toyota-tacoma-mask.webp", w: 1600, h: 800, name: "Toyota Tacoma" }
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
