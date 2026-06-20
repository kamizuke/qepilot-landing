import { useState, useRef, useEffect, useCallback } from "react";
import { TYPES, emptyReportFor } from "./docTypes.js";
import Trends from "./Trends.jsx";
import Evidencias from "./Evidencias.jsx";
import { supabase } from "./supabaseClient.js";

async function askServer(payload) {
  const r = await fetch("/api/interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Error del servidor (" + r.status + ")");
  return data;
}

// Estado de vencimiento para el semáforo
function dueState(estado, fecha_limite) {
  if (estado === "cerrado") return "green";
  if (!fecha_limite) return "grey";
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const f = new Date(fecha_limite + "T00:00:00");
  const dias = Math.round((f - hoy) / 86400000);
  if (dias < 0) return "red";
  if (dias <= 7) return "amber";
  return "green";
}

export default function Workspace({ org, session, isAdmin, onChangeOrg, onSignOut, onOpenAdmin }) {
  const [view, setView] = useState("home"); // home | editor
  const [expedientes, setExpedientes] = useState(null);
  const [loadErr, setLoadErr] = useState("");

  // ---- estado del editor (entrevista) ----
  const [expedienteId, setExpedienteId] = useState(null); // id en BD si está guardado
  const [docType, setDocType] = useState(null);
  const [report, setReport] = useState({});
  const [history, setHistory] = useState([]);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState("vda");
  const [pendingImg, setPendingImg] = useState(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailText, setEmailText] = useState("");
  const [justFilled, setJustFilled] = useState({});
  const [mobileTab, setMobileTab] = useState("chat");
  const [copied, setCopied] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [draft, setDraft] = useState("");
  const [manualCopy, setManualCopy] = useState(null);
  const [estado, setEstado] = useState("abierto");
  const [saving, setSaving] = useState(false);
  const [chatWidth, setChatWidth] = useState(40); // % del ancho, redimensionable
  const draggingRef = useRef(false);
  const chatEndRef = useRef(null);
  const fileRef = useRef(null);

  const cfg = docType ? TYPES[docType] : null;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, loading]);

  // Divisor arrastrable entre chat y documento
  useEffect(() => {
    function onMove(e) {
      if (!draggingRef.current) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const pct = (x / window.innerWidth) * 100;
      setChatWidth(Math.min(70, Math.max(25, pct)));
    }
    function onUp() { draggingRef.current = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  function startDrag() {
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  // ---------- CARGA DE EXPEDIENTES ----------
  const loadExpedientes = useCallback(async () => {
    setLoadErr("");
    const { data, error } = await supabase
      .from("expedientes")
      .select("id, doc_type, titulo, estado, area, responsable_accion, fecha_limite, updated_at, created_at")
      .eq("org_id", org.id)
      .order("updated_at", { ascending: false });
    if (error) { setLoadErr(error.message); setExpedientes([]); return; }
    setExpedientes(data || []);
  }, [org.id]);

  useEffect(() => { loadExpedientes(); }, [loadExpedientes]);

  // ---------- GUARDADO ----------
  function deriveTitulo(rep, type) {
    const cfgT = TYPES[type];
    return rep[cfgT.fileRefKey] || rep[cfgT.meta[0]] || cfgT.nombre;
  }

  const saveExpediente = useCallback(async (overrides = {}) => {
    if (!docType) return;
    setSaving(true);
    const payload = {
      org_id: org.id,
      creado_por: session.user.id,
      doc_type: docType,
      titulo: deriveTitulo(report, docType),
      estado,
      area: report.area_proceso || report.area || null,
      responsable_accion: report.responsable_accion || null,
      fecha_limite: report.fecha_limite && /^\d{4}-\d{2}-\d{2}$/.test(report.fecha_limite) ? report.fecha_limite : null,
      report,
      history,
      ...overrides,
    };
    try {
      if (expedienteId) {
        const { error } = await supabase.from("expedientes").update(payload).eq("id", expedienteId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("expedientes").insert(payload).select("id").single();
        if (error) throw error;
        setExpedienteId(data.id);
      }
    } catch (e) {
      // silencioso en UI; se reintenta en el siguiente turno
      console.error("save", e.message);
    } finally {
      setSaving(false);
    }
  }, [docType, report, history, estado, expedienteId, org.id, session.user.id]);

  // autosave tras cada cambio relevante (con pequeño debounce)
  useEffect(() => {
    if (!docType || history.length === 0) return;
    const t = setTimeout(() => saveExpediente(), 800);
    return () => clearTimeout(t);
  }, [report, history, estado]); // eslint-disable-line

  // ---------- NUEVO / ABRIR / VOLVER ----------
  function startCase(type) {
    setExpedienteId(null);
    setDocType(type);
    setReport(emptyReportFor(type));
    setHistory([]);
    setChat([{ role: "assistant", text: TYPES[type].greeting }]);
    setTemplate("vda");
    setJustFilled({});
    setMobileTab("chat");
    setEstado("abierto");
    setView("editor");
  }

  async function openExpediente(row) {
    const { data, error } = await supabase.from("expedientes").select("*").eq("id", row.id).single();
    if (error) { setLoadErr(error.message); return; }
    setExpedienteId(data.id);
    setDocType(data.doc_type);
    setReport(data.report || emptyReportFor(data.doc_type));
    setHistory(data.history || []);
    setEstado(data.estado || "abierto");
    // reconstruir el chat visible desde el history
    const visible = [];
    (data.history || []).forEach((m) => {
      if (m.role === "user") {
        const txt = typeof m.content === "string" ? m.content : (m.content.find?.((b) => b.type === "text")?.text || "📎 adjunto");
        visible.push({ role: "user", text: txt });
      } else if (m.role === "assistant") {
        try { visible.push({ role: "assistant", text: JSON.parse(m.content).mensaje }); }
        catch { visible.push({ role: "assistant", text: m.content }); }
      }
    });
    setChat(visible.length ? visible : [{ role: "assistant", text: TYPES[data.doc_type].greeting }]);
    setTemplate("vda");
    setJustFilled({});
    setMobileTab("chat");
    setView("editor");
  }

  function backToHome() {
    setView("home");
    setDocType(null);
    loadExpedientes();
  }

  // ---------- ENVÍO DE MENSAJES ----------
  async function send(userContent, displayText, displayImg) {
    const userMsg = { role: "user", content: userContent };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setChat((c) => [...c, { role: "user", text: displayText, img: displayImg }]);
    setLoading(true);
    try {
      const { mensaje, updates } = await askServer({ docType, history: newHistory, report, token: session.access_token });
      setReport((r) => ({ ...r, ...updates }));
      const marks = {}; Object.keys(updates).forEach((k) => (marks[k] = Date.now()));
      setJustFilled((j) => ({ ...j, ...marks }));
      setHistory((h) => [...h, { role: "assistant", content: JSON.stringify({ mensaje, updates }) }]);
      setChat((c) => [...c, { role: "assistant", text: mensaje }]);
    } catch (err) {
      setHistory((h) => h.slice(0, -1));
      setChat((c) => [...c, { role: "assistant", text: "⚠ " + (err.message || "Fallo del motor") + ". Reintenta el último mensaje." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    if (loading) return;
    const text = input.trim();
    if (!text && !pendingImg) return;
    let content; let imgPreview = null;
    if (pendingImg) {
      content = [
        { type: "image", source: { type: "base64", media_type: pendingImg.mediaType, data: pendingImg.data } },
        { type: "text", text: text || "Adjunto foto. Descríbela e incorpórala al informe." },
      ];
      imgPreview = `data:${pendingImg.mediaType};base64,${pendingImg.data}`;
    } else { content = text; }
    send(content, text || "📷 Foto adjunta", imgPreview);
    setInput(""); setPendingImg(null);
  }

  function handleEmailSubmit() {
    const t = emailText.trim();
    if (!t || loading) return;
    setEmailOpen(false); setEmailText("");
    send(
      (cfg.pasteInstruction || "EMAIL/COMUNICACIÓN PEGADA A CONTINUACIÓN. Extrae todos los datos posibles sin volver a preguntarlos:") + "\n\n" + t,
      cfg.pasteLabel ? "📋 Hallazgo del auditor pegado" : "📧 Email pegado",
      null
    );
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1280;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setPendingImg({ data: dataUrl.split(",")[1], mediaType: "image/jpeg", name: file.name });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function buildPlainText() {
    const v = (k) => report[k] || "—";
    const lines = [cfg.docTitulo, "================================================"];
    for (let i = 0; i < cfg.meta.length; i += 2) {
      const a = cfg.meta[i], b = cfg.meta[i + 1];
      lines.push(`${cfg.labels[a]}: ${v(a)}` + (b ? `   ${cfg.labels[b]}: ${v(b)}` : ""));
    }
    cfg.sections.forEach(([codeS, title, fields]) => {
      lines.push("", `${codeS} — ${title.toUpperCase()}`);
      fields.forEach(([k]) => lines.push(`${cfg.labels[k]}: ${v(k)}`));
    });
    return lines.join("\n");
  }

  async function copyAll() {
    const txt = buildPlainText();
    try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 2000); return; } catch {}
    try {
      const ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      const ok = document.execCommand("copy"); document.body.removeChild(ta);
      if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); return; }
    } catch {}
    setManualCopy(txt);
  }

  function exportDoc() { window.print(); }

  // ---------- CAMPO EDITABLE ----------
  const Field = ({ k, multiline }) => {
    const val = report[k];
    const fresh = justFilled[k] && Date.now() - justFilled[k] < 4000;
    const pending = val && val.toUpperCase().includes("PENDIENTE");
    const editing = editingKey === k;
    function startEdit() { setEditingKey(k); setDraft(val || ""); }
    function saveEdit() { setReport((r) => ({ ...r, [k]: draft.trim() })); setEditingKey(null); }
    if (editing) {
      return (
        <div className="fld editing">
          <div className="fld-label">{cfg.labels[k]} · EDITANDO</div>
          <textarea className="fld-edit" value={draft} autoFocus rows={multiline ? 4 : 2}
            onChange={(e) => setDraft(e.target.value)} onBlur={saveEdit}
            onKeyDown={(e) => { if (e.key === "Escape") setEditingKey(null); if (e.key === "Enter" && !e.shiftKey && !multiline) { e.preventDefault(); saveEdit(); } }} />
          <div className="fld-edit-hint">Guardar: clic fuera · Cancelar: Esc</div>
        </div>
      );
    }
    return (
      <div className={`fld ${val ? "filled" : "empty"} ${fresh ? "fresh" : ""} ${pending ? "pending" : ""}`} onClick={startEdit} title="Clic para editar">
        <div className="fld-label">{cfg.labels[k]}<span className="fld-pen">✎</span></div>
        <div className={`fld-value ${multiline ? "ml" : ""}`}>{val || "Pendiente de entrevista — clic para escribir"}</div>
      </div>
    );
  };

  const DocGenerico = () => (
    <div className="doc vda">
      <div className="doc-head">
        <div><div className="doc-eyebrow">{cfg.docEyebrow}</div><div className="doc-title">{cfg.docTitulo}</div></div>
        <div className="doc-meta-grid">{cfg.meta.map((k) => <Field key={k} k={k} />)}</div>
      </div>
      {cfg.sections.map(([codeS, title, fields]) => (
        <section className="dsec" key={codeS}>
          <div className="dsec-head"><span className="dnum">{codeS}</span><span className="dtitle">{title}</span></div>
          <div className="dsec-body">{fields.map(([k, ml]) => <Field key={k} k={k} multiline={!!ml} />)}</div>
        </section>
      ))}
      <div className="doc-foot">Documento generado por entrevista asistida · {new Date().toLocaleDateString("es-ES")}</div>
    </div>
  );

  const TemplateOEM = () => (
    <div className="doc oem">
      <div className="oem-band"><div className="oem-logo">OEM</div><div className="oem-band-title">SUPPLIER CORRECTIVE ACTION REQUEST — 8D</div><div className="oem-claim"><span>Claim Nº</span><strong>{report.num_reclamacion || "—"}</strong></div></div>
      <div className="oem-grid">
        <div className="oem-cell"><Field k="cliente" /></div><div className="oem-cell"><Field k="pieza" /></div><div className="oem-cell"><Field k="referencia" /></div>
        <div className="oem-cell"><Field k="lote" /></div><div className="oem-cell"><Field k="cantidad" /></div><div className="oem-cell"><Field k="fecha_deteccion" /></div>
      </div>
      <div className="oem-cols">
        <div className="oem-col">
          <div className="oem-box"><div className="oem-box-h">D1 · TEAM</div><Field k="d1_responsable" /><Field k="d1_equipo" /></div>
          <div className="oem-box"><div className="oem-box-h">D2 · PROBLEM DESCRIPTION</div><Field k="d2_descripcion" multiline /><Field k="d2_evidencia" multiline /><Field k="detectado_por" /></div>
          <div className="oem-box urgent"><div className="oem-box-h">D3 · CONTAINMENT (24h)</div><Field k="d3_alcance_stock" multiline /><Field k="d3_accion_inmediata" multiline /><Field k="d3_identificacion" multiline /><Field k="d3_responsable_fecha" /></div>
        </div>
        <div className="oem-col">
          <div className="oem-box"><div className="oem-box-h">D4 · ROOT CAUSE</div><Field k="d4_ocurrencia" multiline /><Field k="d4_no_deteccion" multiline /></div>
          <div className="oem-box"><div className="oem-box-h">D5 + D6 · CORRECTIVE ACTIONS & VERIFICATION</div><Field k="d5_acciones" multiline /><Field k="d6_verificacion" multiline /></div>
          <div className="oem-box"><div className="oem-box-h">D7 + D8 · PREVENTION & CLOSURE</div><Field k="d7_prevencion" multiline /><Field k="d8_cierre" multiline /></div>
        </div>
      </div>
    </div>
  );

  // ===================== DASHBOARD + LISTA (HOME) =====================
  function Home() {
    const rows = expedientes || [];
    const abiertas = rows.filter((r) => r.estado !== "cerrado");
    const vencidas = abiertas.filter((r) => dueState(r.estado, r.fecha_limite) === "red");
    const mesActual = new Date().toISOString().slice(0, 7);
    const cerradasMes = rows.filter((r) => r.estado === "cerrado" && (r.updated_at || "").slice(0, 7) === mesActual);
    // antigüedad media de abiertas (días)
    const antig = abiertas.length
      ? Math.round(abiertas.reduce((s, r) => s + (Date.now() - new Date(r.created_at)) / 86400000, 0) / abiertas.length)
      : 0;
    // desgloses
    const porTipo = {}; rows.forEach((r) => { porTipo[r.doc_type] = (porTipo[r.doc_type] || 0) + 1; });
    const porArea = {}; rows.forEach((r) => { const a = r.area || "Sin área"; porArea[a] = (porArea[a] || 0) + 1; });
    const maxTipo = Math.max(1, ...Object.values(porTipo));
    const maxArea = Math.max(1, ...Object.values(porArea));

    return (
      <div className="home">
        <div className="home-head">
          <div className="home-title">Panel de calidad</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="new-btn ghost" onClick={() => setView("trends")}>Tendencias</button>
            <button className="new-btn" onClick={() => setDocType(null) || setView("picker")}>+ Nuevo expediente</button>
          </div>
        </div>

        <div className="kpis">
          <div className="kpi"><div className="kpi-num">{abiertas.length}</div><div className="kpi-lbl">Abiertas</div></div>
          <div className="kpi"><div className={`kpi-num ${vencidas.length ? "alert" : ""}`}>{vencidas.length}</div><div className="kpi-lbl">Vencidas</div></div>
          <div className="kpi"><div className="kpi-num">{antig}<span style={{ fontSize: 14 }}>d</span></div><div className="kpi-lbl">Antigüedad media</div></div>
          <div className="kpi"><div className="kpi-num">{cerradasMes.length}</div><div className="kpi-lbl">Cerradas este mes</div></div>
        </div>

        <div className="breakdowns">
          <div className="bd">
            <div className="bd-h">Por tipo de documento</div>
            {Object.keys(porTipo).length === 0 && <div className="admin-empty">Sin datos aún.</div>}
            {Object.entries(porTipo).map(([t, n]) => (
              <div className="bar-row" key={t}>
                <span className="bar-label">{TYPES[t]?.nombre || t}</span>
                <span className="bar-track"><span className="bar-fill" style={{ width: (n / maxTipo) * 100 + "%" }} /></span>
                <span className="bar-val">{n}</span>
              </div>
            ))}
          </div>
          <div className="bd">
            <div className="bd-h">Por área / proceso</div>
            {Object.keys(porArea).length === 0 && <div className="admin-empty">Sin datos aún.</div>}
            {Object.entries(porArea).map(([a, n]) => (
              <div className="bar-row" key={a}>
                <span className="bar-label">{a}</span>
                <span className="bar-track"><span className="bar-fill" style={{ width: (n / maxArea) * 100 + "%" }} /></span>
                <span className="bar-val">{n}</span>
              </div>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="empty-home">Aún no hay expedientes. Crea el primero con “+ Nuevo expediente”.</div>
        ) : (
          <table className="exp-table">
            <thead><tr><th>Estado</th><th>Tipo</th><th>Título</th><th>Área</th><th>Responsable</th><th>Fecha límite</th></tr></thead>
            <tbody>
              {[...rows].sort((a, b) => {
                const order = { red: 0, amber: 1, grey: 2, green: 3 };
                return order[dueState(a.estado, a.fecha_limite)] - order[dueState(b.estado, b.fecha_limite)];
              }).map((r) => (
                <tr key={r.id} onClick={() => openExpediente(r)}>
                  <td><span className={`pill ${r.estado}`}>{r.estado.replace("_", " ")}</span></td>
                  <td>{TYPES[r.doc_type]?.nombre || r.doc_type}</td>
                  <td>{r.titulo || "—"}</td>
                  <td>{r.area || "—"}</td>
                  <td>{r.responsable_accion || (r.estado !== "cerrado" ? <span className="unassigned">Sin asignar</span> : "—")}</td>
                  <td><span className={`dot ${dueState(r.estado, r.fecha_limite)}`} />{r.fecha_limite || (r.estado !== "cerrado" ? <span className="unassigned">Sin fecha</span> : "—")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {loadErr && <div className="admin-msg err">{loadErr}</div>}
      </div>
    );
  }

  // ===================== SELECTOR DE TIPO =====================
  function Picker() {
    return (
      <div className="picker">
        <div className="picker-brand"><div className="hdr-name">Evi<em style={{ color: "#2D5A7B", fontStyle: "normal" }}>dran</em></div><div className="hdr-tag">Nuevo expediente</div></div>
        <div className="picker-q">¿Qué necesitas resolver?</div>
        <div className="picker-sub">Evidran adaptará la entrevista y el informe al tipo de incidencia.</div>
        <div className="cards">
          <button className="card" onClick={() => startCase("d8")}>
            <div className="card-code">Reclamación de cliente</div>
            <div className="card-title">8D Report</div>
            <div className="card-desc">Un cliente ha detectado un problema en un producto o servicio. Te guía desde la contención hasta la causa raíz, las acciones correctivas y la prevención.</div>
            <div className="card-foot"><span className="card-badge">Cliente afectado</span><span className="card-arrow">→</span></div>
          </button>
          <button className="card" onClick={() => startCase("nc9001")}>
            <div className="card-code">Incidencia interna</div>
            <div className="card-title">No Conformidad Interna</div>
            <div className="card-desc">Un problema detectado dentro de la organización. Diferencia entre incidencias puntuales y problemas que requieren acción correctiva formal.</div>
            <div className="card-foot"><span className="card-badge">ISO 9001</span><span className="card-arrow">→</span></div>
          </button>
          <button className="card" onClick={() => startCase("nc17025")}>
            <div className="card-code">Laboratorios</div>
            <div className="card-title">Trabajo No Conforme</div>
            <div className="card-desc">Ensayo, calibración o actividad realizada fuera de los requisitos. Incluye evaluación de impacto, extensión y decisiones sobre informes emitidos.</div>
            <div className="card-foot"><span className="card-badge">ISO/IEC 17025</span><span className="card-arrow">→</span></div>
          </button>
          <button className="card" onClick={() => startCase("ncAudit")}>
            <div className="card-code">Auditoría</div>
            <div className="card-title">Respuesta a Hallazgo</div>
            <div className="card-desc">Gestiona no conformidades y observaciones de auditorías externas. Construye la causa raíz, el plan de acción y la respuesta para la entidad.</div>
            <div className="card-foot"><span className="card-badge">ENAC · Certificadoras</span><span className="card-arrow">→</span></div>
          </button>
        </div>
        <button className="linkbtn2" onClick={() => setView("home")}>← Volver al panel</button>
      </div>
    );
  }

  // ===================== TOP BAR =====================
  const TopBar = ({ children }) => (
    <header className="hdr">
      {children}
      <div className="hdr-spacer" />
      <div className="ws-org">org: <strong>{org.nombre}</strong></div>
      <button className="hbtn" onClick={onChangeOrg}>CAMBIAR ORG</button>
      {isAdmin && <button className="hbtn" onClick={onOpenAdmin}>ADMIN</button>}
      <button className="hbtn" onClick={onSignOut}>SALIR</button>
    </header>
  );

  // ===================== RENDER PRINCIPAL =====================
  if (view === "home") {
    if (expedientes === null) {
      return (<><TopBar><div className="hdr-brand"><div className="hdr-name">Evi<em>dran</em></div></div></TopBar><div className="home"><div className="empty-home">Cargando expedientes…</div></div></>);
    }
    return (<><TopBar><div className="hdr-brand"><div className="hdr-name">Evi<em>dran</em></div></div></TopBar><Home /></>);
  }

  if (view === "trends") {
    if (expedientes === null) {
      return (<><TopBar><div className="hdr-brand"><div className="hdr-name">Evi<em>dran</em></div></div></TopBar><div className="home"><div className="empty-home">Cargando…</div></div></>);
    }
    return (
      <>
        <TopBar><button className="hbtn back" onClick={() => setView("home")} title="Volver al panel">←</button><div className="hdr-brand"><div className="hdr-name">Evi<em>dran</em></div><div className="hdr-tag">Tendencias</div></div></TopBar>
        <Trends rows={expedientes} org={org} session={session} />
      </>
    );
  }

  if (view === "picker") {
    return (<><TopBar><div className="hdr-brand"><div className="hdr-name">Evi<em>dran</em></div></div></TopBar><Picker /></>);
  }

  // ---- EDITOR ----
  return (
    <>
      <header className="hdr">
        <button className="hbtn back" onClick={backToHome} title="Volver al panel">←</button>
        <div className="hdr-brand"><div className="hdr-name">Evi<em>dran</em></div><div className="hdr-tag">{cfg.nombre}{saving ? " · guardando…" : " · guardado"}</div></div>
        <div className="hdr-spacer" />
        <select className="estado-sel" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="abierto">Abierto</option>
          <option value="en_curso">En curso</option>
          <option value="cerrado">Cerrado</option>
        </select>
        {docType === "d8" && (
          <div className="seg">
            <button className={template === "vda" ? "on" : ""} onClick={() => setTemplate("vda")}>8D GENÉRICO</button>
            <button className={template === "oem" ? "on" : ""} onClick={() => setTemplate("oem")}>FORMATO OEM</button>
          </div>
        )}
        <button className={`hbtn ${copied ? "copied" : ""}`} onClick={copyAll}>{copied ? "✓ COPIADO" : "COPIAR"}</button>
        <button className="hbtn" onClick={exportDoc}>EXPORTAR PDF</button>
      </header>

      <div className="tabs">
        <button className={mobileTab === "chat" ? "on" : ""} onClick={() => setMobileTab("chat")}>ENTREVISTA</button>
        <button className={mobileTab === "doc" ? "on" : ""} onClick={() => setMobileTab("doc")}>DOCUMENTO</button>
      </div>

      <div className="main">
        <div className={`chatpane ${mobileTab !== "chat" ? "hide" : ""}`} style={{ width: chatWidth + "%" }}>
          <div className="msgs">
            {chat.map((m, i) => (<div key={i} className={`msg ${m.role}`}>{m.img && <img src={m.img} alt="adjunto" />}{m.text}</div>))}
            {loading && <div className="typing">REDACTANDO</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="composer">
            {pendingImg && (<div className="imgchip">📷 {pendingImg.name}<button onClick={() => setPendingImg(null)}>✕</button></div>)}
            <div className="row">
              <textarea value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Cuenta qué ha pasado, con tus palabras…" />
              <button className="send" onClick={handleSend} disabled={loading}>Enviar</button>
            </div>
            <div className="tools">
              <button className="tool" onClick={() => fileRef.current?.click()}>+ FOTO</button>
              <button className="tool" onClick={() => setEmailOpen(true)}>{cfg.pasteLabel || "+ PEGAR EMAIL / COMUNICACIÓN"}</button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
            </div>
          </div>
        </div>
        <div className="divider" onMouseDown={startDrag} onTouchStart={startDrag} title="Arrastra para ajustar el ancho"><span /></div>
        <div className={`docpane ${mobileTab !== "doc" ? "hide" : ""}`}>
          {docType === "d8" && template === "oem" ? <TemplateOEM /> : <DocGenerico />}
          {expedienteId
            ? <Evidencias orgId={org.id} expedienteId={expedienteId} />
            : <div className="ev-panel"><div className="ev-head"><span className="ev-title">Evidencias</span></div><div className="ev-empty">Las evidencias se podrán adjuntar en cuanto el expediente quede guardado (tras la primera respuesta).</div></div>}
        </div>
      </div>

      {manualCopy && (
        <div className="overlay" onClick={() => setManualCopy(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Copia manual</h3>
            <p>El navegador bloqueó la copia automática. El texto ya está seleccionado: pulsa Ctrl+C y cierra.</p>
            <textarea readOnly value={manualCopy} autoFocus onFocus={(e) => e.target.select()} />
            <div className="modal-row"><button className="btn-pri" onClick={() => setManualCopy(null)}>Cerrar</button></div>
          </div>
        </div>
      )}

      {emailOpen && (
        <div className="overlay" onClick={() => setEmailOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{cfg.pasteLabel ? "Pegar hallazgo del auditor" : "Pegar email o comunicación"}</h3>
            <p>Pega el texto completo. Se extraerán los datos sin volver a preguntarlos.</p>
            <textarea value={emailText} onChange={(e) => setEmailText(e.target.value)} placeholder="Texto…" />
            <div className="modal-row"><button className="btn-sec" onClick={() => setEmailOpen(false)}>Cancelar</button><button className="btn-pri" onClick={handleEmailSubmit}>Extraer datos</button></div>
          </div>
        </div>
      )}
    </>
  );
}
