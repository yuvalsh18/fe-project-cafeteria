// Gemini API utility for frontend use
// This is a simple fetch wrapper for Gemini Pro API (text-only)
// Requires VITE_GEMINI_API_KEY in your .env file

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function geminiChat(messages) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key not set in .env");

  // Log Gemini API token status
  try {
    const statusRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (statusRes.ok) {
      console.log(`[Gemini API] Token status: OK | API Key: ${apiKey}`);
    } else {
      console.log(
        `[Gemini API] Token status: FAILED (${statusRes.status} ${statusRes.statusText}) | API Key: ${apiKey}`
      );
    }
  } catch (err) {
    console.log(
      `[Gemini API] Token status: ERROR (${err.message}) | API Key: ${apiKey}`
    );
  }

  // Gemini expects [{role: 'user'|'model', parts: [{text: string}]}]
  const formatted = messages.map((msg) => ({
    role: msg.sender === "ai" ? "model" : "user",
    parts: [{ text: msg.text }],
  }));

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: formatted }),
  });
  if (!res.ok) {
    let errorMsg = `Gemini API error: ${res.status} ${res.statusText}`;
    if (res.status === 429) {
      errorMsg =
        "Gemini API error: 429 Too Many Requests. You have hit the rate limit. Please wait a few minutes and try again. If you are using a free API key, usage is limited. Consider upgrading or using a different key.";
    }
    throw new Error(errorMsg);
  }
  const data = await res.json();
  // Extract the model's reply
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Sorry, I couldn't get a response from Gemini."
  );
}
