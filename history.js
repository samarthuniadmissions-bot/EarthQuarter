const app = window.EarthquarterApp;
const user = app.loadUser();

if (!user || !user.name) {
  window.location.replace("join.html");
} else {
  const weekInfo = app.getIsoWeekInfo();
  const currentEvidence = app.getEvidenceForWeek(weekInfo.key);
  const uploadWindow = app.getEvidenceUploadWindow(user);

const evidenceForm = document.getElementById("evidenceForm");
const evidencePhoto = document.getElementById("evidencePhoto");
const evidenceConfirm = document.getElementById("evidenceConfirm");
const evidencePreviewArea = document.getElementById("evidencePreviewArea");
const evidenceStatus = document.getElementById("evidenceStatus");
const evidenceWeekLabel = document.getElementById("evidenceWeekLabel");
const evidenceSendStatus = document.getElementById("evidenceSendStatus");
const photoError = document.getElementById("photoError");
const submitEvidence = document.getElementById("submitEvidence");

const evidenceName = document.getElementById("evidenceName");
const evidenceEmail = document.getElementById("evidenceEmail");
const evidenceWeek = document.getElementById("evidenceWeek");
const evidenceWeekText = document.getElementById("evidenceWeekText");
const evidenceMessage = document.getElementById("evidenceMessage");
const evidenceImageHash = document.getElementById("evidenceImageHash");
const evidenceVerificationStatus = document.getElementById("evidenceVerificationStatus");
const evidenceFormStatus = document.getElementById("evidenceFormStatus");

evidenceName.value = user.name || "";
evidenceEmail.value = user.email || "";
evidenceWeek.value = weekInfo.key;
evidenceWeekText.value = weekInfo.label;
evidenceMessage.value = `Earthquarter evidence for ${weekInfo.label}`;
evidenceWeekLabel.textContent = weekInfo.label;

if (currentEvidence) {
  evidenceStatus.textContent = "You already completed this week.";
  evidenceSendStatus.textContent = "This week already has evidence. You can check your dashboard or history.";
  submitEvidence.disabled = true;
  evidencePhoto.disabled = true;
  evidenceConfirm.disabled = true;

  if (currentEvidence.imageDataUrl) {
    evidencePreviewArea.innerHTML = `<img src="${currentEvidence.imageDataUrl}" alt="Current week evidence preview">`;
  } else {
    evidencePreviewArea.innerHTML = "<span>Evidence already submitted for this week.</span>";
  }
} else if (!uploadWindow.canUpload) {
  const opensText = app.formatDateTime(uploadWindow.sessionEnd);
  const deadlineText = app.formatDateTime(uploadWindow.uploadDeadline);
  const expired = uploadWindow.status === "expired";

  evidenceStatus.textContent = expired
    ? "The 24-hour evidence window has closed."
    : `Evidence upload opens after ${opensText}.`;
  evidenceSendStatus.textContent = expired
    ? "This Earthquarter will not be counted because evidence was not uploaded within 24 hours."
    : `Come back after ${opensText}. You can upload until ${deadlineText}.`;
  submitEvidence.disabled = true;
  evidencePhoto.disabled = true;
  evidenceConfirm.disabled = true;
} else {
  evidenceStatus.textContent = `Upload is open until ${app.formatDateTime(uploadWindow.uploadDeadline)}.`;
}

evidencePhoto.addEventListener("change", () => {
  const file = evidencePhoto.files && evidencePhoto.files[0];

  if (!file) {
    evidencePreviewArea.innerHTML = "<span>Preview will appear here.</span>";
    return;
  }

  if (!file.type.startsWith("image/")) {
    photoError.textContent = "Please choose an image file.";
    evidencePhoto.value = "";
    return;
  }

  photoError.textContent = "";
  const reader = new FileReader();

  reader.onload = () => {
    evidencePreviewArea.innerHTML = `<img src="${reader.result}" alt="Earthquarter evidence preview">`;
  };

  reader.readAsDataURL(file);
});

function readImageDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read the uploaded image."));
    reader.readAsDataURL(file);
  });
}

evidenceForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (currentEvidence) {
    evidenceSendStatus.textContent = "This week has already been completed.";
    return;
  }

  if (!uploadWindow.canUpload) {
    evidenceSendStatus.textContent = uploadWindow.status === "expired"
      ? "The 24-hour upload window has closed, so this Earthquarter cannot be counted."
      : `You can upload after ${app.formatDateTime(uploadWindow.sessionEnd)}.`;
    evidenceSendStatus.className = "email-status is-error";
    return;
  }

  const file = evidencePhoto.files && evidencePhoto.files[0];

  if (!file) {
    photoError.textContent = "Please upload an Earthquarter photo first.";
    return;
  }

  if (!evidenceConfirm.checked) {
    photoError.textContent = "Please confirm that this is your chosen Earthquarter evidence photo.";
    return;
  }

  submitEvidence.disabled = true;
  photoError.textContent = "";
  evidenceSendStatus.textContent = "Checking and sending your evidence photo...";
  evidenceSendStatus.className = "email-status is-pending";
  evidenceFormStatus.value = "Submitted";

  try {
    const validation = await app.validateEvidenceFile(file);
    evidenceImageHash.value = validation.hash;
    evidenceVerificationStatus.value = "Accepted by participant";

    await app.sendEvidenceForm(evidenceForm, app.emailJsConfig.adminEmail);
    if (user.email) {
      await app.sendEvidenceForm(evidenceForm, user.email);
    }

    const record = {
      weekKey: weekInfo.key,
      weekLabel: weekInfo.label,
      status: "Submitted",
      submittedAt: new Date().toISOString(),
      fileName: file.name,
      imageHash: evidenceImageHash.value,
      verificationStatus: evidenceVerificationStatus.value,
      imageDataUrl: await readImageDataUrl(file),
      userName: user.name,
      userEmail: user.email
    };

    app.upsertEvidenceRecord(record);
    app.updateUserForEvidence(record);
    evidenceSendStatus.textContent = "Evidence sent successfully. Returning to dashboard...";
    evidenceSendStatus.className = "email-status is-success";
    window.setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1600);
  } catch (error) {
    console.error(error);
    evidenceSendStatus.textContent = error.message || "We could not send the evidence photo yet.";
    evidenceSendStatus.className = "email-status is-error";
    submitEvidence.disabled = false;
  }
});
}
