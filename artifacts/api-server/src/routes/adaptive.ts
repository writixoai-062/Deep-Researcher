import { Router, type IRouter, type Request, type Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router: IRouter = Router();

// POST /api/adaptive/questions
// Analyzes the user's question, detects category, returns 2-4 clarifying questions with options
router.post("/adaptive/questions", async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "GEMINI_API_KEY not configured." });
    return;
  }

  const { question, language } = req.body as { question?: string; language?: string };
  if (!question || question.trim().length < 3) {
    res.status(400).json({ error: "question is required." });
    return;
  }

  const prompt =
    `You are an expert consultant personalizing advice for a client.\n\n` +
    `The client asked: "${question.trim().substring(0, 600)}"\n\n` +
    `TASK: Detect the category and generate 2-4 highly specific clarifying questions.\n\n` +
    `Category options: Business/Startup, Career/Job, Tech/Code, Health/Fitness, Learning/Education, Creative, Finance/Money, Relationship/Life, General\n\n` +
    `Rules:\n` +
    `- Questions MUST be specific to the actual topic\n` +
    `- Options must be concrete, realistic choices (not vague)\n` +
    `- 3-5 options per question\n` +
    `- Never ask obvious or overly generic questions\n\n` +
    `Respond with ONLY valid JSON (absolutely no markdown code blocks or extra text):\n` +
    `{\n  "category": "...",\n  "categoryEmoji": "...",\n  "questions": [\n    {\n      "id": "q1",\n      "question": "...",\n      "options": ["Option A", "Option B", "Option C"]\n    }\n  ]\n}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    // Strip markdown code fences if present
    text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: "Failed to generate questions", details: message });
  }
});

// POST /api/adaptive/answer
// Returns a personalized, actionable answer tailored to the user's specific profile
router.post("/adaptive/answer", async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "GEMINI_API_KEY not configured." });
    return;
  }

  const { question, category, answers, language } = req.body as {
    question?: string;
    category?: string;
    answers?: Record<string, string | string[]>;
    language?: string;
  };

  if (!question || !answers) {
    res.status(400).json({ error: "question and answers are required." });
    return;
  }

  const lang = typeof language === "string" && language.trim() ? language.trim() : "English";
  const langNote = lang !== "English" ? `\n\nIMPORTANT: Respond entirely in ${lang}. All text must be in ${lang}.` : "";

  const answersText = Object.entries(answers)
    .map(([q, a]) => `• ${q}: ${Array.isArray(a) ? a.join(", ") : a}`)
    .join("\n");

  const prompt =
    `You are a world-class expert consultant giving highly personalized advice.\n\n` +
    `CLIENT QUESTION: "${question}"\n` +
    `CATEGORY: ${category || "General"}\n` +
    `CLIENT'S SPECIFIC SITUATION:\n${answersText}\n\n` +
    `Generate a HIGHLY PERSONALIZED, actionable answer tailored exactly to their situation.\n` +
    `NOT generic advice — every recommendation must reflect their specific profile.\n\n` +
    `Format:\n\n` +
    `📝 YOUR PERSONALIZED ANSWER\n` +
    `[2-3 sentences that acknowledge their exact situation and deliver the key insight]\n\n` +
    `✅ YOUR FASTEST PATH:\n` +
    `[1 bold, specific recommendation matched to their profile — name it clearly]\n\n` +
    `3-STEP ACTION PLAN:\n` +
    `1. [Specific Week 1 action]\n` +
    `2. [Specific Week 2 action]\n` +
    `3. [Specific Week 3 action]\n\n` +
    `💡 3 UNIQUE TIPS (Things most people miss):\n` +
    `• [Counterintuitive tip specific to their situation]\n` +
    `• [Common mistake to avoid given their profile]\n` +
    `• [Hidden advantage they can leverage]\n\n` +
    `📌 NEXT STEPS (Start today):\n` +
    `1. [Immediate action]\n` +
    `2. [Second action]\n` +
    `3. [Third action]` +
    langNote;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    res.json({ content: result.response.text() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: "Gemini API error", details: message });
  }
});

