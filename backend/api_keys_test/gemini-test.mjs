// gemini-test.mjs — same REST API as the Java sample (Generate Content)
// POST to generativelanguage.googleapis.com, request/response shape matches Android code
import "dotenv/config";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is missing. Set it in .env or environment.");
  process.exit(1);
}

async function generateContent(userText) {
  const body = {
    contents: [
      {
        parts: [{ text: userText }],
      },
    ],
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API ${res.status}: ${errorBody}`);
  }

  const data = await res.json();

  if (
    data.candidates != null &&
    data.candidates.length > 0 &&
    data.candidates[0].content != null &&
    data.candidates[0].content.parts != null &&
    data.candidates[0].content.parts.length > 0
  ) {
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error("Invalid response format: " + JSON.stringify(data));
}

async function main() {
  const prompt = "Tell something about AI";
  console.log("Sending to Gemini:", prompt);
  console.log("");

  try {
    const text = await generateContent(prompt);
    console.log("Gemini says:");
    console.log(text);
  } catch (error) {
    console.error("Gemini error:", error.message);
    if (error.message.includes("401")) console.error("Tip: Check GEMINI_API_KEY in .env (get key at https://aistudio.google.com/apikey)");
    if (error.message.includes("429")) console.error("Tip: Quota exceeded. Try again later.");
  }
}

main();
