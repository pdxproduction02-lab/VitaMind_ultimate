module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") return res.status(400).json({ error: "Message is required" });
    if (message.length > 3000) return res.status(400).json({ error: "Message is too long" });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });

    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
    const prompt = `You are VitaMind AI, a concise wellness education assistant for a health-tracking app.
Rules:
- Provide general educational wellness information only.
- Do not diagnose, prescribe, or provide medication dosages.
- Do not claim certainty about a user's health.
- For emergencies or severe/worrying symptoms, tell the user to contact local emergency services or a qualified healthcare professional.
- Keep answers practical and age-appropriate.
User question: ${message}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 700 }
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || "Gemini request failed" });
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    return res.status(200).json({ text: text || "No response was generated." });
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
};