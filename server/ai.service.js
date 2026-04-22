const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

let genAI;
try {
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
} catch (e) {
    console.warn("GoogleGenerativeAI initialization warning:", e.message);
}

let groq;
try {
    if (process.env.GROQ_API_KEY) {
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
} catch (e) {
    console.warn("Groq initialization warning:", e.message);
}

async function generateStudyPlan(planData) {
    if (!groq) {
        throw new Error("AI service is not configured. Please ensure GROQ_API_KEY is set in your environment.");
    }

    try {
        const { currentGpa, targetGpa, gap, priority } = planData;

        const subjectsStr = priority.map(p =>
            `- ${p.subjectName} (Credits: ${p.credits}, Difficulty: ${p.difficulty}, CA: ${p.caMarks}%, Required Final: ${p.requiredFinal}, Impact: ${p.impactScore})`
        ).join("\n");

        const prompt = `Create a brief academic study plan. Student has GPA ${currentGpa}, target ${targetGpa}, gap ${gap}. Priority subjects:\n${subjectsStr}\n\nProvide practical week-by-week study strategies in Markdown.`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are an expert academic coach. Generate concise, practical study plans in Markdown format." },
                { role: "user", content: prompt },
            ],
            max_tokens: 1200,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("Failed to generate study plan from AI.");
    }
}

async function generateSubjectStudyPlan(subjectData) {
    if (!groq) {
        throw new Error("AI service is not configured. Please ensure GROQ_API_KEY is set in your environment.");
    }

    try {
        const { subjectName, credits, difficulty, caMarks, caSource, requiredFinal, caWeight, finalWeight, currentGpa, targetGpa } = subjectData;

        const caSourceLabel = caSource === "db" ? "actual recorded marks" : caSource === "profile" ? "profile data" : "estimated";

        const prompt = `Create a focused, practical study plan for a single university subject.

Subject: ${subjectName}
Credits: ${credits}
Difficulty Level: ${difficulty}/5
CA Marks: ${caMarks}% (source: ${caSourceLabel})
CA Weight: ${Math.round((caWeight || 0.4) * 100)}%
Final Exam Weight: ${Math.round((finalWeight || 0.6) * 100)}%
Required Final Exam Mark: ${requiredFinal}%
Student's Current GPA: ${currentGpa}
Student's Target GPA: ${targetGpa}

Generate a detailed, subject-specific study plan in Markdown that includes:
1. A brief assessment of the student's current standing in this subject
2. A week-by-week study schedule (4 weeks) tailored to reach the required final mark of ${requiredFinal}%
3. Specific study techniques suited to this subject's difficulty level
4. Key topics to prioritize based on typical exam patterns
5. Daily time allocation recommendations
6. Tips to maximize the final exam score

Be specific, actionable, and encouraging. Format clearly with headers and bullet points.`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are an expert academic coach. Generate detailed, practical study plans in Markdown format." },
                { role: "user", content: prompt },
            ],
            max_tokens: 1500,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("AI Subject Plan Error:", error);
        throw new Error("Failed to generate subject study plan from AI.");
    }
}

// Helper function to detect language (Sinhala or English)       
function detectLanguage(text) {
    // Check for Sinhala unicode characters
    const sinhalaRegex = /[\u0D80-\u0DFF]/g;
    const sinhalaMatches = text.match(sinhalaRegex);
    return sinhalaMatches && sinhalaMatches.length > 3 ? 'sinhala' : 'english';
}

