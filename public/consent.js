/* Evidran · consentimiento de cookies
   Dos finalidades independientes: analítica (Google Analytics) y publicidad (píxel de Meta).
   Nada se carga hasta que el visitante acepta esa finalidad. */
(function () {
  var KEY = "evd_consent_v2"; // v2: se añade publicidad; quien aceptó en v1 vuelve a ver el aviso
  var GA_ID = "G-W6Q6L17YS9";
  var META_PIXEL_ID = "1080161098107328";
  var UN_ANO = 365 * 24 * 3600 * 1000;

  // Devuelve { a: analítica, p: publicidad } o null si no hay decisión vigente
  function estado() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!v || !v.c || (Date.now() - v.t) > UN_ANO) return null;
      return { a: !!v.c.a, p: !!v.c.p };
    } catch (e) { return null; }
  }
  function guardar(c) {
    try { localStorage.setItem(KEY, JSON.stringify({ c: c, t: Date.now() })); } catch (e) {}
  }

  function cargarGA() {
    if (window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    gtag("js", new Date());
    gtag("config", GA_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  // Código base del píxel de Meta (el oficial), cargado solo tras aceptar la publicidad
  function cargarMeta() {
    if (window.fbq) return;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", META_PIXEL_ID);
    fbq("track", "PageView");
  }

  function aplicar(c) {
    if (c.a) cargarGA();
    if (c.p) cargarMeta();
  }

  function quitarBanner() {
    var b = document.getElementById("evdCookies");
    if (b) b.remove();
  }
  // Un script ya cargado no se puede descargar: si se retira un permiso, se recarga la página
  function decidir(c) {
    var antes = estado();
    guardar(c);
    quitarBanner();
    if (antes && ((antes.a && !c.a) || (antes.p && !c.p))) {
      window.location.reload();
      return;
    }
    aplicar(c);
  }
  function aceptar() { decidir({ a: true, p: true }); }
  function rechazar() { decidir({ a: false, p: false }); }
  function preferencias(a, p) { decidir({ a: !!a, p: !!p }); }

  function banner() {
    if (document.getElementById("evdCookies")) return;
    var css = document.createElement("style");
    css.textContent =
      "#evdCookies{position:fixed;left:16px;right:16px;bottom:16px;z-index:9500;max-width:600px;margin:0 auto;" +
      "background:#fff;border:1px solid #DDD8CC;border-radius:12px;box-shadow:0 24px 60px rgba(22,32,43,.22);" +
      "padding:10px 14px;font-family:'Inter Tight',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;" +
      "display:flex;align-items:center;gap:12px;flex-wrap:wrap;}" +
      "#evdCookies p{margin:0;flex:1;font-size:13px;line-height:1.4;color:#4A5563;min-width:200px;}" +
      "#evdCookies p a{color:#2563EB;font-weight:700;text-decoration:none;}" +
      "#evdCookies p a:hover{text-decoration:underline;}" +
      "#evdCookies .b{display:flex;gap:8px;flex-shrink:0;}" +
      "#evdCookies button{cursor:pointer;font-family:inherit;font-weight:700;font-size:13px;border-radius:8px;padding:7px 14px;white-space:nowrap;}" +
      "#evdCookies .si{border:0;background:linear-gradient(135deg,#4AA6F5,#2563EB);color:#fff;}" +
      "#evdCookies .no{background:transparent;color:#16202B;border:1.5px solid #DDD8CC;}" +
      "#evdCookies .no:hover{border-color:#2D5A7B;}";
    document.head.appendChild(css);

    var d = document.createElement("div");
    d.id = "evdCookies";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-label", "Aviso de cookies");
    d.innerHTML =
      "<p>Analítica (Google Analytics) y publicidad (Meta), solo si aceptas. <a href=\"/cookies.html\">Configurar</a></p>" +
      "<div class=\"b\"><button type=\"button\" class=\"si\">Aceptar</button><button type=\"button\" class=\"no\">Rechazar</button></div>";
    d.querySelector(".si").addEventListener("click", aceptar);
    d.querySelector(".no").addEventListener("click", rechazar);
    document.body.appendChild(d);
  }

  window.evdCookies = {
    abrir: banner,
    aceptar: aceptar,
    rechazar: rechazar,
    preferencias: preferencias,
    estado: estado
  };

  var c = estado();
  if (c) {
    aplicar(c);
  } else {
    // En la página de cookies se decide con sus propios controles
    if (/\/cookies(\.html)?$/.test(window.location.pathname)) return;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", banner);
    } else {
      banner();
    }
  }
})();
