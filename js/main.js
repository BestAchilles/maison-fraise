// Maison Fraise — app shell, home map, vocab list, settings
import { h, svgEl, $, rng } from './core/util.js';
import { store } from './core/store.js';
import { loadIndex, say, sfx } from './core/audio.js';
import { ICON, NODE, strawberryLogo } from './art/icons.js';
import { charSVG } from './art/char.js';
import { LESSONS, FLOORS, L, buildMistakes } from './content/lessons.js';
import { VOCAB, LZ_LABEL } from './content/vocab.js';
import { runLesson, resultScreen, examResult } from './screens/lesson.js';

const app = $('#app');
const EXAM_DAY = [2026, 10, 18]; // Mittwoch 18.11.2026 (Monat 0-basiert)

function go(name, params = {}) {
  const old = app.querySelector('.screen');
  if (old) { old.classList.add('out'); setTimeout(() => old.remove(), 300); }
  document.getElementById('overlay').innerHTML = '';
  const S = SCREENS[name]; S(params);
  try { if (!/play=/.test(location.hash) || name !== 'lesson') history.replaceState(null, '', '#' + name); } catch (e) {}
}
const SCREENS = {
  home: () => home(),
  lesson: ({ lesson }) => runLesson(app, lesson, { go, mode: lesson.exam ? 'exam' : 'practice' }),
  mistakes: () => {
    const lesson = { id: 'mistakes', title: 'Fehlerkiste', build: R => buildMistakes(store.s.mistakes, R) };
    runLesson(app, lesson, { go, mode: 'practice' });
  },
  result: (p) => resultScreen(app, p, { go }),
  examResult: (p) => examResult(app, p, { go }),
  vocab: () => vocabScreen(),
  settings: () => settingsScreen(),
};

