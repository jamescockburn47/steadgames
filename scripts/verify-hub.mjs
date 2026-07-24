// verify-hub — the family front's headless gate: the copy is present, the
// sibling links are right, and the three real screenshots exist and are
// substantial. Screenshots are reshot with Marsstead's scripts/shoot-family.mjs.
import { readFileSync, statSync } from 'node:fs';

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; } else { fail++; console.error('  FAIL:', name); } };

// ---- the page carries the words -------------------------------------------
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
check('title names the family', html.includes('The Steads'));
check('credo: the seas (not a sea)', html.includes('a moor, the seas, a planet') && !html.includes('a moor, a sea,'));
check('credo: AI characters', html.includes('AI characters you can talk to'));
check('credo: free, no downloads, no ads', html.includes('Free, no downloads, no ads'));
check('the art-department line is gone', !/art department/i.test(html));
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

// ---- the real screenshots are in place -------------------------------------
for (const game of ['moorstead', 'saltstead', 'marsstead']) {
  check(`panel img wired: ${game}`, html.includes(`/shots/${game}.jpg`));
  let size = 0;
  try { size = statSync(new URL(`../shots/${game}.jpg`, import.meta.url)).size; } catch { /* missing */ }
  check(`shot exists + substantial: ${game}`, size > 20000);
}
check('every shot has alt text', (html.match(/<img [^>]*alt="/g) || []).length === 3);

console.log(`\nverify-hub: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
