/* enhanced.js
   Small desktop-only visual improvements:
   - gentle float animation for the brand logo
   - parallax tilt for photo items on mousemove (subtle)
   This file is optional; it's safe if left as-is.
*/
(function () {
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.animate([
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-6px)' },
      { transform: 'translateY(0px)' }
    ], {
      duration: 4200,
      iterations: Infinity,
      easing: 'ease-in-out'
    });
  }

  // subtle mousemove tilt on photo items (only on pointer fine & wide screens)
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!supportsHover) return;

  const items = document.querySelectorAll('.photo-item');
  items.forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const r = item.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const tilt = 6;
      item.style.transform = `rotateX(${ -y * tilt }deg) rotateY(${ x * tilt }deg) translateZ(0)`;
      item.style.transition = 'transform 120ms';
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'none';
      item.style.transition = 'transform 260ms';
    });
  });
})();
