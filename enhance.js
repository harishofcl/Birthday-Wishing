// Optional small desktop hover animation
// Safe even if nothing happens

const imgs = document.querySelectorAll(".content-box img");

imgs.forEach(img => {
    img.addEventListener("mouseover", () => {
        img.style.transform = "scale(1.02)";
        img.style.transition = "0.2s";
    });

    img.addEventListener("mouseout", () => {
        img.style.transform = "scale(1)";
    });
});
