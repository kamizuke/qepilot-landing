(function () {
  "use strict";

  // ---------- Estado y utilidades ----------
  var S = { clave: sessionStorage.getItem("agendaClave") || "", rol: null, d: null, vista: "llamar", reserva: null };
  var ZONA = "Europe/Madrid";
  var fDia = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" });
  var fHora = new Intl.DateTimeFormat("es-ES", { timeZone: ZONA, hour: "2-digit", minute: "2-digit" });
  var fFecha = new Intl.DateTimeFormat("es-ES", { timeZone: ZONA, weekday: "long", day: "numeric", month: "long" });
  var fFechaCorta = new Intl.DateTimeFormat("es-ES", { timeZone: ZONA, day: "numeric", month: "short" });
  var DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  function $(id) { return document.getElementById(id); }
  function diaDe(f) { return fDia.format(new Date(f)); }
  function hoy() { return diaDe(new Date()); }
  function cuando(f) { var d = new Date(f); return fFecha.format(d).replace(",", "") + ", " + fHora.format(d); }
  function relativo(f) {
    if (!f) return "";
    var d = diaDe(f), t = hoy();
    var ayer = diaDe(Date.now() - 86400000);
    var hora = fHora.format(new Date(f));
    if (d === t) return "hoy " + hora;
    if (d === ayer) return "ayer " + hora;
    return fFechaCorta.format(new Date(f)) + " " + hora;
  }

  // Crea nodos sin innerHTML: los datos de los contactos nunca se interpretan como HTML.
  function h(tag, props) {
    var el = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "class") el.className = v;
      else if (k.indexOf("on") === 0) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    });
    for (var i = 2; i < arguments.length; i++) anadir(el, arguments[i]);
    return el;
  }
  function anadir(el, hijo) {
    if (hijo === null || hijo === undefined || hijo === false) return;
    if (Array.isArray(hijo)) { hijo.forEach(function (x) { anadir(el, x); }); return; }
    el.appendChild(typeof hijo === "string" || typeof hijo === "number" ? document.createTextNode(String(hijo)) : hijo);
  }
  function vaciar(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

  var tToast;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.remove("oculto");
    clearTimeout(tToast);
    tToast = setTimeout(function () { t.classList.add("oculto"); }, 3500);
  }

  function api(cuerpo) {
    return fetch("/api/agenda/trabajo", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-clave": S.clave },
      body: JSON.stringify(cuerpo),
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 401) { salir(); throw new Error(j.error || "Clave incorrecta."); }
        if (!r.ok) throw new Error(j.error || "Error " + r.status);
        return j;
      });
    });
  }

  // Pidió que le llamaran (calculadora de huella) y aún no se le ha llamado desde entonces.
  function esCaliente(c) {
    return !!c.caliente_desde && !c.no_llamar && (!c.ultima_llamada || c.ultima_llamada < c.caliente_desde);
  }

  function etiquetaResultado(c) {
    if (c.no_llamar) return h("span", { class: "etiqueta fuera" }, "No llamar");
    if (esCaliente(c)) return h("span", { class: "etiqueta demo" }, "Pidió que le llamaran");
    if (!c.resultado) return h("span", { class: "etiqueta" }, "Sin llamar");
    var clase = c.resultado === "demo" ? "demo" : c.resultado === "volver" ? "volver" : "";
    var txt = S.d.resultados[c.resultado];
    if (c.resultado === "volver" && c.volver_en) txt += " · " + relativo(c.volver_en);
    return h("span", { class: "etiqueta " + clase }, txt);
  }

  // ---------- Entrada ----------
  function entrar() {
    var clave = $("clave").value.trim();
    if (!clave) return;
    S.clave = clave;
    $("puerta-error").textContent = "";
    api({ accion: "entrar" }).then(function (j) {
      sessionStorage.setItem("agendaClave", clave);
      arrancar(j.rol, j.nombre, j.claveCorta);
    }).catch(function (e) { $("puerta-error").textContent = e.message; });
  }
  function salir() {
    sessionStorage.removeItem("agendaClave");
    S.clave = ""; S.rol = null;
    $("app").classList.add("oculto");
    $("cab-sesion").classList.add("oculto");
    $("puerta").classList.remove("oculto");
  }
  function arrancar(rol, nombre, claveCorta) {
    S.rol = rol;
    $("aviso-clave").classList.toggle("oculto", !claveCorta);
    $("puerta").classList.add("oculto");
    $("app").classList.remove("oculto");
    $("cab-sesion").classList.remove("oculto");
    $("cab-rol").textContent = rol === "admin" ? "Administración" : nombre || "Setter";
    document.querySelectorAll(".solo-admin").forEach(function (el) { el.classList.toggle("oculto", rol !== "admin"); });
    pintarPestanas();
    recargar();
  }

  // ---------- Pestañas ----------
  function pintarPestanas() {
    var lista = [["llamar", "Llamar"], ["guion", "Guion"], ["contactos", "Contactos"], ["agenda", "Agenda"], ["resumen", "Resumen"]];
    if (S.rol === "admin") {
      var porEnviar = S.d ? S.d.contactos.filter(function (c) { return infoPendiente(c) || linkedinPendiente(c); }).length : 0;
      lista.push(["envios", "Envíos" + (porEnviar ? " (" + porEnviar + ")" : "")], ["ajustes", "Ajustes"]);
    }
    var nav = vaciar($("pestanas"));
    lista.forEach(function (p) {
      nav.appendChild(h("button", { role: "tab", "aria-selected": String(S.vista === p[0]), onclick: function () { S.vista = p[0]; pintarPestanas(); pintar(); } }, p[1]));
    });
    document.querySelectorAll(".vista").forEach(function (v) { v.classList.toggle("oculto", v.id !== "v-" + S.vista); });
  }

  function recargar() {
    return api({ accion: "estado" }).then(function (d) { S.d = d; pintar(); }).catch(function (e) { toast(e.message); });
  }

  function pintar() {
    if (!S.d) return;
    pintarLlamar();
    pintarContactos();
    pintarAgenda();
    pintarResumen();
    pintarGuionEditado();
    if (S.rol === "admin") { pintarAjustes(); pintarPersonas(); pintarEnvios(); pintarPestanas(); }
  }

  // ---------- Llamar ----------
  function enCola(c) {
    if (c.no_llamar) return null;
    if (esCaliente(c)) return { grupo: -1, orden: c.caliente_desde };
    var r = c.resultado;
    if (r === "volver") {
      if (!c.volver_en || diaDe(c.volver_en) <= hoy()) return { grupo: 0, orden: c.volver_en || "" };
      return { grupo: 4, orden: c.volver_en };
    }
    if (!r) return { grupo: 1, orden: c.creado_en };
    if (r === "no_contesta" || r === "no_esta") {
      if (c.intentos >= 3) return null;
      if (c.ultima_llamada && diaDe(c.ultima_llamada) === hoy()) return { grupo: 3, orden: c.ultima_llamada };
      return { grupo: 2, orden: c.ultima_llamada || "" };
    }
    return null;
  }

  // Toda la fila abre la ficha; «Abrir» se queda como pista visual.
  function filaContacto(c, extra) {
    function abrir() { abrirFicha(c.id); }
    return h("div", {
      class: "contacto clic", role: "button", tabindex: "0", "aria-label": "Abrir la ficha de " + c.empresa,
      onclick: abrir,
      onkeydown: function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); abrir(); } },
    },
      h("div", null,
        h("div", { class: "quien" }, c.empresa),
        h("div", { class: "det" }, [c.persona, c.cargo].filter(Boolean).join(" · ") || "Sin persona", c.telefono ? " · " + c.telefono : ""),
        extra ? h("div", { class: "det" }, extra) : null,
        etiquetaEnvio(c) ? h("div", { class: "det" }, etiquetaEnvio(c)) : null,
        etiquetaLinkedin(c) ? h("div", { class: "det" }, etiquetaLinkedin(c)) : null,
        etiquetaMensaje(c) ? h("div", { class: "det" }, etiquetaMensaje(c)) : null),
      h("span", { class: "boton mini", "aria-hidden": "true" }, "Abrir"));
  }

  function pintarLlamar() {
    var r = S.d.resumen;
    var ver = S.rol === "admin" ? $("llamar-ver").value : "todas";
    var base = S.d.contactos.filter(function (c) {
      if (ver === "mios") return !!c.setter_id && c.setter_id === idMio();
      if (ver === "sin") return !c.setter_id;
      return true;
    });
    var cola = base.map(function (c) { return { c: c, q: enCola(c) }; }).filter(function (x) { return x.q; });
    cola.sort(function (a, b) { return a.q.grupo - b.q.grupo || (a.q.orden < b.q.orden ? -1 : a.q.orden > b.q.orden ? 1 : 0); });
    var cif = vaciar($("llamar-cifras"));
    cif.appendChild(h("div", { class: "cifra" }, h("b", null, r.llamadasSetterHoy), h("span", null, "Llamadas de hoy")));
    cif.appendChild(h("div", { class: "cifra" }, h("b", null, r.llamadasSetter), h("span", null, "Llamadas registradas en total")));
    cif.appendChild(h("div", { class: "cifra" }, h("b", null, r.demosProximas), h("span", null, "Demos próximas")));
    cif.appendChild(h("div", { class: "cifra" }, h("b", null, cola.filter(function (x) { return x.q.grupo < 3; }).length), h("span", null, "Por llamar")));

    var caja = vaciar($("cola"));
    var titulos = { "-1": "Pidieron que les llamaras (calculadora de huella)", 0: "Te pidieron que llamaras hoy", 1: "Sin llamar todavía", 2: "No contestaron otro día", 3: "Ya intentados hoy", 4: "Programados para otro día" };
    if (!S.d.contactos.length) { caja.appendChild(h("div", { class: "vacio" }, "Aún no hay contactos cargados.")); return; }
    if (ver === "mios" && !base.length) { caja.appendChild(h("div", { class: "vacio" }, "Todavía no te has quedado ningún contacto. Abre uno y, en «Quién la llama», elige «Me lo quedo».")); return; }
    if (!cola.length) { caja.appendChild(h("div", { class: "vacio" }, "No queda nadie por llamar. Buen trabajo.")); return; }
    [-1, 0, 1, 2, 3, 4].forEach(function (g) {
      var del = cola.filter(function (x) { return x.q.grupo === g; });
      if (!del.length) return;
      var lista = h("div", null, del.map(function (x) {
        var c = x.c, extra = null;
        if (g === -1) {
          var nota = c.origen && c.origen.indexOf("Calculadora") === 0 ? c.origen
            : (c.notas || "").split("\n").filter(function (l) { return l.indexOf("Calculadora") >= 0; }).pop();
          extra = (nota || "Pidió que le llamaran") + " · " + relativo(c.caliente_desde);
        }
        if (g === 0) extra = c.volver_en ? "Pidió que le llamaras " + relativo(c.volver_en) : "Pidió que le volvieras a llamar";
        if (g === 2 || g === 3) extra = "Intento " + (c.intentos + 1) + " de 3 · último " + relativo(c.ultima_llamada);
        if (g === 4) extra = "Llamar el " + cuando(c.volver_en);
        return filaContacto(c, extra);
      }));
      if (g >= 3) caja.appendChild(h("details", null, h("summary", null, titulos[g] + " (" + del.length + ")"), lista));
      else { caja.appendChild(h("h3", null, titulos[g] + " (" + del.length + ")")); caja.appendChild(lista); }
    });
  }

  // ---------- Ficha ----------
  function abrirFicha(id, notaInicial) {
    var c = S.d.contactos.find(function (x) { return x.id === id; });
    if (!c) return;
    var cuerpo = vaciar($("ficha-cuerpo"));
    var marcaEnvio = h("span", { class: "etiquetas" }, etiquetaEnvio(c), etiquetaMensaje(c));
    var bloqueHistorial = h("div", null, historialDe(c));
    var nota = h("textarea", { id: "f-nota", maxlength: "600", placeholder: "Qué te ha dicho: programa que usan, consultora, próxima auditoría…" });
    var volverFila = h("div", { class: "volver-pendiente oculto" });
    var manana = new Date(Date.now() + 86400000);
    var volverInput = h("input", { type: "datetime-local", value: diaDe(manana) + "T10:00" });
    anadir(volverFila, [
      h("label", { style: "margin-top:0" }, "¿Cuándo le vuelves a llamar?"),
      h("div", { class: "fila" }, volverInput,
        h("button", { class: "boton", onclick: function () { guardarLlamada(c, "volver", nota.value, volverInput.value); } }, "Guardar «Volver a llamar»")),
      h("div", { class: "peq", style: "margin-top:6px" }, "Todavía no está guardado: elige día y hora y pulsa el botón.")]);
    var infoFila = h("div", { class: "volver-pendiente oculto" });
    var infoInput = h("input", { type: "email", value: c.email || "", placeholder: "correo@empresa.com", style: "flex:1 1 220px" });
    anadir(infoFila, [
      h("label", { style: "margin-top:0" }, "¿A qué correo le enviamos la información?"),
      h("div", { class: "fila" }, infoInput,
        h("button", { class: "boton", onclick: function () { guardarLlamada(c, "info", nota.value, null, infoInput.value); } }, "Guardar «Info por correo»")),
      h("div", { class: "peq", style: "margin-top:6px" }, "Se guarda en el contacto y llega un aviso para enviársela. Si no quiso darlo, déjalo vacío y pulsa el botón.")]);
    nota.value = notaInicial || "";
    var datos = formularioDatos(c, function () { return nota.value; });
    // Lo que se perdería al cerrar: la nota, el «volver a llamar» a medias o datos corregidos sin guardar.
    S.fichaPendiente = function () {
      return !!nota.value.trim() || !volverFila.classList.contains("oculto") || !infoFila.classList.contains("oculto") || datos.cambiado();
    };

    var botones = h("div", { class: "resultados" });
    botones.appendChild(h("button", { class: "boton", onclick: function () { var n = nota.value.trim(); cerrarFicha(true); abrirReserva(c, n); } }, "Demo agendada"));
    Object.keys(S.d.resultados).forEach(function (k) {
      if (k === "demo") return;
      botones.appendChild(h("button", { class: "boton claro", onclick: function () {
        if (k === "info") {
          infoFila.classList.remove("oculto");
          infoFila.scrollIntoView({ block: "nearest", behavior: "smooth" });
          infoInput.focus();
          return;
        }
        if (k === "volver") {
          volverFila.classList.remove("oculto");
          volverFila.scrollIntoView({ block: "nearest", behavior: "smooth" });
          volverInput.focus();
          return;
        }
        if (k === "no_llamar" && !confirm("¿Ha pedido que no le llamemos? No se le volverá a llamar.")) return;
        guardarLlamada(c, k, nota.value, null);
      } }, S.d.resultados[k]));
    });

    var web = c.web ? (/^https?:\/\//i.test(c.web) ? c.web : "https://" + c.web) : null;
    var tel = (c.telefono || "").replace(/[^\d+]/g, "");

    anadir(cuerpo, [
      h("div", { class: "dlg-cab" },
        h("div", null, h("h2", { style: "margin:0" }, c.empresa),
          h("div", { class: "suave" }, [c.persona, c.cargo].filter(Boolean).join(" · ") || "Sin persona identificada")),
        h("button", { class: "cerrar", "aria-label": "Cerrar", onclick: function () { cerrarFicha(); } }, "×")),
      h("div", { class: "fila mt" },
        c.telefono ? h("a", { class: "telefono", href: "tel:" + tel, style: "color:var(--ink);text-decoration:none" }, c.telefono) : h("span", { class: "suave" }, "Sin teléfono"),
        etiquetaResultado(c),
        marcaEnvio),
      h("div", { class: "peq suave", style: "margin-top:6px" },
        [c.ciudad, c.email].filter(Boolean).join(" · "),
        web ? h("span", null, (c.ciudad || c.email ? " · " : ""), h("a", { href: web, target: "_blank", rel: "noopener" }, c.web)) : null),
      c.origen ? h("div", { class: "peq", style: "margin-top:6px" }, "Por qué encaja: ", c.origen) : null,
      lineaCertificacion(c),
      bloqueLinkedin(c),
      c.notas ? h("div", { class: "cita" }, h("div", { class: "notas" }, c.notas)) : null,
      chuleta(c),
      h("h3", null, "Esta llamada"),
      nota,
      botones,
      volverFila,
      infoFila,
      S.rol === "admin" ? envioEnFicha(c, function (x) {
        anadir(vaciar(marcaEnvio), [etiquetaEnvio(x), etiquetaMensaje(x)]);
        anadir(vaciar(bloqueHistorial), historialDe(x));
      }) : null,
      bloqueHistorial,
      S.rol === "admin" ? asignacion(c) : null,
      datos,
    ]);
    $("ficha").showModal();
  }

  // Llamadas y envíos, lo más reciente arriba. De cada canal se guarda solo el
  // último envío. La setter no recibe el del correo ni ningún texto.
  function historialDe(c) {
    var eventos = c.historial.slice();
    if (c.info_enviada_en) eventos.push({ hechaEn: c.info_enviada_en, envio: "Info por correo enviada" + (c.info_texto ? " · texto guardado" : "") });
    if (c.linkedin_enviado_en) eventos.push({ hechaEn: c.linkedin_enviado_en, envio: "Mensaje por LinkedIn enviado" + (c.linkedin_texto ? " · texto guardado" : "") });
    if (!eventos.length) return null;
    eventos.sort(function (a, b) { return new Date(b.hechaEn) - new Date(a.hechaEn); });
    return h("div", null, h("h3", null, "Historial (" + eventos.length + ")"),
      h("ul", { class: "historial" }, eventos.map(function (l) {
        if (l.envio) return h("li", null, relativo(l.hechaEn) + " · " + l.envio);
        return h("li", null, relativo(l.hechaEn) + " · " + (S.d.resultados[l.resultado] || l.resultado) + (S.rol === "admin" || l.rol === "admin" ? " · " + l.quien : ""), l.nota ? h("div", { class: "suave" }, l.nota) : null);
      })));
  }

  var NORMAS = [["vence_9001", "ISO 9001"], ["vence_14001", "ISO 14001"], ["vence_45001", "ISO 45001"]];
  // Los vencimientos son un día sin hora: no pasan por la zona horaria.
  function fechaDia(f) { return f.split("-").reverse().join("/"); }
  // Los que vencen de hoy a 6 meses, el más cercano primero. Los ya vencidos no entran.
  function vencimientosProximos(c) {
    var limite = new Date();
    limite.setMonth(limite.getMonth() + 6);
    return NORMAS.filter(function (n) { return c[n[0]] && c[n[0]] >= hoy() && c[n[0]] <= diaDe(limite); })
      .map(function (n) { return { norma: n[1], fecha: c[n[0]] }; })
      .sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
  }
  // Solo lo que se sepa.
  function lineaCertificacion(c) {
    var partes = c.certificadora ? ["Certificadora: " + c.certificadora] : [];
    NORMAS.forEach(function (n) {
      var f = c[n[0]];
      if (f) partes.push(n[1] + (f < hoy() ? " venció el " : " vence el ") + fechaDia(f));
    });
    return partes.length ? h("div", { class: "peq", style: "margin-top:6px" }, partes.join(" · ")) : null;
  }

  // Conexión de Lissette con la empresa en LinkedIn. El estado se guarda al
  // momento y sin rehacer la ficha, para no perder lo que se esté escribiendo.
  var ESTADOS_LINKEDIN = { invitacion: "Invitación enviada", contacto: "Somos contactos" };
  function etiquetaLinkedin(c) {
    if (!ESTADOS_LINKEDIN[c.linkedin_estado]) return null;
    return h("span", { class: "etiqueta " + (c.linkedin_estado === "contacto" ? "demo" : "volver") }, "LinkedIn: " + ESTADOS_LINKEDIN[c.linkedin_estado].toLowerCase());
  }
  function bloqueLinkedin(c) {
    var enlace = c.linkedin_empresa
      ? h("a", { href: c.linkedin_empresa, target: "_blank", rel: "noopener" }, "Página de la empresa en LinkedIn")
      : h("a", { href: "https://www.linkedin.com/search/results/companies/?keywords=" + encodeURIComponent(c.empresa.replace(/[,\s]+s\.?\s?[la]\.?(\s?u\.?)?\s*(\(unipersonal\))?\s*$/i, "")), target: "_blank", rel: "noopener" }, "Buscar la empresa en LinkedIn");
    if (S.rol !== "admin") {
      var conQuien = [c.linkedin_contacto, c.linkedin_cargo].filter(Boolean).join(", ");
      return h("div", { class: "peq", style: "margin-top:6px" }, enlace,
        ESTADOS_LINKEDIN[c.linkedin_estado] ? " · " + ESTADOS_LINKEDIN[c.linkedin_estado] : null, conQuien ? " · Contacto: " + conQuien : null);
    }
    var estado = h("select", { "aria-label": "Conexión en LinkedIn con " + c.empresa, style: "width:auto", onchange: function () {
      var valor = estado.value;
      quien.style.display = valor ? "" : "none";
      api({ accion: "editar_contacto", id: c.id, campos: { linkedin_estado: valor } }).then(function () {
        c.linkedin_estado = valor || null;
        toast("LinkedIn guardado.");
        recargar();
      }).catch(function (e) {
        estado.value = c.linkedin_estado || "";
        quien.style.display = estado.value ? "" : "none";
        toast(e.message);
      });
    } },
      h("option", { value: "" }, "Sin conectar"),
      Object.keys(ESTADOS_LINKEDIN).map(function (k) { return h("option", { value: k }, ESTADOS_LINKEDIN[k]); }));
    estado.value = c.linkedin_estado || "";
    var quien = h("div", { class: "rejilla2", style: c.linkedin_estado ? "" : "display:none" },
      campoLinkedin(c, "linkedin_contacto", "Persona en LinkedIn"),
      campoLinkedin(c, "linkedin_cargo", "Cargo"));
    return h("div", { class: "peq", style: "margin-top:6px" }, h("div", { class: "fila" }, enlace, estado), quien);
  }
  function campoLinkedin(c, campo, rotulo) {
    var entrada = h("input", { type: "text", maxlength: "120", value: c[campo] || "", onchange: function () {
      var valor = entrada.value.trim();
      api({ accion: "editar_contacto", id: c.id, campos: { [campo]: valor } }).then(function () {
        c[campo] = valor || null;
        entrada.value = valor;
        toast("LinkedIn guardado.");
      }).catch(function (e) { entrada.value = c[campo] || ""; toast(e.message); });
    } });
    return h("div", null, h("label", null, rotulo), entrada);
  }

  function formularioDatos(c, notaDeLlamada) {
    var campos = [["persona", "Persona", "text"], ["cargo", "Cargo", "text"], ["telefono", "Teléfono", "tel"], ["email", "Correo", "email"]];
    if (S.rol === "admin") campos = [["empresa", "Empresa", "text"]].concat(campos, [["web", "Web", "text"], ["linkedin_empresa", "Página de empresa en LinkedIn", "url"], ["ciudad", "Ciudad", "text"], ["origen", "Por qué encaja", "text"]]);
    campos = campos.concat([["certificadora", "Certificadora", "text"]], NORMAS.map(function (n) { return [n[0], "Vencimiento " + n[1], "date"]; }));
    var inputs = {};
    var rejilla = h("div", { class: "rejilla2" }, campos.map(function (f) {
      inputs[f[0]] = h("input", { type: f[2], value: c[f[0]] || "" });
      return h("div", null, h("label", null, f[1]), inputs[f[0]]);
    }));
    inputs.notas = h("textarea", null);
    inputs.notas.value = c.notas || "";
    var aviso = h("div", { class: "aviso" });
    var bloque = h("details", null, h("summary", null, "Corregir datos, certificación o notas de la empresa"),
      rejilla, h("label", null, "Notas de la empresa"), inputs.notas, aviso,
      h("div", { class: "fila mt" },
        h("button", { class: "boton claro", onclick: function () {
          var cambios = {};
          Object.keys(inputs).forEach(function (k) { if ((inputs[k].value || "") !== (c[k] || "")) cambios[k] = inputs[k].value; });
          if (!Object.keys(cambios).length) { aviso.textContent = "No hay cambios."; return; }
          api({ accion: "editar_contacto", id: c.id, campos: cambios }).then(function () {
            toast("Datos guardados.");
            return recargar().then(function () { abrirFicha(c.id, notaDeLlamada()); });
          }).catch(function (e) { aviso.className = "aviso mal"; aviso.textContent = e.message; });
        } }, "Guardar datos"),
        S.rol === "admin" ? h("button", { class: "boton peligro", onclick: function () {
          if (!confirm("¿Borrar " + c.empresa + " y sus datos? Los intentos ya hechos siguen contando, sin datos personales.")) return;
          api({ accion: "borrar_contacto", id: c.id }).then(function () { cerrarFicha(true); toast("Contacto borrado."); recargar(); }).catch(function (e) { toast(e.message); });
        } }, "Borrar contacto") : null));
    bloque.cambiado = function () {
      return Object.keys(inputs).some(function (k) { return (inputs[k].value || "") !== (c[k] || ""); });
    };
    return bloque;
  }

  function guardarLlamada(c, resultado, nota, volverEn, email) {
    api({ accion: "llamada", contactoId: c.id, resultado: resultado, nota: nota, volverEn: volverEn, email: email }).then(function (j) {
      cerrarFicha(true);
      toast(j.corregida
        ? "Ya estaba anotado hace un momento: se ha actualizado, no cuenta como otra llamada."
        : "Anotado: " + S.d.resultados[resultado] + "." + (resultado === "info" && j.aviso ? " Ha salido el aviso para enviársela." : ""));
      recargar();
    }).catch(function (e) { toast(e.message); });
  }

  function cerrar(id) { var d = $(id); if (d.open) d.close(); }

  // Cerrar la ficha avisando si se perdería algo escrito. `forzar`: tras guardar.
  function cerrarFicha(forzar) {
    if (!forzar && S.fichaPendiente && S.fichaPendiente() &&
      !confirm("Hay cambios sin guardar en esta ficha (la nota de la llamada, el «volver a llamar» o los datos). ¿Cerrar sin guardar?")) return;
    S.fichaPendiente = null;
    cerrar("ficha");
  }
  // La tecla Escape también pasa por el aviso.
  $("ficha").addEventListener("cancel", function (ev) { ev.preventDefault(); cerrarFicha(); });
  document.querySelectorAll("[data-cierra]").forEach(function (b) { b.addEventListener("click", function () { cerrar(b.getAttribute("data-cierra")); }); });

  // ---------- Reservar ----------
  function abrirReserva(c, notaLlamada) {
    S.reserva = { contacto: c || null, inicio: null };
    $("r-titulo").textContent = c ? "Agendar demo · " + c.empresa : "Agendar demo";
    $("r-nombre").value = c ? c.persona || "" : "";
    $("r-empresa").value = c ? c.empresa : "";
    $("r-email").value = c ? c.email || "" : "";
    $("r-telefono").value = c ? c.telefono || "" : "";
    $("r-notas").value = [c ? c.notas : "", notaLlamada].filter(Boolean).join("\n");
    $("r-error").textContent = "";
    $("r-formulario").classList.remove("oculto");
    $("r-hecho").classList.add("oculto");
    $("r-reservar").disabled = false;
    var caja = vaciar($("r-huecos"));
    caja.appendChild(h("div", { class: "vacio" }, "Cargando huecos…"));
    $("reserva").showModal();
    api({ accion: "huecos" }).then(function (j) { pintarHuecos(j.huecos); }).catch(function (e) { vaciar(caja).appendChild(h("div", { class: "aviso mal" }, e.message)); });
  }

  function pintarHuecos(huecos) {
    var caja = vaciar($("r-huecos"));
    if (!huecos.length) { caja.appendChild(h("div", { class: "vacio" }, "No quedan huecos libres en los próximos días. Avisa para que se abran más.")); return; }
    var porDia = {};
    huecos.forEach(function (x) { var d = diaDe(x.inicio); (porDia[d] = porDia[d] || []).push(x); });
    Object.keys(porDia).forEach(function (d) {
      caja.appendChild(h("div", { class: "dia-huecos" },
        h("div", { class: "nombre-dia" }, fFecha.format(new Date(porDia[d][0].inicio))),
        h("div", { class: "horas" }, porDia[d].map(function (x) {
          return h("button", { type: "button", "aria-pressed": "false", "data-inicio": x.inicio, onclick: function (ev) {
            caja.querySelectorAll("button[aria-pressed]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
            ev.currentTarget.setAttribute("aria-pressed", "true");
            S.reserva.inicio = x.inicio;
          } }, fHora.format(new Date(x.inicio)));
        }))));
    });
  }

  $("r-reservar").addEventListener("click", function () {
    var err = $("r-error");
    err.textContent = "";
    if (!S.reserva.inicio) { err.textContent = "Elige un día y una hora."; return; }
    var cuerpo = {
      accion: "reservar",
      inicio: S.reserva.inicio,
      nombre: $("r-nombre").value,
      empresa: $("r-empresa").value,
      email: $("r-email").value,
      telefono: $("r-telefono").value,
      notas: $("r-notas").value,
      contactoId: S.reserva.contacto ? S.reserva.contacto.id : null,
    };
    if (!cuerpo.nombre.trim() || !cuerpo.email.trim()) { err.textContent = "Faltan el nombre y el correo."; return; }
    $("r-reservar").disabled = true;
    api(cuerpo).then(function (j) {
      $("r-formulario").classList.add("oculto");
      $("r-hecho").classList.remove("oculto");
      $("r-hecho-texto").textContent = "Demo reservada para el " + cuando(cuerpo.inicio) + ". " +
        (j.correo ? "La invitación ha salido a " + cuerpo.email.trim() + "." : "Ojo: la demo está reservada, pero el correo no ha salido. Avisa para que se le envíe a mano.");
      recargar();
    }).catch(function (e) {
      $("r-reservar").disabled = false;
      err.textContent = e.message;
      if (/ocupado|bloqueado/.test(e.message)) api({ accion: "huecos" }).then(function (j) { S.reserva.inicio = null; pintarHuecos(j.huecos); });
    });
  });

  // ---------- Guion ----------
  var OBJECIONES = [
    ["«No tengo tiempo.»", "«Por eso te lo propongo corto: 30 minutos. Y si a los diez ves que no te encaja, lo dejamos ahí.»"],
    ["«Mándame información por correo.»", "«Claro, ¿a qué correo? Y para que no se quede en un PDF más, ¿te dejo reservados 30 minutos el [día]? Si al leerlo no te interesa, lo cancelas.»"],
    ["«Ya tenemos un programa.»", "«¿Cuál usáis? (apúntalo). Muchos sirven para archivar. Evidran te entrevista al registrar cada no conformidad y no acepta “error humano” como causa. Merece la pena compararlo en 30 minutos.» Si no hay forma, pulsa «Ya tienen o desarrollan la suya»."],
    ["«Lo estamos desarrollando nosotros.»", "«Tiene mérito. ¿Qué parte os está costando más? En 30 minutos ves cómo lo resuelve Evidran y te sirve para comparar con lo vuestro, sin compromiso.» Si no hay forma, pulsa «Ya tienen o desarrollan la suya»."],
    ["«Con Excel nos va bien.»", "«Lo entiendo. Excel no te avisa cuando una acción se pasa de plazo ni te dice qué problemas se repiten. Eso es lo que verías en la demo.»"],
    ["«Ya uso ChatGPT para redactar.»", "«Ayuda a redactar, pero el informe se queda en un chat suelto. En Evidran cada no conformidad queda registrada, con responsable, plazo y aviso cuando vence.»"],
    ["«Nos lo lleva una consultora.»", "«Perfecto, la demo también le sirve a tu consultor. ¿Le invitamos? ¿Cómo se llama la consultora?» (Apúntalo siempre.)"],
    ["«¿Cuánto cuesta?»", "«Ahora mismo nada: es una prueba gratis de 30 días, sin tarjeta. Si después quieres seguir, en la demo te explican el precio: es anual por empresa, no por usuario.»"],
    ["«¿Esto es inteligencia artificial? No me fío.»", "«La herramienta no decide por ti. Te pregunta y redacta a partir de lo que tú cuentas. El criterio sigue siendo tuyo.»"],
    ["«Esto no lo decido yo.»", "«¿Quién lo decide? ¿Os encaja conectaros los dos a la demo?»"],
    ["«Llámame en otro momento.»", "«Claro. ¿Qué día y a qué hora te viene bien?» (Pulsa «Volver a llamar» y pon ese día.)"],
    ["«No me interesa.»", "«Entendido. Una sola pregunta antes de colgar: ¿cómo registráis hoy las no conformidades?» Si repite que no, agradece y cuelga."],
    ["«No me llaméis más.»", "«Entendido, no te volveremos a llamar. Gracias.» Márcalo como «No llamar»: es obligatorio respetarlo."],
  ];
  var CUANDO = {
    demo: "Ha aceptado día y hora (se anota sola al reservar).",
    volver: "Te ha pedido otro momento. Pon día y hora.",
    info: "Solo quiere información: pulsa «Info por correo», escribe su correo y guarda. Llega un aviso para enviársela.",
    no_contesta: "Nadie coge el teléfono o salta el buzón.",
    no_esta: "Ya no trabaja allí o no te pasan. Apunta quién la sustituye.",
    no_interesa: "Ha dicho que no tras tu respuesta. Apunta el motivo.",
    herramienta_propia: "Ya usan un programa de calidad o lo están desarrollando ellos. Apunta cuál, si lo dice.",
    no_encaja: "No tienen ISO ni piensan tenerla, o la empresa no es lo que parecía.",
    no_llamar: "Ha pedido que no le llamemos. No se vuelve a contactar.",
    erroneo: "El número no existe o no es de la empresa.",
  };
  var NOMBRES_RESULTADO = { demo: "Demo agendada", volver: "Volver a llamar", info: "Info por correo", no_contesta: "No contesta", no_esta: "No está la persona", no_interesa: "No interesa", herramienta_propia: "Ya tienen o desarrollan la suya", no_encaja: "No encaja", no_llamar: "No llamar", erroneo: "Teléfono erróneo" };

  var GANANCIAS = [
    ["Lo hace todo a mano o va justo de tiempo", "«Te ahorras pelearte con la plantilla: cuentas qué ha pasado y el informe sale redactado. Ese rato vuelve a tu trabajo de verdad.»"],
    ["Le preocupa la auditoría", "«Cada no conformidad queda con su responsable, su plazo y su evidencia, y sabes qué te falta antes de que llegue el auditor.»"],
    ["Las causas se quedan en «error humano» o «falta de formación»", "«Te hace las preguntas que haría un auditor y no te deja quedarte en “error humano”. Las causas llegan mucho más trabajadas.»"],
    ["Se le pasan plazos o lleva demasiadas cosas", "«Te avisa por correo de lo que vence. No depende de que te acuerdes tú.»"],
    ["Los mismos problemas se repiten", "«Te enseña qué se repite y por qué, y te propone objetivos con tus propios datos. Te sirve para la revisión por la dirección.»"],
    ["Está con la ISO 9001:2026", "«Te dice qué requisitos nuevos ya cubres con lo que tienes y cuáles te faltan.»"],
    ["Lleva varias normas (calidad, medioambiente, seguridad)", "«Lo tienes todo en el mismo sitio, con las preguntas adecuadas para cada norma.»"],
  ];
  function listaGanancias() {
    return GANANCIAS.map(function (g) { return h("div", { class: "objecion" }, h("b", null, "Si te cuenta: " + g[0].charAt(0).toLowerCase() + g[0].slice(1)), h("span", null, g[1])); });
  }

  function listaObjeciones() {
    return OBJECIONES.map(function (o) { return h("div", { class: "objecion" }, h("b", null, o[0]), h("span", null, o[1])); });
  }
  (function pintarGuion() {
    anadir($("guion-objeciones"), listaObjeciones());
    anadir($("guion-ganancias"), listaGanancias());
    anadir($("guion-resultados"), Object.keys(CUANDO).map(function (k) {
      return h("div", { class: "objecion" }, h("b", null, NOMBRES_RESULTADO[k]), h("span", null, CUANDO[k]));
    }));
    document.querySelectorAll(".guion-indice a").forEach(function (a) {
      a.addEventListener("click", function () { var d = document.querySelector(a.getAttribute("href")); if (d) d.open = true; });
    });
  })();

  // ---------- Guion editable (lo edita administración) ----------
  // Cada sección cambiada se guarda como texto sencillo y se pinta sin innerHTML.
  // La que no se ha cambiado sigue mostrando el original de esta página.
  var TITULOS_GUION = { "g-intro": "Tu objetivo" };
  var partesGuion = {};
  ["g-intro", "g-pasos", "g-pegas", "g-centralita", "g-demo", "g-resultados", "g-evidran", "g-quien", "g-no", "g-reglas"].forEach(function (id) {
    var sec = $(id), original = h("div"), editado = h("div", { class: "oculto" });
    [].slice.call(sec.childNodes).forEach(function (n) { if (n.nodeName !== "SUMMARY") original.appendChild(n); });
    var boton = h("div", { class: "guion-editar oculto" }, h("button", { class: "boton claro mini", onclick: function () { abrirEditorGuion(id); } }, "Editar esta sección"));
    anadir(sec, [boton, original, editado]);
    partesGuion[id] = { sec: sec, original: original, editado: editado, boton: boton, pintado: "" };
  });

  function lineaATexto(el) {
    var s = "";
    el.childNodes.forEach(function (n) { s += n.nodeName === "B" ? "**" + n.textContent + "**" : n.textContent; });
    return s.replace(/\s+/g, " ").trim();
  }
  function htmlATexto(el, lineas) {
    [].forEach.call(el.children, function (n) {
      if (n.nodeName === "SUMMARY") return;
      if (n.nodeName === "H4") lineas.push("", "# " + lineaATexto(n));
      else if (n.classList.contains("frase")) lineas.push("> " + lineaATexto(n));
      else if (n.classList.contains("objecion")) lineas.push("", "? " + n.children[0].textContent, n.children[1].textContent);
      else if (n.nodeName === "UL" || n.nodeName === "OL") [].forEach.call(n.children, function (li, i) { lineas.push((n.nodeName === "OL" ? i + 1 + ". " : "- ") + lineaATexto(li)); });
      else if (n.nodeName === "DETAILS") { lineas.push("", "+ " + n.querySelector("summary").textContent); htmlATexto(n, lineas); }
      else if (n.nodeName === "P") lineas.push(lineaATexto(n));
      else htmlATexto(n, lineas);
    });
    return lineas;
  }
  function textoOriginal(id) { return htmlATexto(partesGuion[id].original, []).join("\n").trim(); }

  function conNegrita(s) { return s.split("**").map(function (x, i) { return i % 2 ? h("b", null, x) : x; }); }
  // `cambia` deja sustituir [nombre] y [empresa] en la ficha de cada llamada.
  function textoAHtml(texto, cambia) {
    var salida = h("div"), destino = salida, lista = null, objecion = null;
    texto.split("\n").forEach(function (cruda) {
      var l = cambia ? cambia(cruda.trim()) : cruda.trim(), m;
      if (!l) return;
      var etiquetaLista = /^- /.test(l) ? "ul" : /^\d+\. /.test(l) ? "ol" : null;
      if (etiquetaLista) {
        if (!lista || lista.nodeName.toLowerCase() !== etiquetaLista) { lista = h(etiquetaLista); destino.appendChild(lista); }
        lista.appendChild(h("li", null, conNegrita(l.replace(/^(- |\d+\. )/, ""))));
        objecion = null;
        return;
      }
      lista = null;
      if ((m = /^# (.*)/.exec(l))) { destino = salida; objecion = null; salida.appendChild(h("h4", null, conNegrita(m[1]))); return; }
      if ((m = /^\+ (.*)/.exec(l))) { objecion = null; destino = h("details", { class: "opcional" }, h("summary", null, m[1])); salida.appendChild(destino); return; }
      if ((m = /^> (.*)/.exec(l))) { objecion = null; destino.appendChild(h("div", { class: "frase" }, conNegrita(m[1]))); return; }
      if ((m = /^\? (.*)/.exec(l))) { objecion = h("div", { class: "objecion" }, h("b", null, m[1])); destino.appendChild(objecion); return; }
      if (objecion) { objecion.appendChild(h("span", null, conNegrita(l))); objecion = null; return; }
      destino.appendChild(h("p", null, conNegrita(l)));
    });
    return salida;
  }

  function pintarGuionEditado() {
    Object.keys(partesGuion).forEach(function (id) {
      var p = partesGuion[id], t = S.d.guion[id] || "";
      p.boton.classList.toggle("oculto", S.rol !== "admin");
      if (p.pintado === t) return;
      p.pintado = t;
      anadir(vaciar(p.editado), t ? textoAHtml(t) : null);
      p.original.classList.toggle("oculto", !!t);
      p.editado.classList.toggle("oculto", !t);
    });
  }

  function abrirEditorGuion(id) {
    var p = partesGuion[id], original = textoOriginal(id), guardado = S.d.guion[id] || "";
    var texto = h("textarea", { id: "g-texto", maxlength: "20000" });
    texto.value = guardado || original;
    var inicial = texto.value;
    var error = h("div", { class: "aviso mal" });
    var titulo = TITULOS_GUION[id] || p.sec.querySelector("summary").textContent;
    function guardar(valor, aviso) {
      error.textContent = "";
      api({ accion: "guardar_guion", seccion: id, texto: valor }).then(function () {
        cerrarEditorGuion(true);
        toast(aviso);
        return recargar();
      }).catch(function (e) { error.textContent = e.message; });
    }
    S.guionPendiente = function () { return texto.value !== inicial; };
    anadir(vaciar($("guion-editor-cuerpo")), [
      h("div", { class: "dlg-cab" }, h("h2", { style: "margin:0" }, titulo),
        h("button", { class: "cerrar", "aria-label": "Cerrar", onclick: function () { cerrarEditorGuion(); } }, "×")),
      h("p", { class: "peq suave" }, "Al principio de cada línea: «# » subtítulo, «> » frase para decir, «- » punto de lista, «1. » lista numerada, «? » lo que te dicen (la respuesta, en la línea siguiente), «+ » bloque plegable hasta el siguiente subtítulo. **Así** va en negrita."),
      texto, error,
      h("div", { class: "fila mt" },
        h("button", { class: "boton", onclick: function () {
          if (texto.value === inicial) { cerrarEditorGuion(true); return; }
          guardar(texto.value.trim() === original ? "" : texto.value, "Guion guardado. Las setters lo verán en menos de un minuto.");
        } }, "Guardar"),
        h("button", { class: "boton claro", onclick: function () { cerrarEditorGuion(); } }, "Cancelar"),
        guardado ? h("button", { class: "boton peligro", onclick: function () {
          if (confirm("¿Volver al texto original de esta sección? Se pierden tus cambios.")) guardar("", "Sección restaurada.");
        } }, "Volver al original") : null),
    ]);
    $("guion-editor").showModal();
  }
  function cerrarEditorGuion(forzar) {
    if (!forzar && S.guionPendiente && S.guionPendiente() && !confirm("Hay cambios sin guardar. ¿Cerrar sin guardar?")) return;
    S.guionPendiente = null;
    cerrar("guion-editor");
  }
  $("guion-editor").addEventListener("cancel", function (ev) { ev.preventDefault(); cerrarEditorGuion(); });

  // Chuleta dentro de la ficha, con el nombre y la empresa de esa llamada.
  function chuleta(c) {
    var nombre = c.persona ? c.persona.split(" ")[0] : "[nombre]";
    var cambia = function (l) { return l.split("[nombre]").join(nombre).split("[empresa]").join(c.empresa.replace(/\.$/, "")); };
    var pasos = S.d.guion["g-pasos"], pegas = S.d.guion["g-pegas"];
    if (pasos || pegas) {
      return h("details", null, h("summary", null, "Guion para esta llamada"),
        h("div", { class: "guion" },
          textoAHtml(pasos || textoOriginal("g-pasos"), cambia),
          h("h4", null, "Si te dicen…"), textoAHtml(pegas || textoOriginal("g-pegas"), cambia)));
    }
    return h("details", null, h("summary", null, "Guion para esta llamada"),
      h("div", { class: "guion" },
        h("h4", null, "1. Saludo"), h("div", { class: "frase" }, "«Hola, " + nombre + ", soy [tu nombre], te llamo de Evidran. Es una llamada corta, ¿te pillo en buen momento o te llamo en otro rato?»"),
        h("h4", null, "2. Motivo"), h("div", { class: "frase" }, "«Te llamo porque llevas la calidad de " + c.empresa.replace(/\.$/, "") + ". Normalmente la calidad acaba repartida entre plantillas de Word, varios Excel y la memoria de quien la lleva: qué acción vence, qué se hizo la última vez que pasó algo parecido… Hemos creado una herramienta, diseñada por personas de calidad con más de 20 años de experiencia, que lo reúne todo en un solo sitio: cuentas la no conformidad con tus palabras, el informe se redacta solo y te avisa de lo que vence.»"),
        h("h4", null, "3. Pregunta (y escucha)"), h("div", { class: "frase" }, "«Por curiosidad, ¿cómo registráis hoy las no conformidades? ¿Word, Excel, algún programa?»"),
        h("details", { class: "opcional" }, h("summary", null, "Opcional: qué gana la empresa"),
          h("p", { class: "suave peq" }, "Solo si te da pie. Elige UNA, la que encaje con lo que te ha contado."), listaGanancias()),
        h("h4", null, "5. Pide la cita"), h("div", { class: "frase" }, "«Estamos buscando unas pocas empresas que lo prueben gratis durante 30 días, sin tarjeta y sin compromiso. En una videollamada de 30 minutos te lo dejamos montado. ¿Te va mejor el [día] a las [hora] o el [día] a las [hora]?»"),
        h("h4", null, "Si te dicen…"), listaObjeciones()));
  }

  // ---------- Contactos ----------
  function pintarContactos() {
    var sel = $("filtro");
    if (!sel.options.length) {
      [["", "Todos"], ["pendiente", "Pendientes de llamar"], ["sin", "Sin llamar"], ["vence_pronto", "Certificado vence en 6 meses"], ["li_contacto", "LinkedIn: somos contactos"], ["li_invitacion", "LinkedIn: invitación enviada"], ["li_sin", "LinkedIn: sin conectar"], ["li_mensaje", "LinkedIn: mensaje enviado"]].concat(Object.keys(S.d.resultados).map(function (k) { return [k, S.d.resultados[k]]; }))
        .forEach(function (o) { sel.appendChild(h("option", { value: o[0] }, o[1])); });
    }
    if (S.rol === "admin") rellenarSelectPersonas($("filtro-persona"), [["", "Todas"], ["__yo", "Míos"], ["__sin", "Sin asignar"]]);
    var fp = S.rol === "admin" ? $("filtro-persona").value : "";
    var q = $("buscar").value.trim().toLowerCase();
    var f = sel.value;
    var lista = S.d.contactos.filter(function (c) {
      if (fp === "__sin" && c.setter_id) return false;
      if (fp === "__yo" && (!c.setter_id || c.setter_id !== idMio())) return false;
      if (fp && fp !== "__sin" && fp !== "__yo" && c.setter_id !== fp) return false;
      if (f === "pendiente" && !enCola(c)) return false;
      if (f === "sin" && c.resultado) return false;
      if (f === "vence_pronto" && !vencimientosProximos(c).length) return false;
      if (f === "li_contacto" && c.linkedin_estado !== "contacto") return false;
      if (f === "li_invitacion" && c.linkedin_estado !== "invitacion") return false;
      if (f === "li_sin" && c.linkedin_estado) return false;
      if (f === "li_mensaje" && !c.linkedin_enviado_en) return false;
      if (f && f.indexOf("li_") !== 0 && f !== "pendiente" && f !== "sin" && f !== "vence_pronto" && (f === "no_llamar" ? !c.no_llamar : c.resultado !== f)) return false;
      if (!q) return true;
      return [c.empresa, c.persona, c.telefono, c.ciudad, c.linkedin_contacto, c.linkedin_cargo].filter(Boolean).join(" ").toLowerCase().indexOf(q) >= 0;
    });
    if (f === "vence_pronto") lista.sort(function (a, b) { return vencimientosProximos(a)[0].fecha < vencimientosProximos(b)[0].fecha ? -1 : 1; });
    var tb = vaciar($("tabla-contactos"));
    if (!lista.length) { tb.appendChild(h("tr", null, h("td", { colspan: "6", class: "vacio" }, "Ningún contacto con ese filtro."))); return; }
    lista.forEach(function (c) {
      tb.appendChild(h("tr", { class: "clic", onclick: function () { abrirFicha(c.id); } },
        h("td", null, h("strong", null, c.empresa), c.ciudad ? h("div", { class: "peq suave" }, c.ciudad) : null,
          f === "vence_pronto" ? h("div", { class: "peq" }, vencimientosProximos(c).map(function (v) { return v.norma + " vence el " + fechaDia(v.fecha); }).join(" · ")) : null),
        h("td", null, c.persona || "—", c.cargo ? h("div", { class: "peq suave" }, c.cargo) : null),
        h("td", null, c.telefono || "—"),
        h("td", null, h("div", { class: "etiquetas" }, etiquetaResultado(c), etiquetaEnvio(c), etiquetaLinkedin(c), etiquetaMensaje(c))),
        h("td", null, String(c.intentos)),
        S.rol === "admin" ? h("td", null, c.setter_id ? nombrePersona(c.setter_id) : h("span", { class: "suave" }, "Sin asignar")) : null));
    });
  }

  // ---------- Envíos por correo y por LinkedIn (la pestaña es solo de administración) ----------
  var SIN_ENVIO = ["demo", "no_interesa", "herramienta_propia", "no_encaja", "no_llamar", "erroneo"];
  // El historial llega con la llamada más reciente primero.
  function ultimaInfo(c) {
    return c.historial.filter(function (l) { return l.resultado === "info"; })[0] || null;
  }
  // Pidió información, no se le ha enviado desde entonces y sigue teniendo sentido enviársela.
  function infoPendiente(c) {
    var l = ultimaInfo(c);
    if (!l || c.no_llamar || SIN_ENVIO.indexOf(c.resultado) >= 0) return false;
    return !c.info_enviada_en || new Date(c.info_enviada_en) < new Date(l.hechaEn);
  }
  function infoEnviada(c) { return !!c.info_enviada_en && !infoPendiente(c); }
  // Las setters no reciben la fecha de envío: sin esta comprobación todo les saldría «por enviar».
  function etiquetaEnvio(c) {
    if (S.rol !== "admin") return null;
    if (infoEnviada(c)) return h("span", { class: "etiqueta demo" }, "✓ Info enviada · " + relativo(c.info_enviada_en));
    if (infoPendiente(c)) return h("span", { class: "etiqueta por-enviar" }, "Info por enviar");
    return null;
  }

  // Los dos canales comparten pantalla: cambia dónde se guarda y cómo se nombra.
  var CANALES = {
    correo: { accion: "info_enviada", fecha: "info_enviada_en", texto: "info_texto", titulo: "Correo", marcar: "Correo enviado", verTexto: "Ver el correo", pegar: "Pegar el correo", rotulo: "Correo que le has enviado", pista: "Pega aquí el correo que le has enviado", casilla: "Ya se la he enviado" },
    linkedin: { accion: "linkedin_enviado", fecha: "linkedin_enviado_en", texto: "linkedin_texto", titulo: "LinkedIn", marcar: "Mensaje enviado por LinkedIn", verTexto: "Ver el mensaje", pegar: "Pegar el mensaje", rotulo: "Mensaje que le has enviado", pista: "Pega aquí el mensaje que le has enviado", casilla: "Ya se lo he enviado" },
  };
  function enviadoPor(c, canal) { return canal === "correo" ? infoEnviada(c) : !!c.linkedin_enviado_en; }
  // Ya sois contactos y aún no le has escrito.
  function linkedinPendiente(c) {
    return c.linkedin_estado === "contacto" && !c.linkedin_enviado_en && !c.no_llamar && SIN_ENVIO.indexOf(c.resultado) < 0;
  }
  function etiquetaMensaje(c) {
    return c.linkedin_enviado_en ? h("span", { class: "etiqueta demo" }, "✓ Mensaje por LinkedIn · " + relativo(c.linkedin_enviado_en)) : null;
  }
  function personaLinkedin(c) { return [c.linkedin_contacto, c.linkedin_cargo].filter(Boolean).join(" · "); }

  function botonTexto(c, canal) {
    var K = CANALES[canal];
    return h("button", { class: "boton claro mini", onclick: function () { abrirEnvio(c, canal); } }, c[K.texto] ? K.verTexto : K.pegar);
  }
  function botonFicha(c) {
    return h("button", { class: "boton claro mini", onclick: function () { abrirFicha(c.id); } }, "Ficha");
  }

  function filaPendiente(c, canal) {
    var K = CANALES[canal], l = canal === "correo" ? ultimaInfo(c) : null;
    var marca = h("input", { type: "checkbox", class: "marca", "aria-label": K.marcar + ": " + c.empresa, onchange: function () {
      marca.disabled = true;
      api({ accion: K.accion, id: c.id, enviada: marca.checked }).then(function () {
        toast("Marcado como enviado: " + c.empresa.replace(/\.$/, "") + ".");
        return recargar();
      }).catch(function (e) { marca.checked = !marca.checked; marca.disabled = false; toast(e.message); });
    } });
    return h("div", { class: "contacto envio" },
      marca,
      h("div", { class: "texto" },
        h("div", { class: "quien" }, c.empresa),
        canal === "correo"
          ? [h("div", { class: "det" }, [c.persona, c.cargo].filter(Boolean).join(" · ") || "Sin persona"),
            h("div", { class: "det" }, c.email ? h("a", { href: "mailto:" + c.email }, c.email) : h("span", { class: "etiqueta fuera" }, "Falta el correo")),
            l ? h("div", { class: "det" }, "Lo pidió " + relativo(l.hechaEn) + " · anotó " + l.quien) : null,
            l && l.nota ? h("div", { class: "nota-envio" }, l.nota) : null,
            c.info_enviada_en ? h("div", { class: "det" }, "Último envío " + relativo(c.info_enviada_en)) : null]
          : [h("div", { class: "det" }, personaLinkedin(c) || "Sin persona en LinkedIn"),
            c.linkedin_empresa ? h("div", { class: "det" }, h("a", { href: c.linkedin_empresa, target: "_blank", rel: "noopener" }, "Página de la empresa en LinkedIn")) : null]),
      h("div", { class: "fila acciones" }, botonTexto(c, canal), botonFicha(c)));
  }

  // Una fila por empresa, con lo enviado por cada canal.
  function filaEnviado(c) {
    var canales = Object.keys(CANALES).filter(function (k) { return enviadoPor(c, k); });
    return h("div", { class: "contacto envio" },
      h("div", { class: "texto" },
        h("div", { class: "quien" }, c.empresa),
        h("div", { class: "det" }, h("div", { class: "etiquetas" }, enviadoPor(c, "correo") ? etiquetaEnvio(c) : null, etiquetaMensaje(c))),
        h("div", { class: "det" }, (canales.length === 1 && canales[0] === "linkedin" && personaLinkedin(c)) || [c.persona, c.cargo].filter(Boolean).join(" · ") || personaLinkedin(c) || "Sin persona")),
      h("div", { class: "fila acciones" }, canales.map(function (k) { return botonTexto(c, k); }), botonFicha(c)));
  }

  function ultimoEnvio(c) {
    return Math.max(enviadoPor(c, "correo") ? new Date(c.info_enviada_en).getTime() : 0, c.linkedin_enviado_en ? new Date(c.linkedin_enviado_en).getTime() : 0);
  }

  function pintarEnvios() {
    var correo = S.d.contactos.filter(infoPendiente).sort(function (a, b) { return new Date(ultimaInfo(a).hechaEn) - new Date(ultimaInfo(b).hechaEn); });
    var linkedin = S.d.contactos.filter(linkedinPendiente);
    var hechos = S.d.contactos.filter(function (c) { return ultimoEnvio(c) > 0; }).sort(function (a, b) { return ultimoEnvio(b) - ultimoEnvio(a); });
    var cp = vaciar($("envios-pendientes"));
    if (!correo.length && !linkedin.length) cp.appendChild(h("div", { class: "vacio" }, "No hay nada pendiente de enviar."));
    if (correo.length) cp.appendChild(h("h3", null, "Por correo: lo pidieron (" + correo.length + ")"));
    correo.forEach(function (c) { cp.appendChild(filaPendiente(c, "correo")); });
    if (linkedin.length) cp.appendChild(h("h3", null, "Por LinkedIn: ya sois contactos (" + linkedin.length + ")"));
    linkedin.forEach(function (c) { cp.appendChild(filaPendiente(c, "linkedin")); });
    var ch = vaciar($("envios-hechos"));
    if (!hechos.length) ch.appendChild(h("div", { class: "vacio" }, "Todavía no has marcado ningún envío."));
    hechos.forEach(function (c) { ch.appendChild(filaEnviado(c)); });
  }

  // `alGuardar` recibe el contacto ya actualizado. Con `marcar`, la casilla sale
  // ya puesta: se abre porque acabas de enviarlo y solo falta guardar.
  function abrirEnvio(c, canal, alGuardar, marcar) {
    var K = CANALES[canal];
    var enviado = enviadoPor(c, canal);
    var email = canal === "correo" ? h("input", { type: "email", maxlength: "200", value: c.email || "", placeholder: "correo@empresa.com" }) : null;
    var texto = h("textarea", { id: "e-texto", maxlength: "20000", placeholder: K.pista });
    texto.value = c[K.texto] || "";
    var marca = h("input", { type: "checkbox", class: "marca" });
    marca.checked = enviado || !!marcar;
    var marcaInicial = marca.checked;
    var nuevo = false;
    var error = h("div", { class: "aviso mal" });
    function cambiosDeTexto() {
      var x = {};
      if (email && email.value.trim() !== (c.email || "")) x.email = email.value;
      if (texto.value.trim() !== (c[K.texto] || "")) x.texto = texto.value;
      return x;
    }
    function cambios() {
      var x = cambiosDeTexto();
      if (marca.checked !== enviado || nuevo) x.enviada = marca.checked;
      return x;
    }
    S.envioPendiente = function () { return nuevo || marca.checked !== marcaInicial || Object.keys(cambiosDeTexto()).length > 0; };
    var otro = h("button", { class: "boton claro mini", onclick: function () {
      nuevo = true;
      marca.checked = true;
      anadir(vaciar(aviso), "Al guardar, la fecha pasa a hoy. Se guarda solo el último texto: añade el nuevo debajo si quieres conservar el anterior.");
      otro.classList.add("oculto");
      texto.focus();
    } }, "Es un mensaje nuevo");
    var aviso = h("div", { class: "peq", style: "margin-top:8px" });
    var persona = canal === "linkedin" ? personaLinkedin(c) : [c.persona, c.cargo].filter(Boolean).join(" · ");
    anadir(vaciar($("envio-cuerpo")), [
      h("div", { class: "dlg-cab" },
        h("div", null, h("h2", { style: "margin:0" }, K.marcar), h("div", { class: "suave" }, [c.empresa, persona].filter(Boolean).join(" · "))),
        h("button", { class: "cerrar", "aria-label": "Cerrar", onclick: function () { cerrarEnvio(); } }, "×")),
      email ? [h("label", null, "Correo de la persona"), email] : null,
      h("label", null, K.rotulo), texto,
      h("label", { class: "casilla" }, marca, enviado ? "Enviado " + relativo(c[K.fecha]) : K.casilla),
      enviado ? h("div", { class: "fila", style: "margin-top:8px" }, otro) : null,
      aviso,
      error,
      h("div", { class: "fila mt" },
        h("button", { class: "boton", onclick: function (ev) {
          var boton = ev.currentTarget, x = cambios();
          if (!Object.keys(x).length) { cerrarEnvio(true); return; }
          boton.disabled = true;
          error.textContent = "";
          api(Object.assign({ accion: K.accion, id: c.id }, x)).then(function () {
            cerrarEnvio(true);
            toast("Guardado.");
            return recargar().then(function () {
              var actual = S.d.contactos.find(function (y) { return y.id === c.id; });
              if (alGuardar && actual) alGuardar(actual);
            });
          }).catch(function (e) { boton.disabled = false; error.textContent = e.message; });
        } }, "Guardar"),
        h("button", { class: "boton claro", onclick: function () { cerrarEnvio(); } }, "Cancelar")),
    ]);
    $("envio").showModal();
  }
  function cerrarEnvio(forzar) {
    if (!forzar && S.envioPendiente && S.envioPendiente() && !confirm("Hay cambios sin guardar. ¿Cerrar sin guardar?")) return;
    S.envioPendiente = null;
    cerrar("envio");
  }
  $("envio").addEventListener("cancel", function (ev) { ev.preventDefault(); cerrarEnvio(); });

  function envioEnFicha(c, alCambiar) {
    function fila(canal) {
      var K = CANALES[canal];
      var estado = h("div", { class: "peq", style: "flex:1 1 200px" });
      var boton = h("button", { class: "boton claro mini", onclick: function () {
        var actual = S.d.contactos.find(function (y) { return y.id === c.id; }) || c;
        abrirEnvio(actual, canal, pintarEstado, !enviadoPor(actual, canal));
      } });
      function pintarEstado(x) {
        var situacion = enviadoPor(x, canal) ? "Enviado " + relativo(x[K.fecha])
          : canal === "correo" && infoPendiente(x) ? "Lo pidió, por enviar"
          : canal === "linkedin" && linkedinPendiente(x) ? "Sois contactos, sin mensaje" : "Sin enviar";
        estado.textContent = K.titulo + ": " + situacion + (x[K.texto] ? " · texto guardado" : "");
        boton.textContent = enviadoPor(x, canal) ? "Ver o cambiar" : K.marcar;
        if (alCambiar) alCambiar(x);
      }
      pintarEstado(c);
      return h("div", { class: "fila", style: "margin-top:6px" }, estado, boton);
    }
    return h("div", null, h("h3", null, "Envíos"), fila("correo"), fila("linkedin"));
  }

  // ---------- Personas que llaman ----------
  function nombrePersona(id) {
    var p = (S.d.setters || []).find(function (x) { return x.id === id; });
    if (p && p.reservado) return "Tú";
    return p ? p.nombre + (p.activo ? "" : " (desactivada)") : "—";
  }
  // Id de la fila «me lo quedo» de administración (null si aún no te has quedado ninguno).
  function idMio() {
    var p = (S.d.setters || []).find(function (x) { return x.reservado; });
    return p ? p.id : null;
  }
  // Rellena un <select> con opciones fijas + las personas, conservando la elección.
  function rellenarSelectPersonas(sel, fijas, soloActivas) {
    var antes = sel.value;
    vaciar(sel);
    fijas.concat((S.d.setters || []).filter(function (p) { return !p.reservado && (!soloActivas || p.activo); }).map(function (p) { return [p.id, p.nombre + (p.activo ? "" : " (desactivada)")]; }))
      .forEach(function (o) { sel.appendChild(h("option", { value: o[0] }, o[1])); });
    if ([].some.call(sel.options, function (o) { return o.value === antes; })) sel.value = antes;
  }
  function asignacion(c) {
    var sel = h("select", { style: "flex:1 1 200px" });
    rellenarSelectPersonas(sel, [["", "Sin asignar"], ["__yo", "Me lo quedo (lo llamo yo)"]], true);
    sel.value = c.setter_id && c.setter_id === idMio() ? "__yo" : c.setter_id || "";
    return h("div", null, h("h3", null, "Quién la llama"),
      h("div", { class: "fila" }, sel, h("button", { class: "boton claro mini", onclick: function () {
        var peticion = sel.value === "__yo"
          ? api({ accion: "quedarme", ids: [c.id] })
          : api({ accion: "asignar", ids: [c.id], setterId: sel.value || null });
        peticion.then(function () {
          toast(sel.value === "__yo" ? "Te la quedas: ninguna setter la verá." : sel.value ? "Asignada a " + nombrePersona(sel.value) + "." : "Queda sin asignar.");
          recargar();
        }).catch(function (e) { toast(e.message); });
      } }, "Guardar")));
  }
  function pintarPersonas() {
    rellenarSelectPersonas($("csv-asignar"), [["", "Sin asignar"], ["repartir", "Repartir entre las personas activas"]], true);
    var caja = vaciar($("personas"));
    var cuentas = {};
    (S.d.resumen.porPersona || []).forEach(function (p) { if (p.id) cuentas[p.id] = p; });
    if (!S.d.setters.length) { caja.appendChild(h("div", { class: "vacio" }, "Todavía no has creado ninguna. Mientras tanto, la clave común de setter sigue funcionando.")); return; }
    S.d.setters.filter(function (p) { return !p.reservado; }).forEach(function (p) {
      var n = cuentas[p.id] || { llamadas: 0, demos: 0 };
      var asignados = S.d.contactos.filter(function (c) { return c.setter_id === p.id; }).length;
      caja.appendChild(h("div", { class: "contacto" },
        h("div", null,
          h("div", { class: "quien" }, p.nombre, p.activo ? null : h("span", { class: "etiqueta fuera", style: "margin-left:8px" }, "Desactivada")),
          h("div", { class: "det" }, asignados + " contactos · " + n.llamadas + " llamadas · " + n.demos + " demos")),
        h("div", { class: "fila" },
          h("button", { class: "boton claro mini", onclick: function () {
            if (!confirm("¿Crear una clave nueva para " + p.nombre + "? La anterior dejará de funcionar.")) return;
            api({ accion: "nueva_clave_setter", id: p.id }).then(function (j) { mostrarClave(p.nombre, j.clave); }).catch(function (e) { toast(e.message); });
          } }, "Nueva clave"),
          h("button", { class: p.activo ? "boton peligro mini" : "boton claro mini", onclick: function () {
            if (p.activo && !confirm("¿Desactivar a " + p.nombre + "? No podrá entrar; lo que anotó se queda.")) return;
            api({ accion: "editar_setter", id: p.id, activo: !p.activo }).then(function () { toast(p.activo ? "Desactivada." : "Activada."); recargar(); }).catch(function (e) { toast(e.message); });
          } }, p.activo ? "Desactivar" : "Activar"))));
    });
  }
  function mostrarClave(nombre, clave) {
    $("p-resultado").classList.remove("oculto");
    $("p-resultado-texto").textContent = "Clave de " + nombre + ":";
    $("p-clave").textContent = clave;
  }
  $("p-crear").addEventListener("click", function () {
    var aviso = $("p-aviso");
    var nombre = $("p-nombre").value.trim();
    if (!nombre) { aviso.className = "aviso mal"; aviso.textContent = "Escribe el nombre."; return; }
    api({ accion: "crear_setter", nombre: nombre }).then(function (j) {
      aviso.textContent = "";
      $("p-nombre").value = "";
      mostrarClave(j.nombre, j.clave);
      recargar();
    }).catch(function (e) { aviso.className = "aviso mal"; aviso.textContent = e.message; });
  });
  $("p-copiar").addEventListener("click", function () {
    navigator.clipboard.writeText($("p-clave").textContent).then(function () { toast("Clave copiada."); });
  });
  $("filtro-persona").addEventListener("change", function () { if (S.d) pintarContactos(); });
  try { $("llamar-ver").value = sessionStorage.getItem("agendaVer") || "todas"; } catch (e) {}
  $("llamar-ver").addEventListener("change", function () {
    try { sessionStorage.setItem("agendaVer", $("llamar-ver").value); } catch (e) {}
    if (S.d) pintarLlamar();
  });
  $("repartir").addEventListener("click", function () {
    if (!confirm("¿Repartir entre las personas activas los contactos pendientes sin asignar?")) return;
    api({ accion: "repartir" }).then(function (j) { toast(j.repartidos + " contactos repartidos."); recargar(); }).catch(function (e) { toast(e.message); });
  });
  $("buscar").addEventListener("input", function () { if (S.d) pintarContactos(); });
  $("filtro").addEventListener("change", function () { if (S.d) pintarContactos(); });

  $("csv-fichero").addEventListener("change", function (ev) {
    var f = ev.target.files[0];
    if (!f) return;
    f.text().then(function (t) { $("csv-texto").value = t; });
  });
  $("csv-cargar").addEventListener("click", function () {
    var aviso = $("csv-aviso");
    var csv = $("csv-texto").value;
    if (!csv.trim()) { aviso.className = "aviso mal"; aviso.textContent = "Elige un fichero o pega el contenido."; return; }
    aviso.className = "aviso"; aviso.textContent = "Cargando…";
    api({ accion: "importar", csv: csv, asignar: $("csv-asignar").value }).then(function (j) {
      var plural = function (n, uno, varios) { return n + " " + (n === 1 ? uno : varios); };
      var partes = [plural(j.creados, "contacto cargado", "contactos cargados")];
      if (j.repetidos) partes.push(plural(j.repetidos, "repetido que se ha saltado", "repetidos que se han saltado"));
      if (j.sinEmpresa) partes.push(plural(j.sinEmpresa, "fila sin empresa", "filas sin empresa"));
      if (j.recortados) partes.push(j.recortados + " por encima del máximo de 2.000");
      aviso.className = "aviso bien"; aviso.textContent = partes.join(" · ") + ".";
      $("csv-texto").value = ""; $("csv-fichero").value = "";
      recargar();
    }).catch(function (e) { aviso.className = "aviso mal"; aviso.textContent = e.message; });
  });
  $("csv-descargar").addEventListener("click", function () {
    var cols = ["empresa", "persona", "cargo", "telefono", "email", "web", "linkedin_empresa", "linkedin_contacto", "linkedin_cargo", "linkedin_estado", "linkedin_enviado_en", "ciudad", "origen", "certificadora", "vence_9001", "vence_14001", "vence_45001", "resultado", "intentos", "ultima_llamada", "volver_en", "notas"];
    // Lo que empieza por = + - @ lo ejecutaría Excel como fórmula: algunos datos llegan de formularios públicos.
    var celda = function (v) {
      v = v === null || v === undefined ? "" : String(v);
      if (/^[=+\-@\t\r]/.test(v) && !/^\+?[\d\s().-]+$/.test(v)) v = "'" + v;
      return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    };
    var filas = [cols.join(",")].concat(S.d.contactos.map(function (c) {
      return cols.map(function (k) { return celda(k === "resultado" ? (c.no_llamar ? "No llamar" : S.d.resultados[c.resultado] || "") : c[k]); }).join(",");
    }));
    var blob = new Blob(["﻿" + filas.join("\n")], { type: "text/csv;charset=utf-8" });
    var a = h("a", { href: URL.createObjectURL(blob), download: "contactos-evidran-" + hoy() + ".csv" });
    document.body.appendChild(a); a.click(); a.remove();
  });

  // ---------- Agenda ----------
  function bloqueCita(c, proxima) {
    var origen = c.reservadaPor || "—";
    return h("div", { class: "cita" },
      h("div", { class: "fila", style: "justify-content:space-between" },
        h("div", { class: "cuando" }, cuando(c.inicio)),
        c.estado === "cancelada" ? h("span", { class: "etiqueta fuera" }, "Cancelada" + (c.cancelada_por ? " por " + c.cancelada_por : "")) : null),
      h("div", null, h("strong", null, c.empresa || "Sin empresa"), " · ", c.nombre),
      h("div", { class: "peq suave" }, [c.email, c.telefono, "reservada por " + origen].filter(Boolean).join(" · ")),
      c.notas ? h("div", { class: "notas" }, c.notas) : null,
      proxima ? h("div", { class: "fila mt" },
        h("button", { class: "boton claro mini", onclick: function () { abrirEditarCita(c); } }, "Corregir datos"),
        h("button", { class: "boton claro mini", onclick: function () {
          if (!confirm("¿Volver a enviar la invitación a " + c.email + "? El enlace para cambiar o cancelar del correo anterior dejará de funcionar.")) return;
          api({ accion: "editar_cita", id: c.id, campos: {}, reenviar: true }).then(function (j) {
            toast(j.correo ? "Invitación reenviada a " + c.email + "." : "No se pudo enviar el correo.");
            recargar();
          }).catch(function (e) { toast(e.message); });
        } }, "Reenviar invitación"),
        S.rol === "admin" ? h("button", { class: "boton peligro mini", onclick: function () {
          if (!confirm("¿Cancelar la demo con " + c.nombre + "? Le llegará un correo avisando.")) return;
          api({ accion: "cancelar_cita", id: c.id }).then(function (j) { toast(j.correo ? "Demo cancelada y aviso enviado." : "Demo cancelada, pero el correo no salió."); recargar(); }).catch(function (e) { toast(e.message); });
        } }, "Cancelar demo") : null) : null);
  }

  function abrirEditarCita(c) {
    var campos = [["nombre", "Nombre de la persona *", "text"], ["empresa", "Empresa", "text"], ["email", "Correo para la invitación *", "email"], ["telefono", "Teléfono", "tel"]];
    var inputs = {};
    var notas = h("textarea", { maxlength: "1500" });
    notas.value = c.notas || "";
    var error = h("div", { class: "aviso mal" });
    var cuerpo = vaciar($("editar-cuerpo"));
    anadir(cuerpo, [
      h("div", { class: "dlg-cab" }, h("h2", null, "Corregir datos de la demo"), h("button", { class: "cerrar", "aria-label": "Cerrar", onclick: function () { cerrar("editar"); } }, "×")),
      h("div", { class: "peq suave" }, cuando(c.inicio)),
      h("div", { class: "rejilla2" }, campos.map(function (f) {
        inputs[f[0]] = h("input", { type: f[2], value: c[f[0]] || "" });
        return h("div", null, h("label", null, f[1]), inputs[f[0]]);
      })),
      h("label", null, "Notas para la demo"), notas,
      h("p", { class: "peq suave", style: "margin-top:10px" }, "Si cambias el correo, la invitación se envía a la dirección nueva y el enlace del correo anterior deja de funcionar."),
      error,
      h("div", { class: "fila mt" },
        h("button", { class: "boton", onclick: function (ev) {
          var cambios = {};
          Object.keys(inputs).forEach(function (k) { if (inputs[k].value.trim() !== (c[k] || "")) cambios[k] = inputs[k].value; });
          if (notas.value !== (c.notas || "")) cambios.notas = notas.value;
          if (!Object.keys(cambios).length) { error.textContent = "No hay cambios."; return; }
          ev.currentTarget.disabled = true;
          var boton = ev.currentTarget;
          api({ accion: "editar_cita", id: c.id, campos: cambios }).then(function (j) {
            cerrar("editar");
            toast(!j.reenviada ? "Datos corregidos." : j.correo ? "Datos corregidos. Invitación enviada a " + cambios.email.trim() + "." : "Datos corregidos, pero el correo no salió.");
            recargar();
          }).catch(function (e) { boton.disabled = false; error.textContent = e.message; });
        } }, "Guardar"),
        h("button", { class: "boton claro", onclick: function () { cerrar("editar"); } }, "Cancelar"))
    ]);
    $("editar").showModal();
  }

  function pintarAgenda() {
    var ahora = Date.now();
    var prox = S.d.citas.filter(function (c) { return c.estado === "confirmada" && new Date(c.fin) > ahora; });
    var pas = S.d.citas.filter(function (c) { return !(c.estado === "confirmada" && new Date(c.fin) > ahora); }).reverse();
    var cp = vaciar($("citas-proximas"));
    if (!prox.length) cp.appendChild(h("div", { class: "vacio" }, "No hay demos agendadas."));
    prox.forEach(function (c) { cp.appendChild(bloqueCita(c, true)); });
    var cpa = vaciar($("citas-pasadas"));
    if (!pas.length) cpa.appendChild(h("div", { class: "vacio" }, "Nada en los últimos 30 días."));
    pas.forEach(function (c) { cpa.appendChild(bloqueCita(c, false)); });

    if (S.rol !== "admin") return;
    var bl = vaciar($("bloqueos"));
    if (!S.d.bloqueos.length) bl.appendChild(h("div", { class: "vacio" }, "Sin bloqueos."));
    S.d.bloqueos.forEach(function (b) {
      bl.appendChild(h("div", { class: "contacto" },
        h("div", null, h("div", { class: "quien" }, cuando(b.desde) + " → " + cuando(b.hasta)), b.motivo ? h("div", { class: "det" }, b.motivo) : null),
        h("button", { class: "boton claro mini", onclick: function () {
          api({ accion: "borrar_bloqueo", id: b.id }).then(function () { toast("Bloqueo quitado."); recargar(); }).catch(function (e) { toast(e.message); });
        } }, "Quitar")));
    });
  }
  $("agendar-suelta").addEventListener("click", function () { abrirReserva(null); });
  $("b-crear").addEventListener("click", function () {
    var aviso = $("b-aviso");
    var d = $("b-desde").value, hd = $("b-hasta").value || $("b-desde").value;
    if (!d) { aviso.className = "aviso mal"; aviso.textContent = "Indica al menos el día."; return; }
    var hastaDia = hd, hastaHora = $("b-hasta-h").value;
    if (!hastaHora) { var x = new Date(hd + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + 1); hastaDia = x.toISOString().slice(0, 10); hastaHora = "00:00"; }
    api({ accion: "crear_bloqueo", desde: d + "T" + ($("b-desde-h").value || "00:00"), hasta: hastaDia + "T" + hastaHora, motivo: $("b-motivo").value })
      .then(function () { aviso.className = "aviso bien"; aviso.textContent = "Bloqueado."; $("b-motivo").value = ""; recargar(); })
      .catch(function (e) { aviso.className = "aviso mal"; aviso.textContent = e.message; });
  });

  // ---------- Resumen ----------
  // Todas las llamadas anotadas, con su contacto, la más reciente primero.
  function pintarUltimas() {
    var filtro = $("ultimas-filtro").value;
    var desde = filtro === "hoy" ? hoy() : filtro === "7" ? diaDe(Date.now() - 6 * 86400000) : "";
    var lista = [];
    S.d.contactos.forEach(function (c) { c.historial.forEach(function (l) { lista.push({ l: l, c: c }); }); });
    lista = lista.filter(function (x) { return !desde || diaDe(x.l.hechaEn) >= desde; })
      .sort(function (a, b) { return a.l.hechaEn < b.l.hechaEn ? 1 : -1; });
    var caja = vaciar($("ultimas-llamadas"));
    if (!lista.length) { caja.appendChild(h("div", { class: "vacio" }, filtro === "hoy" ? "Hoy todavía no hay llamadas anotadas." : "No hay llamadas anotadas en este periodo.")); return; }
    var mostradas = lista.slice(0, 200);
    mostradas.forEach(function (x) {
      var l = x.l, c = x.c;
      var clase = l.resultado === "demo" ? "demo" : l.resultado === "volver" ? "volver" : l.resultado === "no_llamar" ? "fuera" : "";
      caja.appendChild(h("div", { class: "contacto", style: "cursor:pointer;align-items:flex-start", onclick: function () { abrirFicha(c.id); } },
        h("div", null,
          h("div", { class: "quien" }, c.empresa),
          h("div", { class: "det" }, relativo(l.hechaEn) + (c.persona ? " · " + c.persona : "") + (S.rol === "admin" || l.rol === "admin" ? " · " + l.quien : "")),
          l.nota ? h("div", { style: "font-size:14.5px;margin-top:4px;white-space:pre-wrap" }, l.nota) : h("div", { class: "det" }, "Sin nota")),
        h("span", { class: "etiqueta " + clase }, S.d.resultados[l.resultado] || l.resultado)));
    });
    if (lista.length > mostradas.length) caja.appendChild(h("div", { class: "vacio" }, "Se muestran las 200 más recientes de " + lista.length + "."));
  }
  $("ultimas-filtro").addEventListener("change", function () { if (S.d) pintarUltimas(); });

  // Empresas con alguna llamada de ese resultado (las que cuentan en el Resumen), la más reciente arriba.
  function empresasConResultado(k) {
    var cuenta = function (l) { return S.rol === "admin" || (l.rol === "setter" && l.setterId === (S.d.yo.setterId || null)); };
    var filas = [];
    S.d.contactos.forEach(function (c) {
      var hist = c.historial.slice().sort(function (a, b) { return a.hechaEn < b.hechaEn ? 1 : -1; });
      var suyas = hist.filter(function (l) { return l.resultado === k && cuenta(l); });
      if (suyas.length) filas.push({ c: c, l: suyas[0], veces: suyas.length, ahora: hist[0] });
    });
    filas.sort(function (a, b) { return a.l.hechaEn < b.l.hechaEn ? 1 : -1; });
    var caja = h("div", { style: "padding:0 4px" });
    filas.forEach(function (x) {
      var c = x.c, l = x.l, cambio = x.ahora.resultado !== k;
      caja.appendChild(h("div", { class: "contacto", style: "cursor:pointer;align-items:flex-start", onclick: function () { abrirFicha(c.id); } },
        h("div", null,
          h("div", { class: "quien" }, c.empresa),
          h("div", { class: "det" }, relativo(l.hechaEn) + (x.veces > 1 ? " · " + x.veces + " veces" : "") + (c.persona ? " · " + c.persona : "") + (S.rol === "admin" ? " · " + l.quien : "")),
          l.nota ? h("div", { style: "font-size:14.5px;margin-top:4px;white-space:pre-wrap" }, l.nota) : null),
        cambio ? h("span", { class: "etiqueta" }, "Ahora: " + (S.d.resultados[x.ahora.resultado] || x.ahora.resultado)) : null));
    });
    return caja;
  }

  var ETAPAS = [["sin_llamar", "Sin llamar"], ["sin_hablar", "Llamadas, sin hablar aún"], ["volver", "Volver a llamar"], ["info", "Info por correo"], ["demo", "Demo agendada"], ["descartada", "Descartadas"]];
  // Sigue el mismo orden que etiquetaResultado: lo último anotado decide la etapa.
  function etapaDe(c) {
    if (c.no_llamar) return "descartada";
    if (esCaliente(c) || !c.resultado) return "sin_llamar";
    if (c.resultado === "no_contesta" || c.resultado === "no_esta") return "sin_hablar";
    if (c.resultado === "volver" || c.resultado === "info" || c.resultado === "demo") return c.resultado;
    return "descartada";
  }

  function empresasDeEtapa(lista) {
    var caja = h("div", { style: "padding:0 10px" });
    lista.slice().sort(function (a, b) { return (a.ultima_llamada || "") < (b.ultima_llamada || "") ? 1 : -1; }).forEach(function (c) {
      var extra = esCaliente(c) ? "Pidió que le llamaran · " + relativo(c.caliente_desde)
        : c.ultima_llamada ? (c.no_llamar ? "No llamar" : S.d.resultados[c.resultado]) + " · " + relativo(c.ultima_llamada) : null;
      caja.appendChild(filaContacto(c, extra));
    });
    return caja;
  }

  function pintarEmbudo() {
    var tb = vaciar($("resumen-embudo"));
    var total = S.d.contactos.length;
    if (!total) { tb.appendChild(h("tr", null, h("td", { class: "vacio" }, "Aún no hay contactos cargados."))); return; }
    tb.appendChild(h("tr", null, h("td", null, h("strong", null, S.rol === "admin" ? "Empresas cargadas" : "Tus empresas")), h("td", { style: "width:60px;text-align:right" }, h("strong", null, String(total))), h("td", { style: "width:30%" })));
    function fila(k, titulo, lista, pista) {
      var n = lista.length, abierto = S.etapaAbierta === k;
      tb.appendChild(h("tr", { class: (n ? "clic" : "") + (pista ? " sub-etapa" : ""), onclick: n ? function () { S.etapaAbierta = abierto ? null : k; pintarEmbudo(); } : null },
        h("td", null, (n ? (abierto ? "▾ " : "▸ ") : "") + titulo, pista && n ? h("div", { class: "peq suave" }, pista) : null),
        h("td", { style: "width:60px;text-align:right" }, String(n)),
        h("td", { style: "width:30%" }, h("div", { class: "barra", style: "width:" + Math.round(n / total * 100) + "%" }))));
      if (abierto && n) tb.appendChild(h("tr", null, h("td", { colspan: "3", style: "padding:0 0 10px" }, empresasDeEtapa(lista))));
    }
    ETAPAS.forEach(function (e) {
      var lista = S.d.contactos.filter(function (c) { return etapaDe(c) === e[0]; });
      fila(e[0], e[1], lista);
      if (e[0] === "info" && S.rol === "admin") {
        fila("info_sin_enviar", "Sin enviar", lista.filter(function (c) { return !infoEnviada(c); }), "Te toca enviarla");
        fila("info_enviada", "Enviada, sin seguimiento", lista.filter(infoEnviada), "Toca volver a llamar");
      }
    });
  }

  function pintarResumen() {
    var r = S.d.resumen;
    var pendientes = S.d.contactos.filter(function (c) { var q = enCola(c); return q && q.grupo < 3; }).length;
    var cif = vaciar($("resumen-cifras"));
    var adm = S.rol === "admin";
    [[r.llamadasSetter, adm ? "Llamadas de todas las personas" : "Tus llamadas (cuentan para el pago)"], [r.llamadasSetterHoy, adm ? "Llamadas de hoy, entre todas" : "Tus llamadas de hoy"],
      [r.demosProximas, "Demos próximas"], [r.demosHechas, "Demos ya celebradas (30 días)"], [r.demosCanceladas, "Demos canceladas (30 días)"],
      [S.d.contactos.length, "Contactos cargados"], [pendientes, "Pendientes de llamar"]]
      .concat(S.rol === "admin" ? [[r.llamadasAdmin, "Llamadas tuyas"]] : [])
      .forEach(function (x) { cif.appendChild(h("div", { class: "cifra" }, h("b", null, x[0]), h("span", null, x[1]))); });

    pintarEmbudo();
    pintarUltimas();

    if (S.rol === "admin") {
      var tp = vaciar($("resumen-personas"));
      var filas = r.porPersona || [];
      if (!filas.length) tp.appendChild(h("tr", null, h("td", { colspan: "4", class: "vacio" }, "Todavía no hay llamadas de ninguna persona.")));
      filas.forEach(function (p) {
        tp.appendChild(h("tr", null, h("td", null, p.nombre), h("td", { style: "text-align:right" }, String(p.llamadas)),
          h("td", { style: "text-align:right" }, String(p.hoy)), h("td", { style: "text-align:right" }, String(p.demos))));
      });
    }

    var tr = vaciar($("resumen-resultados"));
    var total = Object.keys(r.porResultado).reduce(function (s, k) { return s + r.porResultado[k]; }, 0);
    Object.keys(S.d.resultados).forEach(function (k) {
      var n = r.porResultado[k] || 0;
      var abierto = S.resultadoAbierto === k;
      tr.appendChild(h("tr", { style: n ? "cursor:pointer" : "", onclick: n ? function () { S.resultadoAbierto = abierto ? null : k; pintarResumen(); } : null },
        h("td", null, (n ? (abierto ? "▾ " : "▸ ") : "") + S.d.resultados[k]), h("td", { style: "width:60px;text-align:right" }, String(n)),
        h("td", { style: "width:45%" }, h("div", { class: "barra", style: "width:" + (total ? Math.round(n / total * 100) : 0) + "%" }))));
      if (abierto && n) tr.appendChild(h("tr", null, h("td", { colspan: "3", style: "padding:0 0 10px" }, empresasConResultado(k))));
    });

    var td = vaciar($("resumen-dias"));
    var dias = Object.keys(r.porDia).sort().reverse().slice(0, 21);
    if (!dias.length) td.appendChild(h("tr", null, h("td", { class: "vacio" }, "Todavía no hay llamadas registradas.")));
    var max = Math.max.apply(null, dias.map(function (d) { return r.porDia[d]; }).concat([1]));
    dias.forEach(function (d) {
      td.appendChild(h("tr", null, h("td", null, h("span", { class: "primera", style: "display:inline-block" }, fFecha.format(new Date(d + "T12:00:00Z")))), h("td", { style: "width:60px;text-align:right" }, String(r.porDia[d])),
        h("td", { style: "width:45%" }, h("div", { class: "barra", style: "width:" + Math.round(r.porDia[d] / max * 100) + "%" }))));
    });
  }

  // ---------- Ajustes ----------
  var ajustesPintados = false;
  function pintarAjustes() {
    if (ajustesPintados || !S.d.config) return;
    ajustesPintados = true;
    var cfg = S.d.config;
    var caja = vaciar($("horario"));
    for (var dia = 1; dia <= 7; dia++) {
      var tramos = (cfg.horario && cfg.horario[String(dia)]) || [];
      var fila = h("div", { class: "tramos", "data-dia": String(dia) });
      for (var i = 0; i < 2; i++) {
        var t = tramos[i] || ["", ""];
        fila.appendChild(h("span", { class: "tramo" },
          i === 1 ? h("span", { class: "suave" }, "y de") : h("span", { class: "suave" }, "de"),
          h("input", { type: "time", value: t[0], "aria-label": DIAS[dia - 1] + " tramo " + (i + 1) + " desde" }),
          h("span", { class: "suave" }, "a"),
          h("input", { type: "time", value: t[1], "aria-label": DIAS[dia - 1] + " tramo " + (i + 1) + " hasta" })));
      }
      caja.appendChild(h("div", { class: "dia-horario" }, h("strong", null, DIAS[dia - 1]), fila));
    }
    $("a-duracion").value = String(cfg.duracion_min);
    $("a-margen").value = String(cfg.margen_min);
    $("a-antelacion").value = String(cfg.antelacion_horas);
    $("a-dias").value = String(cfg.dias_vista);
    $("a-enlace").value = cfg.enlace_reunion || "";
  }
  $("a-guardar").addEventListener("click", function () {
    var aviso = $("a-aviso");
    var horario = {};
    var mal = false;
    document.querySelectorAll("#horario .tramos").forEach(function (fila) {
      var ins = fila.querySelectorAll("input");
      var lista = [];
      for (var i = 0; i < ins.length; i += 2) {
        var a = ins[i].value, b = ins[i + 1].value;
        if (!a && !b) continue;
        if (!a || !b) mal = true;
        lista.push([a, b]);
      }
      if (lista.length) horario[fila.getAttribute("data-dia")] = lista;
    });
    if (mal) { aviso.className = "aviso mal"; aviso.textContent = "Cada tramo necesita hora de inicio y de fin."; return; }
    api({
      accion: "guardar_config",
      horario: horario,
      duracion_min: Number($("a-duracion").value),
      margen_min: Number($("a-margen").value),
      antelacion_horas: Number($("a-antelacion").value),
      dias_vista: Number($("a-dias").value),
      enlace_reunion: $("a-enlace").value,
    }).then(function () { aviso.className = "aviso bien"; aviso.textContent = "Ajustes guardados."; ajustesPintados = false; recargar(); })
      .catch(function (e) { aviso.className = "aviso mal"; aviso.textContent = e.message; });
  });

  // ---------- Arranque ----------
  $("entrar").addEventListener("click", entrar);
  $("clave").addEventListener("keydown", function (e) { if (e.key === "Enter") entrar(); });
  $("salir").addEventListener("click", salir);
  // Se refresca sola cada minuto (si no hay una ficha abierta), para ver lo que va anotando la otra persona.
  setInterval(function () {
    if (S.rol && document.visibilityState === "visible" && !$("ficha").open && !$("reserva").open && !$("editar").open && !$("envio").open && !$("guion-editor").open) recargar();
  }, 60000);
  if (S.clave) api({ accion: "entrar" }).then(function (j) { arrancar(j.rol, j.nombre, j.claveCorta); }).catch(function () { salir(); });
})();
