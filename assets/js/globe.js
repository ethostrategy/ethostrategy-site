/* ============================================================
   ARCTIC GLOBE — hexagonal globe with 5 orbits (home only)
   Drives the sky canvas draw each frame.
   ============================================================ */

// Orbit speeds calmed by ~50% for a more meditative rhythm
const PILLARS = [
  { name: 'CONSENT',        speed: 0.24, rx: 1.40, ryR: 0.30, tilt: -0.18 },
  { name: 'REPRESENTATION', speed: 0.18, rx: 1.28, ryR: 0.44, tilt:  0.56 },
  { name: 'DIGNITY',        speed: 0.11, rx: 1.54, ryR: 0.20, tilt: -0.70 },
  { name: 'SOVEREIGNTY',    speed: 0.30, rx: 1.20, ryR: 0.50, tilt:  1.14 },
  { name: 'ACCOUNTABILITY', speed: 0.14, rx: 1.64, ryR: 0.26, tilt:  0.30 }
];
const ORBIT_COLORS = [
  [200, 215, 255],
  [180, 200, 245],
  [220, 230, 255],
  [160, 185, 240],
  [210, 225, 255]
];

function hexPts(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

function hexPath(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < 6; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

function drawCurvedText(ctx, text, cx, cy, rx, ry, tilt, startAngle, color) {
  const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
  ctx.save();
  ctx.font = '600 8.5px Satoshi, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const charWidth = 7.5;
  const totalWidth = text.length * charWidth;
  const avgR = (rx + ry) / 2;
  const totalAngle = totalWidth / avgR;
  const halfAngle = totalAngle / 2;
  for (let i = 0; i < text.length; i++) {
    const charAngle = startAngle - halfAngle + (i + 0.5) * (totalAngle / text.length);
    const ex = rx * Math.cos(charAngle);
    const ey = ry * Math.sin(charAngle);
    const px = cx + ex * cosT - ey * sinT;
    const py = cy + ex * sinT + ey * cosT;
    const tx = -rx * Math.sin(charAngle);
    const ty = ry * Math.cos(charAngle);
    const tpx = tx * cosT - ty * sinT;
    const tpy = tx * sinT + ty * cosT;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.atan2(tpy, tpx));
    ctx.fillStyle = color;
    ctx.fillText(text[i], 0, -10);
    ctx.restore();
  }
  ctx.restore();
}

function drawOrbit(ctx, cx, cy, rx, ryRatio, tilt, phase, colorRGB, pillarName) {
  const ry = rx * ryRatio;
  const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
  const [r, g, b] = colorRGB;
  const base = `rgba(${r},${g},${b},`;

  ctx.save();
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const a = (Math.PI * 2 / 200) * i;
    const ex = rx * Math.cos(a);
    const ey = ry * Math.sin(a);
    const px = cx + ex * cosT - ey * sinT;
    const py = cy + ex * sinT + ey * cosT;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = base + '0.14)';
  ctx.lineWidth = 0.6;
  ctx.setLineDash([3, 11]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  drawCurvedText(ctx, pillarName, cx, cy, rx, ry, tilt, phase + Math.PI * 0.55, base + '0.40)');

  const dotA = phase % (Math.PI * 2);
  const dex = rx * Math.cos(dotA);
  const dey = ry * Math.sin(dotA);
  const dpx = cx + dex * cosT - dey * sinT;
  const dpy = cy + dex * sinT + dey * cosT;

  // Longer, more visible comet tails — 36 segments spanning ~2 rad
  const TRAIL_SEGS = 36;
  for (let i = 1; i <= TRAIL_SEGS; i++) {
    const ta = (dotA - i * 0.055) % (Math.PI * 2);
    const tex = rx * Math.cos(ta);
    const tey = ry * Math.sin(ta);
    const tpx = cx + tex * cosT - tey * sinT;
    const tpy = cy + tex * sinT + tey * cosT;
    const frac = 1 - i / TRAIL_SEGS;
    ctx.beginPath();
    ctx.arc(tpx, tpy, frac * 4.2, 0, Math.PI * 2);
    ctx.fillStyle = base + (frac * 0.32) + ')';
    ctx.fill();
  }

  const dg = ctx.createRadialGradient(dpx, dpy, 0, dpx, dpy, 16);
  dg.addColorStop(0, base + '0.55)');
  dg.addColorStop(1, base + '0)');
  ctx.beginPath();
  ctx.arc(dpx, dpy, 16, 0, Math.PI * 2);
  ctx.fillStyle = dg;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(dpx, dpy, 3.8, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${r},${g},${b},1)`;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(dpx, dpy, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fill();
}

function startGlobe() {
  const canvas = document.getElementById('globeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 800, H = 800, cx = W / 2, cy = H / 2, r = 200;
  let t0 = null;

  function frame(ts) {
    if (!t0) t0 = ts;
    const t = (ts - t0) * 0.0003;
    ctx.clearRect(0, 0, W, H);

    const hr = r * 0.86;
    const pts = hexPts(cx, cy, hr);

    // Outer halo
    const halo = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.8);
    halo.addColorStop(0, 'rgba(164,190,242,0.06)');
    halo.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = halo;
    ctx.fill();

    // Clipped hexagon globe body
    ctx.save();
    hexPath(ctx, pts);
    ctx.clip();

    const bg = ctx.createRadialGradient(cx - r * 0.22, cy - r * 0.22, 0, cx, cy, r * 0.96);
    bg.addColorStop(0,    'rgba(220,230,255,0.22)');
    bg.addColorStop(0.18, 'rgba(164,190,242,0.30)');
    bg.addColorStop(0.45, 'rgba(80,100,180,0.44)');
    bg.addColorStop(0.72, 'rgba(20,25,70,0.82)');
    bg.addColorStop(1,    'rgba(8,9,26,1)');
    hexPath(ctx, pts);
    ctx.fillStyle = bg;
    ctx.fill();

    // Latitude lines
    [-0.58, -0.32, 0, 0.32, 0.58].forEach((lat, i) => {
      const y = cy + lat * r * 0.85;
      const rx2 = Math.sqrt(Math.max(0, 1 - lat * lat)) * r * 0.85;
      const ry2 = rx2 * 0.18;
      ctx.beginPath();
      ctx.ellipse(cx, y, rx2, ry2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = i === 2 ? 'rgba(180,200,240,0.28)' : 'rgba(140,160,220,0.13)';
      ctx.lineWidth = i === 2 ? 0.9 : 0.5;
      ctx.stroke();
    });

    // Longitude lines (slowly rotating)
    for (let i = 0; i < 9; i++) {
      const a = (Math.PI / 9) * i + t * 0.2;
      const rxl = r * 0.85 * Math.abs(Math.cos(a));
      if (rxl < 1) continue;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rxl, r * 0.85, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(140,160,220,${0.09 + 0.04 * Math.sin(a)})`;
      ctx.lineWidth = 0.45;
      ctx.stroke();
    }

    // Inner highlight
    const sh = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.28, 0, cx - r * 0.1, cy - r * 0.1, r * 0.52);
    sh.addColorStop(0, 'rgba(240,245,255,0.12)');
    sh.addColorStop(1, 'rgba(240,245,255,0)');
    hexPath(ctx, pts);
    ctx.fillStyle = sh;
    ctx.fill();

    ctx.restore();

    // Hex outline
    const eg = ctx.createLinearGradient(pts[1][0], pts[1][1], pts[4][0], pts[4][1]);
    eg.addColorStop(0,   'rgba(160,185,240,0.55)');
    eg.addColorStop(0.5, 'rgba(200,215,255,0.45)');
    eg.addColorStop(1,   'rgba(160,185,240,0.35)');
    hexPath(ctx, pts);
    ctx.strokeStyle = eg;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    const op = hexPts(cx, cy, hr * 1.07);
    hexPath(ctx, op);
    ctx.strokeStyle = 'rgba(164,190,242,0.07)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Orbits + pillars
    PILLARS.forEach((p, i) => {
      drawOrbit(ctx, cx, cy, p.rx * r, p.ryR, p.tilt, t * p.speed + i * (Math.PI * 2 / 5), ORBIT_COLORS[i], p.name);
    });

    // Drive the sky from the same RAF loop
    drawSky(t);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
