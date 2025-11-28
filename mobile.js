// mobile.js — touch adapter for drag behavior and drop detection
// Synthesizes mouse events from touch events so the desktop drag code works on mobile.

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
      // inform global document of pointer position before starting drag
      synthMouseEvent('mousemove', t, document);
      // start drag on this element
      synthMouseEvent('mousedown', t, el);
      // prevent the native scroll / double-tap behavior while dragging
      e.preventDefault();
    }, {passive:false});

    el.addEventListener('touchmove', function(e) {
      const t = e.changedTouches[0];
      // keep mouse position updated for velocity + movement calculations
      synthMouseEvent('mousemove', t, document);
      e.preventDefault();
    }, {passive:false});

    el.addEventListener('touchend', function(e) {
      // On touchend, synthesize mouseup so the desktop logic handles release
      const t = e.changedTouches[0] || e.touches[0] || {clientX:0, clientY:0};
      synthMouseEvent('mouseup', t, window);

      // Also call the global drop handler so dropbox detection runs on mobile.
      if (typeof window.handlePaperDrop === 'function') {
        try {
          window.handlePaperDrop(el);
        } catch (err) {
          console.error('handlePaperDrop threw on touchend:', err);
        }
      }

      e.preventDefault();
    }, {passive:false});
  });

  // Ensure that any stray touchend anywhere also triggers a mouseup
  document.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0] || {clientX:0, clientY:0};
    const evt = new MouseEvent('mouseup', {clientX: t.clientX, clientY: t.clientY, bubbles:true});
    window.dispatchEvent(evt);
  }, {passive:false});
});
