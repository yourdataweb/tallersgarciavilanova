/* Tallers Garcia Vilanova — progressive enhancement only.
   Content is fully rendered server-side; nothing here is required to read the page. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (toggle && nav) {
    var setOpen = function (open) {
      nav.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };

    toggle.addEventListener("click", function () {
      setOpen(nav.getAttribute("data-open") !== "true");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.getAttribute("data-open") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (nav.getAttribute("data-open") !== "true") return;
      if (e.target.closest("#site-nav") || e.target.closest(".nav-toggle")) return;
      setOpen(false);
    });
  }

  /* ---------- sticky header shadow ---------- */
  var header = document.querySelector(".header");
  if (header) {
    var onScroll = function () {
      header.style.boxShadow =
        window.scrollY > 8 ? "0 8px 22px -20px rgba(10,18,22,.75)" : "none";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- reveal on scroll ---------- */
  var items = document.querySelectorAll(".reveal");
  if (items.length && !reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- cookie consent + map gate ---------- */
  var KEY = "cookie-consent-v1";
  var bar = document.getElementById("cookiebar");
  var mapShell = document.getElementById("map-shell");

  function stored() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(v) {
    try { window.localStorage.setItem(KEY, v); } catch (e) { /* private mode */ }
  }

  function loadMap() {
    if (!mapShell) return;
    if (mapShell.getAttribute("data-map-loaded") === "true") return;
    var tpl = document.getElementById("map-template");
    if (!tpl) return;
    mapShell.appendChild(tpl.content.cloneNode(true));
    mapShell.setAttribute("data-map-loaded", "true");
  }

  function showBar() {
    if (!bar) return;
    bar.setAttribute("data-visible", "true");
  }
  function hideBar() {
    if (!bar) return;
    bar.setAttribute("data-visible", "false");
  }

  var consent = stored();
  if (!consent && bar) {
    window.setTimeout(showBar, 1200);
  } else if (consent === "accepted") {
    loadMap();
  }

  if (bar) {
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cookie]");
      if (!btn) return;
      var choice = btn.getAttribute("data-cookie");
      var accepted = choice === "accept";
      store(accepted ? "accepted" : "essential");
      hideBar();
      if (typeof window.__analyticsConsent === "function") {
        window.__analyticsConsent(accepted);
      }
      if (accepted) loadMap();
    });
  }

  var opener = document.querySelector("[data-cookie-open]");
  if (opener) {
    opener.addEventListener("click", function (e) {
      e.preventDefault();
      showBar();
    });
  }

  var mapBtn = document.querySelector("[data-map-load]");
  if (mapBtn) {
    mapBtn.addEventListener("click", function () {
      store("accepted");
      hideBar();
      if (typeof window.__analyticsConsent === "function") {
        window.__analyticsConsent(true);
      }
      loadMap();
    });
  }

  /* ---------- footer year (defensive) ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
