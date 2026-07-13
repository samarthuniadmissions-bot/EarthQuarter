(function () {
  function hasSavedEarthquarterUser() {
    try {
      const rawUser = window.localStorage.getItem("earthquarterUser");
      if (!rawUser) {
        return false;
      }

      const user = JSON.parse(rawUser);
      return Boolean(user && (user.email || user.name || user.joinedAt));
    } catch {
      return false;
    }
  }

  if (!hasSavedEarthquarterUser()) {
    return;
  }

  document.querySelectorAll(".site-nav a").forEach((link) => {
    if (link.textContent.trim().toLowerCase() !== "join") {
      return;
    }

    link.textContent = "Dashboard";
    link.href = "dashboard.html";
    link.setAttribute("aria-label", "Open your Earthquarter dashboard");
  });
})();
