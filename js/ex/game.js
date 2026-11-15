// "Où est Lou ?" – Spielplan (Heft: Faites vos jeux! "Où est Dico?"), 4 in einer Reihe gegen Madame Chouette
import { h, svgEl, sleep, normText } from '../core/util.js';
import { say, sfx } from '../core/audio.js';
import { FURNITURE } from '../art/room.js';
import { roomIcon, miniHouse } from '../art/house.js';
import { placeChar, charSVG } from '../art/char.js';
import { ICON } from '../art/icons.js';
import { buildBlock, tokenize } from './basic.js';

// place -> drawing spec (room coordinates); ch = [x, y(feet), height]
const P = {
  'sur le lit': { f: ['lit'], ch: [420, 402, 130] },
  'sous la table': { f: ['table'], ch: [632, 482, 80] },
  'sur la table': { f: ['table'], ch: [632, 384, 120] },
  'sur la chaise': { f: ['chaise'], ch: [756, 410, 115] },
  'derrière le rideau': { f: ['fenetre', 'rideau'], ch: [528, 366, 150], behind: true },
  'devant la porte': { f: ['porte'], ch: [100, 530, 165] },
  "dans l'armoire": { f: ['armoire'], ch: [1140, 474, 128], clip: [1116, 156, 48, 320] },
  'sur le tapis': { f: ['tapis'], ch: [700, 590, 140] },
  'devant la fenêtre': { f: ['fenetre'], ch: [632, 420, 230] },
  'à gauche de la plante': { f: ['plante'], ch: [118, 484, 140] },
  'à droite de la plante': { f: ['plante'], ch: [312, 484, 140] },
  'sur le fauteuil': { f: ['fauteuil'], ch: [884, 426, 120] },
  'derrière le fauteuil': { f: ['fauteuil'], ch: [884, 404, 150], behind: true },
  'à gauche de la commode': { f: ['commode'], ch: [900, 484, 135] },
  'à droite de la commode': { f: ['commode'], ch: [1112, 484, 135] },
};
const ROOMT = { 'dans la cuisine': 'cuisine', 'dans la salle de bains': 'sdb', 'dans le salon': 'salon', 'dans la chambre': 'chambre' };
const ORD = { 0: 'au rez-de-chaussée', 1: 'au premier étage', 2: 'au deuxième étage' };

export const ALL_TILES = (() => {
  const t = [];
  for (const p of [...Object.keys(P), ...Object.keys(ROOMT)]) { t.push({ kind: 'scene', place: p, neg: false }); t.push({ kind: 'scene', place: p, neg: true }); }
  for (const f of [0, 1, 2]) for (const s of ['gauche', 'droite']) t.push({ kind: 'house', floor: f, side: s, neg: false });
  return t.map(x => ({ ...x, sentence: sentenceOf(x) }));
})();
function sentenceOf(t) {
  if (t.kind === 'house') return `Lou est ${ORD[t.floor]}, à ${t.side}.`;
  return t.neg ? `Lou n'est pas ${t.place}.` : `Lou est ${t.place}.`;
}
export const gameLines = () => ALL_TILES.flatMap(t => [{ text: t.sentence, voice: 'n' }, { text: t.sentence, voice: 'o' }]);

let clipN = 0;
export function tileSVG(t) {
  if (t.kind === 'house') return miniHouse({ floor: t.floor, side: t.side, floors: 2 });
  if (ROOMT[t.place]) {
    const base = roomIcon(ROOMT[t.place]).replace('</svg>', '');
    const x = ROOMT[t.place] === 'salon' ? 118 : 160;
    const who = t.neg ? placeChar('owl', x, 146, 96, { mood: 'wow' }) + qMark(x + 26, 40) : placeChar('lou', x, 146, 110, { mood: 'joy' });
    return base + who + '</svg>';
  }
  const sp = P[t.place];
  const fr = sp.f.map(id => FURNITURE[id].rect);
  const [cx, cy, chH] = sp.ch;
  const cw = chH * .8;
  const xs = [...fr.map(r => r[0]), cx - cw / 2], ys = [...fr.map(r => r[1]), cy - chH];
  const xe = [...fr.map(r => r[0] + r[2]), cx + cw / 2], ye = [...fr.map(r => r[1] + r[3]), cy];
  const R = { x: Math.min(...xs) - 14, y: Math.min(...ys) - 14, w: Math.max(...xe) - Math.min(...xs) + 28, h: Math.max(...ye) - Math.min(...ys) + 22 };
  const s = Math.min(184 / R.w, 172 / R.h);
  const tx = 100 - (R.x + R.w / 2) * s, ty = 188 - (R.y + R.h) * s;
  const floorY = Math.min(200, 470 * s + ty);
  const who = t.neg ? 'owl' : 'lou';
  const id = 'tc' + (++clipN);
  let charSvg = placeChar(who, cx, cy, chH, { mood: t.neg ? 'wow' : 'joy' });
  if (sp.clip) charSvg = `<g clip-path="url(#${id})">${charSvg}</g>`;
  let parts = sp.f.map(fid => FURNITURE[fid].draw());
  if (sp.behind) parts.splice(parts.length - 1, 0, charSvg); else parts.push(charSvg);
  const q = t.neg ? qMark(cx * s + tx + 26, (cy - chH) * s + ty + 4) : '';
  return `<svg viewBox="0 0 200 200"><defs><clipPath id="${id}"><rect x="${sp.clip ? sp.clip[0] : 0}" y="${sp.clip ? sp.clip[1] : 0}" width="${sp.clip ? sp.clip[2] : 0}" height="${sp.clip ? sp.clip[3] : 0}"/></clipPath>
    <linearGradient id="windowSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ED8FF"/><stop offset="1" stop-color="#E1F5FF"/></linearGradient></defs>
    <rect width="200" height="${floorY}" fill="#FDEBD9"/><rect y="${floorY}" width="200" height="${200 - floorY}" fill="#DDA56B"/>
    <g transform="translate(${tx} ${ty}) scale(${s})">${parts.join('')}</g>${q}</svg>`;
}
function qMark(x, y) { return `<g transform="translate(${x} ${y})"><circle r="17" fill="#FFC83D" stroke="#fff" stroke-width="3"/><text y="8" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="24" fill="#5A3E00">?</text></g>`; }

