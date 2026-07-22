/* Evidran · comportamiento compartido de las páginas de plataforma */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Secuencias animadas [data-seqgroup]
  var groups = document.querySelectorAll("[data-seqgroup]");
  function playGroup(g) {
    var seqEls = Array.prototype.slice.call(g.querySelectorAll(".seq"));
    seqEls.sort(function (a, b) { return (+a.dataset.seq) - (+b.dataset.seq); });
    var step = +g.dataset.seqstep || 650;
    var start = +g.dataset.seqstart || 400;
    seqEls.forEach(function (el, i) {
      setTimeout(function () { el.classList.add("show"); }, start + i * step);
    });
  }
  if (reduce || !("IntersectionObserver" in window)) {
    groups.forEach(function (g) {
      g.querySelectorAll(".seq").forEach(function (el) { el.classList.add("show"); });
    });
  } else {
    var ioSeq = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { playGroup(en.target); ioSeq.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    groups.forEach(function (g) { ioSeq.observe(g); });
  }

  // Reveal al hacer scroll
  if (!reduce && "IntersectionObserver" in window) {
    var sel = [".center-head", ".feat-row", ".xlink", ".mock", ".final .wrap > *"];
    var revealEls = [];
    sel.forEach(function (s) {
      document.querySelectorAll(s).forEach(function (el) {
        if (revealEls.indexOf(el) === -1) revealEls.push(el);
      });
    });
    revealEls.forEach(function (el) {
      el.classList.add("reveal");
      var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) {
        return c.classList.contains("reveal");
      });
      var idx = sibs.indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 0.07, 0.42) + "s";
    });
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        ro.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { ro.observe(el); });
  }

  // Sombra de la barra
  var navEl = document.querySelector("nav");
  if (navEl) {
    var onScroll = function () { navEl.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Desplegables (clic; hover por CSS en escritorio)
  var navItems = Array.prototype.slice.call(document.querySelectorAll(".nav-item"));
  function cerrarDrops() {
    navItems.forEach(function (it) {
      it.classList.remove("open");
      var b = it.querySelector(".nav-drop-btn");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }
  navItems.forEach(function (it) {
    var btn = it.querySelector(".nav-drop-btn");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var estaba = it.classList.contains("open");
      cerrarDrops();
      if (!estaba) {
        it.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-item")) cerrarDrops();
  });

  // Menú móvil
  var navBurger = document.getElementById("navBurger");
  if (navEl && navBurger) {
    var closeMenu = function () {
      navEl.classList.remove("nav-open");
      navBurger.setAttribute("aria-expanded", "false");
      cerrarDrops();
    };
    navBurger.addEventListener("click", function () {
      var open = navEl.classList.toggle("nav-open");
      navBurger.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) cerrarDrops();
    });
    Array.prototype.forEach.call(navEl.querySelectorAll(".nav-links a"), function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 980) closeMenu(); });
  }

  // Analítica: alta self-service
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="https://app.evidran.com/?alta"]'), function (link) {
    link.addEventListener("click", function (event) {
      if (typeof window.gtag !== "function") return;
      event.preventDefault();
      var href = link.href;
      var navegado = false;
      var ir = function () {
        if (navegado) return;
        navegado = true;
        window.location.href = href;
      };
      window.gtag("event", "generate_lead", {
        event_category: "lead",
        event_label: link.textContent.trim() || "Prueba gratis",
        method: "signup",
        event_callback: ir
      });
      window.setTimeout(ir, 700);
    });
  });

  // Analítica: petición de demo
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="mailto:demo@evidran.com"]'), function (link) {
    link.addEventListener("click", function () {
      if (typeof window.gtag !== "function") return;
      window.gtag("event", "demo_request", {
        event_category: "lead",
        event_label: link.textContent.trim() || "Pide una demo",
        method: "email"
      });
    });
  });
})();
