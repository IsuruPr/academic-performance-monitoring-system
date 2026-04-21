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

const ACADAMIX_SYSTEM_CONTEXT = `You are AcadamiX AI, an intelligent academic assistant built into the AcadamiX Academic Performance Monitoring System.

About AcadamiX:
- AcadamiX is a smart university academic performance monitoring and optimization web app.
- It helps students track their GPA, understand subject priorities, and plan strategically for final exams.
- The system calculates a student's current estimated GPA and required final exam marks for each subject to reach their target GPA.

Key Features you know about:
1. Dashboard: Shows Current GPA, Target GPA, and a GPA Gap. Displays all subject cards with CA marks, required final marks, difficulty, credits, and risk levels (Safe/Medium/High Risk).
2. Subject Priority List: Subjects ranked by impact score — the higher the score, the more that subject's final exam affects the GPA.
3. What-If Simulator: Student can slide a mark for any subject and instantly see how it affects their GPA and gap in real-time.
4. AI Strategy Plan: Generates a personalised Markdown study plan using Gemini AI based on the student's subjects and gaps.
5. Performance Analytics: Bar chart comparing Current vs Target GPA, and a Radar chart showing required finals across all subjects.
6. Study Timer: Pomodoro-style countdown timer. Student sets minutes, starts/pauses/stops. Sessions are saved to browser localStorage. Weekly bar chart shows total study time per day over the last 7 days. Desktop notification fires when session completes.
7. Semester Selection: Student picks a semester (Y1S1, Y1S2, Y2S1, Y2S2) from the landing page before accessing the dashboard.

How GPA is calculated:
- GPA is calculated on a 4.0 scale.
- Each subject has CA marks, a credit weight, and a difficulty rating.
- The required final exam mark is calculated based on how many marks the student still needs to achieve the target GPA.
- Higher credit subjects with harder difficulty and higher required finals are ranked highest priority.

Your role:
- Answer student questions about AcadamiX features, how to use the system, GPA calculations, study strategies, academic advice, and anything related to academic performance.
- Be concise, friendly, and professional.
- If unsure about a specific piece of data (like a student's actual marks), ask the student to check their Dashboard.
- Always encourage and motivate the student.
- Format your responses clearly. Use bullet points or numbered lists when helpful.
- Do NOT make up data about the student — only explain the system and give general advice.`;

export async function chatWithAI(messages) {
    if (!genAI) {
        throw new Error("AI service is not configured. Please ensure GEMINI_API_KEY is set.");
    }
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat({
            history: messages.slice(0, -1).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            })),
            systemInstruction: ACADAMIX_SYSTEM_CONTEXT,
        });
        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        return result.response.text();
    } catch (error) {
        console.error("Chat AI Error:", error);
        throw new Error("Failed to get response from AI.");
    }
}
