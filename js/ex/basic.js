// Basic exercise renderers: info, flash, choice, multi, match, build, type
import { h, svgEl, esc } from '../core/util.js';
import { say, sfx } from '../core/audio.js';
import { ICON } from '../art/icons.js';
import { checkTyped, joinTokens, tipFor } from './check.js';
import { normText, stripAccents } from '../core/util.js';

export const ACCENTS = ['é', 'è', 'ê', 'à', 'â', 'ç', 'ô', 'î', 'œ', "'"];

/** visual block (svg string or element) */
export const vis = (svg, cls = 'scene') => { const d = h('div', { class: cls }); d.innerHTML = svg; return d; };

export function sayBtn(text, voice = 'n', cls = 'say') {
  const b = h('button', { class: cls, 'aria-label': 'Anhören', onclick: (e) => { e.stopPropagation(); say(text, voice); } });
  b.innerHTML = ICON.speaker; return b;
}

// ---------------- info / rule card ----------------
export function info(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const card = h('div', { class: 'rule', html: ex.html });
  const wrap = ex.img ? h('div', { class: 'split' }, card, vis(ex.img, 'scene')) : card;
  ctx.root.append(wrap);
  if (ex.say) ctx.root.append(h('div', { class: 'qline' }, ...ex.say.map(s => h('div', { class: 'bubble fr', style: { fontSize: '19px' } }, sayBtn(s.text, s.voice), ' ', s.text))));
  ctx.ready(true, 'Weiter');
  return { check: () => ({ ok: true, neutral: true }) };
}

// ---------------- flashcard ----------------
export function flash(ex, ctx) {
  const v = ex.v;
  ctx.root.append(ctx.head({ kicker: 'Neues Wort', prompt: 'Hör gut zu und sprich nach. Tippe auf die Karte!', heft: ex.heft }));
  const artCls = /^(la |une )/.test(v.fr) ? 'art-f' : /^(le |un )/.test(v.fr) ? 'art-m' : /^(les )/.test(v.fr) ? 'art-pl' : '';
  const front = h('div', { class: 'face' }, svgEl(v.pic()), h('div', { class: 'w ' + artCls }, v.fr), v.note ? h('div', { class: 'hint' }, v.note) : null);
  const back = h('div', { class: 'face back' }, h('div', { class: 'hint' }, 'Deutsch'), h('div', { class: 'd' }, v.de), h('div', { class: 'w ' + artCls, style: { fontSize: '26px' } }, v.fr));
  const card = h('div', { class: 'fcard', onclick: () => { card.classList.toggle('flip'); sfx.whoosh(); if (!card.classList.contains('flip')) say(v.fr, 'w'); } }, h('div', { class: 'in' }, front, back));
  const row = h('div', { class: 'qline', style: { justifyContent: 'center' } },
    ctx.playBtn({ text: v.fr, voice: 'w' }, { auto: true }));
  ctx.root.append(card, row);
  ctx.ready(true, 'Weiter');
  return { check: () => ({ ok: true, neutral: true }) };
}

