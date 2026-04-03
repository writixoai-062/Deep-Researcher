import { Router, type IRouter, type Request, type Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router: IRouter = Router();

// POST /api/analyze
// Calls Gemini 1.5 Flash using the GEMINI_API_KEY secret.
// Falls back to a structured demo response if the key is missing.
router.post("/analyze", async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "GEMINI_API_KEY not configured on the server." });
    return;
  }

  const { question, context, language } = req.body as {
    question?: string;
    context?: string;
    language?: string;
  };

  if (!question || typeof question !== "string" || question.trim().length < 5) {
    res.status(400).json({ error: "question must be a non-empty string." });
    return;
  }

  const ctx = typeof context === "string" && context.trim() ? context.trim() : "General";
  const lang = typeof language === "string" && language.trim() ? language.trim() : "English";

  const langNote =
    lang === "English"
      ? ""
      : `\n\nIMPORTANT: Respond entirely in ${lang}. All section headings and content must be in ${lang}.`;

  const prompt =
    `You are an expert AI thought analyzer. Analyze this question/conversation for a ${ctx} user.\n\n` +
    `---\n${question.trim()}\n---\n\n` +
    `Provide your analysis in exactly this format:\n\n` +
    `**What did ChatGPT assume?**\n[List 2-3 key assumptions]\n\n` +
    `**What information is missing?**\n[List 2-3 gaps or missing context]\n\n` +
    `**Better answer for a ${ctx} user:**\n[Provide an improved, more targeted answer]` +
    langNote;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const content = result.response.text();
    res.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: "Gemini API error", details: message });
  }
});

export default router;