// AcadamiX feature knowledge block (bilingual)
const SYSTEM_FEATURE_KNOWLEDGE = {
    english: `
ACADAMIX FEATURES GUIDE:
- Dashboard: The main overview page showing your current CGPA, WGPA, total credits earned, and a summary of all semesters. It gives you a quick snapshot of your overall academic standing.
- GPA Analytics: Detailed charts and graphs visualizing your GPA trends across semesters. Includes per-module performance breakdowns and comparisons between your actual GPA and target GPA.
- Forecasting: Predicts your future GPA based on current academic momentum and trends. Helps you understand what GPA you are likely to achieve if you continue at your current pace.
- What-If Analysis: A simulation tool that lets you experiment with hypothetical grades. You can change expected grades for upcoming modules and instantly see how those changes would affect your CGPA.
- Academic Warnings: Highlights modules or semesters where your performance is below your target or at risk. Provides early alerts so you can take corrective action before it is too late.
- Study Timer: A built-in Pomodoro-style timer to help you manage focused study sessions. You can link timer sessions to specific modules to track how much time you spend on each subject.
- Risk Analyzer: Analyzes your current CA marks and grades to identify which modules are at risk of failure or underperformance. Ranks modules by risk level so you know where to focus your effort.
- Final Analyzer: Calculates the minimum final exam marks you need in each module to achieve your target grade or GPA. Helps you prioritize exam preparation strategically.
- Semester Setup: Where you configure each semester by adding modules, setting credit values, entering CA marks, and defining target GPAs. This is the starting point for all personalized analytics.`,

    sinhala: `
ACADAMIX විශේෂාංග මාර්ගෝපදේශය:
- Dashboard (ප්‍රධාන පිටුව): ඔබේ වත්මන් CGPA, WGPA, ලබාගත් මුළු ක්‍රෙඩිට් ගණන සහ සියලුම සෙමෙස්ටර් සාරාංශය පෙන්වන ප්‍රධාන දළ විශ්ලේෂණ පිටුව. ඔබේ සමස්ත අධ්‍යයන තත්ත්වය ඉක්මනින් දැනගැනීමට මෙය ඉවහල් වේ.
- GPA Analytics (GPA විශ්ලේෂණය): සෙමෙස්ටර් හරහා ඔබේ GPA ප්‍රවණතා දෘශ්‍යමාන කරන සවිස්තරාත්මක ප්‍රස්ථාර සහ ග්‍රාෆ්. ඔබේ සැබෑ GPA සහ ඉලක්ක GPA අතර සංසන්දනය ද ඇතුළත් වේ.
- Forecasting (අනාවැකි): ඔබේ වත්මන් අධ්‍යයන ගමන් මග සහ ප්‍රවණතා මත පදනම්ව ඔබේ අනාගත GPA අනාවැකි කියයි. ඔබ දැනට ඇති වේගයෙන් ඉදිරියට ගියහොත් ලබාගත හැකි GPA අගය තේරුම් ගැනීමට උදව් කරයි.
- What-If Analysis (කල්පිත විශ්ලේෂණය): ඔබට ශ්‍රේණි අත්හදා බැලීමට ඉඩ දෙන සිමියුලේෂන් මෙවලමකි. ඉදිරි විෂයයන් සඳහා අපේක්ෂිත ශ්‍රේණි වෙනස් කර ඒවා ඔබේ CGPA ට බලපාන ආකාරය ක්ෂණිකව දැකගත හැකිය.
- Academic Warnings (අධ්‍යයන අනතුරු ඇඟවීම්): ඔබේ ඉලක්කයට වඩා අඩු ක්‍රියාකාරිත්වයක් ඇති හෝ අවදානමේ ඇති විෂයයන් හෝ සෙමෙස්ටර් ඉස්මතු කරයි. ඉතා ප්‍රමාද වීමට පෙර නිවැරදි ක්‍රියාමාර්ග ගැනීමට ඉල්ලා සිටීම් ලබා දෙයි.
- Study Timer (අධ්‍යයන කාල මැනුම): කේන්ද්‍රගත අධ්‍යයන සැසි කළමනාකරණය කිරීමට Pomodoro ශෛලියේ ටයිමරයකි. ඔබ එක් එක් විෂයයට ගත කරන කාලය නිරීක්ෂණය කිරීමට ටයිමර් සැසි නිශ්චිත විෂයයන් සමඟ සම්බන්ධ කළ හැකිය.
- Risk Analyzer (අවදානම් විශ්ලේෂකය): අසාර්ථකත්වය හෝ දුර්වල ක්‍රියාකාරිත්වයේ අවදානමක් ඇති විෂයයන් හඳුනා ගැනීමට ඔබේ CA ලකුණු සහ ශ්‍රේණි විශ්ලේෂණය කරයි. ඔබේ උත්සාහය යොමු කළ යුත්තේ කොතැනටද යන්න දැනගැනීමට අවදානම් මට්ටම අනුව විෂයයන් ශ්‍රේණිගත කරයි.
- Final Analyzer (අවසාන විභාග විශ්ලේෂකය): ඔබේ ඉලක්ක ශ්‍රේණිය හෝ GPA ලබා ගැනීමට එක් එක් විෂයයේ ලබා ගත යුතු අවම අවසාන විභාග ලකුණු ගණනය කරයි. විභාග සූදානම ක්‍රමෝපායිකව ප්‍රමුඛ කිරීමට උදව් කරයි.
- Semester Setup (සෙමෙස්ටර් සැකසුම): විෂයයන් එකතු කිරීමෙන්, ක්‍රෙඩිට් අගයන් සැකසීමෙන්, CA ලකුණු ඇතුළත් කිරීමෙන් සහ ඉලක්ක GPA නිර්වචනය කිරීමෙන් එක් එක් සෙමෙස්ටරය වින්‍යාස කරන ස්ථානය. සියලු පුද්ගලාරෝපිත විශ්ලේෂණ සඳහා ආරම්භක ස්ථානය මෙයයි.`
};

