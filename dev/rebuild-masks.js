/* ============================================================
   Перестройка масок конфигуратора (assets/cars/<slug>-mask.webp)
   ------------------------------------------------------------
   Зачем: маски определяют, где на фото машины «ложится плёнка».
   Артефакты (крашеные стёкла/диски, рваный контур) чинятся этим
   конвейером, а не руками. Прогон 2026-07-17 закрыл жалобу
   владельца (Урус + другие): commit 3d73183, все 66 масок, ?v=7.

   КАК ЗАПУСКАТЬ (без сборщика, весь пиксельный код живёт в браузере):
   1) Локальный сервер с POST-сохранением масок + раздачей шаблонов базы:
      dev/mask_server.py (порт 8123): статика этого репо,
      /tpl/* -> шаблоны базы из соседнего zapwrap-app, POST /save.
      Листинги каталогов обязаны быть включены: из них строится карта машин.
   2) Открыть http://127.0.0.1:8123, вставить этот файл в консоль.
   3) MaskFix.buildAll({ dryRun: true }) — прогон без записи, показывает
      долю покраски по каждой машине и ловит сбои экспорта.
      MaskFix.buildAll() — перестроит все маски и сохранит их POST'ом
      в СЛЕДУЮЩЕЕ поколение (SRC читаем, OUT пишем, см. константы ниже).
   4) Посмотреть git status, сверить несколько масок глазами, поднять имя
      поколения в app.js (реестр CARS) и styles.css (271, 1180-1181), push.

   Карта slug -> шаблон базы строится ПО ИМЕНАМ ФАЙЛОВ, carmap.json не нужен
   (его в репозитории нет): assets/cars/<make-model><SRC> <-> Год_Марка_Модель_
   body_mask.png в zapwrap-app/assets/car-templates. Год отбрасывается,
   регистр вниз, подчёркивания в дефисы. Прогон 2026-07-20: сходятся все 66.

   ЛОГИКА buildMask (итог v7, проверено на всех 66):
   - основа: студийная _body_mask.png (белое=кузов), если она валидна
     (доля белого в силуэте 25-95%), иначе старая маска сайта;
   - стёкла НИКОГДА не красятся: (а) крупные тёмные регионы верхней
     половины (тонированное стекло), (б) светлые панели, замкнутые
     тёмной окантовкой, в поясе остекления, узкие и темнее кузова
     (avg lum < 220) — случай Уруса, у которого стекло почти белое;
   - колёса НИКОГДА не красятся: поиск колёс x-гистограммой тёмных
     пикселей нижней половины (устойчив к слиянию шины с тенью порога),
     вырез всего диска, кроме белых пикселей крыла;
   - страховка старой маской: тёмный низ (lum<170, ниже середины),
     который старая маска не красила, не красим и мы;
   - контурная кайма (5px от края силуэта) красится только рядом с
     покрашенным кузовом — нет ни белого «стикера», ни рваной крыши;
   - лючки/зазоры ручек: маленькие светлые дыры внутри покраски
     заливаются; крошки <400px выбрасываются; финал — blur 1px (AA),
     энкод canvas.toBlob('image/webp', 0.9).

   !!! ИТОГ 2026-07-17 = V8 (commit после 3d73183, маски ?v=8) !!!
   v7 (пересборка кузова из _body_mask) ОТМЕНЁН: он переставал красить
   хром-швы дверей, ручки и зеркала, которые исходные маски красили —
   при mix-blend-mode: multiply каждая машина покрылась белыми точками
   («теперь все машины с артефактами»). ПРАВИЛО: базой всегда служит
   ИСХОДНАЯ маска (git show <commit>:assets/cars/<k>-mask.webp), из неё
   только ВЫЧИТАЕТСЯ: стёкла (как ниже), диски (x-гистограмма), выход
   за силуэт; + closing 1px кромки, крошки <400px, blur 1px. Медиана
   изменений 3.4% пикселей машины. Никогда не менять базу покраски.

   !!! ФОРМАТ ФАЙЛА МАСКИ (v9, финал) — АЛЬФА-ПРОЗРАЧНЫЙ !!!
   Маска обязана быть белой на ПРОЗРАЧНОМ фоне (alpha = сила покраски,
   RGB = 255). Непрозрачная чёрно-белая маска работает только в Chrome
   (mask-mode: luminance); Safari применяет -webkit-mask по АЛЬФЕ, и
   непрозрачная маска красит ВСЁ - всю машину, стёкла и прямоугольник
   фона (жалоба владельца после v8). Экспорт: alpha = яркость бинарной
   маски с AA, rgb=255, alpha<6 -> 0, canvas.toBlob('image/webp', .95).

   Грабли, съеденные в этой сессии (НЕ повторять):
   - _body_mask.png бывают битые: у 16 моделей (BMW/Chevy/Cadillac/
     Bentley) внутри машины 100% чёрного -> фолбэк на старую маску;
     у Уруса переднее стекло помечено кузовом -> нужен вырез по фото;
   - эрозия силуэта под покраску даёт белую кайму (запечённая белая
     обводка фото) — кайму надо КРАСИТЬ около кузова, а не отрезать;
   - радиус колеса по bbox тёмного компонента режет крылья (тень
     раздувает bbox) — только x-гистограмма + вырез не-белого;
   - скриншоты панели браузера на оверлеях/глубоком скролле чернеют
     (баг захвата) — превью сохранять файлами и смотреть их напрямую.
   ============================================================ */

