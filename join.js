const form = document.getElementById("earthquarterJoinForm");
const countryCode = document.getElementById("countryCode");
const dialCode = document.getElementById("dialCode");
const phoneNumber = document.getElementById("phoneNumber");
const fullName = document.getElementById("fullName");
const emailAddress = document.getElementById("emailAddress");
const addressType = document.getElementById("addressType");
const addressLine = document.getElementById("addressLine");
const city = document.getElementById("city");
const region = document.getElementById("region");
const postalCode = document.getElementById("postalCode");
const dateOfBirth = document.getElementById("dateOfBirth");
const switchMessage = document.getElementById("switchMessage");
const savePlan = document.getElementById("savePlan");
const joinSuccess = document.getElementById("joinSuccess");
const successSummary = document.getElementById("successSummary");
const calendarLink = document.getElementById("calendarLink");
const emailStatus = document.getElementById("emailStatus");
const submitButton = form.querySelector('button[type="submit"]');
const emailRecipient = "earthquarter24@gmail.com";
const draftStorageKey = "earthquarterSavedPlan";
const rememberCookieName = "earthquarterRememberPlan";
const emailJsConfig = {
  publicKey: "oWzdB-OXZ5v0zw0_F",
  serviceId: "gmail_earthquarter",
  templateId: "template_b1qj1hj"
};

const citiesByRegion = {
  "Andaman and Nicobar Islands": ["Port Blair", "Diglipur", "Mayabunder", "Rangat", "Hut Bay", "Car Nicobar", "Other city/town"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry", "Kakinada", "Anantapur", "Other city/town"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila", "Tezu", "Other city/town"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur", "Nagaon", "Tinsukia", "Bongaigaon", "Other city/town"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Begusarai", "Ara", "Other city/town"],
  "Chandigarh": ["Chandigarh", "Manimajra", "Other city/town"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Ambikapur", "Other city/town"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa", "Amli", "Other city/town"],
  "Delhi": ["New Delhi", "Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh", "Janakpuri", "Other city/town"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Other city/town"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar", "Jamnagar", "Junagadh", "Other city/town"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar", "Karnal", "Rohtak", "Sonipat", "Other city/town"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Una", "Hamirpur", "Other city/town"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Kathua", "Pulwama", "Other city/town"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Other city/town"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Dharwad", "Belagavi", "Kalaburagi", "Davanagere", "Ballari", "Other city/town"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha", "Palakkad", "Other city/town"],
  "Ladakh": ["Leh", "Kargil", "Nubra", "Zanskar", "Other city/town"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Minicoy", "Amini", "Andrott", "Other city/town"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Satna", "Other city/town"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Other city/town"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Ukhrul", "Other city/town"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh", "Williamnagar", "Baghmara", "Other city/town"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Saiha", "Other city/town"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Mon", "Other city/town"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Berhampur", "Sambalpur", "Balasore", "Other city/town"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam", "Other city/town"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Other city/town"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bhilwara", "Other city/town"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo", "Other city/town"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Other city/town"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Other city/town"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia", "Khowai", "Other city/town"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj", "Ghaziabad", "Noida", "Meerut", "Gorakhpur", "Other city/town"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee", "Nainital", "Kashipur", "Other city/town"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Kharagpur", "Bardhaman", "Malda", "Other city/town"],
  "Outside India": ["Outside India", "Other city/town"]
};

function selectedCountry() {
  return countryCode.options[countryCode.selectedIndex];
}

function setError(id, message) {
  const error = document.getElementById(`${id}Error`);
  const field = document.getElementById(id);

  if (error) {
    error.textContent = message;
  }

  if (field) {
    field.classList.toggle("invalid", Boolean(message));
  }

  if (id === "phoneNumber") {
    field.closest(".phone-row").classList.toggle("invalid", Boolean(message));
  }
}

function setEmailStatus(message, tone = "") {
  emailStatus.textContent = message;
  emailStatus.className = "email-status";

  if (tone) {
    emailStatus.classList.add(`is-${tone}`);
  }
}

function clearErrors() {
  ["fullName", "phoneNumber", "emailAddress", "addressType", "addressLine", "city", "region", "postalCode", "dateOfBirth", "switchMessage"].forEach((id) => {
    setError(id, "");
  });
}

