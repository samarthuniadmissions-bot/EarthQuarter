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

  document.querySelectorAll(".site-nav").forEach((nav) => {
    const links = Array.from(nav.querySelectorAll("a"));
    const hasDashboardLink = links.some((link) => link.textContent.trim().toLowerCase() === "dashboard");

    links.forEach((link) => {
      if (link.textContent.trim().toLowerCase() !== "join") {
        return;
      }

      if (hasDashboardLink) {
        link.textContent = "Home";
        link.href = "index.html";
        link.setAttribute("aria-label", "Open the Earthquarter home page");
        return;
      }

      link.textContent = "Dashboard";
      link.href = "dashboard.html";
      link.setAttribute("aria-label", "Open your Earthquarter dashboard");
    });
  });
})();
