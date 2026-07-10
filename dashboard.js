const app = window.EarthquarterApp;
const user = app.loadUser();

if (!user || !user.name) {
  window.location.replace("join.html");
}

const weekInfo = app.getIsoWeekInfo();
const currentEvidence = app.getEvidenceForWeek(weekInfo.key);
const uploadWindow = app.getEvidenceUploadWindow(user);
const historyRecords = app.loadEvidenceRecords();

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userBadge = document.getElementById("userBadge");
const sessionsCompleted = document.getElementById("sessionsCompleted");
const evidenceSubmitted = document.getElementById("evidenceSubmitted");
const weekLabel = document.getElementById("weekLabel");
const weekStatus = document.getElementById("weekStatus");
const statusChip = document.getElementById("statusChip");
const evidencePreview = document.getElementById("evidencePreview");
const evidenceSummary = document.getElementById("evidenceSummary");
const historyPreview = document.getElementById("historyPreview");
const calendarLink = document.getElementById("calendarLink");
const dashboardLead = document.getElementById("dashboardLead");
const changeDetailsLink = document.getElementById("changeDetailsLink");
const dashboardEvidenceForm = document.getElementById("dashboardEvidenceForm");
const dashboardEvidencePhoto = document.getElementById("dashboardEvidencePhoto");
const dashboardEvidenceConfirm = document.getElementById("dashboardEvidenceConfirm");
const dashboardPhotoError = document.getElementById("dashboardPhotoError");
const dashboardEvidencePreview = document.getElementById("dashboardEvidencePreview");
const dashboardEvidenceSendStatus = document.getElementById("dashboardEvidenceSendStatus");
const dashboardSubmitEvidence = document.getElementById("dashboardSubmitEvidence");
const dashboardEvidenceName = document.getElementById("dashboardEvidenceName");
const dashboardEvidenceEmail = document.getElementById("dashboardEvidenceEmail");
const dashboardEvidenceWeek = document.getElementById("dashboardEvidenceWeek");
const dashboardEvidenceWeekLabel = document.getElementById("dashboardEvidenceWeekLabel");
const dashboardEvidenceHash = document.getElementById("dashboardEvidenceHash");
const dashboardEvidenceVerificationStatus = document.getElementById("dashboardEvidenceVerificationStatus");
const dashboardEvidenceMessage = document.getElementById("dashboardEvidenceMessage");

function firstName(fullName) {
  return String(fullName || "").trim().split(/\s+/)[0] || "Earthkeeper";
}

function readImageDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read the uploaded image."));
    reader.readAsDataURL(file);
  });
}

const displayName = firstName(user.name);

userName.textContent = displayName;
userEmail.textContent = user.email || "No email saved";
userBadge.textContent = user.badge || app.getBadgeName(user.sessionsCompleted || 0);
sessionsCompleted.textContent = String(user.sessionsCompleted || 0);
evidenceSubmitted.textContent = String(user.evidenceSubmitted || 0);
weekLabel.textContent = weekInfo.label;
dashboardLead.textContent = user.displayTime
  ? `Your recurring Earthquarter reminder is set for ${user.displayTime}.`
  : "Your weekly Earthquarter reminder, evidence, and progress all live here.";

calendarLink.href = app.buildRecurringCalendarLink({
  name: user.name || "Earthkeeper",
  time: user.time || "19:00",
  displayTime: user.displayTime || "7:00 PM",
  dayOfWeek: user.dayOfWeek,
  dayLabel: user.dayLabel,
  message: user.message || "Earthquarter weekly switch-off"
});

changeDetailsLink.href = "join.html";

dashboardEvidenceName.value = user.name || "";
dashboardEvidenceEmail.value = user.email || "";
dashboardEvidenceWeek.value = weekInfo.key;
dashboardEvidenceWeekLabel.value = weekInfo.label;
dashboardEvidenceMessage.value = `Earthquarter evidence for ${weekInfo.label}`;

if (currentEvidence) {
  statusChip.textContent = "Submitted";
  statusChip.classList.add("is-success");
  weekStatus.textContent = `You already submitted evidence for ${weekInfo.label}.`;
  evidenceSummary.textContent = `Uploaded on ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(currentEvidence.submittedAt))}.`;
  evidencePreview.innerHTML = currentEvidence.imageDataUrl
    ? `<img src="${currentEvidence.imageDataUrl}" alt="Earthquarter evidence for ${weekInfo.label}">`
    : "<span>Evidence submitted for this week.</span>";
  dashboardEvidencePreview.innerHTML = currentEvidence.imageDataUrl
    ? `<img src="${currentEvidence.imageDataUrl}" alt="Earthquarter evidence for ${weekInfo.label}">`
    : "<span>Evidence submitted for this week.</span>";
  dashboardEvidenceSendStatus.textContent = "This week already has evidence. Check history for past uploads.";
  dashboardSubmitEvidence.disabled = true;
  dashboardEvidencePhoto.disabled = true;
  dashboardEvidenceConfirm.disabled = true;
} else if (!uploadWindow.canUpload) {
  const opensText = app.formatDateTime(uploadWindow.sessionEnd);
  const deadlineText = app.formatDateTime(uploadWindow.uploadDeadline);
  const expired = uploadWindow.status === "expired";

  statusChip.textContent = expired ? "Closed" : "Not open yet";
  statusChip.classList.add("is-pending");
  weekStatus.textContent = expired
    ? `The upload window closed on ${deadlineText}. This Earthquarter will not be counted.`
    : `Evidence upload opens after your Earthquarter ends at ${opensText}.`;
  evidenceSummary.textContent = expired
    ? "This week was missed because evidence was not uploaded within 24 hours."
    : `You can upload evidence until ${deadlineText}.`;
  evidencePreview.innerHTML = "<span>No photo uploaded yet.</span>";
  dashboardEvidencePreview.innerHTML = "<span>Preview will appear here.</span>";
  dashboardEvidenceSendStatus.textContent = expired
    ? "The 24-hour upload window has closed."
    : `Come back after ${opensText} to upload your evidence photo.`;
  dashboardSubmitEvidence.disabled = true;
  dashboardEvidencePhoto.disabled = true;
  dashboardEvidenceConfirm.disabled = true;
} else {
  statusChip.textContent = "Upload open";
  statusChip.classList.add("is-pending");
  weekStatus.textContent = `No evidence uploaded yet for ${weekInfo.label}.`;
  evidenceSummary.textContent = `Upload your evidence by ${app.formatDateTime(uploadWindow.uploadDeadline)} to count this Earthquarter.`;
  evidencePreview.innerHTML = "<span>No photo uploaded yet.</span>";
  dashboardEvidencePreview.innerHTML = "<span>Preview will appear here.</span>";
  dashboardEvidenceSendStatus.textContent = `Upload is open until ${app.formatDateTime(uploadWindow.uploadDeadline)}.`;
}

