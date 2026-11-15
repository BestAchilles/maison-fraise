// Lesson player (practice + exam mode) and result screens
import { h, svgEl, rng, sleep } from '../core/util.js';
import { say, sfx, stop, onPlaying, preload } from '../core/audio.js';
import { store } from '../core/store.js';
import { confetti, burst } from '../core/fx.js';
import { ICON } from '../art/icons.js';
import { charSVG } from '../art/char.js';
import * as B from '../ex/basic.js';
import * as T from '../ex/text.js';
import * as SC from '../ex/scene.js';
import { logical } from '../ex/logic.js';
import { game } from '../ex/game.js';
import { prepare } from '../content/lessons.js';

const R_ = { info: B.info, flash: B.flash, choice: B.choice, multi: B.multi, match: B.match, build: B.build, type: B.type,
  cloze: T.cloze, slots: T.slots, mark: T.mark, sceneTap: SC.sceneTap, vraiFaux: SC.vraiFaux, labelFloors: SC.labelFloors, differences: SC.differences, logical, game };
const PRAISE = ['Super!', 'Génial!', 'Bravo!', 'Parfait!', 'Chouette!', 'Excellent!', 'Très bien!', 'Wow!'];
const touch = matchMedia('(pointer: coarse)').matches;

function audioLines(ex) {
  const L = [];
  if (ex.audio) L.push(ex.audio);
  if (ex.qSay) L.push({ text: ex.qSay.text || ex.q, voice: ex.qSay.voice || 'n' });
  if (ex.v) L.push({ text: ex.v.fr, voice: 'w' });
  (ex.options || []).forEach(o => o.say && L.push({ text: o.say, voice: o.voice || 'n' }));
  return L;
}

function shuffleOpts(ex, R) {
  if (!ex.options || ex.keepOrder || !(ex.type === 'choice' || ex.type === 'multi')) return ex;
  const order = R.shuffle(ex.options.map((_, i) => i));
  const options = order.map(i => ex.options[i]);
  const answer = Array.isArray(ex.answer) ? ex.answer.map(a => order.indexOf(a)) : order.indexOf(ex.answer);
  return { ...ex, options, answer };
}

