// House cross-sections (side view), top-view room plans and mini-house icons
import { placeChar } from './char.js';

export const ROOMS = {
  cuisine:     { name: 'la cuisine', de: 'die Küche', bg: '#E3F3FF' },
  salon:       { name: 'le salon', de: 'das Wohnzimmer', alt: ['le séjour'], bg: '#FFF1D9' },
  sejour:      { name: 'le séjour', de: 'das Wohnzimmer', alt: ['le salon'], bg: '#FFF1D9' },
  chambre:     { name: 'la chambre', de: 'das (Schlaf)zimmer', bg: '#FFE6EE' },
  chambreAmis: { name: "la chambre d'amis", de: 'das Gästezimmer', bg: '#EFE7FF' },
  sdb:         { name: 'la salle de bains', de: 'das Badezimmer', alt: ['la salle de bain'], bg: '#DDF5F7' },
  toilettes:   { name: 'les toilettes', de: 'die Toilette', alt: ['le WC', 'les WC'], bg: '#E8F7EC' },
  salleManger: { name: 'la salle à manger', de: 'das Esszimmer', bg: '#E9F8EE' },
  buanderie:   { name: 'la buanderie', de: 'die Waschküche', bg: '#E6EDF7' },
  grenier:     { name: 'le grenier', de: 'der Estrich', bg: '#F5E7D3' },
  garage:      { name: 'le garage', de: 'die Garage', bg: '#ECEAF0' },
  pharmacie:   { name: 'la pharmacie', de: 'die Apotheke', bg: '#E5F8EE' },
};

