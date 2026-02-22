// GPT test — uses OpenAI Chat Completions API (no quota issues like Gemini free tier)
import "dotenv/config";
import OpenAI from "openai";

const apiKey = process.env.GPT_API_KEY;
if (!apiKey) {
  console.error("Error: GPT_API_KEY is missing. Set it in .env");
  process.exit(1);
}

const client = new OpenAI({ apiKey });

async function main() {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Explain AI in simple words" }],
    });

    const text = completion.choices?.[0]?.message?.content ?? "No response.";
    console.log("GPT says:");
    console.log(text);
  } catch (error) {
    console.error("OpenAI error:", error.message || error);
    if (error.status) console.error("Status:", error.status);
  }
}

main();
