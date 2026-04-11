/* ============================================================
   NAV LOGO — 480x60 canvas, 5 bars + "etho" bold + "strategy" light
   ============================================================ */

const RATIOS = [1.0, 0.82, 0.65, 0.75, 0.93];
const LOGO_COLORS = [
  [200, 215, 255],
  [180, 200, 245],
  [220, 232, 255],
  [160, 185, 240],
  [210, 225, 255]
];
const SPEEDS = [0.52, 0.37, 0.68, 0.41, 0.27];

function startNavLogo(canvasId) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  let t0 = null;

  function frame(ts) {
    if (!t0) t0 = ts;
    const t = (ts - t0) * 0.00038;
    ctx.clearRect(0, 0, W, H);

    ctx.font = '800 22px Satoshi, sans-serif';
    const capH = ctx.measureText('H').actualBoundingBoxAscent || 15;
    const midY = H / 2;
    const baseY = midY + capH * 0.10;
    const topY = baseY - capH;
    const spineX = 8;
    const maxBarW = capH;
    const dotGap = capH * 0.30;
    const textX = spineX + maxBarW + dotGap;
    const barStep = capH / 4;

    RATIOS.forEach((r, i) => {
      const [R, G, B] = LOGO_COLORS[i];
      const barStart = spineX - maxBarW * 0.10;
      const barEnd = spineX + r * maxBarW;
      const barLen = barEnd - barStart;
      const y = topY + i * barStep;
      const dotR = Math.max(1.5, maxBarW * 0.048);
      const tailLen = barLen * 0.42;
      const phase = (t * SPEEDS[i]) % 1;
      const dotX = barStart + phase * barLen;
      const tailStart = Math.max(barStart, dotX - tailLen);

      // Faint track
      const track = ctx.createLinearGradient(barStart, y, barEnd, y);
      track.addColorStop(0,   `rgba(${R},${G},${B},0)`);
      track.addColorStop(0.5, `rgba(${R},${G},${B},0.07)`);
      track.addColorStop(1,   `rgba(${R},${G},${B},0.03)`);
      ctx.beginPath();
      ctx.moveTo(barStart, y);
      ctx.lineTo(barEnd, y);
      ctx.strokeStyle = track;
      ctx.lineWidth = Math.max(0.8, maxBarW * 0.013);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Comet tail
      const grad = ctx.createLinearGradient(tailStart, y, dotX, y);
      grad.addColorStop(0, `rgba(${R},${G},${B},0)`);
      grad.addColorStop(1, `rgba(${R},${G},${B},0.68)`);
      ctx.beginPath();
      ctx.moveTo(tailStart, y);
      ctx.lineTo(dotX, y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(1, maxBarW * 0.022);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glow
      const dg = ctx.createRadialGradient(dotX, y, 0, dotX, y, dotR * 3.5);
      dg.addColorStop(0, `rgba(${R},${G},${B},0.55)`);
      dg.addColorStop(1, `rgba(${R},${G},${B},0)`);
      ctx.beginPath();
      ctx.arc(dotX, y, dotR * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = dg;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(dotX, y, dotR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${R},${G},${B},0.97)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(dotX, y, dotR * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.80)';
      ctx.fill();
    });

    // "etho" bold white
    ctx.font = '800 22px Satoshi, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.94)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('etho', textX, baseY);
    const ethoW = ctx.measureText('etho').width;

    // "strategy" light periwinkle
    ctx.font = '300 22px Satoshi, sans-serif';
    ctx.fillStyle = 'rgba(107,122,204,0.82)';
    ctx.fillText('strategy', textX + ethoW, baseY);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