// ---------------- choice / multi ----------------
function question(ex, ctx) {
  const parts = [];
  if (ex.audio) parts.push(ctx.playBtn(ex.audio, { auto: true, slow: true }));
  if (ex.q) {
    const b = h('div', { class: 'bubble fr' }, h('span', { html: ex.q }));
    if (ex.qSay) b.prepend(sayBtn(ex.qSay.text || ex.q, ex.qSay.voice || 'n'), ' ');
    if (ex.who) parts.push(h('div', { class: 'speaker' }, h('div', { class: 'who bob', html: ctx.char(ex.who, ex.mood) }), b));
    else parts.push(b);
  }
  return parts.length ? h('div', { class: 'qline' }, ...parts) : null;
}
function optionsBlock(ex, ctx, multi) {
  const isImg = ex.options.some(o => o.svg);
  const box = h('div', { class: 'opts' + (isImg ? ' imgs' : '') + (ex.cols1 ? ' cols1' : '') });
  const sel = new Set();
  const btns = ex.options.map((o, i) => {
    const b = h('button', { class: 'opt' + (o.svg ? ' img' : '') },
      multi ? h('span', { class: 'check' }) : (!o.svg ? h('span', { class: 'k' }, String(i + 1)) : null));
    if (o.svg) b.append(svgEl(o.svg));
    if (o.t) b.append(h('span', { html: esc(o.t) }));
    b.addEventListener('click', () => {
      sfx.tap();
      if (multi) { sel.has(i) ? sel.delete(i) : sel.add(i); b.classList.toggle('sel', sel.has(i)); }
      else { sel.clear(); sel.add(i); btns.forEach((x, k) => x.classList.toggle('sel', k === i)); }
      if (o.say) say(o.say, o.voice || 'n');
      ctx.ready(sel.size > 0);
    });
    box.append(b); return b;
  });
  return { box, sel, btns };
}
export function choice(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const q = question(ex, ctx);
  const { box, sel, btns } = optionsBlock(ex, ctx, false);
  if (ex.img) ctx.root.append(h('div', { class: ex.side === false ? '' : 'split' }, vis(ex.img), h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } }, q, box)));
  else ctx.root.append(q || '', box);
  return {
    check() {
      const i = [...sel][0]; const ok = i === ex.answer;
      if (btns[ex.answer]) btns[ex.answer].classList.add('good'); if (!ok && btns[i]) btns[i].classList.add('bad');
      return { ok, sol: ex.solText || (ex.options[ex.answer].t || ''), tip: ok ? ex.okTip : ex.tip };
    },
  };
}
export function multi(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const q = question(ex, ctx);
  const { box, sel, btns } = optionsBlock(ex, ctx, true);
  const right = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } }, q, h('div', { class: 'small-muted' }, 'Mehrere Antworten sind möglich.'), box);
  ctx.root.append(ex.img ? h('div', { class: 'split' }, vis(ex.img), right) : right);
  return {
    check() {
      const want = new Set(ex.answer);
      let ok = want.size === sel.size && [...want].every(i => sel.has(i));
      btns.forEach((b, i) => { if (want.has(i)) b.classList.add('good'); else if (sel.has(i)) b.classList.add('bad'); });
      return { ok, sol: ex.answer.map(i => ex.options[i].t).join(', ') };
    },
  };
}

// ---------------- match pairs ----------------
export function match(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const R = ctx.rng;
  const L = R.shuffle(ex.pairs.map((p, i) => ({ i, ...p.l }))), Rt = R.shuffle(ex.pairs.map((p, i) => ({ i, ...p.r })));
  let pick = null, errors = 0, done = 0;
  const mk = (it, side) => {
    const b = h('button', { class: 'opt' });
    if (it.svg) { b.classList.add('img'); b.append(svgEl(it.svg)); }
    if (it.t) b.append(h('span', {}, it.t));
    b.dataset.i = it.i; b.dataset.side = side;
    b.addEventListener('click', () => {
      if (it.say) say(it.say, 'w');
      if (!pick || pick.dataset.side === side) { if (pick) pick.classList.remove('sel'); pick = b; b.classList.add('sel'); sfx.tap(); return; }
      if (pick.dataset.i === b.dataset.i) {
        sfx.correct(); [pick, b].forEach(x => { x.classList.remove('sel'); x.classList.add('good'); setTimeout(() => x.classList.add('gone'), 380); });
        pick = null; done++;
        if (done === ex.pairs.length) setTimeout(() => ctx.finish({ ok: errors <= 1, sol: errors ? `${errors} Fehler` : '', tip: errors > 1 ? 'Übe diese Wörter nochmals!' : '' }), 500);
      } else {
        errors++; sfx.wrong(); const p = pick; [p, b].forEach(x => { x.classList.add('bad'); setTimeout(() => x.classList.remove('bad', 'sel'), 500); }); pick = null;
      }
    });
    return b;
  };
  const grid = h('div', { class: 'match' }, h('div', { class: 'col' }, ...L.map(x => mk(x, 'l'))), h('div', { class: 'col' }, ...Rt.map(x => mk(x, 'r'))));
  ctx.root.append(grid);
  ctx.ready(false, null, { hideCheck: true });
  return { check: () => ({ ok: errors <= 1 }) };
}

