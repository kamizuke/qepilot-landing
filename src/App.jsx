import {
  ArrowRight, MessageSquareText, GitBranch, FileCheck2, TrendingUp,
  Zap, RefreshCw, PenLine, ClipboardList, Check, ShieldCheck,
  Lock, Users, Download, Eye, Server,
} from "lucide-react";

const DEMO_EMAIL = "mailto:hola@qepilot.com?subject=Solicitud%20de%20demo%20QEPilot";

function LogoIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  );
}

const STANDARDS = ["ISO 9001", "ISO/IEC 17025", "IATF 16949", "8D", "CAPA", "NCR", "Auditorías"];

export default function App() {
  return (
    <div>
      {/* NAV + HERO */}
      <div className="hero-outer">
        <nav className="nav">
          <div className="nav-row">
            <div className="nav-brand"><LogoIcon /><span>QEPilot</span></div>
            <div className="nav-links">
              <a href="#producto">Producto</a>
              <a href="#casos">Casos de uso</a>
              <a href="#normas">Normas</a>
              <a href="#planes">Planes</a>
            </div>
            <a className="nav-cta" href={DEMO_EMAIL}>Pedir demo</a>
          </div>
        </nav>

        <div className="hero-pad">
          <div className="hero-card hero">
            <span className="hero-eyebrow"><span className="dot" />Copiloto de calidad con IA</span>
            <h1>Trabajo de calidad,<br /><span className="accent">sin el papeleo</span></h1>
            <p className="hero-sub">
              QEPilot ayuda a los equipos de calidad a documentar no conformidades, informes 8D y acciones
              correctivas mediante una entrevista guiada por IA. Más rápido, más claro y listo para auditoría.
            </p>
            <div className="hero-actions">
              <a className="btn-primary" href={DEMO_EMAIL}>
                Pedir demo <span className="circle"><ArrowRight size={16} /></span>
              </a>
              <a className="btn-link" href="#producto">Ver cómo funciona <ArrowRight size={15} /></a>
            </div>
            <div className="marquee">
              <div className="marquee-track">
                {[...STANDARDS, ...STANDARDS].map((s, i) => <span key={i}>{s}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INFO / PRODUCTO */}
      <section className="section wrap" id="producto">
        <div className="two-col" style={{ marginBottom: 16 }}>
          <div>
            <div className="eyebrow">Qué es</div>
            <h2 className="h2">Un copiloto, no otro software de calidad.</h2>
          </div>
          <p className="lead">
            QEPilot convierte incidencias confusas, hallazgos de auditoría y desviaciones internas en registros
            estructurados y trazables. Hace las preguntas correctas, separa la corrección de la acción correctiva,
            propone causas raíz y prepara informes que tu equipo puede usar de verdad.
          </p>
        </div>

        <div className="cards">
          <div className="card wide">
            <div className="card-ico"><MessageSquareText size={22} /></div>
            <h3>Entrevistas guiadas por IA</h3>
            <p>Describe lo que pasó en lenguaje natural. QEPilot pregunta lo que importa y construye el informe paso a paso, sin formularios en blanco.</p>
          </div>
          <div className="card">
            <div className="card-ico"><GitBranch size={22} /></div>
            <h3>Apoyo en causa raíz</h3>
            <p>Va más allá del “error humano”. Ayuda a distinguir si la causa es de procedimiento, sistémica, operativa o un caso aislado.</p>
          </div>
          <div className="card">
            <div className="card-ico"><FileCheck2 size={22} /></div>
            <h3>Informes listos para auditoría</h3>
            <p>Genera registros estructurados de NC internas, hallazgos de auditoría, 8D y acciones correctivas.</p>
          </div>
          <div className="card">
            <div className="card-ico"><TrendingUp size={22} /></div>
            <h3>Visión de conjunto</h3>
            <p>Reúne las no conformidades en un panel con indicadores y vencimientos, base para la revisión por la dirección.</p>
          </div>
        </div>
      </section>

      {/* WHY TEAMS */}
      <section className="section wrap">
        <div className="eyebrow">Por qué equipos de calidad lo eligen</div>
        <h2 className="h2" style={{ maxWidth: "20ch" }}>Velocidad, estructura y evidencia, sin perder el rigor.</h2>
        <div className="benefits">
          <div className="benefit">
            <h4><Zap size={19} /> Cierra rápido las NC simples</h4>
            <p>No toda incidencia necesita una acción correctiva completa. QEPilot adapta la profundidad de la entrevista al caso.</p>
          </div>
          <div className="benefit">
            <h4><RefreshCw size={19} /> Trata bien lo que puede repetirse</h4>
            <p>Cuando un problema puede volver, guía causa raíz, análisis de extensión, plan de acción y verificación de eficacia.</p>
          </div>
          <div className="benefit">
            <h4><PenLine size={19} /> Adiós al folio en blanco</h4>
            <p>Nadie se queda mirando un formulario. QEPilot pregunta, sugiere y redacta por ti.</p>
          </div>
          <div className="benefit">
            <h4><ClipboardList size={19} /> Prepara la revisión por la dirección</h4>
            <p>Usa los datos acumulados para ver causas recurrentes, procesos débiles y oportunidades de mejora.</p>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="section wrap" id="casos">
        <div className="two-col">
          <div>
            <div className="eyebrow">QEPilot en la práctica</div>
            <h2 className="h2" style={{ marginBottom: 18 }}>Casos de uso</h2>
            <p className="lead" style={{ fontSize: "1.15rem" }}>
              Pensado para empresas que trabajan bajo sistemas de gestión auditados y necesitan apoyo práctico para
              documentar qué pasó, por qué pasó y qué se va a hacer.
            </p>
          </div>
          <div className="uc-card" id="normas">
            <div>
              <h3>No conformidades internas</h3>
              <p>QEPilot distingue entre una incidencia menor puntual y una no conformidad que requiere acción correctiva formal. Los casos simples se cierran rápido; los sistémicos reciben la profundidad que necesitan.</p>
            </div>
            <div className="uc-modes">
              <div className="uc-mode"><div className="n">01</div><div className="t">NC interna · ISO 9001</div></div>
              <div className="uc-mode"><div className="n">02</div><div className="t">Respuesta a auditoría</div></div>
              <div className="uc-mode"><div className="n">03</div><div className="t">Informe 8D de cliente</div></div>
              <div className="uc-mode"><div className="n">04</div><div className="t">Trabajo no conforme · 17025</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section wrap" id="planes">
        <div className="eyebrow">Planes</div>
        <h2 className="h2" style={{ maxWidth: "18ch" }}>Suscripción sencilla para equipos de calidad.</h2>
        <div className="prices">
          <div className="price">
            <div className="pname">Starter</div>
            <div className="pamt">49 €<small> /mes</small></div>
            <div className="pdesc">Para equipos pequeños que empiezan a documentar NC con ayuda de IA.</div>
            <ul>
              <li><Check size={17} /> NC internas</li>
              <li><Check size={17} /> Respuestas a auditoría</li>
              <li><Check size={17} /> Informes con IA (uso limitado)</li>
              <li><Check size={17} /> Exportación a PDF</li>
            </ul>
            <a className="pbtn ghost" href={DEMO_EMAIL}>Pedir demo</a>
          </div>
          <div className="price feat">
            <div className="pname">Professional</div>
            <div className="pamt">99 €<small> /mes</small></div>
            <div className="pdesc">Para empresas que gestionan NC recurrentes y acciones correctivas.</div>
            <ul>
              <li><Check size={17} /> Todo lo de Starter</li>
              <li><Check size={17} /> Informes 8D</li>
              <li><Check size={17} /> Apoyo CAPA y causa raíz</li>
              <li><Check size={17} /> Verificación de eficacia</li>
              <li><Check size={17} /> Panel con indicadores</li>
            </ul>
            <a className="pbtn dark" href={DEMO_EMAIL}>Pedir demo</a>
          </div>
          <div className="price">
            <div className="pname">Business</div>
            <div className="pamt">199 €<small> /mes</small></div>
            <div className="pdesc">Para equipos multi-sede o multi-norma.</div>
            <ul>
              <li><Check size={17} /> Todo lo de Professional</li>
              <li><Check size={17} /> Flujos ISO 9001 e ISO/IEC 17025</li>
              <li><Check size={17} /> Resúmenes para revisión por dirección</li>
              <li><Check size={17} /> Roles de usuario</li>
              <li><Check size={17} /> Soporte prioritario</li>
            </ul>
            <a className="pbtn ghost" href={DEMO_EMAIL}>Pedir demo</a>
          </div>
        </div>
        <p className="price-note">Precios orientativos. El precio final puede variar según el uso y el número de informes generados con IA.</p>
      </section>

      {/* SECURITY */}
      <section className="section wrap">
        <div className="eyebrow">Confianza</div>
        <h2 className="h2" style={{ maxWidth: "20ch" }}>Pensado para información de calidad sensible.</h2>
        <div className="sec-grid">
          <div className="sec-item"><Server size={19} /><span>Datos alojados en la Unión Europea</span></div>
          <div className="sec-item"><Lock size={19} /><span>Conexiones cifradas</span></div>
          <div className="sec-item"><Users size={19} /><span>Acceso por organización, aislado entre clientes</span></div>
          <div className="sec-item"><Download size={19} /><span>Registros exportables en todo momento</span></div>
          <div className="sec-item"><Eye size={19} /><span>Transparencia sobre el uso de IA</span></div>
          <div className="sec-item"><ShieldCheck size={19} /><span>Los datos de cliente no se usan para entrenar modelos públicos cuando el proveedor de IA lo permite</span></div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section">
        <div className="cta-card">
          <h2>Convierte las incidencias de calidad en decisiones claras.</h2>
          <p>Empieza por las no conformidades. Crece hacia acciones correctivas, patrones y revisión por la dirección.</p>
          <a className="btn-primary" href={DEMO_EMAIL} style={{ margin: "0 auto" }}>
            Pedir demo <span className="circle"><ArrowRight size={16} /></span>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-row wrap">
          <div className="footer-brand"><LogoIcon /> QEPilot</div>
          <p>Copiloto de calidad con IA · Documentación de no conformidades y acciones correctivas</p>
        </div>
      </footer>
    </div>
  );
}
