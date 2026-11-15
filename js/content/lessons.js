// All lessons, organised by floor of the "Maison Fraise" (= Lernziele der Unité 2)
import { V, VOCAB, ORDINALS, NUMBERS } from './vocab.js';
import { planIcon, floorPlan, floorIcon, miniHouse, houseSVG, ROOMS } from '../art/house.js';
import { prepIcon, qIcon } from '../art/icons.js';
import { LOC, OBJ, FURNITURE, roomSVG } from '../art/room.js';
import { charSVG } from '../art/char.js';
import * as S from './scenes.js';
import { ALL_TILES, tileSVG } from '../ex/game.js';
import { rng } from '../core/util.js';

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const hasArt = (fr) => /^(le|la|les|l'|un|une) /i.test(fr) || /^l'/i.test(fr);
/** words of an answer as scoring parts (partial points in the exam) */
function partsOf(a) { return a.replace(/[.!?,]/g, ' ').toLowerCase().split(/\s+/).filter(w => w && !['non', 'je'].includes(w)).flatMap(w => /^n'/.test(w) ? [["n'"], [w.slice(2)]] : [[w]]); }
/** all orders of «Subjekt est | Stockwerk | Seite | Raum» (+ pronoun) are correct */
function placeAnswers(subj, verb, fl, sd, room, pron) {
  const bits = [fl, sd, room].filter(Boolean);
  const perms = bits.length === 3 ? [[0, 1, 2], [0, 2, 1], [2, 0, 1], [2, 1, 0], [1, 0, 2], [1, 2, 0]] : bits.length === 2 ? [[0, 1], [1, 0]] : [[0]];
  const out = [];
  for (const sj of [subj, pron].filter(Boolean)) for (const pm of perms) out.push(`${sj} ${verb} ${pm.map(i => bits[i]).join(', ')}.`);
  return out;
}
const FLOOR_GROUP = new Set(['etage', 'rez', 'soussol', 'maison', 'appartement']);
const tok = (s) => s.replace(/[.!?,]/g, '').replace(/\s+/g, ' ').trim().split(' ').flatMap(w => /^n'/.test(w) ? ["n'", w.slice(2)] : [w]);

// ======================================================================
// generic vocabulary lesson
// ======================================================================
function vocabLesson(ids, R, { flashN = 4, picN = 4, audN = 2, typeN = 3, dict = 1, heft } = {}) {
  const items = ids.map(id => V[id]).filter(Boolean);
  const out = [];
  R.sample(items, Math.min(flashN, items.length)).forEach(v => out.push({ type: 'flash', v, heft, id: 'flash:' + v.id }));
  const distract = (v, list) => list.filter(x => x !== v && x.fr !== v.fr && !(FLOOR_GROUP.has(v.id) && FLOOR_GROUP.has(x.id)));
  R.sample(items.filter(v => !v.noPic), Math.min(picN, items.length)).forEach(v => {
    const opts = R.shuffle([v, ...R.sample(distract(v, items.filter(x => !x.noPic)), 3)]);
    out.push({ type: 'choice', kicker: 'Wortschatz', prompt: 'Wie heisst das auf Französisch?', img: v.pic(), options: opts.map(o => ({ t: o.fr, say: o.fr, voice: 'w' })), answer: opts.indexOf(v), id: 'pic:' + v.id });
  });
  R.sample(items.filter(v => !v.sentence && !v.noPic), Math.min(audN, items.length)).forEach(v => {
    const opts = R.shuffle([v, ...R.sample(distract(v, items.filter(x => !x.sentence && !x.noPic)), 3)]);
    out.push({ type: 'choice', kicker: 'Hören', prompt: 'Hör zu: Welches Bild passt?', audio: { text: v.fr, voice: 'w' }, options: opts.map(o => ({ svg: o.pic() })), answer: opts.indexOf(v), solText: v.fr, id: 'aud:' + v.id });
  });
  const mp = R.sample(items, Math.min(5, items.length));
  out.push({ type: 'match', kicker: 'Paare', prompt: 'Finde die Paare: Französisch – Deutsch.', pairs: mp.map(v => ({ l: { t: v.fr, say: v.fr }, r: { t: v.de } })), id: 'match:' + mp.map(v => v.id).join(',') });
  R.sample(items.filter(v => !v.noType), Math.min(typeN, items.length)).forEach(v => out.push({ type: 'type', kicker: 'Schreiben', prompt: v.sentence ? 'Übersetze auf Französisch.' : hasArt(v.fr) ? 'Schreib das Wort auf Französisch – mit Artikel!' : 'Schreib das Wort auf Französisch.', q: v.de, answers: [v.fr, ...(v.typed ? [v.typed] : []), ...(v.alt || [])], voiceAfter: 'w', id: 'type:' + v.id }));
  R.sample(items.filter(v => !v.sentence && !v.noType), Math.min(dict, items.length)).forEach(v => out.push({ type: 'type', kicker: 'Diktat', prompt: 'Hör zu und schreib, was du hörst.', audio: { text: v.fr, voice: 'w' }, answers: [v.fr, ...(v.typed ? [v.typed] : []), ...(v.alt || [])], sayAfter: false, id: 'dict:' + v.id }));
  return R.shuffle(out.slice(flashN)).length ? [...out.slice(0, Math.min(flashN, items.length)), ...R.shuffle(out.slice(Math.min(flashN, items.length)))] : out;
}

// ======================================================================
// helpers for houses
// ======================================================================
const FAMILY_SCENE = { kind: 'house', cfg: S.FAMILY_HOUSE };
const ORD_FLOOR = { 0: 'au sous-sol', 1: 'au rez-de-chaussée', 2: 'au premier étage', 3: 'au deuxième étage', 4: 'au troisième étage' };
const SIDE = (c, n) => n === 1 ? '' : n === 2 ? (c === 0 ? 'à gauche' : 'à droite') : ['à gauche', 'au milieu', 'à droite'][c];
const PEOPLE = [
  { who: 'mamie', subj: 'Ma grand-mère' }, { who: 'papi', subj: 'Mon grand-père' }, { who: 'maman', subj: 'Ma mère' }, { who: 'papa', subj: 'Mon père' },
  { who: 'mia', subj: 'Ma sœur' }, { who: 'tom', subj: 'Mon frère' }, { who: 'tonton', subj: 'Mon oncle' },
];
const ROOM_POOL = ['cuisine', 'salon', 'chambre', 'sdb', 'toilettes', 'salleManger', 'chambreAmis'];
/** random house + 3 people -> sentences (no audio) */
function randomHouse(R) {
  const floors = [{ key: 'rez', rooms: [] }, { key: 1, rooms: [] }, { key: 2, rooms: [] }, { key: 3, rooms: [] }];
  const pool = R.shuffle([...ROOM_POOL, ...ROOM_POOL]);
  floors.forEach(f => { const n = R() < .3 ? 2 : 3; f.rooms = pool.splice(0, n); });
  const ppl = R.sample(PEOPLE, 3); const people = []; const facts = [];
  const taken = new Set();
  for (const p of ppl) {
    let fi, c; do { fi = R.int(4); c = R.int(floors[fi].rooms.length); } while (taken.has(fi + '-' + c)); taken.add(fi + '-' + c);
    people.push({ who: p.who, f: fi, c, pos: .74 });
    const rt = floors[fi].rooms[c]; const fl = ORD_FLOOR[fi + 1]; const sd = SIDE(c, floors[fi].rooms.length);
    facts.push({ ...p, s: `${p.subj} est ${fl}, ${sd}, dans ${ROOMS[rt].name}.`, fl, sd, room: ROOMS[rt].name });
  }
  return { cfg: { floors, people, labels: 'num' }, facts };
}

// ======================================================================
// LESSONS
// ======================================================================
export const FLOORS = [
  { key: 'grenier', label: 'le grenier', title: 'Le grand test', goal: 'Hören, Prüfung üben, Bonus', color: '#8B5CF6', dark: '#6C3EDB' },
  { key: 'e3', label: 'le troisième étage', title: 'Non, non, non!', goal: 'S · Verneinung: ne … pas', color: '#FF4F6E', dark: '#D93355' },
  { key: 'e2', label: 'le deuxième étage', title: 'Dans la chambre', goal: '3 · Möbel & wo sich etwas befindet', color: '#2FBF71', dark: '#1E9757' },
  { key: 'e1', label: 'le premier étage', title: 'Où est … ?', goal: '2 · Lage von Räumen beschreiben', color: '#47B3F0', dark: '#2A8CC8' },
  { key: 'rez', label: 'le rez-de-chaussée', title: 'Pièces et étages', goal: '1 · Räume & Stockwerke im Text', color: '#FF9142', dark: '#E06F1E' },
  { key: 'ss', label: 'le sous-sol', title: 'Les mots', goal: 'Voci-Training (S. 74/75)', color: '#7C6A92', dark: '#5E4F72' },
];

export const LESSONS = [
  // ---------------------------------------------------------------- SOUS-SOL
  { id: 'v1', floor: 'ss', icon: 'words', title: 'Räume & Stockwerke', sub: 'Voci Lernziel 1', build: R => vocabLesson(['maison', 'appartement', 'piece', 'cuisine', 'salon', 'chambre', 'toilettes', 'sdb', 'etage', 'rez', 'soussol', 'travailler'], R, { heft: 'S. 74' }) },
  { id: 'v2', floor: 'ss', icon: 'words', title: 'Esszimmer & Co.', sub: 'Voci Lernziel 1 plus', build: R => vocabLesson(['sejour', 'sam', 'amis', 'buanderie', 'grenier', 'cuisine', 'sdb', 'jhabite1', 'tuhabites2', 'ilhabite3', 'pharmacie'], R, { flashN: 5, heft: 'S. 74/75' }) },
  { id: 'v3', floor: 'ss', icon: 'prep', title: 'sur, sous, dans …', sub: 'Voci Lernziel 2', build: R => vocabLesson(['sur', 'sous', 'dans', 'milieu', 'devant', 'derriere', 'entre', 'enhaut', 'enbas', 'agauche', 'adroite', 'a'], R, { flashN: 4, picN: 5, audN: 2, typeN: 3, heft: 'S. 74' }) },
  { id: 'v4', floor: 'ss', icon: 'words', title: 'Möbel', sub: 'Voci Lernziel 3 + plus', build: R => vocabLesson(['porte', 'fenetre', 'lit', 'table', 'chaise', 'etagere', 'armoire', 'fauteuil', 'tapis', 'commode', 'plante', 'affiche', 'lampe', 'rideau', 'corbeille', 'biblio', 'gauchelampe', 'gauchepiano', 'droiteetagere'], R, { flashN: 4, picN: 5, typeN: 4, heft: 'S. 74/75' }) },
  { id: 'v5', floor: 'ss', icon: 'words', title: 'Sachen im Zimmer', sub: 'Gegenstände aus 3B', build: R => vocabLesson(['casquette', 'ordinateur', 'veste', 'regle', 'pull', 'lunettes', 'teeshirt', 'violon', 'ski', 'lampe'], R, { flashN: 4, heft: 'S. 53' }) },
  { id: 'v6', floor: 'ss', icon: 'question', title: 'Fragen stellen', sub: 'Voci Lernziel 2 plus', build: buildQuestions },
  { id: 'v7', floor: 'ss', icon: 'accent', title: 'é, è, ê', sub: 'Rythmes et sons', build: buildAccents },
  { id: 'v8', floor: 'ss', icon: 'pencil', title: 'Voci-Test', sub: 'Deutsch → Französisch', test: true, build: buildVociTest },

  // ---------------------------------------------------------------- REZ (LZ1)
  { id: 'r1', floor: 'rez', icon: 'plan', title: 'Les pièces', sub: 'Heft S. 45', build: buildPieces },
  { id: 'r2', floor: 'rez', icon: 'floors', title: 'Les étages', sub: 'Heft S. 45 + LMVZ', build: buildEtages },
  { id: 'r3', floor: 'rez', icon: 'text', title: 'Ma maison', sub: '1A · Räume & Stockwerke markieren', build: buildMark },
  { id: 'r4', floor: 'rez', icon: 'plan', title: 'Quel plan ?', sub: '1B · Text ↔ Grundriss', build: buildPlans },
  { id: 'r5', floor: 'rez', icon: 'cloze', title: 'Lückentext: Chez moi', sub: 'Voci in Lücken einsetzen', test: true, build: buildClozeHouse },

  // ---------------------------------------------------------------- 1er (LZ2)
  { id: 'p1', floor: 'e1', icon: 'floors', title: '1er, 2e, 3e …', sub: 'gauche, droite, milieu', build: buildOrdinals },
  { id: 'p2', floor: 'e1', icon: 'where', title: 'Qui est où ?', sub: '2B · Plein de questions', test: true, build: buildQuiEstOu },
  { id: 'p3', floor: 'e1', icon: 'question', title: 'Plein de questions', sub: '2B · Fragen zum Haus', test: true, build: buildPleinQuestions },
  { id: 'p4', floor: 'e1', icon: 'me', title: 'Et toi ?', sub: '2C · Über dich erzählen', test: true, build: buildEtToi },
  { id: 'p5', floor: 'e1', icon: 'dot', title: 'Le point rouge', sub: 'LMVZ-Stil + Hören', build: buildPointRouge },

  // ---------------------------------------------------------------- 2e (LZ3)
  { id: 'd1', floor: 'e2', icon: 'room', title: 'Zoom sur la chambre', sub: '3A · Möbel finden', build: buildZoom },
  { id: 'd2', floor: 'e2', icon: 'prep', title: 'à droite du lit', sub: 'Präpositionen + du / de la', build: buildPrep },
  { id: 'd3', floor: 'e2', icon: 'ear', title: 'Vrai ou faux ?', sub: '3B · Hörverständnis', test: true, build: buildVraiFaux },
  { id: 'd4', floor: 'e2', icon: 'diff', title: 'Quel désordre !', sub: '3C · Unterschiede', build: buildDesordre },
  { id: 'd5', floor: 'e2', icon: 'puzzle', title: 'Qui habite où ?', sub: '3D · Logical', build: buildLogical },
  { id: 'd6', floor: 'e2', icon: 'ear', title: 'Hör genau hin!', sub: 'LMVZ · Orte im Bild', build: buildListenRoom },

  // ---------------------------------------------------------------- 3e (S)
  { id: 's1', floor: 'e3', icon: 'no', title: 'Lou dit non', sub: 'SA · Befehle verneinen', test: true, build: buildDitNon },
  { id: 's2', floor: 'e3', icon: 'pencil', title: 'Zut, tellement d’ordres !', sub: 'SA · selber schreiben', test: true, build: buildDitNonWrite },
  { id: 's3', floor: 'e3', icon: 'slots', title: 'ne · n’ · pas', sub: 'LMVZ · Verneine den Satz', build: buildSlots },
  { id: 's4', floor: 'e3', icon: 'game', title: 'Où est Lou ?', sub: 'Spielplan · 4 gewinnt', test: true, build: R => [{ type: 'info', kicker: 'Faites vos jeux!', prompt: 'So geht «Où est Lou ?»', heft: 'Spielplan', html: `<h3>🎲 Spielregeln</h3><p>Tippe ein Feld an und bilde einen Satz:</p><p>🦊 <b>Lou ist zu sehen</b> → «Lou <b>est</b> sous la table.»</p><p>🦉 <b>Die Eule sucht (?)</b> – Lou ist nicht da → «Lou <b class="r">n'</b>est <b class="r">pas</b> sous la table.»</p><p>🏠 <b>Haus</b> → Stockwerk + Seite: «Lou est au premier étage, à gauche.» (braune Reihe = Sous-sol)</p><p>Richtiger Satz = deine Erdbeere 🍓. Vier in einer Reihe gewinnt!</p>`, img: charSVG('owl', { pose: 'wave' }), id: 'info:game' }, { type: 'game', kicker: 'Faites vos jeux!', prompt: 'Où est Lou ? – Bilde Sätze und lege 4 Erdbeeren in eine Reihe!', heft: 'Spielplan', id: 'game' }] },
  { id: 's5', floor: 'e3', icon: 'ear', title: 'Oui ou non ?', sub: 'LMVZ · Hören & Bild wählen', build: buildNegListen },
  { id: 's6', floor: 'e3', icon: 'music', title: 'Rien que pour moi', sub: 'SB · eigenes Gedicht', build: buildPoem },

  // ---------------------------------------------------------------- GRENIER
  { id: 'g1', floor: 'grenier', icon: 'ear', title: 'Hör-Labor', sub: 'Alle Hörübungen gemischt', test: true, build: buildHoerLabor },
  { id: 'exam', floor: 'grenier', icon: 'exam', title: 'Prüfung simulieren', sub: 'Wie am Mittwoch · mit Note', test: true, exam: true, build: buildExam },
  { id: 'mix', floor: 'grenier', icon: 'repeat', title: 'Gemischtes Training', sub: 'Von allem etwas', build: buildMix },
  { id: 'k1', floor: 'grenier', icon: 'castle', title: 'Versailles', sub: 'K · Bonus Kultur', build: buildVersailles },
];
export const L = Object.fromEntries(LESSONS.map(l => [l.id, l]));

// ======================================================================
// SOUS-SOL builders
// ======================================================================
function buildQuestions(R) {
  const qs = ['q_combien', 'q_qui', 'q_ou', 'q_etage'].map(id => V[id]);
  const out = [
    { type: 'info', kicker: 'Merke dir', prompt: 'Die Fragewörter', html: `<h3>❓ Fragewörter</h3><p><b class="b">Qui ?</b> = Wer? · <b class="b">Où ?</b> = Wo? · <b class="b">Quel / Quelle ?</b> = Welche/r?</p><p><b class="b">Qu'est-ce que … ?</b> = Was? · <b class="b">Comment ?</b> = Wie? · <b class="b">Combien ?</b> = Wie viele?</p>`, id: 'info:q' },
    { type: 'match', kicker: 'Paare', prompt: 'Welches Fragewort passt?', pairs: [['Qui ?', 'Wer?'], ['Où ?', 'Wo?'], ['Quelle ?', 'Welche?'], ["Qu'est-ce que … ?", 'Was?'], ['Comment ?', 'Wie?'], ['Combien ?', 'Wie viele?']].map(([a, b]) => ({ l: { t: a }, r: { t: b } })), id: 'match:qwords' },
  ];
  qs.forEach(v => out.push({ type: 'choice', kicker: 'Verstehen', prompt: 'Was bedeutet diese Frage?', q: v.fr, qSay: { text: v.fr, voice: 'w' }, options: R.shuffle(qs.map(x => ({ t: x.de, ok: x === v }))).map(o => o), answer: -1, id: 'qmean:' + v.id }));
  out.slice(-4).forEach(e => { e.answer = e.options.findIndex(o => o.ok); });
  R.sample(qs, 3).forEach(v => out.push({ type: 'build', kicker: 'Frage bauen', prompt: 'Bau die Frage auf Französisch.', q: v.de, answers: [v.fr], tokens: tok(v.fr), extra: R.sample(['où', 'qui', 'ton', 'est', 'a', 'quelle'], 2), voiceAfter: 'w', sayAfter: false, id: 'qbuild:' + v.id }));
  R.sample(qs, 2).forEach(v => out.push({ type: 'type', kicker: 'Schreiben', prompt: 'Schreib die Frage auf Französisch.', q: v.de, answers: [v.fr], voiceAfter: 'w', id: 'qtype:' + v.id }));
  return out;
}
function buildAccents(R) {
  const words = [
    ['étage', ['etage', 'ètage', 'êtage']], ['fenêtre', ['fenètre', 'fenétre', 'fenetre']], ['étagère', ['etagère', 'étagére', 'ètagère']],
    ['pièce', ['piéce', 'piece', 'pièçe']], ['derrière', ['derriére', 'derriere', 'dèrrière']], ['rez-de-chaussée', ['rez-de-chaussèe', 'rez-de-chausée', 'rèz-de-chaussée']],
    ['grand-mère', ['grand-mére', 'grand-mere', 'grand-mêre']], ['frère', ['frére', 'frêre', 'frere']], ['bibliothèque', ['bibliothéque', 'bibliotheque', 'bibliothêque']],
    ['la règle', ['la régle', 'la rêgle', 'la regle']], ['à droite', ['a droite', 'á droite', 'â droite']], ['deuxième', ['deuxiéme', 'deuxieme', 'deuxiême']], ['troisième', ['troisiéme', 'troisieme', 'troisiême']],
    ['la salle à manger', ['la salle a manger', 'la salle á manger', 'la salle â manger']],
  ];
  const out = [{ type: 'info', kicker: 'Rythmes et sons', prompt: 'Drei wichtige Akzente', heft: 'S. 64', html: `<h3>é · è · ê</h3><p><b class="r">é</b> accent aigu – wie eine Rakete nach oben ↗ (l'<b>é</b>tage)</p><p><b class="b">è</b> accent grave – wie ein Pfeil nach unten ↘ (la pi<b>è</b>ce)</p><p><b class="g">ê</b> accent circonflexe – wie ein Dach ^ (la fen<b>ê</b>tre)</p>`, say: [{ text: "l'étage", voice: 'w' }, { text: 'la pièce', voice: 'w' }, { text: 'la fenêtre', voice: 'w' }], id: 'info:acc' }];
  R.sample(words, 7).forEach(([w, wrong]) => {
    const opts = R.shuffle([w, ...wrong]);
    out.push({ type: 'choice', kicker: 'Rechtschreibung', prompt: 'Hör zu: Wie schreibt man das Wort richtig?', audio: { text: w, voice: 'w' }, options: opts.map(o => ({ t: o })), answer: opts.indexOf(w), id: 'acc:' + w });
  });
  R.sample(words, 4).forEach(([w]) => out.push({ type: 'type', kicker: 'Diktat', prompt: 'Hör zu und schreib das Wort – mit dem richtigen Akzent!', audio: { text: w, voice: 'w' }, answers: [w], sayAfter: false, allowChips: false, strict: true, id: 'accd:' + w }));
  return out;
}
function buildVociTest(R) {
  const pool = VOCAB.filter(v => ['1', '1+', '2', '3', '3+'].includes(String(v.lz)) && !v.sentence && !v.noType);
  const sent = VOCAB.filter(v => v.sentence && ['1', '2+'].includes(String(v.lz)));
  return [
    { type: 'info', kicker: 'Voci-Test', prompt: 'Wie in der Prüfung', html: `<h3>✏️ So geht's</h3><p>Schreib jedes Wort auf Französisch – <b>mit Artikel</b> (le, la, l', les, un, une).</p><p>Akzente zählen! Benutze die Tasten <b>é è ê à ç</b>.</p>`, id: 'info:vt' },
    ...R.sample(pool, 12).map(v => ({ type: 'type', kicker: 'Voci-Test', prompt: hasArt(v.fr) ? 'Schreib auf Französisch (mit Artikel).' : 'Schreib auf Französisch.', q: v.de, answers: [v.fr, ...(v.typed ? [v.typed] : []), ...(v.alt || [])], allowChips: false, strict: true, voiceAfter: 'w', id: 'vt:' + v.id })),
    ...R.sample(sent, 3).map(v => ({ type: 'type', kicker: 'Voci-Test · Sätze', prompt: 'Übersetze auf Französisch.', q: v.de, answers: [v.fr], allowChips: false, strict: true, voiceAfter: 'w', id: 'vts:' + v.id })),
  ];
}

// ======================================================================
// REZ-DE-CHAUSSÉE builders (LZ1)
// ======================================================================
const PLAN_ROOMS = ['sdb', 'chambreAmis', 'salleManger', 'chambre', 'grenier', 'cuisine', 'salon', 'toilettes', 'buanderie'];
function buildPieces(R) {
  const out = [{ type: 'info', kicker: 'Merke dir', prompt: 'Zimmer ist nicht gleich Zimmer!', heft: 'S. 45', html: `<h3>🏠 la pièce ≠ la chambre</h3><p>Meine Wohnung hat drei Zimmer = Mon appartement a trois <b class="r">pièces</b>.</p><p>Das ist mein Zimmer (Schlafzimmer) = C'est ma <b class="b">chambre</b>.</p>`, img: charSVG('lou', { pose: 'wave' }), id: 'info:piece' }];
  R.sample(PLAN_ROOMS, 5).forEach(t => {
    const others = R.sample(PLAN_ROOMS.filter(x => x !== t), 3);
    const opts = R.shuffle([t, ...others]);
    out.push({ type: 'choice', kicker: 'Les pièces', prompt: 'Welcher Raum ist das? (Grundriss von oben)', heft: 'S. 45', img: planIcon(t), options: opts.map(o => ({ t: ROOMS[o].name, say: ROOMS[o].name, voice: 'w' })), answer: opts.indexOf(t), id: 'plan:' + t });
  });
  R.sample(PLAN_ROOMS, 4).forEach(t => out.push({ type: 'type', kicker: 'Les pièces', prompt: 'Schreib den Raum unter den Plan – mit le / la / les.', heft: 'S. 45', img: planIcon(t), answers: [ROOMS[t].name, ...(ROOMS[t].alt || [])], voiceAfter: 'w', id: 'plant:' + t }));
  const t = R.pick(PLAN_ROOMS);
  out.push({ type: 'choice', kicker: 'Hören', prompt: 'Hör zu: Welcher Plan passt?', audio: { text: ROOMS[t].name, voice: 'w' }, options: R.shuffle([t, ...R.sample(PLAN_ROOMS.filter(x => x !== t), 3)]).map(o => ({ svg: planIcon(o), k: o })), answer: -1, solText: ROOMS[t].name, id: 'plana:' + t });
  out[out.length - 1].answer = out[out.length - 1].options.findIndex(o => o.k === t);
  return out;
}
const FLOOR_WORDS = [['le sous-sol', -1], ['le rez-de-chaussée', 0], ['le premier étage', 1], ['le deuxième étage', 2], ['le troisième étage', 3]];
function buildEtages(R) {
  const out = [{ type: 'info', kicker: 'Merke dir', prompt: 'Les étages – die Stockwerke', heft: 'S. 45', html: `<h3>🏢 Von unten nach oben</h3><p><b>-1</b> le sous-sol · <b>0</b> le rez-de-chaussée · <b>1</b> le premier étage · <b>2</b> le deuxième étage · <b>3</b> le troisième étage</p><p>Ich wohne <b class="r">im</b> ersten Stock = J'habite <b class="r">au</b> premier étage. (à + le = <b class="r">au</b>)</p>`, img: houseSVG({ labels: 'num', floors: [{ key: 'ss', rooms: ['buanderie'] }, { key: 'rez', rooms: ['cuisine', 'salon'] }, { key: 1, rooms: ['chambre', 'sdb'] }, { key: 2, rooms: ['toilettes', 'chambreAmis'] }, { key: 3, rooms: ['salleManger', 'chambre'] }] }), say: [{ text: 'le rez-de-chaussée', voice: 'w' }, { text: "J'habite au premier étage.", voice: 'w' }], id: 'info:etages' }];
  const lab = { kind: 'house', cfg: { labels: 'blank', floors: [{ key: 'ss', rooms: ['buanderie'] }, { key: 'rez', rooms: ['cuisine', 'salon'] }, { key: 1, rooms: ['chambre', 'sdb'] }, { key: 2, rooms: ['chambreAmis', 'toilettes'] }] } };
  out.push({ type: 'labelFloors', kicker: 'Les étages', prompt: 'Beschrifte die Stockwerke.', heft: 'S. 45', scene: lab, bank: ['le sous-sol', 'le rez-de-chaussée', 'le premier étage', 'le deuxième étage', 'le troisième étage'], want: { 0: 'le sous-sol', 1: 'le rez-de-chaussée', 2: 'le premier étage', 3: 'le deuxième étage' }, id: 'label:floors' });
  R.sample(FLOOR_WORDS, 3).forEach(([w, f]) => out.push({ type: 'choice', kicker: 'Les étages', prompt: 'Welches Stockwerk ist gelb?', img: floorIcon(f), options: R.shuffle(FLOOR_WORDS.map(x => x[0])).map(t => ({ t, say: t, voice: 'w' })), answer: -1, want: w, id: 'flc:' + f }));
  out.forEach(e => { if (e.type === 'choice' && e.want) e.answer = e.options.findIndex(o => o.t === e.want); });
  R.sample(S.PLACE_LINES, 3).forEach(pl => out.push({ type: 'sceneTap', kicker: 'LMVZ · Hören', prompt: 'Platziere Lou im passenden Stockwerk.', audio: { text: pl.s, voice: 'n' }, scene: { kind: 'house', cfg: S.SIMPLE_HOUSE }, mode: 'floors', placeWho: 'lou', targets: [String(pl.f)], sol: pl.s, id: 'place:' + pl.s }));
  R.sample(FLOOR_WORDS.slice(1), 2).forEach(([w, f]) => out.push({ type: 'type', kicker: 'Schreiben', prompt: 'Ergänze den Satz.', img: miniHouse({ floor: f, side: 'milieu' }), pre: "J'habite", placeholder: '… au premier étage', answers: [`J'habite ${w.replace(/^le /, 'au ')}.`], extra: ['le', 'à', 'dans'], voiceAfter: 'n', sayAfter: false, id: 'habite:' + f }));
  return out;
}
// 1A – mark rooms (blue) and floors (red) in original texts by "élèves de Lausanne"
const MARK_TEXTS = [
  { who: 'Léa', text: "Ma maison a deux étages. Au rez-de-chaussée, il y a la cuisine et le salon. Au premier étage, il y a la salle de bains et deux chambres. Au sous-sol, il y a la buanderie.",
    rooms: ['la cuisine', 'le salon', 'la salle de bains', 'deux chambres', 'la buanderie'], floors: ['Au rez-de-chaussée', 'Au premier étage', 'Au sous-sol'], opt: ['deux étages'] },
  { who: 'Noah', text: "J'habite dans un appartement au troisième étage. Il y a quatre pièces: la cuisine, le séjour, la salle de bains et ma chambre. Les toilettes sont à côté de la cuisine. Ma grand-mère habite au deuxième étage.",
    rooms: ['la cuisine', 'le séjour', 'la salle de bains', 'ma chambre', 'Les toilettes'], floors: ['au troisième étage', 'au deuxième étage'], opt: ['quatre pièces'] },
  { who: 'Emma', text: "Ma maison a trois étages. Au rez-de-chaussée, il y a la pharmacie. Au premier étage, il y a la cuisine et la salle à manger. Au deuxième étage, il y a le salon et la chambre d'amis. Ma chambre est au grenier!",
    rooms: ['la cuisine', 'la salle à manger', 'le salon', "la chambre d'amis", 'Ma chambre'], floors: ['Au rez-de-chaussée', 'Au premier étage', 'Au deuxième étage'], opt: ['trois étages', 'la pharmacie', 'au grenier'] },
];
function buildMark(R) {
  const cats = { room: { label: 'Räume (bleu)', color: '#7FC4F2', cls: 'm-room' }, floor: { label: 'Stockwerke (rouge)', color: '#FF8FA3', cls: 'm-floor' } };
  const out = [{ type: 'info', kicker: '1A · Ma maison', prompt: 'Marque les pièces en bleu et les étages en rouge.', heft: 'S. 44', html: `<h3>🖍️ Zwei Farbstifte</h3><p>Wähle oben den <b class="b">blauen</b> Stift für <b class="b">Räume</b> (la cuisine …) und den <b class="r">roten</b> Stift für <b class="r">Stockwerke</b> (au premier étage …).</p><p>Tippe dann auf die Wörter im Text.</p>`, id: 'info:mark' }];
  for (const t of R.shuffle(MARK_TEXTS)) {
    out.push({ type: 'mark', kicker: '1A · Texte ' + (/^[AEIOU]/.test(t.who) ? "d'" : 'de ') + t.who, prompt: 'Marque les pièces en bleu et les étages en rouge.', heft: 'S. 44', cats, text: t.text,
      targets: [...(t.opt || []).map(p => ({ p, c: 'floor', opt: true })), ...t.rooms.map(p => ({ p, c: 'room' })), ...t.floors.map(p => ({ p, c: 'floor' }))], note: 'Tippe die Wörter einzeln an (z. B. «cuisine» oder «premier étage»). Kleine Wörter wie «la» oder «au» darfst du mitmarkieren.', id: 'mark:' + t.who });
  }
  out.push({ type: 'choice', kicker: 'Verstehen', prompt: 'Lies den Text von Emma nochmals: Wo ist ihr Zimmer?', q: "Ma chambre est au grenier!", options: [{ t: 'unter dem Dach (im Estrich)' }, { t: 'im Erdgeschoss' }, { t: 'im ersten Stock' }], answer: 0, id: 'mark:q1' });
  return out;
}
// 1B – Quel plan?
const PLAN_TEXTS = [
  { s: 'Au rez-de-chaussée, il y a la cuisine, la salle à manger et le salon.', p: ['cuisine', 'escalier', 'salleManger', 'salon'] },
  { s: "Au premier étage, il y a la salle de bains, la chambre et la chambre d'amis.", p: ['sdb', 'escalier', 'chambre', 'chambreAmis'] },
  { s: 'Au rez-de-chaussée, il y a la buanderie, la salle de bains, les toilettes et le salon.', p: ['buanderie', 'sdb', 'toilettes', 'salon'] },
  { s: 'Au premier étage, il y a les toilettes, deux chambres et le grenier.', p: ['grenier', 'toilettes', 'chambre', 'chambre'] },
  { s: 'Au rez-de-chaussée, il y a la cuisine, les toilettes et la salle à manger.', p: ['cuisine', 'escalier', 'toilettes', 'salleManger'] },
];
function buildPlans(R) {
  const out = [{ type: 'info', kicker: '1B · Quel plan ?', prompt: 'Ausschlussverfahren', heft: 'S. 46/47', html: `<h3>🔎 Tipp aus dem Heft</h3><p>Achte im Text <b>und</b> im Grundriss auf die <b>Anzahl Räume</b>.</p><p>Welche Räume kommen vor? Streiche die Pläne, die <b>nicht</b> passen.</p>`, id: 'info:plan' }];
  const texts = R.shuffle(PLAN_TEXTS);
  texts.slice(0, 3).forEach((t, i) => {
    const opts = R.shuffle([t, ...R.sample(PLAN_TEXTS.filter(x => x !== t), 2)]);
    out.push({ type: 'choice', kicker: '1B · Lesen', prompt: 'Welcher Grundriss passt zum Satz?', q: t.s, options: opts.map(o => ({ svg: floorPlan(o.p) })), answer: opts.indexOf(t), solText: t.s, id: 'plantext:' + i });
  });
  texts.slice(3, 5).forEach((t, i) => {
    const opts = R.shuffle([t, ...R.sample(PLAN_TEXTS.filter(x => x !== t), 2)]);
    out.push({ type: 'choice', kicker: '1B · Hören', prompt: 'Hör zu: Welcher Grundriss passt?', audio: { text: t.s, voice: 'n' }, options: opts.map(o => ({ svg: floorPlan(o.p) })), answer: opts.indexOf(t), solText: t.s, id: 'planaud:' + i });
  });
  out.push({ type: 'choice', kicker: '1B plus', prompt: 'Wo arbeitet die Person?', q: 'Je travaille au restaurant tous les jours.', qSay: { text: 'Je travaille au restaurant tous les jours.', voice: 'n' }, options: [{ t: 'im Restaurant' }, { t: 'in der Apotheke' }, { t: 'in der Bibliothek' }], answer: 0, id: 'travail1' });
  out.push({ type: 'build', kicker: '1B plus', prompt: 'Übersetze: Ich arbeite in der Apotheke.', answers: ['Je travaille à la pharmacie.'], extra: ['au', 'le', 'travailles'], voiceAfter: 'w', id: 'travail2' });
  return out;
}
const CLOZE_HOUSE = [
  ["Bonjour! Je m'appelle Lou. J'habite dans une ", { g: ['maison'] }, ". Elle a trois ", { g: ['étages'] }, ".\nAu ", { g: ['sous-sol'] }, ", il y a la ", { g: ['buanderie'] }, ". Au ", { g: ['rez-de-chaussée'] }, ", il y a la ", { g: ['cuisine'] }, " et le ", { g: ['salon', 'séjour'] }, ".\nAu premier ", { g: ['étage'] }, ", il y a la salle de ", { g: ['bains', 'bain'] }, " et ma ", { g: ['chambre'] }, ". Les ", { g: ['toilettes'] }, " sont au deuxième étage. Au ", { g: ['grenier'] }, ", il y a le chat!"],
  ["Ma grand-mère habite dans un ", { g: ['appartement'] }, " au troisième ", { g: ['étage'] }, ". Son appartement a quatre ", { g: ['pièces'] }, ".\nDans la ", { g: ['cuisine'] }, ", il y a une table et deux ", { g: ['chaises'] }, ". Dans le salon, il y a un ", { g: ['fauteuil', 'tapis'] }, " vert et un grand ", { g: ['tapis', 'fauteuil'] }, ".\nDans sa chambre, il y a un ", { g: ['lit'] }, ", une ", { g: ['armoire', 'commode'] }, " et une ", { g: ['commode', 'armoire'] }, ". La ", { g: ['lampe'] }, " est sur la commode."],
  ["Ma chambre est au premier étage, à droite. Le lit est à gauche de la ", { g: ['fenêtre'] }, ".\nSur le lit, il y a mon pull. Mes livres sont ", { g: ['sur'] }, " la table. Le chat dort ", { g: ['sous'] }, " le lit.\nL'armoire est ", { g: ['à'] }, " droite ", { g: ['de'] }, " la commode. Le tapis est ", { g: ['devant'] }, " la table. Le rideau est devant la ", { g: ['fenêtre'] }, "."],
];
const CLOZE_EXTRA = [['sous', 'premier', 'dans'], ['sous', 'devant', 'premier'], ['dans', 'derrière', 'du']];
// pictures make every gap unambiguous (like the Heft: Text + Bild)
const CLOZE_IMG = [
  () => houseSVG({ labels: 'num', floors: [{ key: 'ss', rooms: ['buanderie'] }, { key: 'rez', rooms: ['cuisine', 'salon'] }, { key: 1, rooms: ['sdb', 'chambre'] }, { key: 2, rooms: ['toilettes', 'chambreAmis'] }, { key: 'grenier', rooms: ['grenier'] }], people: [{ who: 'lou', f: 2, c: 1, pos: .78 }, { who: 'cat', f: 4, dx: 70 }] }),
  null,
  () => roomSVG({ items: [{ o: 'pull', at: 'sur le lit' }, { o: 'livres', at: 'sur la table' }, { o: 'chat', at: 'sous le lit' }] }),
];
function clozeEx(i, R, typing, extra = {}) {
  const parts = CLOZE_HOUSE[i];
  const bank = typing ? null : [...parts.filter(p => typeof p !== 'string').map(p => p.g[0]), ...CLOZE_EXTRA[i].slice(0, 3)];
  const img = CLOZE_IMG[i] ? CLOZE_IMG[i]() : undefined;
  return { type: 'cloze', kicker: typing ? 'Lückentext · schreiben' : 'Lückentext', prompt: (typing ? 'Schreib die fehlenden Wörter in die Lücken.' : 'Setz die Wörter in die Lücken ein.') + (img ? ' Schau dazu das Bild an.' : ''), parts, bank, img, id: `cloze:${i}:${typing ? 't' : 'b'}`, ...extra };
}
function buildClozeHouse(R) {
  const fullText = (i) => CLOZE_HOUSE[i].map(p => typeof p === 'string' ? p : p.g[0]).join('');
  return [
    clozeEx(0, R, false), clozeEx(1, R, false),
    { ...clozeEx(0, R, true), kicker: 'Hören + schreiben', prompt: 'Hör zu und ergänze die Lücken.', audio: { text: fullText(0), voice: 'n' }, autoplay: true },
    clozeEx(2, R, false),
    { ...clozeEx(1, R, true), kicker: 'Hören + schreiben', prompt: 'Hör zu und ergänze die Lücken.', audio: { text: fullText(1), voice: 'n' } },
  ];
}

// ======================================================================
// PREMIER ÉTAGE builders (LZ2)
// ======================================================================
function buildOrdinals(R) {
  const out = [{ type: 'info', kicker: 'Merke dir', prompt: 'premier, deuxième, troisième …', html: `<h3>🔢 Ordnungszahlen</h3><p>1<sup>er</sup> <b>premier</b> · 2<sup>e</sup> (2<sup>ème</sup>) <b>deuxième</b> · 3<sup>e</sup> (3<sup>ème</sup>) <b>troisième</b> · 4<sup>e</sup> <b>quatrième</b> · 5<sup>e</sup> <b>cinquième</b></p><p>→ Lou est <b class="r">au</b> deuxième étage, <b class="b">à gauche</b> / <b class="b">au milieu</b> / <b class="b">à droite</b>.</p>`, img: miniHouse({ floor: 2, side: 'gauche' }), say: [{ text: 'premier, deuxième, troisième', voice: 'w' }, { text: 'Lou est au deuxième étage, à gauche.', voice: 'n' }], id: 'info:ord' },
    { type: 'match', kicker: 'Paare', prompt: 'Verbinde Zahl und Wort.', pairs: ORDINALS.slice(0, 5).map(o => ({ l: { t: o.fr, say: o.fr }, r: { t: o.short } })), id: 'match:ord' }];
  const sides = ['gauche', 'milieu', 'droite'], sideFr = { gauche: 'à gauche', milieu: 'au milieu', droite: 'à droite' };
  const fl = [[0, 'au rez-de-chaussée'], [1, 'au premier étage'], [2, 'au deuxième étage'], [3, 'au troisième étage']];
  const combos = R.shuffle(fl.flatMap(x => sides.map(sd => [x, sd])));
  for (let k = 0; k < 4; k++) {
    const [[f, ff], sd] = combos[k];
    const right = `Lou est ${ff}, ${sideFr[sd]}.`;
    const wrongs = R.shuffle([`Lou est ${fl[(f + 1) % 4][1]}, ${sideFr[sd]}.`, `Lou est ${ff}, ${sideFr[sides[(sides.indexOf(sd) + 1) % 3]]}.`, `Lou est ${fl[(f + 3) % 4][1]}, ${sideFr[sides[(sides.indexOf(sd) + 2) % 3]]}.`]).slice(0, 2);
    const opts = R.shuffle([right, ...wrongs]);
    out.push({ type: 'choice', kicker: 'Wo ist Lou?', prompt: 'Welcher Satz passt zum Bild?', img: miniHouse({ floor: f, side: sd, floors: 3 }), options: opts.map(t => ({ t })), answer: opts.indexOf(right), cols1: true, id: `ordc:${f}:${sd}` });
  }
  for (let k = 4; k < 7; k++) {
    let [[f, ff], sd] = combos[k]; if (f === 0) { f = 1; ff = fl[1][1]; }
    out.push({ type: 'build', kicker: 'Satz bauen', prompt: 'Wo ist Lou? Bau den Satz.', img: miniHouse({ floor: f, side: sd, floors: 3 }), answers: [`Lou est ${ff}, ${sideFr[sd]}.`], tokens: tok(`Lou est ${ff} ${sideFr[sd]}`), extra: R.sample(['le', 'premier', 'deuxième', 'troisième', 'gauche', 'droite', 'dans'].filter(x => !ff.includes(x) && !sideFr[sd].includes(x)), 2), sayAfter: false, id: `ordb:${f}:${sd}` });
  }
  R.sample(ORDINALS.slice(0, 4), 3).forEach(o => out.push({ type: 'type', kicker: 'Schreiben', prompt: 'Schreib die Zahl als Wort.', q: `le ${o.short} étage  (= der ${o.n}. Stock)`, pre: 'le', post: 'étage', answers: [`le ${o.fr} étage`], voiceAfter: 'w', sayAfter: false, single: true, id: 'ordt:' + o.n }));
  return out;
}
const FAMILY_CARD = () => ({ type: 'info', kicker: 'La famille de Lou', prompt: 'Das ist die Familie von Lou (Lou erzählt: «ma / mon …»)', heft: 'S. 49', html: `<h3>👪 Wer ist wer?</h3><div class="fam">${[['mamie', 'ma grand-mère', 'Mamie'], ['papi', 'mon grand-père', 'Papi'], ['maman', 'ma mère', 'Maman'], ['papa', 'mon père', 'Papa'], ['tonton', 'mon oncle', 'Tonton Jules'], ['lou', 'moi', 'Lou'], ['mia', 'ma sœur', 'Mia'], ['tom', 'mon frère', 'Tom'], ['robot', 'le robot', 'Bip'], ['cat', 'le chat', 'Minou']].map(([w, fr, n]) => `<div class="m">${charSVG(w)}${fr}<small>${n}</small></div>`).join('')}</div>`, id: 'info:fam' });
function buildQuiEstOu(R) {
  const out = [FAMILY_CARD(), { type: 'info', kicker: '2B · Qui est où ?', prompt: 'So beschreibst du, wo jemand ist', heft: 'S. 50', html: `<h3>🧩 Die Satzbausteine</h3><p><b>Ma grand-mère</b> est <b class="r">au troisième étage</b>, <b class="b">à droite</b>, <b class="g">dans la chambre</b>.</p><p>1. Stockwerk mit <b class="r">au</b> (nie «au le»!) · 2. Seite: <b class="b">à gauche / au milieu / à droite</b> · 3. Raum mit <b class="g">dans la / dans le</b></p><p>Achtung: <b>Ma</b> grand-mère, <b>ma</b> sœur, <b>ma</b> mère – <b>mon</b> père, <b>mon</b> frère, <b>mon</b> oncle.</p>`, img: houseSVG(S.FAMILY_HOUSE), say: [{ text: 'Ma grand-mère est au troisième étage, à droite, dans la chambre.', voice: 'k' }], id: 'info:2b' }];
  const W = R.shuffle(S.FAMILY_WHO.filter(w => !['lou', 'cat'].includes(w.who)));
  // tap: who is described?
  W.slice(0, 2).forEach(w => out.push({ type: 'sceneTap', kicker: 'Hören', prompt: 'Hör zu und tippe auf das richtige Zimmer.', audio: { text: w.s, voice: 'k' }, scene: FAMILY_SCENE, mode: 'rooms', targets: [w.room], sol: w.s, id: 'qeo:tap:' + w.who }));
  // build
  W.slice(2, 5).forEach(w => out.push({ type: 'build', kicker: '2B · Satz bauen', prompt: 'Lou erzählt: Wo ist …?', img: houseSVG(S.FAMILY_HOUSE), q: w.q, qSay: { text: w.q, voice: 'o' }, who: 'owl', answers: [w.s, ...(w.alts || [])], extra: R.sample(['le', 'à', 'droit', 'gauche', 'premier', 'deuxième', 'sous'].filter(x => !tok(w.s).includes(x)), 3), voiceAfter: 'k', id: 'qeo:b:' + w.who }));
  // type with prefix
  W.slice(5, 7).forEach(w => out.push({ type: 'type', kicker: '2B · Schreiben', prompt: 'Beantworte die Frage von Madame Chouette.', img: houseSVG(S.FAMILY_HOUSE), q: w.q, qSay: { text: w.q, voice: 'o' }, who: 'owl', pre: w.subj, answers: [w.s, ...(w.alts || [])], voiceAfter: 'k', id: 'qeo:t:' + w.who }));
  // random houses (unlimited variety, no audio)
  for (let k = 0; k < 2; k++) {
    const H = randomHouse(R); const f = R.pick(H.facts);
    out.push({ type: k ? 'type' : 'build', kicker: 'Neues Haus', prompt: 'Ein neues Haus! Schau genau und antworte für Lou.', img: houseSVG(H.cfg), q: `Où est ${f.subj.replace(/^Ma /, 'ta ').replace(/^Mon /, 'ton ')} ?`, pre: k ? f.subj : undefined, answers: [f.s, ...placeAnswers(f.subj, 'est', f.fl, f.sd, 'dans ' + f.room)], extra: k ? undefined : R.sample(['le', 'droit', 'premier', 'deuxième', 'troisième', 'gauche', 'milieu'].filter(x => !tok(f.s).includes(x)), 3), sayAfter: false, id: 'qeo:rnd' });
  }
  return out;
}
function buildPleinQuestions(R) {
  const out = [FAMILY_CARD(), { type: 'info', kicker: '2B · Plein de questions', prompt: 'Madame Chouette ist neugierig!', heft: 'S. 50/51', html: `<h3>🦉 Schau das Haus genau an</h3><p>Die Eule stellt viele Fragen zum Haus von Lou. Lies (oder hör) die Frage, schau ins Bild und antworte.</p><p><b>Combien</b> = wie viele · <b>Qui</b> = wer · <b>Où</b> = wo · <b>Qu'est-ce que</b> = was</p>`, img: houseSVG(S.FAMILY_HOUSE), id: 'info:plein' }];
  const Q = R.shuffle(S.FAMILY_QA);
  Q.slice(0, 5).forEach(q => { const opts = R.shuffle(q.ch); out.push({ type: 'choice', kicker: '2B · Fragen', prompt: 'Welche Antwort stimmt?', img: houseSVG(S.FAMILY_HOUSE), q: q.q, qSay: { text: q.q, voice: 'o' }, options: opts.map(t => ({ t })), answer: opts.indexOf(q.a), cols1: true, id: 'plein:c:' + q.q }); });
  Q.slice(5, 8).forEach(q => out.push({ type: 'build', kicker: '2B · Antwort bauen', prompt: 'Antworte mit einem ganzen Satz.', img: houseSVG(S.FAMILY_HOUSE), q: q.q, qSay: { text: q.q, voice: 'o' }, answers: [q.a, ...(q.alt || [])], extra: R.sample(['est', 'sont', 'dans', 'le', 'la', 'au', 'trois', 'deux'].filter(x => !tok(q.a).includes(x)), 2), voiceAfter: 'k', id: 'plein:b:' + q.q }));
  S.FAMILY_ROOMS.slice().sort(() => R() - .5).slice(0, 3).forEach(r => out.push({ type: 'type', kicker: '2B · Schreiben', prompt: 'Wo ist dieser Raum? Schreib einen ganzen Satz.', img: houseSVG(S.FAMILY_HOUSE), q: r.q, qSay: { text: r.q, voice: 'o' }, answers: [r.s, ...(r.alts || [])], voiceAfter: 'n', id: 'plein:t:' + r.q }));
  out.push({ type: 'type', kicker: '2B · Zählen', prompt: 'Zähle alle Räume im Haus (inkl. Sous-sol und Grenier).', img: houseSVG(S.FAMILY_HOUSE), q: 'Combien de pièces y a-t-il dans la maison ?', qSay: { text: 'Combien de pièces y a-t-il dans la maison ?', voice: 'o' }, pre: 'Il y a', post: 'pièces.', answers: ['Il y a treize pièces.', 'Il y a 13 pièces.'], single: true, sayAfter: false, id: 'plein:count' });
  return out;
}
const NUMW = NUMBERS.slice(1);
function buildEtToi(R) {
  const P = (re) => re; // stored as strings, compiled in typeBlock
  const out = [
    { type: 'info', kicker: '2C · Et toi ?', prompt: 'Madame Chouette will alles über dich wissen', heft: 'S. 51', html: `<h3>💬 So antwortest du</h3><p><b>Habites-tu dans un appartement ou dans une maison ?</b> → J'habite dans <b class="g">une maison</b> / dans <b class="g">un appartement</b>.</p><p><b>Il y a combien de pièces ?</b> → Il y a <b class="r">cinq</b> pièces.</p><p><b>Qui habite avec toi ?</b> → J'habite avec <b class="b">ma</b> mère, <b class="b">mon</b> père et <b class="b">mon</b> frère.</p><p><b>Ta chambre est à quel étage ?</b> → <b class="b">Ma</b> chambre est <b class="r">au</b> premier étage.</p>`, img: charSVG('owl', { pose: 'wave' }), id: 'info:ettoi' },
    { type: 'info', kicker: 'Merke dir', prompt: 'ma · mon · mes – ta · ton · tes', html: `<h3>👪 Wem gehört es?</h3><p><b class="r">ma</b> mère, <b class="r">ma</b> sœur, <b class="r">ma</b> chambre (weiblich)</p><p><b class="b">mon</b> père, <b class="b">mon</b> frère (männlich) – und vor Vokal: <b class="b">mon</b> amie, <b class="b">mon</b> école</p><p><b class="g">mes</b> parents, <b class="g">mes</b> grands-parents (Mehrzahl)</p><p>Die Eule fragt mit <b>ta / ton</b> → du antwortest mit <b>ma / mon</b>!</p>`, id: 'info:poss' },
  ];
  const traps = [
    { q: 'Habites-tu dans un appartement ou dans une maison ?', a: "J'habite dans une maison.", w: ['Je habite dans une maison.', "J'habite dans un maison.", 'Tu habites dans une maison.'] },
    { q: 'Qui habite avec toi ?', a: "J'habite avec ma mère et mon frère.", w: ["J'habite avec mon mère et ma frère.", "J'habite avec mo mère et mon frères.", 'Ma mère et mon frère habite.'] },
    { q: 'Ta chambre est à quel étage ?', a: 'Ma chambre est au premier étage.', w: ['Ta chambre est au premier étage.', 'Ma chambre est au le premier étage.', 'Ma chambre est dans le premier étage.'] },
    { q: 'Il y a combien de pièces ?', a: 'Il y a six pièces.', w: ['Il y a six pièce.', 'Il y a sixième pièces.', 'Il y a six chambres pièces.'] },
  ];
  R.shuffle(traps).forEach(t => { const opts = R.shuffle([t.a, ...R.sample(t.w, 2)]); out.push({ type: 'choice', kicker: '2C · Fehler-Detektiv', prompt: 'Welche Antwort ist ganz richtig?', who: 'owl', q: t.q, qSay: { text: t.q, voice: 'o' }, options: opts.map(x => ({ t: x })), answer: opts.indexOf(t.a), cols1: true, tip: 'Achte auf: j\'habite (nicht «je habite»), ma/mon, au + Stockwerk, un appartement / une maison.', id: 'ettoi:c:' + t.q }); });
  const de = [
    { de: 'Ich wohne mit meiner Mutter, meinem Vater und meinem Bruder.', a: "J'habite avec ma mère, mon père et mon frère." },
    { de: 'Mein Zimmer ist im zweiten Stock.', a: 'Ma chambre est au deuxième étage.' },
    { de: 'Ich wohne in einer Wohnung.', a: "J'habite dans un appartement." },
    { de: 'Ich wohne mit meinen Eltern und meiner Schwester.', a: "J'habite avec mes parents et ma sœur." },
    { de: 'Es hat sieben Zimmer.', a: 'Il y a sept pièces.' },
  ];
  R.sample(de, 3).forEach(d => out.push({ type: 'build', kicker: '2C · Satz bauen', prompt: 'Bau den Satz auf Französisch.', q: d.de, answers: [d.a], extra: R.sample(['mon', 'ma', 'au', 'le', 'une', 'je'].filter(x => !tok(d.a).includes(x)), 2), voiceAfter: 'k', id: 'ettoi:b:' + d.a }));
  // personal answers (checked by pattern)
  out.push({ type: 'type', kicker: '2C · Deine Antwort', prompt: 'Antworte über DICH (ganzer Satz).', who: 'owl', q: 'Et toi ? Habites-tu dans un appartement ou dans une maison ?', qSay: { text: 'Et toi ? Habites-tu dans un appartement ou dans une maison ?', voice: 'o' }, answers: ["J'habite dans une maison.", "J'habite dans un appartement."], patterns: [P("^j'habite dans (une (grande |petite |belle |jolie )?maison|un (grand |petit |bel |joli )?appartement)( (au|à|a) .*)?$")], allowChips: false, sayAfter: false, id: 'ettoi:p1' });
  out.push({ type: 'type', kicker: '2C · Deine Antwort', prompt: 'Wie viele Zimmer hat dein Zuhause? Schreib die Zahl als Wort.', who: 'owl', q: 'Il y a combien de pièces ?', qSay: { text: 'Il y a combien de pièces ?', voice: 'o' }, pre: 'Il y a', post: 'pièces.', answers: ['Il y a cinq pièces.'], patterns: [P("^il y a (un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|dix-sept|dix-huit|dix-neuf|vingt) pièces?$")], allowChips: false, single: true, sayAfter: false, id: 'ettoi:p2' });
  out.push({ type: 'type', kicker: '2C · Deine Antwort', prompt: 'Wer wohnt mit dir? (ma / mon / mes!)', who: 'owl', q: 'Qui habite avec toi ?', qSay: { text: 'Qui habite avec toi ?', voice: 'o' }, answers: ["J'habite avec ma mère, mon père et mon frère."], patterns: [P("^(j'habite avec )?(((ma|mon|mes) (petite |petit |grande |grand |deux |trois |quatre )?(mère|maman|sœur|soeur|sœurs|soeurs|grand-mère|grand mère|mamie|tante|cousine|copine|famille|belle-mère|demi-sœur|demi-soeur|amie|père|papa|frère|frères|grand-père|grand père|papi|oncle|cousin|chat|chats|chien|chiens|hamster|lapin|poisson|copain|beau-père|demi-frère|ami|parents|grands-parents|frères et sœurs|frères et soeurs|animaux))( et |, | )?)+$")], allowChips: false, id: 'ettoi:p3', sayAfter: false });
  out.push({ type: 'type', kicker: '2C · Deine Antwort', prompt: 'In welchem Stock ist dein Zimmer?', who: 'owl', q: 'Ta chambre est à quel étage ?', qSay: { text: 'Ta chambre est à quel étage ?', voice: 'o' }, pre: 'Ma chambre est', answers: ['Ma chambre est au premier étage.'], patterns: [P("^ma chambre est au (rez-de-chaussée|sous-sol|grenier|(premier|deuxième|troisième|quatrième|cinquième|sixième|septième|huitième|neuvième|dixième) étage)(,? (à gauche|à droite|au milieu))?$")], allowChips: false, sayAfter: false, id: 'ettoi:p4' });
  return out;
}
function buildPointRouge(R) {
  const out = [];
  const H = { labels: false, floors: [{ key: 'ss', rooms: ['garage', 'buanderie'] }, { key: 'rez', rooms: ['cuisine', 'salleManger', 'salon'] }, { key: 1, rooms: ['chambre', 'sdb', 'chambreAmis'] }] };
  const fl = { 0: 'au sous-sol', 1: 'au rez-de-chaussée', 2: 'au premier étage' };
  const cells = [];
  H.floors.forEach((f, fi) => f.rooms.forEach((r, c) => cells.push({ fi, c, r })));
  R.sample(cells, 4).forEach(cell => {
    const name = ROOMS[cell.r].name; const art = cap(name);
    const roomOpts = R.shuffle([name, ...R.sample(cells.filter(x => x.r !== cell.r).map(x => ROOMS[x.r].name), 2)]).map(cap);
    out.push({ type: 'build', kicker: 'LMVZ · Point rouge', prompt: 'Wo ist der rote Punkt? Vervollständige den Satz.', img: houseSVG({ ...H, dot: [cell.fi, cell.c] }), answers: [`${art} est ${fl[cell.fi]}.`, ...(/^les /.test(name) ? [`${art} sont ${fl[cell.fi]}.`] : [])], tokens: [art, /^les /.test(name) ? 'sont' : 'est', ...tok(fl[cell.fi])], extra: [...roomOpts.filter(x => x !== art), ...tok(fl[(cell.fi + 1) % 3]).slice(-2)], sayAfter: false, id: 'dot:' + cell.r });
  });
  S.FAMILY_ROOMS.slice().sort(() => R() - .5).slice(0, 3).forEach(r => out.push({ type: 'sceneTap', kicker: 'Hören', prompt: 'Hör zu und tippe auf den Raum.', audio: { text: r.s, voice: 'n' }, scene: FAMILY_SCENE, mode: 'rooms', targets: [r.room], sol: r.s, id: 'dottap:' + r.room }));
  return R.shuffle(out);
}

// ======================================================================
// DEUXIÈME ÉTAGE builders (LZ3)
// ======================================================================
const ZOOM_F = ['lit', 'table', 'chaise', 'armoire', 'commode', 'etagere', 'fauteuil', 'tapis', 'plante', 'affiche', 'lampe', 'porte', 'fenetre', 'rideau', 'corbeille'];
function buildZoom(R) {
  const out = [{ type: 'info', kicker: '3A · Zoom sur la chambre', prompt: 'Quel désordre! – Das ist Lous Zimmer', heft: 'S. 52', html: `<h3>🛏️ Lous Zimmer</h3><p>Im Zimmer von Lou ist alles durcheinander. Lerne zuerst die <b>Möbel</b> kennen. Tippe auf die Lautsprecher!</p>`, img: roomSVG(S.ROOM_A), say: [{ text: 'le lit', voice: 'w' }, { text: "l'armoire", voice: 'w' }, { text: 'la commode', voice: 'w' }], id: 'info:zoom' }];
  R.sample(ZOOM_F, 5).forEach(f => out.push({ type: 'sceneTap', kicker: '3A · Möbel finden', prompt: 'Tippe im Bild auf:', q: FURNITURE[f].name, audio: { text: FURNITURE[f].name, voice: 'w' }, scene: { kind: 'room', cfg: S.ROOM_A }, mode: 'furniture', targets: [f], sol: FURNITURE[f].name, id: 'zoom:' + f }));
  R.sample(Object.keys(OBJ).filter(o => o !== 'chat' && o !== 'guitare' && o !== 'ballon' && o !== 'pomme' && o !== 'livres' && o !== 'parapluie'), 3).forEach(o => out.push({ type: 'sceneTap', kicker: 'Hören', prompt: 'Hör zu und tippe auf den Gegenstand.', audio: { text: OBJ[o].name, voice: 'w' }, scene: { kind: 'room', cfg: S.ROOM_A }, mode: 'objects', targets: [o], sol: OBJ[o].name, id: 'zoomo:' + o }));
  R.sample(ZOOM_F, 3).forEach(f => out.push({ type: 'type', kicker: 'Schreiben', prompt: 'Wie heisst dieses Möbel? (mit Artikel)', img: furnIconSafe(f), answers: [FURNITURE[f].name, ...(FURNITURE[f].alt || []), FURNITURE[f].name.replace(/^l'/, f === 'etagere' || f === 'armoire' || f === 'affiche' ? 'une ' : "l'")], voiceAfter: 'w', id: 'zoomt:' + f }));
  return out;
}
function furnIconSafe(f) { const r = FURNITURE[f].rect; return `<svg viewBox="${r[0] - 20} ${r[1] - 20} ${r[2] + 40} ${r[3] + 40}" class="pic">${roomSVG({}).match(/<defs>[\s\S]*?<\/defs>/)[0]}${FURNITURE[f].draw()}</svg>`; }

function buildPrep(R) {
  const out = [{ type: 'info', kicker: 'Merke dir', prompt: 'à droite de … – aber: du!', heft: 'S. 52', html: `<h3>🧭 de + Artikel</h3><p>à droite (de + <b>la</b>) = à droite <b class="g">de la</b> table</p><p>à droite (de + <b>le</b>) = à droite <b class="r">du</b> piano &nbsp;(nie «de le»!)</p><p>à droite (de + <b>l'</b>) = à droite <b class="b">de l'</b>étagère</p><p>sous · sur · dans · devant · derrière · entre … et · à gauche de · à droite de</p>`, id: 'info:prep' }];
  const preps = ['sur', 'sous', 'dans', 'devant', 'derrière', 'entre', 'à gauche de', 'à droite de'];
  R.sample(preps, 4).forEach(p => { const opts = R.shuffle([p, ...R.sample(preps.filter(x => x !== p), 3)]); out.push({ type: 'choice', kicker: 'Wo ist der Ball?', prompt: 'Le ballon est …', img: prepIcon(p), options: opts.map(t => ({ t: t === 'entre' ? 'entre … et …' : t, say: t, voice: 'w' })), answer: opts.indexOf(p), id: 'prepc:' + p }); });
  const dd = [['le lit', 'du lit'], ['la table', 'de la table'], ["l'armoire", "de l'armoire"], ['le fauteuil', 'du fauteuil'], ['la commode', 'de la commode'], ["l'étagère", "de l'étagère"], ['le tapis', 'du tapis'], ['la porte', 'de la porte']];
  R.sample(dd, 4).forEach(([np, de]) => {
    const noun = np.replace(/^(le |la |l')/, '');
    const vow = /^l'/.test(np);
    const opts = R.shuffle([de, ...(de.startsWith('du') ? ['de le ' + noun, 'de la ' + noun] : vow ? ['du ' + noun, 'de la ' + noun] : ['du ' + noun, 'de le ' + noun])]); out.push({ type: 'choice', kicker: 'du · de la · de l\'', prompt: 'Was ist richtig?', q: `à gauche ___ (${np})`, options: opts.map(t => ({ t: 'à gauche ' + t })), answer: opts.indexOf(de), id: 'deart:' + np }); });
  // where is the cat? pick sentence (LMVZ LZ3)
  const spots = ['sous la table', 'sur le lit', 'devant la porte', "dans l'armoire", 'sur le fauteuil', 'sur la commode', 'sous la chaise', 'sur le tapis'];
  R.sample(spots, 3).forEach(sp => { const opts = R.shuffle([sp, ...R.sample(spots.filter(x => x !== sp), 2)]); out.push({ type: 'choice', kicker: 'LMVZ · Bild & Satz', prompt: 'Schau das Bild an und wähle den passenden Satz.', img: roomSVG({ items: [{ o: 'chat', at: sp }] }), options: opts.map(t => ({ t: `Le chat est ${t}.` })), answer: opts.indexOf(sp), cols1: true, id: 'chat:' + sp }); });
  const items2 = [['pull', "dans l'armoire"], ['ballon', 'sous la table'], ['ski', 'à droite du lit'], ['regle', 'sur la table'], ['lunettes', 'sous le fauteuil']];
  R.sample(items2, 2).forEach(([o, at]) => out.push({ type: 'build', kicker: 'Satz bauen', prompt: 'Wo ist es? Bau den Satz.', img: roomSVG({ items: [{ o, at }] }), answers: [S.objSentence(o, at)], extra: R.sample(['sur', 'sous', 'devant', 'de', 'le', 'la'].filter(x => !tok(S.objSentence(o, at)).includes(x)), 2), sayAfter: false, id: 'prepb:' + o }));
  const dq = R.pick([['Le ski est à droite', 'lit.', 'du'], ['Le chat est à gauche', 'table.', 'de la'], ['Le parapluie est à droite', 'armoire.', "de l'"], ['La plante est à gauche', 'lit.', 'du'], ["L'armoire est à droite", 'commode.', 'de la']]);
  out.push({ type: 'type', kicker: 'Schreiben', prompt: "Ergänze mit «du», «de la» oder «de l'».", q: `${dq[0]} ___ ${dq[1]}`, pre: dq[0], post: dq[1], answers: [`${dq[0]} ${dq[2]} ${dq[1]}`.replace("l' ", "l'").replace("devant l'", "devant l'")], single: true, sayAfter: false, id: 'prept:du' });
  return out;
}
function vfExercises(R, set, room, n, kicker = '3B · Vrai ou faux ?') {
  const items = S.vfItems(set, room);
  const pick = R.sample(items.map((x, i) => ({ ...x, i })), n).sort((a, b) => a.i - b.i);
  const words = ['sur', 'sous', 'dans', 'devant', 'derrière', 'à', 'gauche', 'droite', 'de', 'du', 'la', 'le', "l'armoire", 'table', 'lit', 'fauteuil', 'commode', 'chaise', 'plante'];
  return pick.map((it, k) => ({
    type: 'vraiFaux', kicker, prompt: 'Écoute: vrai ou faux? Wenn falsch: schreib die Korrektur.', heft: 'S. 53', num: it.i + 1, objLabel: it.label,
    scene: { kind: 'room', cfg: room }, audio: { text: it.s, voice: 'n' }, truth: it.truth, realAt: it.realAt, realSentence: it.realS,
    realRect: it.realRect || null,
    fix: { answers: S.fixAnswers(it), extra: R.sample(words.filter(w => !(it.real || it.realS).includes(w)), 3) }, id: 'vf:' + it.s,
  }));
}
function buildVraiFaux(R) {
  const useA = R() < .6;
  return [
    { type: 'info', kicker: '3B · Vrai ou faux ?', prompt: 'So geht die Hörübung (wie in der Prüfung!)', heft: 'S. 53', html: `<h3>🎧 a) schauen · b) hören · c) korrigieren</h3><p>a) Schau das Zimmer genau an: Wo sind die Gegenstände?</p><p>b) Hör den Satz: <b>vrai</b> (richtig) oder <b>faux</b> (falsch)?</p><p>c) Bei <b>faux</b> schreibst du, wo der Gegenstand <b>wirklich</b> ist, z. B. <i>sur la corbeille à papier</i>.</p>`, img: roomSVG(useA ? S.ROOM_A : S.ROOM_B), id: 'info:vf' },
    ...vfExercises(R, useA ? S.VF_A : S.VF_B, useA ? S.ROOM_A : S.ROOM_B, 8),
  ];
}
function buildDesordre(R) {
  // A: tidy-ish room, B: Lou "tidied up" -> objects moved
  const base = [['casquette', 'sur la corbeille à papier', 'sur la lampe'], ['violon', "à droite de l'affiche", 'sur le fauteuil'], ['ski', 'à droite du lit', 'devant la porte'], ['ballon', 'sous la table', 'devant le fauteuil'],
    ['pull', "dans l'armoire", 'sur la chaise'], ['livres', "en bas de l'étagère", "en haut de l'étagère"], ['chat', 'sur le tapis', "sur l'armoire"], ['pomme', 'sur la commode', 'devant la fenêtre'],
    ['lunettes', 'sous le fauteuil', 'sous le lit'], ['parapluie', "devant l'armoire", 'dans la corbeille à papier'], ['teeshirt', 'sur le lit', 'dans la plante'], ['regle', 'sur la table', 'sous la chaise']];
  const moved = R.sample(base, 7);
  const movedSet = new Set(moved.map(m => m[0]));
  const A = { items: base.map(([o, a]) => ({ o, at: a })) };
  const B = { items: base.map(([o, a, b]) => ({ o, at: movedSet.has(o) ? b : a })) };
  const diffs = moved.map(([o, a, b]) => ({ o, rect: LOC[b].rect, rects: [LOC[b].rect, LOC[a].rect] }));
  const out = [{ type: 'differences', kicker: '3C · Quel désordre !', prompt: 'Lou hat aufgeräumt … oder? Finde die Unterschiede in Bild B.', heft: 'S. 54', a: A, b: B, diffs, id: 'diff' }];
  R.sample(moved, 4).forEach(([o, a, b]) => out.push({ type: 'build', kicker: '3C · Beschreiben', prompt: `Wo ist ${OBJ[o].name} jetzt (in Bild B)?`, img: roomSVG(B), answers: [S.objSentence(o, b)], extra: R.sample(['sur', 'sous', 'dans', 'devant', 'le', 'la', 'de'].filter(x => !tok(S.objSentence(o, b)).includes(x)), 3), sayAfter: false, id: 'diffb:' + o + b }));
  return out;
}
const PUZZLES = [
  { clues: ["Les trois appartements ont deux, trois et cinq pièces.", "Le chat n'habite pas en bas.", "Léon Weber habite au milieu.", "L'appartement avec cinq pièces est en haut.", "La famille avec la terrasse a un chien.", "Le chat de Nina Favre habite au-dessus du lapin.", "L'appartement de Léon n'a pas deux pièces."],
    fields: { nom: ['Nina Favre', 'Léon Weber', 'Famille Rossi'], pieces: ['deux', 'trois', 'cinq'], animal: ['chat', 'chien', 'lapin'] }, terrace: 2,
    solution: [{ nom: 'Nina Favre', pieces: 'cinq', animal: 'chat' }, { nom: 'Léon Weber', pieces: 'trois', animal: 'lapin' }, { nom: 'Famille Rossi', pieces: 'deux', animal: 'chien' }],
    explain: 'cinq = oben. Léon in der Mitte, nicht deux → trois → unten deux. Terrasse unten → Hund unten. Katze nicht unten und über dem Hasen → Katze oben (Nina), Hase in der Mitte (Léon), Rossi unten.' },
  { clues: ["Les trois appartements ont cinq, quatre et trois pièces.", "L'appartement avec trois pièces est en haut.", "Le grand appartement avec cinq pièces est au milieu.", "La famille avec la terrasse a un poisson.", "Le chien de Luca Meier habite sous le chat.", "La famille Martin aime beaucoup son poisson."],
    fields: { nom: ['Sofia Rossi', 'Luca Meier', 'Famille Martin'], pieces: ['trois', 'quatre', 'cinq'], animal: ['chat', 'chien', 'poisson'] }, terrace: 2,
    solution: [{ nom: 'Sofia Rossi', pieces: 'trois', animal: 'chat' }, { nom: 'Luca Meier', pieces: 'cinq', animal: 'chien' }, { nom: 'Famille Martin', pieces: 'quatre', animal: 'poisson' }],
    explain: 'Start: «trois pièces en haut», «cinq au milieu» → unten bleiben quatre. Die Terrasse ist unten → dort wohnt der Fisch → Famille Martin. Luca hat den Hund, die Katze wohnt darüber → Sofia oben.' },
  { clues: ["L'appartement avec six pièces est en bas.", "Le petit appartement (deux pièces) n'est pas en haut.", "Zoé Dubois habite dans l'appartement avec quatre pièces.", "Le hamster habite au milieu.", "La famille Keller n'habite pas en haut et n'a pas de hamster.", "Le perroquet de Zoé parle français!"],
    fields: { nom: ['Zoé Dubois', 'Marco Silva', 'Famille Keller'], pieces: ['deux', 'quatre', 'six'], animal: ['lapin', 'hamster', 'perroquet'] }, terrace: null,
    solution: [{ nom: 'Zoé Dubois', pieces: 'quatre', animal: 'perroquet' }, { nom: 'Marco Silva', pieces: 'deux', animal: 'hamster' }, { nom: 'Famille Keller', pieces: 'six', animal: 'lapin' }],
    explain: 'six = unten, deux nicht oben → deux in der Mitte, quatre oben = Zoé (mit Papagei). Keller nicht oben und ohne Hamster → unten mit dem Hasen. Marco: Mitte, Hamster.' },
];
function buildLogical(R) {
  return [{ type: 'info', kicker: '3D · Qui habite où ?', prompt: 'Logical – so knackst du es', heft: 'S. 55', html: `<h3>🧠 Strategie</h3><p>1. Beginne mit den <b>sicheren</b> Hinweisen (en haut / au milieu / en bas).</p><p>2. Schreib sofort ins Haus, was du weisst.</p><p>3. Benutze das <b>Ausschlussverfahren</b>. <i>sous</i> = darunter, <i>au-dessus</i> = darüber, <i>n'… pas</i> = nicht!</p><p class="small-muted">Tiere: chat = Katze · chien = Hund · poisson = Fisch · lapin = Hase · hamster = Hamster · perroquet = Papagei</p>`, id: 'info:logic' },
    ...R.shuffle(PUZZLES).map((p, i) => ({ type: 'logical', kicker: '3D · Logical', prompt: 'Lis les informations et résous le logical.', heft: 'S. 55', ...p, id: 'logic:' + i }))];
}
function buildListenRoom(R) {
  const out = [];
  R.sample(S.LISTEN_PLACES, 4).forEach(p => out.push({ type: 'sceneTap', kicker: 'LMVZ · Hören', prompt: 'Hör dir die Beschreibung an und wähle den Ort im Bild.', audio: { text: cap(p) + '.', voice: 'n' }, scene: { kind: 'room', cfg: S.ROOM_A }, mode: 'locations', targets: [p], sol: cap(p) + '.', id: 'lr:' + p }));
  R.sample(S.LISTEN_DOUBLE, 2).forEach(([a, b]) => out.push({ type: 'sceneTap', kicker: 'LMVZ plus · Hören', prompt: 'Hör dir die Beschreibungen an und wähle die beiden Orte.', audio: { text: S.doubleSentence(a, b), voice: 'n' }, scene: { kind: 'room', cfg: S.ROOM_A }, mode: 'locations', need: 2, targets: [a, b], sol: S.doubleSentence(a, b), id: 'lr2:' + a + b }));
  R.sample(S.MULTI_Q, 2).forEach(q => { const items = S.ROOM_A.items; const want = q.opts.filter(o => q.locs.includes((items.find(x => x.o === o) || {}).at)); out.push({ type: 'multi', kicker: 'LMVZ plus · Hören', prompt: 'Hör dir den Satz an und beantworte die Frage.', img: roomSVG(S.ROOM_A), audio: { text: S.multiQuestion(q), voice: 'n' }, options: q.opts.map(o => ({ t: OBJ[o].name })), answer: want.map(o => q.opts.indexOf(o)), id: 'lrm:' + q.locs.join() }); });
  return R.shuffle(out);
}

// ======================================================================
// TROISIÈME ÉTAGE builders (S – Verneinung)
// ======================================================================
// [Befehl, Antwort (1. Person), 3. Person (was Lou nicht macht), weitere akzeptierte Antworten]
export const ORDERS = [
  ['Va au lit.', 'Non, je ne vais pas au lit!', 'Il ne va pas au lit.'],
  ['Dessine ta maison.', 'Non, je ne dessine pas ma maison!', 'Il ne dessine pas sa maison.'],
  ['Fais les devoirs.', 'Non, je ne fais pas les devoirs!', 'Il ne fait pas les devoirs.'],
  ['Écoute la musique.', "Non, je n'écoute pas la musique!", "Il n'écoute pas la musique."],
  ['Coupe la pomme.', 'Non, je ne coupe pas la pomme!', 'Il ne coupe pas la pomme.'],
  ['Range les livres.', 'Non, je ne range pas les livres!', 'Il ne range pas les livres.'],
  ['Lis le poème.', 'Non, je ne lis pas le poème!', 'Il ne lit pas le poème.'],
  ['Mange le poisson.', 'Non, je ne mange pas le poisson!', 'Il ne mange pas le poisson.', ["Non, je n'aime pas le poisson!"]],
  ['Range ta chambre.', 'Non, je ne range pas ma chambre!', 'Il ne range pas sa chambre.'],
  ['Ouvre la fenêtre.', "Non, je n'ouvre pas la fenêtre!", "Il n'ouvre pas la fenêtre."],
  ['Ferme la porte.', 'Non, je ne ferme pas la porte!', 'Il ne ferme pas la porte.'],
  ['Aide ta sœur.', "Non, je n'aide pas ma sœur!", "Il n'aide pas sa sœur."],
  ['Prends ton pull.', 'Non, je ne prends pas mon pull!', 'Il ne prend pas son pull.'],
  ['Mets ta veste.', 'Non, je ne mets pas ma veste!', 'Il ne met pas sa veste.'],
  ['Regarde la carte.', 'Non, je ne regarde pas la carte!', 'Il ne regarde pas la carte.'],
];
const ansOf = (o) => [o[1], ...(o[3] || [])];
function negExtra(R, a, o) {
  const t = tok(a), ex = [];
  ex.push(t.includes("n'") ? 'ne' : "n'");
  if (/ ta | ton /.test(' ' + o[0] + ' ')) ex.push(t.includes('ma') ? 'ta' : 'ton');
  ex.push(R.pick(['pas', 'je', 'il'].filter(x => !t.includes(x) || x === 'pas')));
  return [...new Set(ex)];
}
const NEG_RULE = { type: 'info', kicker: 'SA · Merkmale der Verneinung', prompt: 'So sagt Lou «nein»', heft: 'S. 58', html: `<h3>🚫 ne … pas</h3><p>1. Die Verneinung hat <b>zwei Teile</b>: <b class="r">ne</b> … <b class="r">pas</b>.</p><p>2. Sie stehen <b>um das Verb herum</b>: je <b class="r">ne</b> <u>range</u> <b class="r">pas</b> les livres.</p><p>3. Vor <b>Vokal</b> oder <b>stummem h</b>: <b class="r">n'</b> → je <b class="r">n'</b>écoute pas, il <b class="r">n'</b>habite pas.</p><p>4. Aus <b>ta / ton</b> im Befehl wird <b>ma / mon</b> in der Antwort.</p>`, img: charSVG('lou', { mood: 'sad' }), id: 'info:neg' };
function buildDitNon(R) {
  const out = [NEG_RULE];
  const picked = R.sample(ORDERS, 9);
  picked.slice(0, 5).forEach(o => out.push({ type: 'build', kicker: 'SA · Lou dit non', prompt: 'Madame Chouette gibt Befehle. Lou sagt NEIN!', who: 'owl', q: o[0], qSay: { text: o[0], voice: 'o' }, answers: ansOf(o), extra: negExtra(R, o[1], o), voiceAfter: 'k', id: 'non:b:' + o[0] }));
  picked.slice(5, 9).forEach(o => out.push({ type: 'type', kicker: 'SA · Non, je …!', prompt: 'Ergänze Lous Antwort.', who: 'owl', q: o[0], qSay: { text: o[0], voice: 'o' }, pre: 'Non, je', answers: ansOf(o), voiceAfter: 'k', id: 'non:t:' + o[0] }));
  R.sample(ORDERS, 2).forEach(o => out.push({ type: 'build', kicker: 'SC · Il ne … pas', prompt: 'Was macht Lou NICHT? Bau einen Satz mit «Il …».', q: o[0], answers: [o[2]], extra: ['je', o[2].includes("n'") ? 'ne' : "n'"], voiceAfter: 'n', id: 'non:il:' + o[0] }));
  out.push({ type: 'type', kicker: 'Wie im Heft (S. 59)', prompt: 'Lou mag keinen Fisch. Ergänze: «Non, je … aime …»', who: 'owl', q: 'Mange le poisson.', qSay: { text: 'Mange le poisson.', voice: 'o' }, pre: 'Non, je', answers: ["Non, je n'aime pas le poisson!"], voiceAfter: 'k', id: 'non:aime' });
  return out;
}
function buildDitNonWrite(R) {
  const out = [{ type: 'info', kicker: 'Zut, tellement d’ordres !', prompt: 'Lou kann seine Sätze nicht beenden. Hilf ihm!', heft: 'S. 59', html: `<h3>✍️ Wie in der Prüfung</h3><p>Schreib den <b>ganzen</b> Satz: <b>Non, je ne</b> + Verb + <b>pas</b> + Rest!</p><p>Vergiss <b>pas</b> nicht und denk an <b>n'</b> vor Vokal. Aus <b>ta/ton</b> wird <b>ma/mon</b>.</p>`, img: charSVG('owl', { pose: 'wave' }), id: 'info:zut' }];
  R.sample(ORDERS, 6).forEach(o => out.push({ type: 'type', kicker: 'SA · Schreiben', prompt: 'Schreib Lous Antwort – den ganzen Satz.', who: 'owl', q: o[0], qSay: { text: o[0], voice: 'o' }, answers: ansOf(o), voiceAfter: 'k', id: 'non:w:' + o[0] }));
  out.push({ type: 'choice', kicker: 'Fehler-Detektiv', prompt: 'Welche Antwort ist richtig?', who: 'owl', q: 'Mange le poisson.', qSay: { text: 'Mange le poisson.', voice: 'o' }, options: [{ t: 'Non, je ne mange pas le poisson!' }, { t: 'Non, je mange ne pas le poisson!' }, { t: 'Non, je ne mange le poisson!' }], answer: 0, tip: '«pas» steht direkt nach dem Verb – und es darf nicht fehlen!', id: 'non:det1' });
  out.push({ type: 'choice', kicker: 'Fehler-Detektiv', prompt: 'Welche Antwort ist richtig?', who: 'owl', q: 'Écoute la musique.', qSay: { text: 'Écoute la musique.', voice: 'o' }, options: [{ t: "Non, je n'écoute pas la musique!" }, { t: 'Non, je ne écoute pas la musique!' }, { t: "Non, je n'écoute la musique pas!" }], answer: 0, tip: "Vor Vokal: n' – und pas direkt nach dem Verb.", id: 'non:det2' });
  out.push({ type: 'choice', kicker: 'Fehler-Detektiv', prompt: 'Welche Antwort ist richtig?', who: 'owl', q: 'Range ta chambre.', qSay: { text: 'Range ta chambre.', voice: 'o' }, options: [{ t: 'Non, je ne range pas ma chambre!' }, { t: 'Non, je ne range pas ta chambre!' }, { t: 'Non, je range pas ma chambre!' }], answer: 0, tip: 'Aus «ta chambre» wird «ma chambre». Und ne gehört dazu!', id: 'non:det3' });
  return out;
}
const SLOT_SENT = [
  { w: ['Zut,', 'il', 'aime', 'la', 'gym', '.'], a: { 2: "n'", 3: 'pas' } },
  { w: ['Camille', 'fait', 'ses', 'devoirs', 'sous', 'un', 'arbre', '.'], a: { 1: 'ne', 2: 'pas' } },
  { w: ['Lou', 'aime', 'les', 'carottes', '.'], a: { 1: "n'", 2: 'pas' } },
  { w: ['La', 'cousine', 'de', 'Lou', "s'", 'appelle', 'Clothilde', '.'], a: { 4: 'ne', 6: 'pas' } },
  { w: ['Lou', 'est', 'dans', 'la', 'cuisine', '.'], a: { 1: "n'", 2: 'pas' } },
  { w: ['Mia', 'habite', 'au', 'premier', 'étage', '.'], a: { 1: "n'", 2: 'pas' } },
  { w: ['Papa', 'travaille', 'à', 'la', 'pharmacie', '.'], a: { 1: 'ne', 2: 'pas' } },
  { w: ['Le', 'chat', 'dort', 'sous', 'le', 'lit', '.'], a: { 2: 'ne', 3: 'pas' } },
  { w: ['Je', 'range', 'ma', 'chambre', '.'], a: { 1: 'ne', 2: 'pas' } },
  { w: ['Tom', 'écoute', 'la', 'musique', '.'], a: { 1: "n'", 2: 'pas' } },
];
function buildSlots(R) {
  const out = [NEG_RULE];
  R.sample(SLOT_SENT, 6).forEach((s, i) => out.push({ type: 'slots', kicker: 'LMVZ · Verneine den Satz', prompt: 'Platziere ne / n\' / pas an der richtigen Stelle.', words: s.w, answer: s.a, chips: ['ne', "n'", 'pas'], id: 'slot:' + s.w.join(' ') }));
  out.push({ type: 'choice', kicker: 'Merkmale', prompt: 'Aus welchen Teilen besteht die französische Verneinung?', tip: 'ne (n\') … pas – zwei Teile!', options: [{ t: 'aus «ne» und «pas»' }, { t: 'nur aus «pas»' }, { t: 'aus «non» und «nicht»' }], answer: 0, id: 'neg:m1' });
  out.push({ type: 'choice', kicker: 'Merkmale', prompt: 'Wo stehen die Teile?', options: [{ t: '«ne» vor dem Verb, «pas» nach dem Verb' }, { t: 'beide vor dem Verb' }, { t: 'beide am Satzende' }], answer: 0, id: 'neg:m2' });
  out.push({ type: 'choice', kicker: 'Merkmale', prompt: 'Wann schreibst du «n\'» statt «ne»?', options: [{ t: 'vor einem Vokal oder stummen h' }, { t: 'immer am Satzanfang' }, { t: 'wenn das Verb lang ist' }], answer: 0, id: 'neg:m3' });
  return out;
}
function buildNegListen(R) {
  const out = [];
  const scenes = ALL_TILES.filter(t => t.kind === 'scene' && !['dans la chambre', 'dans le salon'].includes(t.place));
  R.sample(scenes, 6).forEach(t => {
    const twin = scenes.find(x => x.place === t.place && x.neg !== t.neg);
    const noun = t.place.split(' ').slice(-1)[0];
    const pool = scenes.filter(x => x.place !== t.place && x.neg === t.neg);
    const same = pool.filter(x => x.place.endsWith(noun));
    const other = R.pick(t.neg ? (same.length ? same : pool) : pool);
    const opts = R.shuffle([t, twin, other]);
    out.push({ type: 'choice', kicker: 'LMVZ · Hören', prompt: 'Hör dir den Satz an und wähle das passende Bild.', audio: { text: t.sentence, voice: 'n' }, options: opts.map(o => ({ svg: tileSVG(o) })), answer: opts.indexOf(t), solText: t.sentence, id: 'negl:' + t.sentence });
  });
  R.sample(scenes.filter(t => t.neg), 2).forEach(t => out.push({ type: 'type', kicker: 'Hören + schreiben', prompt: 'Hör zu und schreib den Satz.', audio: { text: t.sentence, voice: 'n' }, answers: [t.sentence], sayAfter: false, id: 'negd:' + t.sentence }));
  return out;
}
const POEM = "Ma maison n'est pas un château,\nje n'ai pas de piscine, pas de bateau.\nDans ma chambre, il n'y a pas de télé,\nmais j'ai un lit et un grand oreiller.\nJe ne range pas souvent mes affaires:\nmon pull n'est pas dans l'armoire, il est par terre!\nSous mon lit, il n'y a rien,\nmais dans mon cœur, il y a les copains!";
function buildPoem(R) {
  // each negation particle is its own target (word-level marking)
  const tg = ["n'", 'pas', "n'", 'pas', 'pas', "n'", 'pas', 'ne', 'pas', "n'", 'pas', "n'", 'rien'].map(p => ({ p, c: 'neg' }));
  return [
    { type: 'info', kicker: 'SB · Rien que pour moi', prompt: 'Hör dir das Gedicht an (ein eigenes Gedicht wie das Lied im Heft)', heft: 'S. 60', html: `<h3>🎵 Ein Gedicht voller «Nein»</h3><p>${POEM.replace(/\n/g, '<br>')}</p><p class="small-muted">Neu: <b>ne … rien</b> = nichts (wie im Lied «Je n'ai rien»).</p>`, say: [{ text: POEM, voice: 'n' }], id: 'info:poem' },
    { type: 'mark', kicker: 'SB · Verneinungen', prompt: 'Markiere alle Wörter der Verneinung: ne / n\' / pas / rien.', heft: 'S. 60', cats: { neg: { label: 'Verneinung', color: '#FF8FA3', cls: 'm-floor' } }, text: POEM,
      targets: tg, note: 'Tippe jedes Verneinungswort einzeln an.', id: 'poem:mark' },
    { type: 'cloze', kicker: 'SB · Lückentext', prompt: "Setz ne / n' / pas ein.", parts: ['Ma maison ', { g: ["n'"] }, 'est ', { g: ['pas'] }, ' un château. Je ', { g: ['ne'] }, ' range ', { g: ['pas'] }, ' souvent mes affaires. Mon pull ', { g: ["n'"] }, 'est ', { g: ['pas'] }, " dans l'armoire."], bank: ["n'", 'pas', 'ne', 'pas', "n'", 'pas', 'ne'], id: 'poem:cloze' },
  ];
}

// ======================================================================
// GRENIER builders
// ======================================================================
function buildHoerLabor(R) {
  const out = [];
  out.push(...vfExercises(R, S.VF_A, S.ROOM_A, 2, 'Hör-Labor · Vrai ou faux'));
  out.push(...vfExercises(R, S.VF_B, S.ROOM_B, 2, 'Hör-Labor · Vrai ou faux'));
  out.push(...buildListenRoom(R).slice(0, 3));
  out.push(...buildNegListen(R).slice(0, 2));
  const pl = R.pick(S.PLACE_LINES);
  out.push({ type: 'sceneTap', kicker: 'Hör-Labor · Stockwerk', prompt: 'Platziere Lou im passenden Stockwerk.', audio: { text: pl.s, voice: 'n' }, scene: { kind: 'house', cfg: S.SIMPLE_HOUSE }, mode: 'floors', placeWho: 'lou', targets: [String(pl.f)], sol: pl.s, id: 'place:' + pl.s });
  const w = R.pick(S.FAMILY_WHO.filter(x => !['lou'].includes(x.who)));
  out.push({ type: 'sceneTap', kicker: 'Hör-Labor · Haus', prompt: 'Hör zu und tippe auf das richtige Zimmer.', audio: { text: w.s, voice: 'k' }, scene: FAMILY_SCENE, mode: 'rooms', targets: [w.room], sol: w.s, id: 'qeo:tap:' + w.who });
  const t = R.pick(PLAN_TEXTS); const opts = R.shuffle([t, ...R.sample(PLAN_TEXTS.filter(x => x !== t), 2)]);
  out.push({ type: 'choice', kicker: 'Hör-Labor · Grundriss', prompt: 'Hör zu: Welcher Grundriss passt?', audio: { text: t.s, voice: 'n' }, options: opts.map(o => ({ svg: floorPlan(o.p) })), answer: opts.indexOf(t), solText: t.s, id: 'planaud:x' });
  return R.shuffle(out);
}
function buildMix(R) {
  const ids = ['v1', 'v3', 'v4', 'r2', 'r5', 'p1', 'p2', 'p3', 'd2', 'd3', 's1', 's3', 's5'];
  const out = [];
  for (const id of R.sample(ids, 8)) { const ex = L[id].build(R).filter(e => e.type !== 'info' && e.type !== 'flash'); out.push(...R.sample(ex, 2)); }
  return R.shuffle(out).slice(0, 15);
}
function buildVersailles(R) {
  const Q = [
    { q: 'Wie viele Räume (salles) hat das Schloss Versailles?', o: ['mehr als 2300', 'etwa 23', 'genau 230'], a: 0 },
    { q: 'Wer war «le Roi Soleil», der Sonnenkönig?', o: ['Louis XIV (Ludwig XIV.)', 'Louis XIII', 'Napoléon'], a: 0 },
    { q: 'Wo liegt Versailles?', o: ['ganz in der Nähe von Paris', 'in der Schweiz', 'am Meer in der Bretagne'], a: 0 },
    { q: 'Was liess Louis XIII 1624 in Versailles bauen?', o: ['ein Jagdschloss', 'einen Bahnhof', 'eine Kaserne'], a: 0 },
    { q: 'Welcher berühmte Saal wurde 1684 fertig?', o: ['der Spiegelsaal (la galerie des Glaces)', 'eine Turnhalle', 'ein Hallenbad'], a: 0 },
    { q: 'Was wurde 1710 im Schloss fertiggestellt? (Im Heft steht hier eine falsche Info!)', o: ['die Schlosskapelle', 'eine grosse Kaserne', 'ein Kino'], a: 0 },
    { q: 'Warum musste die königliche Familie 1789 Versailles verlassen?', o: ['wegen der Französischen Revolution', 'wegen der Beulenpest', 'wegen eines Erdbebens'], a: 0 },
    { q: 'Wohin verlegte Louis XIV. 1701 sein Zimmer?', o: ['ins Zentrum des Schlosses', 'in den Keller', 'in den Garten'], a: 0 },
  ];
  return [{ type: 'info', kicker: 'K · Culture', prompt: 'Le château de Versailles', heft: 'S. 56/57', html: `<h3>👑 Das grösste Schloss Europas</h3><p>Mehr als <b>2300 Räume</b>, ganz in der Nähe von <b>Paris</b>. Der berühmteste Bewohner: <b>Louis XIV – le Roi Soleil</b>.</p><p>Im Heft (S. 57) haben sich falsche Infos eingeschlichen – hier kannst du die richtigen üben.</p>`, id: 'info:versailles' },
    ...R.shuffle(Q).map((x, i) => { const opts = R.shuffle(x.o.map((t, k) => ({ t, ok: k === x.a }))); return { type: 'choice', kicker: 'K · Versailles', prompt: x.q, options: opts, answer: opts.findIndex(o => o.ok), cols1: true, id: 'k:' + i }; })];
}

// ======================================================================
// EXAM (simulation)
// ======================================================================
function buildExam(R) {
  const sec = (name, list, pts) => list.map(e => ({ ...e, section: name, pts }));
  const useA = R() < .5;
  const vf = vfExercises(R, useA ? S.VF_A : S.VF_B, useA ? S.ROOM_A : S.ROOM_B, 5, 'A · Hörverständnis');
  const places = R.sample(S.LISTEN_PLACES, 2).map(p => ({ type: 'sceneTap', kicker: 'A · Hörverständnis', prompt: 'Hör zu und tippe auf den Ort im Bild.', audio: { text: cap(p) + '.', voice: 'n' }, scene: { kind: 'room', cfg: useA ? S.ROOM_B : S.ROOM_A }, mode: 'locations', targets: [p], sol: cap(p) + '.', id: 'ex:lr:' + p }));
  const pl = R.pick(S.PLACE_LINES);
  const place = { type: 'sceneTap', kicker: 'A · Hörverständnis', prompt: 'Hör zu und tippe auf das Stockwerk.', audio: { text: pl.s, voice: 'n' }, scene: { kind: 'house', cfg: S.SIMPLE_HOUSE }, mode: 'floors', placeWho: 'lou', targets: [String(pl.f)], sol: pl.s, id: 'ex:place' };
  const voc = R.sample(VOCAB.filter(v => ['1', '1+', '2', '3', '3+'].includes(String(v.lz)) && !v.sentence && !v.noType), 8).map(v => ({ type: 'type', kicker: 'B · Wortschatz', prompt: hasArt(v.fr) ? 'Schreib auf Französisch (mit Artikel).' : 'Schreib auf Französisch.', q: v.de, answers: [v.fr, ...(v.typed ? [v.typed] : []), ...(v.alt || [])], sayAfter: false, id: 'ex:voc:' + v.id }));
  const cz = { ...clozeEx(R.int(3), R, false), kicker: 'C · Lückentext' };
  const who = R.sample(S.FAMILY_WHO.filter(w => !['lou', 'robot', 'cat'].includes(w.who)), 3).map(w => ({ type: 'type', kicker: 'D · Où est … ?', prompt: 'Schau das Haus an und antworte mit einem ganzen Satz (Stockwerk, Seite, Raum).', img: houseSVG(S.FAMILY_HOUSE), q: w.q, qSay: { text: w.q, voice: 'o' }, answers: [w.s, ...(w.alts || [])], parts: partsOf(w.s), sayAfter: false, id: 'ex:who:' + w.who }));
  const neg = R.sample(ORDERS, 3).map(o => ({ type: 'type', kicker: 'E · Verneinung', prompt: 'Lou sagt Nein. Schreib seine ganze Antwort (Non, je …).', q: o[0], qSay: { text: o[0], voice: 'o' }, answers: ansOf(o), parts: partsOf(o[1]), sayAfter: false, id: 'ex:neg:' + o[0] }));
  const et = buildEtToi(R).filter(e => /^ettoi:p/.test(e.id)); const etPick = R.sample(et, 2).map(e => ({ ...e, kicker: 'F · Et toi ?' }));
  return [
    { type: 'info', kicker: 'Prüfungs-Simulation', prompt: 'Wie am Mittwoch!', html: `<h3>📝 6 Teile · ca. 25 Minuten</h3><p><b>A</b> Hörverständnis · <b>B</b> Wortschatz · <b>C</b> Lückentext · <b>D</b> Où est …? · <b>E</b> Verneinung · <b>F</b> Et toi?</p><p>Du bekommst die Rückmeldung erst <b>am Schluss</b> – mit Note! Akzente zählen.</p>`, img: charSVG('owl', { pose: 'wave' }), id: 'ex:info', section: '' },
    ...sec('A · Hörverständnis', vf, 2), ...sec('A · Hörverständnis', places, 1), ...sec('A · Hörverständnis', [place], 1),
    ...sec('B · Wortschatz', voc, 1), ...sec('C · Lückentext', [cz], 8), ...sec('D · Où est … ?', who, 2), ...sec('E · Verneinung', neg, 2), ...sec('F · Et toi ?', etPick, 2),
  ];
}

// make exercise ids unique (needed to rebuild a stored mistake from lesson + seed + id)
export function prepare(list) {
  const seen = {};
  return list.map(e => { const id = e.id || 'x'; const n = (seen[id] = (seen[id] || 0) + 1); return n > 1 ? { ...e, id: id + '#' + n } : e; });
}
// review of stored mistakes: rebuild each exercise from its lesson + seed (always the newest content)
export function buildMistakes(list, R) {
  const cache = {}, out = [];
  for (const m of list.slice().sort((a, b) => (b.n || 1) - (a.n || 1))) {
    let ex = null;
    if (m.inline && m.ex) ex = m.ex;
    else if (L[m.lesson] && m.seed != null) {
      const k = m.lesson + '|' + m.seed;
      try { cache[k] = cache[k] || prepare(L[m.lesson].build(rng(m.seed))); } catch (e) { continue; }
      ex = cache[k].find(e => e.id === m.exId);
    }
    if (ex && ex.type !== 'info' && ex.type !== 'flash') out.push({ ...ex, mistakeId: m.id, section: undefined, pts: undefined, _src: null });
    if (out.length >= 12) break;
  }
  return R.shuffle(out);
}
