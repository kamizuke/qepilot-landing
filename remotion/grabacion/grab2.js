const fs = await import('node:fs'); const path = await import('node:path');
grab.start = async function(nombre) {
  this.dir = path.join('__dirname_grab', 'tomas', nombre);
  fs.rmSync(this.dir, { recursive: true, force: true }); fs.mkdirSync(this.dir, { recursive: true });
  this.n = 0; this.log = []; this.on = true;
  
  this.loop = (async () => {
    while (this.on) {
      const t = Date.now() / 1000;
      try {
        const buf = await page.screenshot({ type: 'jpeg', quality: 88 });
        const file = String(this.n++).padStart(6, '0') + '.jpg';
        fs.writeFileSync(path.join(this.dir, file), buf);
        this.log.push({ file, t });
      } catch (e) {}
    }
  })();
  return this.dir;
};
grab.stop = async function() {
  this.on = false; await this.loop;
  fs.writeFileSync(path.join(this.dir, 'frames.json'), JSON.stringify(this.log));
  return { dir: this.dir, frames: this.log.length, fps: this.log.length / (this.log.at(-1).t - this.log[0].t) };
};
await grab.start('test'); await page.mouse.move(600,600,{steps:30}); await page.waitForTimeout(1500); return await grab.stop();