/* Ниже — рабочий код v7 как выполнялся в консоли (объект F = MaskFix). */
window.MaskFix = {
  W: 1600, H: 800,
  /* ПОКОЛЕНИЕ МАСОК. Читаем текущее, пишем СЛЕДУЮЩЕЕ: встроенные браузеры
     телефонов игнорируют ?v= и держат старый файл, поэтому имя обязано
     меняться. После прогона поднять суффикс в app.js (реестр CARS) и в
     styles.css (строки 271 и 1180-1181), затем сдвинуть SRC/OUT здесь.

     !!! ПРОГОН v9 (-mask4.webp) ОТКАЧЕН 2026-07-20 (commit 1c08a43) !!!
     mask4 подъел волосяные швы: зазоры дверей, поясную линию, пороги. Под
     mix-blend-mode: multiply на их месте вылезли белые линии на ~30 машинах
     (Urus, Model S, Camry, RAV4, M3/M5...). Сайт вернулся на -mask3.webp.
     Файлы -mask4.webp УДАЛЕНЫ из репо (git rm) - поэтому SRC тут переведён
     на живой хороший -mask3.webp, иначе следующий прогон читал бы 404.

     КОРЕНЬ (почему v9 съел швы): конвейер берёт ПРЕДЫДУЩЕЕ поколение как базу
     покраски (maskToBin, порог alpha>100), затем dropSmallPos выбрасывает
     связные компоненты <400px. Тонкий шов 1-2px после бинаризации худеет и
     попадает под выброс крошек - и так понемногу КАЖДОЕ поколение. mask3->mask4
     как раз перешёл порог видимости. Урок v8 ("база всегда ИСХОДНАЯ маска, не
     цепочка") в коде не соблюдён: SRC цепляется поколение-к-поколению.

     ПЕРЕД СЛЕДУЮЩИМ ПРОГОНОМ (v10) - не запускать вслепую:
       1) базу покраски брать из ПРИКОЛОченного оригинала -mask.webp
          (git show <первый commit>:assets/cars/<slug>-mask.webp), НЕ из mask3/4;
          из неё только ВЫЧИТАТЬ стёкла/диски/выход за силуэт;
       2) либо, если цепляемся от mask3: тонкие связные швы, примыкающие к
          покраске, освободить от выброса <400px и не хардтреш'ить альфу базы;
       3) ОБЯЗАТЕЛЬНО прогнать dev/mask-audit.html (все 66 машин, mask3 vs новое)
          и сверить глазами ДО пуша - именно так v9 и поймали. */
  SRC: '-mask3.webp',
  OUT: '-mask5.webp',
  load(src) { return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); },
  px(img) { const cv = document.createElement('canvas'); cv.width = this.W; cv.height = this.H; const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0, this.W, this.H); return cx.getImageData(0, 0, this.W, this.H); },
  lum(d, i) { return 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; },
  toBin(imgData, fn) { const { data } = imgData, n = this.W * this.H, b = new Uint8Array(n); for (let p = 0; p < n; p++) b[p] = fn(data, p * 4) ? 1 : 0; return b; },
  minmax(src, r, isMin) { const { W, H } = this; const tmp = new Uint8Array(W * H), out = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) { const row = y * W; for (let x = 0; x < W; x++) { let v = isMin ? 1 : 0; for (let dx = -r; dx <= r; dx++) { const xx = x + dx; const s = (xx < 0 || xx >= W) ? 0 : src[row + xx]; v = isMin ? Math.min(v, s) : Math.max(v, s); } tmp[row + x] = v; } }
    for (let x = 0; x < W; x++) { for (let y = 0; y < H; y++) { let v = isMin ? 1 : 0; for (let dy = -r; dy <= r; dy++) { const yy = y + dy; const s = (yy < 0 || yy >= H) ? 0 : tmp[yy * W + x]; v = isMin ? Math.min(v, s) : Math.max(v, s); } out[y * W + x] = v; } }
    return out; },
  erode(b, r) { return this.minmax(b, r, true); },
  dilate(b, r) { return this.minmax(b, r, false); },
  open(b, r) { return this.dilate(this.erode(b, r), r); },
  and(a, b) { const n = a.length, o = new Uint8Array(n); for (let i = 0; i < n; i++) o[i] = a[i] & b[i]; return o; },
  components(b) { const { W, H } = this; const n = W * H; const lbl = new Int32Array(n); const stack = new Int32Array(n); const comps = [];
    for (let p = 0; p < n; p++) { if (!b[p] || lbl[p]) continue; let top = 0; stack[top++] = p; lbl[p] = 1; const comp = [];
      while (top) { const q = stack[--top]; comp.push(q); const x = q % W, y = (q / W) | 0;
        if (x > 0 && b[q - 1] && !lbl[q - 1]) { lbl[q - 1] = 1; stack[top++] = q - 1; }
        if (x < W - 1 && b[q + 1] && !lbl[q + 1]) { lbl[q + 1] = 1; stack[top++] = q + 1; }
        if (y > 0 && b[q - W] && !lbl[q - W]) { lbl[q - W] = 1; stack[top++] = q - W; }
        if (y < H - 1 && b[q + W] && !lbl[q + W]) { lbl[q + W] = 1; stack[top++] = q + W; } }
      comps.push(comp); }
    return comps; },
  dropSmallPos(b, rule) { const { W } = this; const dropped = [];
    this.components(b).forEach(c => { let sx = 0, sy = 0; c.forEach(q => { sx += q % W; sy += (q / W) | 0; });
      const cx = sx / c.length / this.W, cy = sy / c.length / this.H;
      if (rule(c.length, cx, cy)) { c.forEach(q => { b[q] = 0; }); dropped.push({ area: c.length }); } });
    return dropped; },

  buildMask7(P, B, oldM) { const { W, H } = this; const n = W * H;
    const sil = this.toBin(P, (d, i) => d[i + 3] > 40);
    let y0 = H, y1 = 0, x0 = W, x1 = 0;
    for (let p = 0; p < n; p++) if (sil[p]) { const y = (p / W) | 0, x = p % W; if (y < y0) y0 = y; if (y > y1) y1 = y; if (x < x0) x0 = x; if (x > x1) x1 = x; }
    const carH = y1 - y0, carW = x1 - x0, zoneY = y0 + 0.5 * carH;
    const plum = p => this.lum(P.data, p * 4);
    const bandY = y0 + 0.45 * carH;
    const xhist = new Int32Array(W), colMin = new Int32Array(W).fill(H), colMax = new Int32Array(W);
    for (let y = Math.floor(bandY); y <= y1; y++) for (let x = x0; x <= x1; x++) { const p = y * W + x; if (P.data[p * 4 + 3] > 200 && plum(p) < 95) { xhist[x]++; if (y < colMin[x]) colMin[x] = y; if (y > colMax[x]) colMax[x] = y; } }
    let hmax = 0; for (let x = 0; x < W; x++) if (xhist[x] > hmax) hmax = xhist[x];
    const thr = hmax * 0.38;
    const wheelCut = new Uint8Array(n);
    let run0 = -1; const discs = [];
    for (let x = x0; x <= x1 + 1; x++) {
      const on = x <= x1 && xhist[x] >= thr;
      if (on && run0 < 0) run0 = x;
      if (!on && run0 >= 0) { const rw = x - run0;
        if (rw > 0.06 * carW && rw < 0.35 * carW) { let mn = H, mx = 0;
          for (let xx = run0; xx < x; xx++) { if (colMin[xx] < mn) mn = colMin[xx]; if (colMax[xx] > mx) mx = colMax[xx]; }
          const cy = (mn + mx) / 2, cx = (run0 + x) / 2;
          let r = Math.max((mx - mn) / 2, rw / 2); r = Math.min(r, 0.16 * carW);
          discs.push({ cx, cy, r }); }
        run0 = -1; } }
    discs.forEach(({ cx, cy, r }) => { const R2 = r * r;
      for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(H - 1, Math.ceil(cy + r)); y++)
        for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(W - 1, Math.ceil(cx + r)); x++) {
          const dx = x - cx, dy = y - cy; const p = y * W + x;
          if (dx * dx + dy * dy <= R2 && plum(p) < 195) wheelCut[p] = 1; } });
    const glassCut = new Uint8Array(n);
    const darkTop = new Uint8Array(n);
    for (let p = 0; p < n; p++) { const y = (p / W) | 0; darkTop[p] = (P.data[p * 4 + 3] > 200 && plum(p) < 200 && y < zoneY) ? 1 : 0; }
    this.components(darkTop).forEach(c => { if (c.length >= 2200) c.forEach(q => { glassCut[q] = 1; }); });
    const light = new Uint8Array(n);
    for (let p = 0; p < n; p++) light[p] = (P.data[p * 4 + 3] > 200 && plum(p) >= 200) ? 1 : 0;
    const lightComps = this.components(light);
    let mainIdx = 0; lightComps.forEach((c, i) => { if (c.length > lightComps[mainIdx].length) mainIdx = i; });
    lightComps.forEach((c, ci) => {
      if (ci === mainIdx || c.length < 1200 || c.length > 25000) return;
      let by0 = H, by1 = 0, bx0 = W, bx1 = 0, sl = 0;
      c.forEach(q => { const y = (q / W) | 0, x = q % W; if (y < by0) by0 = y; if (y > by1) by1 = y; if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; sl += plum(q); });
      if (by0 >= y0 + 0.04 * carH && by1 <= y0 + 0.45 * carH && (bx1 - bx0) < 0.25 * carW && sl / c.length < 220) c.forEach(q => { glassCut[q] = 1; }); });
    const cutAll = new Uint8Array(n);
    { const g = this.dilate(glassCut, 2); for (let p = 0; p < n; p++) cutAll[p] = g[p] | wheelCut[p]; }
    const bodyValidW = B ? this.toBin(B, (d, i) => this.lum(d, i) > 128 && d[i + 3] > 128) : null;
    let bodyIn = 0, car = 0;
    if (bodyValidW) for (let p = 0; p < n; p++) if (sil[p]) { car++; bodyIn += bodyValidW[p]; }
    const useBody = bodyValidW && car && bodyIn / car > 0.25 && bodyIn / car < 0.95;
    const oldB = this.maskToBin(oldM);
    const src = useBody ? bodyValidW : oldB;
    let core = this.and(this.open(src, useBody ? 2 : 1), sil);
    for (let p = 0; p < n; p++) {
      if (cutAll[p]) { core[p] = 0; continue; }
      const y = (p / W) | 0;
      if (useBody && !oldB[p] && y > zoneY && plum(p) < 170) core[p] = 0; }
    core = this.open(core, 1);
    this.dropSmallPos(core, (area) => area < 400);
    const inv = new Uint8Array(n);
    for (let p = 0; p < n; p++) inv[p] = core[p] ? 0 : 1;
    this.components(inv).forEach(c => {
      if (c.length >= 3000) return;
      let touches = false, sl = 0, cut = 0;
      c.forEach(q => { const x = q % W, y = (q / W) | 0; if (x === 0 || y === 0 || x === W - 1 || y === H - 1) touches = true; sl += plum(q); if (cutAll[q] || !sil[q]) cut++; });
      if (!touches && cut / c.length < 0.2 && sl / c.length >= 140) c.forEach(q => { core[q] = 1; }); });
    const silE = this.erode(sil, 5); const near = this.dilate(core, 5);
    const fin = core.slice();
    for (let p = 0; p < n; p++) if (sil[p] && !silE[p] && near[p] && !cutAll[p]) fin[p] = 1;
    return { fin, useBody }; },

  /* Карта slug -> шаблон базы выводится из ИМЁН ФАЙЛОВ, без carmap.json
     (его в репозитории нет и не было — прежний buildAll падал на первой же
     строке). Листинги отдаёт http.server. Правило: у шаблона отбрасывается
     год, регистр вниз, подчёркивания в дефисы: 2015_Lexus_IS250 -> lexus-is250.
     Прогон 2026-07-20: так сходятся все 66 слагов из 77 шаблонов. */
  async carMap() {
    const names = async (url, re) => {
      const html = await (await fetch(url)).text();
      const set = new Set(); let m;
      const link = /href="([^"?]+)"/gi;
      while ((m = link.exec(html))) { const f = decodeURIComponent(m[1].split('/').pop()); if (re.test(f)) set.add(f); }
      return [...set];
    };
    const slugs = (await names('/assets/cars/', new RegExp(this.SRC.replace('.', '\\.') + '$')))
      .map(f => f.slice(0, -this.SRC.length));
    const tpls = await names('/tpl/', /_body_mask\.png$/);
    const norm = t => t.replace(/_body_mask\.png$/, '').replace(/^\d{4}_/, '').toLowerCase().replace(/_/g, '-');
    const bySlug = {}; tpls.forEach(t => { bySlug[norm(t)] = t.replace(/_body_mask\.png$/, ''); });
    const map = {}; slugs.forEach(s => { map[s] = bySlug[s] || null; });
    return map;
  },

  /* Старая маска читается по АЛЬФЕ, если файл альфа-прозрачный (формат v9),
     и по яркости, если это ещё непрозрачная ч/б маска (v7/v8). Без этой
     развилки полупрозрачная кайма AA читалась бы как rgb=255 -> lum=255,
     и маска раздувалась бы на пиксель за каждое поколение. */
  maskToBin(imgData) {
    const { data } = imgData, n = this.W * this.H;
    let translucent = false;
    for (let p = 0; p < n; p++) if (data[p * 4 + 3] < 250) { translucent = true; break; }
    return translucent
      ? this.toBin(imgData, (d, i) => d[i + 3] > 100)
      : this.toBin(imgData, (d, i) => this.lum(d, i) > 100);
  },

  /* only: перестроить лишь часть машин. Нужно и для повторов после сбоя, и
     потому что полный прогон 66 штук в неактивной вкладке душится браузером:
     гонять партиями по 8-10 надёжнее, чем одним куском. */
  async buildAll({ dryRun = false, only = null } = {}) { const F = this, W = F.W, H = F.H, n = W * H;
    const map = await F.carMap();
    let keys = Object.keys(map);
    if (only && only.length) keys = keys.filter(k => only.indexOf(k) >= 0);
    if (!keys.length) throw new Error('carMap пуста: сервер не отдаёт листинги /assets/cars/ и /tpl/');
    const bust = Date.now(); const out = [];
    for (const k of keys) {
      const [photo, body, mask] = await Promise.all([
        F.load('/assets/cars/' + k + '.webp?b=' + bust),
        map[k] ? F.load('/tpl/' + map[k] + '_body_mask.png') : Promise.resolve(null),
        F.load('/assets/cars/' + k + F.SRC + '?b=' + bust)]);
      if (!photo || !mask) { out.push({ k, err: 'load' }); continue; }
      const { fin, useBody } = F.buildMask7(F.px(photo), body ? F.px(body) : null, F.px(mask));

      /* ЭКСПОРТ — АЛЬФА-ПРОЗРАЧНЫЙ (формат v9, см. шапку файла).
         Белое на ПРОЗРАЧНОМ: alpha = сила покраски, rgb всегда 255.
         Непрозрачную ч/б маску Safari красит целиком, вместе с фоном. */
      const a = document.createElement('canvas'); a.width = W; a.height = H;
      const acx = a.getContext('2d'); const id = acx.createImageData(W, H); const d = id.data;
      for (let p = 0; p < n; p++) { const i = p * 4; d[i] = 255; d[i + 1] = 255; d[i + 2] = 255; d[i + 3] = fin[p] ? 255 : 0; }
      acx.putImageData(id, 0, 0);

      /* blur 1px даёт сглаженный край в АЛЬФЕ. Канвас размывает и цвет,
         поэтому rgb принудительно возвращается в 255, иначе кромка уедет
         в серый и плёнка на краю панели ляжет грязной. */
      const b2 = document.createElement('canvas'); b2.width = W; b2.height = H;
      const bx = b2.getContext('2d', { willReadFrequently: true });
      bx.filter = 'blur(1px)'; bx.drawImage(a, 0, 0); bx.filter = 'none';
      const soft = bx.getImageData(0, 0, W, H); const sd = soft.data;
      let opaque = 0, painted = 0;
      for (let p = 0; p < n; p++) { const i = p * 4;
        sd[i] = 255; sd[i + 1] = 255; sd[i + 2] = 255;
        if (sd[i + 3] < 6) sd[i + 3] = 0;
        if (sd[i + 3] === 255) opaque++;
        if (sd[i + 3] > 0) painted++; }
      bx.putImageData(soft, 0, 0);

      /* Предохранитель: если фон вышел непрозрачным, это ровно тот баг v8,
         из-за которого Safari красил всю машину и прямоугольник фона.
         Такое не сохраняем, а падаем с ошибкой. */
      if (opaque >= n * 0.98) { out.push({ k, err: 'маска непрозрачная — экспорт сломан, сохранение отменено' }); continue; }
      if (!painted) { out.push({ k, err: 'пустая маска' }); continue; }

      const blob = await new Promise(r => b2.toBlob(r, 'image/webp', 0.95));
      const share = +(painted / n * 100).toFixed(1);
      if (dryRun) { out.push({ k, useBody, painted: share, saved: false, dryRun: true }); continue; }
      const res = await fetch('/save?path=' + encodeURIComponent('assets/cars/' + k + F.OUT), { method: 'POST', body: blob });
      out.push({ k, useBody, painted: share, saved: res.ok }); }
    return out; },
};