export function runLesson(app, lesson, { go, exercises, mode = 'practice' }) {
  const seed = (Date.now() % 1e9) + Math.floor(Math.random() * 1000);
  const R = rng(seed), R2 = rng(seed + 7);
  const list = prepare(exercises || lesson.build(R));
  const queue = list.map((e, i) => ({ ...e, _i: i, _src: e._src !== undefined ? e._src : { lesson: lesson.id, seed } }));
  const total = queue.length;
  preload(queue.flatMap(audioLines));
  let idx = 0, combo = 0, bestCombo = 0, xp = 0, graded = 0, firstOk = 0, done = 0, retries = 0;
  const results = []; const t0 = Date.now();
  const goalBefore = store.s.day.xp;
  let handle = null, state = 'idle', cur = null, unsub = null, lockUntil = 0, plays = 0;

  // ---------- layout ----------
  const close = h('button', { class: 'iconbtn', 'aria-label': 'Beenden', html: ICON.close });
  const bar = h('i'); const pbar = h('div', { class: 'pbar' }, bar);
  const comboEl = h('div', { class: 'combo' });
  const timerEl = h('div', { class: 'combo', style: { color: 'var(--grape-d)' } });
  const stage = h('div', { class: 'stage' });
  const fbTitle = h('h3'), fbSol = h('div', { class: 'sol' }), fbTip = h('div', { class: 'tip' }), fbBadge = h('div', { class: 'badge' });
  const fb = h('div', { class: 'fb' }, fbBadge, h('div', { style: { minWidth: 0 } }, fbTitle, fbSol, fbTip));
  const skip = h('button', { class: 'skip' }, mode === 'exam' ? 'Weiss ich nicht' : 'Überspringen');
  const btn = h('button', { class: 'btn', disabled: true }, 'Prüfen');
  const footer = h('div', { class: 'footer' }, h('div', { class: 'row' }, skip, fb, btn));
  const scr = h('div', { class: 'screen lesson' }, h('div', { class: 'lbar' }, close, pbar, mode === 'exam' ? timerEl : comboEl), stage, footer);
  app.append(scr);
  let tick = null;
  if (mode === 'exam') tick = setInterval(() => { if (!document.body.contains(scr)) return clearInterval(tick); const s2 = Math.floor((Date.now() - t0) / 1000); timerEl.textContent = `⏱ ${Math.floor(s2 / 60)}:${String(s2 % 60).padStart(2, '0')}`; }, 1000);

  // Android back button / iOS swipe: ask before leaving the lesson
  try { history.pushState({ lesson: 1 }, ''); } catch (e) {}
  const onPop = () => { if (!document.body.contains(scr)) return window.removeEventListener('popstate', onPop); try { history.pushState({ lesson: 1 }, ''); } catch (e) {} confirmQuit(quit); };
  window.addEventListener('popstate', onPop);
  const quit = () => { stop(); unsub && unsub(); clearInterval(tick); window.removeEventListener('popstate', onPop); go('home'); };
  close.onclick = () => confirmQuit(quit);
  skip.onclick = () => {
    if (state !== 'check' || !handle || Date.now() < lockUntil) return;
    lockUntil = Date.now() + 450;
    let r = {}; try { r = handle.check() || {}; } catch (e) { console.error(e); }
    if (mode === 'exam') { results.push({ ex: cur, r: { ...r, ok: false, score: 0, given: 'Weiss ich nicht' } }); next(); return; }
    feedback({ ...r, ok: false, almost: false, sol: r.sol || solutionOf(cur), tip: 'Übersprungen – schau dir die Lösung gut an.' });
  };
  btn.onclick = () => { if (Date.now() < lockUntil) return; lockUntil = Date.now() + 450; submit(); };

  const updBar = () => { bar.style.width = Math.min(100, (done / (total + retries)) * 100) + '%'; };
  const updCombo = () => { comboEl.innerHTML = ''; if (combo >= 3) { comboEl.append(svgEl(ICON.flame), `${combo}`); comboEl.classList.remove('pop'); void comboEl.offsetWidth; comboEl.classList.add('pop'); } };

  const ctx = {
    mode, rng: R, autofocus: !touch,
    head(ex) {
      const row = h('div', { class: 'prompt' }, h('div', { style: { flex: 1 } }, h('div', { class: 'kicker' }, ex.section && mode === 'exam' ? ex.section : (ex.kicker || '')), h('h2', {}, ex.prompt || '')));
      if (ex.heft) row.append(h('div', { class: 'heft', title: 'Dis donc! Heft' }, '📒 ' + ex.heft));
      return row;
    },
    ready(on, label, opts = {}) {
      btn.disabled = !on; if (label) btn.textContent = label;
      if (opts.hideCheck) { btn.style.visibility = 'hidden'; skip.style.visibility = 'hidden'; footer.style.display = 'none'; }
    },
    submit() { if (!btn.disabled && Date.now() >= lockUntil) { lockUntil = Date.now() + 450; submit(); } },
    finish(r) { feedback(r); },
    playBtn(line, { auto = false, slow = false } = {}) {
      const exam = mode === 'exam';
      const p = h('button', { class: 'play', 'aria-label': 'Abspielen', html: ICON.speaker });
      const left = exam ? h('div', { class: 'small-muted' }, 'max. 2× abspielen') : null;
      const playIt = () => {
        if (exam) {
          if (plays >= 2) return;
          plays++; left.textContent = plays >= 2 ? 'Gehört (2×)' : 'noch 1× abspielen';
          if (plays >= 2) { p.disabled = true; p.style.opacity = .45; }
        }
        say(line.text, line.voice || 'n');
      };
      p.onclick = playIt;
      const wrap = h('div', { style: { display: 'flex', gap: '10px', alignItems: 'flex-end' } }, p);
      if (slow && !exam) { const s = h('button', { class: 'play slow', 'aria-label': 'Langsam abspielen', html: ICON.turtle }); s.onclick = () => say(line.text, line.voice || 'n', { slow: true }); wrap.append(s); }
      if (left) wrap.append(left);
      if (auto) setTimeout(() => { if (document.body.contains(p)) playIt(); }, 450);
      return wrap;
    },
    char(who, mood) { return charSVG(who, { mood }); },
    award(n) { xp += n; store.addXP(n); },
    logMistake(m) { if (mode !== 'exam') store.addMistake({ id: m.id, lesson: 'inline', inline: true, ex: m.ex }); },
  };
  unsub = onPlaying(on => { scr.querySelectorAll('.play:not(.slow)').forEach(b => b.classList.toggle('playing', on)); });

  function next() { done++; idx++; stop(); show(); }
  function show() {
    if (idx >= queue.length) return finishLesson();
    cur = shuffleOpts(queue[idx], R2); plays = 0;
    stage.querySelectorAll('.ex').forEach(o => {
      if (mode === 'exam') o.remove();
      else if (!o.classList.contains('out')) { o.classList.add('out'); setTimeout(() => o.remove(), 260); }
    });
    const exEl = h('div', { class: 'ex' }); const inner = h('div', { class: 'ex-inner' }); exEl.append(inner); stage.append(exEl);
    footer.className = 'footer'; footer.style.display = ''; btn.className = 'btn'; btn.textContent = mode === 'exam' ? 'Weiter' : 'Prüfen'; btn.disabled = true; btn.style.visibility = '';
    skip.style.visibility = cur.type === 'info' || cur.type === 'flash' ? 'hidden' : '';
    state = 'check'; ctx.root = inner; ctx.locked = false; ctx.usedHelp = false;
    const fn = R_[cur.type];
    try { handle = fn(cur, ctx); } catch (e) { console.error(e); inner.append(h('div', { class: 'note' }, 'Ups – diese Aufgabe konnte nicht geladen werden.')); handle = { check: () => ({ ok: true, neutral: true }) }; ctx.ready(true, 'Weiter'); }
    updBar();
  }

  function submit() {
    if (state === 'check') {
      let r;
      try { r = handle.check(); } catch (e) { console.error(e); r = { ok: false, sol: solutionOf(cur), tip: '' }; }
      if (r.neutral) { next(); return; }
      if (mode === 'exam') { results.push({ ex: cur, r }); sfx.tap(); next(); return; }
      feedback(r);
    } else if (state === 'cont') { idx++; stop(); show(); }
  }

  function feedback(r) {
    if (state !== 'check') return;
    state = 'cont'; ctx.locked = true;
    if (ctx.root) ctx.root.classList.add('locked');
    footer.style.display = '';
    const first = !cur.retry;
    if (first) { graded++; firstOk += r.ok ? (r.helped ? .5 : r.almost ? .9 : 1) : Math.max(0, Math.min(.8, r.score || 0)); }
    results.push({ ex: cur, r });
    if (r.ok) {
      combo++; bestCombo = Math.max(bestCombo, combo); done++;
      const gain = (cur.retry || r.helped ? 5 : r.almost ? 8 : 10) + (combo >= 3 ? Math.min(10, (combo - 2) * 2) : 0);
      ctx.award(gain); combo >= 3 && combo % 5 === 0 ? sfx.combo(combo) : (r.almost ? sfx.almost() : sfx.correct());
      if (cur.mistakeId && !r.helped) store.clearMistake(cur.mistakeId);
      const bb = btn.getBoundingClientRect(); burst(bb.left + bb.width / 2, bb.top, 14);
    } else {
      combo = 0; sfx.wrong(); done++;
      if (cur.type !== 'game' && cur.type !== 'info' && cur.type !== 'flash') {
        if (cur.mistakeId) store.addMistake({ id: cur.mistakeId });
        else if (cur._src) store.addMistake({ id: `${cur._src.lesson}:${cur._src.seed}:${cur.id}`, lesson: cur._src.lesson, seed: cur._src.seed, exId: cur.id });
      }
      if (!cur.retry && mode === 'practice' && !['game', 'differences', 'logical', 'match'].includes(cur.type)) { queue.push({ ...cur, retry: true }); retries++; }
    }
    updCombo(); updBar();
    footer.className = 'footer ' + (r.ok ? (r.almost ? 'almost' : 'good') : 'bad');
    fbBadge.innerHTML = charSVG('lou', { mood: r.ok ? 'joy' : 'sad' });
    fbBadge.firstChild.classList.add(r.ok ? 'cheer' : 'droop');
    fbTitle.textContent = r.ok ? (r.almost ? 'Fast perfekt!' : PRAISE[Math.floor(Math.random() * PRAISE.length)]) : 'Nicht ganz …';
    fbSol.innerHTML = r.note ? `<span>${r.note}</span>` : r.sol ? (r.ok ? '' : 'Lösung: ') + `<span>${r.sol}</span>` : '';
    fbTip.innerHTML = r.tip ? '💡 ' + r.tip : '';
    btn.disabled = false; btn.style.visibility = ''; btn.textContent = 'Weiter'; btn.className = 'btn ' + (r.ok ? (r.almost ? 'sun' : '') : 'bad');
    skip.style.visibility = 'hidden';
  }

  function finishLesson() {
    stop(); unsub && unsub(); clearInterval(tick); window.removeEventListener('popstate', onPop);
    if (mode === 'exam') return go('examResult', { lesson, results, seed, secs: Math.round((Date.now() - t0) / 1000) });
    const acc = graded ? firstOk / graded : 1;
    const stars = acc >= .9 ? 3 : acc >= .7 ? 2 : acc >= .4 ? 1 : 0;
    store.finishLesson(lesson.id, acc, stars);
    store.s.berries += stars; store.save();
    const goal = store.s.settings.goal, goalHit = goalBefore < goal && store.s.day.xp >= goal;
    go('result', { lesson, acc, stars, xp, bestCombo, secs: Math.round((Date.now() - t0) / 1000), results, goalHit });
  }
  show();
}
function solutionOf(ex) {
  if (ex.answers) return ex.answers[0];
  if (ex.options && ex.answer != null && ex.answer >= 0 && !Array.isArray(ex.answer)) return ex.options[ex.answer].t || ex.solText || '';
  if (ex.fix && ex.realSentence) return ex.realSentence;
  return ex.sol || ex.solText || '';
}

