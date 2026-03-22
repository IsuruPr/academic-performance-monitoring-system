const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractFirstJsonObject(text) {
  if (typeof text !== "string") return null;
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

const predictGraduation = async (req, res) => {
  const { cgpa, semesters, totalCredits } = req.validated.body;

  try {
    const prompt = `You are an academic advisor.
Given CGPA=${cgpa}, semesters=${semesters}, totalCredits=${totalCredits}.
Return ONLY valid JSON with keys:
classification (string),
tip (string),
targetGPA (number between 0 and 4).`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices[0].message.content;
    const parsed = extractFirstJsonObject(raw);

    if (!parsed) {
      return res.status(502).json({ message: "AI returned invalid JSON" });
    }

    res.json(parsed);

  } catch (err) {
    res.status(500).json({ message: "AI error" });
  }
};

const getStudyAdvice = async (req, res) => {
  const { message, cgpa, semesterName } = req.validated.body;

  try {
    const prompt = `You are an academic coach.
Student context: cgpa=${cgpa ?? "unknown"}, semester=${semesterName ?? "unknown"}.
Student message: ${message}
Give 5 concise bullet points of study advice (plain text).`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices[0].message.content;
    res.json({ advice: raw?.trim() || "" });
  } catch {
    res.status(500).json({ message: "AI error" });
  }
};

module.exports = { predictGraduation, getStudyAdvice };
