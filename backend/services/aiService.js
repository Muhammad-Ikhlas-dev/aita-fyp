const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing in .env");

const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

// Fix common JSON issues
function fixJson(str) {
  return str
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/,\s*]/g, "]")
    .replace(/,\s*}/g, "}")
    .trim();
}

// Generate AI content
async function generateAIContent(prompt) {
  try {
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: 4096
      },
    };

    const response = await axios.post(API_URL, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 60000,
    });

    const parts = response.data?.candidates?.[0]?.content?.parts || [];
    let text = parts.map((p) => p.text || "").join("").trim();
    if (!text) throw new Error("Empty response from Gemini");

    return fixJson(text);
  } catch (error) {
    if (error.response) {
      console.error("Gemini API Error:", JSON.stringify(error.response.data, null, 2));
      throw new Error(
        `AI Service Error (${error.response.status}): ${error.response.data?.error?.message || "Unknown Gemini error"}`
      );
    }
    throw new Error(`Connection Error: ${error.message}`);
  }
}

module.exports = { generateAIContent };