function confirmQuit(yes) {
  const bg = h('div', { class: 'modal-bg' });
  const m = h('div', { class: 'modal', style: { textAlign: 'center' } }, h('div', { style: { width: '130px', margin: '0 auto' }, html: charSVG('lou', { mood: 'sad' }) }),
    h('h2', {}, 'Wirklich aufhören?'), h('p', { class: 'note' }, 'Deine XP bleiben, aber die Lektion zählt noch nicht als geschafft.'),
    h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn ghost', onclick: () => bg.remove() }, 'Weiterlernen'), h('button', { class: 'btn bad', onclick: () => { bg.remove(); yes(); } }, 'Aufhören')));
  bg.append(m); document.getElementById('overlay').append(bg);
}

// ---------------------------------------------------------------- RESULT
export function resultScreen(app, { lesson, acc, stars, xp, bestCombo, secs, goalHit }, { go }) {
  const st = h('div', { class: 'bigstars' });
  for (let i = 0; i < 3; i++) { const s = svgEl(i < stars ? ICON.star : ICON.starOff); s.classList.add('s'); s.style.animationDelay = (.35 + i * .28) + 's'; st.append(s); }
  const msg = stars === 3 ? 'Parfait! Du bist bereit!' : stars === 2 ? 'Très bien! Fast perfekt.' : stars === 1 ? 'Gut gemacht! Übe nochmals – du schaffst das!' : 'Das war schwierig. Spiel die Lektion gleich nochmals – beim zweiten Mal geht es leichter!';
  const mm = Math.floor(secs / 60), ss = String(secs % 60).padStart(2, '0');
  const scr = h('div', { class: 'screen result' }, h('div', { class: 'result-inner scroll' },
    h('div', { style: { width: '170px' }, html: charSVG('lou', { mood: stars ? 'joy' : 'happy', pose: stars ? 'cheer' : 'wave', cls: 'bob' }) }),
    h('h1', {}, stars === 3 ? 'Lektion gemeistert!' : stars ? 'Lektion geschafft!' : 'Weiter üben!'),
    st, h('div', { class: 'note', style: { fontSize: '19px' } }, msg),
    goalHit ? h('div', { class: 'rule', style: { textAlign: 'center' } }, h('h3', { style: { justifyContent: 'center' } }, '🎯 Tagesziel erreicht!'), h('p', {}, 'Super – für heute hast du dein Ziel geschafft.')) : null,
    h('div', { class: 'tiles' },
      tile('XP', [svgEl(ICON.bolt), `+${xp}`], 'var(--sun)'),
      tile('Genauigkeit', [`${Math.round(acc * 100)}%`], 'var(--leaf)'),
      tile('Zeit', [`${mm}:${ss}`], 'var(--sky)'),
      tile('Erdbeeren', [svgEl(ICON.berry), `+${stars}`], 'var(--straw)'),
      bestCombo >= 3 ? tile('Beste Serie', [svgEl(ICON.flame), `${bestCombo}`], 'var(--orange)') : null),
    h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '6px' } },
      h('button', { class: 'btn ghost', onclick: () => go('lesson', { lesson }) }, svgEl(ICON.refresh), 'Nochmal'),
      h('button', { class: 'btn', onclick: () => go('home') }, 'Weiter'))));
  app.append(scr);
  setTimeout(() => { if (stars || goalHit) confetti(stars === 3 || goalHit ? 220 : 120); sfx.complete(); }, 250);
  for (let i = 0; i < stars; i++) setTimeout(() => sfx.star(i), 650 + i * 280);
}
function tile(t, v, c) { const e = h('div', { class: 'tile', style: { '--tc': c } }, h('div', { class: 't' }, t), h('div', { class: 'v' }, ...v)); return e; }