if (!historyRecords.length) {
  historyPreview.innerHTML = "<div class=\"empty-state\">No weeks completed yet.</div>";
} else {
  historyPreview.innerHTML = historyRecords
    .slice(0, 3)
    .map((record) => `
      <article class="history-mini-card">
        <strong>${record.weekLabel || record.weekKey}</strong>
        <span>${record.status || "Submitted"}</span>
        <small>${new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(record.submittedAt))}</small>
      </article>
    `)
    .join("");
}

dashboardEvidencePhoto.addEventListener("change", () => {
  const file = dashboardEvidencePhoto.files && dashboardEvidencePhoto.files[0];

  if (!file) {
    dashboardEvidencePreview.innerHTML = "<span>Preview will appear here.</span>";
    return;
  }

  if (!file.type.startsWith("image/")) {
    dashboardPhotoError.textContent = "Please choose an image file.";
    dashboardEvidencePhoto.value = "";
    return;
  }

  dashboardPhotoError.textContent = "";
  const reader = new FileReader();
  reader.onload = () => {
    dashboardEvidencePreview.innerHTML = `<img src="${reader.result}" alt="Earthquarter evidence preview">`;
  };
  reader.readAsDataURL(file);
});

dashboardEvidenceForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (currentEvidence) {
    dashboardEvidenceSendStatus.textContent = "This week has already been completed.";
    dashboardEvidenceSendStatus.className = "email-status is-pending";
    return;
  }

  if (!uploadWindow.canUpload) {
    dashboardEvidenceSendStatus.textContent = uploadWindow.status === "expired"
      ? "The 24-hour upload window has closed, so this Earthquarter cannot be counted."
      : `You can upload after ${app.formatDateTime(uploadWindow.sessionEnd)}.`;
    dashboardEvidenceSendStatus.className = "email-status is-error";
    return;
  }

  const file = dashboardEvidencePhoto.files && dashboardEvidencePhoto.files[0];

  if (!file) {
    dashboardPhotoError.textContent = "Please upload an Earthquarter photo first.";
    return;
  }

  if (!dashboardEvidenceConfirm.checked) {
    dashboardPhotoError.textContent = "Please confirm that this is your chosen Earthquarter evidence photo.";
    return;
  }

  dashboardSubmitEvidence.disabled = true;
  dashboardPhotoError.textContent = "";
  dashboardEvidenceSendStatus.textContent = "Checking and sending your evidence photo...";
  dashboardEvidenceSendStatus.className = "email-status is-pending";

  try {
    const validation = await app.validateEvidenceFile(file);
    dashboardEvidenceHash.value = validation.hash;
    dashboardEvidenceVerificationStatus.value = "Accepted by participant";

    await app.sendEvidenceForm(dashboardEvidenceForm, app.emailJsConfig.adminEmail);
    if (user.email) {
      await app.sendEvidenceForm(dashboardEvidenceForm, user.email);
    }

    const record = {
      weekKey: weekInfo.key,
      weekLabel: weekInfo.label,
      status: "Submitted",
      submittedAt: new Date().toISOString(),
      fileName: file.name,
      imageHash: dashboardEvidenceHash.value,
      verificationStatus: dashboardEvidenceVerificationStatus.value,
      imageDataUrl: await readImageDataUrl(file),
      userName: user.name,
      userEmail: user.email
    };

    app.upsertEvidenceRecord(record);
    app.updateUserForEvidence(record);
    dashboardEvidenceSendStatus.textContent = "Evidence sent successfully. Refreshing dashboard...";
    dashboardEvidenceSendStatus.className = "email-status is-success";
    window.setTimeout(() => window.location.reload(), 1200);
  } catch (error) {
    console.error(error);
    dashboardEvidenceSendStatus.textContent = error.message || "We could not send the evidence photo yet.";
    dashboardEvidenceSendStatus.className = "email-status is-error";
    dashboardSubmitEvidence.disabled = false;
  }
});