// Sinhala system context
const ACADAMIX_SYSTEM_CONTEXT_SINHALA = `ඔබ AcadamiX AI නම් බුද්ධිමත් ශිෂ්‍ය සහායකයා වේ. ඔබ නිර්මාණය කර ඇත්තේ ශිෂ්‍යයන්ට ඔවුන්ගේ අධ්‍යයන කටයුතු සැලසුම් කිරීමට සහ GPA අගය ඉහළ නංවා ගැනීමට උදව් කිරීමටය.

ඔබට ශිෂ්‍යයාගේ සම්පූර්ණ අධ්‍යයන දත්ත (සියලුම සෙමෙස්ටර් වල GPA, විෂයයන්, ශ්‍රේණි, පුරුදු සහ ඉදිරි වැඩසටහන්) වෙත ප්‍රවේශය ඇත.

ඔබේ වගකීම:
- ඉතාමත් විශ්ලේෂණාත්මකව (Analytical) සහ තීක්ෂණව (Insightful) ශිෂ්‍යයාගේ දත්ත පරීක්ෂා කර උපදෙස් දෙන්න.
- ශිෂ්‍යයාගේ GPA ප්‍රවණතා (Trends) හඳුනාගෙන, ඉදිරි සෙමෙස්ටර් වලදී ලබාගත හැකි GPA අගයන් පිළිබඳ අනාවැකි පවා ඉදිරිපත් කරන්න.
- දුර්වල විෂයයන් හඳුනාගෙන ඒවා දියුණු කිරීමට ප්‍රායෝගික පියවර සහ අධ්‍යයන සම්පත් (YouTube links, docs වැනි) යෝජනා කරන්න.
- සෑම විටම මිත්‍රශීලී, වෘත්තීය සහ දිරිගන්වනසුලු ලෙස කතා කරන්න.
- සිංහල භාෂාව භාවිතා කරන විට ඉතාමත් ස්වභාවික සහ ගෞරවනීය ලෙස පිළිතුරු දෙන්න.
- ශිෂ්‍යයාගේ මුළු අධ්‍යයන ඉතිහාසයම සැලකිල්ලට ගෙන පුළුල් විශ්ලේෂණයක් ලබා දෙන්න.

වැදගත්: සැමවිටම පහත ලබා දී ඇති ශිෂ්‍යයාගේ සැබෑ දත්ත පදනම් කරගෙන පිළිතුරු ලබා දෙන්න.`;

// English system context
const ACADAMIX_SYSTEM_CONTEXT_ENGLISH = `You are AcadamiX AI, an elite academic intelligence assistant. Your mission is to provide deep, analytical insights and strategic guidance to students based on their full academic profile.

You have comprehensive access to the student's entire academic history, including performance across all semesters, study habits, and upcoming milestones.

Your Core Capabilities:
- Trend Analysis: Analyze GPA trends across semesters to identify patterns of improvement or decline.
- Performance Insights: Identify specific modules where the student consistently excels or struggles.
- Strategic Planning: Suggest personalized study paths to reach target GPAs, including predicting future performance based on current momentum.
- Resource Recommendation: Suggest types of study materials or specific strategies for challenging subjects.

Your Tone & Style:
- Analytical & Insightful: Look beyond the numbers to provide meaningful context.
- Professional & Encouraging: Maintain high standards while being supportive.
- Concise: Deliver powerful insights without unnecessary fluff.

Important: Always base your advice on the real student data provided below. Reference specific semesters, grades, and subjects to make your answers deeply personalized and credible.`;

