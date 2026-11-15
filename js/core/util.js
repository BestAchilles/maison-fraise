// Small DOM + random + text helpers (no dependencies)

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') { for (const [sk, sv] of Object.entries(v)) { if (sk.startsWith('--')) el.style.setProperty(sk, sv); else el.style[sk] = sv; } }
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const svgEl = (str) => { const t = document.createElement('template'); t.innerHTML = str.trim(); return t.content.firstElementChild; };
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// --- seeded random ---
export function rng(seed = Date.now()) {
  let a = (typeof seed === 'string' ? fnvInt(seed) : seed) >>> 0;
  const f = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  f.int = (n) => Math.floor(f() * n);
  f.pick = (arr) => arr[Math.floor(f() * arr.length)];
  f.shuffle = (arr) => { const a2 = arr.slice(); for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; };
  f.sample = (arr, n) => f.shuffle(arr).slice(0, n);
  return f;
}
export const R = rng();

// --- hashing (shared with tools/collect-audio.mjs) ---
export function fnvInt(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
export const fnv = (str) => fnvInt(str).toString(16).padStart(8, '0');

// --- text normalisation for answer checking ---
export function stripAccents(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
export function normText(s) {
  return String(s || '')
    .replace(/[’`´ʼ‘]/g, "'")
    .replace(/[«»"“”]/g, '')
    .replace(/…|\.\.\./g, ' ')
    .replace(/\s*'\s*/g, "'")
    .replace(/[.!?;:,]+/g, ' ')
    .replace(/œ/g, 'oe')
    .replace(/\s+/g, ' ')
    .trim().toLowerCase();
}
export const loose = (s) => stripAccents(normText(s)).replace(/-/g, ' ').replace(/\s+/g, ' ');

export function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
export function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// Levenshtein distance (for "fast richtig")
export function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

export function todayStr(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
export function vibrate(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }
