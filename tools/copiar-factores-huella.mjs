// Copia a la web los factores oficiales del MITECO que genera la app
// (ochod-demo/scripts/huella-factores-miteco.py). Ejecutar cada vez que el
// vigía avise de una calculadora nueva y se regeneren en la app:
//   node tools/copiar-factores-huella.mjs [ruta al repo de la app]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(process.argv[2] || path.join(aqui, "..", "..", "ochod-demo"));
const origen = path.join(app, "src", "datos", "huella");
const destino = path.join(aqui, "..", "public", "huella");

for (const f of ["factoresOficiales.js", "comercializadoras.js"]) {
  fs.copyFileSync(path.join(origen, f), path.join(destino, f));
  console.log(`copiado ${f}`);
}