// ---------------------------------------------------------------- HOME
function nextLesson() {
  const order = ['v1', 'r1', 'r2', 'v3', 'p1', 'p2', 'p3', 'p4', 'v4', 'd1', 'd2', 'd3', 's1', 's2', 's3', 's4', 'v8', 'r3', 'r4', 'r5', 'v5', 'd4', 'd5', 'd6', 's5', 'p5', 'v6', 'v2', 'v7', 's6', 'g1', 'exam', 'k1'];
  return order.find(id => !store.lesson(id).plays) || 'exam';
}
function home() {
  const s = store.s;
  const now = new Date();
  const days = Math.max(0, Math.round((new Date(...EXAM_DAY) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5));
  const wd = now.getDay(); // 0 So, 1 Mo, 2 Di
  const stats = h('div', { class: 'stats' },
    h('div', { class: 'stat flame', title: 'Tage in Folge' }, svgEl(ICON.flame), String(s.streak.n || 0)),
    h('div', { class: 'stat berry', title: 'Erdbeeren' }, svgEl(ICON.berry), String(s.berries)),
    h('div', { class: 'stat xp', title: 'XP' }, svgEl(ICON.bolt), String(s.xp)));
  const top = h('div', { class: 'topbar' }, h('div', { class: 'brand' }, svgEl(strawberryLogo()), h('div', {}, 'Maison Fraise', h('small', {}, 'Français · Unité 2'))), stats);

  // side panel
  const hour = new Date().getHours();
  const hi = hour < 11 ? 'Bonjour' : hour < 18 ? 'Salut' : 'Bonsoir';
  const hero = h('div', { class: 'card hero' }, h('div', { class: 'lou', html: charSVG('lou', { pose: 'wave', cls: 'bob' }) }),
    h('div', {}, h('h2', {}, `${hi}${s.name ? ' ' + s.name : ''}!`), h('p', {}, days > 0 ? 'Bereit fürs Training? Jede Lektion bringt dich näher zur 6!' : days === 0 ? 'Heute ist Prüfungstag – du schaffst das! 💪' : 'Die Prüfung ist vorbei – du kannst trotzdem weiterüben!')));
  const plan = [
    { d: 'So', wd: 0, t: 'Räume, Stockwerke & «Qui est où ?»', ids: ['r1', 'r2', 'p2', 'p3'] },
    { d: 'Mo', wd: 1, t: 'Möbel, Präpositionen & Vrai ou faux', ids: ['d1', 'd2', 'd3', 'p4'] },
    { d: 'Di', wd: 2, t: 'Verneinung, Spiel, Voci-Test & Prüfung', ids: ['s1', 's4', 'v8', 'exam'] },
  ];
  const countdown = h('div', { class: 'card' },
    h('div', { class: 'countdown' }, h('div', { class: 'big' }, String(days)), h('div', { class: 'lbl' }, days === 1 ? 'Tag bis zur Prüfung' : days === 0 ? 'Heute ist Prüfung!' : 'Tage bis zur Prüfung', h('br'), h('span', { class: 'small-muted' }, 'Mittwoch, 18. November'))),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' } }, ...plan.map(p => {
      const ok = p.ids.every(id => store.lesson(id).plays);
      const today = p.wd === wd;
      const next = p.ids.find(id => !store.lesson(id).plays) || p.ids[0];
      const b = h('button', { style: { display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 800, fontSize: '14px', textAlign: 'left', padding: '6px 8px', borderRadius: '12px', background: today ? 'var(--sun-l)' : 'transparent', border: today ? '2px solid #FFD976' : '2px solid transparent', color: ok ? 'var(--leaf-d)' : 'var(--ink2)' } },
        h('span', { style: { width: '26px', height: '26px', borderRadius: '8px', display: 'grid', placeItems: 'center', background: ok ? 'var(--leaf)' : today ? 'var(--sun)' : 'var(--bg2)', color: ok || today ? '#fff' : 'var(--muted)', fontSize: '12px', flex: 'none' } }, ok ? '✓' : p.d),
        h('span', {}, p.t, today ? h('span', { class: 'small-muted', style: { display: 'block' } }, ok ? 'Heute geschafft – super!' : 'Heute · tippe zum Starten') : null));
      b.onclick = () => { sfx.tap(); openLesson(L[next]); };
      return b;
    })));
  const goal = s.settings.goal, today = Math.min(goal, s.day.xp);
  const C = 2 * Math.PI * 26;
  const goalCard = h('div', { class: 'card goal' }, svgEl(`<svg class="ring" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#F1E7EF" stroke-width="9"/><circle cx="32" cy="32" r="26" fill="none" stroke="#FFC83D" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - today / goal)}" transform="rotate(-90 32 32)"/><g transform="translate(20 20) scale(1)">${ICON.bolt.replace('<svg', '<svg width="24" height="24"')}</g></svg>`),
    h('div', {}, h('div', { class: 't' }, 'Tagesziel'), h('div', { class: 's' }, `${s.day.xp} / ${goal} XP heute`)));
  const nm = store.s.mistakes.length;
  const quick = h('div', { class: 'quick' },
    qbtn(ICON.book, 'Wörterbuch', () => go('vocab')),
    qbtn(ICON.box, 'Fehlerkiste', () => nm ? go('mistakes') : toast('Noch keine Fehler gesammelt – super!'), nm),
    qbtn(ICON.grade, 'Prüfung', () => openLesson(L.exam)),
    qbtn(ICON.gear, 'Einstellungen', () => go('settings')));
  const side = h('div', { class: 'side scroll' }, hero, countdown, goalCard, quick);

  // map
  const nxt = nextLesson();
  const inner = h('div', { class: 'map-inner' });
  const houseEl = h('div', { class: 'fraise' });
  houseEl.append(h('div', { class: 'leaves', html: leavesSVG() }));
  for (const F of FLOORS) {
    const ls = LESSONS.filter(l => l.floor === F.key);
    const doneN = ls.filter(l => store.lesson(l.id).plays).length;
    const fl = h('div', { class: 'floor', style: { '--fc': F.color } },
      h('div', { class: 'floor-title' }, h('span', { class: 'tag' }, F.label), h('span', { class: 'goal-t' }, F.title), h('span', { class: 'done' }, svgEl(ICON.star), `${doneN}/${ls.length}`)),
      h('div', { class: 'small-muted', style: { marginTop: '-4px', marginBottom: '6px' } }, F.goal),
      h('div', { class: 'nodes' }, ...ls.map(l => node(l, F, l.id === nxt))));
    houseEl.append(fl);
  }
  houseEl.append(h('div', { class: 'ground' }));
  inner.append(houseEl);
  const map = h('div', { class: 'map scroll' }, inner);
  const body = h('div', { class: 'home-body' }, side, h('div', { class: 'mapwrap' }, map));
  const scr = h('div', { class: 'screen home' }, top, body);
  app.append(scr);
  // scroll recommended lesson into view
  setTimeout(() => { const n = scr.querySelector('.node.next'); if (n && innerWidth > 980) n.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 350);
  if (!s.name && !store.s._asked) setTimeout(() => { if (document.querySelector('.screen.home') && !document.querySelector('.modal-bg') && !/play=/.test(location.hash)) askName(); }, 900);
}
function qbtn(icon, label, fn, badge) { return h('button', { class: 'qbtn', onclick: () => { sfx.tap(); fn(); } }, svgEl(icon), h('span', {}, label, badge ? h('span', { class: 'badge' }, String(badge)) : null)); }
function node(l, F, isNext) {
  const st = store.lesson(l.id);
  const stars = h('div', { class: 'stars' }, ...[0, 1, 2].map(i => svgEl(i < st.stars ? ICON.star : ICON.starOff)));
  const disc = h('div', { class: 'disc', style: { '--nc': F.color, '--ncd': F.dark, color: F.color }, html: NODE[l.icon] || NODE.words });
  const n = h('button', { class: 'node' + (l.test ? ' test' : '') + (isNext ? ' next' : '') + (st.stars === 3 ? ' done' : ''), style: { '--nc': F.color } }, disc, h('div', { class: 'name' }, l.title), h('div', { class: 'sub' }, l.sub), st.plays ? stars : null);
  n.onclick = () => { sfx.tap(); openLesson(l); };
  return n;
}
function openLesson(l) {
  const F = FLOORS.find(f => f.key === l.floor);
  const st = store.lesson(l.id);
  const bg = h('div', { class: 'modal-bg', onclick: (e) => { if (e.target === bg) bg.remove(); } });
  const m = h('div', { class: 'modal' },
    h('div', { style: { display: 'flex', gap: '16px', alignItems: 'center' } },
      h('div', { class: 'node', style: { width: 'auto' } }, h('div', { class: 'disc', style: { '--nc': F.color, '--ncd': F.dark, color: F.color }, html: NODE[l.icon] })),
      h('div', {}, h('div', { class: 'small-muted', style: { textTransform: 'uppercase', letterSpacing: '1.2px' } }, F.label + ' · ' + F.title), h('h2', {}, l.title), h('div', { class: 'note' }, l.sub))),
    h('div', { class: 'goal-box' }, '🎯 ' + F.goal + (l.test ? ' · ⭐ kommt im Test (im Heft markiert)' : '')),
    l.exam ? h('p', { class: 'note' }, 'Ca. 25 Aufgaben aus allen Lernzielen – wie eine echte Prüfung. Die Note siehst du am Schluss.') : null,
    st.plays ? h('p', { class: 'small-muted' }, `Bisher: ${Math.round(st.best * 100)}% · ${st.plays}× gespielt`) : null,
    h('div', { class: 'row' }, h('button', { class: 'btn ghost', onclick: () => bg.remove() }, 'Zurück'), h('button', { class: 'btn ' + (l.exam ? 'grape' : ''), onclick: () => { bg.remove(); go('lesson', { lesson: l }); } }, svgEl(ICON.play), l.exam ? 'Prüfung starten' : 'Los geht\'s!')));
  bg.append(m); document.getElementById('overlay').append(bg);
}
function askName() {
  const inp = h('input', { type: 'text', placeholder: 'Dein Name', enterkeyhint: 'done', style: { width: '100%', padding: '14px 16px', borderRadius: '16px', border: '2.5px solid var(--line2)', fontSize: '22px', fontWeight: 800 } });
  const bg = h('div', { class: 'modal-bg' });
  const done = () => { store.s.name = inp.value.trim().slice(0, 20); store.s._asked = true; store.save(); bg.remove(); go('home'); say('Bonjour !', 'k'); };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); done(); } });
  const m = h('div', { class: 'modal', style: { textAlign: 'center' } }, h('div', { style: { width: '150px', margin: '0 auto' }, html: charSVG('lou', { pose: 'wave', cls: 'bob' }) }),
    h('h2', {}, 'Salut! Je m\'appelle Lou.'), h('p', { class: 'note' }, 'Ich helfe dir, dich auf die Unité-2-Prüfung vorzubereiten. Wie heisst du?'), inp,
    h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn', onclick: done }, 'C\'est parti!')));
  bg.append(m); document.getElementById('overlay').append(bg);
  setTimeout(() => inp.focus(), 300);
}
function toast(t) {
  const e = h('div', { style: { position: 'fixed', left: '50%', bottom: '30px', transform: 'translateX(-50%)', background: 'var(--ink)', color: '#fff', padding: '12px 20px', borderRadius: '16px', fontWeight: 800, zIndex: 95, boxShadow: 'var(--shadow-lg)' } }, t);
  document.body.append(e); setTimeout(() => e.remove(), 2400);
}
function leavesSVG() {
  return `<svg viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true"><path d="M200 8 C 214 30, 214 52, 204 70" stroke="#1E9757" stroke-width="10" fill="none" stroke-linecap="round"/>
  <g fill="#2FBF71"><path d="M200 112 C 120 120, 40 104, 6 80 C 60 70, 120 74, 196 96Z"/><path d="M200 112 C 280 120, 360 104, 394 80 C 340 70, 280 74, 204 96Z"/>
  <path d="M200 110 C 150 80, 120 50, 110 20 C 150 34, 186 66, 204 100Z"/><path d="M200 110 C 250 80, 280 50, 290 20 C 250 34, 214 66, 196 100Z"/></g>
  <g fill="#43CF84"><path d="M200 112 C 150 100, 90 96, 50 84 C 100 84, 150 90, 200 104Z"/><path d="M200 112 C 250 100, 310 96, 350 84 C 300 84, 250 90, 200 104Z"/></g></svg>`;
}

