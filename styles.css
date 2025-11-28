/* MAIN FLOW + DRAG LOGIC
   script.js
*/
(function () {
  // elements
  const startScreen = document.getElementById('startScreen');
  const photoFrame = document.getElementById('photoFrame');
  const surprisePage = document.getElementById('surprisePage');
  const startBtn = document.getElementById('startBtn');
  const photosStack = document.getElementById('photosStack');
  const dragArea = document.getElementById('dragArea');
  const revealBtn = document.getElementById('revealBtn');
  const nextBtn = document.getElementById('nextBtn');
  const restartBtn = document.getElementById('restartBtn');

  // state
  let isDragging = false;
  let startY = 0;
  let currentY = 0;   // translateY in px (0 .. -maxUp)
  let maxUp = 0;      // positive number of how many px can we move up (stackHeight - frameHeight)
  let frameHeight = 0;
  let stackHeight = 0;

  // helpers to show/hide sections
  function showSection(section) {
    [startScreen, photoFrame, surprisePage].forEach(s => s.classList.add('hidden'));
    section.classList.remove('hidden');
  }

  // recalc heights and clamp
  function recalcHeights() {
    frameHeight = dragArea.clientHeight;
    stackHeight = photosStack.scrollHeight;
    maxUp = Math.max(0, stackHeight - frameHeight);
    currentY = Math.max(-maxUp, Math.min(0, currentY));
    photosStack.style.transform = `translateY(${currentY}px)`;
    updateNextVisibility();
  }

  function updateNextVisibility() {
    if (maxUp === 0) {
      nextBtn.classList.remove('hidden'); // no scrolling needed -> show next
      return;
    }
    if (Math.abs(currentY) >= (maxUp - 18)) {
      nextBtn.classList.remove('hidden');
    } else {
      nextBtn.classList.add('hidden');
    }
  }

  // start flow
  startBtn.addEventListener('click', () => {
    showSection(photoFrame);
    setTimeout(recalcHeights, 60);
  });

  // restart
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      currentY = 0;
      photosStack.style.transform = `translateY(0px)`;
      nextBtn.classList.add('hidden');
      showSection(startScreen);
    });
  }

  // reveal button: jump to bottom
  revealBtn.addEventListener('click', () => {
    currentY = -maxUp;
    photosStack.style.transition = 'transform 360ms cubic-bezier(.2,.9,.2,1)';
    photosStack.style.transform = `translateY(${currentY}px)`;
    setTimeout(updateNextVisibility, 380);
  });

  // next button -> surprise
  nextBtn.addEventListener('click', () => {
    showSection(surprisePage);
  });

  /* DRAG/GESTURE LOGIC (touch + mouse)
     We implement clamped dragging with light resistance beyond bounds.
  */
  function onDragStart(clientY) {
    isDragging = true;
    startY = clientY;
    photosStack.style.transition = 'none';
  }

  function onDragMove(clientY) {
    if (!isDragging) return;
    let delta = clientY - startY;
    let candidate = currentY + delta;
    // resistance beyond edges
    const res = 0.35;
    if (candidate > 40) candidate = 40 + (candidate - 40) * res;
    if (candidate < -maxUp - 40) candidate = -maxUp - 40 + (candidate + maxUp + 40) * res;
    photosStack.style.transform = `translateY(${candidate}px)`;
  }

  function onDragEnd(clientY) {
    if (!isDragging) return;
    let delta = clientY - startY;
    currentY = currentY + delta;
    currentY = Math.max(-maxUp, Math.min(0, currentY));
    photosStack.style.transition = 'transform 260ms cubic-bezier(.2,.9,.2,1)';
    photosStack.style.transform = `translateY(${currentY}px)`;
    isDragging = false;
    updateNextVisibility();
  }

  // touch events
  dragArea.addEventListener('touchstart', e => {
    recalcHeights();
    onDragStart(e.touches[0].clientY);
  }, { passive: true });

  dragArea.addEventListener('touchmove', e => {
    onDragMove(e.touches[0].clientY);
    // prevent default scrolling only when dragging vertically inside dragArea
    e.preventDefault();
  }, { passive: false });

  dragArea.addEventListener('touchend', e => {
    onDragEnd((e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : startY);
  });

  // mouse events (desktop)
  let mouseDown = false;
  dragArea.addEventListener('mousedown', e => {
    mouseDown = true;
    recalcHeights();
    onDragStart(e.clientY);
  });

  window.addEventListener('mousemove', e => {
    if (!mouseDown) return;
    onDragMove(e.clientY);
  });

  window.addEventListener('mouseup', e => {
    if (!mouseDown) return;
    mouseDown = false;
    onDragEnd(e.clientY);
  });

  // recompute when window resizes or images load
  window.addEventListener('resize', recalcHeights);
  window.addEventListener('load', () => {
    // ensure any images have time to lay out
    setTimeout(recalcHeights, 120);
    showSection(startScreen);
  });

})();
