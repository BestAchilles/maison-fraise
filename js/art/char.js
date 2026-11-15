// Original characters: Lou the fox + family, Madame Chouette (owl), Minou (cat), Bip (robot)
// All drawn in a 200x240 box, feet at the bottom centre (100,236).

const INK = '#2E2A4A';
const FAM = {
  lou:   { fur: '#FF8A3D', shade: '#EE7426', shirt: '#FF4F6E', scale: .86, scarf: '#2FC4B2', name: 'Lou' },
  mia:   { fur: '#FF9549', shade: '#F07F31', shirt: '#8B5CF6', scale: .8, bow: '#FF6FA3', name: 'Mia' },
  tom:   { fur: '#FF8640', shade: '#EC7024', shirt: '#47B3F0', scale: .82, cap: '#2A8CC8', name: 'Tom' },
  maman: { fur: '#FF9C55', shade: '#F2843A', shirt: '#2FBF71', scale: 1, flower: '#FFC83D', lashes: true, name: 'Maman' },
  papa:  { fur: '#E9772C', shade: '#D2621A', shirt: '#F4F1F8', scale: 1.04, tie: '#FF4F6E', name: 'Papa' },
  papi:  { fur: '#D7A27C', shade: '#C58D66', shirt: '#9C6B4E', scale: .98, glasses: true, mous: true, beret: '#3A4E8C', name: 'Papi' },
  mamie: { fur: '#E8B791', shade: '#D9A27A', shirt: '#C9A7F5', scale: .94, glasses: true, bun: true, lashes: true, name: 'Mamie' },
  tonton:{ fur: '#F28A4A', shade: '#DD7433', shirt: '#FFC83D', scale: 1.02, hat: '#2E2A4A', name: 'Tonton Jules' },
};
export const FAMILY = FAM;

function eyes(mood, x1 = 74, x2 = 126, y = 92) {
  if (mood === 'joy' || mood === 'sleep') {
    const d = mood === 'sleep' ? 'M-11 0 Q0 6 11 0' : 'M-11 4 Q0 -9 11 4';
    return `<g fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"><path transform="translate(${x1} ${y})" d="${d}"/><path transform="translate(${x2} ${y})" d="${d}"/></g>`;
  }
  const ry = mood === 'wow' ? 15 : 13.5;
  const e = (x) => `<g class="blink"><ellipse cx="${x}" cy="${y}" rx="11" ry="${ry}" fill="${INK}"/><circle cx="${x + 4}" cy="${y - 5}" r="4.4" fill="#fff"/><circle cx="${x - 4}" cy="${y + 6}" r="2" fill="#fff" opacity=".85"/></g>`;
  return e(x1) + e(x2);
}
function brows(mood) {
  if (mood === 'sad') return `<g stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M62 70 L84 76"/><path d="M138 70 L116 76"/></g>`;
  if (mood === 'think') return `<g stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M62 72 Q73 64 84 70"/><path d="M116 66 L138 70"/></g>`;
  if (mood === 'wow') return `<g stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M62 66 Q73 58 84 64"/><path d="M116 64 Q127 58 138 66"/></g>`;
  return '';
}
function mouth(mood) {
  switch (mood) {
    case 'joy': return `<path d="M86 121 Q100 146 114 121 Z" fill="#8E2F44"/><path d="M93 131 Q100 140 107 131 Q100 127 93 131Z" fill="#FF7C93"/>`;
    case 'sad': return `<path d="M90 131 Q100 122 110 131" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    case 'wow': return `<ellipse cx="100" cy="129" rx="7" ry="9" fill="#8E2F44"/>`;
    case 'sleep': return `<path d="M93 127 Q100 131 107 127" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case 'think': return `<path d="M92 128 Q102 124 110 129" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    default: return `<path d="M88 122 Q100 135 112 122" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  }
}

