// Persistent progress (localStorage, wrapped so the app works without it)
import { todayStr } from './util.js';

const KEY = 'maisonfraise.v1';
const fresh = () => ({
  name: '', xp: 0, berries: 0,
  streak: { n: 0, last: '' },
  day: { d: todayStr(), xp: 0 },
  lessons: {},            // id -> { stars, best, plays }
  mistakes: [],           // [{ id, lesson, ex, n }]
  exams: [],              // [{ d, pts, max, grade }]
  badges: [],
  settings: { sound: true, slow: false, goal: 60 },
});

let S = fresh();
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(fresh(), JSON.parse(raw)); } catch (e) {}
S.settings = Object.assign(fresh().settings, S.settings || {});
// v2: mistakes are stored as {lesson, seed, exId} (rebuilt on demand) – drop old heavy entries
S.mistakes = (S.mistakes || []).filter(m => m && (m.seed != null || m.inline));
if (S.day.d !== todayStr()) S.day = { d: todayStr(), xp: 0 };

export const store = {
  get s() { return S; },
  save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { try { S.mistakes = S.mistakes.slice(-20); localStorage.setItem(KEY, JSON.stringify(S)); } catch (e2) {} }
  },
  addXP(n) {
    S.xp += n;
    if (S.day.d !== todayStr()) S.day = { d: todayStr(), xp: 0 };
    S.day.xp += n;
    this.touchStreak();
    this.save();
  },
  touchStreak() {
    const t = todayStr();
    if (S.streak.last === t) return;
    const y = todayStr(new Date(Date.now() - 864e5));
    S.streak.n = S.streak.last === y ? S.streak.n + 1 : 1;
    S.streak.last = t;
  },
  lesson(id) { return S.lessons[id] || { stars: 0, best: 0, plays: 0 }; },
  finishLesson(id, acc, stars) {
    const L = this.lesson(id);
    S.lessons[id] = { stars: Math.max(L.stars, stars), best: Math.max(L.best, acc), plays: L.plays + 1 };
    this.save();
  },
  addMistake(m) {
    const ex = S.mistakes.find(x => x.id === m.id);
    if (ex) { ex.n = (ex.n || 1) + 1; ex.t = Date.now(); }
    else if (m.lesson) S.mistakes.push({ ...m, n: 1, t: Date.now() });
    if (S.mistakes.length > 60) S.mistakes.splice(0, S.mistakes.length - 60);
    this.save();
  },
  clearMistake(id) { S.mistakes = S.mistakes.filter(m => m.id !== id); this.save(); },
  badge(id) { if (!S.badges.includes(id)) { S.badges.push(id); this.save(); return true; } return false; },
  reset() { S = fresh(); this.save(); },
};