// ---------- room interiors (local box 0..w, 0..h ; floor at y=h) ----------
const D = {
  cuisine(w, h) {
    const f = h;
    return `<g>${tiles(w, h * .55, h * .2, '#CFE9FB')}
      <rect x="${w * .08}" y="${f - h * .38}" width="${w * .5}" height="${h * .38}" rx="4" fill="#fff" stroke="#BFD6E6" stroke-width="2"/>
      <rect x="${w * .08}" y="${f - h * .42}" width="${w * .5}" height="${h * .06}" rx="3" fill="#8FA6BC"/>
      <rect x="${w * .14}" y="${f - h * .3}" width="${w * .18}" height="${h * .2}" rx="3" fill="#2E2A4A" opacity=".8"/>
      <rect x="${w * .36}" y="${f - h * .3}" width="${w * .18}" height="${h * .2}" rx="3" fill="#DCE8F2"/>
      <path d="M${w * .2} ${f - h * .42} h${w * .2} v-${h * .12} q0 -${h * .05} -${h * .05} -${h * .05} h-${w * .2 - h * .1} q-${h * .05} 0 -${h * .05} ${h * .05}z" fill="#FF6B6B"/>
      <g stroke="#B9C3D6" stroke-width="3" fill="none" stroke-linecap="round" class="float"><path d="M${w * .26} ${f - h * .66} q6 -8 0 -16 q-6 -8 0 -16"/><path d="M${w * .34} ${f - h * .66} q6 -8 0 -16 q-6 -8 0 -16"/></g>
      <rect x="${w * .72}" y="${f - h * .74}" width="${w * .2}" height="${h * .74}" rx="6" fill="#F7FBFF" stroke="#BFD6E6" stroke-width="2"/>
      <path d="M${w * .72} ${f - h * .48} h${w * .2}" stroke="#BFD6E6" stroke-width="2"/><rect x="${w * .74}" y="${f - h * .66}" width="3" height="${h * .12}" fill="#8FA6BC"/></g>`;
  },
  salon(w, h, o = {}) {
    const f = h;
    return `<g><rect x="${w * .1}" y="${h * .14}" width="${w * .22}" height="${h * .26}" rx="3" fill="#fff" stroke="#E2C9A0" stroke-width="3"/><path d="M${w * .12} ${h * .36} l${w * .06} -${h * .12} l${w * .04} ${h * .07} l${w * .04} -${h * .04} l${w * .04} ${h * .09}z" fill="#47B3F0"/>
      <path d="M${w * .06} ${f} v-${h * .3} q0 -${h * .12} ${h * .12} -${h * .12} h${w * .42 - h * .24} q${h * .12} 0 ${h * .12} ${h * .12} v${h * .3}z" fill="#FF8FA3"/>
      <rect x="${w * .06}" y="${f - h * .22}" width="${w * .42}" height="${h * .14}" rx="6" fill="#FFB3C1"/>
      ${o.piano ? `<g><rect x="${w * .56}" y="${f - h * .5}" width="${w * .34}" height="${h * .5}" rx="4" fill="#2E2A4A"/><rect x="${w * .58}" y="${f - h * .3}" width="${w * .3}" height="${h * .08}" fill="#fff"/><g fill="#2E2A4A">${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${w * .6 + i * w * .045}" y="${f - h * .3}" width="${w * .02}" height="${h * .05}"/>`).join('')}</g><rect x="${w * .6}" y="${f - h * .46}" width="${w * .1}" height="${h * .12}" fill="#fff" opacity=".85"/></g>`
        : `<g><path d="M${w * .8} ${f} v-${h * .6}" stroke="#5B5470" stroke-width="3"/><path d="M${w * .72} ${f - h * .6} h${w * .16} l-${w * .03} -${h * .14} h-${w * .1}z" fill="#FFC83D"/><rect x="${w * .74}" y="${f - h * .04}" width="${w * .12}" height="${h * .04}" rx="2" fill="#5B5470"/></g>`}</g>`;
  },
  chambre(w, h) {
    const f = h;
    return `<g><rect x="${w * .58}" y="${h * .12}" width="${w * .26}" height="${h * .3}" rx="3" fill="#BFE6FF" stroke="#fff" stroke-width="4"/>
      <rect x="${w * .06}" y="${f - h * .42}" width="${w * .06}" height="${h * .42}" rx="3" fill="#B5774A"/>
      <rect x="${w * .1}" y="${f - h * .24}" width="${w * .46}" height="${h * .14}" rx="5" fill="#fff"/>
      <path d="M${w * .2} ${f - h * .26} h${w * .36} v${h * .17} h-${w * .36}z" fill="#FF7E99"/>
      <rect x="${w * .12}" y="${f - h * .3}" width="${w * .1}" height="${h * .08}" rx="4" fill="#fff" stroke="#EADFEA" stroke-width="2"/>
      <rect x="${w * .1}" y="${f - h * .1}" width="${w * .03}" height="${h * .1}" fill="#8E5B36"/><rect x="${w * .53}" y="${f - h * .1}" width="${w * .03}" height="${h * .1}" fill="#8E5B36"/>
      <rect x="${w * .7}" y="${f - h * .2}" width="${w * .14}" height="${h * .2}" rx="3" fill="#E9C9A0"/><path d="M${w * .77} ${f - h * .2} v-${h * .12}" stroke="#5B5470" stroke-width="2"/><path d="M${w * .72} ${f - h * .32} h${w * .1} l-${w * .02} -${h * .1} h-${w * .06}z" fill="#FFC83D"/></g>`;
  },
  chambreAmis(w, h) {
    return D.chambre(w, h) + `<g><rect x="${w * .6}" y="${h - h * .26}" width="${w * .18}" height="${h * .26}" rx="5" fill="#8B5CF6"/><rect x="${w * .65}" y="${h - h * .31}" width="${w * .08}" height="${h * .06}" rx="3" fill="none" stroke="#6C3EDB" stroke-width="3"/><path d="M${w * .6} ${h - h * .13} h${w * .18}" stroke="#FFC83D" stroke-width="3"/>
      <rect x="${w * .22}" y="${h * .08}" width="${w * .3}" height="${h * .16}" rx="4" fill="#FFC83D"/><text x="${w * .37}" y="${h * .2}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="${Math.max(9, h * .1)}" fill="#5A3E00">Bienvenue</text></g>`;
  },
  sdb(w, h) {
    const f = h;
    return `<g>${tiles(w, h * .6, h * .18, '#BDE6EC')}
      <path d="M${w * .06} ${f - h * .34} h${w * .5} v${h * .14} q0 ${h * .16} -${h * .16} ${h * .16} h-${w * .5 - h * .32} q-${h * .16} 0 -${h * .16} -${h * .16}z" fill="#fff" stroke="#BFD6E6" stroke-width="2"/>
      <g fill="#fff" stroke="#D3ECF5" stroke-width="2">${[.12, .2, .28, .36, .44].map((x, i) => `<circle cx="${w * x}" cy="${f - h * (.37 + (i % 2) * .05)}" r="${h * .05}"/>`).join('')}</g>
      <path d="M${w * .52} ${f - h * .34} v-${h * .36} q0 -${h * .06} -${h * .06} -${h * .06} h-${w * .06}" stroke="#9AA6BE" stroke-width="4" fill="none"/>
      <rect x="${w * .7}" y="${h * .16}" width="${w * .18}" height="${h * .24}" rx="${h * .1}" fill="#E9FBFF" stroke="#BFD6E6" stroke-width="3"/>
      <path d="M${w * .66} ${f - h * .44} h${w * .26} l-${w * .03} ${h * .1} h-${w * .2}z" fill="#fff" stroke="#BFD6E6" stroke-width="2"/><rect x="${w * .77}" y="${f - h * .34}" width="${w * .04}" height="${h * .34}" fill="#DCE8F2"/></g>`;
  },
  toilettes(w, h) {
    const f = h;
    return `<g>${tiles(w, h * .5, h * .18, '#CDEED6')}
      <rect x="${w * .42}" y="${f - h * .6}" width="${w * .2}" height="${h * .2}" rx="4" fill="#fff" stroke="#BFD6E6" stroke-width="2"/>
      <path d="M${w * .34} ${f - h * .36} h${w * .34} q0 ${h * .2} -${w * .12} ${h * .22} l${w * .02} ${h * .14} h-${w * .16} l${w * .02} -${h * .14} q-${w * .1} -${h * .02} -${w * .1} -${h * .22}z" fill="#fff" stroke="#BFD6E6" stroke-width="2"/>
      <rect x="${w * .78}" y="${f - h * .5}" width="${w * .1}" height="${h * .1}" rx="${h * .04}" fill="#fff" stroke="#DDD" stroke-width="2"/><rect x="${w * .82}" y="${f - h * .52}" width="${w * .02}" height="${h * .14}" fill="#9AA6BE"/></g>`;
  },
  salleManger(w, h) {
    const f = h;
    return `<g><path d="M${w * .5} 0 v${h * .22}" stroke="#5B5470" stroke-width="2"/><path d="M${w * .42} ${h * .3} h${w * .16} l-${w * .03} -${h * .1} h-${w * .1}z" fill="#FFC83D"/>
      <rect x="${w * .24}" y="${f - h * .34}" width="${w * .52}" height="${h * .06}" rx="3" fill="#CF9258"/>
      <rect x="${w * .28}" y="${f - h * .3}" width="${w * .04}" height="${h * .3}" fill="#A86F42"/><rect x="${w * .68}" y="${f - h * .3}" width="${w * .04}" height="${h * .3}" fill="#A86F42"/>
      <ellipse cx="${w * .5}" cy="${f - h * .37}" rx="${w * .08}" ry="${h * .04}" fill="#fff"/><circle cx="${w * .47}" cy="${f - h * .4}" r="${h * .03}" fill="#FF4F6E"/><circle cx="${w * .52}" cy="${f - h * .41}" r="${h * .03}" fill="#2FBF71"/>
      ${[[.08, 1], [.86, -1]].map(([x, d]) => `<g><rect x="${w * x}" y="${f - h * .24}" width="${w * .1}" height="${h * .04}" fill="#E39B5B"/><rect x="${w * (x + (d > 0 ? 0 : .08))}" y="${f - h * .5}" width="${w * .02}" height="${h * .5}" fill="#E39B5B"/><rect x="${w * (x + (d > 0 ? .08 : 0))}" y="${f - h * .2}" width="${w * .02}" height="${h * .2}" fill="#C4773C"/></g>`).join('')}</g>`;
  },
  buanderie(w, h) {
    const f = h;
    return `<g><path d="M${w * .06} ${h * .2} q${w * .44} ${h * .14} ${w * .88} 0" stroke="#9AA6BE" stroke-width="2" fill="none"/>
      ${[[.18, '#47B3F0'], [.34, '#FF4F6E'], [.66, '#FFC83D'], [.8, '#2FBF71']].map(([x, c]) => `<path d="M${w * x - 10} ${h * .24} h20 l4 ${h * .18} h-28z" fill="${c}"/>`).join('')}
      <rect x="${w * .1}" y="${f - h * .48}" width="${w * .3}" height="${h * .48}" rx="6" fill="#fff" stroke="#BFD6E6" stroke-width="2"/>
      <circle cx="${w * .25}" cy="${f - h * .22}" r="${h * .14}" fill="#BDE6F7" stroke="#9AA6BE" stroke-width="4"/><path d="M${w * .2} ${f - h * .2} q${w * .05} ${h * .06} ${w * .1} 0" stroke="#fff" stroke-width="3" fill="none"/>
      <rect x="${w * .12}" y="${f - h * .45}" width="${w * .12}" height="${h * .05}" rx="2" fill="#DCE8F2"/>
      <path d="M${w * .58} ${f} l${w * .04} -${h * .3} h${w * .2} l${w * .04} ${h * .3}z" fill="#E9EEF7" stroke="#B9C3D6" stroke-width="2"/></g>`;
  },
  grenier(w, h) {
    const f = h;
    return `<g><circle cx="${w * .5}" cy="${h * .36}" r="${h * .13}" fill="#BFE6FF" stroke="#fff" stroke-width="5"/>
      <rect x="${w * .12}" y="${f - h * .3}" width="${w * .18}" height="${h * .3}" rx="3" fill="#D9A066"/><path d="M${w * .12} ${f - h * .2} h${w * .18}" stroke="#B9824F" stroke-width="3"/>
      <rect x="${w * .16}" y="${f - h * .48}" width="${w * .13}" height="${h * .18}" rx="3" fill="#E7B67F"/>
      <path d="M${w * .66} ${f} v-${h * .22} q0 -${h * .1} ${w * .1} -${h * .1} h${w * .06} q${w * .1} 0 ${w * .1} ${h * .1} v${h * .22}z" fill="#8E5B36"/><rect x="${w * .75}" y="${f - h * .2}" width="${w * .06}" height="${h * .06}" fill="#FFC83D"/></g>`;
  },
  garage(w, h) {
    const f = h;
    return `<g><path d="M${w * .14} ${f - h * .08} v-${h * .14} q0 -${h * .06} ${w * .08} -${h * .08} l${w * .1} -${h * .14} h${w * .3} l${w * .1} ${h * .14} q${w * .08} ${h * .02} ${w * .08} ${h * .08} v${h * .14}z" fill="#FF4F6E"/>
      <path d="M${w * .34} ${f - h * .3} l${w * .07} -${h * .1} h${w * .2} l${w * .07} ${h * .1}z" fill="#BFE6FF"/>
      <circle cx="${w * .3}" cy="${f - h * .08}" r="${h * .08}" fill="#2E2A4A"/><circle cx="${w * .7}" cy="${f - h * .08}" r="${h * .08}" fill="#2E2A4A"/></g>`;
  },
  pharmacie(w, h) {
    const f = h;
    return `<g><rect x="${w * .38}" y="${h * .1}" width="${w * .24}" height="${h * .26}" rx="6" fill="#2FBF71"/><path d="M${w * .5} ${h * .14} v${h * .18} M${w * .44} ${h * .23} h${w * .12}" stroke="#fff" stroke-width="${h * .06}"/>
      <rect x="${w * .1}" y="${f - h * .32}" width="${w * .8}" height="${h * .32}" rx="4" fill="#fff" stroke="#BFD6E6" stroke-width="2"/>
      ${[.2, .32, .44].map(x => `<rect x="${w * x}" y="${f - h * .44}" width="${w * .06}" height="${h * .12}" rx="2" fill="${x === .32 ? '#FF4F6E' : '#47B3F0'}"/>`).join('')}</g>`;
  },
};
D.sejour = D.salon;
function tiles(w, top, size, c) {
  let s = ''; for (let x = 0; x < w; x += size) for (let y = 0; y < top; y += size) if (((x + y) / size) % 2 < 1) s += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${c}" opacity=".55"/>`;
  return s;
}

