// Calculadora de huella gratuita (evidran.com/huella) · cálculo.
// Módulo puro: lo usan la página (navegador) y el servidor, que repite el
// cálculo con lo que guarda. Los factores son los de la calculadora oficial
// del MITECO (factoresOficiales.js y comercializadoras.js, copiados de la app
// con tools/copiar-factores-huella.mjs). Mismas reglas que src/huellaCarbono.js
// y src/huellaOficial.js de la app: si cambian allí, cambian aquí.
import { ORIGEN, PRIMER_ANIO, ULTIMO_ANIO, SERIES, MIX_SIN_GDO } from "./factoresOficiales.js";

export { ORIGEN, PRIMER_ANIO, ULTIMO_ANIO };

export const VEHICULOS = [
  { value: "m1", label: "Turismos (M1)" },
  { value: "n1", label: "Furgonetas y furgones (N1)" },
  { value: "n2n3", label: "Camiones (N2, N3)" },
  { value: "m2m3", label: "Autobuses (M2, M3)" },
  { value: "l1", label: "Ciclomotores (L1e, L2e)" },
  { value: "l3", label: "Motocicletas (L3e, L4e, L5e, L6e, L7e)" },
];
export const MAQUINARIA = [
  { value: "maq_industrial", label: "Maquinaria comercial, institucional e industrial" },
  { value: "maq_agricola", label: "Maquinaria agrícola" },
  { value: "maq_forestal", label: "Maquinaria forestal" },
];
export const BIOMASAS = [
  { value: "pellets", label: "Pellets", miteco: "Biomasa pellets (kg)**" },
  { value: "astillas", label: "Astillas", miteco: "Biomasa astillas (kg)**" },
  { value: "madera", label: "Leña o madera", miteco: "Biomasa madera (kg)**" },
  { value: "serrines", label: "Serrines y virutas", miteco: "Biomasa serrines virutas (kg)**" },
  { value: "cascara", label: "Cáscara de frutos secos", miteco: "Biomasa cáscara f. secos (kg)**" },
  { value: "hueso", label: "Hueso de aceituna", miteco: "Biomasa hueso aceituna (kg)**" },
  { value: "carbon_vegetal", label: "Carbón vegetal", miteco: "Carbón vegetal (kg)**" },
];
// Garantía de origen: el texto exacto del desplegable de la calculadora.
export const GDO = [
  { value: "no", label: "No", factor: null, miteco: "No" },
  { value: "renovable", label: "Sí, renovable", factor: 0, miteco: "GdO energía renovable" },
  { value: "cogeneracion", label: "Sí, cogeneración de alta eficiencia", factor: 0.302, miteco: "GdO cogeneración de alta eficiencia" },
];

// Combustibles: unidad (la del factor y la de la calculadora) y texto exacto
// del desplegable «Tipo de combustible». Desde 2019 la calculadora pide B7 y
// E5 en vez de gasóleo A y gasolina; hasta 2018, en fijas, «Gasolina  (l)»
// lleva dos espacios.
export const COMBUSTIBLES = {
  gas_natural: { nombre: "Gas natural", unidad: "kWh", miteco: () => "Gas natural (kWhPCS)*", ayuda: "kWh de la factura del gas" },
  gasoleo_c: { nombre: "Gasóleo C (calefacción)", unidad: "l", miteco: () => "Gasóleo C (l)" },
  gasoleo_a: {
    nombre: "Gasóleo A (diésel)",
    unidad: "l",
    miteco: (anio, uso) => (anio >= 2019 ? "B7 (l)" : uso === "fija" ? "Gasóleo A (l)" : "Gasóleo (l)"),
  },
  gasolina: {
    nombre: "Gasolina",
    unidad: "l",
    miteco: (anio, uso) => (anio >= 2019 ? "E5 (l)" : uso === "fija" ? "Gasolina  (l)" : "Gasolina (l)"),
  },
  gasoleo_b: { nombre: "Gasóleo B (agrícola)", unidad: "l", miteco: () => "Gasóleo B (l)" },
  glp: { nombre: "GLP (autogás)", unidad: "l", miteco: () => "LPG (l)" },
  propano: { nombre: "Propano", unidad: "kg", miteco: () => "Gas propano (kg)", ayuda: "kg (capacidad de las bombonas)" },
  butano: { nombre: "Butano", unidad: "kg", miteco: () => "Gas butano (kg)", ayuda: "kg (capacidad de las bombonas)" },
  gnc: { nombre: "Gas natural comprimido (GNC)", unidad: "kg", miteco: () => "CNG (kg)" },
  fueloleo: { nombre: "Fuelóleo", unidad: "l", miteco: () => "Fuelóleo (l)" },
  biomasa: {
    nombre: "Biomasa",
    unidad: "kg",
    miteco: (_a, _u, detalle) => BIOMASAS.find((b) => b.value === detalle)?.miteco || "Biomasa (kg)**",
  },
};