// POST /api/adaptive/deep
// Returns a comprehensive deep analysis / complete plan
router.post("/adaptive/deep", async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "GEMINI_API_KEY not configured." });
    return;
  }

  const { question, category, answers, language } = req.body as {
    question?: string;
    category?: string;
    answers?: Record<string, string | string[]>;
    language?: string;
  };

  if (!question || !answers) {
    res.status(400).json({ error: "question and answers are required." });
    return;
  }

  const lang = typeof language === "string" && language.trim() ? language.trim() : "English";
  const langNote = lang !== "English" ? `\n\nIMPORTANT: Respond entirely in ${lang}.` : "";

  const answersText = Object.entries(answers)
    .map(([q, a]) => `• ${q}: ${Array.isArray(a) ? a.join(", ") : a}`)
    .join("\n");

  const categoryGuides: Record<string, string> = {
    "Business/Startup":   "1. Market Research & Validation  2. Business Setup & Legal  3. Product/Service Launch Strategy  4. Marketing & Customer Acquisition  5. Financial Projections (Months 1–6)  6. 30-Day Action Plan with daily tasks  7. Common Mistakes & Risk Mitigation",
    "Career/Job":         "1. Current Situation Assessment  2. Skills Gap Analysis  3. 90-Day Learning Plan  4. Portfolio & Personal Brand  5. Networking Strategy (with scripts)  6. Job Application & Interview System  7. Salary Negotiation Playbook  8. 6-Month Milestone Map",
    "Tech/Code":          "1. Requirements & Architecture Decision  2. Tech Stack Recommendation (with reasoning)  3. Step-by-Step Implementation Guide  4. Key Code Patterns & Snippets  5. Testing Strategy  6. Deployment & DevOps  7. Performance & Security Best Practices  8. Maintenance & Scaling Plan",
    "Health/Fitness":     "1. Starting Point Assessment  2. Nutrition Strategy (meal structure, foods)  3. Exercise Program (weekly schedule)  4. Sleep & Recovery System  5. Habit Formation (Atomic Habits approach)  6. Progress Tracking Method  7. 30-Day Challenge Plan  8. Obstacle Mitigation",
    "Learning/Education": "1. Topic Roadmap (beginner → advanced)  2. Phase-by-Phase Learning Plan  3. Best Free & Paid Resources (ranked)  4. Hands-On Project Ideas  5. Community & Accountability System  6. Weekly Study Schedule Template  7. Milestone Checkpoints  8. How to Measure Progress",
    "Creative":           "1. Concept & Vision Development  2. Style, Voice & Aesthetic Direction  3. Content/Creation System  4. Production Workflow & Tools  5. Distribution & Publishing Plan  6. Audience Building Strategy  7. Monetization Roadmap  8. 90-Day Launch Plan",
    "Finance/Money":      "1. Financial Situation Audit  2. Goal Prioritization Framework  3. Budgeting & Cash Flow System  4. Debt Elimination Strategy  5. Investment Roadmap (by risk level)  6. Emergency Fund Plan  7. Tax Optimization  8. 12-Month Financial Milestones",
    "Relationship/Life":  "1. Situation Assessment & Root Causes  2. Core Insights & Reframes  3. Practical Communication Strategies  4. Action Plan with Timeline  5. Boundary Setting Framework  6. Resources & Professional Support  7. Self-Care & Emotional Health Plan  8. Progress Indicators",
    "General":            "1. Situation Assessment  2. Strategic Framing  3. Options Analysis (pros/cons)  4. Recommended Path with Reasoning  5. Step-by-Step Action Plan  6. Tools & Resources  7. Risk Factors & Mitigation  8. Success Metrics & Timeline",
  };

  const guide = categoryGuides[category as string] || categoryGuides["General"];

  const prompt =
    `You are a world-class consultant creating a comprehensive $500-quality deep analysis.\n\n` +
    `CLIENT QUESTION: "${question}"\n` +
    `CATEGORY: ${category || "General"}\n` +
    `CLIENT PROFILE:\n${answersText}\n\n` +
    `Create a COMPLETE, THOROUGH analysis covering ALL of these sections:\n${guide}\n\n` +
    `Requirements:\n` +
    `- Tailor EVERY section specifically to their profile — no generic filler\n` +
    `- Include specific tools, platforms, resources, and examples by name\n` +
    `- Make every section immediately actionable\n` +
    `- Use ## for section headers, emojis for visual clarity\n` +
    `- Be comprehensive and detailed — this is the full plan, not a summary` +
    langNote;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    res.json({ content: result.response.text() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ error: "Gemini API error", details: message });
  }
});

export default router;
