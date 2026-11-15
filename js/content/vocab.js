// Vocabulaire Unité 2 (Dis donc! 6, S. 74/75) + Wörter aus den Heftaufgaben
import { furnIcon, objIcon } from '../art/room.js';
import { roomIcon, floorIcon, miniHouse, floorPlan } from '../art/house.js';
import { prepIcon, qIcon, houseIcon, ICON } from '../art/icons.js';
import { charSVG } from '../art/char.js';

const room = (t, o) => () => roomIcon(t, o);
const furn = (t) => () => furnIcon(t);
const obj = (t) => () => objIcon(t);
const prep = (t) => () => prepIcon(t);

// lz: 1, '1+', 2, '2+', 3, '3+', 'S' (Verneinung), 'Q' (Fragewörter), 'O' (Ordnungszahlen), 'X' (Gegenstände aus 3B)
export const VOCAB = [
  // Lernziel 1
  { id: 'maison', fr: 'la maison', de: 'das Haus', lz: 1, pic: () => houseIcon('maison') },
  { id: 'appartement', fr: 'un appartement', de: 'eine Wohnung', lz: 1, alt: ["l'appartement"], pic: () => houseIcon('appartement') },
  { id: 'cuisine', fr: 'la cuisine', de: 'die Küche', lz: 1, pic: room('cuisine') },
  { id: 'salon', fr: 'le salon', de: 'das Wohnzimmer', lz: 1, alt: ['le séjour'], pic: room('salon') },
  { id: 'chambre', fr: 'la chambre', de: 'das Zimmer, das Schlafzimmer', lz: 1, pic: room('chambre') },
  { id: 'toilettes', fr: 'les toilettes', de: 'die Toilette, das WC', lz: 1, alt: ['le WC', 'les WC'], note: 'f pl · auch: le WC', pic: room('toilettes') },
  { id: 'sdb', fr: 'la salle de bains', de: 'das Badezimmer', lz: 1, alt: ['la salle de bain'], pic: room('sdb') },
  { id: 'etage', fr: 'un étage', de: 'ein Stockwerk', lz: 1, alt: ["l'étage"], pic: () => floorIcon(2) },
  { id: 'rez', fr: 'le rez-de-chaussée', de: 'das Erdgeschoss', lz: 1, pic: () => floorIcon(0) },
  { id: 'soussol', fr: 'le sous-sol', de: 'das Untergeschoss', lz: 1, pic: () => floorIcon(-1) },
  { id: 'jhabite1', fr: "J'habite au premier étage.", de: 'Ich wohne im ersten Stock.', lz: 1, sentence: true, pic: () => miniHouse({ floor: 1, side: 'milieu' }) },
  { id: 'tuhabites2', fr: 'Tu habites au deuxième étage.', de: 'Du wohnst im zweiten Stock.', lz: 1, sentence: true, pic: () => miniHouse({ floor: 2, side: 'gauche', who: 'mia' }) },
  { id: 'ilhabite3', fr: 'Il habite au troisième étage.', de: 'Er wohnt im dritten Stock.', lz: 1, sentence: true, pic: () => miniHouse({ floor: 3, side: 'droite', who: 'tom', floors: 3 }) },
  { id: 'travailler', fr: 'travailler', de: 'arbeiten', lz: 1, pic: room('pharmacie') },
  { id: 'pharmacie', fr: 'Je travaille à la pharmacie.', de: 'Ich arbeite in der Apotheke.', lz: 1, sentence: true, pic: room('pharmacie') },
  // Lernziel 1 plus
  { id: 'sejour', fr: 'le séjour', de: 'das Wohnzimmer', lz: '1+', alt: ['le salon'], pic: room('salon', { piano: true }) },
  { id: 'sam', fr: 'la salle à manger', de: 'das Esszimmer', lz: '1+', pic: room('salleManger') },
  { id: 'amis', fr: "la chambre d'amis", de: 'das Gästezimmer', lz: '1+', pic: room('chambreAmis') },
  { id: 'buanderie', fr: 'la buanderie', de: 'die Waschküche', lz: '1+', pic: room('buanderie') },
  { id: 'grenier', fr: 'le grenier', de: 'der Estrich', lz: '1+', pic: room('grenier') },
  // Lernziel 2
  { id: 'sur', fr: 'sur', de: 'auf', lz: 2, pic: prep('sur') },
  { id: 'sous', fr: 'sous', de: 'unter', lz: 2, pic: prep('sous') },
  { id: 'dans', fr: 'dans', de: 'in', lz: 2, pic: prep('dans') },
  { id: 'milieu', fr: 'au milieu de', de: 'in der Mitte von', lz: 2, pic: prep('au milieu de') },
  { id: 'a', fr: 'à', de: 'in, an, zu, bei', lz: 2, noType: true, noPic: true, pic: prep('à') },
  { id: 'devant', fr: 'devant', de: 'vor', lz: 2, pic: prep('devant') },
  { id: 'derriere', fr: 'derrière', de: 'hinter', lz: 2, pic: prep('derrière') },
  { id: 'entre', fr: 'entre … et', de: 'zwischen … und', lz: 2, typed: 'entre et', alt: ['entre ... et'], pic: prep('entre') },
  { id: 'enhaut', fr: 'en haut', de: 'oben', lz: 2, pic: prep('en haut') },
  { id: 'enbas', fr: 'en bas', de: 'unten', lz: 2, pic: prep('en bas') },
  { id: 'agauche', fr: 'à gauche', de: 'links', lz: 2, pic: prep('à gauche') },
  { id: 'adroite', fr: 'à droite', de: 'rechts', lz: 2, pic: prep('à droite') },
  // Lernziel 2 plus (Fragen)
  { id: 'q_combien', fr: 'Combien de pièces a ta maison ?', de: 'Wie viele Zimmer hat dein Haus?', lz: '2+', sentence: true, pic: () => qIcon('Combien') },
  { id: 'q_qui', fr: 'Qui habite avec toi ?', de: 'Wer wohnt mit dir?', lz: '2+', sentence: true, pic: () => qIcon('Qui') },
  { id: 'q_ou', fr: 'Où est ta chambre ?', de: 'Wo ist dein Zimmer?', lz: '2+', sentence: true, pic: () => qIcon('Où') },
  { id: 'q_etage', fr: "À quel étage est la chambre d'amis ?", de: 'Auf welchem Stockwerk ist das Gästezimmer?', lz: '2+', sentence: true, pic: () => qIcon('Quel') },
  // Lernziel 3
  { id: 'porte', fr: 'la porte', de: 'die Türe', lz: 3, pic: furn('porte') },
  { id: 'fenetre', fr: 'la fenêtre', de: 'das Fenster', lz: 3, pic: furn('fenetre') },
  { id: 'lit', fr: 'le lit', de: 'das Bett', lz: 3, pic: furn('lit') },
  { id: 'table', fr: 'la table', de: 'der Tisch', lz: 3, pic: furn('table') },
  { id: 'chaise', fr: 'la chaise', de: 'der Stuhl', lz: 3, pic: furn('chaise') },
  { id: 'etagere', fr: 'une étagère', de: 'ein Gestell', lz: 3, alt: ["l'étagère"], pic: furn('etagere') },
  { id: 'armoire', fr: 'une armoire', de: 'ein Schrank', lz: 3, alt: ["l'armoire"], pic: furn('armoire') },
  { id: 'fauteuil', fr: 'le fauteuil', de: 'der Sessel', lz: 3, pic: furn('fauteuil') },
  { id: 'tapis', fr: 'le tapis', de: 'der Teppich', lz: 3, pic: furn('tapis') },
  { id: 'commode', fr: 'la commode', de: 'die Kommode', lz: 3, pic: furn('commode') },
  { id: 'plante', fr: 'la plante', de: 'die Pflanze', lz: 3, pic: furn('plante') },
  { id: 'affiche', fr: 'une affiche', de: 'ein Poster', lz: 3, alt: ["l'affiche"], pic: furn('affiche') },
  { id: 'lampe', fr: 'la lampe', de: 'die Lampe', lz: 3, pic: furn('lampe') },
  { id: 'gauchelampe', fr: 'à gauche de la lampe', de: 'links von der Lampe', lz: 3, pic: prep('à gauche de') },
  { id: 'gauchepiano', fr: 'à gauche du piano', de: 'links vom Klavier', lz: 3, pic: prep('à gauche de') },
  { id: 'droiteetagere', fr: "à droite de l'étagère", de: 'rechts vom Gestell', lz: 3, pic: prep('à droite de') },
  // Lernziel 3 plus
  { id: 'rideau', fr: 'le rideau', de: 'der Vorhang', lz: '3+', pic: furn('rideau') },
  { id: 'biblio', fr: 'la bibliothèque', de: 'das Büchergestell', lz: '3+', pic: furn('etagere') },
  { id: 'corbeille', fr: 'la corbeille à papier', de: 'der Papierkorb', lz: '3+', pic: furn('corbeille') },
  // Gegenstände aus "Vrai ou faux?" (3B) und "Quel désordre!" (3C)
  { id: 'casquette', fr: 'la casquette', de: 'die Mütze (Cap)', lz: 'X', pic: obj('casquette') },
  { id: 'ordinateur', fr: "l'ordinateur", de: 'der Computer', lz: 'X', alt: ['un ordinateur'], note: 'männlich (un ordinateur)', pic: obj('ordinateur') },
  { id: 'veste', fr: 'la veste', de: 'die Jacke', lz: 'X', pic: obj('veste') },
  { id: 'regle', fr: 'la règle', de: 'das Lineal', lz: 'X', pic: obj('regle') },
  { id: 'pull', fr: 'le pull', de: 'der Pullover', lz: 'X', pic: obj('pull') },
  { id: 'lunettes', fr: 'les lunettes de soleil', de: 'die Sonnenbrille', lz: 'X', pic: obj('lunettes') },
  { id: 'teeshirt', fr: 'le tee-shirt', de: 'das T-Shirt', lz: 'X', alt: ['le t-shirt'], pic: obj('teeshirt') },
  { id: 'violon', fr: 'le violon', de: 'die Geige', lz: 'X', pic: obj('violon') },
  { id: 'ski', fr: 'le ski', de: 'der Ski', lz: 'X', pic: obj('ski') },
  // Verneinung & Wörter aus den Texten
  { id: 'nepas', fr: 'ne … pas', de: 'nicht', lz: 'S', typed: 'ne pas', pic: () => ICON.no.replace('<svg', '<svg class="pic"') },
  { id: 'personne', fr: "Il n'y a personne.", de: 'Es gibt niemanden.', lz: 'S', sentence: true, pic: () => ICON.no.replace('<svg', '<svg class="pic"') },
  { id: 'locataire', fr: 'le locataire', de: 'der Mieter', lz: 'S', pic: () => charSVG('papi').replace('<svg', '<svg class="pic"') },
  { id: 'chez', fr: 'chez', de: 'bei / zu', lz: 'S', pic: () => houseIcon('maison') },
  { id: 'piece', fr: 'la pièce', de: 'der Raum (Zimmer einer Wohnung)', lz: 1, note: 'Mon appartement a trois pièces.', pic: () => floorPlan(['cuisine', 'escalier', 'salon', 'chambre']) },
];
export const V = Object.fromEntries(VOCAB.map(v => [v.id, v]));

