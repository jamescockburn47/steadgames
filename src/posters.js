// The sleeping panels — procedural posters for the three steads, drawn by the
// hub itself with plain canvas 2D. Pure module: painters take (ctx, w, h) and
// issue only standard 2D calls, so the verify script can drive them headlessly
// with a recording stub. Deterministic — seeded PRNG, never Math.random.

export function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// layered ridge line: a cheap 1D fbm from summed sines
function ridge(r, w, y0, amp, freq) {
  const p1 = r() * 7, p2 = r() * 7, p3 = r() * 7;
  return (x) => y0
    + Math.sin(x * freq + p1) * amp
    + Math.sin(x * freq * 2.3 + p2) * amp * 0.4
    + Math.sin(x * freq * 5.1 + p3) * amp * 0.15;
}

function sky(ctx, w, h, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top); g.addColorStop(1, bottom);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

function hills(ctx, r, w, h, bands) {
  for (const [y0, amp, freq, col] of bands) {
    const f = ridge(r, w, y0 * h, amp * h, freq / w);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) ctx.lineTo(x, f(x));
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  }
}

// MOORSTEAD — dusk heather, dry-stone field lines, a lit croft window
export function paintMoor(ctx, w, h) {
  const r = prng(1847);
  sky(ctx, w, h, '#2b3a52', '#7a6a58');
  ctx.fillStyle = '#e8d9a8';
  ctx.beginPath(); ctx.arc(w * 0.78, h * 0.22, h * 0.05, 0, Math.PI * 2); ctx.fill();
  hills(ctx, r, w, h, [
    [0.52, 0.05, 9, '#3a4a3a'], [0.66, 0.045, 7, '#4a5a3d'], [0.8, 0.04, 5, '#556247'],
  ]);
  for (let i = 0; i < 260; i++) { // heather flecks on the near slope
    const x = r() * w, y = h * (0.72 + r() * 0.26);
    ctx.fillStyle = r() < 0.5 ? '#6e5a78' : '#5d6a4d';
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.strokeStyle = 'rgba(30,36,28,0.55)'; ctx.lineWidth = 2; // dry-stone lines
  for (const t of [0.3, 0.62]) {
    ctx.beginPath(); ctx.moveTo(w * t, h * 0.74);
    ctx.lineTo(w * (t + 0.16), h); ctx.stroke();
  }
  const cx = w * 0.42, cy = h * 0.78; // the croft
  ctx.fillStyle = '#2c2c28'; ctx.fillRect(cx, cy, w * 0.075, h * 0.085);
  ctx.fillStyle = '#22211d';
  ctx.beginPath(); ctx.moveTo(cx - w * 0.008, cy);
  ctx.lineTo(cx + w * 0.0375, cy - h * 0.05);
  ctx.lineTo(cx + w * 0.083, cy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8c46a';
  ctx.fillRect(cx + w * 0.028, cy + h * 0.032, w * 0.014, h * 0.026);
}

// SALTSTEAD — moonlit sea, wave bands, a sloop running before the wind
export function paintSalt(ctx, w, h) {
  const r = prng(1721);
  sky(ctx, w, h, '#0c1826', '#27435e');
  ctx.fillStyle = '#dfe8ee';
  ctx.beginPath(); ctx.arc(w * 0.24, h * 0.2, h * 0.055, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#183048'; ctx.fillRect(0, h * 0.52, w, h * 0.48); // the sea
  for (let i = 0; i < 26; i++) {     // wave glints, brighter toward the moon-path
    const y = h * (0.54 + r() * 0.42);
    const x = r() * w, len = w * (0.02 + r() * 0.06);
    const nearPath = Math.max(0, 1 - Math.abs(x - w * 0.26) / (w * 0.3));
    ctx.strokeStyle = `rgba(190,215,230,${(0.1 + 0.35 * nearPath).toFixed(2)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
  }
  const sx = w * 0.63, sy = h * 0.6; // the sloop
  ctx.fillStyle = '#101c14';
  ctx.beginPath(); ctx.moveTo(sx - w * 0.05, sy);
  ctx.quadraticCurveTo(sx, sy + h * 0.045, sx + w * 0.05, sy);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#cdb98a';
  ctx.beginPath(); ctx.moveTo(sx, sy - h * 0.005); ctx.lineTo(sx, sy - h * 0.19);
  ctx.lineTo(sx + w * 0.045, sy - h * 0.03); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(sx - w * 0.006, sy - h * 0.02); ctx.lineTo(sx - w * 0.006, sy - h * 0.16);
  ctx.lineTo(sx - w * 0.038, sy - h * 0.025); ctx.closePath(); ctx.fill();
}

// MARSSTEAD — butterscotch sky, red dunes, the dome and a rover track
export function paintMars(ctx, w, h) {
  const r = prng(2026);
  sky(ctx, w, h, '#b98a5e', '#7e4a2e');
  ctx.fillStyle = '#e8d3b8';                                  // the shrunken sun
  ctx.beginPath(); ctx.arc(w * 0.3, h * 0.24, h * 0.032, 0, Math.PI * 2); ctx.fill();
  hills(ctx, r, w, h, [
    [0.55, 0.035, 6, '#8a4a2c'], [0.68, 0.04, 5, '#9a5230'], [0.82, 0.045, 4, '#a85c34'],
  ]);
  for (let i = 0; i < 160; i++) {   // scattered basalt
    const x = r() * w, y = h * (0.7 + r() * 0.28);
    ctx.fillStyle = r() < 0.5 ? '#7e4526' : '#93502c';
    ctx.fillRect(x, y, 1 + r() * 2.5, 1 + r() * 2);
  }
  const dx = w * 0.68, dy = h * 0.75; // the stead dome
  ctx.fillStyle = 'rgba(210,225,235,0.85)';
  ctx.beginPath(); ctx.arc(dx, dy, w * 0.045, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8c46a'; ctx.fillRect(dx - w * 0.006, dy - h * 0.052, w * 0.012, h * 0.012);
  ctx.strokeStyle = 'rgba(60,28,14,0.5)'; ctx.lineWidth = 2;  // rover tracks, retraceable
  for (const o of [-0.008, 0.008]) {
    ctx.beginPath(); ctx.moveTo(w * (0.2 + o), h);
    ctx.quadraticCurveTo(w * (0.45 + o), h * 0.86, dx + w * o * 2, dy + h * 0.02);
    ctx.stroke();
  }
}

export const PAINTERS = { moorstead: paintMoor, saltstead: paintSalt, marsstead: paintMars };
