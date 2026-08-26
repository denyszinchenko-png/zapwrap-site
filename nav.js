(function () {
  "use strict";

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
    navLinks.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu(true);
    });
    document.addEventListener("click", function (event) {
      if (!navLinks.contains(event.target) && !burger.contains(event.target)) closeMenu(false);
    });
  }

  var nav = document.getElementById("nav");
  if (nav) {
    var syncNav = function () {
      nav.setAttribute("data-scrolled", window.scrollY > 24 ? "true" : "false");
    };
    syncNav();
    window.addEventListener("scroll", syncNav, { passive: true });
  }
})();
