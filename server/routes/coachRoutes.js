const express = require("express");
const OpenAI = require("openai");
const protect = require("../middleware/auth");

const router = express.Router();

router.post("/chat", protect, async (req, res) => {
  try {
    const client = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;

    if (!client) {
      return res.status(503).json({ message: "OpenAI API key is not configured on the server." });
    }

    const { message, metrics, warnings, habits, events, program, faculty } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      instructions:
        "You are an academic support assistant for a university GPA calculator website. Give practical, supportive, concise advice for improving the current semester. Use the student's current GPA, warnings, habits, upcoming events, faculty, and program. When relevant, suggest study plans, revision order, time management, and exam preparation. Do not invent hidden marks or dates. If the user asks about next events, answer from the provided event list.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                faculty,
                program,
                metrics,
                warnings,
                habits,
                events,
                question: message,
              }),
            },
          ],
        },
      ],
    });

    return res.json({ reply: response.output_text });
  } catch (error) {
    return res.status(500).json({
      message: error?.message || "OpenAI request failed.",
    });
  }
});

module.exports = router;
