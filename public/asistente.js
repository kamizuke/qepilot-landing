/* Asistente de dudas de evidran.com — widget autónomo (sin dependencias).
   Habla con /api/asistente. Si el endpoint no responde, degrada a mailto. */
(function () {
  "use strict";

  var MAX_USER_MSGS = 12;
  var history = []; // {role, content}
  var busy = false;

  var css = [
    "#evd-asst-btn{position:fixed;bottom:22px;right:22px;z-index:9000;display:flex;align-items:center;gap:9px;",
    "background:linear-gradient(135deg,#4AA6F5,#2563EB);color:#fff;border:0;border-radius:999px;padding:13px 20px;",
    "font-family:'Inter Tight',-apple-system,sans-serif;font-size:14.5px;font-weight:700;cursor:pointer;",
    "box-shadow:0 10px 26px rgba(37,99,235,.35);transition:transform .12s}",
    "#evd-asst-btn:hover{transform:translateY(-1px)}",
    "#evd-asst{position:fixed;bottom:22px;right:22px;z-index:9001;width:min(380px,calc(100vw - 28px));",
    "height:min(560px,calc(100vh - 60px));background:#fff;border:1px solid #DDD8CC;border-radius:16px;",
    "box-shadow:0 30px 70px rgba(22,32,43,.25);display:none;flex-direction:column;overflow:hidden;",
    "font-family:'Inter Tight',-apple-system,sans-serif}",
    "#evd-asst.open{display:flex}",
    "#evd-asst .hd{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;",
    "background:#F7F6F2;border-bottom:1px solid #EDEAE2}",
    "#evd-asst .hd b{font-size:15px;color:#16202B}",
    "#evd-asst .hd small{display:block;font-size:11.5px;color:#4A5563;font-weight:500}",
    "#evd-asst .hd button{border:0;background:transparent;font-size:20px;color:#4A5563;cursor:pointer;line-height:1}",
    "#evd-asst .log{flex:1;overflow-y:auto;padding:14px;background:#fff}",
    "#evd-asst .m{font-size:13.5px;line-height:1.5;padding:9px 12px;border-radius:12px;margin-bottom:9px;max-width:88%;white-space:pre-wrap;word-wrap:break-word}",
    "#evd-asst .m.ai{background:#F7F6F2;color:#16202B;border-bottom-left-radius:4px}",
    "#evd-asst .m.me{background:linear-gradient(135deg,#4AA6F5,#2563EB);color:#fff;margin-left:auto;border-bottom-right-radius:4px}",
    "#evd-asst .m.ai a{color:#2563EB}",
    "#evd-asst .draft{display:inline-block;margin:2px 0 9px;background:#fff;border:1.5px solid #2563EB;color:#2563EB;",
    "border-radius:10px;padding:9px 14px;font-size:13.5px;font-weight:700;text-decoration:none}",
    "#evd-asst .ft{display:flex;gap:8px;padding:11px;border-top:1px solid #EDEAE2;background:#F7F6F2}",
    "#evd-asst textarea{flex:1;resize:none;border:1px solid #DDD8CC;border-radius:10px;padding:9px 11px;",
    "font-family:inherit;font-size:13.5px;height:40px;outline:none}",
    "#evd-asst textarea:focus{border-color:#2563EB}",
    "#evd-asst .send{border:0;background:#2563EB;color:#fff;border-radius:10px;padding:0 15px;font-weight:700;cursor:pointer;font-size:14px}",
    "#evd-asst .send:disabled{opacity:.5;cursor:default}",
    "#evd-asst .note{font-size:10.5px;color:#8893A0;text-align:center;padding:0 12px 9px;background:#F7F6F2}",
    "@media (max-width:520px){#evd-asst{bottom:0;right:0;width:100vw;height:min(560px,85vh);border-radius:16px 16px 0 0}}"
  ].join("");

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var btn = document.createElement("button");
  btn.id = "evd-asst-btn";
  btn.type = "button";
  btn.innerHTML = "💬 ¿Dudas? Pregúntame";
  document.body.appendChild(btn);

  var panel = document.createElement("div");
  panel.id = "evd-asst";
  panel.innerHTML =
    '<div class="hd"><div><b>Asistente de Evidran</b><small>Respuestas al momento · con IA</small></div>' +
    '<button type="button" aria-label="Cerrar">×</button></div>' +
    '<div class="log"></div>' +
    '<div class="ft"><textarea rows="1" placeholder="Escribe tu duda…" maxlength="1400"></textarea>' +
    '<button class="send" type="button">→</button></div>' +
    '<div class="note">Asistente con IA: puede equivocarse. Para hablar con una persona: demo@evidran.com</div>';
  document.body.appendChild(panel);

  var log = panel.querySelector(".log");
  var input = panel.querySelector("textarea");
  var sendBtn = panel.querySelector(".send");

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Extrae [BORRADOR]…[/BORRADOR] y lo convierte en botón mailto.
  function render(text) {
    var m = text.match(/\[BORRADOR\]([\s\S]*?)\[\/BORRADOR\]/);
    var html = "";
    if (m) {
      var before = text.slice(0, m.index).trim();
      var after = text.slice(m.index + m[0].length).trim();
      var draft = m[1].trim();
      var subject = "Quiero una demo de Evidran";
      var lines = draft.split("\n");
      if (/^asunto\s*:/i.test(lines[0])) {
        subject = lines.shift().replace(/^asunto\s*:\s*/i, "").trim();
      }
      var body = lines.join("\n").trim();
      var href = "mailto:demo@evidran.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      if (before) html += esc(before) + "\n\n";
      html += '<a class="draft" href="' + href + '">✉️ Abrir el email en tu correo</a>';
      if (after) html += "\n" + esc(after);
      return html;
    }
    return esc(text);
  }

  function add(role, text, asHtml) {
    var div = document.createElement("div");
    div.className = "m " + (role === "user" ? "me" : "ai");
    if (asHtml) div.innerHTML = text; else div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function greet() {
    if (history.length) return;
    add("ai", "Hola 👋 Soy el asistente de Evidran. Pregúntame lo que quieras: qué hace, si encaja con tus normas, cómo funciona la prueba… Y si quieres una demo, te preparo el email en un momento.");
  }

  function userTurns() {
    return history.filter(function (m) { return m.role === "user"; }).length;
  }

  function send() {
    var text = input.value.trim();
    if (!text || busy) return;
    if (userTurns() >= MAX_USER_MSGS) {
      add("ai", "Creo que lo mejor es que sigamos por email para dedicarte el tiempo que mereces: escríbenos a demo@evidran.com 🙂");
      return;
    }
    input.value = "";
    add("user", text);
    history.push({ role: "user", content: text });
    busy = true;
    sendBtn.disabled = true;
    var typing = add("ai", "Escribiendo…");

    fetch("/api/asistente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        typing.remove();
        if (res.ok && res.d && res.d.reply) {
          history.push({ role: "assistant", content: res.d.reply });
          add("ai", render(res.d.reply), true);
        } else {
          add("ai", (res.d && res.d.error) || "Ahora mismo no puedo responder. Escríbenos a demo@evidran.com y te contestamos en persona.");
        }
      })
      .catch(function () {
        typing.remove();
        add("ai", "No consigo conectar. Escríbenos a demo@evidran.com y te contestamos en persona.");
      })
      .finally(function () {
        busy = false;
        sendBtn.disabled = false;
        input.focus();
      });
  }

  btn.addEventListener("click", function () {
    panel.classList.add("open");
    btn.style.display = "none";
    greet();
    input.focus();
  });
  panel.querySelector(".hd button").addEventListener("click", function () {
    panel.classList.remove("open");
    btn.style.display = "flex";
  });
  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  });
})();
