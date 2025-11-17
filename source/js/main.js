document.getElementById("show-budget-btn").addEventListener("click", () => {

  // collapse all intro content at once
  const intro = document.getElementById("intro-wrapper");
  intro.classList.add("fadeOut");

  intro.addEventListener("transitionend", () => {
    intro.style.display = "none";
  }, { once: true });

  // fade in next question
  const box = document.getElementById("hiddenOption");
  box.classList.remove("hideOption");
  box.classList.add("showOption");
});

document.getElementById("show-budget-btn").addEventListener("click", () => {
  const box = document.getElementById("hiddenOption");
  box.classList.remove("hideOption");
  box.classList.add("showOption");
});

