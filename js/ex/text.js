// Text exercises: cloze (Lückentext), slots (ne/n'/pas einsetzen), mark (Wörter markieren)
import { h, normText, loose, esc } from '../core/util.js';
import { sfx } from '../core/audio.js';
import { vis, ACCENTS } from './basic.js';
import { tipFor } from './check.js';

// ---------------- Lückentext ----------------
export function cloze(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const typing = !ex.bank;
  const gaps = [];
  let active = null;
  const text = h('div', { class: 'cloze' });
  const paras = splitParas(ex.parts);
  for (const para of paras) {
    const p = h('p');
    for (const part of para) {
      if (typeof part === 'string') { p.append(document.createTextNode(part)); continue; }
      const g = h('span', { class: 'gap' });
      g.dataset.i = gaps.length;
      const info = { el: g, want: part.g, value: '', chip: null };
      if (typing) {
        const inp = h('input', { type: 'text', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', autocomplete: 'off', size: Math.max(6, part.g[0].length) });
        inp.addEventListener('input', () => { info.value = inp.value; g.classList.toggle('filled', !!inp.value.trim()); upd(); });
        inp.addEventListener('focus', () => { active = info; });
        g.append(inp); info.inp = inp;
      } else {
        g.addEventListener('click', () => {
          if (info.chip) { unplace(info); upd(); return; }
          gaps.forEach(x => x.el.classList.remove('active')); active = info; g.classList.add('active'); sfx.tap();
        });
      }
      gaps.push(info); p.append(g);
    }
    text.append(p);
  }
  const bank = h('div', { class: 'bank' });
  const unplace = (info) => {
    const c = info.chip; info.chip = null; info.value = ''; info.el.textContent = ''; info.el.classList.remove('filled');
    c.classList.remove('ghost'); sfx.drop();
  };
  if (!typing) {
    const words = ctx.rng.shuffle(ex.bank);
    for (const w of words) {
      const c = h('button', { class: 'chip' }, w);
      c.addEventListener('click', () => {
        if (c.classList.contains('ghost')) return;
        let target = active && !active.chip ? active : gaps.find(x => !x.chip);
        if (!target) return;
        target.chip = c; target.value = w; target.el.textContent = w; target.el.classList.add('filled'); target.el.classList.remove('active');
        c.classList.add('ghost'); sfx.pick();
        active = gaps.find(x => !x.chip) || null; if (active) active.el.classList.add('active');
        upd();
      });
      bank.append(c);
    }
    active = gaps[0]; if (active) active.el.classList.add('active');
  }
  const upd = () => ctx.ready(gaps.every(g => (g.value || '').trim()));
  const top = [];
  if (ex.audio) top.push(h('div', { class: 'qline' }, ctx.playBtn(ex.audio, { auto: !!ex.autoplay, slow: true }), h('div', { class: 'note' }, ex.audioNote || 'Hör zu und fülle die Lücken.')));
  const body = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } }, ...top, text);
  if (!typing) body.append(bank);
  else body.append(h('div', { class: 'accents' }, ...ACCENTS.map(a => h('button', { onmousedown: e => e.preventDefault(), onclick: () => { if (active && active.inp) { const i = active.inp; const s = i.selectionStart ?? i.value.length; i.value = i.value.slice(0, s) + a + i.value.slice(i.selectionEnd ?? s); i.focus(); i.setSelectionRange(s + 1, s + 1); i.dispatchEvent(new Event('input')); } } }, a))));
  ctx.root.append(ex.img ? h('div', { class: 'split' }, vis(ex.img), body) : body);
  return {
    check() {
      let right = 0, tip = '', almost = 0; const wrong = [];
      gaps.forEach((g, k) => {
        const v = normText(g.value);
        const okExact = g.want.some(w => normText(w) === v);
        const isLoose = !okExact && g.want.some(w => loose(w) === loose(g.value));
        const ok = okExact || (isLoose && ctx.mode !== 'exam');
        if (ok) right++; else { wrong.push(`${k + 1}: <b>${g.want[0]}</b>${g.value ? ` (statt «${g.value}»)` : ''}`); if (!tip) tip = tipFor(g.value, g.want[0]); }
        if (isLoose) almost++;
        g.el.classList.remove('filled', 'active'); g.el.classList.add(okExact ? 'good' : isLoose ? 'almost' : 'bad');
        if (g.inp) g.inp.disabled = true;
        if (!okExact) g.el.append(h('span', { class: 'fix' }, '→ ' + g.want[0]));
      });
      const ok = right === gaps.length;
      const scoreExam = (right + (ctx.mode === 'exam' ? almost * .5 : 0)) / gaps.length;
      return { ok, almost: ok && almost > 0, score: ok ? 1 : scoreExam, note: ok ? (almost ? 'Achte auf die Akzente – die gelben Lücken sind fast richtig.' : '') : `${right} von ${gaps.length} Lücken richtig`, gapReport: wrong.join(' · '),
        tip: ok ? '' : (tip || 'Die richtigen Wörter stehen jetzt neben den roten Lücken.') };
    },
  };
}
function splitParas(parts) {
  const out = [[]];
  for (const p of parts) {
    if (typeof p === 'string' && p.includes('\n')) {
      const bits = p.split('\n');
      bits.forEach((b, i) => { if (b) out[out.length - 1].push(b); if (i < bits.length - 1) out.push([]); });
    } else out[out.length - 1].push(p);
  }
  return out;
}

