// Navegador controlable para grabar los anuncios.
// POST /eval con código JS (tiene `page`, `grab`) y devuelve el resultado.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const EXE = process.env.HOME +
  "/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const DIR = __dirname;

(async () => {
  const ctx = await chromium.launchPersistentContext(path.join(DIR, "perfil"), {
    executablePath: EXE,
    headless: process.env.VISIBLE ? false : true,
    viewport: { width: 1280, height: 1600 },
    deviceScaleFactor: 2,
    locale: "es-ES",
    args: ["--window-size=1280,1800"],

  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto("https://app.evidran.com");

  // Grabación: screencast del CDP, fotogramas con marca de tiempo.
  const grab = {
    cdp: null, dir: null, n: 0, log: [],
    async start(nombre) {
      this.dir = path.join(DIR, "tomas", nombre);
      fs.rmSync(this.dir, { recursive: true, force: true });
      fs.mkdirSync(this.dir, { recursive: true });
      this.n = 0; this.log = [];
      this.cdp = await ctx.newCDPSession(page);
      this.cdp.on("Page.screencastFrame", async (f) => {
        const file = String(this.n++).padStart(6, "0") + ".jpg";
        fs.writeFileSync(path.join(this.dir, file), Buffer.from(f.data, "base64"));
        this.log.push({ file, t: f.metadata.timestamp });
        this.cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
      });
      await this.cdp.send("Page.startScreencast", {
        format: "jpeg", quality: 92, maxWidth: 2560, maxHeight: 3200, everyNthFrame: 1,
      });
      return this.dir;
    },
    async stop() {
      await this.cdp.send("Page.stopScreencast");
      fs.writeFileSync(path.join(this.dir, "frames.json"), JSON.stringify(this.log));
      const r = { dir: this.dir, frames: this.log.length };
      this.cdp = null;
      return r;
    },
  };

  http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const fn = new Function("page", "grab", "ctx", `return (async () => { ${body} })()`);
        const out = await fn(page, grab, ctx);
        res.end(JSON.stringify(out ?? null));
      } catch (e) {
        res.statusCode = 500;
        res.end(String(e && e.stack || e));
      }
    });
  }).listen(8787, "127.0.0.1", () => console.log("listo en 8787"));
})();
