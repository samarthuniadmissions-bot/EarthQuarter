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
const challengePhotoInput = document.getElementById("evidencePhoto");
const imagePreview = document.getElementById("imagePreview");
const completeChallenge = document.getElementById("completeChallenge");
const challengeMessage = document.getElementById("challengeMessage");
const weekCount = document.getElementById("weekCount");
const badgeName = document.getElementById("badgeName");
const nextBadgeLabel = document.getElementById("nextBadgeLabel");
const challengeStorageKey = "earthquarterChallengeCheckin";

const totalSeconds = 15 * 60;
let secondsLeft = totalSeconds;
let timerId = null;
let challengeDraftPhoto = "";
let challengeDraftPhotoName = "";

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

function getChallengeDefaults() {
  return {
    weeks: 0,
    lastWeekKey: "",
    badge: "🌱 Starter",
    photoDataUrl: "",
    photoName: ""
  };
}

function loadChallengeProgress() {
  try {
    const raw = localStorage.getItem(challengeStorageKey);
    if (!raw) {
      return getChallengeDefaults();
    }

    return {
      ...getChallengeDefaults(),
      ...JSON.parse(raw)
    };
  } catch {
    return getChallengeDefaults();
  }
}

function saveChallengeProgress(progress) {
  localStorage.setItem(challengeStorageKey, JSON.stringify(progress));
}

function getIsoWeekKey(date = new Date()) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function getBadgeName(weeks) {
  if (weeks >= 10) {
    return "🏆 Energy Hero";
  }

  if (weeks >= 4) {
    return "⚡ Consistent Saver";
  }

  return "🌱 Starter";
}

function getNextMilestone(weeks) {
  if (weeks < 4) {
    return "⚡ 4 Weeks";
  }

  if (weeks < 10) {
    return "🏆 10 Weeks";
  }

  return "🌍 Keep Going";
}

function setChallengeMessage(message, state = "neutral") {
  challengeMessage.textContent = message;
  challengeMessage.className = "challenge-message";
  challengeMessage.style.borderLeftColor = "";

  if (state === "empty") {
    challengeMessage.classList.add("is-empty");
    return;
  }

  if (state === "success") {
    challengeMessage.style.borderLeftColor = "var(--leaf)";
    return;
  }

  if (state === "warning") {
    challengeMessage.style.borderLeftColor = "var(--coral)";
    return;
  }

  challengeMessage.style.borderLeftColor = "var(--amber)";
}

function renderChallengePreview(photoDataUrl, photoName = "") {
  if (!photoDataUrl) {
    imagePreview.innerHTML = "";
    return;
  }

  imagePreview.innerHTML = `
    <img src="${photoDataUrl}" alt="Earthquarter evidence preview">
    ${photoName ? `<p class="challenge-note">Ready to submit: ${photoName}</p>` : ""}
  `;
}

function renderChallengeState(progress) {
  weekCount.textContent = String(progress.weeks || 0);
  badgeName.textContent = progress.badge || getBadgeName(progress.weeks || 0);
  nextBadgeLabel.textContent = getNextMilestone(progress.weeks || 0);

  if (progress.photoDataUrl) {
    renderChallengePreview(progress.photoDataUrl, progress.photoName);
  } else if (!challengeDraftPhoto) {
    renderChallengePreview("");
  }

  if ((progress.weeks || 0) === 0) {
    setChallengeMessage("Upload a quick photo to begin your Earthquarter streak.", "empty");
    return;
  }

  setChallengeMessage(
    `✅ Earthquarter completed successfully! You’ve completed Week ${progress.weeks}. Badge unlocked: ${progress.badge || getBadgeName(progress.weeks)}.`,
    "success"
  );
}

function handleEvidenceUpload() {
  const file = challengePhotoInput.files && challengePhotoInput.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setChallengeMessage("Please choose an image file for your Earthquarter evidence.", "warning");
    challengePhotoInput.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    challengeDraftPhoto = String(reader.result || "");
    challengeDraftPhotoName = file.name;
    renderChallengePreview(challengeDraftPhoto, challengeDraftPhotoName);
    setChallengeMessage("Photo ready. Tap Complete This Week when you’re ready.", "empty");
  };

  reader.onerror = () => {
    setChallengeMessage("We couldn’t read that image. Please try another photo.", "warning");
  };

  reader.readAsDataURL(file);
}

function completeWeeklyChallenge() {
  const progress = loadChallengeProgress();

  if (!challengeDraftPhoto) {
    setChallengeMessage("Please upload your Earthquarter evidence photo first.", "warning");
    challengePhotoInput.focus();
    return;
  }

  const currentWeekKey = getIsoWeekKey();

  if (progress.lastWeekKey === currentWeekKey) {
    setChallengeMessage("You already completed this week’s Earthquarter check-in. Come back next week for a new one.", "warning");
    return;
  }

  const updatedProgress = {
    ...progress,
    weeks: (Number(progress.weeks) || 0) + 1,
    lastWeekKey: currentWeekKey,
    photoDataUrl: challengeDraftPhoto,
    photoName: challengeDraftPhotoName,
  };

  updatedProgress.badge = getBadgeName(updatedProgress.weeks);

  try {
    saveChallengeProgress(updatedProgress);
  } catch (error) {
    console.error(error);
    setChallengeMessage("Your check-in was completed, but the browser could not save it. Try a smaller photo.", "warning");
    return;
  }

  challengeDraftPhoto = "";
  challengeDraftPhotoName = "";
  challengePhotoInput.value = "";
  renderChallengeState(updatedProgress);
}

function revealWhenVisible() {
  const revealItems = document.querySelectorAll(".fact-card, .faq-item, .challenge-card");

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

challengePhotoInput.addEventListener("change", handleEvidenceUpload);
completeChallenge.addEventListener("click", completeWeeklyChallenge);

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
renderChallengeState(loadChallengeProgress());
revealWhenVisible();