// ---------------- 4 in a row ----------------
const LINES = (() => {
  const L = [], N = 5, K = 4, dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (const [dr, dc] of dirs) {
    const cells = []; for (let k = 0; k < K; k++) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || rr >= N || cc < 0 || cc >= N) break; cells.push(rr * N + cc); }
    if (cells.length === K) L.push(cells);
  }
  return L;
})();
const winner = (b) => { for (const l of LINES) { const v = b[l[0]]; if (v && l.every(i => b[i] === v)) return { v, l }; } return null; };
function aiMove(b, R) {
  const free = b.map((v, i) => v ? null : i).filter(i => i != null);
  for (const i of free) { const t = b.slice(); t[i] = 'o'; if (winner(t)) return i; }
  if (R() < .5) for (const i of free) { const t = b.slice(); t[i] = 'p'; if (winner(t)) return i; }
  let best = free[0], bs = -1;
  for (const i of free) {
    let s = R() * 2; if (i === 12) s += 1.5;
    for (const l of LINES) if (l.includes(i)) { const own = l.filter(j => b[j] === 'o').length, opp = l.filter(j => b[j] === 'p').length; if (!opp) s += own * own + .3; }
    if (s > bs) { bs = s; best = i; }
  }
  return best;
}

export function game(ex, ctx) {
  ctx.root.append(ctx.head(ex));
  const R = ctx.rng;
  const pos = R.shuffle(ALL_TILES.filter(t => !t.neg && t.kind === 'scene'));
  const neg = R.shuffle(ALL_TILES.filter(t => t.neg));
  const hou = R.shuffle(ALL_TILES.filter(t => t.kind === 'house'));
  const used = new Set();
  const key = (t) => `${t.kind}|${t.place}|${t.neg}|${t.floor}|${t.side}`;
  const pickU = (arr, n) => { const out = []; for (const t of arr) { if (out.length >= n) break; if (used.has(key(t))) continue; used.add(key(t)); out.push(t); } return out; };
  const tiles = R.shuffle([...pickU(pos, 10), ...pickU(neg, 9), ...pickU(hou, 6)]);
  if (tiles.length !== 25) console.warn('board size', tiles.length);
  const board = Array(tiles.length).fill(null);
  let turn = 'p', over = false, right = 0, tries = 0;
  const pTok = svgEl(ICON.berry), oTok = charSVG('owl', { mood: 'happy' });
  const youEl = h('div', { class: 'p turn' }, svgEl(ICON.berry), 'Du');
  const owlEl = h('div', { class: 'p' }, h('span', { html: charSVG('owl'), style: { width: '34px', display: 'inline-block' } }), 'Mme Chouette');
  const status = h('div', { class: 'note', style: { textAlign: 'center', flex: 1 } }, 'Tippe auf ein Feld und sag, wo Lou ist!');
  const grid = h('div', { class: 'board' });
  const cells = tiles.map((t, i) => {
    const c = h('button', { class: 'cell', 'aria-label': 'Feld ' + (i + 1) }); c.innerHTML = tileSVG(t);
    c.addEventListener('click', () => { if (turn === 'p' && !over && !board[i]) ask(i); });
    grid.append(c); return c;
  });
  const setTurn = (t) => { turn = t; youEl.classList.toggle('turn', t === 'p'); owlEl.classList.toggle('turn', t === 'o'); };
  const put = (i, who) => {
    board[i] = who; const tok = h('div', { class: 'tok ' + (who === 'p' ? 'tok-p' : 'tok-o') }); tok.innerHTML = `<span class="disc">${who === 'p' ? ICON.berry : charSVG('owl', { mood: 'joy' })}</span>`;
    cells[i].append(tok); sfx.pop();
  };
  const end = () => {
    const w = winner(board); const full = board.every(Boolean);
    if (!w && !full) return false;
    over = true;
    if (w) w.l.forEach(i => cells[i].classList.add('win'));
    const won = w && w.v === 'p';
    status.innerHTML = won ? '<b>Gewonnen! 🎉</b> Vier Erdbeeren in einer Reihe!' : w ? 'Madame Chouette hat gewonnen – nochmal?' : 'Unentschieden!';
    const goodSentences = tries > 0 && right / tries >= .8;
    setTimeout(() => ctx.finish({ ok: goodSentences || won, score: tries ? right / tries : 0, note: `${won ? 'Gewonnen! ' : w ? 'Die Eule hat gewonnen. ' : 'Unentschieden. '}${right} von ${tries} Sätzen richtig.`, tip: goodSentences ? (won ? '' : 'Deine Sätze waren super – nächstes Mal schnappst du dir die Reihe!') : 'Übe die Sätze nochmals: «Lou est …» / «Lou n\'est pas …».' }), 1600);
    return true;
  };
  const owlTurn = async () => {
    setTurn('o'); status.textContent = 'Madame Chouette überlegt …';
    await sleep(900);
    const i = aiMove(board, R);
    cells[i].animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 400 });
    status.innerHTML = `Chouette: «${tiles[i].sentence}»`;
    await say(tiles[i].sentence, 'o');
    put(i, 'o');
    if (!end()) { await sleep(300); setTurn('p'); status.textContent = 'Du bist dran!'; }
  };
  const ask = (i) => {
    const t = tiles[i];
    const toks = tokenize(t.sentence.replace(/[.,]/g, ''));
    const preps = ['sur', 'dans', 'devant', 'sous'].filter(x => !t.place.startsWith(x) && !(/fenêtre|rideau/.test(t.place) && x === 'sous'));
    const extra = t.kind === 'house' ? [t.side === 'gauche' ? 'droite' : 'gauche', t.floor === 1 ? 'deuxième' : 'premier', 'le'] : t.neg ? ['ne', R.pick(preps)] : ["n'", 'pas', R.pick(preps)];
    const blk = buildBlock({ answers: [t.sentence], tokens: toks, extra }, ctx, n => okBtn.disabled = n === 0);
    const okBtn = h('button', { class: 'btn', disabled: true }, 'Prüfen');
    const cancel = h('button', { class: 'btn ghost small' }, 'Anderes Feld');
    const pic = h('div', { style: { width: '220px', margin: '0 auto', borderRadius: '18px', overflow: 'hidden', boxShadow: 'var(--shadow)' } }); pic.innerHTML = tileSVG(t);
    const fb = h('div', { class: 'note', style: { minHeight: '26px', textAlign: 'center' } });
    const m = h('div', { class: 'modal' }, h('h2', {}, t.neg ? 'Lou ist nicht da! Was sagst du?' : 'Wo ist Lou?'), h('div', { class: 'small-muted' }, t.neg ? 'Madame Chouette sucht Lou – aber Lou ist nicht hier. Bilde einen verneinten Satz.' : 'Bilde einen Satz mit den Wortbausteinen.'),
      pic, blk.el, fb, h('div', { class: 'row' }, cancel, okBtn));
    const bg = h('div', { class: 'modal-bg' }, m);
    document.getElementById('overlay').append(bg);
    cancel.onclick = () => bg.remove();
    okBtn.onclick = async () => {
      okBtn.disabled = true; cancel.disabled = true;
      const r = blk.check(); tries++;
      if (r.ok) { right++; sfx.correct(); fb.innerHTML = '<b style="color:var(--leaf-d)">Super!</b>'; ctx.award(10); await say(t.sentence, 'n'); bg.remove(); put(i, 'p'); if (!end()) owlTurn(); }
      else { sfx.wrong(); fb.innerHTML = `<b style="color:var(--bad-d)">Richtig wäre:</b> ${t.sentence}`; ctx.logMistake && ctx.logMistake({ id: 'game:' + t.sentence, ex: { type: 'build', id: 'game:' + t.sentence, kicker: 'Où est Lou ?', prompt: t.neg ? 'Lou ist nicht da (die Eule sucht ihn). Bilde einen verneinten Satz.' : t.kind === 'house' ? 'Wo ist Lou? (Stockwerk + Seite)' : 'Wo ist Lou?', img: tileSVG(t), answers: [t.sentence], tokens: toks, extra } });
        await say(t.sentence, 'n'); await sleep(900); bg.remove(); owlTurn(); }
    };
  };
  ctx.root.append(h('div', { class: 'vs' }, youEl, status, owlEl), h('div', { style: { maxWidth: 'min(620px, calc(100dvh - 200px))', minWidth: '300px', width: '100%', margin: '0 auto' } }, grid));
  ctx.ready(false, null, { hideCheck: true });
  return { check: () => ({ ok: true }) };
}
