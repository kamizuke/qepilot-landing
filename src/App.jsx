import {
  ArrowRight, MessageSquareText, Sparkles, FileCheck2,
  Zap, GitBranch, PenLine, TrendingUp, Check,
  ShieldCheck, Lock, Users, Download, Eye, Server,
  ClipboardCheck, FlaskConical, Car, Leaf, HardHat, ShieldHalf,
} from "lucide-react";

const DEMO_URL = "https://ochod-demo.vercel.app";

function LogoIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  );
}

export default function App() {
  return (
    <div>
      <div className="hero-outer">
        <nav className="nav">
          <div className="nav-row">
            <div className="nav-brand"><LogoIcon /><span>QEPilot</span></div>
            <div className="nav-links">
              <a href="#como">Cómo funciona</a>
              <a href="#porque">Por qué</a>
              <a href="#casos">Casos de uso</a>
              <a href="#planes">Planes</a>
            </div>
            <a className="nav-cta" href={DEMO_URL} target="_blank" rel="noopener">Pedir demo</a>
          </div>
        </nav>
        <div className="hero-pad">
          <div className="hero-card hero">
            <div className="hero-grid">
              <div className="hero-text">
                <span className="hero-eyebrow"><span className="dot" />Copiloto de calidad con IA</span>
                <h1>Documenta no conformidades<br /><span className="accent">en minutos, no en horas.</span></h1>
                <p className="hero-sub">
                  QEPilot guía a tu equipo con una entrevista asistida por IA para generar no conformidades internas,
                  respuestas a auditorías, acciones correctivas e informes 8D listos para revisión.
                </p>
                <div className="hero-actions">
                  <a className="btn-primary" href={DEMO_URL} target="_blank" rel="noopener">
                    Probar la demo <span className="circle"><ArrowRight size={16} /></span>
                  </a>
                  <a className="btn-link" href="#como">Ver cómo funciona <ArrowRight size={15} /></a>
                </div>
              </div>
              <div className="hero-img">
                <img src="/hero.png" alt="QEPilot transforma incidencias dispersas en un informe de no conformidad estructurado" loading="eager" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section wrap" id="como">
        <div className="eyebrow">Cómo funciona QEPilot</div>
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
            <h3>QEPilot hace las preguntas correctas</h3>
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
        <div className="mock">
          <div className="mock-bar"><span /><span /><span /></div>
          <div className="mock-body">
            <div className="mock-chat">
              <div className="mb mb-a">¿Ves esto como un caso puntual que ya queda resuelto, o algo que podría repetirse?</div>
              <div className="mb mb-u">Puede repetirse, el control no estaba definido.</div>
              <div className="mb mb-a">Entonces vamos a la causa. El procedimiento existía y era conocido, ¿verdad? En estos casos la causa suele estar en la ausencia de un control que garantice que se cumple. ¿Encaja?</div>
            </div>
            <div className="mock-doc">
              <div className="mock-doc-h">INFORME DE NO CONFORMIDAD</div>
              <div className="mock-fld"><span>Descripción</span><div /></div>
              <div className="mock-fld"><span>Corrección inmediata</span><div /></div>
              <div className="mock-fld hl"><span>Causa raíz</span><div /></div>
              <div className="mock-fld"><span>Acción correctiva</span><div /></div>
              <div className="mock-fld"><span>Responsable · fecha límite</span><div /></div>
            </div>
          </div>
        </div>

        <div className="feature-strip">
          <div className="fs-text">
            <div className="fs-tag">Novedad</div>
            <h3>Tendencias y revisión por la dirección</h3>
            <p>QEPilot reúne tus no conformidades en indicadores claros y redacta el resumen de entrada para la revisión por la dirección (ISO 9001, 9.3) con IA. Lo que antes montabas a mano en una hoja, listo en segundos.</p>
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
        <p className="pains-close">QEPilot ayuda a los equipos de calidad a pasar de documentar a mejorar.</p>
      </section>

      <section className="section wrap" id="porque">
        <div className="eyebrow">Por qué los equipos de calidad usan QEPilot</div>
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
            <p>QEPilot ayuda a identificar causas sistémicas en lugar de detenerse en el “error humano”.</p>
          </div>
          <div className="card">
            <div className="card-ico"><PenLine size={22} /></div>
            <h3>Elimina el folio en blanco</h3>
            <p>Empieza describiendo el problema. QEPilot estructura todo lo demás.</p>
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
          <div className="bf soon"><div className="bf-ico"><Car size={20} /></div><div><div className="bf-t">Calidad Automoción <span className="soon-tag">Próximamente</span></div><div className="bf-s">IATF 16949</div></div></div>
          <div className="bf soon"><div className="bf-ico"><HardHat size={20} /></div><div><div className="bf-t">Seguridad y Salud <span className="soon-tag">Próximamente</span></div><div className="bf-s">ISO 45001</div></div></div>
          <div className="bf soon"><div className="bf-ico"><ShieldHalf size={20} /></div><div><div className="bf-t">Seguridad de la Información <span className="soon-tag">Próximamente</span></div><div className="bf-s">ISO 27001</div></div></div>
        </div>
      </section>

      <section className="section wrap" id="casos">
        <div className="two-col">
          <div>
            <div className="eyebrow">QEPilot en la práctica</div>
            <h2 className="h2" style={{ marginBottom: 18 }}>Casos de uso</h2>
            <p className="lead" style={{ fontSize: "1.15rem" }}>
              Apoyo práctico para documentar qué pasó, por qué pasó y qué se va a hacer — en cada tipo de incidencia
              de tu sistema de gestión.
            </p>
          </div>
          <div className="uc-grid">
            <div className="uc-box"><h3>No conformidades internas</h3><p>Distingue entre incidencias menores y problemas que requieren acción correctiva formal.</p></div>
            <div className="uc-box"><h3>Hallazgos de auditoría</h3><p>Prepara respuestas estructuradas a auditorías de certificación y acreditación.</p></div>
            <div className="uc-box"><h3>Informes 8D</h3><p>Guía a equipos multidisciplinares por una resolución de problemas estructurada.</p></div>
            <div className="uc-box"><h3>Trabajo no conforme</h3><p>Documenta desviaciones, evaluación de impacto y acciones necesarias.</p></div>
          </div>
        </div>
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
            <a className="pbtn ghost" href={DEMO_URL} target="_blank" rel="noopener">Comenzar</a>
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
            <a className="pbtn dark" href={DEMO_URL} target="_blank" rel="noopener">Solicitar demo</a>
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
            <a className="pbtn ghost" href={DEMO_URL} target="_blank" rel="noopener">Hablar con ventas</a>
          </div>
        </div>
        <p className="price-note">Usuarios adicionales: 25 €/mes · No conformidades e informes ilimitados en todos los planes · Sin costes de implantación.</p>
      </section>

      <section className="section wrap">
        <div className="eyebrow">Confianza</div>
        <h2 className="h2" style={{ maxWidth: "22ch" }}>Pensado para información sensible de sistemas de gestión.</h2>
        <div className="sec-grid">
          <div className="sec-item"><Server size={19} /><span>Datos alojados en Europa cuando está disponible</span></div>
          <div className="sec-item"><Lock size={19} /><span>Comunicaciones cifradas</span></div>
          <div className="sec-item"><Users size={19} /><span>Acceso por organización, aislado entre clientes</span></div>
          <div className="sec-item"><Download size={19} /><span>Registros exportables en todo momento</span></div>
          <div className="sec-item"><Eye size={19} /><span>Transparencia sobre el uso de IA</span></div>
          <div className="sec-item"><ShieldCheck size={19} /><span>Los datos de cliente no se usan para entrenar modelos públicos cuando el proveedor de IA lo permite</span></div>
        </div>
      </section>

      <section className="section">
        <div className="cta-card">
          <h2>Convierte las incidencias en acciones claras.</h2>
          <p>Dedica menos tiempo a redactar informes y más a mejorar tu organización.</p>
          <a className="btn-primary" href={DEMO_URL} target="_blank" rel="noopener" style={{ margin: "0 auto" }}>
            Pedir demo <span className="circle"><ArrowRight size={16} /></span>
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-row wrap">
          <div className="footer-brand"><LogoIcon /> QEPilot</div>
          <p>Copiloto de calidad con IA · Documentación de no conformidades y acciones correctivas</p>
        </div>
      </footer>
    </div>
  );
}
