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

// [Begin Mod]
// Author: Zhibin Wang, 03/05/2026
// Assisted by Claude (Anthropic) for structure and content

const builds = [
  {
    name: "BEGINNER BUILD",
    desc: "Great Entry Build for Gaming and Entertainment",
    url: "builds/budget.html",
    maxBudget: 699,
  },
  {
    name: "ADVANCE BUILD",
    desc: "More Performance for higher FPS Gaming and Moderate Work",
    url: "builds/midrange.html",
    maxBudget: 1299,
  },
  {
    name: "PROFESSIONAL BUILD",
    desc: "For Professional Work in Editing, 3D Rendering, and Gaming",
    url: "builds/highend.html",
    maxBudget: Infinity,
  },
];

function getRecommendation(budget) {
  return builds.find(b => budget <= b.maxBudget);
}

const slider = document.getElementById("budget-slider");
const budgetDisplay = document.getElementById("budget-display");
const recBuildName = document.getElementById("rec-build-name");
const recBuildDesc = document.getElementById("rec-build-desc");
const recLink = document.getElementById("rec-link");

function updateRecommendation() {
  const budget = parseInt(slider.value);
  budgetDisplay.textContent = budget === 2000 ? "$2000+" : `$${budget}`;

  const rec = getRecommendation(budget);
  recBuildName.textContent = rec.name;
  recBuildDesc.textContent = rec.desc;
  recLink.href = rec.url;
}

slider.addEventListener("input", updateRecommendation);
updateRecommendation();

// [End Mod]
// Author: Zhibin Wang, 03/05/2026
// Assisted by Claude (Anthropic) for structure and content

