/* ============================================================
   STARS — fixed background canvas, all pages
   Exposes: resizeSky(), drawSky(t), skyCanvas, skyCtx
   ============================================================ */

let skyCanvas, skyCtx;
let stars = [], nebulae = [], skyW = 0, skyH = 0;

function resizeSky() {
  skyCanvas = document.getElementById('skyCanvas');
  if (!skyCanvas) return;
  skyCtx = skyCanvas.getContext('2d');
  skyW = skyCanvas.width = window.innerWidth;
  skyH = skyCanvas.height = window.innerHeight;
  buildStars();
  buildNebulae();
}

function buildStars() {
  stars = [];
  const count = Math.floor((skyW * skyH) / 5000);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * skyW,
      y: Math.random() * skyH,
      r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.35 + 0.05,
      twinkleSpeed: Math.random() * 0.8 + 0.3,
      twinkleOffset: Math.random() * Math.PI * 2,
      bright: Math.random() < 0.06
    });
  }
}

function buildNebulae() {
  nebulae = [
    { x: skyW * 0.12, y: skyH * 0.18, rx: 260, ry: 140, color: 'rgba(43,24,188,', a: 0.06, angle: -0.2 },
    { x: skyW * 0.85, y: skyH * 0.72, rx: 200, ry: 110, color: 'rgba(107,122,204,', a: 0.055, angle: 0.35 },
    { x: skyW * 0.62, y: skyH * 0.08, rx: 180, ry: 90,  color: 'rgba(164,190,242,', a: 0.04, angle: -0.1 },
    { x: skyW * 0.25, y: skyH * 0.82, rx: 150, ry: 80,  color: 'rgba(43,24,188,',  a: 0.05, angle: 0.5 }
  ];
}

function drawSky(t) {
  if (!skyCtx) return;
  skyCtx.clearRect(0, 0, skyW, skyH);

  nebulae.forEach(n => {
    skyCtx.save();
    skyCtx.translate(n.x, n.y);
    skyCtx.rotate(n.angle);
    const g = skyCtx.createRadialGradient(0, 0, 0, 0, 0, Math.max(n.rx, n.ry));
    g.addColorStop(0,   n.color + n.a + ')');
    g.addColorStop(0.5, n.color + (n.a * 0.4) + ')');
    g.addColorStop(1,   n.color + '0)');
    skyCtx.scale(1, n.ry / n.rx);
    skyCtx.beginPath();
    skyCtx.arc(0, 0, n.rx, 0, Math.PI * 2);
    skyCtx.fillStyle = g;
    skyCtx.fill();
    skyCtx.restore();
  });

  stars.forEach(s => {
    const tw = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset);
    const al = s.bright ? (0.4 + tw * 0.5) : (s.a * (0.6 + tw * 0.4));
    skyCtx.beginPath();
    skyCtx.arc(s.x, s.y, s.bright ? s.r * 1.6 : s.r, 0, Math.PI * 2);
    skyCtx.fillStyle = s.bright
      ? `rgba(210,225,255,${al})`
      : `rgba(180,200,240,${al})`;
    skyCtx.fill();
    if (s.bright && al > 0.6) {
      skyCtx.strokeStyle = `rgba(210,225,255,${al * 0.25})`;
      skyCtx.lineWidth = 0.5;
      const fl = s.r * 4;
      skyCtx.beginPath();
      skyCtx.moveTo(s.x - fl, s.y);
      skyCtx.lineTo(s.x + fl, s.y);
      skyCtx.moveTo(s.x, s.y - fl);
      skyCtx.lineTo(s.x, s.y + fl);
      skyCtx.stroke();
    }
  });
}

window.addEventListener('resize', resizeSky);

/* Standalone star loop for pages without a globe (globe.js calls drawSky itself). */
(function standaloneSkyLoop() {
  let t0 = null;
  function frame(ts) {
    if (!document.getElementById('globeCanvas')) {
      if (!t0) t0 = ts;
      const t = (ts - t0) * 0.0003;
      drawSky(t);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
