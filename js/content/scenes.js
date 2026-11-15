// Fixed scenes used for listening tasks (audio is pre-generated for these)
import { OBJ, FURNITURE, LOC_SAME } from '../art/room.js';

// ---------- Lous Zimmer – Version A (wie Heft 3A: grosses Durcheinander) ----------
export const ROOM_A = {
  items: [
    { o: 'casquette', at: 'sur la corbeille à papier' }, { o: 'ordinateur', at: 'dans la plante' }, { o: 'veste', at: 'sur la chaise' },
    { o: 'regle', at: 'sur la table' }, { o: 'pull', at: "dans l'armoire" }, { o: 'lunettes', at: 'sous le fauteuil' },
    { o: 'teeshirt', at: 'sur le lit' }, { o: 'violon', at: "à droite de l'affiche" }, { o: 'ski', at: 'à droite du lit' },
    { o: 'ballon', at: 'sous la table' }, { o: 'pomme', at: 'sur la commode' }, { o: 'livres', at: "en bas de l'étagère" },
    { o: 'parapluie', at: "devant l'armoire" }, { o: 'chat', at: 'sur le tapis' }, { o: 'guitare', at: 'derrière le fauteuil' },
  ],
};
// ---------- Version B ----------
export const ROOM_B = {
  items: [
    { o: 'casquette', at: "sur l'armoire" }, { o: 'ordinateur', at: 'sur le lit' }, { o: 'veste', at: "dans l'armoire" },
    { o: 'regle', at: 'sous la chaise' }, { o: 'pull', at: 'sur le fauteuil' }, { o: 'lunettes', at: 'sur la table' },
    { o: 'teeshirt', at: 'sur la lampe' }, { o: 'violon', at: 'sur la commode' }, { o: 'ski', at: 'devant la porte' },
    { o: 'ballon', at: 'sous la table' }, { o: 'pomme', at: 'dans la corbeille à papier' }, { o: 'livres', at: "en haut de l'étagère" },
    { o: 'chat', at: 'devant le fauteuil' }, { o: 'parapluie', at: 'à droite du lit' },
  ],
};

const OB = (o) => OBJ[o].name;
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const verb = (o) => /^les /.test(OB(o)) ? 'sont' : 'est';
export const objSentence = (o, at) => `${cap(OB(o))} ${verb(o)} ${at}.`;

// statements: { s: sentence spoken, truth, real (location), obj label, objId }
export const VF_A = [
  { o: 'casquette', say: 'sous le lit' }, { f: 'tapis', s: 'Le tapis est devant la table.', truth: true },
  { o: 'ordinateur', say: 'sur la table' }, { f: 'table', s: 'La table est à droite du lit.', truth: true },
  { f: 'fenetre', s: 'La fenêtre est à droite du lit.', truth: true }, { o: 'veste', say: 'sur le fauteuil' },
  { o: 'regle', say: 'sur la table' }, { f: 'armoire', s: "L'armoire est à gauche de la commode.", truth: false, real: 'à droite de la commode', realS: "L'armoire est à droite de la commode." },
  { f: 'porte', s: 'La porte est à gauche du lit.', truth: true }, { o: 'pull', say: 'sous le fauteuil' },
  { o: 'lunettes', say: 'sur la commode' }, { f: 'lit', s: 'Le lit est à droite de la plante.', truth: true },
  { f: 'rideau', s: 'Le rideau est derrière la fenêtre.', truth: false, real: 'devant la fenêtre', realS: 'Le rideau est devant la fenêtre.' },
  { o: 'teeshirt', say: 'sur le lit' }, { o: 'violon', say: "à droite de l'affiche" },
];
export const VF_B = [
  { o: 'casquette', say: "sur l'armoire" }, { o: 'ordinateur', say: 'sous le lit' }, { o: 'veste', say: "dans l'armoire" },
  { o: 'regle', say: 'sur la chaise' }, { o: 'pull', say: 'derrière le fauteuil' }, { o: 'lunettes', say: 'sur la table' },
  { o: 'teeshirt', say: 'sur la lampe' }, { o: 'violon', say: 'sur la commode' }, { o: 'ski', say: "devant l'armoire" },
  { o: 'pomme', say: 'sur la corbeille à papier' }, { o: 'livres', say: "en bas de l'étagère" }, { o: 'chat', say: 'devant le fauteuil' },
];
const FN = { tapis: 'le tapis', table: 'la table', fenetre: 'la fenêtre', armoire: "l'armoire", porte: 'la porte', lit: 'le lit', rideau: 'le rideau' };
export function vfItems(set, room) {
  return set.map(it => {
    if (it.f) return { label: FN[it.f], s: it.s, truth: it.truth, real: it.real || null, realS: it.realS || it.s, realAt: null, realRect: FURNITURE[it.f].rect, obj: null, furn: it.f };
    const realAt = room.items.find(x => x.o === it.o).at;
    return { label: OB(it.o), s: objSentence(it.o, it.say), truth: realAt === it.say, real: realAt, realS: objSentence(it.o, realAt), realAt, obj: it.o };
  });
}