/**
 * houseSVG({ floors:[{ key:'ss'|'rez'|1|2|3|'grenier', rooms:['cuisine',{t:'salon',piano:true}] }], people:[{who,f,c}], ... })
 * floors listed bottom -> top. f = floor index into that list, c = column index.
 */
export function houseSVG(cfg) {
  const W = cfg.w || 900, FH = cfg.fh || 150, X0 = cfg.labels === 'blank' ? 250 : cfg.labels ? 120 : 40, WALL = 10;
  const floors = cfg.floors;
  const hasGrenier = floors[floors.length - 1].key === 'grenier';
  const above = floors.filter(f => f.key !== 'ss' && f.key !== 'grenier');
  const roofH = hasGrenier ? 170 : 110;
  const top = 20 + roofH;
  const groundY = top + above.length * FH;
  const ssCount = floors.filter(f => f.key === 'ss').length;
  const H = groundY + ssCount * FH + 40;
  const bw = W - X0 - 40;
  const fy = {}; // floor index -> top y
  let up = 0;
  floors.forEach((f, i) => {
    if (f.key === 'ss') fy[i] = groundY;
    else if (f.key === 'grenier') fy[i] = top - roofH + 40;
    else { fy[i] = groundY - (up + 1) * FH; up++; }
  });
  let s = `<svg viewBox="0 0 ${W} ${H}" class="house-svg" role="img" aria-label="Haus im Querschnitt">
    <rect width="${W}" height="${groundY}" fill="url(#skyG)"/><defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDEBFF"/><stop offset="1" stop-color="#EEF8FF"/></linearGradient>
    <pattern id="earth" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#B98559"/><circle cx="10" cy="12" r="4" fill="#A3714A"/><circle cx="30" cy="28" r="3" fill="#C99A6E"/><circle cx="28" cy="8" r="2" fill="#A3714A"/></pattern></defs>
    <rect y="${groundY}" width="${W}" height="${H - groundY}" fill="url(#earth)"/>
    <rect y="${groundY - 6}" width="${W}" height="14" fill="#5FC77A"/>
    <g fill="#4DB86A">${[60, 110, W - 70, W - 120].map(x => `<circle cx="${x}" cy="${groundY - 16}" r="22"/>`).join('')}</g>`;
  // roof
  const rx0 = X0 - 26, rx1 = X0 + bw + 26, apex = (rx0 + rx1) / 2, rtop = top - roofH;
  s += `<path d="M${rx0} ${top + 4} L${apex} ${rtop} L${rx1} ${top + 4}Z" fill="#E65A4F"/><path d="M${rx0 + 34} ${top} L${apex} ${rtop + 26} L${rx1 - 34} ${top}Z" fill="${hasGrenier ? '#F5E7D3' : '#F08A6E'}"/>
    <rect x="${apex + 90}" y="${rtop + 40}" width="34" height="${hasGrenier ? 60 : 44}" fill="#B54A40"/>`;
  // floors
  floors.forEach((f, i) => {
    const y = fy[i];
    if (f.key === 'grenier') {
      const room = typeof f.rooms[0] === 'string' ? { t: f.rooms[0] } : f.rooms[0];
      const gx = apex - 150, gw = 300, gh = top - y - 6;
      s += `<g data-floor="${i}" data-room="${i}-0" class="zone-room"><svg x="${gx}" y="${y}" width="${gw}" height="${gh}" viewBox="0 0 ${gw} ${gh}" overflow="visible">${D.grenier(gw, gh)}</svg>
        <rect x="${gx - 40}" y="${y - 10}" width="${gw + 80}" height="${gh + 10}" fill="transparent"/></g>`;
      return;
    }
    const rooms = f.rooms.map(r => typeof r === 'string' ? { t: r } : r);
    const cw = bw / rooms.length;
    s += `<rect x="${X0}" y="${y}" width="${bw}" height="${FH}" fill="#fff"/>`;
    rooms.forEach((r, c) => {
      const x = X0 + c * cw;
      const bg = (ROOMS[r.t] || {}).bg || '#fff';
      const iw = cw - WALL, ih = FH - WALL - 8;
      s += `<g data-floor="${i}" data-room="${i}-${c}" class="zone-room"><rect x="${x + WALL / 2}" y="${y + WALL / 2}" width="${iw}" height="${ih + 4}" fill="${bg}"/>
        <svg x="${x + WALL / 2}" y="${y + WALL / 2 + 4}" width="${iw}" height="${ih}" viewBox="0 0 ${iw} ${ih}">${(D[r.t] || (() => ''))(iw, ih, r)}</svg></g>`;
    });
    // walls & slab
    s += `<g fill="#6E5A7E">${rooms.map((_, c) => `<rect x="${X0 + c * cw - WALL / 2}" y="${y}" width="${WALL}" height="${FH}"/>`).join('')}<rect x="${X0 + bw - WALL / 2}" y="${y}" width="${WALL}" height="${FH}"/></g>
      <rect x="${X0 - WALL / 2}" y="${y + FH - 8}" width="${bw + WALL}" height="12" fill="#8C7A9C"/>`;
  });
  s += `<rect x="${X0 - WALL / 2}" y="${top - 4}" width="${bw + WALL}" height="10" fill="#8C7A9C"/>`;
  // labels
  if (cfg.labels) floors.forEach((f, i) => {
    const y = fy[i] + (f.key === 'grenier' ? (top - fy[i]) / 2 : FH / 2);
    const lab = cfg.labels === 'num' ? ({ ss: '-1', rez: '0', grenier: '' }[f.key] ?? String(f.key)) : '';
    if (cfg.labels === 'blank') s += `<g data-flabel="${i}"><rect x="6" y="${y - 34}" width="${X0 - 22}" height="68" rx="14" fill="#fff" stroke="#C9B9D6" stroke-width="3" stroke-dasharray="7 5"/><text x="${(X0 - 16) / 2 + 3}" y="${y + 9}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="25" fill="#8A84A3" class="flabel-t">?</text></g>`;
    else if (lab) s += `<g><circle cx="${X0 / 2 - 6}" cy="${y}" r="24" fill="#fff" stroke="#8C7A9C" stroke-width="3"/><text x="${X0 / 2 - 6}" y="${y + 8}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="24" fill="#2E2A4A">${lab}</text></g>`;
  });
  // people
  for (const p of cfg.people || []) {
    const f = floors[p.f]; if (!f) continue;
    const y = f.key === 'grenier' ? top - 8 : fy[p.f] + FH - 10;
    const n = f.key === 'grenier' ? 1 : f.rooms.length;
    const cw = bw / n;
    const x = f.key === 'grenier' ? apex + (p.dx || 60) : X0 + p.c * cw + cw * (p.pos ?? .5);
    s += placeChar(p.who, x, y, p.h || FH * .78, { mood: p.mood, pose: p.pose, flip: p.flip, attrs: `data-who="${p.who}"` });
    if (p.zzz) s += `<text x="${x + 26}" y="${y - (p.h || FH * .78) * .78}" font-family="Fredoka" font-weight="700" font-size="22" fill="#6C3EDB">z Z</text>`;
    if (p.label) s += `<g pointer-events="none"><rect x="${x - 34}" y="${y - 18}" width="68" height="18" rx="9" fill="#2E2A4A" opacity=".82"/><text x="${x}" y="${y - 5}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="12" fill="#fff">${p.label}</text></g>`;
  }
  if (cfg.dot) {
    const [fi, c] = cfg.dot; const f = floors[fi]; const n = f.key === 'grenier' ? 1 : f.rooms.length; const cw = bw / n;
    const x = f.key === 'grenier' ? apex : X0 + c * cw + cw / 2, y = f.key === 'grenier' ? (fy[fi] + top) / 2 : fy[fi] + FH / 2;
    s += `<circle cx="${x}" cy="${y}" r="20" fill="#FF2D2D" stroke="#fff" stroke-width="5"><animate attributeName="r" values="18;23;18" dur="1.4s" repeatCount="indefinite"/></circle>`;
  }
  s += `<g class="marks"></g></svg>`;
  return s;
}

