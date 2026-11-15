// UI icons + small vocabulary illustrations
const I = (p, vb = '0 0 24 24') => `<svg viewBox="${vb}" aria-hidden="true">${p}</svg>`;

export const ICON = {
  speaker: I(`<path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor"/><path class="w" d="M15.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/><path class="w" d="M18 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" style="animation-delay:.2s"/>`),
  turtle: I(`<ellipse cx="11" cy="13" rx="7" ry="5" fill="#2FBF71"/><path d="M6 13a5 4 0 0 1 10 0" fill="#1E9757"/><circle cx="19.5" cy="12" r="2.6" fill="#2FBF71"/><circle cx="20.3" cy="11.4" r=".7" fill="#2E2A4A"/><rect x="6" y="16.5" width="2.6" height="3" rx="1" fill="#2FBF71"/><rect x="13" y="16.5" width="2.6" height="3" rx="1" fill="#2FBF71"/>`),
  close: I(`<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>`),
  back: I(`<path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  check: I(`<path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  cross: I(`<path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>`),
  bulb: I(`<path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z" fill="currentColor"/><rect x="9" y="17.5" width="6" height="2" rx="1" fill="currentColor"/><rect x="10" y="20.5" width="4" height="1.6" rx=".8" fill="currentColor"/>`),
  flame: I(`<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z" fill="#FF9142"/><path d="M12 12c1 2 3 3 3 5a3 3 0 0 1-6 0c0-1.5 1-2.5 1.5-3 .2 1 .7 1.5 1.5 1.5 0-1.2-.4-2.4 0-3.5z" fill="#FFC83D"/>`),
  berry: I(`<path d="M12 21c-5-2.5-7.5-7-6-10.5C7 8 9.5 8 12 9.5 14.5 8 17 8 18 10.5c1.5 3.5-1 8-6 10.5z" fill="#FF4F6E"/><path d="M8 8.5l4 1.5 4-1.5-1.5-2-2.5 1-2.5-1z" fill="#2FBF71"/><g fill="#FFE08A"><circle cx="10" cy="13" r=".8"/><circle cx="14" cy="13" r=".8"/><circle cx="12" cy="16" r=".8"/><circle cx="9.5" cy="16.5" r=".7"/><circle cx="14.5" cy="16.5" r=".7"/></g>`),
  bolt: I(`<path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="#FFC83D"/>`),
  star: I(`<path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z" fill="#FFC83D" stroke="#E0A40F" stroke-width="1.2" stroke-linejoin="round"/>`),
  starOff: I(`<path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z" fill="#E9E1EC"/>`),
  book: I(`<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H11v17H5.5A1.5 1.5 0 0 1 4 18.5z" fill="#47B3F0"/><path d="M13 3h5.5A1.5 1.5 0 0 1 20 4.5v14a1.5 1.5 0 0 1-1.5 1.5H13z" fill="#2A8CC8"/><path d="M6.5 7h2.5M6.5 10h2.5M15 7h2.5M15 10h2.5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`),
  box: I(`<path d="M3 8l9-4 9 4v9l-9 4-9-4z" fill="#FFB347"/><path d="M3 8l9 4 9-4M12 12v9" stroke="#E07E1E" stroke-width="1.6" fill="none"/><circle cx="17.5" cy="6.5" r="3.5" fill="#FF4F6E"/><path d="M17.5 4.8v2M17.5 8.2v.1" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`),
  ear: I(`<path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-6 .5" stroke="#8B5CF6" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M10 10a2 2 0 0 1 4 0c0 1.5-1.5 2-1.5 3.5" stroke="#8B5CF6" stroke-width="2" fill="none" stroke-linecap="round"/>`),
  trophy: I(`<path d="M7 3h10v5a5 5 0 0 1-10 0z" fill="#FFC83D"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" stroke="#E0A40F" stroke-width="1.8" fill="none"/><rect x="10.5" y="12.5" width="3" height="4" fill="#E0A40F"/><rect x="7" y="16.5" width="10" height="4" rx="1.5" fill="#8B5CF6"/>`),
  gear: I(`<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.5l1.6 2.6 3-.6.6 3 2.6 1.6-1.4 2.9 1.4 2.9-2.6 1.6-.6 3-3-.6L12 21.5l-1.6-2.6-3 .6-.6-3-2.6-1.6 1.4-2.9-1.4-2.9 2.6-1.6.6-3 3 .6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`),
  lock: I(`<rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" stroke-width="2.4" fill="none"/>`),
  play: I(`<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>`),
  pencil: I(`<path d="M4 20l1-4L16 5l3 3L8 19z" fill="#FFC83D"/><path d="M16 5l3 3 1.5-1.5a1.5 1.5 0 0 0 0-2.1l-.9-.9a1.5 1.5 0 0 0-2.1 0z" fill="#FF7E99"/><path d="M4 20l1-4 3 3z" fill="#2E2A4A"/>`),
  chips: I(`<rect x="2.5" y="6" width="8" height="5" rx="1.6" fill="#47B3F0"/><rect x="12" y="6" width="9.5" height="5" rx="1.6" fill="#8B5CF6"/><rect x="5" y="13" width="11" height="5" rx="1.6" fill="#FF4F6E"/>`),
  grade: I(`<rect x="4" y="3" width="16" height="18" rx="3" fill="#fff" stroke="#8B5CF6" stroke-width="2"/><path d="M8 8h8M8 12h5" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="16" r="3.5" fill="#FF4F6E"/><path d="M14.6 16.1l1 1 1.9-2" stroke="#fff" stroke-width="1.4" fill="none"/>`),
  refresh: I(`<path d="M19 12a7 7 0 1 1-2.1-5" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M17.5 3v4.5H13" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  home: I(`<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" fill="currentColor"/>`),
  crown: I(`<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="#FFC83D" stroke="#E0A40F" stroke-width="1.2"/>`),
  no: I(`<circle cx="12" cy="12" r="9" fill="#FF4F6E"/><path d="M7 12h10" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>`),
  q: I(`<circle cx="12" cy="12" r="10" fill="#8B5CF6"/><path d="M9.2 9.3a2.9 2.9 0 1 1 4.2 2.6c-.9.5-1.4 1.1-1.4 2.1" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="12" cy="17.3" r="1.4" fill="#fff"/>`),
};

// ---------- lesson node icons (white glyphs on colored disc) ----------
const W = (p) => `<svg viewBox="0 0 48 48" class="ic" aria-hidden="true">${p}</svg>`;
export const NODE = {
  words: W(`<rect x="8" y="10" width="32" height="28" rx="6" fill="#fff"/><path d="M14 18h20M14 24h14M14 30h18" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".55"/>`),
  plan: W(`<path d="M10 10h28v28H28M20 38H10z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><rect x="15" y="15" width="9" height="14" rx="3" fill="#fff"/><rect x="28" y="15" width="6" height="6" rx="2" fill="#fff"/>`),
  floors: W(`<path d="M8 20L24 8l16 12" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><rect x="12" y="20" width="24" height="20" fill="none" stroke="#fff" stroke-width="4"/><path d="M12 30h24" stroke="#fff" stroke-width="4"/>`),
  text: W(`<rect x="10" y="8" width="28" height="32" rx="5" fill="#fff"/><path d="M15 16h18M15 22h12M15 28h16" stroke-width="3.4" stroke-linecap="round" stroke="#47B3F0"/><path d="M15 34h9" stroke-width="3.4" stroke-linecap="round" stroke="#FF4F6E"/>`),
  cloze: W(`<rect x="7" y="13" width="12" height="9" rx="3" fill="#fff"/><rect x="22" y="13" width="19" height="9" rx="3" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="4 3"/><rect x="7" y="27" width="20" height="9" rx="3" fill="#fff"/><rect x="30" y="27" width="11" height="9" rx="3" fill="#fff"/>`),
  where: W(`<path d="M24 6a12 12 0 0 1 12 12c0 9-12 22-12 22S12 27 12 18A12 12 0 0 1 24 6z" fill="#fff"/><circle cx="24" cy="18" r="5" fill="currentColor" opacity=".55"/>`),
  question: W(`<path d="M17 17a7 7 0 1 1 10 6.3c-2 1-3 2.4-3 4.7" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="24" cy="36" r="3.4" fill="#fff"/>`),
  me: W(`<circle cx="24" cy="17" r="8" fill="#fff"/><path d="M10 40c1-8 7-12 14-12s13 4 14 12z" fill="#fff"/>`),
  dot: W(`<rect x="8" y="12" width="32" height="26" rx="4" fill="none" stroke="#fff" stroke-width="4"/><path d="M8 25h32M24 12v26" stroke="#fff" stroke-width="3"/><circle cx="32" cy="18.5" r="4.5" fill="#FF2D2D" stroke="#fff" stroke-width="2"/>`),
  room: W(`<rect x="8" y="22" width="18" height="10" rx="3" fill="#fff"/><rect x="8" y="18" width="5" height="18" rx="2" fill="#fff"/><rect x="29" y="14" width="11" height="22" rx="2" fill="#fff"/><path d="M8 38h32" stroke="#fff" stroke-width="3"/>`),
  prep: W(`<rect x="10" y="22" width="20" height="16" rx="2" fill="#fff"/><circle cx="20" cy="14" r="6" fill="#fff"/><circle cx="36" cy="32" r="5" fill="#fff" opacity=".7"/>`),
  ear: W(`<path d="M15 18a9 9 0 0 1 18 0c0 6-6 7-6 13a5 5 0 0 1-10 .5" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M20 19a4 4 0 0 1 8 0c0 3-3 3.5-3 6.5" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>`),
  diff: W(`<rect x="6" y="12" width="16" height="24" rx="3" fill="#fff"/><rect x="26" y="12" width="16" height="24" rx="3" fill="#fff"/><circle cx="34" cy="22" r="6" fill="none" stroke="#FF2D2D" stroke-width="3"/>`),
  puzzle: W(`<path d="M10 16h8a4 4 0 1 1 8 0h8v8a4 4 0 1 0 0 8v8H10v-8a4 4 0 1 1 0-8z" fill="#fff"/>`),
  no: W(`<circle cx="24" cy="24" r="15" fill="none" stroke="#fff" stroke-width="5"/><path d="M14 34L34 14" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`),
  pencil: W(`<path d="M10 38l2-8L31 11l6 6-19 19z" fill="#fff"/><path d="M10 38l2-8 6 6z" fill="currentColor" opacity=".55"/>`),
  slots: W(`<rect x="5" y="19" width="10" height="10" rx="3" fill="#fff"/><rect x="18" y="19" width="12" height="10" rx="3" fill="#FFE1E7"/><rect x="33" y="19" width="10" height="10" rx="3" fill="#fff"/>`),
  game: W(`<rect x="8" y="8" width="32" height="32" rx="6" fill="none" stroke="#fff" stroke-width="3.5"/><path d="M8 19h32M8 29h32M19 8v32M29 8v32" stroke="#fff" stroke-width="2.5"/><circle cx="14" cy="14" r="3.5" fill="#fff"/><circle cx="24" cy="24" r="3.5" fill="#fff"/><circle cx="34" cy="34" r="3.5" fill="#fff"/>`),
  music: W(`<path d="M18 34V12l18-4v22" stroke="#fff" stroke-width="4" fill="none"/><circle cx="14" cy="34" r="5" fill="#fff"/><circle cx="32" cy="30" r="5" fill="#fff"/>`),
  exam: W(`<rect x="11" y="7" width="26" height="34" rx="4" fill="#fff"/><path d="M16 16h16M16 23h10" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".55"/><circle cx="31" cy="33" r="6" fill="#FF4F6E"/><path d="M28.5 33l2 2 3.5-3.5" stroke="#fff" stroke-width="2.2" fill="none"/>`),
  crown: W(`<path d="M8 18l8 7 8-13 8 13 8-7-3 20H11z" fill="#fff"/>`),
  castle: W(`<path d="M8 40V18h6v5h5v-5h10v5h5v-5h6v22z" fill="#fff"/><path d="M21 40v-8a3 3 0 0 1 6 0v8" fill="currentColor" opacity=".5"/>`),
  accent: W(`<text x="24" y="36" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="30" fill="#fff">é è ê</text>`.replace('font-size="30"', 'font-size="17"')),
  repeat: W(`<path d="M36 24a12 12 0 1 1-3.5-8.5" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M34 8v8h-8" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
};

// ---------- preposition pictures: a ball and a box ----------
const BOX = (x, y, w = 70, h = 56) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#F2B661"/><path d="M${x} ${y + 14}h${w}" stroke="#D99540" stroke-width="3"/><rect x="${x + w / 2 - 7}" y="${y}" width="14" height="${h}" fill="#E7A44E" opacity=".6"/></g>`;
const BALL = (x, y, r = 16) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="#FF4F6E"/><path d="M${x - r} ${y} q${r} ${r * .6} ${r * 2} 0" stroke="#fff" stroke-width="3" fill="none"/><circle cx="${x - r * .35}" cy="${y - r * .4}" r="${r * .22}" fill="#fff" opacity=".7"/></g>`;
const TABLE = `<g><rect x="50" y="60" width="100" height="10" rx="3" fill="#CF9258"/><rect x="56" y="70" width="8" height="46" fill="#A86F42"/><rect x="136" y="70" width="8" height="46" fill="#A86F42"/></g>`;
const FLOOR = `<rect x="10" y="116" width="180" height="6" rx="3" fill="#E3D6DF"/>`;
export function prepIcon(p) {
  let inner = '';
  switch (p) {
    case 'sur': inner = TABLE + BALL(100, 44); break;
    case 'sous': inner = TABLE + BALL(100, 100); break;
    case 'dans': inner = `<path d="M62 64 h76 l-8 52 h-60z" fill="#F2B661"/>` + BALL(100, 72) + `<path d="M64 80 h72 l-6 36 h-60z" fill="#E7A44E"/>`; break;
    case 'devant': inner = BOX(65, 50) + BALL(100, 100, 18); break;
    case 'derrière': inner = BALL(120, 56, 16) + BOX(65, 56); break;
    case 'entre': inner = BOX(20, 60, 54, 56) + BOX(126, 60, 54, 56) + BALL(100, 100); break;
    case 'à gauche de': inner = BOX(95, 60) + BALL(60, 100); break;
    case 'à droite de': inner = BOX(35, 60) + BALL(140, 100); break;
    case 'au milieu de': inner = `<circle cx="100" cy="86" r="44" fill="none" stroke="#8B5CF6" stroke-width="5" stroke-dasharray="8 6"/>` + BALL(100, 86) + BALL(60, 52, 9).replace('#FF4F6E', '#47B3F0') + BALL(146, 60, 9).replace('#FF4F6E', '#47B3F0') + BALL(64, 118, 9).replace('#FF4F6E', '#47B3F0'); break;
    case 'en haut': inner = `<rect x="70" y="10" width="60" height="106" rx="4" fill="#C98B52"/><path d="M70 46h60M70 80h60" stroke="#A86F42" stroke-width="5"/>` + BALL(100, 30, 13) + `<path d="M160 70 v-46 m-10 10 l10 -10 l10 10" stroke="#8B5CF6" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; break;
    case 'en bas': inner = `<rect x="70" y="10" width="60" height="106" rx="4" fill="#C98B52"/><path d="M70 46h60M70 80h60" stroke="#A86F42" stroke-width="5"/>` + BALL(100, 100, 13) + `<path d="M160 40 v46 m-10 -10 l10 10 l10 -10" stroke="#8B5CF6" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; break;
    case 'à': inner = `<rect x="44" y="34" width="112" height="82" rx="6" fill="#2FBF71"/><path d="M90 116 v-36 h20 v36" fill="#fff"/><path d="M84 54h32M100 42v24" stroke="#fff" stroke-width="7"/>`; break;
    case 'à gauche': inner = `<path d="M150 66 H56 m18 -22 l-22 22 l22 22" stroke="#8B5CF6" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; break;
    case 'à droite': inner = `<path d="M50 66 H144 m-18 -22 l22 22 l-22 22" stroke="#8B5CF6" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; break;
  }
  return `<svg viewBox="0 0 200 130" class="pic" aria-hidden="true">${FLOOR}${inner}</svg>`;
}

export function qIcon(word) {
  const sym = { 'Qui': 'M24 18a6 6 0 1 1 0 .1zM14 38c1-7 5-10 10-10s9 3 10 10z', 'Où': 'M24 10a9 9 0 0 1 9 9c0 7-9 17-9 17s-9-10-9-17a9 9 0 0 1 9-9z', 'Combien': '' };
  const label = { 'Qui': 'Wer?', 'Où': 'Wo?', 'Quel': 'Welche?', 'Quelle': 'Welche?', "Qu'est-ce que": 'Was?', 'Comment': 'Wie?', 'Combien': 'Wie viele?' }[word] || '';
  return `<svg viewBox="0 0 200 130" class="pic" aria-hidden="true"><rect x="20" y="14" width="160" height="90" rx="26" fill="#8B5CF6"/><path d="M60 100 l-8 24 l30 -24z" fill="#8B5CF6"/>
    <text x="100" y="72" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="34" fill="#fff">${label}</text></svg>`;
}
export function houseIcon(kind = 'maison') {
  if (kind === 'appartement') return `<svg viewBox="0 0 200 130" class="pic" aria-hidden="true"><rect x="10" y="122" width="180" height="6" rx="3" fill="#E3D6DF"/><rect x="56" y="10" width="88" height="114" rx="4" fill="#8B5CF6"/>${[0, 1, 2, 3].map(r => [0, 1, 2].map(c => `<rect x="${66 + c * 25}" y="${20 + r * 24}" width="17" height="15" rx="2" fill="${r === 1 && c === 2 ? '#FFC83D' : '#E9E1FF'}"/>`).join('')).join('')}<rect x="88" y="104" width="24" height="20" fill="#5B3F9E"/></svg>`;
  return `<svg viewBox="0 0 200 130" class="pic" aria-hidden="true"><rect x="10" y="122" width="180" height="6" rx="3" fill="#E3D6DF"/><path d="M40 62 L100 14 L160 62Z" fill="#E65A4F"/><rect x="52" y="60" width="96" height="64" fill="#FFE6C8"/><rect x="90" y="88" width="22" height="36" rx="3" fill="#A86F42"/><rect x="62" y="74" width="20" height="18" rx="2" fill="#9ED8FF"/><rect x="120" y="74" width="20" height="18" rx="2" fill="#9ED8FF"/><rect x="124" y="24" width="12" height="22" fill="#B54A40"/></svg>`;
}
export function strawberryLogo() {
  return `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 44C13 39 7 29 10 21c2-5 8-5 14-2 6-3 12-3 14 2 3 8-3 18-14 23z" fill="#FF4F6E"/><path d="M14 17l10 4 10-4-4-5-6 3-6-3z" fill="#2FBF71"/><path d="M24 15V8" stroke="#1E9757" stroke-width="3" stroke-linecap="round"/><g fill="#FFE08A"><circle cx="18" cy="26" r="1.5"/><circle cx="30" cy="26" r="1.5"/><circle cx="24" cy="31" r="1.5"/><circle cx="19" cy="35" r="1.4"/><circle cx="29" cy="35" r="1.4"/><circle cx="24" cy="24" r="1.4"/></g><path d="M18 30 h4 v6 h-4z" fill="#fff" opacity=".9"/></svg>`;
}
