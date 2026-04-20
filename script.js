const timerDisplay = document.getElementById("timerDisplay");
const startTimer = document.getElementById("startTimer");
const resetTimer = document.getElementById("resetTimer");
const timerNote = document.getElementById("timerNote");
const lightsForm = document.getElementById("lightsForm");
const placeInput = document.getElementById("placeInput");
const lightsInput = document.getElementById("lightsInput");
const lightWattsInput = document.getElementById("lightWattsInput");
const sessionsInput = document.getElementById("sessionsInput");
const savingsResult = document.getElementById("savingsResult");
const sessionKwh = document.getElementById("sessionKwh");
const yearlyKwh = document.getElementById("yearlyKwh");
const communityKwh = document.getElementById("communityKwh");
const wasteYearText = document.getElementById("wasteYearText");
const wasteMeterFill = document.getElementById("wasteMeterFill");
const wasteMeterLabel = document.getElementById("wasteMeterLabel");

const totalSeconds = 15 * 60;
let secondsLeft = totalSeconds;
let timerId = null;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(secondsLeft);
}

function stopTimer() {
  window.clearInterval(timerId);
  timerId = null;
  startTimer.textContent = "Start 15 Minutes";
}

function startCountdown() {
  if (timerId) {
    stopTimer();
    timerNote.textContent = "Paused. Keep the non-essential switches off if it is safe to continue.";
    return;
  }

  if (secondsLeft <= 0) {
    secondsLeft = totalSeconds;
    renderTimer();
  }

  startTimer.textContent = "Pause";
  timerNote.textContent = "Earthquarter is running. Use the quiet to notice what electricity usually stays on unnoticed.";

  timerId = window.setInterval(() => {
    secondsLeft -= 1;
    renderTimer();

    if (secondsLeft <= 0) {
      stopTimer();
      secondsLeft = 0;
      timerNote.textContent = "Done. Switch on only what you need, and keep the habit for next week.";
      renderTimer();
    }
  }, 1000);
}

function resetCountdown() {
  stopTimer();
  secondsLeft = totalSeconds;
  timerNote.textContent = "Before starting, switch off non-essential lights, fans, chargers, screens, and idle devices.";
  renderTimer();
}

function formatKwh(value) {
  if (value < 0.1) {
    return value.toFixed(3);
  }

  if (value < 10) {
    return value.toFixed(2);
  }

  return value.toFixed(0);
}

function updateLightSavings(event) {
  if (event) {
    event.preventDefault();
  }

  const lights = Math.max(1, Number(lightsInput.value) || 1);
  const watts = Math.max(1, Number(lightWattsInput.value) || 1);
  const sessions = Math.max(1, Number(sessionsInput.value) || 1);
  const place = placeInput.value;
  const perSession = (lights * watts * 0.25) / 1000;
  const perYear = perSession * sessions * 52;
  const communityYear = perYear * 100;

  sessionKwh.textContent = `${formatKwh(perSession)} kWh`;
  yearlyKwh.textContent = `${formatKwh(perYear)} kWh`;
  communityKwh.textContent = `${formatKwh(communityYear)} kWh`;
  wasteYearText.textContent = `In one year, completing ${sessions} Earthquarter${sessions === 1 ? "" : "s"} per week prevents about ${formatKwh(perYear)} kWh from being wasted by one participant, or ${formatKwh(communityYear)} kWh across 100 participants.`;
  wasteMeterLabel.textContent = `${formatKwh(perYear)} kWh`;
  wasteMeterFill.style.transform = `scaleY(${Math.min(1, Math.max(0.12, perYear / 25))})`;

  savingsResult.textContent = `${lights} light${lights === 1 ? "" : "s"} using ${watts} watt${watts === 1 ? "" : "s"} each save about ${formatKwh(perSession)} kWh every Earthquarter. Completing ${sessions} Earthquarter${sessions === 1 ? "" : "s"} per week saves about ${formatKwh(perYear)} kWh in a year.`;
}

function revealWhenVisible() {
  const revealItems = document.querySelectorAll(".fact-card, .faq-item");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealItems.forEach((item) => observer.observe(item));
}

document.querySelectorAll(".checklist input").forEach((input) => {
  input.addEventListener("change", () => {
    input.closest("label").classList.toggle("done", input.checked);
  });
});

startTimer.addEventListener("click", startCountdown);
resetTimer.addEventListener("click", resetCountdown);
lightsForm.addEventListener("submit", updateLightSavings);
placeInput.addEventListener("change", updateLightSavings);

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const faqItem = button.closest(".faq-item");
    const isOpen = faqItem.classList.toggle("open");
    button.setAttribute("aria-expanded", isOpen.toString());
  });
});

renderTimer();
updateLightSavings();
revealWhenVisible();