/** Fox body + head as a <g> in 200x240 space */
export function foxG(who = 'lou', { mood = 'happy', pose = 'stand' } = {}) {
  const c = FAM[who] || FAM.lou;
  const fur = c.fur, shade = c.shade, cream = '#FFF6EC', dark = '#5B3A29';
  const armL = pose === 'cheer'
    ? `<path d="M66 168 C 46 160, 22 136, 14 110 C 10 98, 24 94, 28 104 C 36 126, 56 148, 76 160Z" fill="${fur}"/><circle cx="19" cy="102" r="9.5" fill="${dark}"/>`
    : `<path d="M66 170 C 50 180, 46 200, 56 208 C 64 212, 70 200, 75 186Z" fill="${fur}"/><circle cx="57" cy="205" r="8.5" fill="${dark}"/>`;
  const armR = (pose === 'wave' || pose === 'cheer')
    ? `<g class="${pose === 'wave' ? 'wavearm' : ''}"><path d="M134 168 C 154 160, 178 136, 186 110 C 190 98, 176 94, 172 104 C 164 126, 144 148, 124 160Z" fill="${fur}"/><circle cx="181" cy="102" r="9.5" fill="${dark}"/></g>`
    : `<path d="M134 170 C 150 180, 154 200, 144 208 C 136 212, 130 200, 125 186Z" fill="${fur}"/><circle cx="143" cy="205" r="8.5" fill="${dark}"/>`;
  const shirt = `<path d="M64 222 C 58 192, 66 160, 100 156 C 134 160, 142 192, 136 222 Q100 230 64 222Z" fill="${c.shirt}"/>
    <path d="M86 158 Q100 172 114 158" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="3"/>`;
  let extras = '';
  if (c.tie) extras += `<path d="M96 162 L104 162 L108 196 L100 206 L92 196Z" fill="${c.tie}"/><path d="M95 160 L105 160 L102 168 L98 168Z" fill="#C93450"/>`;
  if (who === 'lou') extras += `<circle cx="100" cy="196" r="13" fill="#fff"/><path d="M100 207 C 89 201, 88 191, 92 187 C 95 184, 98 185, 100 187 C 102 185, 105 184, 108 187 C 112 191, 111 201, 100 207Z" fill="#FF4F6E"/><path d="M93 186 L100 189 L107 186 L104 183 L100 185 L96 183Z" fill="#2FBF71"/><g fill="#FFE08A"><circle cx="97" cy="193" r="1.2"/><circle cx="103" cy="194" r="1.2"/><circle cx="100" cy="199" r="1.2"/></g>`;
  if (c.scarf) extras += `<path d="M66 158 Q100 176 134 158 L136 168 Q100 186 64 168Z" fill="${c.scarf}"/><path d="M118 168 L132 196 L120 198 L110 172Z" fill="${c.scarf}"/>`;
  if (who === 'mamie') extras += `<path d="M64 168 Q100 196 136 168 L132 186 Q100 206 68 186Z" fill="#FFF0F6" opacity=".95"/>`;
  if (who === 'maman') extras += `<g fill="#fff">${[84, 92, 100, 108, 116].map((x, i) => `<circle cx="${x}" cy="${164 + (i === 2 ? 4 : Math.abs(2 - i) === 1 ? 2.5 : 0)}" r="3"/>`).join('')}</g>`;

  const tail = `<g class="tail"><path d="M126 206 C 170 210, 198 176, 188 132 C 184 116, 170 110, 160 122 C 170 152, 152 182, 122 186Z" fill="${fur}"/>
    <path d="M188 132 C 184 116, 170 110, 160 122 C 168 130, 176 134, 188 132Z" fill="${cream}"/></g>`;
  const legs = `<ellipse cx="82" cy="230" rx="17" ry="8" fill="${dark}"/><ellipse cx="118" cy="230" rx="17" ry="8" fill="${dark}"/>`;
  const ears = `<path d="M44 70 L30 4 L90 40Z" fill="${fur}"/><path d="M30 4 L42 30 L50 21Z" fill="${dark}"/><path d="M47 60 L40 22 L76 42Z" fill="#FFD6C0"/>
    <path d="M156 70 L170 4 L110 40Z" fill="${fur}"/><path d="M170 4 L158 30 L150 21Z" fill="${dark}"/><path d="M153 60 L160 22 L124 42Z" fill="#FFD6C0"/>`;
  const head = `<path d="M100 28 C 142 28, 170 58, 170 92 C 171 108, 164 116, 178 128 C 158 138, 140 148, 100 148 C 60 148, 42 138, 22 128 C 36 116, 29 108, 30 92 C 30 58, 58 28, 100 28Z" fill="${fur}"/>
    <path d="M100 72 C 120 72, 128 96, 150 104 C 161 108, 167 120, 178 128 C 158 138, 140 148, 100 148 C 60 148, 42 138, 22 128 C 33 120, 39 108, 50 104 C 72 96, 80 72, 100 72Z" fill="${cream}"/>
    <path d="M100 30 C 92 40, 92 54, 100 64 C 108 54, 108 40, 100 30Z" fill="${shade}" opacity=".55"/>`;
  let face = eyes(mood) + brows(mood) +
    `<path d="M90 110 Q100 103 110 110 Q106 120 100 120 Q94 120 90 110Z" fill="${INK}"/><ellipse cx="96" cy="109" rx="3" ry="1.6" fill="#fff" opacity=".6"/>` +
    mouth(mood) +
    `<ellipse cx="54" cy="114" rx="11" ry="6.5" fill="#FF8FA3" opacity=".55"/><ellipse cx="146" cy="114" rx="11" ry="6.5" fill="#FF8FA3" opacity=".55"/>`;
  if (c.lashes && mood !== 'joy' && mood !== 'sleep') face += `<g stroke="${INK}" stroke-width="3" stroke-linecap="round"><path d="M64 82 l-6 -5"/><path d="M136 82 l6 -5"/></g>`;
  if (c.glasses) face += `<g fill="none" stroke="#4A3B6B" stroke-width="3.5"><circle cx="74" cy="92" r="19"/><circle cx="126" cy="92" r="19"/><path d="M93 90 Q100 85 107 90"/></g>`;
  if (c.mous) face += `<path d="M78 120 Q90 112 100 118 Q110 112 122 120 Q112 128 100 122 Q88 128 78 120Z" fill="#F7F3EE"/><g stroke="#F7F3EE" stroke-width="6" stroke-linecap="round"><path d="M60 66 l20 4"/><path d="M140 66 l-20 4"/></g>`;
  let top = '';
  if (c.bun) top += `<circle cx="100" cy="24" r="20" fill="#EFEAF4"/><path d="M68 40 Q100 14 132 40 Q100 30 68 40Z" fill="#EFEAF4"/>`;
  if (c.bow) top += `<g transform="translate(142 36) rotate(18)"><path d="M0 0 L-18 -12 L-18 12Z" fill="${c.bow}"/><path d="M0 0 L18 -12 L18 12Z" fill="${c.bow}"/><circle r="6" fill="#E04A86"/></g>`;
  if (c.cap) top += `<path d="M52 52 C 60 18, 140 18, 148 52 Q100 40 52 52Z" fill="${c.cap}"/><path d="M140 48 Q176 46 186 58 Q160 62 136 56Z" fill="${c.cap}"/><circle cx="100" cy="24" r="5" fill="#fff"/>`;
  if (c.flower) top += `<g transform="translate(150 44)">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="6" ry="10" transform="rotate(${a}) translate(0 -9)" fill="#fff"/>`).join('')}<circle r="6" fill="${c.flower}"/></g>`;
  if (c.beret) top += `<ellipse cx="96" cy="34" rx="50" ry="17" fill="${c.beret}"/><circle cx="96" cy="16" r="5" fill="${c.beret}"/>`;
  if (c.hat) top += `<path d="M60 44 L140 44 L132 10 L68 10Z" fill="${c.hat}"/><rect x="48" y="40" width="104" height="9" rx="4" fill="${c.hat}"/><rect x="68" y="30" width="64" height="7" fill="#FF4F6E"/>`;
  return `<g>${tail}${legs}${shirt}${extras}${armL}${armR}${ears}${head}${face}${top}</g>`;
}

export function owlG({ mood = 'happy', pose = 'stand' } = {}) {
  const body = '#7C5CB0', belly = '#F3E8FF', dark = '#5A3F86', orange = '#FFB13D';
  const ey = 96;
  const eye = (x) => mood === 'joy'
    ? `<path transform="translate(${x} ${ey})" d="M-12 4 Q0 -10 12 4" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
    : `<g class="blink"><circle cx="${x}" cy="${ey}" r="${mood === 'wow' ? 15 : 13}" fill="${INK}"/><circle cx="${x + 5}" cy="${ey - 5}" r="5" fill="#fff"/></g>`;
  const wingR = pose === 'wave' || pose === 'cheer'
    ? `<g class="wavearm"><path d="M150 140 C 176 120, 190 92, 182 80 C 174 74, 164 92, 156 108 C 150 120, 144 130, 140 138Z" fill="${dark}"/></g>`
    : `<path d="M150 136 C 178 150, 182 196, 160 214 C 156 190, 150 170, 142 156Z" fill="${dark}"/>`;
  const wingL = pose === 'cheer'
    ? `<path d="M50 140 C 24 120, 10 92, 18 80 C 26 74, 36 92, 44 108 C 50 120, 56 130, 60 138Z" fill="${dark}"/>`
    : `<path d="M50 136 C 22 150, 18 196, 40 214 C 44 190, 50 170, 58 156Z" fill="${dark}"/>`;
  return `<g>
    <path d="M40 46 L56 6 L78 40Z" fill="${dark}"/><path d="M160 46 L144 6 L122 40Z" fill="${dark}"/>
    <path d="M100 30 C 160 30, 172 90, 168 150 C 164 206, 138 232, 100 232 C 62 232, 36 206, 32 150 C 28 90, 40 30, 100 30Z" fill="${body}"/>
    <path d="M100 120 C 140 120, 150 160, 146 192 C 142 220, 122 230, 100 230 C 78 230, 58 220, 54 192 C 50 160, 60 120, 100 120Z" fill="${belly}"/>
    <g fill="none" stroke="#C9B3EE" stroke-width="3.5" stroke-linecap="round">${[[86, 150], [114, 150], [72, 176], [100, 176], [128, 176], [86, 202], [114, 202]].map(([x, y]) => `<path d="M${x - 7} ${y} q7 7 14 0"/>`).join('')}</g>
    ${wingL}${wingR}
    <circle cx="72" cy="96" r="30" fill="#FFF7E6"/><circle cx="128" cy="96" r="30" fill="#FFF7E6"/>
    ${eye(72)}${eye(128)}
    <g fill="none" stroke="#FFC83D" stroke-width="4.5"><circle cx="72" cy="96" r="24"/><circle cx="128" cy="96" r="24"/><path d="M96 94 Q100 90 104 94"/></g>
    ${mood === 'sad' ? `<g stroke="${INK}" stroke-width="4" stroke-linecap="round"><path d="M54 66 L82 74"/><path d="M146 66 L118 74"/></g>` : ''}
    <path d="M90 118 L110 118 L100 138Z" fill="${orange}"/>
    ${mood === 'joy' || mood === 'wow' ? `<path d="M92 124 Q100 132 108 124" fill="#8E2F44"/>` : ''}
    <path d="M88 150 L100 158 L112 150 L112 164 L100 158 L88 164Z" fill="#FF4F6E"/>
    <g fill="${orange}"><path d="M74 228 l-8 10 h22z"/><path d="M126 228 l-8 10 h22z"/></g>
  </g>`;
}