// Qué combustibles se ofrecen en cada bloque (solo combinaciones que la
// calculadora oficial tiene).
export const BLOQUES = {
  fijas: ["gas_natural", "gasoleo_c", "propano", "butano", "glp", "fueloleo", "gasoleo_a", "biomasa"],
  vehiculos: ["gasoleo_a", "gasolina", "glp", "gnc"],
  maquinaria: ["gasoleo_a", "gasoleo_b", "gasolina"],
};

export const PESTANAS = {
  fijas: {
    pestana: "3. Consumo de combustibles en instalaciones fijas",
    apartado: "A. Instalaciones no sujetas a la Ley 1/2005",
    columnas: ["Tipo de combustible", "Cantidad"],
  },
  vehiculos: {
    pestana: "4. Consumo de combustibles en vehículos y maquinaria",
    apartado: "A. Transporte por carretera · opción A.1 (cantidad de combustible)",
    columnas: ["Categoría de vehículo", "Tipo de combustible", "Cantidad"],
  },
  maquinaria: {
    pestana: "4. Consumo de combustibles en vehículos y maquinaria",
    apartado: "C. Funcionamiento de maquinaria",
    columnas: ["Tipo de maquinaria", "Tipo de combustible", "Cantidad"],
  },
  electricidad: {
    pestana: "8. Electricidad y otras energías",
    apartado: "A. Consumo eléctrico en edificios",
    columnas: ["Comercializadora", "¿Se dispone de Garantía de Origen?", "Dato de consumo (kWh)"],
  },
};

const AMBITO = {
  fijas: "los combustibles de las instalaciones",
  vehiculos: "los vehículos",
  maquinaria: "la maquinaria",
  electricidad: "la electricidad comprada",
};

/** Factor oficial (kg CO₂e por unidad) de un año, o null si no existe. */
export function factorOficial(anio, combustible, uso) {
  const s = SERIES.find((x) => x[0] === combustible && x[1] === uso);
  const v = s ? s[2][anio - PRIMER_ANIO] : null;
  return v == null ? null : v;
}

/** Categorías (vehículos) o tipos (maquinaria) que la calculadora tiene para un combustible. */
export function usosDe(combustible, bloque) {
  const lista = bloque === "vehiculos" ? VEHICULOS : bloque === "maquinaria" ? MAQUINARIA : [];
  return lista.filter((u) => SERIES.some((s) => s[0] === combustible && s[1] === u.value));
}

/** Comercializadoras del año (nombre exacto de la calculadora) o []. */
export function comercializadorasDe(anio, todas) {
  return (todas && todas[String(anio)]) || [];
}

function numero(v) {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 && n < 1e10 ? n : null;
}

/**
 * Calcula la huella de un año.
 * entrada = { anio, fijas: [{combustible, cantidad, detalle?, aprox?}],
 *   vehiculos: [{combustible, categoria, cantidad, aprox?}],
 *   maquinaria: [{combustible, tipo, cantidad, aprox?}],
 *   electricidad: [{comercializadora, gdo, kwh, aprox?}] }
 * Devuelve kg CO₂e; las filas a cero o vacías se ignoran.
 */
