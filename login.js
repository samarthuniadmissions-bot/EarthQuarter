const googleButton = document.getElementById("googleButton");
const loginStatus = document.getElementById("loginStatus");
const signedInCard = document.getElementById("signedInCard");
const signedInAvatar = document.getElementById("signedInAvatar");
const signedInName = document.getElementById("signedInName");
const continueToForm = document.getElementById("continueToForm");

const googleClientId = "YOUR_GOOGLE_CLIENT_ID";

function setStatus(message, tone = "") {
  loginStatus.textContent = message;
  loginStatus.className = "login-status";

  if (tone) {
    loginStatus.classList.add(`is-${tone}`);
  }
}

function showSignedInState(profile) {
  googleButton.hidden = true;
  signedInCard.hidden = false;
  signedInName.textContent = `Hi, ${profile.name}`;

  if (profile.picture) {
    signedInAvatar.src = profile.picture;
    signedInAvatar.alt = `${profile.name} account image`;
  } else {
    signedInAvatar.removeAttribute("src");
    signedInAvatar.alt = "";
  }

  continueToForm.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "join.html";
  });

  setStatus("You are already signed in. Taking you to your form.", "success");
  window.setTimeout(() => {
    window.location.href = "join.html";
  }, 1200);
}

function renderGoogleSignIn() {
  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    setStatus("Loading Google sign-in...", "pending");
    return;
  }

  if (!googleClientId || googleClientId.startsWith("YOUR_GOOGLE_CLIENT_ID")) {
    setStatus("Add your Google Client ID in login.js to enable Google sign-in.", "warning");
    return;
  }

  window.google.accounts.id.initialize({
    client_id: googleClientId,
    callback: (response) => {
      const profile = window.EarthquarterAuth.profileFromCredential(response);

      if (!profile) {
        setStatus("Google sign-in was received, but the profile could not be read.", "warning");
        return;
      }

      window.EarthquarterAuth.saveProfile(profile);
      window.EarthquarterAuth.renderAuthSlot();
      setStatus(`Welcome, ${profile.name}. Taking you to your Earthquarter form.`, "success");
      window.setTimeout(() => {
        window.location.href = "join.html";
      }, 900);
    }
  });

  window.google.accounts.id.renderButton(googleButton, {
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "pill",
    logo_alignment: "left",
    width: 360
  });

  setStatus("Use your Google account to save your Earthquarter details.", "pending");
}

function bootGoogleSignIn(retries = 0) {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    renderGoogleSignIn();
    return;
  }

  if (retries >= 50) {
    setStatus("Google sign-in did not load. Please refresh the page.", "warning");
    return;
  }

  window.setTimeout(() => bootGoogleSignIn(retries + 1), 100);
}

window.addEventListener("DOMContentLoaded", () => {
  const profile = window.EarthquarterAuth.readProfile();

  window.EarthquarterAuth.renderAuthSlot();

  if (profile) {
    showSignedInState(profile);
    return;
  }

  bootGoogleSignIn();
});
