/* ============================================================
   ETHOSTRATEGY — main.js
   Handles: nav scroll state, star field, nav logo animation,
            hero arctic globe animation
   ============================================================ */

(function () {
  'use strict';

  const COLORS = {
    black: '#0A0A0A',
    indigo: '#2B18BC',
    periwinkle: '#6B7ACC',
    sky: '#A4BEF2',
    white: '#FFFFFF'
  };

  /* ========== HiDPI helper ========== */
  function fitCanvas(canvas, cssW, cssH) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  /* ============================================================
     NAV — scroll state
     ============================================================ */
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============================================================
     STAR FIELD — fixed background
     ============================================================ */
  function initStarField() {
    const canvas = document.getElementById('star-field');
    if (!canvas) return;

    let w, h, ctx, stars, nebulae, brightStars;

    function setup() {
      w = window.innerWidth;
      h = window.innerHeight;
      ctx = fitCanvas(canvas, w, h);

      const count = Math.floor((w * h) / 4500);
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.1 + 0.2,
          baseAlpha: Math.random() * 0.5 + 0.2,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.4 + 0.15
        });
      }

      brightStars = [];
      for (let i = 0; i < 8; i++) {
        brightStars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 1.0,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.3 + 0.1
        });
      }

      nebulae = [
        { x: w * 0.18, y: h * 0.22, r: 280, color: 'rgba(43, 24, 188, 0.055)' },
        { x: w * 0.82, y: h * 0.15, r: 340, color: 'rgba(107, 122, 204, 0.045)' },
        { x: w * 0.72, y: h * 0.78, r: 380, color: 'rgba(43, 24, 188, 0.05)' },
        { x: w * 0.25, y: h * 0.82, r: 260, color: 'rgba(164, 190, 242, 0.035)' }
      ];
    }

    setup();
    window.addEventListener('resize', setup);

    function draw(t) {
      ctx.clearRect(0, 0, w, h);

      // nebulae
      for (const n of nebulae) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, n.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // regular stars
      for (const s of stars) {
        const a = s.baseAlpha + Math.sin(t * 0.001 * s.speed + s.phase) * 0.25;
        ctx.globalAlpha = Math.max(0.05, Math.min(1, a));
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // bright stars with cross flares
      for (const s of brightStars) {
        const a = 0.55 + Math.sin(t * 0.001 * s.speed + s.phase) * 0.35;
        ctx.globalAlpha = Math.max(0.2, a);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = a * 0.55;
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(s.x - s.r * 4, s.y);
        ctx.lineTo(s.x + s.r * 4, s.y);
        ctx.moveTo(s.x, s.y - s.r * 4);
        ctx.lineTo(s.x, s.y + s.r * 4);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ============================================================
     NAV LOGO — 5 bars, comet shooting L→R continuously
     ============================================================ */
  function initNavLogo() {
    const canvas = document.getElementById('nav-logo-canvas');
    if (!canvas) return;

    const size = 34;
    const ctx = fitCanvas(canvas, size, size);

    // Ratios: V-shape stepped
    const ratios = [1.0, 0.82, 0.65, 0.75, 0.93];
    const colors = [
      [200, 215, 255],
      [180, 200, 245],
      [220, 230, 255],
      [160, 185, 240],
      [210, 225, 255]
    ];
    const speeds = [1.0, 0.82, 0.6, 0.75, 0.9];

    const pad = 3;
    const barSpacing = (size - pad * 2) / 4;
    const startX = pad;
    const baseW = size - pad * 2;

    function draw(t) {
      ctx.clearRect(0, 0, size, size);

      for (let i = 0; i < 5; i++) {
        const y = pad + i * barSpacing;
        const barEnd = startX + baseW * ratios[i];
        const c = colors[i];

        // comet position — continuous L→R
        const T = 2200 / speeds[i]; // ms full cycle
        const p = ((t % T) / T); // 0..1
        const cometX = startX + (barEnd - startX) * p;

        // faint bar track
        const trackGrad = ctx.createLinearGradient(startX, y, barEnd, y);
        trackGrad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        trackGrad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0.18)`);
        ctx.strokeStyle = trackGrad;
        ctx.lineWidth = 0.9;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(barEnd, y);
        ctx.stroke();

        // comet tail (trailing gradient up to current position)
        const tailLen = 16;
        const tailStart = Math.max(startX, cometX - tailLen);
        const tailGrad = ctx.createLinearGradient(tailStart, y, cometX, y);
        tailGrad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        tailGrad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0.9)`);
        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(tailStart, y);
        ctx.lineTo(cometX, y);
        ctx.stroke();

        // comet head glow
        const headGrad = ctx.createRadialGradient(cometX, y, 0, cometX, y, 4);
        headGrad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.95)`);
        headGrad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(cometX, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // comet core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cometX, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ============================================================
     ARCTIC GLOBE — hero visual
     ============================================================ */
  function initArcticGlobe() {
    const canvas = document.getElementById('arctic-globe');
    if (!canvas) return;

    const CSS = 560;
    const INTERNAL = 800;
    const ctx = fitCanvas(canvas, CSS, CSS);
    // draw everything in 800x800 logical units by scaling
    const scale = CSS / INTERNAL;
    ctx.scale(scale, scale);

    const cx = INTERNAL / 2;
    const cy = INTERNAL / 2;
    const R = 230; // globe radius

    // Hexagon clip path
    function hexPath(r) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    // Orbits: [tiltX, tiltY, speed, color, pillar]
    const orbits = [
      { rx: 290, ry: 80,  tilt: -0.25, speed: 0.48, color: [200, 215, 255], label: 'CONSENT' },
      { rx: 310, ry: 110, tilt: 0.35,  speed: 0.35, color: [180, 200, 245], label: 'REPRESENTATION' },
      { rx: 275, ry: 60,  tilt: 0.05,  speed: 0.22, color: [220, 230, 255], label: 'DIGNITY' },
      { rx: 300, ry: 130, tilt: -0.55, speed: 0.60, color: [160, 185, 240], label: 'SOVEREIGNTY' },
      { rx: 320, ry: 95,  tilt: 0.75,  speed: 0.28, color: [210, 225, 255], label: 'ACCOUNTABILITY' }
    ];

    function draw(t) {
      ctx.clearRect(0, 0, INTERNAL, INTERNAL);

      // --- subtle outer glow
      const outerGlow = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 1.9);
      outerGlow.addColorStop(0, 'rgba(43, 24, 188, 0.22)');
      outerGlow.addColorStop(1, 'rgba(43, 24, 188, 0)');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, INTERNAL, INTERNAL);

      // --- hexagon clip + globe body
      ctx.save();
      hexPath(R * 1.55);
      ctx.clip();

      // globe body gradient
      const gb = ctx.createRadialGradient(cx - 30, cy - 40, 10, cx, cy, R * 1.1);
      gb.addColorStop(0, 'rgba(140, 160, 230, 0.45)');
      gb.addColorStop(0.5, 'rgba(43, 40, 130, 0.3)');
      gb.addColorStop(1, 'rgba(10, 10, 40, 0.85)');
      ctx.fillStyle = gb;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // latitude lines (5)
      ctx.strokeStyle = 'rgba(164, 190, 242, 0.18)';
      ctx.lineWidth = 0.7;
      for (let i = 1; i < 5; i++) {
        const yOff = (i - 2.5) * (R * 2 / 5);
        const latR = Math.sqrt(Math.max(0, R * R - yOff * yOff));
        const latRy = latR * 0.25;
        ctx.beginPath();
        ctx.ellipse(cx, cy + yOff, latR, latRy, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // longitude lines (9) — slowly rotating
      const rot = t * 0.00008;
      ctx.strokeStyle = 'rgba(164, 190, 242, 0.14)';
      for (let i = 0; i < 9; i++) {
        const phase = (i / 9) * Math.PI + rot;
        const lrx = Math.abs(Math.cos(phase)) * R;
        ctx.beginPath();
        ctx.ellipse(cx, cy, lrx, R, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // inner bright spot
      const glow = ctx.createRadialGradient(cx - 10, cy - 20, 0, cx, cy, R * 0.7);
      glow.addColorStop(0, 'rgba(200, 215, 255, 0.35)');
      glow.addColorStop(1, 'rgba(200, 215, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // --- hexagon outline
      ctx.strokeStyle = 'rgba(164, 190, 242, 0.35)';
      ctx.lineWidth = 1.2;
      hexPath(R * 1.55);
      ctx.stroke();

      // --- orbits with comets + pillar labels
      for (let i = 0; i < orbits.length; i++) {
        const o = orbits[i];

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(o.tilt);

        // dashed orbit ellipse
        ctx.strokeStyle = `rgba(${o.color[0]},${o.color[1]},${o.color[2]},0.14)`;
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, o.rx, o.ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // comet position along ellipse
        const ang = (t * 0.001 * o.speed) % (Math.PI * 2);
        const dx = Math.cos(ang) * o.rx;
        const dy = Math.sin(ang) * o.ry;

        // trailing tail (draw N segments behind)
        const segs = 22;
        for (let s = 0; s < segs; s++) {
          const a2 = ang - (s / segs) * 0.9;
          const x1 = Math.cos(a2) * o.rx;
          const y1 = Math.sin(a2) * o.ry;
          const a3 = ang - ((s + 1) / segs) * 0.9;
          const x2 = Math.cos(a3) * o.rx;
          const y2 = Math.sin(a3) * o.ry;
          const alpha = (1 - s / segs) * 0.55;
          ctx.strokeStyle = `rgba(${o.color[0]},${o.color[1]},${o.color[2]},${alpha})`;
          ctx.lineWidth = 1.5 * (1 - s / segs) + 0.3;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // bright dot
        const dotGlow = ctx.createRadialGradient(dx, dy, 0, dx, dy, 12);
        dotGlow.addColorStop(0, `rgba(${o.color[0]},${o.color[1]},${o.color[2]},0.9)`);
        dotGlow.addColorStop(1, `rgba(${o.color[0]},${o.color[1]},${o.color[2]},0)`);
        ctx.fillStyle = dotGlow;
        ctx.beginPath();
        ctx.arc(dx, dy, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(dx, dy, 2.4, 0, Math.PI * 2);
        ctx.fill();

        // pillar label — curve along orbit, fixed position
        // place at angle = -PI/2 (top-right area), but rotate per orbit index
        const labelAngle = -Math.PI / 2 + (i * (Math.PI * 2 / 5));
        drawCurvedLabel(ctx, o.label, o.rx, o.ry, labelAngle, `rgba(${o.color[0]},${o.color[1]},${o.color[2]},0.7)`);

        ctx.restore();
      }

      requestAnimationFrame(draw);
    }

    function drawCurvedLabel(ctx, text, rx, ry, startAngle, color) {
      ctx.save();
      ctx.font = '600 11px Satoshi, sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const letters = text.split('');
      const totalSpan = letters.length * 0.035;
      let a = startAngle - totalSpan / 2;
      const step = totalSpan / Math.max(1, letters.length - 1);

      for (const ch of letters) {
        const x = Math.cos(a) * (rx + 14);
        const y = Math.sin(a) * (ry + 14);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a + Math.PI / 2);
        ctx.fillText(ch, 0, 0);
        ctx.restore();
        a += step;
      }
      ctx.restore();
    }

    requestAnimationFrame(draw);
  }

  /* ============================================================
     Init
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    initNavScroll();
    initStarField();
    initNavLogo();
    initArcticGlobe();
  });
})();
