import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI;
try {
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
} catch (e) {
    console.warn("GoogleGenerativeAI initialization warning:", e.message);
}

export async function generateStudyPlan(planData) {
    if (!genAI) {
        throw new Error("AI service is not configured. Please ensure GEMINI_API_KEY is set in your environment.");
    }

    try {
        const { currentGpa, targetGpa, gap, priority } = planData;

        const subjectsStr = priority.map(p =>
            `- **${p.subjectName}** (Credits: ${p.credits}, Difficulty: ${p.difficulty})\n  CA Marks: ${p.caMarks}\n  Required Final Exam: ${p.requiredFinal}\n  Impact Score: ${p.impactScore}`
        ).join("\n\n");

        const prompt = `Act as an expert university academic advisor. A student has a current GPA of ${currentGpa} and a target GPA of ${targetGpa} (Gap: ${gap}).
        
Here are the subjects the student needs to focus on in order of priority (based on how much impact the final exam has on their GPA):

${subjectsStr}

Please generate a highly actionable, concise, week-by-week study plan to help the student achieve their required final marks.

Formatting rules:
- Format the response beautifully in Markdown.
- Keep the introduction very brief.
- Provide practical study strategies specific to courses with high impact scores.
- End with a motivating, professional conclusion.
- Do NOT use HTML formatting, only standard Markdown like #, ##, **, -, etc.`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const response = await model.generateContent(prompt);
        return response.response.text();
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("Failed to generate study plan from AI.");
    }
}