// ---------------------------------------------------------------- VOCAB
function vocabScreen() {
  const groups = ['1', '1+', '2', '2+', '3', '3+', 'X', 'S'];
  let cur = groups[0];
  const list = h('div', { class: 'vlist' });
  const tabs = h('div', { class: 'tabs' }, ...groups.map(g => { const b = h('button', { class: 'tab' + (g === cur ? ' on' : '') }, LZ_LABEL[g]); b.onclick = () => { cur = g; tabs.querySelectorAll('.tab').forEach(x => x.classList.remove('on')); b.classList.add('on'); fill(); }; return b; }));
  const fill = () => {
    list.innerHTML = '';
    for (const v of VOCAB.filter(v => String(v.lz) === String(cur))) {
      const artCls = /^(la |une )/.test(v.fr) ? 'art-f' : /^(le |un )/.test(v.fr) ? 'art-m' : /^les /.test(v.fr) ? 'art-pl' : '';
      const row = h('button', { class: 'vrow', onclick: () => say(v.fr, 'w') }, svgEl(v.pic()), h('div', { style: { flex: 1, textAlign: 'left' } }, h('div', { class: 'fr ' + artCls }, v.fr), h('div', { class: 'de' }, v.de + (v.note ? ' · ' + v.note : ''))), h('span', { class: 'say', html: ICON.speaker }));
      list.append(row);
    }
  };
  fill();
  const scr = h('div', { class: 'screen' }, h('div', { class: 'phead' }, h('button', { class: 'iconbtn', html: ICON.back, onclick: () => go('home') }), h('h1', {}, 'Wörterbuch'), h('span', { class: 'small-muted', style: { marginLeft: 'auto' } }, 'Tippe auf ein Wort zum Anhören')),
    h('div', { class: 'pbody scroll' }, h('div', { class: 'pbody-in' }, tabs, list)));
  app.append(scr);
}

