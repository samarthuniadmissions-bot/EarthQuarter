(function () {
  const acceptedKey = "earthquarterPrivacyAccepted";
  const gate = document.getElementById("privacyGate");

  if (!gate) {
    return;
  }

  const copy = document.getElementById("privacyGateCopy");
  const checkbox = document.getElementById("privacyGateAgree");
  const agreeButton = document.getElementById("privacyGateAgreeButton");
  const closeButton = document.getElementById("privacyGateClose");
  const message = document.getElementById("privacyGateMessage");

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function unlockAgreementIfRead() {
    if (!copy || !checkbox) {
      return;
    }

    const reachedBottom = copy.scrollTop + copy.clientHeight >= copy.scrollHeight - 6;
    if (reachedBottom) {
      checkbox.disabled = false;
      setMessage("You can now tick the box and click Agree.");
    }
  }

  function updateAgreeButton() {
    if (agreeButton && checkbox) {
      agreeButton.disabled = !checkbox.checked;
    }
  }

  function closeGate() {
    gate.hidden = true;
    document.documentElement.classList.remove("privacy-gate-open");
  }

  if (window.localStorage.getItem(acceptedKey) === "1") {
    closeGate();
    return;
  }

  document.documentElement.classList.add("privacy-gate-open");
  gate.hidden = false;

  window.setTimeout(unlockAgreementIfRead, 120);
  copy?.addEventListener("scroll", unlockAgreementIfRead);
  checkbox?.addEventListener("change", updateAgreeButton);

  agreeButton?.addEventListener("click", () => {
    if (!checkbox || !checkbox.checked) {
      setMessage("Please read the policy and tick the agreement box first.");
      return;
    }

    window.localStorage.setItem(acceptedKey, "1");
    closeGate();
  });

  closeButton?.addEventListener("click", () => {
    if (checkbox && checkbox.checked) {
      window.localStorage.setItem(acceptedKey, "1");
      closeGate();
      return;
    }

    setMessage("Please read and agree to the Privacy Policy before closing this box.");
    copy?.focus();
  });
})();
