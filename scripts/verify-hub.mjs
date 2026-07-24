// verify-hub — the family front's headless gate: the copy is present, the
// sibling links are right, and the three poster painters run against a
// recording 2D-context stub without throwing (pure, no browser).
import { readFileSync } from 'node:fs';
import { PAINTERS, prng } from '../src/posters.js';

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; } else { fail++; console.error('  FAIL:', name); } };

// ---- the page carries the words -------------------------------------------
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
check('title names the family', html.includes('The Steads'));
check('credo present', html.includes('a moor, a sea, a planet'));
for (const [name, tagline] of [
  ['MOORSTEAD', 'moor knows thy name'],
  ['SALTSTEAD', 'the sea never signed the treaty'],
  ['MARSSTEAD', 'four billion years'],
]) {
  check(`${name} panel + tagline`, html.includes(name) && html.includes(tagline));
}
for (const url of ['https://www.moorstead.app', 'https://www.saltstead.app', 'https://www.marsstead.app']) {
  check(`links ${url}`, html.split(url).length >= 3); // play button + footer at least
}
check('every panel has a PLAY door', (html.match(/class="play"/g) || []).length === 3);
check('no binary assets referenced', !/\.(png|jpg|jpeg|webp|gif|mp3|woff)/i.test(html));

// ---- deterministic prng -----------------------------------------------------
const a = prng(7), b = prng(7);
check('prng deterministic', a() === b() && a() === b());
check('prng in [0,1)', [...Array(50)].every(() => { const v = a(); return v >= 0 && v < 1; }));

// ---- the painters run headlessly against a recording stub ------------------
function stubCtx(calls) {
  const grad = { addColorStop: () => {} };
  return new Proxy({}, {
    get: (t, k) => {
      if (k === 'createLinearGradient') return () => grad;
      return (...args) => { calls.push(String(k)); return undefined; };
    },
    set: () => true,
  });
}
for (const [game, painter] of Object.entries(PAINTERS)) {
  const calls = [];
  let threw = false;
  try { painter(stubCtx(calls), 640, 400); } catch (e) { threw = true; console.error(`  ${game}:`, e.message); }
  check(`${game} painter runs clean`, !threw);
  check(`${game} painter actually draws`, calls.filter((c) => c === 'fill' || c === 'fillRect' || c === 'stroke').length > 5);
}
check('three painters, one per stead', Object.keys(PAINTERS).length === 3);

console.log(`\nverify-hub: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