function hasEmailJsConfig() {
  return Object.values(emailJsConfig).every((value) => value && !value.startsWith("YOUR_EMAILJS_"));
}

function initEmailJs() {
  if (!window.emailjs || !hasEmailJsConfig()) {
    return false;
  }

  window.emailjs.init({
    publicKey: emailJsConfig.publicKey,
    limitRate: {
      id: "earthquarter-join",
      throttle: 1000
    }
  });

  return true;
}

function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${encodeURIComponent(name)}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function deleteCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function getDraft() {
  const saved = localStorage.getItem(draftStorageKey);
  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function persistDraft(submission) {
  localStorage.setItem(draftStorageKey, JSON.stringify(submission));
  setCookie(rememberCookieName, "1", 365);
}

function clearDraft() {
  localStorage.removeItem(draftStorageKey);
  deleteCookie(rememberCookieName);
}

function fillFormFromDraft(draft) {
  if (!draft) {
    return;
  }

  fullName.value = draft.name || "";
  countryCode.value = draft.countryCode || countryCode.value;
  updatePhoneHint();
  phoneNumber.value = draft.phoneDigits || "";
  emailAddress.value = draft.email || "";
  addressType.value = draft.addressType || "";
  addressLine.value = draft.addressLine || "";
  region.value = draft.region || "";
  populateCities();
  city.value = draft.city || "";
  postalCode.value = draft.postalCode || "";
  dateOfBirth.value = draft.dateOfBirth || "";
  switchMessage.value = draft.message || "";
  savePlan.checked = true;
}

function updatePhoneHint() {
  const option = selectedCountry();
  dialCode.textContent = option.dataset.code;
  const min = Number(option.dataset.min);
  const max = Number(option.dataset.max);
  phoneNumber.placeholder = min === max ? `${min} digit number` : `${min}-${max} digit number`;
}

function populateCities() {
  const selectedRegion = region.value;
  const cityList = citiesByRegion[selectedRegion] || [];

  city.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = selectedRegion ? "Choose city/town" : "Choose state first";
  city.appendChild(placeholder);

  cityList.forEach((cityName) => {
    const option = document.createElement("option");
    option.value = cityName;
    option.textContent = cityName;
    city.appendChild(option);
  });
}

function isValidBirthDate(value) {
  if (!value) {
    return false;
  }

  const birthDate = new Date(`${value}T00:00:00`);
  const today = new Date();
  const earliest = new Date("1900-01-01T00:00:00");

  return birthDate >= earliest && birthDate <= today;
}

function toTimeValue(hours, minutes) {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function toDisplayTime(hours, minutes) {
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

function parseTimeFromMessage(message) {
  const twelveHour = message.match(/\b(0?[1-9]|1[0-2])(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\b/i);

  if (twelveHour) {
    let hours = Number(twelveHour[1]);
    const minutes = twelveHour[2] ? Number(twelveHour[2]) : 0;
    const period = twelveHour[3].toLowerCase();

    if (minutes > 59) {
      return { valid: false, error: "The time in your message looks wrong. Use a time like 7 PM, 7:00 PM, or 19:00." };
    }

    if (period.startsWith("p") && hours !== 12) {
      hours += 12;
    }

    if (period.startsWith("a") && hours === 12) {
      hours = 0;
    }

    return {
      valid: true,
      value: toTimeValue(hours, minutes),
      display: toDisplayTime(hours, minutes)
    };
  }

  const twentyFourHour = message.match(/\b([01]?\d|2[0-3])[:.](\d{2})\b/);

  if (twentyFourHour) {
    const hours = Number(twentyFourHour[1]);
    const minutes = Number(twentyFourHour[2]);

    if (minutes <= 59) {
      return {
        valid: true,
        value: toTimeValue(hours, minutes),
        display: toDisplayTime(hours, minutes)
      };
    }
  }

  const invalidTimeLikeText = /\b\d{1,2}(?:[:.]\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)\b/i.test(message) || /\b\d{1,2}[:.]\d{2}\b/.test(message);

  if (invalidTimeLikeText) {
    return { valid: false, error: "The time in your message looks wrong. Use a time like 7 PM, 7:00 PM, or 19:00." };
  }

  return { valid: false, error: "Please include a valid start time in your message, like 7:00 PM or 19:00." };
}

function validateForm() {
  clearErrors();
  let valid = true;
  const name = fullName.value.trim();
  const phoneDigits = onlyDigits(phoneNumber.value);
  const email = emailAddress.value.trim();
  const addressLineValue = addressLine.value.trim();
  const cityValue = city.value;
  const postalCodeValue = postalCode.value.trim();
  const message = switchMessage.value.trim();
  const option = selectedCountry();
  const minPhone = Number(option.dataset.min);
  const maxPhone = Number(option.dataset.max);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (name.length < 2) {
    setError("fullName", "Please enter your full name.");
    valid = false;
  }

  if (phoneDigits.length < minPhone || phoneDigits.length > maxPhone) {
    const lengthText = minPhone === maxPhone ? `${minPhone} digits` : `${minPhone}-${maxPhone} digits`;
    setError("phoneNumber", `Please enter a valid phone number for this country (${lengthText}).`);
    valid = false;
  }

  if (!emailPattern.test(email)) {
    setError("emailAddress", "Please enter a valid email address.");
    valid = false;
  }

  if (!addressType.value) {
    setError("addressType", "Please choose an address type.");
    valid = false;
  }

  if (addressLineValue.length < 8 || !/[a-zA-Z]/.test(addressLineValue) || !/\d/.test(addressLineValue)) {
    setError("addressLine", "Please enter a street address with words and at least one number.");
    valid = false;
  }

  if (!cityValue) {
    setError("city", "Please choose your city or town.");
    valid = false;
  }

  if (!region.value) {
    setError("region", "Please choose your state or region.");
    valid = false;
  }

  if (!/^[a-zA-Z0-9\s-]{3,10}$/.test(postalCodeValue)) {
    setError("postalCode", "Please enter a valid PIN or postal code.");
    valid = false;
  }

  if (!isValidBirthDate(dateOfBirth.value)) {
    setError("dateOfBirth", "Please enter a valid date of birth. It cannot be in the future.");
    valid = false;
  }

  if (message.length < 15) {
    setError("switchMessage", "Please write when and how you will do the 15-minute switch-off, including a start time.");
    valid = false;
  } else {
    const parsedTime = parseTimeFromMessage(message);

    if (!parsedTime.valid) {
      setError("switchMessage", parsedTime.error);
      valid = false;
    }
  }

  return valid;
}

function getMessageTime() {
  return parseTimeFromMessage(switchMessage.value.trim());
}

function nextCalendarStart(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const start = new Date();
  start.setHours(hours, minutes, 0, 0);

  if (start <= new Date()) {
    start.setDate(start.getDate() + 1);
  }

  return start;
}

function formatCalendarDate(date) {
  const pad = (number) => String(number).padStart(2, "0");

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

function buildSubmission() {
  const option = selectedCountry();
  const phoneDigits = onlyDigits(phoneNumber.value);
  const messageTime = getMessageTime();

  return {
    name: fullName.value.trim(),
    countryCode: countryCode.value,
    country: option.textContent,
    dialCode: option.dataset.code,
    phone: `${option.dataset.code} ${phoneDigits}`,
    phoneDigits,
    email: emailAddress.value.trim(),
    addressType: addressType.value,
    addressLine: addressLine.value.trim(),
    city: city.value,
    region: region.value,
    postalCode: postalCode.value.trim(),
    address: `${addressLine.value.trim()}, ${city.value}, ${region.value}, ${postalCode.value.trim()}`,
    dateOfBirth: dateOfBirth.value,
    time: messageTime.value,
    displayTime: messageTime.display,
    message: switchMessage.value.trim(),
    submittedAt: new Date().toISOString()
  };
}

function saveSubmission(submission) {
  const saved = JSON.parse(localStorage.getItem("earthquarterJoinSubmissions") || "[]");
  saved.push(submission);
  localStorage.setItem("earthquarterJoinSubmissions", JSON.stringify(saved));
}

async function emailSubmission(submission) {
  if (!initEmailJs()) {
    throw new Error("EmailJS is not configured yet. Add your public key, service ID, and template ID in join.js.");
  }

  return window.emailjs.send(emailJsConfig.serviceId, emailJsConfig.templateId, {
    name: submission.name,
    message: submission.message,
    to_email: submission.email,
    reply_to: emailRecipient,
    display_time: submission.displayTime,
    phone: submission.phone,
    address: submission.address
  });
}

function updateCalendarLink(submission) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  const startDate = nextCalendarStart(submission.time);
  const endDate = new Date(startDate.getTime() + 15 * 60 * 1000);
  const start = formatCalendarDate(startDate);
  const end = formatCalendarDate(endDate);
  const title = "Task: Earthquarter 15-minute switch-off";
  const details = [
    `Add this as a Task in your Google Calendar app for ${submission.displayTime}.`,
    "",
    "Switch off all safe, non-essential electricity for 15 minutes.",
    "",
    `Plan message: ${submission.message}`
  ].join("\n");

  calendarLink.href = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&ctz=${encodeURIComponent(timezone)}`;
  successSummary.textContent = `${submission.name}, your plan is saved on this device. Click the button below to add a 15-minute Earthquarter task-style reminder to Google Calendar for ${submission.displayTime}.`;
}

function captureDraftFromForm() {
  return {
    name: fullName.value.trim(),
    countryCode: countryCode.value,
    phoneDigits: onlyDigits(phoneNumber.value),
    email: emailAddress.value.trim(),
    addressType: addressType.value,
    addressLine: addressLine.value.trim(),
    city: city.value,
    region: region.value,
    postalCode: postalCode.value.trim(),
    dateOfBirth: dateOfBirth.value,
    message: switchMessage.value.trim()
  };
}

function setDateLimits() {
  const today = new Date();
  const pad = (number) => String(number).padStart(2, "0");
  dateOfBirth.max = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  dateOfBirth.min = "1900-01-01";
}

countryCode.addEventListener("change", updatePhoneHint);
region.addEventListener("change", populateCities);
savePlan.addEventListener("change", () => {
  if (savePlan.checked) {
    persistDraft(captureDraftFromForm());
    return;
  }

  clearDraft();
});

[
  fullName,
  countryCode,
  phoneNumber,
  emailAddress,
  addressType,
  addressLine,
  region,
  city,
  postalCode,
  dateOfBirth,
  switchMessage
].forEach((field) => {
  field.addEventListener("input", () => {
    if (savePlan.checked) {
      persistDraft(captureDraftFromForm());
    }
  });
  field.addEventListener("change", () => {
    if (savePlan.checked) {
      persistDraft(captureDraftFromForm());
    }
  });
});

phoneNumber.addEventListener("input", () => {
  phoneNumber.value = phoneNumber.value.replace(/[^\d\s-]/g, "");
});

calendarLink.addEventListener("click", (event) => {
  event.preventDefault();

  if (!calendarLink.href || calendarLink.href.endsWith("#")) {
    return;
  }

  window.location.href = calendarLink.href;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const submission = buildSubmission();
  submitButton.disabled = true;
  setEmailStatus("Saving your plan and sending your Earthquarter email...", "pending");

  saveSubmission(submission);

  try {
    await emailSubmission(submission);
    setEmailStatus("Your Earthquarter email was sent successfully.", "success");
  } catch (error) {
    console.error(error);
    setEmailStatus(error.message || "Your plan was saved, but the email could not be sent yet.", "error");
  }

  if (savePlan.checked) {
    persistDraft(captureDraftFromForm());
  } else {
    clearDraft();
  }
  updateCalendarLink(submission);
  joinSuccess.hidden = false;
  joinSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
  submitButton.disabled = false;
});

updatePhoneHint();
populateCities();
setDateLimits();
setEmailStatus(
  hasEmailJsConfig()
    ? "Confirmation emails are ready to send with EmailJS."
    : "Fill in your EmailJS keys in join.js to turn on confirmation emails.",
  hasEmailJsConfig() ? "success" : "pending"
);

if (getCookie(rememberCookieName) === "1") {
  fillFormFromDraft(getDraft());
}
