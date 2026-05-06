(function () {
  const storageKey = "earthquarterGoogleProfile";

  function readProfile() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveProfile(profile) {
    localStorage.setItem(storageKey, JSON.stringify(profile));
  }

  function clearProfile() {
    localStorage.removeItem(storageKey);
  }

  function base64UrlDecode(value) {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = padded + "=".repeat((4 - (padded.length % 4)) % 4);
    return atob(normalized);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function profileFromCredential(response) {
    const token = response && response.credential ? String(response.credential) : "";
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return null;
    }

    try {
      const payload = JSON.parse(base64UrlDecode(payloadPart));

      return {
        name: payload.name || payload.given_name || "Earthquarter member",
        email: payload.email || "",
        picture: payload.picture || "",
        subject: payload.sub || "",
      };
    } catch {
      return null;
    }
  }

  function renderAuthSlot(slot = document.getElementById("authSlot")) {
    if (!slot) {
      return;
    }

    const profile = readProfile();
    const isLoginPage = window.location.pathname.endsWith("login.html");

    if (!profile) {
      slot.innerHTML = isLoginPage
        ? `<a class="account-cta" href="index.html">Back to website</a>`
        : `<a class="account-cta" href="login.html">Continue with Google</a>`;
      return;
    }

    const safeName = escapeHtml(profile.name);
    const avatar = profile.picture
      ? `<img class="account-avatar" src="${escapeHtml(profile.picture)}" alt="${safeName} account image">`
      : `<span class="account-avatar account-avatar-fallback" aria-hidden="true">${safeName.charAt(0).toUpperCase()}</span>`;

    slot.innerHTML = `
      <div class="account-chip">
        <a class="account-chip-main" href="join.html" aria-label="Continue to your Earthquarter form">
          ${avatar}
          <span>
            <small>Hi,</small>
            <strong>${safeName}</strong>
          </span>
        </a>
        <button class="account-signout" type="button">Sign out</button>
      </div>
    `;

    const signOutButton = slot.querySelector(".account-signout");
    if (signOutButton) {
      signOutButton.addEventListener("click", () => {
        clearProfile();
        window.location.href = "login.html";
      });
    }
  }

  function prefillJoinForm(nameField, emailField) {
    const profile = readProfile();

    if (!profile) {
      return;
    }

    if (nameField && !nameField.value.trim()) {
      nameField.value = profile.name || "";
    }

    if (emailField && !emailField.value.trim()) {
      emailField.value = profile.email || "";
    }
  }

  function isAuthenticated() {
    return Boolean(readProfile());
  }

  window.EarthquarterAuth = {
    readProfile,
    saveProfile,
    clearProfile,
    profileFromCredential,
    renderAuthSlot,
    prefillJoinForm,
    isAuthenticated,
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderAuthSlot();
  });
})();
