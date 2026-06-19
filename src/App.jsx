import { useState, useEffect } from "react";
import {
  ArrowRight, MessageSquareText, Sparkles, FileCheck2,
  Zap, GitBranch, PenLine, TrendingUp, Check,
  ShieldCheck, Lock, Users, Download, Eye, Server,
  ClipboardCheck, FlaskConical, Car, Leaf, HardHat, ShieldHalf,
  ChevronDown, Play, X,
} from "lucide-react";

const DEMO_EMAIL = "mailto:demo@evidran.com?subject=Solicitud%20de%20demo%20de%20Evidran";
const LOGIN_URL = "https://ochod-demo.vercel.app";

export default function App() {
  // Demos animadas (HTML autocontenidos servidos desde /public/mockups), con el
  // color de cada sistema: azul calidad, mostaza SST. La key fuerza el reinicio
  // de la animación al cambiar de pestaña.
  const [openDemo, setOpenDemo] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth <= 820);
  useEffect(() => {
    const onR = () => setIsMobile(window.innerWidth <= 820);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  const DEMOS = {
    nc9001: { src: "/mockups/editor-demo-nc9001.html", label: "Calidad · ISO 9001", color: "#2563EB", alto: 1000 },
    sst: { src: "/mockups/editor-demo-sst.html", label: "Seguridad y salud · ISO 45001", color: "#B45309", alto: 1140 },
  };
  // Modal de demo: cierra con Esc y bloquea el scroll del fondo mientras está abierto.
  useEffect(() => {
    if (!openDemo) return;
    const onKey = (e) => e.key === "Escape" && setOpenDemo(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [openDemo]);
  return (
    <div>
      <div className="hero-outer">
        <nav className="nav">
          <div className="nav-row">
            <div className="nav-brand"><img src="/logo-evidran.png" alt="Evidran" className="brand-logo" /></div>
            <div className="nav-links">
              <a href="#como">Cómo funciona</a>
              <a href="#porque">Por qué</a>
              <a href="#casos">Casos de uso</a>
              <a href="#planes">Planes</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="nav-actions">
              <a className="nav-login" href={LOGIN_URL} target="_blank" rel="noopener">Acceder</a>
              <a className="nav-cta" href={DEMO_EMAIL}>Pedir demo</a>
            </div>
          </div>
        </nav>
        <div className="hero-pad">
          <div className="hero-card hero">
            <div className="hero-grid">
              <div className="hero-text">
                <span className="hero-eyebrow"><span className="dot" />Elaborado para entornos certificados</span>
                <h1>El copiloto para <span className="accent">sistemas de gestión.</span></h1>
                <p className="hero-sub">
                  Documenta no conformidades, auditorías, trabajos no conformes y acciones correctivas
                  con el criterio de un responsable de calidad experimentado.
                </p>
                <div className="hero-actions">
                  <a className="btn-primary" href={DEMO_EMAIL} target="_blank" rel="noopener">
                    Pedir demo <span className="circle"><ArrowRight size={16} /></span>
                  </a>
                  <a className="btn-link" href="#como">Ver cómo funciona <ArrowRight size={15} /></a>
                </div>
              </div>
              <div className="hero-img">
                <img src="/hero.png" alt="Evidran transforma incidencias dispersas en un informe de no conformidad estructurado" loading="eager" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section wrap" id="como">
        <div className="eyebrow">Cómo funciona Evidran</div>
        <h2 className="h2" style={{ maxWidth: "20ch", marginBottom: 56 }}>De la incidencia al informe en tres pasos.</h2>
        <div className="steps">
          <div className="step">
            <div className="step-n">01</div>
            <div className="step-ico"><MessageSquareText size={22} /></div>
            <h3>Describe qué ha pasado</h3>
            <p>Explica la incidencia en lenguaje natural. Sin formularios. Sin plantillas.</p>
          </div>
          <div className="step-arrow"><ArrowRight size={20} /></div>
          <div className="step">
            <div className="step-n">02</div>
            <div className="step-ico"><Sparkles size={22} /></div>
            <h3>Evidran hace las preguntas correctas</h3>
            <p>La IA adapta la profundidad de la entrevista a la gravedad y a si el problema puede repetirse.</p>
          </div>
          <div className="step-arrow"><ArrowRight size={20} /></div>
          <div className="step">
            <div className="step-n">03</div>
            <div className="step-ico"><FileCheck2 size={22} /></div>
            <h3>Genera un informe listo para auditoría</h3>
            <p>Recibe un informe estructurado con corrección, causa raíz, acción correctiva y verificación de eficacia cuando hace falta.</p>
          </div>
        </div>
        <div className="livedemo" style={{ marginTop: 8, textAlign: "center" }}>
          <div className="livedemo-cap" style={{ fontSize: 14, color: "#5F5E5A", marginBottom: 14 }}>
            Míralo en acción — las preguntas se adaptan a cada sistema de gestión.
          </div>
          <div className="livedemo-tabs" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {Object.entries(DEMOS).map(([k, d]) => (
              <button
                key={k}
                type="button"
                onClick={() => setOpenDemo(k)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 20px", borderRadius: 10, border: 0,
                  background: d.color, color: "#fff",
                  fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                <Play size={16} /> Ver demo · {d.label}
              </button>
            ))}
          </div>
        </div>

        {openDemo && (
          <div
            onClick={() => setOpenDemo(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(15,19,25,.72)", zIndex: 100, overflow: "auto", padding: isMobile ? 0 : "56px 20px 24px", display: "flex", justifyContent: "center", alignItems: isMobile ? "stretch" : "flex-start" }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "100%", maxWidth: isMobile ? "100%" : 1180, margin: isMobile ? 0 : "auto" }}>
              <button
                type="button"
                onClick={() => setOpenDemo(null)}
                aria-label="Cerrar"
                style={isMobile
                  ? { position: "absolute", top: 8, right: 8, zIndex: 2, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(22,29,38,.85)", border: 0, color: "#fff", fontFamily: "inherit", fontSize: 13, cursor: "pointer", padding: "8px 12px", borderRadius: 8 }
                  : { position: "absolute", top: -42, right: 0, display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: 0, color: "#fff", fontFamily: "inherit", fontSize: 14, cursor: "pointer" }}
              >
                <X size={18} /> Cerrar
              </button>
              <iframe
                src={DEMOS[openDemo].src}
                title="Evidran: de la incidencia al informe, en vivo"
                style={{ width: "100%", height: isMobile ? "100vh" : DEMOS[openDemo].alto, border: 0, borderRadius: isMobile ? 0 : 16, display: "block", background: "#ECEAE3" }}
              />
            </div>
          </div>
        )}

        <div className="feature-strip">
          <div className="fs-text">
            <div className="fs-tag">Novedad</div>
            <h3>Tendencias y revisión por la dirección</h3>
            <p>Evidran reúne tus no conformidades en indicadores claros y redacta el resumen de entrada para la revisión por la dirección (ISO 9001, 9.3) con IA. Lo que antes montabas a mano en una hoja, listo en segundos.</p>
          </div>
          <div className="panel">
            <div className="panel-bar"><span /><span /><span /></div>
            <div className="panel-body">
              <div className="panel-kpis">
                <div className="pk"><div className="pk-n">142</div><div className="pk-l">Expedientes</div></div>
                <div className="pk"><div className="pk-n alert">7</div><div className="pk-l">Vencidas</div></div>
                <div className="pk"><div className="pk-n">23<small>d</small></div><div className="pk-l">Cierre medio</div></div>
                <div className="pk"><div className="pk-n">88<small>%</small></div><div className="pk-l">Tasa cierre</div></div>
              </div>
              <div className="panel-chart-h">Altas y cierres por mes</div>
              <div className="panel-chart">
                {[[60,45],[75,58],[52,61],[88,70],[64,72],[80,76]].map((p, i) => (
                  <div className="pc-col" key={i}>
                    <div className="pc-bars">
                      <span className="pc-bar open" style={{ height: p[0] + "%" }} />
                      <span className="pc-bar close" style={{ height: p[1] + "%" }} />
                    </div>
                    <div className="pc-lbl">{["ene","feb","mar","abr","may","jun"][i]}</div>
                  </div>
                ))}
              </div>
              <div className="panel-areas">
                <div className="pa-row"><span className="pa-lbl">Producción</span><span className="pa-track"><span style={{ width: "100%" }} /></span><span className="pa-v">48</span></div>
                <div className="pa-row"><span className="pa-lbl">Logística</span><span className="pa-track"><span style={{ width: "62%" }} /></span><span className="pa-v">30</span></div>
                <div className="pa-row"><span className="pa-lbl">Compras</span><span className="pa-track"><span style={{ width: "40%" }} /></span><span className="pa-v">19</span></div>
                <div className="pa-row"><span className="pa-lbl">Laboratorio</span><span className="pa-track"><span style={{ width: "27%" }} /></span><span className="pa-v">13</span></div>
              </div>
              <div className="panel-ai">
                <div className="pa-ai-h">Resumen para revisión por la dirección · IA</div>
                <p>Durante el primer semestre se registraron 142 no conformidades, con una tasa de cierre del 88 % y un tiempo medio de resolución de 23 días. La concentración en Producción (34 %) sugiere revisar los controles de la línea de montaje…</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section wrap">
        <div className="eyebrow">Si trabajas en calidad…</div>
        <h2 className="h2" style={{ maxWidth: "22ch" }}>Esto probablemente te suena.</h2>
        <ul className="pains">
          <li>No conformidades redactadas de forma distinta según quién las escribe.</li>
          <li>Acciones correctivas débiles que no evitan que el problema vuelva.</li>
          <li>Causas raíz que se quedan en “error humano”.</li>
          <li>Horas preparando respuestas a auditorías.</li>
          <li>Revisiones por la dirección montadas a mano desde hojas sueltas.</li>
        </ul>
        <p className="pains-close">Evidran ayuda a los equipos de calidad a pasar de documentar a mejorar.</p>
      </section>

      <section className="section wrap" id="porque">
        <div className="eyebrow">Por qué los equipos de calidad usan Evidran</div>
        <h2 className="h2" style={{ maxWidth: "20ch" }}>El rigor que pide la norma, sin el peso del papeleo.</h2>
        <div className="cards">
          <div className="card">
            <div className="card-ico"><Zap size={22} /></div>
            <h3>Cierra rápido las NC simples</h3>
            <p>Una firma que falta no debería exigir un proceso completo de acción correctiva.</p>
          </div>
          <div className="card">
            <div className="card-ico"><GitBranch size={22} /></div>
            <h3>Profundiza cuando el problema importa</h3>
            <p>Evidran ayuda a identificar causas sistémicas en lugar de detenerse en el “error humano”.</p>
          </div>
          <div className="card">
            <div className="card-ico"><PenLine size={22} /></div>
            <h3>Elimina el folio en blanco</h3>
            <p>Empieza describiendo el problema. Evidran estructura todo lo demás.</p>
          </div>
          <div className="card">
            <div className="card-ico"><TrendingUp size={22} /></div>
            <h3>Convierte incidencias en mejora</h3>
            <p>Identifica causas recurrentes, procesos débiles y oportunidades de mejora.</p>
          </div>
        </div>
      </section>

      <section className="section wrap">
        <div className="eyebrow">Pensado para</div>
        <h2 className="h2" style={{ maxWidth: "22ch" }}>Equipos que trabajan bajo sistemas de gestión auditados.</h2>
        <div className="builtfor">
          <div className="bf"><div className="bf-ico"><ClipboardCheck size={20} /></div><div><div className="bf-t">Gestión de Calidad</div><div className="bf-s">ISO 9001</div></div></div>
          <div className="bf"><div className="bf-ico"><Leaf size={20} /></div><div><div className="bf-t">Medioambiente</div><div className="bf-s">ISO 14001</div></div></div>
          <div className="bf"><div className="bf-ico"><FlaskConical size={20} /></div><div><div className="bf-t">Laboratorios</div><div className="bf-s">ISO/IEC 17025</div></div></div>
          <div className="bf"><div className="bf-ico"><HardHat size={20} /></div><div><div className="bf-t">Seguridad y Salud</div><div className="bf-s">ISO 45001</div></div></div>
          <div className="bf soon"><div className="bf-ico"><Car size={20} /></div><div><div className="bf-t">Calidad Automoción <span className="soon-tag">Próximamente</span></div><div className="bf-s">IATF 16949</div></div></div>
          <div className="bf soon"><div className="bf-ico"><ShieldHalf size={20} /></div><div><div className="bf-t">Seguridad de la Información <span className="soon-tag">Próximamente</span></div><div className="bf-s">ISO 27001</div></div></div>
        </div>
      </section>

      <section className="section wrap" id="casos">
        <div className="eyebrow">Evidran en la práctica</div>
        <h2 className="h2" style={{ marginBottom: 16 }}>Casos de uso</h2>
        <p className="lead" style={{ fontSize: "1.1rem", maxWidth: "62ch", marginTop: 10 }}>
          Apoyo práctico para documentar qué pasó, por qué pasó y qué se va a hacer, sin formularios
          interminables ni páginas en blanco.
        </p>
        <div className="uc-grid">
          <div className="uc-box">
            <div className="uc-eyebrow">Incidencias internas</div>
            <h3>No conformidades internas</h3>
            <p>Distingue entre incidencias puntuales y problemas que requieren una acción correctiva real. Evita causas superficiales y ayuda a llegar a la causa raíz.</p>
            <div className="uc-foot"><span className="uc-badge">ISO 9001</span><ArrowRight className="uc-arrow" size={18} /></div>
          </div>
          <div className="uc-box">
            <div className="uc-eyebrow">Auditorías</div>
            <h3>Hallazgos de auditoría</h3>
            <p>Prepara respuestas estructuradas para certificadoras y entidades de acreditación, manteniendo coherencia entre el hallazgo, la causa raíz y el plan de acción.</p>
            <div className="uc-foot"><span className="uc-badge">ENAC · Certificadoras</span><ArrowRight className="uc-arrow" size={18} /></div>
          </div>
          <div className="uc-box">
            <div className="uc-eyebrow">Reclamaciones de cliente</div>
            <h3>Informes 8D</h3>
            <p>Guía la investigación paso a paso para que el equipo documente contención, causas, acciones y prevención sin olvidar ninguna disciplina.</p>
            <div className="uc-foot"><span className="uc-badge">8D Report</span><ArrowRight className="uc-arrow" size={18} /></div>
          </div>
          <div className="uc-box">
            <div className="uc-eyebrow">Laboratorios</div>
            <h3>Trabajo no conforme</h3>
            <p>Documenta desviaciones, evalúa su impacto y analiza si es necesario actuar sobre informes emitidos o comunicar al cliente.</p>
            <div className="uc-foot"><span className="uc-badge">ISO/IEC 17025</span><ArrowRight className="uc-arrow" size={18} /></div>
          </div>
          <div className="uc-box">
            <div className="uc-eyebrow">Medio ambiente</div>
            <h3>No conformidades ambientales</h3>
            <p>Registra el aspecto y el impacto ambiental, contempla la comunicación a la administración y deja marcados los requisitos legales para verificarlos.</p>
            <div className="uc-foot"><span className="uc-badge">ISO 14001</span><ArrowRight className="uc-arrow" size={18} /></div>
          </div>
          <div className="uc-box">
            <div className="uc-eyebrow">Seguridad y salud</div>
            <h3>No conformidades SST</h3>
            <p>Incidente, accidente, casi accidente o riesgo laboral. Analiza el peligro, la consecuencia potencial y el nivel de riesgo, y separa la corrección de la acción correctiva.</p>
            <div className="uc-foot"><span className="uc-badge">ISO 45001</span><ArrowRight className="uc-arrow" size={18} /></div>
          </div>
        </div>
        <p className="uc-note">Todos los expedientes se construyen mediante entrevistas guiadas, no mediante formularios.</p>
      </section>

      <section className="section wrap" id="planes">
        <div className="eyebrow">Planes</div>
        <h2 className="h2" style={{ maxWidth: "22ch" }}>Planes simples para equipos de calidad.</h2>
        <p className="lead" style={{ fontSize: "1.1rem", maxWidth: "60ch", marginTop: 8 }}>
          Desde la documentación de no conformidades hasta el análisis de tendencias y la revisión por la dirección.
        </p>
        <div className="prices">
          <div className="price">
            <div className="pname">Starter</div>
            <div className="pamt">99 €<small> /mes</small></div>
            <div className="pdesc">Para pequeñas organizaciones que quieren dejar atrás Word y Excel.</div>
            <ul>
              <li><Check size={17} /> No conformidades internas ISO 9001</li>
              <li><Check size={17} /> No conformidades ISO 14001</li>
              <li><Check size={17} /> Respuesta asistida a NC de auditoría</li>
              <li><Check size={17} /> Entrevistas guiadas por IA</li>
              <li><Check size={17} /> Corrección vs. acción correctiva</li>
              <li><Check size={17} /> Causa raíz asistida</li>
              <li><Check size={17} /> Informes PDF y dashboard de seguimiento</li>
              <li><Check size={17} /> Hasta 2 usuarios · Datos alojados en Europa</li>
            </ul>
            <a className="pbtn ghost" href={DEMO_EMAIL} target="_blank" rel="noopener">Solicitar demo</a>
          </div>
          <div className="price feat">
            <div className="pname">Professional</div>
            <div className="pamt">199 €<small> /mes</small></div>
            <div className="pdesc">Para organizaciones que gestionan acciones correctivas y mejora continua.</div>
            <div className="pincl">Incluye todo lo anterior, más:</div>
            <ul>
              <li><Check size={17} /> Trabajo no conforme ISO/IEC 17025</li>
              <li><Check size={17} /> Análisis de tendencias</li>
              <li><Check size={17} /> Detección de causas recurrentes</li>
              <li><Check size={17} /> Seguimiento de eficacia</li>
              <li><Check size={17} /> Indicadores para Revisión por la Dirección (9.3)</li>
              <li><Check size={17} /> Informes avanzados</li>
              <li><Check size={17} /> Hasta 5 usuarios</li>
            </ul>
            <a className="pbtn dark" href={DEMO_EMAIL} target="_blank" rel="noopener">Solicitar demo</a>
          </div>
          <div className="price">
            <div className="pname">Business</div>
            <div className="pamt">Desde 399 €<small> /mes</small></div>
            <div className="pdesc">Para grupos empresariales y organizaciones con varias sedes.</div>
            <div className="pincl">Incluye todo lo anterior, más:</div>
            <ul>
              <li><Check size={17} /> Multiempresa</li>
              <li><Check size={17} /> Multisede</li>
              <li><Check size={17} /> Gestión avanzada de permisos</li>
              <li><Check size={17} /> Informes personalizados</li>
              <li><Check size={17} /> Exportaciones avanzadas</li>
              <li><Check size={17} /> Soporte prioritario</li>
              <li><Check size={17} /> Acceso anticipado a nuevos módulos</li>
            </ul>
            <a className="pbtn ghost" href={DEMO_EMAIL} target="_blank" rel="noopener">Solicitar demo</a>
          </div>
        </div>
        <p className="price-note">Usuarios adicionales: 25 €/mes · No conformidades e informes ilimitados en todos los planes · Sin costes de implantación.</p>
      </section>

      <section className="section wrap">
        <div className="eyebrow">Confianza</div>
        <h2 className="h2" style={{ maxWidth: "22ch" }}>Pensado para información sensible de sistemas de gestión.</h2>
        <div className="sec-grid">
          <div className="sec-item"><Server size={19} /><span>Datos alojados en Europa</span></div>
          <div className="sec-item"><Lock size={19} /><span>Conexión cifrada (TLS)</span></div>
          <div className="sec-item"><Users size={19} /><span>Acceso por organización, aislado entre clientes</span></div>
          <div className="sec-item"><Download size={19} /><span>Registros exportables en todo momento</span></div>
          <div className="sec-item"><Eye size={19} /><span>Transparencia sobre el uso de IA</span></div>
          <div className="sec-item"><ShieldCheck size={19} /><span>Los datos de cliente no se usan para entrenar modelos públicos cuando el proveedor de IA lo permite</span></div>
        </div>
      </section>

      <section className="section wrap" id="faq">
        <div className="eyebrow">Preguntas frecuentes</div>
        <h2 className="h2" style={{ maxWidth: "22ch", marginBottom: 44 }}>Lo que nos preguntan antes de empezar.</h2>
        <div className="faq-list">
          <details className="faq-item">
            <summary>¿En qué se diferencia de mis plantillas de Word?<ChevronDown className="faq-chevron" size={18} /></summary>
            <p>Las plantillas no te entrevistan, no evitan causas pobres, no te avisan de vencimientos ni te dan objetivos. Evidran sí. Le hablas y el informe se redacta solo, con criterio de calidad de verdad detrás.</p>
          </details>
          <details className="faq-item">
            <summary>¿La IA se inventa cosas?<ChevronDown className="faq-chevron" size={18} /></summary>
            <p>No. Redacta a partir de lo que tú le cuentas. Los hallazgos y porcentajes son cálculos sobre tus datos, no invención. Los objetivos son sugerencias ancladas al dato real, y siempre editables.</p>
          </details>
          <details className="faq-item">
            <summary>Llevo varias normas yo solo. ¿Me sirve?<ChevronDown className="faq-chevron" size={18} /></summary>
            <p>Para eso está pensado Evidran. Una sola herramienta para ISO 9001, 14001, 45001, 17025 y 8D de cliente — calidad, medioambiente, seguridad y laboratorio en la misma conversación, gestionados por una sola persona con poco tiempo.</p>
          </details>
          <details className="faq-item">
            <summary>¿Puedo usar mi propia codificación de expedientes?<ChevronDown className="faq-chevron" size={18} /></summary>
            <p>Sí. El código de cada expediente es editable, así que respetamos la nomenclatura que ya uses. Y si prefieres delegarlo, Evidran activa por organización una numeración consecutiva tipo NC-AAAA-NNN que se reinicia cada año, con un contador que no deja huecos ni duplicados aunque dos personas abran una NC a la vez. Tú eliges.</p>
          </details>
          <details className="faq-item">
            <summary>¿Cómo garantiza la trazabilidad de cara al auditor?<ChevronDown className="faq-chevron" size={18} /></summary>
            <p>Cada expediente lleva responsable y fecha límite explícitos, estados (abierto / en curso / cerrado) y un semáforo de vencimiento. Puedes bloquearlo en solo lectura para congelarlo, con traza de quién lo bloqueó y cuándo, incluidas las reaperturas. Las evidencias quedan adjuntas al expediente y se descargan con enlaces firmados y temporales. Es exactamente el rastro que una certificadora espera encontrar.</p>
          </details>
          <details className="faq-item">
            <summary>«Esto ya nos pasó antes» — ¿puedo recuperar cómo se resolvió?<ChevronDown className="faq-chevron" size={18} /></summary>
            <p>Sí. El historial es consultable por palabra clave sobre la causa raíz, la descripción y la solución, con filtros por tipo, área y rango de fechas. Cuando vuelve a aparecer un problema parecido, encuentras cómo se atajó la última vez en lugar de empezar de cero. El conocimiento deja de irse con la persona que lo resolvió.</p>
          </details>
          <details className="faq-item">
            <summary>¿Mis datos están seguros?<ChevronDown className="faq-chevron" size={18} /></summary>
            <p>Aislados por empresa a nivel de base de datos: cada organización solo ve lo suyo. Las evidencias son privadas con enlaces de descarga firmados y temporales, y la IA recibe solo lo mínimo imprescindible (la Revisión por la Dirección, por ejemplo, se genera con estadísticas agregadas, no con expedientes completos).</p>
          </details>
        </div>
      </section>

      <section className="section">
        <div className="cta-card">
          <h2>Convierte las incidencias en acciones claras.</h2>
          <p>Dedica menos tiempo a redactar informes y más a mejorar tu organización.</p>
          <a className="btn-primary" href={DEMO_EMAIL} target="_blank" rel="noopener" style={{ margin: "0 auto" }}>
            Pedir demo <span className="circle"><ArrowRight size={16} /></span>
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-row wrap">
          <div className="footer-brand"><img src="/logo-evidran.png" alt="Evidran" className="brand-logo brand-logo-footer" /></div>
          <p>Copiloto de calidad con IA · Documentación de no conformidades y acciones correctivas</p>
        </div>
      </footer>
    </div>
  );
}
