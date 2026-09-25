globalThis.say = async (txt) => {
  const ta = page.getByPlaceholder(/Cuenta qué ha pasado|Cuéntame las novedades/);
  await clk(ta); await page.waitForTimeout(300);
  await page.keyboard.type(txt, { delay: 22 });
  await page.waitForTimeout(500);
  const send = page.getByRole('button', { name: 'Enviar', exact: true });
  await clk(send);
  await page.waitForTimeout(1500);
  for (let i = 0; i < 120; i++) { if (!(await send.isDisabled())) break; await page.waitForTimeout(1000); }
  await page.mouse.move(250, 1300, { steps: 15 });
  await page.waitForTimeout(2500);
  const t = await page.innerText('body');
  return t.slice(Math.max(0, t.indexOf(txt.slice(0, 40)) + txt.length), t.indexOf('Cuenta qué ha pasado') > 0 ? undefined : undefined).slice(0, 1500);
};
await page.mouse.move(250, 1300, { steps: 10 });
await grab.start('B-conversacion');
await page.waitForTimeout(1000);
return (await say('Lo detectó Laura Ortiz, de control final. Hemos separado las quince piezas y el lote 0925 está retenido hasta revisarlo al 100 %. Puede repetirse, así que conviene atacar la causa.')).split('Enviar')[0];
