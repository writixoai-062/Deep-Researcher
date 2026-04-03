import { Router, type IRouter } from "express";

const router: IRouter = Router();

// POST /api/analyze
// Proxies to OpenRouter using the server-side OPENROUTER_API_KEY secret.
// The key never reaches the client.
router.post("/analyze", async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "OpenRouter API key not configured on the server." });
    return;
  }

  const { question, context } = req.body;
  if (!question || typeof question !== "string" || question.trim().length < 5) {
    res.status(400).json({ error: "question must be a non-empty string." });
    return;
  }

  const ctx = typeof context === "string" && context.trim() ? context.trim() : "General";

  const systemPrompt =
    "You are an expert AI thought analyzer. Your job is to analyze questions and ChatGPT responses " +
    "to reveal hidden assumptions, missing information, and provide better answers. " +
    "Be clear, concise, and genuinely helpful. Format your response in exactly 3 sections.";

  const userPrompt =
    `Analyze this question/conversation for a ${ctx} user:\n\n---\n${question.trim()}\n---\n\n` +
    `Provide your analysis in exactly this format:\n\n` +
    `**What did ChatGPT assume?**\n[List 2-3 key assumptions made]\n\n` +
    `**What information is missing?**\n[List 2-3 gaps or missing context]\n\n` +
    `**Better answer for a ${ctx} user:**\n[Provide an improved, more targeted answer]`;

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mentics.app",
        "X-Title": "Mentics Deep Research",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt },
        ],
        max_tokens: 900,
        temperature: 0.7,
      }),
    });

    if (!upstream.ok) {
      const body = await upstream.text();
      res.status(upstream.status).json({ error: "OpenRouter error", details: body });
      return;
    }

    const json = (await upstream.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    res.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: "Failed to reach OpenRouter", details: message });
  }
});

export default router;
