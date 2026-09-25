const ent = page.getByRole('button', { name: 'Entendido' });
if (await ent.count()) { await ent.first().click(); await page.waitForTimeout(800); }
await page.evaluate(() => { window.print = () => {}; });
await page.mouse.move(900, 900, { steps: 10 });
await grab.start('C-documento-pdf');
await page.waitForTimeout(1200);
for (let i = 0; i < 70; i++) { await page.mouse.wheel(0, 45); await page.waitForTimeout(40); }
await page.waitForTimeout(900);
for (let i = 0; i < 35; i++) { await page.mouse.wheel(0, -90); await page.waitForTimeout(25); }
await page.waitForTimeout(900);
await clk(page.getByRole('button', { name: /Exportar/ }).first());
await page.waitForTimeout(700);
const pdf = page.getByRole('menuitem', { name: 'Exportar PDF' });
await mv(pdf); await page.waitForTimeout(600);
await clk(pdf);
await page.waitForTimeout(1500);
const r = await grab.stop();
return r;
