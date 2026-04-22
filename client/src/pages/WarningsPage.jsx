import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import WarningsSection from "../components/WarningsSection";
import { buildDefaultSemesters } from "../data/template";
import { calculateMetrics } from "../utils/gpa";
import { buildAcademicWarnings } from "../utils/insights";
import { buildStudyTips, defaultHabits, getTodayEvents, getUpcomingEvents } from "../utils/coach";

export default function WarningsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [faculty, setFaculty] = useState("Faculty of Computing");
  const [program, setProgram] = useState("BSc (Hons) in Information Technology - Information Technology");
  const [semesters, setSemesters] = useState(buildDefaultSemesters());
  const [habits, setHabits] = useState(defaultHabits);
  const [events, setEvents] = useState([]);
  
  const [habitForm, setHabitForm] = useState({
    title: "",
    moduleName: "",
    category: "Revision",
    targetMinutes: 30,
    preferredTime: "19:00",
  });
  
  const [eventForm, setEventForm] = useState({
    title: "Final Exam",
    moduleName: "",
    date: "",
    type: "Exam",
  });
  
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: "coach-welcome",
      role: "assistant",
      text: "Ask me how to improve this semester, what your next exam is, or what study habit to do today.",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get("/profile");
        setFaculty(data.faculty || "Faculty of Computing");
        setProgram(data.program || "BSc (Hons) in Information Technology - Information Technology");
        setSemesters(data.semesters?.length ? data.semesters : buildDefaultSemesters());
        setHabits(data.supportTools?.habits?.length ? data.supportTools.habits : defaultHabits);
        setEvents(data.supportTools?.events?.length ? data.supportTools.events : []);
      } catch (requestError) {
        if (requestError.response?.status !== 401) {
          setError("Could not load saved GPA data. Starting with a blank template.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  const metrics = useMemo(() => calculateMetrics(semesters), [semesters]);
  const warnings = useMemo(() => buildAcademicWarnings(metrics), [metrics]);
  const studyTips = useMemo(() => buildStudyTips(metrics, warnings, habits, events), [events, habits, metrics, warnings]);
  const upcomingEvents = useMemo(() => getUpcomingEvents(events), [events]);
  const todayEvents = useMemo(() => getTodayEvents(events), [events]);

  const toggleHabit = async (habitId) => {
    const updated = habits.map(h => h.id === habitId ? { ...h, completed: !h.completed } : h);
    setHabits(updated);
    try { await api.put("/profile/habits", { habits: updated }); } catch (_) {}
  };

  const addHabit = async (event) => {
    event.preventDefault();
    if (!habitForm.title.trim()) return;
    const updated = [...habits, {
      id: `habit-${Date.now()}`,
      title: habitForm.title.trim(),
      moduleName: habitForm.moduleName.trim(),
      category: habitForm.category,
      targetMinutes: Number(habitForm.targetMinutes) || 0,
      preferredTime: habitForm.preferredTime,
      completed: false,
    }];
    setHabits(updated);
    setHabitForm({ title: "", moduleName: "", category: "Revision", targetMinutes: 30, preferredTime: "19:00" });
    try { await api.put("/profile/habits", { habits: updated }); } catch (_) {}
  };

  const removeHabit = async (habitId) => {
    const updated = habits.filter(h => h.id !== habitId);
    setHabits(updated);
    try { await api.put("/profile/habits", { habits: updated }); } catch (_) {}
  };

  const addEvent = async (event) => {
    event.preventDefault();
    if (!eventForm.title || !eventForm.date) return;
    const updated = [...events, { id: `${Date.now()}`, title: eventForm.title, moduleName: eventForm.moduleName, date: eventForm.date, type: eventForm.type }];
    setEvents(updated);
    setEventForm({ title: "Final Exam", moduleName: "", date: "", type: "Exam" });
    try { await api.put("/profile/events", { events: updated }); } catch (_) {}
  };

  const removeEvent = async (eventId) => {
    const updated = events.filter(ev => ev.id !== eventId);
    setEvents(updated);
    try { await api.put("/profile/events", { events: updated }); } catch (_) {}
  };

  const sendCoachMessage = async (event) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const userMessage = { id: `user-${Date.now()}`, role: "user", text };
    setChatMessages(current => [...current, userMessage]);
    setChatInput("");

    try {
      setChatLoading(true);
      // Build message history for context
      const history = [...chatMessages, userMessage]
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role, content: m.text }));

      const { data } = await api.post("/ai/chat", { messages: history, language: "auto" });
      setChatMessages(current => [...current, { id: `coach-${Date.now()}`, role: "assistant", text: data.reply }]);
    } catch {
      setChatMessages(current => [...current, { id: `error-${Date.now()}`, role: "assistant", text: "Sorry, I'm currently unavailable. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden text-white pt-16 flex items-center justify-center">
        <div className="rounded-3xl border border-[#333333] bg-[#1a1a1a] p-10 shadow-2xl flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 border-4 border-[#333333] border-t-amber-500 rounded-full animate-spin"></div>
          <div className="text-sm font-bold text-white/60 uppercase tracking-widest">Loading tools…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden pt-16 p-6 font-sans text-white selection:bg-amber-500 selection:text-black animate-fade-in">
      <div className="max-w-6xl mx-auto relative z-10 pt-10 pb-12">
        <div className="mb-10 text-center animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-5 tracking-tight drop-shadow-xl">
            Habits & <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-500 via-orange-400 to-yellow-200">Alerts</span>
          </h1>
          <p className="text-xl text-white/60 font-medium max-w-2xl mx-auto text-balance">
            Track your study habits, monitor upcoming exams, and get AI-driven academic warnings to stay on track.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-center font-bold">
            {error}
          </div>
        )}

        <div className="glass-dark rounded-3xl p-8 mb-8 animate-slide-up stagger-2 border-[#333333]">
          <WarningsSection
            warnings={warnings}
            studyTips={studyTips}
            habits={habits}
            toggleHabit={toggleHabit}
            removeHabit={removeHabit}
            habitForm={habitForm}
            setHabitForm={setHabitForm}
            addHabit={addHabit}
            todayEvents={todayEvents}
            upcomingEvents={upcomingEvents}
            removeEvent={removeEvent}
            eventForm={eventForm}
            setEventForm={setEventForm}
            addEvent={addEvent}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            sendCoachMessage={sendCoachMessage}
            chatLoading={chatLoading}
          />
        </div>

        <div className="flex justify-center gap-4 animate-slide-up stagger-3">
          <button 
            className="px-8 py-4 rounded-xl font-extrabold text-amber-500 border border-amber-500/30 hover:bg-amber-500/10 transition-all uppercase tracking-widest shadow-sm"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
