/* ============================================================
   ETHOSTRATEGY — main.js
   Nav scroll state + init hooks for stars, logo, globe.
   ============================================================ */

// Nav scroll background
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Init everything once the page + fonts are ready
function init() {
  if (typeof resizeSky === 'function') resizeSky();
  if (typeof startGlobe === 'function') startGlobe();
  if (typeof startNavLogo === 'function') startNavLogo('logoCanvas');
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(init);
} else {
  window.addEventListener('load', init);
}
