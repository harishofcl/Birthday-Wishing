// mobile.js — touch adapter for drag behavior and drop detection
document.addEventListener('DOMContentLoaded', () => {
  function synthMouseEvent(type, touch, target) {
    const evt = new MouseEvent(type, {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0
    });
    target.dispatchEvent(evt);
  }

  const papers = Array.from(document.querySelectorAll('.paper.glass.image, .paper.image'));
  papers.forEach(el => {
    el.addEventListener('touchstart', function(e) {
      const t = e.changedTouches[0];
      synthMouseEvent('mousemove', t, document);
      synthMouseEvent('mousedown', t, el);
      e.preventDefault();
    }, {passive:false});

    el.addEventListener('touchmove', function(e) {
      const t = e.changedTouches[0];
      synthMouseEvent('mousemove', t, document);
      e.preventDefault();
    }, {passive:false});

    el.addEventListener('touchend', function(e) {
      const t = e.changedTouches[0] || e.touches[0] || {clientX:0,clientY:0};
      synthMouseEvent('mouseup', t, window);
      // Also call drop handler if available
      if (typeof window.handlePaperDrop === 'function') {
        try { window.handlePaperDrop(el); } catch (err) { console.error(err); }
      }
      e.preventDefault();
    }, {passive:false});
  });

  document.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0] || {clientX:0,clientY:0};
    const evt = new MouseEvent('mouseup', {clientX: t.clientX, clientY: t.clientY, bubbles:true});
    window.dispatchEvent(evt);
  }, {passive:false});
});
