const app = window.EarthquarterApp;
const user = app.loadUser();

if (!user || !user.name) {
  window.location.replace("join.html");
} else {
  const weekInfo = app.getIsoWeekInfo();
  const currentEvidence = app.getEvidenceForWeek(weekInfo.key);

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

  if (currentEvidence.imageDataUrl) {
    evidencePreviewArea.innerHTML = `<img src="${currentEvidence.imageDataUrl}" alt="Current week evidence preview">`;
  } else {
    evidencePreviewArea.innerHTML = "<span>Evidence already submitted for this week.</span>";
  }
} else {
  evidenceStatus.textContent = "No evidence submitted yet.";
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

  const file = evidencePhoto.files && evidencePhoto.files[0];

  if (!file) {
    photoError.textContent = "Please upload an Earthquarter photo first.";
    return;
  }

  if (!evidenceConfirm.checked) {
    photoError.textContent = "Please confirm that this is your real Earthquarter moment.";
    return;
  }

  if (!app.hasEvidenceEmailJsConfig()) {
    evidenceSendStatus.textContent = "Add your evidence EmailJS template ID in earthquarter-app.js.";
    evidenceSendStatus.className = "email-status is-error";
    return;
  }

  try {
    const validation = await app.validateEvidenceFile(file);
    evidenceImageHash.value = validation.hash;
    const imageDataUrl = await readImageDataUrl(file);
    try {
      const verification = await app.verifyEvidenceUpload({
        name: user.name || "",
        email: user.email || "",
        weekLabel: weekInfo.label,
        description: "A real Earthquarter evidence photo showing a lights-off, unplugged, or quiet 15-minute energy-saving moment.",
        imageDataUrl,
        fileName: file.name
      });

      if (!verification || !verification.approved) {
        throw new Error(verification && verification.reason ? verification.reason : "This photo does not look like a match for the Earthquarter evidence description.");
      }

      evidenceVerificationStatus.value = "Approved";
    } catch (verificationError) {
      if (String(verificationError.message || "").includes("does not look like a match")) {
        throw verificationError;
      }

      evidenceVerificationStatus.value = "Pending review";
      evidenceSendStatus.textContent = "Verification service is unavailable right now, so this upload will be saved for manual review.";
      evidenceSendStatus.className = "email-status is-pending";
    }
  } catch (error) {
    photoError.textContent = error.message || "Please upload a different photo.";
    submitEvidence.disabled = false;
    return;
  }

  submitEvidence.disabled = true;
  evidenceSendStatus.textContent = "Sending your evidence photo to Earthquarter...";
  evidenceSendStatus.className = "email-status is-pending";
  evidenceFormStatus.value = "Submitted";

  try {
    await app.sendEvidenceForm(evidenceForm);
    const record = {
      weekKey: weekInfo.key,
      weekLabel: weekInfo.label,
      status: "Submitted",
      submittedAt: new Date().toISOString(),
      fileName: file.name,
      imageHash: evidenceImageHash.value,
      verificationStatus: evidenceVerificationStatus.value || "Approved",
      imageDataUrl,
      userName: user.name,
      userEmail: user.email
    };

    app.upsertEvidenceRecord(record);
    app.updateUserForEvidence(record);
    evidenceSendStatus.textContent = "Evidence submitted successfully. Returning to dashboard...";
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
