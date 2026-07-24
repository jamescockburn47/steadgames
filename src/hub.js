// The hub — real screenshots as the sleeping panels; hovering a panel wakes it
// into the game's LIVE front page (one living iframe at a time; the others
// sleep back to their stills). The muster strip fills from the public count
// doors when they open. Zero dependencies.

const LIVE_PANELS = true; // the games' frame-ancestors admit the hub

const steads = [...document.querySelectorAll('.stead')];
let awake = null; // the one living iframe's host element

function sleep(el) {
  const frame = el.querySelector('iframe');
  if (frame) frame.remove();
  el.querySelector('img').style.display = '';
  const chip = el.querySelector('.wake');
  if (chip) chip.textContent = 'hover to visit';
}

function fit(el) {
  const frame = el.querySelector('iframe');
  if (frame) frame.style.transform = `scale(${el.querySelector('.port').clientWidth / 1280})`;
}

function wake(el) {
  if (!LIVE_PANELS || awake === el) return;
  if (awake) sleep(awake);
  awake = el;
  const img = el.querySelector('img');
  const frame = document.createElement('iframe');
  frame.src = el.dataset.url;
  frame.title = el.dataset.game + ' — live';
  // the still holds the frame until the live page has actually painted —
  // load + a beat, so a WebGL world booting from black never shows the void
  frame.addEventListener('load', () => {
    setTimeout(() => { if (awake === el) img.style.display = 'none'; }, 2500);
  });
  el.querySelector('.port').appendChild(frame);
  fit(el); // full desktop layout, scaled to the panel
  const chip = el.querySelector('.wake');
  if (chip) chip.textContent = 'live — PLAY to enter';
}

for (const el of steads) {
  el.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') wake(el); // hover on desktop
  });
  // the preview is a window, not a play surface: clicking it enters the game
  // (on touch, the first tap wakes the preview instead)
  el.querySelector('.port').addEventListener('click', () => {
    if (awake !== el && LIVE_PANELS && matchMedia('(hover: none)').matches) wake(el);
    else window.location.href = el.dataset.url;
  });
}
window.addEventListener('resize', () => { if (awake) fit(awake); });

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
        '<b>' + week + '</b> settlers across the steads this week';
    }
  } catch { /* the strip simply stays quiet */ }
})();