export function calcular(entrada, comercializadoras) {
  const anio = Number(entrada?.anio);
  const partidas = [];
  const avisos = [];
  if (!(anio >= PRIMER_ANIO && anio <= ULTIMO_ANIO)) {
    return { anio, partidas, avisos: [`Elige un año entre ${PRIMER_ANIO} y ${ULTIMO_ANIO}.`], a1: 0, a2: 0, total: 0, aproximado: false };
  }
  const anadir = (bloque, fila, uso, etiqueta, celdas) => {
    const c = COMBUSTIBLES[fila.combustible];
    const cantidad = numero(fila.cantidad);
    if (!c || !cantidad) return;
    const clave = fila.combustible === "biomasa" ? fila.detalle : uso;
    const factor = factorOficial(anio, fila.combustible, clave);
    if (factor == null) {
      avisos.push(`${c.nombre}${etiqueta ? ` en ${etiqueta.toLowerCase()}` : ""}: la calculadora oficial no tiene factor para ${anio}.`);
      return;
    }
    partidas.push({
      bloque,
      alcance: 1,
      etiqueta: c.nombre + (etiqueta ? ` · ${etiqueta}` : ""),
      cantidad,
      unidad: c.unidad,
      factor,
      kg: cantidad * factor,
      aprox: !!fila.aprox,
      celdas: [...celdas, c.miteco(anio, uso, fila.detalle)],
    });
  };
  for (const f of entrada.fijas || []) {
    if (f.combustible === "biomasa" && !BIOMASAS.some((b) => b.value === f.detalle)) {
      if (numero(f.cantidad)) avisos.push("Biomasa: elige el tipo (pellets, astillas…).");
      continue;
    }
    const bio = BIOMASAS.find((b) => b.value === f.detalle);
    anadir("fijas", f, "fija", f.combustible === "biomasa" ? bio.label : "", []);
  }
  for (const v of entrada.vehiculos || []) {
    const cat = VEHICULOS.find((x) => x.value === v.categoria);
    if (!cat) {
      if (numero(v.cantidad)) avisos.push("Vehículos: elige la categoría de cada fila.");
      continue;
    }
    anadir("vehiculos", v, cat.value, cat.label, [cat.label]);
  }
  for (const m of entrada.maquinaria || []) {
    const tipo = MAQUINARIA.find((x) => x.value === m.tipo) || MAQUINARIA[0];
    anadir("maquinaria", m, tipo.value, tipo.label, [tipo.label]);
  }
  const lista = comercializadorasDe(anio, comercializadoras);
  for (const e of entrada.electricidad || []) {
    const kwh = numero(e.kwh);
    if (!kwh) continue;
    const gdo = GDO.find((g) => g.value === e.gdo) || GDO[0];
    const encontrada = lista.find((x) => x[0] === e.comercializadora);
    const nombre = encontrada ? encontrada[0] : "Otras";
    let factor;
    let origen;
    if (gdo.factor != null) {
      factor = gdo.factor;
      origen = gdo.label;
    } else if (encontrada) {
      factor = encontrada[1];
      origen = nombre;
    } else {
      factor = MIX_SIN_GDO[String(anio)];
      origen = "mix sin garantía de origen";
      if (e.comercializadora) avisos.push(`«${e.comercializadora}» no está en la lista de ${anio}: se usa «Otras».`);
    }
    partidas.push({
      bloque: "electricidad",
      alcance: 2,
      etiqueta: `Electricidad · ${origen}`,
      cantidad: kwh,
      unidad: "kWh",
      factor,
      kg: kwh * factor,
      aprox: !!e.aprox,
      celdas: [nombre, gdo.miteco],
    });
  }
  const a1 = partidas.filter((p) => p.alcance === 1).reduce((s, p) => s + p.kg, 0);
  const a2 = partidas.filter((p) => p.alcance === 2).reduce((s, p) => s + p.kg, 0);
  return { anio, partidas, avisos, a1, a2, total: a1 + a2, aproximado: partidas.some((p) => p.aprox) };
}

// --- Lo que va en el informe ---

/** Toneladas con coma: 47,2 · 0,85 */
export function toneladas(kg) {
  const t = kg / 1000;
  return t.toLocaleString("es-ES", { minimumFractionDigits: t < 1 && t > 0 ? 2 : 1, maximumFractionDigits: t < 1 && t > 0 ? 2 : 1 });
}

