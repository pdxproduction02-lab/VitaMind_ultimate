module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { image } = req.body || {};
    if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
      return res.status(400).json({ error: "A valid image is required" });
    }
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });

    const [header, base64] = image.split(",");
    const mimeType = (header.match(/data:(image\/[a-zA-Z0-9.+-]+);base64/) || [])[1] || "image/jpeg";
    if (base64.length > 8_000_000) return res.status(413).json({ error: "Image is too large. Use a smaller image." });

    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
    const instruction = `Analyze this image of a food package, ingredient list, or nutrition label.
Return concise plain text with these headings when visible:
Product/Label, Ingredients, Allergens, Notes.
Only report information you can actually see or clearly infer from the image. Do not invent missing text.
Do not provide medical diagnosis or claim that a food is safe for a particular person.
Always remind the user to check the original package for exact allergen and nutrition information.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: instruction },
          { inlineData: { mimeType, data: base64 } }
        ] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 900 }
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || "Gemini scan failed" });
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    return res.status(200).json({ text: text || "I couldn't read enough information from this image. Try a clearer photo." });
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
};