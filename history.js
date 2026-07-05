const app = window.EarthquarterApp;
const user = app.loadUser();

if (!user || !user.name) {
  window.location.replace("join.html");
} else {
  const historyList = document.getElementById("historyList");
  const historyCount = document.getElementById("historyCount");
  const records = app.loadEvidenceRecords().slice().sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  historyCount.textContent = String(records.length);

  if (!records.length) {
    historyList.innerHTML = `
      <div class="empty-state">
        <h2>No evidence yet</h2>
        <p>Once you upload your first Earthquarter photo, it will appear here.</p>
      </div>
    `;
  } else {
    historyList.innerHTML = records.map((record) => `
      <article class="history-card">
        <div class="history-card-copy">
          <p class="card-label">${record.weekLabel || record.weekKey}</p>
          <h2>${record.status || "Submitted"}</h2>
          <p>${new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short" }).format(new Date(record.submittedAt))}</p>
        </div>
        <div class="history-card-image">
          ${record.imageDataUrl ? `<img src="${record.imageDataUrl}" alt="Evidence for ${record.weekLabel || record.weekKey}">` : "<span>No preview saved.</span>"}
        </div>
      </article>
    `).join("");
  }
}