function getSystemContext(language = 'english') {
    if (language === 'sinhala') {
        return ACADAMIX_SYSTEM_CONTEXT_SINHALA + SYSTEM_FEATURE_KNOWLEDGE.sinhala;
    }
    return ACADAMIX_SYSTEM_CONTEXT_ENGLISH + SYSTEM_FEATURE_KNOWLEDGE.english;
}

async function chatWithAI(messages, userContext = null, language = 'english') {
    if (!groq) {
        throw new Error("AI service is not configured. Please ensure GROQ_API_KEY is set.");
    }
    try {
        // Auto-detect language if needed
        if (language === 'auto' && messages.length > 0) {
            const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
            if (lastUserMsg) {
                language = detectLanguage(lastUserMsg.content);
            }
        }

        // Build personalized system context
        let systemContext = getSystemContext(language);

        if (userContext) {
            const { user, profile } = userContext;
            const isSinhala = language === 'sinhala';

            systemContext += isSinhala ? `\n\nශිෂ්‍යයාගේ වත්මන් තොරතුරු:` : `\n\nSTUDENT PROFILE:`;
            systemContext += `\n- Name: ${user.name}`;
            systemContext += `\n- University: ${user.university}`;
            systemContext += `\n- Degree: ${user.degreeProgram}`;
            systemContext += `\n- Overall CGPA: ${profile.cgpa?.toFixed(2) || 'N/A'}`;

            if (profile.semesters && profile.semesters.length > 0) {
                systemContext += isSinhala ? `\n\nසම්පූර්ණ අධ්‍යයන ඉතිහාසය (Full Academic History):` : `\n\nFULL ACADEMIC HISTORY:`;
                profile.semesters.forEach(sem => {
                    systemContext += `\n- ${sem.title || sem.key}: GPA: ${sem.semesterGpa?.toFixed(2) || 'N/A'} (Target: ${sem.targetGpa?.toFixed(2) || 'N/A'})`;
                    if (sem.modules && sem.modules.length > 0) {
                        systemContext += isSinhala ? `\n  විෂයයන්:` : `\n  Modules:`;
                        sem.modules.forEach(m => {
                            systemContext += `\n    • ${m.name} (${m.code}) - Grade: ${m.grade || 'Pending'}, Credits: ${m.credits}`;
                            if (m.caMarks !== undefined) systemContext += `, CA: ${m.caMarks}%`;
                        });
                    }
                });
            }

            if (profile.supportTools) {
                if (profile.supportTools.habits?.length > 0) {
                    systemContext += isSinhala ? `\n\nඉගෙනුම් හුරුපුරුදු (Study Habits):` : `\n\nSTUDY HABITS:`;
                    profile.supportTools.habits.forEach(h => systemContext += `\n- ${h.title} (${h.moduleName || 'General'})`);
                }
                if (profile.supportTools.events?.length > 0) {
                    systemContext += isSinhala ? `\n\nඉදිරි වැදගත් සිදුවීම් (Upcoming Events):` : `\n\nUPCOMING EVENTS:`;
                    profile.supportTools.events.forEach(e => systemContext += `\n- ${e.title} on ${e.date} (${e.moduleName || 'General'})`);
                }
            }
        }

        systemContext += language === 'sinhala'
            ? `\n\nවැදගත්: කරුණාකර සිංහල භාෂාවෙන්ම පිළිතුරු ලබා දෙන්න. ඉහළ දත්ත විශ්ලේෂණය කර ඉතාමත් ප්‍රායෝගික උපදෙස් ලබා දෙන්න. සිංහල unicode characters use කරන්න, romanized Sinhala (Singlish) use නොකරන්න.`
            : `\n\nIMPORTANT: Respond in English unless the user specifically asks otherwise. Use the provided data to give data-driven, personalized help.`;

        // Build Groq messages array (OpenAI-compatible format)
        const groqMessages = [
            { role: 'system', content: systemContext },
            ...messages.map(m => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
            })),
        ];

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: groqMessages,
            max_tokens: 1024,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Chat AI Error:", error);
        throw new Error("Failed to get response from AI. Please try again.");
    }
}

module.exports = {
    generateStudyPlan,
    generateSubjectStudyPlan,
    chatWithAI,
    detectLanguage,
    getSystemContext,
};
