/* =========================================================
   Hasan Mukti, ST, MBA — AI Trainer & Productivity Consultant
   Site interactions & animations
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Config: contact info (edit here if number/email changes) ---------- */
  var PHONE_DISPLAY = "0812 1636 2030";
  var PHONE_WA = "6281216362030"; // 0812 16362030 -> 62 + drop leading 0
  var WA_MESSAGE = "Halo Pak Hasan, saya tertarik dengan program AI Training & Productivity Consulting. Boleh minta info lebih lanjut?";
  var WA_LINK = "https://wa.me/" + PHONE_WA + "?text=" + encodeURIComponent(WA_MESSAGE);
  var TEL_LINK = "tel:+" + PHONE_WA;

  // Wire up every WhatsApp / phone touchpoint on the page
  [
    "navWaBtn", "navWaBtnMobile", "heroWaBtn", "aboutWaBtn", "ctaWaBtn", "fabWa"
  ].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.setAttribute("href", WA_LINK);
  });
  ["ctaPhoneLink", "footerPhoneLink"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = PHONE_DISPLAY;
      el.setAttribute("href", TEL_LINK);
    }
  });

  /* ---------- Navbar: shrink on scroll + mobile menu ---------- */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  var navMobile = document.getElementById("navMobile");
  var fabWa = document.getElementById("fabWa");

  function onScroll() {
    var scrolled = window.scrollY > 40;
    nav.classList.toggle("is-scrolled", scrolled);
    if (fabWa) fabWa.classList.toggle("is-visible", window.scrollY > 480);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger && navMobile) {
    burger.addEventListener("click", function () {
      var open = navMobile.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navMobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navMobile.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = el.getAttribute("data-reveal-delay");
            if (delay) el.style.transitionDelay = delay + "ms";
            el.classList.add("is-visible");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated stat counters ---------- */
  var statEls = document.querySelectorAll(".stat__num[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (statEls.length) {
    if ("IntersectionObserver" in window) {
      var statIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              statIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      statEls.forEach(function (el) { statIo.observe(el); });
    } else {
      statEls.forEach(animateCount);
    }
  }

  /* ---------- Testimonial slider ---------- */
  var track = document.getElementById("sliderTrack");
  var dotsWrap = document.getElementById("sliderDots");
  var prevBtn = document.getElementById("sliderPrev");
  var nextBtn = document.getElementById("sliderNext");

  if (track) {
    var slides = Array.prototype.slice.call(track.children);
    var current = 0;
    var autoplayMs = 6000;
    var timer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.setAttribute("aria-label", "Ke testimoni " + (i + 1));
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", function () { goTo(i); restart(); });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function goTo(i) {
      current = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + current * 100 + "%)";
      dots.forEach(function (d, idx) { d.classList.toggle("is-active", idx === current); });
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, autoplayMs);
    }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });

    var sliderRoot = document.getElementById("slider");
    if (sliderRoot) {
      sliderRoot.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
      sliderRoot.addEventListener("mouseleave", restart);
    }

    // basic touch swipe
    var touchStartX = null;
    track.addEventListener("touchstart", function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); restart(); }
      touchStartX = null;
    }, { passive: true });

    restart();
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Smooth scroll offset for fixed nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });
})();