export function catG({ mood = 'happy' } = {}) {
  const f = '#6B6F86', d = '#545870';
  return `<g>
    <path d="M150 210 C 190 200, 192 150, 172 140 C 166 160, 170 186, 140 196Z" fill="${f}" class="tail"/>
    <ellipse cx="100" cy="196" rx="54" ry="40" fill="${f}"/><ellipse cx="100" cy="206" rx="30" ry="24" fill="#E9EAF2"/>
    <ellipse cx="74" cy="232" rx="15" ry="7" fill="${d}"/><ellipse cx="126" cy="232" rx="15" ry="7" fill="${d}"/>
    <path d="M52 112 L58 54 L92 88Z" fill="${f}"/><path d="M148 112 L142 54 L108 88Z" fill="${f}"/>
    <path d="M60 100 L62 70 L82 90Z" fill="#FFB8C6"/><path d="M140 100 L138 70 L118 90Z" fill="#FFB8C6"/>
    <circle cx="100" cy="124" r="50" fill="${f}"/>
    ${mood === 'joy' ? `<g fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"><path d="M70 122 q10 -10 20 0"/><path d="M110 122 q10 -10 20 0"/></g>`
      : `<g class="blink"><ellipse cx="80" cy="120" rx="9" ry="12" fill="#C6F06B"/><ellipse cx="80" cy="120" rx="3.5" ry="10" fill="${INK}"/><ellipse cx="120" cy="120" rx="9" ry="12" fill="#C6F06B"/><ellipse cx="120" cy="120" rx="3.5" ry="10" fill="${INK}"/></g>`}
    <path d="M95 138 L105 138 L100 144Z" fill="#FF8FA3"/>
    <path d="M100 144 Q94 152 88 148 M100 144 Q106 152 112 148" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <g stroke="#fff" stroke-width="2" opacity=".8"><path d="M60 138 l-26 -4"/><path d="M60 146 l-26 4"/><path d="M140 138 l26 -4"/><path d="M140 146 l26 4"/></g>
  </g>`;
}

export function robotG({ mood = 'happy' } = {}) {
  return `<g>
    <rect x="96" y="10" width="8" height="26" fill="#9AA3B8"/><circle cx="100" cy="10" r="9" fill="#FF4F6E"/>
    <rect x="46" y="34" width="108" height="86" rx="26" fill="#DCE3F0"/><rect x="58" y="48" width="84" height="56" rx="18" fill="#2E2A4A"/>
    ${mood === 'joy' ? `<g fill="none" stroke="#6FF0C8" stroke-width="5" stroke-linecap="round"><path d="M72 80 q10 -12 20 0"/><path d="M108 80 q10 -12 20 0"/></g>` : `<g class="blink"><circle cx="82" cy="76" r="9" fill="#6FF0C8"/><circle cx="118" cy="76" r="9" fill="#6FF0C8"/></g>`}
    <rect x="40" y="70" width="10" height="26" rx="5" fill="#9AA3B8"/><rect x="150" y="70" width="10" height="26" rx="5" fill="#9AA3B8"/>
    <rect x="60" y="124" width="80" height="80" rx="20" fill="#C9D3E6"/><circle cx="100" cy="160" r="16" fill="#FFC83D"/><path d="M92 160 h16 M100 152 v16" stroke="#fff" stroke-width="4"/>
    <path d="M60 140 C 36 150, 30 170, 38 186" stroke="#9AA3B8" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M140 140 C 164 150, 170 170, 162 186" stroke="#9AA3B8" stroke-width="10" fill="none" stroke-linecap="round"/>
    <rect x="66" y="204" width="68" height="18" rx="8" fill="#9AA3B8"/><circle cx="76" cy="226" r="10" fill="#5B6178"/><circle cx="124" cy="226" r="10" fill="#5B6178"/>
  </g>`;
}

const MAKERS = { owl: owlG, cat: catG, robot: robotG };
export function charG(who, opts = {}) { return MAKERS[who] ? MAKERS[who](opts) : foxG(who, opts); }
export function charScale(who) { return (FAM[who] && FAM[who].scale) || (who === 'cat' ? .55 : who === 'owl' ? .95 : who === 'robot' ? .8 : 1); }

/** Standalone SVG */
export function charSVG(who = 'lou', opts = {}) {
  const cls = opts.cls ? ` class="${opts.cls}"` : '';
  return `<svg viewBox="-10 -6 220 250"${cls} aria-hidden="true">${charG(who, opts)}</svg>`;
}
/** Place a character with its feet at (x,y) with height hgt (px in parent space) */
export function placeChar(who, x, y, hgt, opts = {}) {
  const s = (hgt / 240) * (opts.noScale ? 1 : charScale(who));
  const flip = opts.flip ? -1 : 1;
  return `<g transform="translate(${x} ${y}) scale(${s * flip} ${s}) translate(-100 -238)" ${opts.attrs || ''}>${charG(who, opts)}</g>`;
}