// ---------------- ne / n' / pas einsetzen (LMVZ "Verneine den Satz") ----------------
export function slots(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const n = ex.words.length;
  const slotEls = [];
  const state = Array(n + 1).fill(null);
  let picked = null;
  const line = h('div', { class: 'cloze', style: { lineHeight: 2.6 } });
  for (let i = 0; i <= n; i++) {
    const s = h('span', { class: 'gap slot' }); s.dataset.i = i;
    s.addEventListener('click', () => {
      if (state[i]) { const c = state[i]; state[i] = null; s.textContent = ''; s.classList.remove('filled'); c.classList.remove('ghost'); sfx.drop(); upd(); return; }
      if (picked) { place(picked, i); }
      else { s.classList.add('hint'); setTimeout(() => s.classList.remove('hint'), 420); noteEl.textContent = 'Wähle zuerst unten ein Wort (ne, n\' oder pas) – dann tippe auf die Lücke.'; }
    });
    slotEls.push(s); line.append(s);
    if (i < n) line.append(h('span', { style: { margin: '0 2px' } }, ex.words[i]));
  }
  const place = (chip, i) => {
    state[i] = chip; slotEls[i].textContent = chip.textContent; slotEls[i].classList.add('filled');
    chip.classList.add('ghost'); chip.classList.remove('sel'); picked = null; sfx.pick(); upd();
  };
  const bank = h('div', { class: 'bank' });
  for (const t of ctx.rng.shuffle(ex.chips)) {
    const c = h('button', { class: 'chip neg' }, t);
    c.addEventListener('click', () => {
      if (c.classList.contains('ghost')) return;
      bank.querySelectorAll('.chip').forEach(x => x.classList.remove('sel'));
      picked = c; c.classList.add('sel'); sfx.tap();
      slotEls.forEach(s => s.classList.toggle('active', !s.classList.contains('filled')));
    });
    bank.append(c);
  }
  const upd = () => { slotEls.forEach(s => s.classList.remove('active')); ctx.ready(state.some(Boolean)); };
  const parts = [];
  if (ex.img) parts.push(vis(ex.img, 'scene'));
  const noteEl = h('div', { class: 'note' }, 'Tippe zuerst auf ein Wort unten, dann auf die passende Lücke.');
  ctx.root.append(h('div', { class: ex.img ? 'split' : '' }, ...parts, h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
    noteEl, line, bank)));
  return {
    check() {
      let ok = true, posOk = true, neSwap = false;
      for (let i = 0; i <= n; i++) {
        const want = ex.answer[i] || null, have = state[i] ? state[i].textContent : null;
        if (want !== have) ok = false;
        if (!!want !== !!have) posOk = false;
        if (want && have && want !== have && /^ne$|^n'$/.test(want) && /^ne$|^n'$/.test(have)) neSwap = true;
        if (have) slotEls[i].classList.add(want === have ? 'good' : 'bad');
        else if (want) { slotEls[i].classList.add('bad'); slotEls[i].textContent = want; }
      }
      const sol = ex.full || buildFull(ex);
      const tip = ok ? '' : posOk && neSwap ? "Die Stellen stimmen! Aber: vor Vokal oder stummem h <b>n'</b>, sonst <b>ne</b>." : "ne (n') steht <b>vor</b> dem Verb, pas <b>nach</b> dem Verb.";
      return { ok, sol, tip };
    },
  };
}
function buildFull(ex) {
  const out = [];
  for (let i = 0; i <= ex.words.length; i++) { if (ex.answer[i]) out.push(ex.answer[i]); if (i < ex.words.length) out.push(ex.words[i]); }
  return out.join(' ').replace(/' /g, "'").replace(/ \./g, '.');
}

// ---------------- Wörter markieren (1A: Räume blau, Stockwerke rot) ----------------
// Every word is tapped on its own. A target phrase counts when all its "head" words carry the right colour;
// function words (la, au, de …) inside a target may be marked or not.
const MARK_FUNC = new Set(['le', 'la', 'les', "l'", 'au', 'aux', 'à', 'a', 'de', 'du', 'des', "d'", 'un', 'une', 'ma', 'mon', 'mes', 'dans', 'il', 'y', 'je', "j'", 'et']);
export function mark(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const cats = ex.cats;
  let pen = Object.keys(cats)[0];
  const pens = h('div', { class: 'pens' }, ...Object.entries(cats).map(([k, c]) => {
    const b = h('button', { class: 'pen' + (k === pen ? ' on' : '') }, h('i', { style: { background: c.color } }), c.label);
    b.addEventListener('click', () => { pen = k; pens.querySelectorAll('.pen').forEach(x => x.classList.remove('on')); b.classList.add('on'); sfx.tap(); });
    return b;
  }));
  const box = h('div', { class: 'markable' });
  // tokenize text into words (punctuation glued to the word before)
  const words = []; // {text, el, cat:null, t:null, head:bool}
  const lines = ex.text.split('\n');
  lines.forEach((line, li) => {
    const toks = line.match(/[^\s]+/g) || [];
    toks.forEach((tk, k) => {
      const m = tk.match(/^(.*?)([.,!?;:«»]*)$/);
      const core = m[1], punct = m[2];
      const parts = core.split(/(?<=')/).filter(Boolean); // keep "l'", "n'" as own word
      parts.forEach(pt => {
        const sp = h('span', { class: 'mw' }, pt);
        words.push({ text: pt, el: sp }); box.append(sp);
      });
      if (punct) box.append(h('span', { class: 'pun' }, punct));
      if (k < toks.length - 1) box.append(' ');
    });
    if (li < lines.length - 1) box.append(h('br'));
  });
  // find target phrases in word sequence
  const norm = (w) => w.toLowerCase();
  const targets = ex.targets.map(t => ({ ...t, idx: [] }));
  for (const t of targets) {
    const tw = (t.p.match(/[^\s]+/g) || []).flatMap(x => x.replace(/[.,!?;:]+$/, '').split(/(?<=')/)).filter(Boolean).map(norm);
    for (let i = 0; i + tw.length <= words.length; i++) {
      if (tw.every((w, k) => norm(words[i + k].text) === w) && !words.slice(i, i + tw.length).some(w => w.t)) {
        t.idx.push(...Array.from({ length: tw.length }, (_, k) => i + k));
        for (let k = 0; k < tw.length; k++) { words[i + k].t = t; words[i + k].head = !MARK_FUNC.has(norm(words[i + k].text)); }
        break;
      }
    }
  }
  words.forEach(w => {
    w.el.addEventListener('click', () => {
      if (ctx.locked) return;
      Object.values(cats).forEach(c => w.el.classList.remove(c.cls));
      if (w.cat === pen) w.cat = null; else { w.cat = pen; w.el.classList.add(cats[pen].cls); }
      sfx.tap(); ctx.ready(words.some(x => x.cat));
    });
  });
  ctx.root.append(h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, pens, box, ex.note ? h('div', { class: 'small-muted', html: ex.note }) : ''));
  return {
    check() {
      let right = 0, wrong = 0;
      const real = targets.filter(t => !t.opt && t.idx.length);
      for (const t of real) {
        const heads = t.idx.map(i => words[i]).filter(w => w.head);
        const ok = heads.length && heads.every(w => w.cat === t.c);
        if (ok) { right++; heads.forEach(w => w.el.classList.add('m-good')); }
        else heads.forEach(w => { if (w.cat !== t.c) { Object.values(cats).forEach(c => w.el.classList.remove(c.cls)); w.el.classList.add(cats[t.c].cls, 'm-miss'); } });
      }
      for (const w of words) {
        if (!w.cat) continue;
        if (!w.t) { wrong++; w.el.classList.add('m-bad'); }
        else if (w.t.opt) { /* optional: either way fine */ }
        else if (w.head && w.cat !== w.t.c) wrong++;
      }
      const total = real.length;
      const ok = right === total && wrong === 0;
      return { ok, score: Math.max(0, right - wrong) / total, note: ok ? '' : `${right} von ${total} richtig markiert${wrong ? `, ${wrong} Wörter zu viel / falsch` : ''}`, tip: ok ? '' : 'Gelb umrandet = vergessen. Rot umrandet = falsch markiert.' };
    },
  };
}
