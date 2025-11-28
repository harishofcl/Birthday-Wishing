// Pages
const startPage = document.getElementById("startPage");
const photosPage = document.getElementById("photosPage");
const finalPage = document.getElementById("finalPage");

// Buttons
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

// Drag elements
const dragArea = document.getElementById("dragArea");
const contentBox = document.getElementById("contentBox");

// Drag state
let startY = 0;
let currentY = 0;
let maxScroll = 0;
let isDragging = false;

// SHOW PAGE
function show(page) {
    startPage.classList.add("hidden");
    photosPage.classList.add("hidden");
    finalPage.classList.add("hidden");
    page.classList.remove("hidden");
}

// Start page → Photos page
startBtn.onclick = () => {
    show(photosPage);
    setTimeout(calcHeight, 150);
};

// Restart
restartBtn.onclick = () => {
    currentY = 0;
    contentBox.style.transform = "translateY(0px)";
    nextBtn.classList.add("hidden");
    show(startPage);
};

// Calculate scroll height
function calcHeight() {
    maxScroll = contentBox.scrollHeight - dragArea.clientHeight;
}

// Touch start
dragArea.addEventListener("touchstart", e => {
    isDragging = true;
    startY = e.touches[0].clientY;
});

// Mouse start
dragArea.addEventListener("mousedown", e => {
    isDragging = true;
    startY = e.clientY;
});

// Move handler
function handleMove(y) {
    if (!isDragging) return;

    let diff = y - startY;
    let newY = currentY + diff;

    if (newY > 0) newY = 0;
    if (Math.abs(newY) > maxScroll) newY = -maxScroll;

    contentBox.style.transform = `translateY(${newY}px)`;

    if (Math.abs(newY) >= maxScroll - 5) {
        nextBtn.classList.remove("hidden");
    }
}

// Touch move
dragArea.addEventListener("touchmove", e => {
    handleMove(e.touches[0].clientY);
});

// Mouse move
window.addEventListener("mousemove", e => {
    if (isDragging) handleMove(e.clientY);
});

// Drag end
window.addEventListener("mouseup", () => {
    isDragging = false;
    currentY = parseInt(contentBox.style.transform.replace("translateY(",""));
});

dragArea.addEventListener("touchend", () => {
    isDragging = false;
    currentY = parseInt(contentBox.style.transform.replace("translateY(",""));
});

// Next → Surprise page
nextBtn.onclick = () => show(finalPage);

// Initial start page
window.onload = () => show(startPage);
