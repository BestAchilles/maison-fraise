// 3D "Qui habite où?" – Logical
import { h } from '../core/util.js';
import { sfx } from '../core/audio.js';

// ex.clues: [..], ex.fields: { nom:[..], pieces:[..], animal:[..] }, ex.solution: [{nom,pieces,animal}] top -> bottom, ex.terrace: index
export function logical(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const n = ex.solution.length;
  const val = Array.from({ length: n }, () => ({}));
  const fieldLabel = { nom: 'Nom', pieces: 'Pièces', animal: 'Animal' };
  let active = null;
  const bar = h('div', { class: 'bank logic-bar', style: { justifyContent: 'flex-start', minHeight: '60px' } }, h('span', { class: 'small-muted' }, 'Tippe auf ein Feld im Haus (Nom, Pièces, Animal) …'));
  const btns = [];
  const house = h('div', { style: { position: 'relative', background: 'linear-gradient(#CDEBFF,#EEF8FF)', borderRadius: '22px', padding: '70px 18px 18px', boxShadow: 'var(--shadow)' } });
  house.append(h('div', { style: { position: 'absolute', left: '8%', right: ex.terrace != null ? '30%' : '8%', top: '10px', height: '60px', background: '#E65A4F', clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' } }));
  for (let f = 0; f < n; f++) {
    const fl = h('div', { style: { display: 'flex', alignItems: 'stretch', gap: 0 } });
    const apt = h('div', { class: 'apt', style: { flex: '0 0 68%', background: '#fff', border: '6px solid #6E5A7E', borderTop: f ? '0' : '6px solid #6E5A7E', padding: '10px 12px' } });
    for (const k of Object.keys(ex.fields)) {
      const b = h('button', { class: 'sel-chip' }, '…');
      b.addEventListener('click', () => { if (ctx.locked) return; active = { f, k, b }; btns.forEach(x => x.style.outline = ''); b.style.outline = '4px solid rgba(139,92,246,.35)'; showOpts(k); sfx.tap(); });
      btns.push(b); b.dataset.f = f; b.dataset.k = k;
      apt.append(h('span', {}, fieldLabel[k] + ':'), b);
    }
    fl.append(apt);
    if (ex.terrace === f) fl.append(h('div', { style: { flex: 1, alignSelf: 'flex-end', height: '42px', borderBottom: '6px solid #6E5A7E', borderRight: '6px solid #6E5A7E', background: 'repeating-linear-gradient(90deg,#fff 0 10px,#6E5A7E 10px 13px)', borderRadius: '0 0 6px 0' } }));
    house.append(fl);
  }
  house.append(h('div', { style: { height: '14px', background: '#5FC77A', margin: '0 -18px -18px', borderRadius: '0 0 22px 22px' } }));
  const showOpts = (k) => {
    bar.innerHTML = '';
    for (const o of ex.fields[k]) bar.append(h('button', { class: 'chip', onclick: () => {
      if (!active || ctx.locked) return; val[active.f][active.k] = o; active.b.textContent = o; active.b.classList.add('filled'); sfx.pick();
      ctx.ready(val.every(v => Object.keys(ex.fields).every(kk => v[kk])));
    } }, o));
  };
  const clues = h('ol', { class: 'clues' }, ...ex.clues.map((c, i) => { const li = h('li', {}, h('span', { class: 'n' }, String(i + 1)), h('span', {}, c)); li.onclick = () => { li.classList.toggle('done'); sfx.tap(); }; return li; }));
  ctx.root.append(h('div', { class: 'split' }, h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, h('div', { class: 'small-muted' }, 'Tipp: Tippe auf einen Hinweis, wenn du ihn benutzt hast.'), clues),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, bar, house)));
  return {
    check() {
      ctx.locked = true; let right = 0, total = 0;
      for (const b of btns) {
        const f = +b.dataset.f, k = b.dataset.k; total++;
        const ok = val[f][k] === ex.solution[f][k];
        if (ok) right++; b.classList.remove('filled'); b.classList.add(ok ? 'good' : 'bad');
        if (!ok) b.textContent = `${val[f][k] || '–'} → ${ex.solution[f][k]}`;
      }
      return { ok: right === total, score: right / total, sol: right === total ? '' : `${right} von ${total} Feldern richtig`, tip: right === total ? '' : ex.explain || '' };
    },
  };
}