// ---------------------------------------------------------------- SETTINGS
function settingsScreen() {
  const s = store.s;
  const row = (label, el) => h('div', { class: 'card', style: { display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'space-between' } }, h('div', { style: { fontWeight: 800 } }, label), el);
  const toggle = (key) => { const b = h('button', { class: 'btn small ' + (s.settings[key] ? '' : 'ghost') }, s.settings[key] ? 'An' : 'Aus'); b.onclick = () => { s.settings[key] = !s.settings[key]; store.save(); go('settings'); }; return b; };
  const name = h('input', { type: 'text', value: s.name || '', placeholder: 'Name', style: { padding: '10px 14px', borderRadius: '14px', border: '2.5px solid var(--line2)', fontSize: '18px', fontWeight: 800, width: '200px' } });
  name.onchange = () => { s.name = name.value.trim().slice(0, 20); store.save(); };
  const scr = h('div', { class: 'screen' }, h('div', { class: 'phead' }, h('button', { class: 'iconbtn', html: ICON.back, onclick: () => go('home') }), h('h1', {}, 'Einstellungen')),
    h('div', { class: 'pbody scroll' }, h('div', { class: 'pbody-in', style: { maxWidth: '640px' } },
      row('Dein Name', name),
      row('Soundeffekte', toggle('sound')),
      row('Französisch immer langsam abspielen 🐢', toggle('slow')),
      row('Tagesziel', h('div', { style: { display: 'flex', gap: '6px' } }, ...[30, 60, 100].map(g => h('button', { class: 'btn small ' + (s.settings.goal === g ? 'sun' : 'ghost'), onclick: () => { s.settings.goal = g; store.save(); go('settings'); } }, `${g} XP`)))),
      row('Prüfungs-Simulationen', h('div', { class: 'note' }, s.exams.length ? s.exams.slice(-5).map(e => e.grade.toFixed(1)).join(' · ') : 'noch keine')),
      row('Fortschritt löschen', h('button', { class: 'btn small bad', onclick: () => { if (confirm('Wirklich alles zurücksetzen?')) { store.reset(); go('home'); } } }, 'Zurücksetzen')),
      h('p', { class: 'small-muted' }, 'Aufgaben nach dem Lehrmittel «Dis donc! 6», Unité 2. Figuren, Bilder und Texte sind eigene Gestaltungen für diese Lern-App.'))));
  app.append(scr);
}

// ---------------------------------------------------------------- boot
(async function boot() {
  await loadIndex();
  const m = location.hash.match(/play=([\w]+)(?:&i=(\d+))?/);
  if (m && L[m[1]]) {
    const lesson = L[m[1]], skip = +(m[2] || 0);
    go('lesson', { lesson: skip ? { ...lesson, build: R => lesson.build(R).slice(skip) } : lesson });
  } else go('home');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