// ---------------- sentence builder (chips) ----------------
export function buildBlock(ex, ctx, onChange) {
  const answers = ex.answers;
  let core = answers[0];
  if (ex.pre && core.startsWith(ex.pre)) core = core.slice(ex.pre.length);
  if (ex.post && core.trim().endsWith(ex.post)) core = core.trim().slice(0, -ex.post.length);
  const tokens = ex.tokens || tokenize(core.trim());
  const pool = ctx.rng.shuffle([...tokens, ...(ex.extra || [])]);
  const line = h('div', { class: 'answer-line' });
  const bank = h('div', { class: 'bank' });
  const placed = [];
  const chips = pool.map((t, i) => {
    const c = h('button', { class: 'chip' + (/^(ne|n'|pas)$/.test(t) ? ' neg' : '') }, t);
    c.addEventListener('click', () => {
      sfx.pick();
      if (c.parentElement === bank) {
        const ghost = h('span', { class: 'chip ghost' }, t); ghost.dataset.k = i; c.dataset.k = i;
        bank.replaceChild(ghost, c); line.append(c); placed.push(c); c.classList.add('fly');
      } else {
        const ghost = bank.querySelector(`.ghost[data-k="${c.dataset.k}"]`);
        bank.replaceChild(c, ghost); placed.splice(placed.indexOf(c), 1);
      }
      setTimeout(() => c.classList.remove('fly'), 260);
      onChange && onChange(placed.length);
    });
    bank.append(c); return c;
  });
  const wrap = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } });
  if (ex.pre || ex.post) wrap.append(h('div', { class: 'qline', style: { fontSize: '22px', fontWeight: 800 } }, ex.pre || '', h('div', { style: { flex: 1, minWidth: '200px' } }, line), ex.post || ''));
  else wrap.append(line);
  wrap.append(bank);
  return {
    el: wrap,
    value: () => [ex.pre || '', joinTokens(placed.map(c => c.textContent)), ex.post || ''].join(' ').trim(),
    check() {
      const v = this.value();
      const full = answers.map(a => a);
      const ok = full.some(a => normText(a) === normText(v));
      placed.forEach(c => c.classList.add(ok ? 'good' : 'bad'));
      return { ok, sol: answers[0], tip: ok ? '' : tipFor(v, answers[0]), given: v };
    },
  };
}
export function tokenize(s) {
  // keep apostrophe words together with the following word split: "n'aime" -> ["n'", "aime"] only for ne
  return s.replace(/[.!?,;:]/g, ' ').split(/\s+/).filter(Boolean).flatMap(w => /^(n'|j'|l'|d'|s'|qu')(.+)/i.test(w) && /^n'/i.test(w) ? [w.slice(0, 2), w.slice(2)] : [w]);
}
export function build(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const q = question(ex, ctx);
  const b = buildBlock(ex, ctx, n => ctx.ready(n > 0));
  const right = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } }, q, b.el);
  ctx.root.append(ex.img ? h('div', { class: 'split' }, vis(ex.img), right) : right);
  return {
    check() { const r = b.check(); if (r.ok && ex.sayAfter !== false) say(ex.answers[0], ex.voiceAfter || 'n'); return r; },
  };
}

