/* Evidran · consentimiento de cookies (Google Analytics solo tras aceptar) */
(function () {
  var KEY = "evd_consent_v1";
  var GA_ID = "G-W6Q6L17YS9";
  var UN_ANO = 365 * 24 * 3600 * 1000;

  function estado() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!v || !v.c || (Date.now() - v.t) > UN_ANO) return null;
      return v.c;
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

  function quitarBanner() {
    var b = document.getElementById("evdCookies");
    if (b) b.remove();
  }
  function aceptar() { guardar("granted"); cargarGA(); quitarBanner(); }
  function rechazar() { guardar("denied"); quitarBanner(); }

  function banner() {
    if (document.getElementById("evdCookies")) return;
    var css = document.createElement("style");
    css.textContent =
      "#evdCookies{position:fixed;left:16px;right:16px;bottom:16px;z-index:200;max-width:560px;margin:0 auto;" +
      "background:#fff;border:1px solid #DDD8CC;border-radius:16px;box-shadow:0 24px 60px rgba(22,32,43,.22);" +
      "padding:18px 20px;font-family:'Inter Tight',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}" +
      "#evdCookies p{margin:0 0 12px;font-size:13.5px;line-height:1.55;color:#4A5563;}" +
      "#evdCookies p a{color:#2563EB;font-weight:700;text-decoration:none;}" +
      "#evdCookies p a:hover{text-decoration:underline;}" +
      "#evdCookies .b{display:flex;gap:10px;flex-wrap:wrap;}" +
      "#evdCookies button{cursor:pointer;font-family:inherit;font-weight:700;font-size:13.5px;border-radius:10px;padding:10px 18px;}" +
      "#evdCookies .si{border:0;background:linear-gradient(135deg,#4AA6F5,#2563EB);color:#fff;}" +
      "#evdCookies .no{background:transparent;color:#16202B;border:1.5px solid #DDD8CC;}" +
      "#evdCookies .no:hover{border-color:#2D5A7B;}";
    document.head.appendChild(css);

    var d = document.createElement("div");
    d.id = "evdCookies";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-label", "Aviso de cookies");
    d.innerHTML =
      "<p>Usamos una cookie de analítica (Google Analytics) para saber qué partes de la web ayudan y cuáles no. Solo se activa si aceptas. <a href=\"/cookies.html\">Más información</a></p>" +
      "<div class=\"b\"><button type=\"button\" class=\"si\">Aceptar</button><button type=\"button\" class=\"no\">Rechazar</button></div>";
    d.querySelector(".si").addEventListener("click", aceptar);
    d.querySelector(".no").addEventListener("click", rechazar);
    document.body.appendChild(d);
  }

  window.evdCookies = { abrir: banner, aceptar: aceptar, rechazar: rechazar, estado: estado };

  var c = estado();
  if (c === "granted") {
    cargarGA();
  } else if (c === null) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", banner);
    } else {
      banner();
    }
  }
})();
