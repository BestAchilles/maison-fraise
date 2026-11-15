// Scene exercises: tap in picture, vrai/faux + correction, label floors, find differences
import { h, svgEl, $$ } from '../core/util.js';
import { sfx, say } from '../core/audio.js';
import { roomSVG, LOC, LOC_SAME, OBJ } from '../art/room.js';
import { houseSVG } from '../art/house.js';
import { placeChar } from '../art/char.js';
import { typeBlock, buildBlock } from './basic.js';
import { ICON } from '../art/icons.js';

export function sceneMarkup(sc) {
  if (!sc) return '';
  if (sc.kind === 'room') return roomSVG(sc.cfg);
  if (sc.kind === 'house') return houseSVG(sc.cfg);
  return sc.svg || '';
}
export function svgPoint(svg, e) {
  const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
const NS = 'http://www.w3.org/2000/svg';
function pin(svg, x, y, color = '#8B5CF6', r = 26) {
  const g = document.createElementNS(NS, 'g');
  g.innerHTML = `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" fill-opacity=".18" stroke="${color}" stroke-width="6"/><circle cx="${x}" cy="${y}" r="7" fill="${color}"/>`;
  g.style.transformOrigin = `${x}px ${y}px`; g.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  svg.querySelector('.marks').append(g); return g;
}
function ring(svg, rect, color) {
  const [x, y, w, hh] = rect; const g = document.createElementNS(NS, 'g');
  g.innerHTML = `<rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${hh + 16}" rx="16" fill="${color}" fill-opacity=".14" stroke="${color}" stroke-width="8"${color === '#2FBF71' ? '' : ' stroke-dasharray="14 9"'}/>`;
  g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
  svg.querySelector('.marks').append(g); return g;
}
/** keep a full-width scene inside the viewport (tablet landscape) */
export function fitScene(holder, reserve = 300) {
  const svg = holder.querySelector('svg'); if (!svg || !svg.viewBox || !svg.viewBox.baseVal) return;
  const { width, height } = svg.viewBox.baseVal; if (!height) return;
  holder.style.maxWidth = `max(320px, calc((100dvh - ${reserve}px) * ${(width / height).toFixed(3)}))`;
  holder.style.width = '100%'; holder.style.margin = '0 auto';
}
const sameLoc = (a, b) => a === b || (LOC_SAME[a] || []).includes(b) || (LOC_SAME[b] || []).includes(a);

// ---------------- tap in a scene ----------------
// ex.scene, ex.mode: 'locations'|'objects'|'furniture'|'rooms'|'floors'|'who', ex.targets:[...], ex.need, ex.placeWho
export function sceneTap(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const sc = JSON.parse(JSON.stringify(ex.scene));
  if (sc.kind === 'room') { sc.cfg.hits = ex.mode === 'locations' ? 'locations' : ex.mode === 'objects' ? 'objects' : ex.mode === 'furniture' ? 'furniture' : 'all'; if (ex.locs) sc.cfg.locs = ex.locs; }
  const holder = h('div', { class: 'scene mode-' + ex.mode }); holder.innerHTML = sceneMarkup(sc);
  const svg = holder.querySelector('svg');
  fitScene(holder, ex.q || ex.audio ? 330 : 270);
  if (ex.mode === 'rooms' || ex.mode === 'floors') $$('[data-who]', svg).forEach(e => e.style.pointerEvents = 'none');
  const need = ex.need || 1;
  const chosen = []; // {key, mark}
  const keyOf = (t) => {
    if (ex.mode === 'locations') { const z = t.closest('[data-loc]'); return z && z.dataset.loc; }
    if (ex.mode === 'rooms') { const z = t.closest('[data-room]'); return z && z.dataset.room; }
    if (ex.mode === 'floors') { const z = t.closest('[data-floor]'); return z && z.dataset.floor; }
    if (ex.mode === 'who') { const z = t.closest('[data-who]'); return z && z.dataset.who; }
    const z = t.closest('[data-hit]'); return z && z.dataset.hit.replace(/^obj:/, '');
  };
  svg.addEventListener('click', (e) => {
    if (ctx.locked) return;
    const p = svgPoint(svg, e);
    const k = keyOf(e.target);
    if (!k) { const m = pin(svg, p.x, p.y, '#B9B3C8', 14); setTimeout(() => m.remove(), 450); return; }
    const ix = chosen.findIndex(c => c.key === k);
    if (ix >= 0 && (ex.placeWho || ex.mode === 'floors')) { chosen[ix].mark.remove(); chosen.splice(ix, 1); }
    else if (ix >= 0) { chosen[ix].mark.remove(); chosen.splice(ix, 1); sfx.drop(); ctx.ready(chosen.length === need); return; }
    else {
      if (chosen.length >= need) { const old = chosen.shift(); old.mark.remove(); }
      let mark;
      if (ex.placeWho && (ex.mode === 'floors' || ex.mode === 'rooms')) {
        const zone = e.target.closest(ex.mode === 'floors' ? '[data-floor]' : '[data-room]');
        const bb = zone.getBBox();
        const g = document.createElementNS(NS, 'g'); g.innerHTML = placeChar(ex.placeWho, bb.x + bb.width / 2, bb.y + bb.height - 8, Math.min(120, bb.height * .85), { mood: 'joy' });
        svg.querySelector('.marks').append(g); mark = g;
        g.animate([{ transform: 'translateY(-40px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 350, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      } else mark = pin(svg, p.x, p.y);
      chosen.push({ key: k, mark }); sfx.pick();
    }
    ctx.ready(chosen.length === need);
  });
  const top = [];
  if (ex.audio) top.push(ctx.playBtn(ex.audio, { auto: true, slow: true }));
  if (ex.q) top.push(h('div', { class: 'bubble fr', html: ex.q }));
  if (ex.token) top.push(h('div', { class: 'chip', style: { gap: '8px' } }, svgEl(`<svg viewBox="-10 -6 220 250" width="40" height="44">${ex.token}</svg>`), ex.tokenLabel || ''));
  if (top.length) ctx.root.append(h('div', { class: 'qline' }, ...top));
  if (need > 1) ctx.root.append(h('div', { class: 'small-muted' }, `Tippe ${need} Orte an.`));
  ctx.root.append(holder);
  return {
    check() {
      ctx.locked = true;
      const want = ex.targets.slice();
      let right = 0;
      for (const c of chosen) {
        const ok = want.some(w => ex.mode === 'locations' ? sameLoc(w, c.key) : w === c.key);
        if (ok) right++;
        c.mark.querySelectorAll('circle').forEach(ci => { ci.setAttribute('stroke', ok ? '#2FBF71' : '#FF5A5F'); if (ci.getAttribute('r') === '7') ci.setAttribute('fill', ok ? '#2FBF71' : '#FF5A5F'); });
      }
      // show correct places
      for (const w of want) {
        if (ex.mode === 'locations' && LOC[w]) ring(svg, LOC[w].rect, '#2FBF71');
        else {
          const sel = ex.mode === 'rooms' ? `[data-room="${w}"]` : ex.mode === 'floors' ? `[data-floor="${w}"]` : ex.mode === 'who' ? `[data-who="${w}"]` : `[data-hit="${w}"],[data-hit="obj:${w}"]`;
          const els = [...svg.querySelectorAll(sel)];
          if (els.length) {
            const bs = els.map(el => el.getBBox());
            const x0 = Math.min(...bs.map(b => b.x)), y0 = Math.min(...bs.map(b => b.y)), x1 = Math.max(...bs.map(b => b.x + b.width)), y1 = Math.max(...bs.map(b => b.y + b.height));
            ring(svg, [x0, y0, x1 - x0, y1 - y0], '#2FBF71');
          }
        }
      }
      const ok = right === need;
      return { ok, score: right / need, sol: ex.sol || '', tip: ok ? ex.okTip : ex.tip };
    },
  };
}

// ---------------- vrai ou faux + correction (3B) ----------------
// ex.scene (room), ex.audio {text}, ex.truth (bool), ex.fix: { answers:[...], extra:[...] }, ex.num
export function vraiFaux(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const holder = h('div', { class: 'scene' }); holder.innerHTML = sceneMarkup(ex.scene);
  let choice = null, fixBlk = null;
  const fixWrap = h('div', { style: { display: 'none', flexDirection: 'column', gap: '10px' } });
  const vb = h('button', { class: 'opt', style: { justifyContent: 'center', fontSize: '22px' } }, h('span', { class: 'check' }), 'vrai');
  const fb = h('button', { class: 'opt', style: { justifyContent: 'center', fontSize: '22px' } }, h('span', { class: 'check' }), 'faux');
  const upd = () => ctx.ready(choice === 'vrai' || (choice === 'faux' && (!ex.fix || fixFilled)));
  let fixFilled = false;
  const setChoice = (c) => {
    choice = c; sfx.tap(); vb.classList.toggle('sel', c === 'vrai'); fb.classList.toggle('sel', c === 'faux');
    fixWrap.style.display = c === 'faux' && ex.fix ? 'flex' : 'none';
    if (c === 'faux' && ex.fix && !fixBlk) mountFix('type');
    upd();
  };
  const mountFix = (mode) => {
    fixWrap.innerHTML = '';
    fixWrap.append(h('div', { class: 'note' }, 'corrigé – Wo ist es wirklich? Schreib die richtige Lösung:'));
    const spec = { answers: ex.fix.answers, extra: ex.fix.extra, placeholder: 'z. B. sous la table', single: true };
    fixBlk = mode === 'type' ? typeBlock(spec, ctx, n => { fixFilled = n > 0; upd(); }) : buildBlock(spec, ctx, n => { fixFilled = n > 0; upd(); });
    fixWrap.append(fixBlk.el);
    if (mode === 'type' && ctx.mode !== 'exam') fixWrap.append(h('button', { class: 'hintbtn', onclick: () => { fixFilled = false; mountFix('build'); upd(); } }, svgEl(ICON.chips), 'Wortbausteine zeigen'));
  };
  vb.onclick = () => setChoice('vrai'); fb.onclick = () => setChoice('faux');
  const right = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
    h('div', { class: 'qline' }, ctx.playBtn(ex.audio, { auto: true, slow: true }), h('div', {}, h('div', { class: 'kicker', style: { fontWeight: 900, color: 'var(--grape)', fontSize: '13px', letterSpacing: '1px' } }, ex.num ? `NUMÉRO ${ex.num}` : 'ÉCOUTE'), h('div', { class: 'h', style: { fontSize: '24px' } }, ex.objLabel || ''))),
    h('div', { class: 'opts', style: { gridTemplateColumns: '1fr 1fr' } }, vb, fb), fixWrap);
  ctx.root.append(h('div', { class: 'split vf' }, holder, right));
  return {
    check() {
      const truthWord = ex.truth ? 'vrai' : 'faux';
      const okChoice = choice === truthWord;
      (ex.truth ? vb : fb).classList.add('good'); if (!okChoice) (choice === 'vrai' ? vb : fb).classList.add('bad');
      // highlight the real place
      const svg = holder.querySelector('svg');
      if (ex.realAt && LOC[ex.realAt]) ring(svg, LOC[ex.realAt].rect, '#2FBF71');
      else if (ex.realRect) ring(svg, ex.realRect, '#2FBF71');
      if (!okChoice) return { ok: false, score: 0, given: choice || '–', sol: `${truthWord.toUpperCase()} – ${ex.realSentence}`, tip: 'Schau genau ins Bild: Grün eingekreist siehst du, wo es wirklich ist.' };
      if (ex.truth) return { ok: true, score: 1, sol: ex.realSentence };
      const r = fixBlk.check();
      return { ok: r.ok, score: r.ok ? 1 : .5, almost: r.almost, given: r.given, sol: r.ok ? ex.realSentence : `faux ✓ – aber die Korrektur ist: ${ex.fix.answers[0]}`, tip: r.tip };
    },
  };
}

// ---------------- label floors (Les étages) ----------------
// ex.scene (house with labels:'blank'), ex.want: { [floorIndex]: 'le premier étage' }, ex.bank
export function labelFloors(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const holder = h('div', { class: 'scene' }); holder.innerHTML = sceneMarkup(ex.scene);
  const svg = holder.querySelector('svg');
  const vals = {}; let picked = null;
  const bank = h('div', { class: 'bank', style: { justifyContent: 'flex-start' } });
  const chips = ctx.rng.shuffle(ex.bank).map(w => {
    const c = h('button', { class: 'chip' }, w);
    c.onclick = () => { if (c.classList.contains('ghost')) return; bank.querySelectorAll('.chip').forEach(x => x.classList.remove('sel')); picked = c; c.classList.add('sel'); sfx.tap(); say(w, 'w'); };
    bank.append(c); return c;
  });
  $$('[data-flabel]', svg).forEach(g => {
    g.style.cursor = 'pointer';
    g.addEventListener('click', () => {
      const i = g.dataset.flabel; const t = g.querySelector('text');
      if (vals[i]) { vals[i].chip.classList.remove('ghost'); delete vals[i]; t.textContent = '?'; t.setAttribute('fill', '#8A84A3'); sfx.drop(); }
      else if (picked) { vals[i] = { w: picked.textContent, chip: picked }; picked.classList.add('ghost'); picked.classList.remove('sel'); t.textContent = short(picked.textContent); t.setAttribute('fill', '#2E2A4A'); picked = null; sfx.pick(); }
      ctx.ready(Object.keys(vals).length === Object.keys(ex.want).length);
    });
  });
  fitScene(holder, 380);
  ctx.root.append(h('div', { class: 'note' }, 'Tippe ein Wort an und dann das passende Schild links am Haus.'), bank, holder);
  return {
    check() {
      let right = 0; const keys = Object.keys(ex.want);
      for (const k of keys) {
        const ok = vals[k] && vals[k].w === ex.want[k];
        if (ok) right++;
        const g = svg.querySelector(`[data-flabel="${k}"] rect`); g.setAttribute('stroke', ok ? '#2FBF71' : '#FF5A5F'); g.removeAttribute('stroke-dasharray');
        if (!ok) { const t = svg.querySelector(`[data-flabel="${k}"] text`); t.textContent = short(ex.want[k]); t.setAttribute('fill', '#D93C42'); }
      }
      return { ok: right === keys.length, score: right / keys.length, sol: right === keys.length ? '' : 'Rot = korrigiert. Lies die Schilder nochmals laut.' };
    },
  };
}
const short = (w) => w.replace(/^le |^la /, '');

// ---------------- find the differences (3C) ----------------
// ex.a, ex.b : room cfgs ; ex.diffs: [{ rect:[x,y,w,h], o }]
export function differences(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const A = h('div', { class: 'scene' }); A.innerHTML = roomSVG(ex.a);
  const B = h('div', { class: 'scene' }); B.innerHTML = roomSVG(ex.b);
  const svg = B.querySelector('svg');
  const found = new Set(); let misses = 0;
  const counter = h('div', { class: 'h', style: { fontSize: '22px' } });
  const upd = () => { counter.textContent = `${found.size} / ${ex.diffs.length} gefunden`; };
  upd();
  const center = (r) => [r[0] + r[2] / 2, r[1] + r[3] / 2];
  const missEl = h('span', { class: 'small-muted' });
  svg.addEventListener('click', (e) => {
    if (ctx.locked) return;
    const p = svgPoint(svg, e);
    const inR = (r) => p.x >= r[0] - 16 && p.x <= r[0] + r[2] + 16 && p.y >= r[1] - 16 && p.y <= r[1] + r[3] + 16;
    let best = -1, bd = 1e9;
    ex.diffs.forEach((d, k) => {
      if (found.has(k)) return;
      for (const r of (d.rects || [d.rect])) if (inR(r)) { const [cx, cy] = center(r); const dd = Math.hypot(cx - p.x, cy - p.y); if (dd < bd) { bd = dd; best = k; } }
    });
    if (best >= 0) {
      const i = best; found.add(i); sfx.correct();
      const [x, y, w, hh] = ex.diffs[i].rect; const cx = x + w / 2, cy = y + hh / 2, r = Math.max(w, hh) / 2 + 18;
      const g = document.createElementNS(NS, 'g'); g.innerHTML = `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * .9}" fill="none" stroke="#FF2D2D" stroke-width="7"/>`; svg.querySelector('.marks').append(g);
      g.style.transformOrigin = `${cx}px ${cy}px`; g.animate([{ opacity: 0, transform: 'scale(1.3)' }, { opacity: 1, transform: 'none' }], { duration: 300 });
      upd(); if (found.size === ex.diffs.length) ctx.submit();
    } else {
      misses++; sfx.wrong(); missEl.textContent = `· ${misses} Fehltipp${misses === 1 ? '' : 's'}`;
      const m = pin(svg, p.x, p.y, '#FF5A5F', 18); setTimeout(() => m.remove(), 600);
    }
  });
  ctx.root.append(h('div', { class: 'qline', style: { justifyContent: 'space-between' } }, h('div', { class: 'note' }, 'Bild A (vorher) – Bild B (nachher): Tippe in Bild B auf die Unterschiede. Nicht wild raten – Fehltipps zählen!'), h('div', {}, counter, ' ', missEl)),
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(420px,100%),1fr))', gap: '14px' } }, h('div', {}, h('div', { class: 'h' }, 'A'), A), h('div', {}, h('div', { class: 'h' }, 'B'), B)));
  ctx.ready(true, 'Fertig');
  return {
    check() {
      ctx.locked = true;
      ex.diffs.forEach((d, i) => { if (!found.has(i)) ring(svg, d.rect, '#FFC83D'); });
      const score = Math.max(0, (found.size - Math.max(0, misses - 2) * .5) / ex.diffs.length);
      const ok = found.size >= ex.diffs.length - 1 && misses <= 3;
      return { ok, score, note: `${found.size} von ${ex.diffs.length} Unterschieden gefunden${misses ? `, ${misses} Fehltipps` : ''}.`, tip: found.size < ex.diffs.length ? 'Die gelb markierten hast du übersehen.' : misses > 3 ? 'Schau genauer hin, bevor du tippst – zu viele Fehltipps.' : '' };
    },
  };
}