// ---------------------------------------------------------------- EXAM RESULT
export function examResult(app, { lesson, results, seed, secs: time }, { go }) {
  const secs = {}; let pts = 0, max = 0;
  for (const { ex, r } of results) {
    if (!ex.pts) continue;
    const s = r.score != null ? r.score : (r.ok ? 1 : 0);
    const p = Math.round(ex.pts * s * 2) / 2;
    pts += p; max += ex.pts;
    const k = ex.section; secs[k] = secs[k] || { p: 0, m: 0, wrong: [] }; secs[k].p += p; secs[k].m += ex.pts;
    if (s < 1) {
      secs[k].wrong.push({ ex, r, p });
      if (seed != null) store.addMistake({ id: `exam:${seed}:${ex.id}`, lesson: lesson.id, seed, exId: ex.id });
    }
  }
  const raw = 1 + 5 * (pts / Math.max(1, max));
  const grade = Math.max(1, Math.min(6, Math.round(raw * 2) / 2));
  store.s.exams.push({ d: new Date().toISOString(), pts, max, grade });
  store.finishLesson(lesson.id, pts / Math.max(1, max), grade >= 5.5 ? 3 : grade >= 4.5 ? 2 : 1);
  store.addXP(Math.round(pts * 2)); store.save();
  const mood = grade >= 5 ? 'joy' : grade >= 4 ? 'happy' : 'sad';
  const msg = grade >= 5.5 ? 'Hervorragend! Du bist super vorbereitet!' : grade >= 5 ? 'Sehr gut! Schau dir die Fehler unten an.' : grade >= 4 ? 'Genügend – mit etwas Übung wird es eine 5!' : 'Übe die roten Teile nochmals, dann klappt es!';
  const show = (r, ex) => {
    if (r.gapReport) return r.gapReport;
    return r.sol || (ex.answers && ex.answers[0]) || ex.realSentence || '';
  };
  const rows = Object.entries(secs).map(([k, v]) => {
    const pct = v.p / v.m;
    return h('div', { class: 'card', style: { padding: '12px 16px' } },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', fontWeight: 900 } }, h('span', {}, k), h('span', {}, `${v.p} / ${v.m} P.`)),
      h('div', { class: 'pbar', style: { height: '12px', marginTop: '8px' } }, h('i', { style: { width: pct * 100 + '%', background: pct >= .8 ? 'var(--leaf)' : pct >= .6 ? 'var(--sun)' : 'var(--bad)' } })),
      v.wrong.length ? h('details', { style: { marginTop: '8px' } }, h('summary', { style: { fontWeight: 800, color: 'var(--grape-d)', cursor: 'pointer' } }, `${v.wrong.length} Fehler ansehen`),
        ...v.wrong.map(({ ex, r, p }) => h('div', { style: { padding: '8px 0', borderTop: '1px solid var(--line)', fontWeight: 700 } },
          h('div', { class: 'small-muted' }, (ex.q || ex.objLabel || ex.prompt || '') + `  ·  ${p} / ${ex.pts} P.`),
          ex.audio ? h('button', { class: 'say', style: { margin: '4px 0' }, html: ICON.speaker, onclick: () => say(ex.audio.text, ex.audio.voice || 'n') }) : null,
          r.given ? h('div', { style: { color: 'var(--bad-d)' } }, '✗ ', r.given) : null,
          h('div', { style: { color: 'var(--leaf-d)' }, html: '✓ ' + show(r, ex) }), r.tip ? h('div', { class: 'small-muted', html: '💡 ' + r.tip.replace(/grün eingekreist ist der richtige Ort\.?|Die richtigen Wörter stehen jetzt grün unter den Lücken\.?/g, '') }) : null))) : null);
  });
  const mm = Math.floor((time || 0) / 60), ss = String((time || 0) % 60).padStart(2, '0');
  const scr = h('div', { class: 'screen result' }, h('div', { class: 'scroll', style: { flex: 1 } }, h('div', { class: 'result-inner' },
    h('div', { style: { width: '150px' }, html: charSVG('owl', { mood, pose: grade >= 5 ? 'cheer' : 'stand' }) }),
    h('div', { class: 'small-muted', style: { textTransform: 'uppercase', letterSpacing: '1.4px' } }, 'Prüfungs-Simulation'),
    h('h1', {}, `Note ${grade.toFixed(1)}`),
    h('div', { class: 'note', style: { fontSize: '19px' } }, `${pts} von ${max} Punkten · ${mm}:${ss} Min. · ${msg}`),
    h('div', { class: 'small-muted' }, 'Alle Fehler liegen jetzt in der Fehlerkiste auf der Startseite.'),
    h('div', { style: { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' } }, ...rows),
    h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' } },
      h('button', { class: 'btn ghost', onclick: () => go('lesson', { lesson }) }, svgEl(ICON.refresh), 'Neue Prüfung'),
      h('button', { class: 'btn', onclick: () => go('home') }, 'Zur Karte')))));
  app.append(scr);
  setTimeout(() => { if (grade >= 4.5) confetti(grade >= 5.5 ? 240 : 120); sfx.complete(); }, 300);
}
