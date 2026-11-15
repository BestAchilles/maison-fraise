// "La chambre de Lou" — front-view bedroom with exact, addressable positions (viewBox 1200x660)
import { placeChar, charG } from './char.js';

export const ROOM_W = 1200, ROOM_H = 660;

// ---------- furniture ----------
const FURN = {
  porte: { name: 'la porte', de: 'die Türe', rect: [34, 198, 132, 282], draw: () => `
    <rect x="34" y="198" width="132" height="284" rx="8" fill="#A86F42"/>
    <rect x="44" y="208" width="112" height="272" rx="5" fill="#D9995F"/>
    <rect x="58" y="222" width="84" height="104" rx="8" fill="#C9864E"/><rect x="58" y="340" width="84" height="122" rx="8" fill="#C9864E"/>
    <rect x="62" y="226" width="76" height="8" rx="4" fill="#E2A874" opacity=".7"/>
    <circle cx="140" cy="348" r="8" fill="#FFC83D"/><circle cx="138" cy="346" r="3" fill="#FFF0B8"/>` },
  affiche: { name: "l'affiche", de: 'das Poster', rect: [188, 62, 108, 146], draw: () => `
    <rect x="188" y="62" width="108" height="146" rx="4" fill="#fff" transform="rotate(-2 242 135)"/>
    <g transform="rotate(-2 242 135)">
      <rect x="198" y="72" width="88" height="112" fill="url(#posterSky)"/>
      <circle cx="262" cy="98" r="13" fill="#FFC83D"/>
      <path d="M198 184 L228 128 L246 152 L262 132 L286 184Z" fill="#7C5CB0"/><path d="M228 128 L238 146 L232 144 L224 152 L220 142Z" fill="#fff"/>
      <path d="M198 184 L286 184 L286 170 Q250 160 198 176Z" fill="#2FBF71"/>
      <text x="242" y="200" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="13" fill="#FF4F6E">LES ALPES</text>
    </g>
    <rect x="232" y="56" width="24" height="10" fill="#FFE9A8" opacity=".85" transform="rotate(-6 244 61)"/>` },
  plante: { name: 'la plante', de: 'die Pflanze', rect: [168, 296, 92, 186], draw: () => `
    <g fill="#2E9448"><path d="M212 420 C 180 380, 150 360, 160 320 C 190 330, 206 372, 212 420Z"/><path d="M214 420 C 250 386, 262 344, 248 306 C 222 322, 214 370, 214 420Z"/></g>
    <g fill="#43B865"><path d="M212 420 C 196 372, 196 330, 216 298 C 236 330, 230 380, 212 420Z"/><path d="M212 422 C 182 400, 166 396, 170 372 C 196 374, 206 398, 212 422Z"/><path d="M214 422 C 238 404, 258 402, 258 380 C 232 378, 220 400, 214 422Z"/></g>
    <g stroke="#1E7A3A" stroke-width="2" fill="none" opacity=".6"><path d="M212 420 L216 304"/><path d="M212 420 L166 326"/><path d="M214 420 L246 312"/></g>
    <path d="M182 418 L246 418 L238 482 L190 482Z" fill="#E0784C"/><rect x="178" y="410" width="72" height="16" rx="5" fill="#EE8B5E"/>` },
  lit: { name: 'le lit', de: 'das Bett', rect: [250, 318, 258, 164], draw: () => `
    <ellipse cx="384" cy="482" rx="130" ry="9" fill="#000" opacity=".1"/>
    <rect x="262" y="444" width="236" height="38" fill="#6F4A33" opacity=".28"/>
    <rect x="264" y="440" width="12" height="42" rx="3" fill="#8E5B36"/><rect x="484" y="440" width="12" height="42" rx="3" fill="#8E5B36"/>
    <path d="M250 482 L250 336 Q250 316 270 316 L270 316 Q282 316 282 336 L282 482Z" fill="#B5774A"/>
    <rect x="486" y="370" width="22" height="112" rx="8" fill="#B5774A"/>
    <rect x="272" y="398" width="230" height="46" rx="12" fill="#FFFFFF"/>
    <path d="M336 386 Q420 378 504 394 L504 440 Q420 452 336 446Z" fill="#7FCBFF"/>
    <path d="M336 386 Q420 378 504 394 L504 404 Q420 392 336 398Z" fill="#A8DCFF"/>
    <g fill="#fff" opacity=".7">${[[360, 420], [392, 432], [426, 418], [458, 430], [488, 416], [372, 400], [440, 404]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</g>
    <rect x="286" y="374" width="62" height="30" rx="13" fill="#FFFFFF" stroke="#E6DDEB" stroke-width="3"/>` },
  rideau: { name: 'le rideau', de: 'der Vorhang', rect: [500, 58, 262, 290], hitRects: [[500, 58, 56, 290], [706, 58, 56, 290]], draw: () => `
    <rect x="498" y="58" width="266" height="9" rx="4" fill="#A86F42"/><circle cx="498" cy="62" r="8" fill="#A86F42"/><circle cx="764" cy="62" r="8" fill="#A86F42"/>
    <path d="M504 66 L552 66 Q548 200 566 340 L520 344 Q508 300 512 260 Q500 200 504 66Z" fill="#FF7E99"/>
    <path d="M760 66 L712 66 Q716 200 698 340 L744 344 Q756 300 752 260 Q764 200 760 66Z" fill="#FF7E99"/>
    <g stroke="#E85A7A" stroke-width="3" fill="none" opacity=".7"><path d="M520 70 Q516 200 530 338"/><path d="M536 70 Q534 200 548 340"/><path d="M744 70 Q748 200 734 338"/><path d="M728 70 Q730 200 716 340"/></g>` },
  fenetre: { name: 'la fenêtre', de: 'das Fenster', rect: [540, 78, 184, 228], draw: () => `
    <rect x="548" y="80" width="168" height="214" rx="6" fill="#fff"/>
    <rect x="560" y="92" width="144" height="192" fill="url(#windowSky)"/>
    <g fill="#fff" opacity=".9"><ellipse cx="600" cy="130" rx="22" ry="10"/><ellipse cx="616" cy="124" rx="16" ry="11"/><ellipse cx="672" cy="170" rx="18" ry="8"/></g>
    <path d="M560 284 Q590 236 630 250 Q666 228 704 262 L704 284Z" fill="#7AD08F"/>
    <rect x="626" y="92" width="12" height="192" fill="#fff"/><rect x="560" y="182" width="144" height="12" fill="#fff"/>
    <rect x="538" y="288" width="188" height="16" rx="5" fill="#F1E2D3"/>` },
  lampe: { name: 'la lampe', de: 'die Lampe', rect: [588, 0, 90, 132], draw: () => `
    <path d="M632 0 L632 74" stroke="#5B5470" stroke-width="3"/>
    <ellipse cx="632" cy="124" rx="22" ry="10" fill="#FFF3B0" opacity=".9"/>
    <path d="M590 120 L674 120 L652 72 L612 72Z" fill="#FFC83D"/><path d="M590 120 L674 120 L670 112 L594 112Z" fill="#E9A814"/>
    <ellipse cx="632" cy="72" rx="20" ry="5" fill="#E9A814"/>` },
  table: { name: 'la table', de: 'der Tisch', rect: [536, 378, 192, 104], draw: () => `
    <ellipse cx="632" cy="484" rx="96" ry="8" fill="#000" opacity=".1"/>
    <rect x="552" y="396" width="14" height="86" rx="4" fill="#A86F42"/><rect x="698" y="396" width="14" height="86" rx="4" fill="#A86F42"/>
    <rect x="550" y="392" width="164" height="12" fill="#B27A47"/>
    <rect x="536" y="380" width="192" height="16" rx="6" fill="#CF9258"/><rect x="540" y="382" width="184" height="4" rx="2" fill="#E5AE77"/>` },
  chaise: { name: 'la chaise', de: 'der Stuhl', rect: [730, 312, 82, 170], draw: () => `
    <rect x="738" y="414" width="10" height="68" rx="3" fill="#C4773C"/><rect x="794" y="414" width="10" height="68" rx="3" fill="#C4773C"/>
    <rect x="790" y="314" width="18" height="104" rx="7" fill="#E39B5B"/><rect x="793" y="330" width="12" height="70" rx="4" fill="#F0B27A" opacity=".6"/>
    <rect x="730" y="404" width="80" height="14" rx="6" fill="#EBA466"/>` },
  fauteuil: { name: 'le fauteuil', de: 'der Sessel', rect: [814, 342, 138, 142], draw: () => `
    <ellipse cx="884" cy="484" rx="72" ry="8" fill="#000" opacity=".1"/>
    <rect x="830" y="460" width="10" height="22" rx="3" fill="#2B6F4C"/><rect x="928" y="460" width="10" height="22" rx="3" fill="#2B6F4C"/>
    <path d="M832 436 L832 372 Q832 344 860 344 L908 344 Q936 344 936 372 L936 436Z" fill="#3FB27F"/>
    <path d="M844 372 Q844 356 860 356 L908 356 Q924 356 924 372 L924 412 L844 412Z" fill="#4FC48D"/>
    <rect x="834" y="412" width="100" height="36" rx="12" fill="#5ACF97"/>
    <rect x="814" y="390" width="32" height="74" rx="14" fill="#34A070"/><rect x="922" y="390" width="32" height="74" rx="14" fill="#34A070"/>
    <rect x="818" y="392" width="24" height="10" rx="5" fill="#4FC48D"/><rect x="926" y="392" width="24" height="10" rx="5" fill="#4FC48D"/>` },
  commode: { name: 'la commode', de: 'die Kommode', rect: [958, 364, 94, 118], draw: () => `
    <rect x="964" y="372" width="84" height="110" rx="5" fill="#EAF4F0"/><rect x="958" y="364" width="96" height="12" rx="5" fill="#D6E9E1"/>
    ${[384, 416, 448].map(y => `<rect x="970" y="${y}" width="72" height="26" rx="5" fill="#F7FBF9" stroke="#CFE2DA" stroke-width="2"/><circle cx="1006" cy="${y + 13}" r="4" fill="#9CC5B3"/>`).join('')}` },
  etagere: { name: "l'étagère", de: 'das Gestell', alt: ['la bibliothèque'], rect: [956, 140, 100, 200], draw: () => `
    <rect x="958" y="144" width="96" height="192" rx="4" fill="#C98B52"/><rect x="966" y="150" width="80" height="182" fill="#A9703F"/>
    ${[206, 268].map(y => `<rect x="962" y="${y}" width="88" height="8" fill="#D9A06A"/>`).join('')}<rect x="958" y="330" width="96" height="10" rx="3" fill="#D9A06A"/>
    <g><path d="M972 268 l4 -18 h14 l4 18z" fill="#E0784C"/><path d="M983 250 c-8 -14 -2 -24 0 -26 c4 6 10 14 0 26z M983 250 c6 -12 14 -14 16 -14 c-2 8 -8 14 -16 14z" fill="#43B865"/>
      <rect x="1018" y="240" width="28" height="28" rx="3" fill="#F2B661"/><path d="M1018 248 h28" stroke="#D99540" stroke-width="2"/></g>` },
  armoire: { name: "l'armoire", de: 'der Schrank', rect: [1058, 138, 140, 346], draw: () => `
    <rect x="1060" y="146" width="108" height="336" rx="6" fill="#3FA77B"/><rect x="1056" y="138" width="116" height="14" rx="5" fill="#35936A"/>
    <rect x="1064" y="156" width="50" height="320" rx="4" fill="#4FB98A"/><rect x="1070" y="166" width="38" height="140" rx="6" fill="#5CC797"/><rect x="1070" y="318" width="38" height="146" rx="6" fill="#5CC797"/>
    <circle cx="1106" cy="312" r="5" fill="#FFC83D"/>
    <rect x="1116" y="156" width="48" height="320" fill="#24684B"/>
    <rect x="1118" y="176" width="44" height="5" rx="2" fill="#B9C3D6"/>
    ${[[1120, 200, '#FFC83D'], [1132, 198, '#FF7E99'], [1144, 202, '#47B3F0']].map(([x, y, c]) => `<path d="M${x} ${y} l-6 30 l14 0 z" fill="${c}"/>`).join('')}
    <rect x="1118" y="380" width="44" height="5" fill="#1C5640"/>
    <g>${[[1120, 352, '#FF4F6E'], [1120, 364, '#FFC83D'], [1120, 400, '#8B5CF6'], [1120, 412, '#47B3F0'], [1120, 424, '#FF9142']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="40" height="11" rx="3" fill="${c}"/>`).join('')}</g>
    <path d="M1168 150 L1198 132 L1198 500 L1168 480Z" fill="#4FB98A"/><circle cx="1176" cy="312" r="4.5" fill="#FFC83D"/>` },
  tapis: { name: 'le tapis', de: 'der Teppich', rect: [520, 520, 340, 92], draw: () => `
    <path d="M548 522 L842 522 L872 608 L518 608Z" fill="#F0697F"/>
    <path d="M562 530 L830 530 L852 598 L540 598Z" fill="none" stroke="#FFD1DA" stroke-width="5"/>
    <path d="M600 548 L790 548 L800 580 L590 580Z" fill="#FFB347" opacity=".75"/>
    <path d="M660 556 L730 556 L736 572 L654 572Z" fill="#2FBF71" opacity=".7"/>
    <g stroke="#E2546D" stroke-width="3">${Array.from({ length: 18 }, (_, i) => `<path d="M${526 + i * 19.5} 608 l-2 12"/>`).join('')}</g>` },
  corbeille: { name: 'la corbeille à papier', de: 'der Papierkorb', rect: [423, 492, 58, 70], draw: () => `<g transform="translate(-69 0)">
    <ellipse cx="521" cy="560" rx="24" ry="5" fill="#000" opacity=".12"/>
    <path d="M498 500 L544 500 L538 558 L504 558Z" fill="#E9EEF7"/>
    <g stroke="#B9C3D6" stroke-width="2.4">${[506, 514, 522, 530, 538].map(x => `<path d="M${x} 502 L${x - (x - 521) * .14} 556"/>`).join('')}<path d="M500 520 L542 520"/><path d="M502 540 L540 540"/></g>
    <ellipse cx="521" cy="500" rx="23" ry="5" fill="none" stroke="#9AA6BE" stroke-width="3"/>
    <circle cx="514" cy="497" r="7" fill="#fff" stroke="#DDD" stroke-width="2"/><circle cx="528" cy="495" r="6" fill="#FFF7D6" stroke="#E8DCA8" stroke-width="2"/></g>` },
};
export const FURNITURE = FURN;
const FURN_ORDER = ['affiche', 'porte', 'fenetre', 'rideau', 'lampe', 'etagere', 'armoire', 'plante', 'lit', 'table', 'chaise', 'fauteuil', 'commode', 'tapis', 'corbeille'];

// ---------- locations (anchor = bottom-centre of an item; rect = tap zone) ----------
export const LOC = {
  'sur la table':            { x: 630, y: 381, rect: [540, 318, 186, 64], alt: [[575, 381], [690, 381]] },
  'sous la table':           { x: 632, y: 478, rect: [552, 398, 160, 84], maxH: 70 },
  'sur le lit':              { x: 430, y: 394, rect: [272, 334, 236, 110], alt: [[372, 392], [470, 396]] },
  'sous le lit':             { x: 388, y: 479, rect: [272, 444, 232, 40], maxH: 34 },
  'sur la chaise':           { x: 762, y: 405, rect: [726, 340, 86, 78] },
  'sous la chaise':          { x: 768, y: 480, rect: [736, 418, 64, 62] },
  'sur le fauteuil':         { x: 884, y: 414, rect: [834, 356, 108, 92] },
  'sous le fauteuil':        { x: 884, y: 484, rect: [840, 446, 92, 40], maxH: 20 },
  'derrière le fauteuil':    { x: 884, y: 400, rect: [836, 290, 100, 58] },
  'devant le fauteuil':      { x: 912, y: 584, rect: [870, 494, 90, 100] },
  'sur la commode':          { x: 1006, y: 365, rect: [956, 322, 100, 54] },
  "dans l'armoire":          { x: 1140, y: 330, rect: [1060, 152, 138, 330] },
  "sur l'armoire":           { x: 1112, y: 140, rect: [1050, 78, 130, 64] },
  "devant l'armoire":        { x: 1112, y: 592, rect: [1056, 500, 132, 100] },
  'sur le tapis':            { x: 700, y: 584, rect: [526, 522, 340, 88], alt: [[640, 584], [770, 584]] },
  'devant la porte':         { x: 100, y: 588, rect: [34, 492, 140, 104] },
  'sur la corbeille à papier': { x: 452, y: 496, rect: [418, 466, 68, 40] },
  'dans la corbeille à papier': { x: 452, y: 518, rect: [420, 498, 64, 64], maxH: 42 },
  "en haut de l'étagère":    { x: 1018, y: 205, rect: [962, 150, 90, 56] },
  "en bas de l'étagère":     { x: 1025, y: 329, rect: [962, 274, 90, 58] },
  'devant la fenêtre':       { x: 632, y: 290, rect: [560, 196, 144, 96] },
  'sur la lampe':            { x: 632, y: 74, rect: [588, 30, 88, 92], maxH: 40 },
  "à droite de l'affiche":   { x: 340, y: 210, rect: [300, 66, 76, 150] },
  "sous l'affiche":          { x: 242, y: 282, rect: [194, 212, 96, 74] },
  'dans la plante':          { x: 214, y: 372, rect: [172, 300, 84, 110], maxH: 60 },
  'à droite du lit':         { x: 521, y: 480, rect: [500, 320, 44, 165] },
  'derrière le rideau':      { x: 528, y: 340, rect: [500, 70, 58, 274] },
  'à gauche de la porte':    { x: 16, y: 478, rect: [0, 300, 34, 180] },
};
// same zone, other wording
export const LOC_SAME = {
  'à droite du lit': ['entre le lit et la table', 'à gauche de la table'],
  'dans la plante': ['sur la plante'],
  'devant la fenêtre': ['contre la fenêtre'],
  'sur la corbeille à papier': ['sur la corbeille'],
  'dans la corbeille à papier': ['dans la corbeille'],
  'sur le tapis': ['au milieu du tapis'],
  'sur le lit': ['au milieu du lit'],
  "en haut de l'étagère": ["dans l'étagère en haut", "sur l'étagère en haut"],
  "en bas de l'étagère": ["dans l'étagère en bas", "sur l'étagère en bas"],
};

// ---------- small objects (drawn around bottom-centre 0,0) ----------
export const OBJ = {
  casquette: { name: 'la casquette', de: 'die Mütze', h: 30, w: 80, draw: () => `<path d="M-28 0 Q-28 -30 0 -30 Q26 -30 26 -4 L26 0Z" fill="#3A86FF"/><path d="M14 -2 Q40 -6 46 2 Q30 6 10 2Z" fill="#2563C9"/><path d="M-6 -30 Q0 -14 -2 0" stroke="#2563C9" stroke-width="3" fill="none"/><circle cx="0" cy="-30" r="4" fill="#fff"/>` },
  ordinateur: { name: "l'ordinateur", de: 'der Computer', h: 46, draw: () => `<path d="M-30 -46 L30 -46 L30 -8 L-30 -8Z" fill="#5B6178"/><rect x="-26" y="-42" width="52" height="30" rx="2" fill="#7FD3FF"/><path d="M-26 -42 L0 -42 L-26 -18Z" fill="#fff" opacity=".35"/><path d="M-38 0 L38 0 L30 -8 L-30 -8Z" fill="#9AA3B8"/>` },
  veste: { name: 'la veste', de: 'die Jacke', h: 64, w: 86, draw: () => `<path d="M-24 0 L-30 -50 Q-30 -62 -16 -64 L-6 -60 L0 -40 L6 -60 L16 -64 Q30 -62 30 -50 L24 0Z" fill="#8B5CF6"/><path d="M-30 -50 L-40 -14 L-32 -12 L-26 -38Z M30 -50 L40 -14 L32 -12 L26 -38Z" fill="#7444E6"/><path d="M0 -40 L0 0" stroke="#6C3EDB" stroke-width="3"/><circle cx="-4" cy="-28" r="2.5" fill="#FFC83D"/><circle cx="-4" cy="-14" r="2.5" fill="#FFC83D"/>` },
  regle: { name: 'la règle', de: 'das Lineal', h: 12, w: 92, draw: () => `<rect x="-42" y="-12" width="84" height="12" rx="2" fill="#FFC83D" stroke="#E0A40F" stroke-width="2"/><g stroke="#8A6200" stroke-width="2">${Array.from({ length: 10 }, (_, i) => `<path d="M${-36 + i * 8} -12 v${i % 2 ? 4 : 6}"/>`).join('')}</g>` },
  pull: { name: 'le pull', de: 'der Pullover', h: 50, w: 100, draw: () => `<path d="M-22 0 L-24 -40 L-40 -26 L-48 -38 L-22 -52 L-10 -50 Q0 -42 10 -50 L22 -52 L48 -38 L40 -26 L24 -40 L22 0Z" fill="#2FC4B2"/><path d="M-22 -8 L22 -8" stroke="#1FA090" stroke-width="5"/><path d="M-10 -50 Q0 -40 10 -50" stroke="#1FA090" stroke-width="4" fill="none"/>` },
  lunettes: { name: 'les lunettes de soleil', de: 'die Sonnenbrille', h: 20, w: 66, draw: () => `<path d="M-30 -18 L-4 -18 L-6 -4 Q-16 2 -26 -4Z M4 -18 L30 -18 L26 -4 Q16 2 6 -4Z" fill="#2E2A4A"/><path d="M-4 -16 Q0 -20 4 -16" stroke="#2E2A4A" stroke-width="3" fill="none"/><path d="M-26 -14 L-16 -14" stroke="#fff" stroke-width="2" opacity=".6"/><path d="M8 -14 L18 -14" stroke="#fff" stroke-width="2" opacity=".6"/>` },
  teeshirt: { name: 'le tee-shirt', de: 'das T-Shirt', h: 50, w: 90, draw: () => `<path d="M-20 0 L-20 -36 L-34 -28 L-42 -42 L-18 -54 Q0 -44 18 -54 L42 -42 L34 -28 L20 -36 L20 0Z" fill="#FFC83D"/><circle cx="0" cy="-26" r="8" fill="#FF4F6E"/>` },
  violon: { name: 'le violon', de: 'die Geige', h: 92, w: 42, draw: () => `<path d="M0 -2 C -16 -2, -18 -18, -10 -24 C -16 -30, -16 -44, 0 -48 C 16 -44, 16 -30, 10 -24 C 18 -18, 16 -2, 0 -2Z" fill="#B5652F"/><path d="M-3 -46 L-3 -88 L3 -88 L3 -46Z" fill="#3B2A20"/><path d="M-5 -92 q5 -6 10 0 l0 6 l-10 0z" fill="#3B2A20"/><path d="M-6 -24 q6 2 12 0" stroke="#3B2A20" stroke-width="2.5" fill="none"/><g stroke="#FFE7B0" stroke-width="1"><path d="M-1 -10 L-1 -86"/><path d="M1 -10 L1 -86"/></g>` },
  ballon: { name: 'le ballon', de: 'der Ball', h: 44, w: 50, draw: () => `<circle cx="0" cy="-22" r="22" fill="#fff" stroke="#2E2A4A" stroke-width="2.5"/><path d="M0 -30 l8 6 l-3 9 h-10 l-3 -9z" fill="#2E2A4A"/><path d="M-20 -30 l6 4 M20 -30 l-6 4 M-12 -4 l4 -7 M12 -4 l-4 -7 M0 -44 l0 8" stroke="#2E2A4A" stroke-width="3"/>` },
  ski: { name: 'le ski', de: 'der Ski', h: 150, w: 22, draw: () => `<path d="M-6 0 L-6 -138 Q0 -152 6 -138 L6 0Z" fill="#FF4F6E"/><path d="M-6 -60 L6 -60 L6 -46 L-6 -46Z" fill="#2E2A4A"/><path d="M-2 -130 L-2 -10" stroke="#fff" stroke-width="2" opacity=".6"/>` },
  pomme: { name: 'la pomme', de: 'der Apfel', h: 30, w: 42, draw: () => `<path d="M0 0 C -20 0, -20 -28, -6 -28 C -3 -28, -1 -26, 0 -24 C 1 -26, 3 -28, 6 -28 C 20 -28, 20 0, 0 0Z" fill="#FF4F6E"/><path d="M0 -24 q2 -8 6 -10" stroke="#6B4226" stroke-width="3" fill="none"/><path d="M4 -32 q10 -6 12 2 q-8 4 -12 -2z" fill="#2FBF71"/><ellipse cx="-8" cy="-18" rx="3" ry="5" fill="#fff" opacity=".45"/>` },
  livres: { name: 'les livres', de: 'die Bücher', h: 40, w: 60, draw: () => `<rect x="-26" y="-12" width="52" height="12" rx="2" fill="#47B3F0"/><rect x="-22" y="-24" width="46" height="12" rx="2" fill="#FFC83D"/><rect x="-24" y="-38" width="50" height="14" rx="2" fill="#FF4F6E"/><g fill="#fff" opacity=".7"><rect x="-22" y="-8" width="44" height="2"/><rect x="-18" y="-20" width="38" height="2"/><rect x="-20" y="-33" width="42" height="2"/></g>` },
  parapluie: { name: 'le parapluie', de: 'der Regenschirm', h: 96, w: 30, draw: () => `<path d="M0 -96 L-12 -30 L0 -24 L12 -30Z" fill="#2E2A4A"/><path d="M0 -24 L0 -6 Q0 2 -8 0" stroke="#2E2A4A" stroke-width="4" fill="none" stroke-linecap="round"/>` },
  guitare: { name: 'la guitare', de: 'die Gitarre', h: 100, w: 52, draw: () => `<path d="M0 0 C -24 0, -24 -26, -12 -32 C -18 -40, -16 -54, 0 -56 C 16 -54, 18 -40, 12 -32 C 24 -26, 24 0, 0 0Z" fill="#F2A24B"/><circle cx="0" cy="-30" r="7" fill="#5B3A29"/><rect x="-3" y="-98" width="6" height="46" fill="#5B3A29"/><rect x="-6" y="-104" width="12" height="10" rx="2" fill="#5B3A29"/>` },
  chat: { name: 'le chat', de: 'die Katze', h: 70, w: 80, draw: () => `<g transform="scale(${70 / 240}) translate(-100 -238)">${charG('cat')}</g>` },
};

// ---------- helpers ----------
const defs = `<defs>
  <linearGradient id="windowSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ED8FF"/><stop offset="1" stop-color="#E1F5FF"/></linearGradient>
  <linearGradient id="posterSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD8E2"/><stop offset="1" stop-color="#FFF4D6"/></linearGradient>
  <linearGradient id="floorShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".3" stop-color="#000" stop-opacity="0"/></linearGradient>
  <clipPath id="binclip"><rect x="-80" y="-220" width="160" height="208"/></clipPath>
  <pattern id="wallpaper" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#FDEBD9"/><rect width="22" height="44" fill="#FBE4CF"/><circle cx="11" cy="14" r="2.2" fill="#F7D3B4"/></pattern>
  <pattern id="planks" width="160" height="38" patternUnits="userSpaceOnUse"><rect width="160" height="38" fill="#DDA56B"/><rect y="36" width="160" height="2" fill="#C68B52"/><rect x="100" width="2" height="36" fill="#C68B52"/><rect x="20" y="10" width="40" height="2" rx="1" fill="#E7B67F" opacity=".7"/></pattern>