// ---------- mini house (for game tiles & ordinal icons) ----------
export function miniHouse({ floor = 1, side = 'gauche', floors = 3, who = 'lou', hl = true } = {}) {
  // floor: -1 ss, 0 rez, 1.. ; side: gauche|milieu|droite
  const cols = 3, W = 200, fh = 40, top = 54, n = floors + 1; // incl. rez
  const groundY = top + n * fh;
  let s = `<svg viewBox="0 0 ${W} ${groundY + fh + 8}" class="pic"><rect width="${W}" height="${groundY}" fill="#E8F6FF"/><rect y="${groundY}" width="${W}" height="${fh + 8}" fill="#C79A6E"/><rect y="${groundY - 4}" width="${W}" height="8" fill="#5FC77A"/>
    <path d="M18 ${top + 2} L100 8 L182 ${top + 2}Z" fill="#E65A4F"/>`;
  const cells = [];
  for (let f = -1; f < n; f++) for (let c = 0; c < cols; c++) {
    const x = 30 + c * 46.7, y = f === -1 ? groundY : groundY - (f + 1) * fh;
    const on = hl && f === floor && ['gauche', 'milieu', 'droite'][c] === side;
    s += `<rect x="${x}" y="${y}" width="46.7" height="${fh}" fill="${on ? '#FFE08A' : f === -1 ? '#B98E66' : '#fff'}" stroke="#6E5A7E" stroke-width="3"${f === -1 && !on ? ' stroke-dasharray="5 4"' : ''}/>`;
    if (on) cells.push([x + 23, y + fh - 2]);
  }
  for (const [x, y] of cells) s += placeChar(who, x, y, 36);
  return s + `</svg>`;
}