// accepted corrections: place only, or a full sentence with noun or pronoun, + equivalent wordings
const PRON = { f: 'Elle est', m: 'Il est', fp: 'Elles sont', mp: 'Ils sont' };
const GENDER = { casquette: 'f', ordinateur: 'm', veste: 'f', regle: 'f', pull: 'm', lunettes: 'fp', teeshirt: 'm', violon: 'm', ski: 'm', ballon: 'm', pomme: 'f', livres: 'mp', parapluie: 'm', chat: 'm', guitare: 'f', armoire: 'f', rideau: 'm', tapis: 'm', table: 'f', fenetre: 'f', porte: 'f', lit: 'm' };
export function fixAnswers(it) {
  const places = it.real ? [it.real, ...(LOC_SAME[it.real] || [])] : [];
  const out = [];
  const id = it.obj || it.furn;
  const subj = it.obj ? cap(OB(it.obj)) + ' ' + verb(it.obj) : it.realS.split(/ (est|sont) /)[0] + ' ' + (/ sont /.test(it.realS) ? 'sont' : 'est');
  if (!places.length && it.realS) { const m = it.realS.match(/ (?:est|sont) (.+)\.$/); if (m) places.push(m[1]); }
  for (const pl of places) {
    out.push(pl, `${subj} ${pl}`, `${PRON[GENDER[id]] || 'Il est'} ${pl}`);
    if (id === 'rideau') out.push(`Les rideaux sont ${pl}`);
    if (id === 'lunettes') out.push(`Les lunettes sont ${pl}`);
    if (/l'étagère/.test(pl)) out.push(pl.replace("l'étagère", 'la bibliothèque'));
  }
  return [...new Set(out)];
}

// ---------- LMVZ-style listening: tap the place ----------
export const LISTEN_PLACES = ['sous la table', 'devant le fauteuil', 'sur le lit', 'sur la chaise', 'sur la lampe', 'sur le tapis', 'devant la porte', "dans l'armoire", "en haut de l'étagère", 'sous le lit', 'sur la commode', 'derrière le rideau', 'à droite du lit', "sur l'armoire"];
export const LISTEN_DOUBLE = [['sur la chaise', 'sous le lit'], ['devant la porte', 'sur la table'], ["dans l'armoire", 'sur le tapis'], ['sur la lampe', 'sous la table'], ["en bas de l'étagère", 'devant le fauteuil'], ['sur la commode', 'à droite du lit']];
export const doubleSentence = (a, b) => `${cap(a)} et ${b}.`;

// multi-select questions on ROOM_A
export const MULTI_Q = [
  { locs: ['sur la table', 'sous la table'], opts: ['regle', 'ballon', 'pomme', 'livres'] },
  { locs: ["dans l'armoire", "devant l'armoire"], opts: ['pull', 'parapluie', 'veste', 'chat'] },
  { locs: ['sur le lit', 'à droite du lit'], opts: ['teeshirt', 'ski', 'pull', 'violon'] },
  { locs: ['sur la chaise', 'sous le fauteuil'], opts: ['veste', 'lunettes', 'pull', 'guitare'] },
  { locs: ['sur la commode', 'sur le tapis'], opts: ['pomme', 'chat', 'ballon', 'regle'] },
];
export const multiQuestion = (q) => `Quels sont les objets ${q.locs[0]} et ${q.locs[1]} ?`;

// ---------- Maison de la famille (2B "Qui est où ?") ----------
export const FAMILY_HOUSE = {
  labels: 'num',
  floors: [
    { key: 'ss', rooms: ['buanderie'] },
    { key: 'rez', rooms: ['cuisine', 'salleManger', { t: 'salon', piano: true }] },
    { key: 1, rooms: ['sdb', 'chambre', 'chambreAmis'] },
    { key: 2, rooms: ['toilettes', 'chambre', 'chambre'] },
    { key: 3, rooms: ['chambre', 'chambre'] },
    { key: 'grenier', rooms: ['grenier'] },
  ],
  people: [
    { who: 'robot', f: 0, c: 0, pos: .78 }, { who: 'maman', f: 1, c: 0, pos: .62 }, { who: 'papa', f: 1, c: 2, pos: .5 },
    { who: 'lou', f: 2, c: 1, pos: .78 }, { who: 'tonton', f: 2, c: 2, pos: .82 }, { who: 'mia', f: 3, c: 1, pos: .8 },
    { who: 'tom', f: 3, c: 2, pos: .82 }, { who: 'papi', f: 4, c: 0, pos: .8, mood: 'sleep', zzz: true }, { who: 'mamie', f: 4, c: 1, pos: .8 },
    { who: 'cat', f: 5, dx: 70 },
  ],
};
// Lou erzählt (Possessivbegleiter!)
export const FAMILY_WHO = [
  { who: 'maman', subj: 'Ma mère', s: 'Ma mère est au rez-de-chaussée, à gauche, dans la cuisine.', q: 'Où est ta mère ?', room: '1-0' },
  { who: 'papa', subj: 'Mon père', s: 'Mon père est au rez-de-chaussée, à droite, dans le salon.', q: 'Où est ton père ?', room: '1-2' },
  { who: 'lou', subj: 'Je', s: 'Je suis au premier étage, au milieu, dans ma chambre.', q: 'Où es-tu ?', room: '2-1' },
  { who: 'tonton', subj: 'Mon oncle', s: "Mon oncle est au premier étage, à droite, dans la chambre d'amis.", q: 'Où est ton oncle ?', room: '2-2' },
  { who: 'mia', subj: 'Ma sœur', s: 'Ma sœur est au deuxième étage, au milieu, dans la chambre.', q: 'Où est ta sœur ?', room: '3-1' },
  { who: 'tom', subj: 'Mon frère', s: 'Mon frère est au deuxième étage, à droite, dans la chambre.', q: 'Où est ton frère ?', room: '3-2' },
  { who: 'papi', subj: 'Mon grand-père', s: 'Mon grand-père est au troisième étage, à gauche, dans la chambre.', q: 'Où est ton grand-père ?', room: '4-0' },
  { who: 'mamie', subj: 'Ma grand-mère', s: 'Ma grand-mère est au troisième étage, à droite, dans la chambre.', q: 'Où est ta grand-mère ?', room: '4-1' },
  { who: 'robot', subj: 'Le robot', s: 'Le robot est au sous-sol, dans la buanderie.', q: 'Où est le robot ?', room: '0-0' },
  { who: 'cat', subj: 'Le chat', s: 'Le chat est au grenier.', q: 'Où est le chat ?', room: '5-0' },
];
export const FAMILY_ROOMS = [
  { s: 'La cuisine est au rez-de-chaussée, à gauche.', room: '1-0', q: 'Où est la cuisine ?' },
  { s: 'La salle à manger est au rez-de-chaussée, au milieu.', room: '1-1', q: 'Où est la salle à manger ?' },
  { s: 'Le salon est au rez-de-chaussée, à droite.', room: '1-2', q: 'Où est le salon ?' },
  { s: 'La salle de bains est au premier étage, à gauche.', room: '2-0', q: 'Où est la salle de bains ?' },
  { s: "La chambre d'amis est au premier étage, à droite.", room: '2-2', q: "Où est la chambre d'amis ?" },
  { s: 'Les toilettes sont au deuxième étage, à gauche.', room: '3-0', q: 'Où sont les toilettes ?' },
  { s: 'La buanderie est au sous-sol.', room: '0-0', q: 'Où est la buanderie ?' },
];
export const FAMILY_QA = [
  { q: 'Combien de pièces sont à droite ?', a: 'Quatre pièces sont à droite.', alt: ['4 pièces sont à droite.'], ch: ['Quatre pièces sont à droite.', 'Trois pièces sont à droite.', 'Cinq pièces sont à droite.'] },
  { q: 'Combien de pièces y a-t-il au rez-de-chaussée ?', a: 'Il y a trois pièces au rez-de-chaussée.', ch: ['Il y a trois pièces au rez-de-chaussée.', 'Il y a deux pièces au rez-de-chaussée.', 'Il y a une pièce au rez-de-chaussée.'] },
  { q: 'Où est le piano ?', a: 'Le piano est au rez-de-chaussée, à droite, dans le salon.', ch: ['Le piano est au rez-de-chaussée, à droite, dans le salon.', 'Le piano est au premier étage, à droite, dans le salon.', 'Le piano est au rez-de-chaussée, à gauche, dans la cuisine.'] },
  { q: 'Où est la soupe ?', a: 'La soupe est dans la cuisine.', ch: ['La soupe est dans la cuisine.', 'La soupe est dans la salle de bains.', 'La soupe est au grenier.'] },
  { q: "Qu'est-ce que ta mère fait à la cuisine ?", a: 'Elle fait une soupe.', ch: ['Elle fait une soupe.', 'Elle joue du piano.', 'Elle dort.'] },
  { q: 'Qui joue du piano ?', a: 'Mon père joue du piano.', ch: ['Mon père joue du piano.', 'Ma mère joue du piano.', 'Le chat joue du piano.'] },
  { q: 'Comment s’appelle le robot ?', a: "Il s'appelle Bip.", ch: ["Il s'appelle Bip.", 'Il est au sous-sol.', 'Il a deux pièces.'] },
  { q: 'Qui dort au troisième étage ?', a: 'Mon grand-père dort au troisième étage.', ch: ['Mon grand-père dort au troisième étage.', 'Ma sœur dort au troisième étage.', 'Mon oncle dort au troisième étage.'] },
  { q: 'Où est ta chambre ?', a: 'Ma chambre est au premier étage, au milieu.', ch: ['Ma chambre est au premier étage, au milieu.', 'Ma chambre est au deuxième étage, à droite.', 'Ta chambre est au premier étage, au milieu.'] },
];

// small house for "Platziere Lou" (LMVZ)
export const SIMPLE_HOUSE = { floors: [{ key: 'ss', rooms: ['buanderie'] }, { key: 'rez', rooms: ['cuisine', 'salon'] }, { key: 1, rooms: ['chambre', 'sdb'] }, { key: 2, rooms: ['chambreAmis', 'toilettes'] }] };
export const PLACE_LINES = [
  { s: "L'appartement de Lou est au premier étage.", f: 2 }, { s: 'Lou est au rez-de-chaussée.', f: 1 },
  { s: 'Lou est au sous-sol.', f: 0 }, { s: 'Lou habite au rez-de-chaussée.', f: 1 }, { s: 'Lou est au deuxième étage.', f: 3 },
];

// ---------- accepted word orders for «Où est …?» answers ----------
function orders(subj, verbW, bits) {
  const perms = bits.length === 3 ? [[0, 1, 2], [0, 2, 1], [2, 0, 1], [2, 1, 0], [1, 0, 2], [1, 2, 0]] : bits.length === 2 ? [[0, 1], [1, 0]] : [[0]];
  return perms.map(pm => `${subj} ${verbW} ${pm.map(i => bits[i]).join(', ')}.`);
}
const PR = { maman: 'Elle', papa: 'Il', tonton: 'Il', mia: 'Elle', tom: 'Il', papi: 'Il', mamie: 'Elle', robot: 'Il', cat: 'Il' };
for (const w of FAMILY_WHO) {
  const m = w.s.match(/^(.+?) (est|suis) (.+)\.$/); if (!m) continue;
  const bits = m[3].split(', ');
  w.alts = [...orders(m[1], m[2], bits), ...(PR[w.who] ? orders(PR[w.who], 'est', bits) : [])].filter(x => x !== w.s);
}
for (const r of FAMILY_ROOMS) {
  const m = r.s.match(/^(.+?) (est|sont) (.+)\.$/); if (!m) continue;
  const bits = m[3].split(', ');
  const pron = m[2] === 'sont' ? 'Elles' : /^La /.test(m[1]) ? 'Elle' : 'Il';
  r.alts = [...orders(m[1], m[2], bits), ...orders(pron, m[2], bits)].filter(x => x !== r.s);
}
