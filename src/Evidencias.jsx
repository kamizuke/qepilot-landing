import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient.js";

const TIPOS_OK = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg", "image/png", "image/webp", "image/gif",
];
const MAX_MB = 15;

function icono(nombre) {
  const n = (nombre || "").toLowerCase();
  if (n.endsWith(".pdf")) return "PDF";
  if (n.endsWith(".doc") || n.endsWith(".docx")) return "DOC";
  if (n.endsWith(".xls") || n.endsWith(".xlsx")) return "XLS";
  if (/\.(jpg|jpeg|png|webp|gif)$/.test(n)) return "IMG";
  return "FILE";
}

function tamano(bytes) {
  if (bytes == null) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function Evidencias({ orgId, expedienteId }) {
  const [files, setFiles] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const prefix = `${orgId}/${expedienteId}`;

  async function cargar() {
    setErr("");
    const { data, error } = await supabase.storage.from("evidencias").list(prefix, {
      limit: 100, sortBy: { column: "created_at", order: "desc" },
    });
    if (error) { setErr("No se pudieron cargar las evidencias"); setFiles([]); return; }
    setFiles(data || []);
  }

  useEffect(() => { if (expedienteId) cargar(); /* eslint-disable-next-line */ }, [expedienteId]);

  async function subir(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!TIPOS_OK.includes(file.type)) { setErr("Tipo no permitido. Usa PDF, Word, Excel o imagen."); return; }
    if (file.size > MAX_MB * 1048576) { setErr(`El archivo supera ${MAX_MB} MB.`); return; }
    setBusy(true); setErr("");
    const safe = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${prefix}/${Date.now()}_${safe}`;
    const { error } = await supabase.storage.from("evidencias").upload(path, file, {
      contentType: file.type, upsert: false,
    });
    setBusy(false);
    if (error) { setErr("Error al subir: " + error.message); return; }
    cargar();
  }

  async function descargar(name) {
    const path = `${prefix}/${name}`;
    const { data, error } = await supabase.storage.from("evidencias").createSignedUrl(path, 60);
    if (error || !data?.signedUrl) { setErr("No se pudo generar el enlace"); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function borrar(name) {
    if (!confirm("¿Eliminar esta evidencia? No se puede deshacer.")) return;
    const path = `${prefix}/${name}`;
    setBusy(true);
    const { error } = await supabase.storage.from("evidencias").remove([path]);
    setBusy(false);
    if (error) { setErr("No se pudo eliminar"); return; }
    cargar();
  }

  function nombreVisible(n) {
    // quita el prefijo de timestamp "1234567890_"
    return n.replace(/^\d+_/, "");
  }

  return (
    <div className="ev-panel">
      <div className="ev-head">
        <span className="ev-title">Evidencias</span>
        <label className="ev-add">
          {busy ? "…" : "+ Adjuntar"}
          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif" onChange={subir} disabled={busy} style={{ display: "none" }} />
        </label>
      </div>
      <div className="ev-hint">PDF, Word, Excel o imagen · máx. {MAX_MB} MB · privadas</div>
      {err && <div className="ev-err">{err}</div>}

      {files === null && <div className="ev-empty">Cargando…</div>}
      {files && files.length === 0 && <div className="ev-empty">Sin evidencias adjuntas todavía.</div>}
      {files && files.length > 0 && (
        <div className="ev-list">
          {files.map((f) => (
            <div className="ev-item" key={f.name}>
              <span className={`ev-ico ${icono(f.name).toLowerCase()}`}>{icono(f.name)}</span>
              <span className="ev-meta">
                <span className="ev-name" title={nombreVisible(f.name)}>{nombreVisible(f.name)}</span>
                <span className="ev-size">{tamano(f.metadata?.size)}</span>
              </span>
              <button className="ev-btn" onClick={() => descargar(f.name)} title="Descargar">↓</button>
              <button className="ev-btn del" onClick={() => borrar(f.name)} title="Eliminar">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
