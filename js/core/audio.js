// Speech clips (pre-generated MP3s, LMVZ-style) + synthesized sound effects
import { fnv } from './util.js';
import { store } from './store.js';

export const audioId = (text, voice = 'n') => fnv(voice + '|' + text.trim());

let ctx = null;
const buffers = new Map();     // id -> AudioBuffer | Promise
let available = null;          // Set of ids from audio/index.json
let current = null;            // { src, resolve }
const listeners = new Set();

let gen = 0;                   // increases on every stop()/say(): stale async plays are dropped
let htmlAudio = null;          // used for slow playback (keeps the pitch natural)
function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C();
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {} // iPad: play even with mute switch
  }
  if (ctx && ctx.state !== 'running') { try { ctx.resume().catch(() => {}); } catch (e) {} }
  return ctx;
}
// iOS needs a user gesture to unlock audio
if (typeof window !== 'undefined') ['pointerdown', 'keydown', 'touchend'].forEach(ev => window.addEventListener(ev, () => ac(), { once: false, passive: true }));

export async function loadIndex() {
  try { const r = await fetch('audio/index.json', { cache: 'no-cache' }); available = new Set(await r.json()); }
  catch (e) { available = new Set(); }
}
export const hasClip = (text, voice) => !!available && available.has(audioId(text, voice));

async function getBuffer(id) {
  if (buffers.has(id)) return buffers.get(id);
  const p = (async () => {
    const r = await fetch(`audio/${id}.mp3`);
    if (!r.ok) throw new Error('missing');
    const data = await r.arrayBuffer();
    const c = ac();
    return await new Promise((res, rej) => c.decodeAudioData(data, res, rej));
  })();
  buffers.set(id, p);
  try { const b = await p; buffers.set(id, b); return b; } catch (e) { buffers.delete(id); throw e; }
}

export function preload(lines) {
  if (!available) return;
  for (const l of lines) { const id = audioId(l.text, l.voice); if (available.has(id)) getBuffer(id).catch(() => {}); }
}

export function stop() {
  gen++;
  if (current) { try { current.src.stop(); } catch (e) {} current.resolve(); current = null; }
  if (htmlAudio) { try { htmlAudio.pause(); } catch (e) {} htmlAudio = null; }
  try { speechSynthesis.cancel(); } catch (e) {}
  emit(false);
}
function emit(on) { listeners.forEach(f => f(on)); }
export function onPlaying(f) { listeners.add(f); return () => listeners.delete(f); }

/** Speak a French line. Resolves when finished (never hangs: safety timeout). */
export async function say(text, voice = 'n', { slow } = {}) {
  stop();
  const my = gen;
  const id = audioId(text, voice);
  const isSlow = slow ?? store.s.settings.slow;
  const has = available && available.has(id);
  if (has && isSlow) {
    // slow: HTMLAudio keeps the natural pitch (preservesPitch)
    return new Promise(resolve => {
      const a = new Audio(`audio/${id}.mp3`);
      a.playbackRate = 0.78; a.preservesPitch = true; a.mozPreservesPitch = true; a.webkitPreservesPitch = true;
      htmlAudio = a; const done = () => { if (htmlAudio === a) { htmlAudio = null; emit(false); } resolve(); };
      a.onended = done; a.onerror = () => { done(); };
      emit(true);
      a.play().catch(() => done());
      setTimeout(done, 20000);
    });
  }
  if (has && ac()) {
    try {
      const buf = await getBuffer(id);
      if (my !== gen) return;               // another clip was requested meanwhile
      return await new Promise(resolve => {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        let fin = false;
        const done = () => { if (fin) return; fin = true; if (current && current.src === src) { current = null; emit(false); } resolve(); };
        current = { src, resolve: done };
        src.onended = done;
        emit(true);
        src.start();
        setTimeout(done, buf.duration * 1000 + 1500); // iOS 'interrupted' contexts never fire onended
      });
    } catch (e) { if (my !== gen) return; /* fall through to speech synthesis */ }
  }
  return speakFallback(text, isSlow ? 0.78 : 1);
}

function speakFallback(text, rate) {
  return new Promise(resolve => {
    setTimeout(resolve, 2500 + text.length * 90);
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'fr-FR'; u.rate = 0.82 * rate;
      const v = speechSynthesis.getVoices().find(v => /^fr/i.test(v.lang));
      if (v) u.voice = v;
      u.onend = u.onerror = () => { emit(false); resolve(); };
      emit(true);
      speechSynthesis.speak(u);
    } catch (e) { resolve(); }
  });
}

// ---------------- sound effects (synthesized, no files) ----------------
function tone(freq, t0, dur, { type = 'sine', vol = .18, slide = 0, attack = .01 } = {}) {
  const c = ac(); if (!c || !store.s.settings.sound) return;
  const t = c.currentTime + t0;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .05);
}
function noise(t0, dur, vol = .08) {
  const c = ac(); if (!c || !store.s.settings.sound) return;
  const n = c.sampleRate * dur, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = 2400; g.gain.value = vol;
  s.buffer = b; s.connect(f).connect(g).connect(c.destination); s.start(c.currentTime + t0);
}
export const sfx = {
  tap() { tone(520, 0, .06, { type: 'triangle', vol: .08 }); },
  pick() { tone(660, 0, .07, { type: 'triangle', vol: .1 }); tone(990, .03, .06, { type: 'sine', vol: .05 }); },
  drop() { tone(440, 0, .08, { type: 'triangle', vol: .1, slide: .8 }); },
  correct() { tone(784, 0, .14, { type: 'triangle', vol: .16 }); tone(1046, .09, .22, { type: 'triangle', vol: .16 }); tone(1568, .16, .25, { vol: .05 }); },
  almost() { tone(660, 0, .14, { type: 'triangle', vol: .13 }); tone(784, .1, .2, { type: 'triangle', vol: .12 }); },
  wrong() { tone(220, 0, .18, { type: 'sawtooth', vol: .06, slide: .85 }); tone(196, .12, .26, { type: 'triangle', vol: .12, slide: .9 }); },
  combo(n = 3) { [0, 1, 2, 3].forEach(i => tone(880 * Math.pow(1.12, i + n * .2), i * .05, .12, { type: 'square', vol: .035 })); },
  star(i = 0) { tone(1046 * Math.pow(1.26, i), 0, .3, { type: 'triangle', vol: .14 }); noise(0, .12, .03); },
  whoosh() { noise(0, .25, .05); },
  complete() {
    const n = [523, 659, 784, 1046, 784, 1046, 1318];
    n.forEach((f, i) => tone(f, i * .09, i === n.length - 1 ? .6 : .16, { type: 'triangle', vol: .13 }));
    tone(262, 0, .7, { type: 'sine', vol: .08 }); tone(392, .36, .8, { type: 'sine', vol: .06 });
  },
  pop() { tone(380, 0, .08, { type: 'sine', vol: .14, slide: 2.2 }); },
};