// ---------- top-view room plans (Heft p.45 "Les pièces") ----------
const PLAN = {
  sdb: `<rect x="34" y="20" width="30" height="58" rx="12" fill="#DFF5FA" stroke="#2E2A4A" stroke-width="3"/><circle cx="49" cy="32" r="3" fill="#2E2A4A"/><rect x="22" y="84" width="18" height="16" rx="6" fill="#fff" stroke="#2E2A4A" stroke-width="3"/><rect x="44" y="84" width="18" height="16" rx="6" fill="#fff" stroke="#2E2A4A" stroke-width="3"/>`,
  chambreAmis: `<rect x="22" y="22" width="44" height="34" rx="4" fill="#fff" stroke="#2E2A4A" stroke-width="3"/><g fill="#FF7E99">${[[44, 30], [54, 30], [44, 40], [54, 40], [44, 50]].map(([x, y]) => `<path d="M${x} ${y + 3} l-3 -3 a2 2 0 0 1 3 -2 a2 2 0 0 1 3 2z"/>`).join('')}</g><rect x="26" y="26" width="10" height="26" rx="3" fill="#EEE" stroke="#2E2A4A" stroke-width="2"/><circle cx="76" cy="78" r="10" fill="#fff" stroke="#2E2A4A" stroke-width="3"/>`,
  salleManger: `<rect x="40" y="28" width="22" height="48" rx="3" fill="#E7B67F" stroke="#2E2A4A" stroke-width="3"/>${[34, 48, 62].map(y => `<path d="M32 ${y} q-6 4 0 8 M70 ${y} q6 4 0 8" stroke="#2E2A4A" stroke-width="3" fill="none"/>`).join('')}<rect x="30" y="10" width="40" height="8" fill="#2E2A4A" opacity=".5"/>`,
  chambre: `<rect x="22" y="38" width="42" height="40" rx="4" fill="#FFE6EE" stroke="#2E2A4A" stroke-width="3"/><rect x="26" y="42" width="12" height="14" rx="3" fill="#fff" stroke="#2E2A4A" stroke-width="2"/><rect x="26" y="60" width="12" height="14" rx="3" fill="#fff" stroke="#2E2A4A" stroke-width="2"/><rect x="20" y="16" width="24" height="16" fill="#fff" stroke="#2E2A4A" stroke-width="3"/><rect x="60" y="16" width="10" height="16" fill="#fff" stroke="#2E2A4A" stroke-width="3"/>`,
  grenier: `<rect x="16" y="28" width="34" height="18" rx="2" fill="#E7B67F" stroke="#2E2A4A" stroke-width="2.5"/><rect x="20" y="52" width="14" height="10" fill="#fff" stroke="#2E2A4A" stroke-width="2"/><rect x="36" y="52" width="14" height="10" fill="#fff" stroke="#2E2A4A" stroke-width="2"/><g stroke="#2E2A4A" stroke-width="2.5" fill="#fff"><rect x="64" y="22" width="22" height="62"/>${[30, 38, 46, 54, 62, 70, 78].map(y => `<path d="M64 ${y} h22"/>`).join('')}</g>`,
  cuisine: `<rect x="16" y="14" width="70" height="16" fill="#fff" stroke="#2E2A4A" stroke-width="3"/><g stroke="#2E2A4A" stroke-width="2" fill="none"><path d="M20 18 h8 M20 22 h8 M20 26 h8"/><rect x="34" y="17" width="10" height="10"/><rect x="50" y="17" width="5" height="10"/></g><rect x="40" y="56" width="26" height="22" fill="#fff" stroke="#2E2A4A" stroke-width="3"/><g fill="none" stroke="#2E2A4A" stroke-width="2.5"><circle cx="47" cy="63" r="4"/><circle cx="59" cy="63" r="4"/><circle cx="47" cy="72" r="4"/><circle cx="59" cy="72" r="4"/></g>`,
  salon: `<path d="M18 28 l12 -10 l8 8 l-12 10z M24 34 h16 v14 h-16z" fill="#FFB3C1" stroke="#2E2A4A" stroke-width="2.5"/><rect x="44" y="34" width="10" height="20" fill="#fff" stroke="#2E2A4A" stroke-width="2.5"/><rect x="60" y="30" width="14" height="28" fill="#FFB3C1" stroke="#2E2A4A" stroke-width="2.5"/><path d="M30 70 h22 v-6 h4 v14 h-30 v-14 h4z" fill="#FFB3C1" stroke="#2E2A4A" stroke-width="2.5"/><circle cx="76" cy="78" r="7" fill="#7AD08F" stroke="#2E2A4A" stroke-width="2.5"/>`,
  toilettes: `<rect x="46" y="16" width="14" height="22" rx="2" fill="#fff" stroke="#2E2A4A" stroke-width="3"/><rect x="58" y="22" width="8" height="10" fill="#fff" stroke="#2E2A4A" stroke-width="2"/><ellipse cx="50" cy="68" rx="10" ry="13" fill="#fff" stroke="#2E2A4A" stroke-width="3"/><rect x="42" y="80" width="16" height="10" rx="2" fill="#fff" stroke="#2E2A4A" stroke-width="3"/>`,
  buanderie: `<rect x="18" y="16" width="56" height="20" fill="#fff" stroke="#2E2A4A" stroke-width="3"/><g stroke="#2E2A4A" stroke-width="2" fill="#BDE6F7">${[24, 36, 48, 60].map(x => `<path d="M${x} 36 l4 18 l4 -18"/>`).join('')}</g><rect x="68" y="16" width="18" height="18" fill="#fff" stroke="#2E2A4A" stroke-width="3"/><circle cx="77" cy="25" r="5" fill="none" stroke="#2E2A4A" stroke-width="2"/><rect x="68" y="62" width="16" height="22" rx="4" fill="#fff" stroke="#2E2A4A" stroke-width="3"/>`,
};
export function planIcon(type) {
  const inner = PLAN[type] || '';
  return `<svg viewBox="0 0 100 100" class="pic plan" aria-hidden="true"><rect x="4" y="4" width="92" height="92" rx="10" fill="#FBFAFD"/>
    <path d="M10 10 H90 V90 H60 M40 90 H10 V10" fill="none" stroke="#2E2A4A" stroke-width="6" stroke-linejoin="round"/>${inner}</svg>`;
}

/** square floor plan made of up to 4 room plans + staircase (for "Quel plan?") */
export function floorPlan(rooms) {
  const cell = (t, x, y, w, hh) => t === 'escalier'
    ? `<g transform="translate(${x} ${y})"><rect width="${w}" height="${hh}" fill="#fff" stroke="#2E2A4A" stroke-width="3"/>${Array.from({ length: 7 }, (_, i) => `<path d="M0 ${hh * (i + 1) / 8} H${w}" stroke="#2E2A4A" stroke-width="2"/>`).join('')}</g>`
    : `<svg x="${x}" y="${y}" width="${w}" height="${hh}" viewBox="8 8 84 84" preserveAspectRatio="none">${PLAN[t] || ''}</svg><rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="none" stroke="#2E2A4A" stroke-width="5"/>`;
  const [a, b, c, d] = rooms;
  return `<svg viewBox="0 0 220 220" class="pic plan" aria-hidden="true"><rect width="220" height="220" rx="14" fill="#FBFAFD"/>
    ${cell(a, 14, 14, 112, 92)}${cell(b || 'escalier', 126, 14, 80, 92)}${cell(c, 14, 106, 96, 100)}${cell(d, 110, 106, 96, 100)}
    <rect x="14" y="14" width="192" height="192" fill="none" stroke="#2E2A4A" stroke-width="8"/></svg>`;
}

