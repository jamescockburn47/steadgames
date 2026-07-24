// The hub — paints the sleeping posters, wakes one living panel at a time
// (phase 2, behind LIVE_PANELS), and fills the muster strip from the public
// count doors when they exist. Zero dependencies, zero assets.
import { PAINTERS } from './posters.js';

// phase 2 flips this true once the games' frame-ancestors admit the hub
const LIVE_PANELS = false;

const steads = [...document.querySelectorAll('.stead')];
let awake = null; // the one living iframe's host element

function paint(el) {
  const canvas = el.querySelector('canvas');
  const port = el.querySelector('.port');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(port.clientWidth * dpr));
  const h = Math.max(1, Math.round(port.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  const painter = PAINTERS[el.dataset.game];
  if (painter) painter(canvas.getContext('2d'), w, h);
}

function sleep(el) {
  const frame = el.querySelector('iframe');
  if (frame) frame.remove();
  el.querySelector('canvas').style.display = '';
  const chip = el.querySelector('.wake');
  if (chip) chip.textContent = LIVE_PANELS ? 'tap to wake' : 'enter';
}

function wake(el) {
  if (awake === el) return;
  if (awake) sleep(awake);
  awake = el;
  const frame = document.createElement('iframe');
  frame.src = el.dataset.url;
  frame.loading = 'lazy';
  frame.title = el.dataset.game + ' — live';
  el.querySelector('.port').appendChild(frame);
  el.querySelector('canvas').style.display = 'none';
  const chip = el.querySelector('.wake');
  if (chip) chip.textContent = 'live — click PLAY to enter';
}

for (const el of steads) {
  paint(el);
  const chip = el.querySelector('.wake');
  if (chip && !LIVE_PANELS) chip.textContent = 'enter';
  el.querySelector('.port').addEventListener('click', () => {
    if (LIVE_PANELS) wake(el);
    else window.location.href = el.dataset.url; // phase 1: the poster is a door
  });
}
window.addEventListener('resize', () => {
  for (const el of steads) if (el !== awake) paint(el);
});

// the muster strip — counts only, graceful absence until the doors open
const MUSTER_DOORS = [
  'https://www.moorstead.app/dash/muster-public',
  'https://www.saltstead.app/dash/muster-public',
  'https://www.marsstead.app/dash/muster-public',
];
(async function muster() {
  try {
    const grab = (u) => fetch(u, { signal: AbortSignal.timeout(4000) })
      .then((r) => (r.ok ? r.json() : null)).catch(() => null);
    const all = await Promise.all(MUSTER_DOORS.map(grab));
    const week = all.reduce((s, d) => s + ((d && d.week) || 0), 0);
    if (week > 0) {
      document.getElementById('muster').innerHTML =
        '<b>' + week + '</b> settler' + (week === 1 ? '' : 's') + ' across the steads this week';
    }
  } catch { /* the strip simply stays quiet */ }
})();