// ---------------- typing ----------------
const ARTS = ['le', 'la', 'les', "l'", 'un', 'une', 'du', 'au', 'de'];
function autoExtra(answer) {
  const m = answer.match(/^(le|la|les|l'|un|une) /i);
  if (!m) return ['de', 'le'];
  return ARTS.filter(a => a !== m[1].toLowerCase()).slice(0, 3);
}
/** patterns may be RegExp or strings (strings survive JSON in the Fehlerkiste) */
function compilePatterns(list) {
  return (list || []).map(p => {
    const src = p instanceof RegExp ? p.source : typeof p === 'string' ? p : null;
    if (!src) return null;
    try { return { re: new RegExp(src, 'i'), loose: new RegExp(stripAccents(src).replace(/-/g, '[- ]'), 'i') }; } catch (e) { return null; }
  }).filter(Boolean);
}
export function typeBlock(ex, ctx, onChange) {
  const multiline = (ex.answers[0] || '').length > 34 && !ex.single;
  const common = { placeholder: ex.placeholder || 'Schreib hier …', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', autocomplete: 'off', enterkeyhint: 'done' };
  const inp = multiline ? h('textarea', { rows: 2, ...common }) : h('input', { type: 'text', ...common });
  inp.addEventListener('input', () => onChange && onChange(inp.value.trim().length));
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); ctx.submit(); } });
  inp.addEventListener('focus', () => setTimeout(() => inp.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300));
  const acc = h('div', { class: 'accents' }, ...ACCENTS.map(a => h('button', { onmousedown: (e) => e.preventDefault(), onclick: () => insert(inp, a) }, a)));
  const row = h('div', { class: 'qline', style: { alignItems: 'center' } });
  if (ex.pre) row.append(h('span', { class: 'pre' }, ex.pre));
  row.append(h('div', { style: { flex: 1, minWidth: '220px' } }, inp));
  if (ex.post) row.append(h('span', { class: 'pre' }, ex.post));
  const box = h('div', { class: 'typebox' }, row, acc);
  const pats = compilePatterns(ex.patterns);
  const strict = ctx.mode === 'exam' || !!ex.strict;
  return {
    el: box, inp,
    value: () => [ex.pre || '', inp.value, ex.post || ''].join(' ').trim(),
    candidates() {
      const raw = inp.value.trim(), p = ex.pre || '', q = ex.post || '';
      const c = [[p, raw, q].join(' ').trim()];
      if (p) c.push([raw, q].join(' ').trim());
      if (q) c.push([p, raw].join(' ').trim());
      if (p && q) c.push(raw);
      if (/je$/i.test(p) && /^j(e |')/i.test(raw)) c.push([p.replace(/je$/i, '').trim(), raw, q].join(' ').trim());
      return [...new Set(c)];
    },
    check() {
      const cands = this.candidates();
      inp.disabled = true;
      if (pats.length) {
        for (const v of cands) if (pats.some(p => p.re.test(normText(v)))) { inp.style.borderColor = 'var(--good)'; return { ok: true, sol: v, given: inp.value, tip: 'Super – ein ganzer, richtiger Satz!' }; }
        for (const v of cands) if (pats.some(p => p.loose.test(stripAccents(normText(v))))) {
          inp.style.borderColor = 'var(--sun)';
          return strict ? { ok: false, almost: true, score: .5, sol: ex.answers[0], given: inp.value, tip: 'Fast! Achte auf <b>Akzente und Bindestriche</b>.' } : { ok: true, almost: true, sol: v, given: inp.value, tip: 'Achte auf <b>Akzente und Bindestriche</b> (é, è, rez-de-chaussée …).' };
        }
      }
      let best = null;
      for (const v of cands) {
        const r = checkTyped(v, ex.answers, { strict });
        const rank = r.ok ? (r.almost ? 2 : 3) : (r.almost ? 1 : 0);
        if (!best || rank > best.rank || (rank === best.rank && !best.r.tip && r.tip)) best = { r, rank };
      }
      let r = best.r;
      if (!r.ok && ex.parts && strict) {
        const gtxt = ' ' + normText(cands[0]) + ' ';
        const hit = ex.parts.filter(alts => alts.some(a => gtxt.includes(' ' + normText(a) + ' '))).length;
        r = { ...r, score: Math.max(r.score || 0, Math.floor((hit / ex.parts.length) * 4) / 4) };
      }
      if (pats.length && !r.ok) r = { ...r, sol: 'z. B. ' + ex.answers[0], tip: r.tip || 'Schreib einen ganzen Satz wie im Beispiel – mit deinen eigenen Angaben.' };
      inp.style.borderColor = r.ok ? (r.almost ? 'var(--sun)' : 'var(--good)') : 'var(--bad)';
      return { ...r, given: inp.value };
    },
  };
}
function insert(inp, ch) {
  const s = inp.selectionStart ?? inp.value.length, e = inp.selectionEnd ?? inp.value.length;
  inp.value = inp.value.slice(0, s) + ch + inp.value.slice(e);
  inp.focus(); inp.setSelectionRange(s + ch.length, s + ch.length);
  inp.dispatchEvent(new Event('input'));
}
export function type(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const q = question(ex, ctx);
  const holder = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } });
  let mode = 'type', blk;
  const mount = () => {
    holder.innerHTML = '';
    blk = mode === 'type' ? typeBlock(ex, ctx, n => ctx.ready(n > 0)) : buildBlock({ ...ex, extra: ex.extra || autoExtra(ex.answers[0]) }, ctx, n => ctx.ready(n > 0));
    holder.append(blk.el);
    if (mode === 'type' && ctx.mode !== 'exam' && ex.allowChips !== false && !ex.patterns) holder.append(h('button', { class: 'hintbtn', onclick: () => { mode = 'build'; ctx.usedHelp = true; mount(); ctx.ready(false); } }, svgEl(ICON.chips), 'Wortbausteine zeigen'));
    if (mode === 'type') setTimeout(() => ctx.autofocus && blk.inp.focus({ preventScroll: true }), 350);
  };
  mount();
  const right = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } }, q, holder);
  ctx.root.append(ex.img ? h('div', { class: 'split' }, vis(ex.img), right) : right);
  return {
    check() {
      let r = blk.check();
      if (mode === 'build' && r.ok) r = { ...r, almost: true, helped: true, tip: r.tip || 'Mit Wortbausteinen gelöst – probier es nächstes Mal ohne Hilfe!' };
      if (r.ok && ex.sayAfter !== false) say(ex.answers[0], ex.voiceAfter || 'n');
      return r;
    },
  };
}