/** single room illustration (side view) for vocab cards */
export function roomIcon(type, opts = {}) {
  const w = 220, h = 140, r = ROOMS[type] || { bg: '#fff' };
  return `<svg viewBox="0 0 ${w} ${h + 16}" class="pic" aria-hidden="true"><rect x="2" y="2" width="${w - 4}" height="${h + 10}" rx="14" fill="${r.bg}" stroke="#6E5A7E" stroke-width="4"/>
    <svg x="8" y="10" width="${w - 16}" height="${h - 6}" viewBox="0 0 ${w - 16} ${h - 6}">${(D[type] || (() => ''))(w - 16, h - 6, opts)}</svg><rect x="2" y="${h + 2}" width="${w - 4}" height="10" rx="4" fill="#8C7A9C"/></svg>`;
}
/** whole floor highlighted (for étage vocab) */
export function floorIcon(floor) {
  const W = 200, fh = 30, top = 44, n = 4, groundY = top + n * fh;
  let s = `<svg viewBox="0 0 ${W} ${groundY + fh + 6}" class="pic" aria-hidden="true"><rect y="${groundY}" width="${W}" height="${fh + 6}" fill="#C79A6E"/><path d="M28 ${top + 2} L100 6 L172 ${top + 2}Z" fill="#E65A4F"/>`;
  for (let f = -1; f < n; f++) {
    const y = f === -1 ? groundY : groundY - (f + 1) * fh, on = f === floor;
    s += `<rect x="40" y="${y}" width="120" height="${fh}" fill="${on ? '#FFC83D' : '#fff'}" stroke="#6E5A7E" stroke-width="3"/>`;
    if (on) s += `<text x="100" y="${y + 21}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="17" fill="#5A3E00">${f === -1 ? '-1' : f}</text>`;
  }
  return s + `<rect x="0" y="${groundY - 3}" width="${W}" height="6" fill="#5FC77A"/></svg>`;
}
