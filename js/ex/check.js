// Answer checking with targeted, kid-friendly German tips for the typical mistakes.
// Rule of thumb: a "typo" is only tolerated in a long content word – never in articles, possessives,
// prepositions, ne/pas or est/et (those ARE the learning goals).
import { normText, loose, lev, stripAccents } from '../core/util.js';

const FEM = ['chambre', "chambre d'amis", 'cuisine', 'salle de bains', 'salle à manger', 'buanderie', 'table', 'chaise', 'porte', 'fenêtre', 'commode', 'plante', 'lampe', 'maison', 'casquette', 'veste', 'règle', 'pomme', 'corbeille à papier', 'bibliothèque', 'pharmacie', 'soupe', 'sœur', 'mère', 'grand-mère', 'armoire', 'étagère', 'affiche', 'pièce', 'musique', 'carte'];
const MASC = ['lit', 'salon', 'séjour', 'tapis', 'fauteuil', 'rideau', 'grenier', 'sous-sol', 'rez-de-chaussée', 'pull', 'violon', 'ski', 'ballon', 'piano', 'tee-shirt', 'parapluie', 'frère', 'père', 'grand-père', 'chat', 'garage', 'étage', 'ordinateur', 'appartement', 'oncle', 'poisson', 'poème'];
const VOWEL = /^[aeiouhéèêâîôœ]/;
const FUNC = new Set("le la les l un une du de des d au aux a à ma mon mes ta ton tes sa son ses ne n pas je j il elle ils elles est et sont dans sur sous y en".split(' '));
const ART = /^(les |le |la |l'|une |un )/;

function genderOf(noun) {
  const n = noun.trim();
  if (FEM.includes(n)) return 'f';
  if (MASC.includes(n)) return 'm';
  return null;
}
function artTip(g, t) {
  // compare article of given vs target when the nouns are the same
  const mt = t.match(ART), mg = g.match(ART);
  const nounT = mt ? t.slice(mt[0].length) : t, nounG = mg ? g.slice(mg[0].length) : g;
  if (!mt) return '';
  if (loose(nounG) !== loose(nounT)) return '';
  const at = mt[1].trim(), ag = mg ? mg[1].trim() : null;
  if (!ag) return `Artikel nicht vergessen: <b>${t}</b>.`;
  if (ag === at) return '';
  const gen = genderOf(nounT);
  const def = ['le', 'la', 'les', "l'"], ind = ['un', 'une'];
  if (nounT.startsWith('toilettes') && /^la toilette/.test(g)) return '«toilettes» ist auf Französisch Mehrzahl: <b>les toilettes</b>.';
  if (gen === 'f' && (ag === 'le' || ag === 'un')) return `«${nounT}» ist weiblich → <b>${t}</b>.`;
  if (gen === 'm' && (ag === 'la' || ag === 'une')) return `«${nounT}» ist männlich → <b>${t}</b>.`;
  if (def.includes(at) && ind.includes(ag)) return `Hier mit bestimmtem Artikel: <b>${t}</b>.`;
  if (ind.includes(at) && def.includes(ag)) return `Lerne das Wort mit <b>un/une</b>: <b>${t}</b> – so siehst du das Geschlecht.`;
  return `Achte auf den Artikel: <b>${t}</b>.`;
}

export function tipFor(given, target) {
  const g0 = normText(given), t0 = normText(target);
  const g = ' ' + g0 + ' ', t = ' ' + t0 + ' ';
  if (!g0) return '';
  const tips = [];
  if (/ la toilette /.test(g) && / les toilettes /.test(t)) tips.push('«toilettes» ist auf Französisch Mehrzahl: <b>les toilettes</b>.');
  const at = artTip(g0, t0); if (at) tips.push(at);
  for (const m of t.matchAll(/ du (\S+)/g)) if (g.includes(' de ' + m[1] + ' ') || g.includes(' de le ' + m[1] + ' ')) { tips.push(`de + le = <b>du</b> → «${'du ' + m[1]}».`); break; }
  if (/ (au|à|a) le /.test(g)) tips.push('à + le = <b>au</b> → «au premier étage», nicht «au le».');
  if (/ (à|a) (premier|deuxième|deuxieme|troisième|troisieme|quatrième|rez|sous-sol|grenier)/.test(g)) tips.push('Bei Stockwerken: <b>au</b> premier étage, <b>au</b> rez-de-chaussée (à + le = au).');
  if (/ dans le (premier|deuxième|troisième|quatrième|rez|sous)/.test(g)) tips.push('Bei Stockwerken sagt man <b>au</b>: «au rez-de-chaussée», «au premier étage».');
  if (/ au (gauche|droite|droit) /.test(g)) tips.push('Ohne Artikel: <b>à gauche</b> / <b>à droite</b>.');
  if (/ au pharmacie /.test(g)) tips.push('pharmacie ist weiblich: <b>à la pharmacie</b>.');
  if (/ de le /.test(g)) tips.push('de + le = <b>du</b> → «à gauche du lit».');
  if (/ de les /.test(g)) tips.push('de + les = <b>des</b>.');
  if (/ droit /.test(g) && / droite /.test(t)) tips.push('«à droite» schreibt man mit <b>-e</b> am Schluss.');
  if (/ gauch /.test(g)) tips.push('«à gauche» – mit <b>-e</b> am Schluss.');
  // verneinung
  const hasNe = / (ne|n')/.test(g) || / n'/.test(g);
  if (/ n [aeiouhéèêâ]/.test(g)) tips.push("Vor Vokal: <b>n'</b> mit Apostroph – «je n'écoute pas».");
  if (/ pas /.test(t) && !/ pas /.test(g) && hasNe) tips.push('Die Verneinung hat zwei Teile: <b>ne</b> + Verb + <b>pas</b>. «pas» fehlt!');
  if (/ (ne|n')/.test(t) && !hasNe && / pas /.test(g)) tips.push('Vergiss <b>ne</b> nicht: ne + Verb + pas.');
  if (/ ne [aeiouhéèêâ]/.test(g)) tips.push('Vor Vokal oder stummem h wird <b>ne → n\'</b>: «je n\'aime pas», «il n\'est pas».');
  if (/ ne pas /.test(g) && !/ ne pas /.test(t)) tips.push('«pas» kommt <b>nach</b> dem Verb: ne + <i>Verb</i> + pas.');
  if (/ pas [.!]? ?$/.test(g) && !/ pas $/.test(t) && hasNe) tips.push('«pas» steht <b>direkt nach dem Verb</b>, nicht am Schluss.');
  if (/ je (aime|écoute|ecoute|habite|ouvre|aide) /.test(g)) tips.push('je + Vokal → <b>j\'</b> (j\'aime, j\'habite) – verneint: <b>je n\'aime pas</b>.');
  if (/^non /.test(t0) && !/^non /.test(g0) && / (je|ne|n'|pas) /.test(g)) tips.push('Lou antwortet mit <b>Non,</b> … – beginne den Satz mit «Non,».');
  // possessives
  if (/ (ta|ton|tes) /.test(g) && / (ma|mon|mes) /.test(t) && !/ (ta|ton|tes) /.test(t)) tips.push('Aus <b>ta / ton</b> in der Frage wird <b>ma / mon</b> in deiner Antwort.');
  if (/ mo /.test(g)) tips.push('<b>ma</b> (weiblich) oder <b>mon</b> (männlich) – «mo» gibt es nicht.');
  for (const w of FEM) if (g.includes(' mon ' + w + ' ') && !VOWEL.test(w)) { tips.push(`«${w}» ist weiblich → <b>ma ${w}</b>.`); break; }
  for (const w of MASC) if (g.includes(' ma ' + w + ' ')) { tips.push(`«${w}» ist männlich → <b>mon ${w}</b>.`); break; }
  // confusions
  const swaps = [['sur', 'sous', '«sur» = auf, «sous» = unter. Schau nochmals ins Bild!'], ['devant', 'derrière', '«devant» = vor, «derrière» = hinter.'], ['gauche', 'droite', '«à gauche» = links, «à droite» = rechts.']];
  for (const [a, b, msg] of swaps) {
    const re1 = new RegExp(` ${a} `, 'g'), re2 = new RegExp(` ${b} `, 'g');
    if ((g.replace(re1, ` ${b} `) === t) || (g.replace(re2, ` ${a} `) === t)) tips.push(msg);
  }
  if (/ et /.test(g) && / est /.test(t) && g.replace(/ et /g, ' est ') === t) tips.push('<b>est</b> = ist, <b>et</b> = und.');
  if (/ (premiere|premiére|première) /.test(g) && / premier /.test(t)) tips.push('«étage» ist männlich → <b>premier</b> étage.');
  for (const w of FEM) if (g.includes(' le ' + w + ' ') && t.includes(' la ' + w + ' ')) { tips.push(`«${w}» ist weiblich → <b>la ${w}</b>.`); break; }
  for (const w of MASC) if (g.includes(' la ' + w + ' ') && t.includes(' le ' + w + ' ')) { tips.push(`«${w}» ist männlich → <b>le ${w}</b>.`); break; }
  if (/ [0-9]+ /.test(g) && /(premier|deuxième|troisième|quatrième)/.test(t)) tips.push('Schreib die Ordnungszahl als Wort: <b>premier, deuxième, troisième</b> …');
  return tips[0] || '';
}

function diffKind(given, target) {
  const g = normText(given), a = normText(target);
  if (g.replace(/-/g, ' ') === a.replace(/-/g, ' ')) return 'hyphen';
  if (stripAccents(g) === stripAccents(a)) return 'accent';
  return 'both';
}
const KIND_TIP = {
  hyphen: (s) => `Achte auf die <b>Bindestriche</b>: ${s}`,
  accent: (s) => `Achte auf die <b>Akzente</b>: ${s}`,
  both: (s) => `Achte auf <b>Akzente und Bindestriche</b>: ${s}`,
};

/** Compare a typed answer against a list of accepted answers. strict = Prüfung / Akzent-Lektionen */
export function checkTyped(given, accept, { strict = false, strictAccents } = {}) {
  strict = strict || !!strictAccents;
  const g = normText(given);
  const acc = accept.map(a => normText(a));
  if (!g) return { ok: false, sol: accept[0], empty: true };
  const ix = acc.indexOf(g);
  if (ix >= 0) return { ok: true, sol: accept[ix] };
  const gl = loose(given);
  const accL = accept.map(a => loose(a));
  const i = accL.indexOf(gl);
  if (i >= 0) {
    const tip = KIND_TIP[diffKind(given, accept[i])](accept[i]);
    return strict ? { ok: false, almost: true, score: .5, sol: accept[i], tip } : { ok: true, almost: true, sol: accept[i], tip };
  }
  // missing apostrophe (l ordinateur, n aime, j habite)
  const apo = g.replace(/(^| )([lndjs]) (?=[aeiouhéèêâîô])/g, "$1$2'");
  if (apo !== g && acc.includes(apo)) {
    const sol = accept[acc.indexOf(apo)], tip = `Apostroph nicht vergessen: <b>${sol}</b>`;
    return strict ? { ok: false, almost: true, score: .5, sol, tip } : { ok: true, almost: true, sol, tip };
  }
  // answer without "Non," (Lou dit non)
  for (let k = 0; k < acc.length; k++) {
    if (/^non /.test(acc[k]) && (acc[k].slice(4) === g || accL[k].slice(4) === gl)) {
      const tip = 'Fast! Lou beginnt mit <b>Non,</b> …';
      return strict ? { ok: false, almost: true, score: .5, sol: accept[k], tip } : { ok: true, almost: true, sol: accept[k], tip };
    }
  }
  let best = 0, bd = 1e9;
  accL.forEach((a, k) => { const d = lev(gl, a); if (d < bd) { bd = d; best = k; } });
  const target = accept[best];
  const tip = tipFor(given, target);
  if (!tip) {
    const gw = gl.split(' '), tw = accL[best].split(' ');
    if (gw.length === tw.length) {
      const d = gw.map((w, k) => [w, tw[k]]).filter(([a, b]) => a !== b);
      if (d.length === 1 && !FUNC.has(d[0][0]) && !FUNC.has(d[0][1]) && d[0][1].length >= 6 && lev(d[0][0], d[0][1]) === 1) {
        const t2 = `Kleiner Tippfehler – richtig ist: <b>${target}</b>`;
        return strict ? { ok: false, almost: true, score: .5, sol: target, tip: t2 } : { ok: true, almost: true, sol: target, tip: t2 };
      }
    }
  }
  return { ok: false, sol: target, tip };
}

/** Join chip tokens into a sentence string */
export function joinTokens(tokens) {
  return tokens.join(' ').replace(/\s+([.,!?])/g, '$1').replace(/'\s+/g, "'").replace(/\s+-\s+/g, '-');
}
export function sameSentence(a, b) { return normText(a) === normText(b); }