</defs>`;

/** article helpers for sentence building */
export function itemName(id) { return (OBJ[id] || FURN[id]).name; }

/**
 * roomSVG(cfg)
 *  cfg.items: [{ o:'casquette', at:'sur la table', slot?:0|1|2, rot?, scale? }]
 *  cfg.chars: [{ who:'lou', at:'devant la porte', h:150, mood }]
 *  cfg.hits: 'furniture' | 'objects' | 'locations' | 'all' | null
 *  cfg.locs: optional list of location keys to expose as zones
 *  cfg.dim: furniture ids to grey out; cfg.hide: furniture ids to omit
 */
export function roomSVG(cfg = {}) {
  const hits = cfg.hits || null;
  const hide = new Set(cfg.hide || []);
  let s = `<svg viewBox="0 0 ${ROOM_W} ${ROOM_H}" class="room-svg" role="img" aria-label="Lous Zimmer">${defs}
  <rect width="${ROOM_W}" height="472" fill="url(#wallpaper)"/>
  <rect width="${ROOM_W}" height="16" fill="#EBCDAE"/>
  <rect y="470" width="${ROOM_W}" height="${ROOM_H - 470}" fill="url(#planks)"/>
  <rect y="470" width="${ROOM_W}" height="${ROOM_H - 470}" fill="url(#floorShade)"/>
  <rect y="458" width="${ROOM_W}" height="14" fill="#E4C098"/>
  <g fill="none" stroke="#2E2A4A" stroke-width="3" opacity=".75"><circle cx="460" cy="150" r="24" fill="#fff"/><path d="M460 150 L460 134 M460 150 L472 156"/></g>`;
  // furniture back to front
  for (const id of FURN_ORDER) {
    if (hide.has(id)) continue;
    const f = FURN[id];
    const dim = cfg.dim && cfg.dim.includes(id) ? ' opacity=".35"' : '';
    const hitAttr = (hits === 'furniture' || hits === 'all') ? ` data-hit="${id}"` : '';
    s += `<g class="furn"${hitAttr}${dim}>${f.draw()}${hitAttr ? hitRects(f) : ''}</g>`;
    // items that belong "behind" the armchair go right after the wall pieces
    if (id === 'chaise') s += drawItems(cfg.items, hits, it => it.at === 'derrière le fauteuil');
  }
  s += drawItems(cfg.items, hits, it => it.at !== 'derrière le fauteuil');
  if ((cfg.items || []).some(it => it.at === 'dans la corbeille à papier') && !hide.has('corbeille'))
    s += `<g transform="translate(-69 0)" pointer-events="none"><path d="M500 502 L542 502 L538 558 L504 558Z" fill="#E9EEF7"/><g stroke="#B9C3D6" stroke-width="2.4">${[506, 514, 522, 530, 538].map(x => `<path d="M${x} 504 L${x - (x - 521) * .14} 556"/>`).join('')}<path d="M500 520 L542 520"/><path d="M502 540 L540 540"/></g><path d="M498 501 Q521 508 544 501" fill="none" stroke="#9AA6BE" stroke-width="3"/></g>`;
  for (const c of cfg.chars || []) {
    const L = LOC[c.at] || { x: c.x, y: c.y };
    s += placeChar(c.who, L.x + (c.dx || 0), L.y + (c.dy || 0), c.h || 150, { mood: c.mood, pose: c.pose, flip: c.flip, attrs: c.hit ? `data-hit="char:${c.who}"` : '' });
  }
  if (hits === 'locations') {
    const keys = cfg.locs || Object.keys(LOC);
    // smaller zones last so they win
    const sorted = keys.slice().sort((a, b) => area(LOC[b].rect) - area(LOC[a].rect));
    for (const k of sorted) { const [x, y, w, hh] = LOC[k].rect; s += `<rect class="zone" data-loc="${k}" x="${x}" y="${y}" width="${w}" height="${hh}" rx="10" fill="rgba(139,92,246,0)"/>`; }
  }
  s += `<g class="marks"></g></svg>`;
  return s;
}
const area = (r) => r[2] * r[3];
function hitRects(f) {
  const rs = f.hitRects || [f.rect];
  return rs.map(([x, y, w, hh]) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="transparent"/>`).join('');
}
function drawItems(items = [], hits, filter) {
  let s = '';
  const used = {};
  for (const it of items.filter(filter)) {
    const L = LOC[it.at]; const o = OBJ[it.o]; if (!L || !o) continue;
    const n = used[it.at] = (used[it.at] ?? -1) + 1;
    let [x, y] = it.slot != null && L.alt && L.alt[it.slot] ? L.alt[it.slot] : (n > 0 && L.alt && L.alt[n - 1] ? L.alt[n - 1] : [L.x, L.y]);
    x += it.dx || 0; y += it.dy || 0;
    const sc = it.scale || (L.maxH && o.h > L.maxH ? L.maxH / o.h : 1), rot = it.rot || 0;
    const hitAttr = (hits === 'objects' || hits === 'all') ? ` data-hit="obj:${it.o}"` : '';
    const w = o.w || 70;
    s += `<g class="item"${hitAttr} transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})">${o.draw()}<rect x="${-w / 2 - 4}" y="${-o.h - 6}" width="${w + 8}" height="${o.h + 10}" fill="transparent"/></g>`;
  }
  return s;
}

/** small furniture icon (for vocab cards) */
export function furnIcon(id, size = 120) {
  const f = FURN[id]; if (!f) return '';
  const [x, y, w, hh] = f.rect; const pad = 14;
  return `<svg viewBox="${x - pad} ${y - pad} ${w + pad * 2} ${hh + pad * 2}" class="pic" aria-hidden="true">${defs}${f.draw()}</svg>`;
}
export function objIcon(id) {
  const o = OBJ[id]; if (!o) return '';
  const hh = o.h + 16, w = Math.max(100, hh);
  return `<svg viewBox="${-w / 2} ${-hh} ${w} ${hh + 8}" class="pic" aria-hidden="true">${o.draw()}</svg>`;
}
