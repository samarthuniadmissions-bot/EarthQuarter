(function (window) {
  const STORAGE_KEYS = {
    user: "earthquarterUser",
    evidence: "earthquarterEvidence",
    draft: "earthquarterSavedPlan",
    remember: "earthquarterRememberPlan"
  };

  const EMAILJS_CONFIG = {
    publicKey: "oWzdB-OXZ5v0zw0_F",
    joinServiceId: "gmail_earthquarter",
    joinTemplateId: "template_b1qj1hj",
    evidenceServiceId: "gmail_earthquarter",
    // Duplicate or adjust this template in EmailJS so the file attachment field is named `image`.
    evidenceTemplateId: "template_b1qj1hj",
    adminEmail: "earthquarter24@gmail.com"
  };

  function readJson(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function getIsoWeekInfo(date = new Date()) {
    const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNumber = utc.getUTCDay() || 7;
    utc.setUTCDate(utc.getUTCDate() + 4 - dayNumber);
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);

    return {
      year: utc.getUTCFullYear(),
      week: weekNumber,
      key: `${utc.getUTCFullYear()}-W${pad(weekNumber)}`,
      label: `Week ${weekNumber}`,
      dateLabel: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(date)
    };
  }

  function getBadgeName(weeks) {
    if (weeks >= 30) {
      return "Gold Earthkeeper";
    }

    if (weeks >= 15) {
      return "Silver Earthkeeper";
    }

    if (weeks >= 5) {
      return "Bronze Earthkeeper";
    }

    return "Starter";
  }

  function getCurrentWeekKey(date = new Date()) {
    return getIsoWeekInfo(date).key;
  }

  function getCurrentWeekLabel(date = new Date()) {
    const info = getIsoWeekInfo(date);
    return `${info.label} (${info.dateLabel})`;
  }

  function loadUser() {
    return readJson(STORAGE_KEYS.user, null);
  }

  function saveUser(user) {
    const nextUser = {
      sessionsCompleted: 0,
      evidenceSubmitted: 0,
      badge: "Starter",
      joinedAt: new Date().toISOString(),
      ...user
    };

    nextUser.badge = nextUser.badge || getBadgeName(Number(nextUser.sessionsCompleted) || 0);
    writeJson(STORAGE_KEYS.user, nextUser);
    return nextUser;
  }

  function clearUser() {
    window.localStorage.removeItem(STORAGE_KEYS.user);
  }

  function loadEvidenceRecords() {
    const records = readJson(STORAGE_KEYS.evidence, []);
    return Array.isArray(records) ? records : [];
  }

  function getRecordedEvidenceHashes() {
    return loadEvidenceRecords()
      .map((record) => record && record.imageHash)
      .filter(Boolean);
  }

  async function hashFile(file) {
    const buffer = await file.arrayBuffer();
    const digest = await window.crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: image.naturalWidth || 0, height: image.naturalHeight || 0 });
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("We could not read that image. Please use a normal photo file."));
      };

      image.src = url;
    });
  }

  async function validateEvidenceFile(file) {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      throw new Error("Please upload a real image file.");
    }

    const dimensions = await getImageDimensions(file);
    const hash = await hashFile(file);
    if (getRecordedEvidenceHashes().includes(hash)) {
      throw new Error("This photo was already used before. Please upload a different Earthquarter photo.");
    }

    return { hash, dimensions };
  }

  function saveEvidenceRecords(records) {
    writeJson(STORAGE_KEYS.evidence, records);
    return records;
  }

  function parseTimeParts(timeValue) {
    const [rawHours, rawMinutes] = String(timeValue || "19:00").split(":").map(Number);
    return {
      hours: Number.isFinite(rawHours) ? rawHours : 19,
      minutes: Number.isFinite(rawMinutes) ? rawMinutes : 0
    };
  }

  function buildDateAtTime(baseDate, timeValue) {
    const { hours, minutes } = parseTimeParts(timeValue);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  function getEvidenceUploadWindow(user, now = new Date()) {
    const sessionMinutes = 15;
    const uploadHours = 24;
    const hasWeekday = typeof user.dayOfWeek === "number" && Number.isFinite(user.dayOfWeek);
    const planStart = getPlanStartTime(user || {});
    let sessionStart = buildDateAtTime(now, planStart.value);

    if (hasWeekday) {
      const currentDay = now.getDay();
      const offset = user.dayOfWeek - currentDay;
      sessionStart.setDate(sessionStart.getDate() + offset);
    }

    const sessionEnd = new Date(sessionStart.getTime() + sessionMinutes * 60 * 1000);
    const uploadDeadline = new Date(sessionEnd.getTime() + uploadHours * 60 * 60 * 1000);

    let status = "open";
    if (now < sessionEnd) {
      status = "too_early";
    } else if (now > uploadDeadline) {
      status = "expired";
    }

    return {
      status,
      canUpload: status === "open",
      sessionStart,
      sessionEnd,
      uploadDeadline
    };
  }

  function formatDateTime(date) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  }
  function formatDisplayTime(timeValue) {
    const { hours, minutes } = parseTimeParts(timeValue);
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
  }

  function getPlanStartTime(plan) {
    const fallback = plan && plan.time ? plan.time : "19:00";
    const message = String((plan && plan.message) || "");
    const rangeRegex = /\b(?:from\s+|between\s+)?(0?[1-9]|1[0-2])(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?\s*(?:to|until|till|-|–|—)\s*(0?[1-9]|1[0-2])(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\b/i;
    const match = message.match(rangeRegex);

    if (!match) {
      return {
        value: fallback,
        display: plan && plan.displayTime ? plan.displayTime : formatDisplayTime(fallback)
      };
    }

    let hours = Number(match[1]);
    const minutes = match[2] ? Number(match[2]) : 0;
    const period = (match[3] || match[6] || "").toLowerCase();

    if (minutes > 59) {
      return {
        value: fallback,
        display: plan && plan.displayTime ? plan.displayTime : formatDisplayTime(fallback)
      };
    }

    if (period.startsWith("p") && hours !== 12) {
      hours += 12;
    }

    if (period.startsWith("a") && hours === 12) {
      hours = 0;
    }

    const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    return {
      value,
      display: formatDisplayTime(value)
    };
  }

  function getEvidenceForWeek(weekKey = getCurrentWeekKey()) {
    return loadEvidenceRecords().find((record) => record.weekKey === weekKey) || null;
  }

  function upsertEvidenceRecord(record) {
    const records = loadEvidenceRecords();
    const index = records.findIndex((item) => item.weekKey === record.weekKey);

    if (index >= 0) {
      records[index] = { ...records[index], ...record };
    } else {
      records.unshift(record);
    }

    saveEvidenceRecords(records);
    return records;
  }

  function updateUserForEvidence(record) {
    const user = loadUser() || {};
    const existing = getEvidenceForWeek(record.weekKey);

    if (!existing) {
      user.sessionsCompleted = (Number(user.sessionsCompleted) || 0) + 1;
      user.evidenceSubmitted = (Number(user.evidenceSubmitted) || 0) + 1;
    }

    user.badge = getBadgeName(Number(user.sessionsCompleted) || 0);
    user.lastCompletedWeek = record.weekKey;
    user.lastEvidenceAt = record.submittedAt;
    user.lastEvidenceFileName = record.fileName;
    saveUser(user);
    return user;
  }

  function getLatestEvidence() {
    const records = loadEvidenceRecords();
    return records.length ? records[0] : null;
  }

  function getLatestWeekSummary() {
    const record = getLatestEvidence();
    if (!record) {
      return null;
    }

    return {
      weekKey: record.weekKey,
      weekLabel: record.weekLabel,
      status: record.status,
      submittedAt: record.submittedAt,
      fileName: record.fileName
    };
  }

  function nextCalendarStart(timeValue) {
    const [hours, minutes] = String(timeValue || "19:00").split(":").map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);

    if (start <= new Date()) {
      start.setDate(start.getDate() + 1);
    }

    return start;
  }

  function nextCalendarStartForDay(timeValue, weekday) {
    const [hours, minutes] = String(timeValue || "19:00").split(":").map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);

    if (typeof weekday === "number" && Number.isFinite(weekday)) {
      const currentDay = start.getDay();
      let delta = (weekday - currentDay + 7) % 7;

      if (delta === 0 && start <= new Date()) {
        delta = 7;
      }

      start.setDate(start.getDate() + delta);
      return start;
    }

    if (start <= new Date()) {
      start.setDate(start.getDate() + 1);
    }

    return start;
  }

  function formatCalendarDate(date) {
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
      "T",
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds())
    ].join("");
  }

  function buildRecurringCalendarLink(submission) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    const planStart = getPlanStartTime(submission || {});
    const startDate = nextCalendarStartForDay(planStart.value, submission.dayOfWeek);
    const endDate = new Date(startDate.getTime() + 15 * 60 * 1000);
    const start = formatCalendarDate(startDate);
    const end = formatCalendarDate(endDate);
    const title = "Earthquarter weekly switch-off";
    const details = [
      `Weekly Earthquarter reminder for ${submission.name}.`,
      "",
      "Switch off all electricity and electrical devices for 15 minutes, except urgent medical or life-saving needs.",
      "",
      `Plan message: ${submission.message}`
    ].join("\n");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&recur=${encodeURIComponent("RRULE:FREQ=WEEKLY;INTERVAL=1")}&ctz=${encodeURIComponent(timezone)}`;
  }

  function hasEmailJsConfig() {
    return Boolean(
      window.emailjs &&
      EMAILJS_CONFIG.publicKey &&
      !EMAILJS_CONFIG.publicKey.startsWith("YOUR_") &&
      EMAILJS_CONFIG.joinServiceId &&
      !EMAILJS_CONFIG.joinServiceId.startsWith("YOUR_") &&
      EMAILJS_CONFIG.joinTemplateId &&
      !EMAILJS_CONFIG.joinTemplateId.startsWith("YOUR_")
    );
  }

  function hasEvidenceEmailJsConfig() {
    return Boolean(
      hasEmailJsConfig() &&
      EMAILJS_CONFIG.evidenceTemplateId &&
      !EMAILJS_CONFIG.evidenceTemplateId.startsWith("YOUR_")
    );
  }

  function initEmailJs() {
    if (!hasEmailJsConfig()) {
      return false;
    }

    window.emailjs.init({
      publicKey: EMAILJS_CONFIG.publicKey,
      limitRate: {
        id: "earthquarter",
        throttle: 1000
      }
    });

    return true;
  }

  function sendJoinEmail(params) {
    if (!initEmailJs()) {
      return Promise.reject(new Error("EmailJS is not configured yet."));
    }

    return window.emailjs.send(EMAILJS_CONFIG.joinServiceId, EMAILJS_CONFIG.joinTemplateId, {
      to_email: params.email,
      name: params.name,
      message: params.message,
      email: params.email,
      phone: params.phone,
      address: params.address,
      bill_currency: params.billCurrency,
      electricity_bill: params.electricityBill,
      electricity_bill_display: params.electricityBillDisplay,
      display_time: params.displayTime,
      reply_to: EMAILJS_CONFIG.adminEmail
    });
  }

  function setFormValue(form, name, value) {
    let input = form.querySelector(`[name="${name}"]`);
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      form.appendChild(input);
    }
    input.value = value;
  }

  function sendEvidenceForm(form, toEmail) {
    if (!hasEvidenceEmailJsConfig()) {
      return Promise.reject(new Error("Evidence email is not configured yet. Check the EmailJS evidence template in earthquarter-app.js."));
    }

    if (!initEmailJs()) {
      return Promise.reject(new Error("EmailJS is not configured yet."));
    }

    setFormValue(form, "to_email", toEmail || EMAILJS_CONFIG.adminEmail);

    return window.emailjs.sendForm(
      EMAILJS_CONFIG.evidenceServiceId,
      EMAILJS_CONFIG.evidenceTemplateId,
      form
    );
  }

  async function verifyEvidenceUpload(payload) {
    const response = await fetch("/api/verify-evidence", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const message = await response.text().catch(() => "");
      throw new Error(message || "We could not verify this photo right now.");
    }

    return response.json();
  }

  function saveJoinDraft(value) {
    writeJson(STORAGE_KEYS.draft, value);
    window.document.cookie = `${encodeURIComponent(STORAGE_KEYS.remember)}=1; path=/`;
  }

  function loadJoinDraft() {
    return readJson(STORAGE_KEYS.draft, null);
  }

  function clearJoinDraft() {
    window.localStorage.removeItem(STORAGE_KEYS.draft);
    window.document.cookie = `${encodeURIComponent(STORAGE_KEYS.remember)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  function rememberJoinDraftEnabled() {
    return /(?:^|; )earthquarterRememberPlan=1(?:;|$)/.test(window.document.cookie);
  }

  window.EarthquarterApp = {
    storageKeys: STORAGE_KEYS,
    emailJsConfig: EMAILJS_CONFIG,
    getIsoWeekInfo,
    getCurrentWeekKey,
    getCurrentWeekLabel,
    getBadgeName,
    loadUser,
    saveUser,
    clearUser,
    loadEvidenceRecords,
    saveEvidenceRecords,
    getRecordedEvidenceHashes,
    hashFile,
    getImageDimensions,
    validateEvidenceFile,
    getEvidenceUploadWindow,
    formatDateTime,
    getPlanStartTime,
    getEvidenceForWeek,
    upsertEvidenceRecord,
    updateUserForEvidence,
    getLatestEvidence,
    getLatestWeekSummary,
    buildRecurringCalendarLink,
    hasEmailJsConfig,
    hasEvidenceEmailJsConfig,
    initEmailJs,
    sendJoinEmail,
    sendEvidenceForm,
    verifyEvidenceUpload,
    saveJoinDraft,
    loadJoinDraft,
    clearJoinDraft,
    rememberJoinDraftEnabled
  };
})(window);
