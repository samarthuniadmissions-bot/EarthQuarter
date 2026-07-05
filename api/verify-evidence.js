const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.5";

function sendJson(res, statusCode, payload) {
  res.status(statusCode).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function extractText(data) {
  if (!data) return "";
  if (typeof data.output_text === "string") return data.output_text;

  const pieces = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) {
        pieces.push(content.text);
      }
    }
  }
  return pieces.join("\n").trim();
}

function parseJsonLoose(text) {
  const trimmed = String(text || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Verification service returned an unreadable response.");
    }
    return JSON.parse(match[0]);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  if (!OPENAI_API_KEY) {
    return sendJson(res, 500, {
      error: "OPENAI_API_KEY is not set for the verification service."
    });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const { imageDataUrl, description, name, weekLabel, fileName } = body;

  if (!imageDataUrl || !description) {
    return sendJson(res, 400, {
      error: "Missing imageDataUrl or description."
    });
  }

  const prompt = [
    "You are verifying Earthquarter evidence photos.",
    "Decide whether the uploaded photo matches the description and looks like a real photo of an Earthquarter moment.",
    "Be strict about the match. Reject if the image does not clearly show the described energy-saving moment.",
    "Reject if it looks synthetic, generated, heavily edited, or unrelated.",
    "If lights are not visible or the scene is ambiguous, only approve when the evidence is still clearly consistent with the description.",
    "",
    `Participant: ${name || "Unknown"}`,
    `Week: ${weekLabel || "Unknown week"}`,
    `File name: ${fileName || "Unknown file"}`,
    `Description: ${description}`,
    "",
    "Return ONLY valid JSON with this shape:",
    '{"approved":boolean,"reason":"short explanation","confidence":number,"matchesDescription":boolean,"observedElements":["..."]}'
  ].join("\n");

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: imageDataUrl }
          ]
        }
      ]
    })
  });

  if (!openaiResponse.ok) {
    const text = await openaiResponse.text().catch(() => "");
    return sendJson(res, 502, {
      error: text || "OpenAI verification request failed."
    });
  }

  const data = await openaiResponse.json();
  const text = extractText(data);
  let parsed;

  try {
    parsed = parseJsonLoose(text);
  } catch (error) {
    return sendJson(res, 502, {
      error: error.message || "Could not parse the verification response."
    });
  }

  return sendJson(res, 200, {
    approved: Boolean(parsed.approved),
    reason: String(parsed.reason || (parsed.approved ? "Approved" : "Rejected")),
    confidence: Number.isFinite(Number(parsed.confidence)) ? Number(parsed.confidence) : null,
    matchesDescription: Boolean(parsed.matchesDescription),
    observedElements: Array.isArray(parsed.observedElements) ? parsed.observedElements : []
  });
}
