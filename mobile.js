// Simple one-time hint on first touch

const mobileDrag = document.getElementById("dragArea");
let hintShown = false;

if (mobileDrag) {
    mobileDrag.addEventListener("touchstart", () => {
        if (hintShown) return;
        hintShown = true;

        const tip = document.createElement("div");
        tip.innerText = "Drag inside the box ↑";
        tip.style.position = "fixed";
        tip.style.bottom = "20px";
        tip.style.left = "50%";
        tip.style.transform = "translateX(-50%)";
        tip.style.background = "rgba(0,0,0,0.7)";
        tip.style.color = "white";
        tip.style.padding = "10px 15px";
        tip.style.borderRadius = "8px";
        tip.style.zIndex = "9999";

        document.body.appendChild(tip);

        setTimeout(() => tip.remove(), 2000);
    });
}
