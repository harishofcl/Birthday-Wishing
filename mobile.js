/* mobile.js (robust version)
   - Waits for DOM ready
   - Safely checks for dragArea element
   - Shows a one-time toast hint on first interaction
   - Logs debug messages to console for easier troubleshooting
*/

(function () {
  // Wait for DOM content to be ready in case script loads earlier
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(() => {
    try {
      const dragArea = document.getElementById('dragArea');

      if (!dragArea) {
        console.warn('mobile.js: #dragArea not found — skipping mobile hint logic.');
        return;
      }

      // show one-time hint when user first interacts with dragArea
      let shown = false;
      function showHint() {
        try {
          if (shown) return;
          shown = true;
          console.log('mobile.js: showing one-time hint');

          const t = document.createElement('div');
          t.textContent = 'Tip: drag / swipe up inside the box to see more photos';
          Object.assign(t.style, {
            position: 'fixed',
            left: '50%',
            bottom: '24px',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.68)',
            color: 'white',
            padding: '10px 14px',
            borderRadius: '999px',
            zIndex: '999999',
            fontSize: '0.95rem',
            opacity: '1',
            transition: 'opacity 360ms ease'
          });

          document.body.appendChild(t);

          // hide after 2.4s then remove
          setTimeout(() => {
            t.style.opacity = '0';
            setTimeout(() => {
              if (t && t.parentNode) t.parentNode.removeChild(t);
            }, 380);
          }, 2400);
        } catch (err) {
          console.error('mobile.js: showHint error', err);
        }
      }

      // Modern browsers: use passive option for touchstart for performance; we only read event so passive:true is fine
      dragArea.addEventListener('touchstart', showHint, { passive: true });
      dragArea.addEventListener('mousedown', showHint);

      // Helpful debug: report that listeners were attached
      console.log('mobile.js: listeners attached to #dragArea');

    } catch (err) {
      console.error('mobile.js: unexpected error', err);
    }
  });
})();