export function porcentaje(parte, total) {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

/** Peso de cada bloque (fijas, vehículos, maquinaria, electricidad), de mayor a menor. */
export function porBloque(r) {
  const m = new Map();
  for (const p of r.partidas) m.set(p.bloque, (m.get(p.bloque) || 0) + p.kg);
  return [...m.entries()].map(([bloque, kg]) => ({ bloque, ambito: AMBITO[bloque], kg })).sort((a, b) => b.kg - a.kg);
}

function clonar(e) {
  return JSON.parse(JSON.stringify(e || {}));
}

/**
 * Escenarios «qué pasa si», calculados con los mismos factores. Solo los que
 * cambian algo. Sin euros: solo toneladas.
 */
export function simular(entrada, comercializadoras) {
  const base = calcular(entrada, comercializadoras);
  const escenarios = [];
  const probar = (titulo, descripcion, cambiar) => {
    const e = clonar(entrada);
    cambiar(e);
    const r = calcular(e, comercializadoras);
    const ahorro = base.total - r.total;
    if (ahorro > 0.5) escenarios.push({ titulo, descripcion, total: r.total, ahorro, pct: porcentaje(ahorro, base.total) });
  };
  probar(
    "Electricidad con garantía de origen renovable",
    "Contratar la luz con garantía de origen renovable. En la calculadora del MITECO cuenta como 0 kg por kWh.",
    (e) => (e.electricidad || []).forEach((x) => {
      if (x.gdo !== "cogeneracion") x.gdo = "renovable";
    })
  );
  probar(
    "Un 10 % menos de combustible en vehículos",
    "Por ejemplo, con rutas mejor planificadas o conducción eficiente.",
    (e) => (e.vehiculos || []).forEach((x) => (x.cantidad = (numero(x.cantidad) || 0) * 0.9))
  );
  probar(
    "Un 10 % menos de combustible en instalaciones",
    "Por ejemplo, con mantenimiento de quemadores, aislamiento o recuperación de calor.",
    (e) => (e.fijas || []).forEach((x) => (x.cantidad = (numero(x.cantidad) || 0) * 0.9))
  );
  return { base, escenarios };
}

/** Objetivo ambiental (ISO 14001, 6.2) sobre la fuente principal. */
export function objetivo(r, pct = 15, anioMeta = r.anio + 2) {
  const principal = porBloque(r)[0];
  if (!principal) return null;
  const p = Math.min(90, Math.max(1, Math.round(Number(pct) || 15)));
  const meta = principal.kg * (1 - p / 100);
  return {
    pct: p,
    anioMeta,
    ambito: principal.ambito,
    texto: `Reducir un ${p} % las emisiones de ${principal.ambito} en ${anioMeta} respecto a ${r.anio} (de ${toneladas(principal.kg)} t CO₂e a ${toneladas(meta)} t CO₂e).`,
    indicador: `t CO₂e al año de ${principal.ambito}, calculadas con los factores de la calculadora del MITECO.`,
    partida: `${toneladas(principal.kg)} t CO₂e en ${r.anio}.`,
    seguimiento: "Recalcular cada año con los consumos de las facturas y comparar con la meta.",
  };
}

/** «v17, 7 de mayo de 2026» */
export function versionFactores() {
  const f = new Date(`${ORIGEN.fecha}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  return `${ORIGEN.version}, ${f}`;
}

/** Párrafo para cuestionarios de clientes o la memoria de sostenibilidad. */
export function textoCuestionario(r, empresa) {
  const principal = porBloque(r)[0];
  const quien = empresa ? empresa : "La empresa";
  const partes = [
    `${quien} ha calculado su huella de carbono de ${r.anio} para los alcances 1 y 2 con los factores de emisión de la calculadora de huella de carbono de organización del MITECO (${versionFactores()}).`,
    `Resultado: ${toneladas(r.total)} t CO₂e (alcance 1: ${toneladas(r.a1)} t; alcance 2: ${toneladas(r.a2)} t).`,
  ];
  if (principal) partes.push(`La fuente principal es ${principal.ambito} (${porcentaje(principal.kg, r.total)} % del total).`);
  if (r.aproximado) partes.push("Parte de los consumos son estimaciones.");
  partes.push("No incluye el alcance 3 (emisiones indirectas de la cadena de valor).");
  return partes.join(" ");
}

/** Número para pegar en un Excel en español: coma decimal, sin miles. */
export function numeroExcel(n) {
  return String(Math.round(n * 100) / 100).replace(".", ",");
}

/** Filas para la calculadora oficial, agrupadas por pestaña y tipo. */
export function tablasMiteco(r) {
  const orden = ["fijas", "vehiculos", "maquinaria", "electricidad"];
  return orden
    .map((bloque) => {
      const grupos = new Map();
      for (const p of r.partidas.filter((x) => x.bloque === bloque)) {
        const clave = p.celdas.join("|");
        grupos.set(clave, { celdas: p.celdas, cantidad: (grupos.get(clave)?.cantidad || 0) + p.cantidad });
      }
      return { ...PESTANAS[bloque], bloque, filas: [...grupos.values()].map((g) => [...g.celdas, numeroExcel(g.cantidad)]) };
    })
    .filter((t) => t.filas.length);
}

/** Valida y limpia lo que llega del navegador antes de guardarlo. */
export function limpiarEntrada(e) {
  const anio = Number(e?.anio);
  if (!(anio >= PRIMER_ANIO && anio <= ULTIMO_ANIO)) return null;
  const filas = (lista, campos, max = 30) =>
    (Array.isArray(lista) ? lista : []).slice(0, max).map((f) => {
      const o = {};
      for (const k of campos) {
        if (k === "aprox") o.aprox = !!f?.aprox;
        else if (k === "cantidad" || k === "kwh") o[k] = numero(f?.[k]) ?? 0;
        else o[k] = typeof f?.[k] === "string" ? f[k].slice(0, 160) : null;
      }
      return o;
    });
  return {
    anio,
    fijas: filas(e.fijas, ["combustible", "cantidad", "detalle", "aprox"]),
    vehiculos: filas(e.vehiculos, ["combustible", "categoria", "cantidad", "aprox"]),
    maquinaria: filas(e.maquinaria, ["combustible", "tipo", "cantidad", "aprox"]),
    electricidad: filas(e.electricidad, ["comercializadora", "gdo", "kwh", "aprox"]),
  };
}
