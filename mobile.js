/* mobile.js
   Lightweight helpers for mobile UX:
   - Show a one-time toast / alert when user first interacts by dragging
   - Optionally enable "swipe hint" overlay (kept minimal)
*/
(function () {
  const dragArea = document.getElementById('dragArea');
  if (!dragArea) return;

  // show one-time hint when user first touches dragArea
  let shown = false;
  function showHint() {
    if (shown) return;
    shown = true;
    // simple toast
    const t = document.createElement('div');
    t.textContent = 'Tip: drag / swipe up inside the box to see more photos';
    t.style.position = 'fixed';
    t.style.left = '50%';
    t.style.bottom = '24px';
    t.style.transform = 'translateX(-50%)';
    t.style.background = 'rgba(0,0,0,0.6)';
    t.style.color = 'white';
    t.style.padding = '10px 14px';
    t.style.borderRadius = '999px';
    t.style.zIndex = '99999';
    t.style.fontSize = '0.95rem';
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity 360ms ease';
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 400);
    }, 2400);
  }

  dragArea.addEventListener('touchstart', () => showHint(), { passive: true });
  dragArea.addEventListener('mousedown', () => showHint());
})();

  document.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0] || {clientX:0,clientY:0};
    const evt = new MouseEvent('mouseup', {clientX: t.clientX, clientY: t.clientY, bubbles:true});
    window.dispatchEvent(evt);
  }, {passive:false});
});
