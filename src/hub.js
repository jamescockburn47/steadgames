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

function wake(el) {
  if (!LIVE_PANELS || awake === el) return;
  if (awake) sleep(awake);
  awake = el;
  const img = el.querySelector('img');
  const frame = document.createElement('iframe');
  frame.src = el.dataset.url;
  frame.title = el.dataset.game + ' — live';
  // the still holds the frame until the live page has actually painted
  frame.addEventListener('load', () => {
    if (awake === el) img.style.display = 'none';
  });
  el.querySelector('.port').appendChild(frame);
  const chip = el.querySelector('.wake');
  if (chip) chip.textContent = 'live — PLAY to enter';
}

for (const el of steads) {
  el.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') wake(el); // hover on desktop
  });
  el.querySelector('.port').addEventListener('click', () => {
    // touch (no hover): first tap wakes; a sleeping panel is always a door
    if (awake !== el && LIVE_PANELS && matchMedia('(hover: none)').matches) wake(el);
    else if (awake !== el) window.location.href = el.dataset.url;
  });
}

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
