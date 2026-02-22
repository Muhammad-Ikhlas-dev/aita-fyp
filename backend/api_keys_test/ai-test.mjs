/**
 * AI test script — uses Groq (free tier, no credit card).
 * Get a free API key: https://console.groq.com → API Keys → Create. Add GROQ_API_KEY to .env
 */
import "dotenv/config";
import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error("Error: GROQ_API_KEY is missing.");
  console.error("Get a free key at https://console.groq.com and add GROQ_API_KEY=... to your .env");
  process.exit(1);
}

const client = new Groq({ apiKey });

async function main() {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: "who are you?" }],
    });

    const text = completion.choices?.[0]?.message?.content ?? "No response.";
    console.log("AI says:");
    console.log(text);
  } catch (error) {
    console.error("Error:", error.message || error);
    if (error.status) console.error("Status:", error.status);
  }
}

main();