export const LZ_LABEL = {
  1: 'Lernziel 1 · Räume & Stockwerke', '1+': 'Lernziel 1 plus', 2: 'Lernziel 2 · Lage', '2+': 'Lernziel 2 plus · Fragen',
  3: 'Lernziel 3 · Einrichtung', '3+': 'Lernziel 3 plus', X: 'Gegenstände (3B / 3C)', S: 'Verneinung & Texte',
};

export const ORDINALS = [
  { n: 1, fr: 'premier', short: '1er', de: 'erste' }, { n: 2, fr: 'deuxième', short: '2e', de: 'zweite' },
  { n: 3, fr: 'troisième', short: '3e', de: 'dritte' }, { n: 4, fr: 'quatrième', short: '4e', de: 'vierte' },
  { n: 5, fr: 'cinquième', short: '5e', de: 'fünfte' },
];
export const NUMBERS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];

export const QWORDS = [
  { fr: 'Qui ?', de: 'Wer?' }, { fr: 'Où ?', de: 'Wo?' }, { fr: 'Quel / Quelle ?', de: 'Welche(r/s)?' },
  { fr: "Qu'est-ce que … ?", de: 'Was?' }, { fr: 'Comment ?', de: 'Wie?' }, { fr: 'Combien ?', de: 'Wie viele?' },
];

/** strip article for building "de la / du / de l'" etc. */
export function splitArticle(fr) {
  const m = fr.match(/^(le |la |les |l'|un |une )(.*)$/i);
  return m ? { art: m[1].trim(), noun: m[2] } : { art: '', noun: fr };
}
/** "de" + article contraction:  la table -> de la table, le lit -> du lit, les … -> des … */
export function deArt(np) {
  if (/^le /i.test(np)) return 'du ' + np.slice(3);
  if (/^les /i.test(np)) return 'des ' + np.slice(4);
  return 'de ' + np;
}
/** "à" + article: le premier étage -> au premier étage */
export function aArt(np) {
  if (/^le /i.test(np)) return 'au ' + np.slice(3);
  if (/^les /i.test(np)) return 'aux ' + np.slice(4);
  return 'à ' + np;
}
