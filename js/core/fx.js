// Confetti + sparkle bursts on a full-screen canvas
const cv = () => document.getElementById('fx');
let parts = [], running = false;
const COLORS = ['#FF4F6E', '#FFC83D', '#2FBF71', '#47B3F0', '#8B5CF6', '#FF9142'];

function loop() {
  const c = cv(); const g = c.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  if (c.width !== innerWidth * dpr) { c.width = innerWidth * dpr; c.height = innerHeight * dpr; }
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter(p => p.life > 0);
  for (const p of parts) {
    p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 1;
    g.save(); g.globalAlpha = Math.min(1, p.life / 40); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.c;
    if (p.shape === 'star') { star(g, p.s); } else if (p.shape === 'circle') { g.beginPath(); g.arc(0, 0, p.s / 2, 0, 7); g.fill(); }
    else g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2 * (1 + Math.sin(p.rot * 3) * .6));
    g.restore();
  }
  if (parts.length) requestAnimationFrame(loop); else { running = false; g.clearRect(0, 0, innerWidth, innerHeight); }
}
function star(g, s) { g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? s * .22 : s * .5, a = i * Math.PI / 5 - Math.PI / 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); }
function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function confetti(n = 160) {
  if (reduced()) return;
  for (let i = 0; i < n; i++) {
    const left = i % 2 === 0;
    parts.push({ x: left ? -10 : innerWidth + 10, y: innerHeight * (.55 + Math.random() * .3), vx: (left ? 1 : -1) * (6 + Math.random() * 10), vy: -(10 + Math.random() * 12),
      g: .32, drag: .985, rot: Math.random() * 6, vr: (Math.random() - .5) * .3, s: 8 + Math.random() * 10, c: COLORS[i % COLORS.length], life: 160 + Math.random() * 80, shape: Math.random() < .15 ? 'star' : 'rect' });
  }
  start();
}
export function burst(x, y, n = 18) {
  if (reduced()) return;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 5;
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, g: .15, drag: .96, rot: 0, vr: .1, s: 10 + Math.random() * 8, c: COLORS[i % COLORS.length], life: 50 + Math.random() * 20, shape: Math.random() < .5 ? 'star' : 'circle' });
  }
  start();
}
