/* [Begin Mod]
    Author: Pengyu Wang, 03/05/2026
    Mid-Range Creator interactions (matched to High-End behavior)
*/

/* Guard: page must have bg-layer */
const bg = document.getElementById("bg");
if (bg) {
  for (let i = 0; i < 40; i++) {
    const el = document.createElement("div");
    el.className = "spark";

    const x = Math.random() * 100;
    const duration = 6 + Math.random() * 14;
    const delay = Math.random() * 12;
    const drift = (Math.random() - 0.5) * 80;
    const size = 1 + Math.random() * 2.5;

    el.style.cssText =
      `left:${x}%;bottom:-10px;width:${size}px;height:${size}px;` +
      `--drift:${drift}px;animation-duration:${duration}s;animation-delay:-${delay}s;`;

    bg.appendChild(el);
  }
}

/* Spec click → swap preview image/caption (same as High-End) */
const specImg = document.getElementById("spec-image");
const captionTitle = document.getElementById("caption-title");
const captionSub = document.getElementById("caption-sub");
const specRows = document.querySelectorAll(".spec-row[data-img]");

if (specImg && captionTitle && captionSub && specRows.length > 0) {
  // Optional: set first row as active for a consistent initial state
  specRows[0].classList.add("active");

  specRows.forEach((row) => {
    row.addEventListener("click", () => {
      specRows.forEach((r) => r.classList.remove("active"));
      row.classList.add("active");

      specImg.style.opacity = "0";
      setTimeout(() => {
        specImg.src = row.dataset.img;
        specImg.alt = row.dataset.captionTitle;
        captionTitle.textContent = row.dataset.captionTitle;
        captionSub.textContent = row.dataset.captionSub;
        specImg.style.opacity = "";
      }, 280);
    });
  });
}

/* [End Mod]
    Author: Pengyu Wang, 03/05/2026
*/