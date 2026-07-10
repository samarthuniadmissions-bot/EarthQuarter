<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Earthquarter Dashboard</title>
  <meta name="description" content="See your Earthquarter streak, weekly evidence status, and recurring reminder from the dashboard.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Space+Mono:wght@700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body class="dashboard-page">
  <header class="site-header">
    <a class="brand" href="index.html" aria-label="Earthquarter home">
      <span class="brand-earth">Earth</span><span class="brand-quarter">quarter</span>
    </a>
    <nav class="site-nav" aria-label="Dashboard navigation">
      <a href="index.html#action">Home</a>
      <a href="join.html">Join</a>
      <a href="evidence.html">Evidence</a>
      <a href="history.html">History</a>
    </nav>
  </header>

  <main class="dashboard-shell">
    <section class="dashboard-hero">
      <div class="dashboard-copy">
        <p class="eyebrow">Your Earthquarter dashboard</p>
        <h1>Hi, <span id="userName">Earthkeeper</span></h1>
        <p id="dashboardLead">Your weekly Earthquarter reminder, evidence, and progress all live here.</p>
        <div class="dashboard-actions">
          <a class="primary-link" id="calendarLink" href="#" target="_blank" rel="noopener">Open weekly calendar reminder</a>
          <a class="primary-link dashboard-jump-link" href="#dashboardEvidenceForm">Upload photo</a>
          <a class="secondary-link" id="changeDetailsLink" href="join.html">Change details</a>
        </div>
      </div>
      <div class="dashboard-art">
        <img src="arturo_anez-bulb-7746884.jpg" alt="Light bulb with leaves symbolizing Earthquarter">
      </div>
    </section>

    <section class="dashboard-grid">
      <article class="dash-card dash-profile">
        <p class="card-label">Profile</p>
        <h2 id="userBadge">Starter</h2>
        <p id="userEmail">Not set</p>
        <div class="mini-stats">
          <div>
            <strong id="sessionsCompleted">0</strong>
            <span>Weeks done</span>
          </div>
          <div>
            <strong id="evidenceSubmitted">0</strong>
            <span>Evidence uploads</span>
          </div>
        </div>
      </article>

      <article class="dash-card dash-status">
        <p class="card-label">This week</p>
        <h2 id="weekLabel">Week 0</h2>
        <p id="weekStatus">Checking your current Earthquarter status...</p>
        <div class="status-chip" id="statusChip">Pending</div>
      </article>

      <article class="dash-card dash-evidence">
        <p class="card-label">Evidence</p>
        <h2>Photo proof</h2>
        <div class="evidence-preview" id="evidencePreview">
          <span>No photo uploaded yet.</span>
        </div>
        <p id="evidenceSummary">Upload a photo to mark this week as complete.</p>
      </article>

      <article class="dash-card dash-history">
        <p class="card-label">History</p>
        <h2>Recent weeks</h2>
        <div id="historyPreview" class="history-preview"></div>
        <a class="secondary-link" href="history.html">View full history</a>
      </article>

      <article class="dash-card dash-upload">
        <p class="card-label">Weekly upload</p>
        <h2>Submit your evidence photo</h2>
        <p id="uploadCopy">Upload a photo after your 15-minute all-electricity switch-off and send it to Earthquarter.</p>
        <form id="dashboardEvidenceForm" class="dashboard-evidence-form">
          <div class="form-field">
            <label for="dashboardEvidencePhoto">Evidence photo</label>
            <input id="dashboardEvidencePhoto" name="image" type="file" accept="image/*" required>
            <p class="field-error" id="dashboardPhotoError"></p>
          </div>

          <label class="check-note">
            <input id="dashboardEvidenceConfirm" type="checkbox" required>
            This photo shows my chosen Earthquarter evidence after switching off all electricity and electrical devices, except medical or life-saving needs.
          </label>

          <input type="hidden" name="name" id="dashboardEvidenceName">
          <input type="hidden" name="email" id="dashboardEvidenceEmail">
          <input type="hidden" name="week" id="dashboardEvidenceWeek">
          <input type="hidden" name="week_label" id="dashboardEvidenceWeekLabel">
          <input type="hidden" name="status" id="dashboardEvidenceStatus" value="Submitted">
          <input type="hidden" name="to_email" id="dashboardEvidenceToEmail">
          <input type="hidden" name="image_hash" id="dashboardEvidenceHash">
          <input type="hidden" name="verification_status" id="dashboardEvidenceVerificationStatus" value="Pending">
          <input type="hidden" name="message" id="dashboardEvidenceMessage">

          <div class="evidence-preview-area" id="dashboardEvidencePreview">
            <span>Preview will appear here.</span>
          </div>

          <button class="primary-button" type="submit" id="dashboardSubmitEvidence">Send evidence</button>
          <p class="email-status" id="dashboardEvidenceSendStatus" aria-live="polite"></p>
        </form>
      </article>
    </section>
  </main>

  <footer class="site-footer">
    <p>© 2026 Earthquarter Initiative</p>
    <a href="mailto:earthquarter24@gmail.com">earthquarter24@gmail.com</a>
    <a href="index.html">Back to website</a>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  <script src="earthquarter-app.js"></script>
  <script src="dashboard.js"></script>
</body>
</html>
