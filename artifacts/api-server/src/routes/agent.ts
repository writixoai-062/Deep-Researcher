import { Router, type IRouter, type Request, type Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router: IRouter = Router();

function buildPrompt(agentId: string, inputs: Record<string, string>, lang: string): string {
  const lNote =
    lang && lang !== "English"
      ? `\n\nIMPORTANT: Your entire response must be in ${lang}. Every heading, sentence, and example must be written in ${lang}.`
      : "";

  switch (agentId) {
    case "content":
      return (
        `You are a world-class content writer. Create compelling ${inputs.platform || "Blog"} content about "${inputs.topic}".\n` +
        `Tone: ${inputs.tone || "Professional"}. Target length: ${inputs.length || "Medium"}.\n\n` +
        `Structure your output exactly as:\n` +
        `**Title:** [attention-grabbing title]\n\n` +
        `**Introduction:** [hook the reader in 2–3 sentences]\n\n` +
        `**Main Content:** [well-structured body with subheadings]\n\n` +
        `**Conclusion:** [strong closing with call-to-action]` +
        lNote
      );

    case "code":
      return (
        `You are a senior software engineer. Write clean, production-quality code in ${inputs.language || "Python"} for:\n"${inputs.task}"\n\n` +
        `Structure your response as:\n` +
        `**Code:**\n\`\`\`${(inputs.language || "python").toLowerCase()}\n[complete, runnable code with inline comments]\n\`\`\`\n\n` +
        `**How it works:** [clear explanation of the logic]\n\n` +
        `**Usage example:** [how to run or use it]\n\n` +
        `**Edge cases:** [what to watch out for]` +
        lNote
      );

    case "prompt":
      return (
        `You are a master prompt engineer. Generate 3 highly optimized AI prompts for:\n"${inputs.description}"\n\n` +
        `Provide exactly:\n` +
        `**Prompt 1 — Midjourney:**\n[detailed visual prompt with style, lighting, composition, and quality modifiers]\n\n` +
        `**Prompt 2 — DALL-E 3:**\n[descriptive prompt leveraging DALL-E's natural language understanding]\n\n` +
        `**Prompt 3 — ChatGPT:**\n[structured text prompt to elicit the best response]\n\n` +
        `For each, add one sentence explaining what makes it effective.` +
        lNote
      );

    case "hook":
      return (
        `You are a viral content strategist. Create 5 scroll-stopping hooks for ${inputs.platform || "TikTok"} about "${inputs.topic}".\n` +
        `Each hook must be ≤20 words, create instant curiosity or urgency, and demand attention.\n\n` +
        `Format:\n` +
        `**Hook 1:** [text] — *Why it works: [one-line reason]*\n` +
        `**Hook 2:** [text] — *Why it works: [one-line reason]*\n` +
        `**Hook 3:** [text] — *Why it works: [one-line reason]*\n` +
        `**Hook 4:** [text] — *Why it works: [one-line reason]*\n` +
        `**Hook 5:** [text] — *Why it works: [one-line reason]*` +
        lNote
      );

    case "translate":
      return (
        `You are a professional translator with deep cultural expertise.\n` +
        `Translate this text from ${inputs.sourceLang || "Auto-detect"} to ${inputs.targetLang || "English"}, ` +
        `preserving tone, nuance, and cultural context:\n\n"${inputs.text}"\n\n` +
        `Provide:\n` +
        `**Translation:**\n[the translated text]\n\n` +
        `**Translator's Notes:**\n[cultural nuances adjusted, idioms handled, or context preserved]` +
        lNote
      );

    case "editor":
      return (
        `You are a senior editor. Improve this text with a ${inputs.style || "Professional"} style:\n\n"${inputs.text}"\n\n` +
        `Provide:\n` +
        `**Improved Version:**\n[polished text]\n\n` +
        `**Changes Made:**\n[bullet-point list of specific improvements and the reasoning behind each]` +
        lNote
      );

    case "research":
      return (
        `You are a thorough research analyst. Research "${inputs.topic}" comprehensively.\n\n` +
        `Provide:\n` +
        `**Executive Summary:** [2–3 paragraph overview]\n\n` +
        `**Key Findings:** [5+ bullet points with the most important facts]\n\n` +
        `**Notable Statistics:** [data points with context]\n\n` +
        `**Perspectives & Debates:** [different viewpoints if applicable]\n\n` +
        `**Conclusion:** [implications and key takeaways]` +
        lNote
      );

    case "marketing":
      return (
        `You are a senior marketing strategist. Create a marketing plan for "${inputs.product}" targeting "${inputs.audience}".\n\n` +
        `Provide:\n` +
        `**Strategy Overview:** [positioning and core message]\n\n` +
        `**Ad Copy Variations:**\n- Variation A (emotional): [copy]\n- Variation B (benefit-focused): [copy]\n- Variation C (urgency): [copy]\n\n` +
        `**Campaign Ideas:** [3 channel-specific campaign concepts]\n\n` +
        `**Key Messaging:** [3–5 core messages]\n\n` +
        `**Success Metrics:** [KPIs to track]` +
        lNote
      );

    case "data":
      return (
        `You are a senior data analyst. Analyze this: "${inputs.data}"\n\n` +
        `Provide:\n` +
        `**Key Insights:** [3–5 most important findings]\n\n` +
        `**Trends Identified:** [patterns observed]\n\n` +
        `**Anomalies / Red Flags:** [anything unusual or concerning]\n\n` +
        `**Actionable Recommendations:** [specific next steps]\n\n` +
        `**Suggested Further Analysis:** [what deeper investigation would reveal]` +
        lNote
      );

    case "tutor":
      return (
        `You are a patient, expert tutor. Explain "${inputs.topic}" for a ${inputs.level || "Teen"} learning level.\n\n` +
        `Provide:\n` +
        `**Simple Explanation:** [use everyday language and analogies appropriate for a ${inputs.level || "Teen"}]\n\n` +
        `**Real-World Examples:**\n1. [example]\n2. [example]\n\n` +
        `**Common Misconceptions:** [what people often get wrong]\n\n` +
        `**Practice Questions:**\n1. [question] → *Answer: [answer]*\n2. [question] → *Answer: [answer]*\n3. [question] → *Answer: [answer]*\n\n` +
        `**Next Steps:** [how to learn more about this topic]` +
        lNote
      );

    default:
      return `Help with: ${JSON.stringify(inputs)}${lNote}`;
  }
}

router.post("/agent", async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "GEMINI_API_KEY not configured on the server." });
    return;
  }

  const { agentId, inputs, language } = req.body as {
    agentId?: string;
    inputs?: Record<string, string>;
    language?: string;
  };

  if (!agentId || typeof agentId !== "string") {
    res.status(400).json({ error: "agentId is required." });
    return;
  }
  if (!inputs || typeof inputs !== "object") {
    res.status(400).json({ error: "inputs object is required." });
    return;
  }

  const lang = typeof language === "string" && language.trim() ? language.trim() : "English";
  const prompt = buildPrompt(agentId, inputs, lang);

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
