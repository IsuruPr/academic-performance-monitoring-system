function WarningsSection({
  warnings,
  studyTips,
  habits,
  toggleHabit,
  removeHabit,
  habitForm,
  setHabitForm,
  addHabit,
  todayEvents,
  upcomingEvents,
  removeEvent,
  eventForm,
  setEventForm,
  addEvent,
  chatMessages,
  chatInput,
  setChatInput,
  sendCoachMessage,
  chatLoading,
}) {
  const completedCount = habits.filter(h => h.completed).length;
  const completionPct = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const toneConfig = {
    danger:  { bg: "bg-red-500/10",    border: "border-red-500/25",    text: "text-red-400",    icon: "⛔", dot: "bg-red-500" },
    warning: { bg: "bg-amber-500/10",  border: "border-amber-500/25",  text: "text-amber-400",  icon: "⚠️", dot: "bg-amber-500" },
    neutral: { bg: "bg-white/[0.04]",  border: "border-white/10",      text: "text-white/60",   icon: "ℹ️", dot: "bg-white/40" },
    success: { bg: "bg-emerald-500/10",border: "border-emerald-500/25",text: "text-emerald-400",icon: "✅", dot: "bg-emerald-500" },
    info:    { bg: "bg-blue-500/10",   border: "border-blue-500/25",   text: "text-blue-400",   icon: "💡", dot: "bg-blue-500" },
  };

  const daysUntil = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
    return diff;
  };

  const eventTypeColor = { Exam: "text-red-400 bg-red-500/10 border-red-500/20", Quiz: "text-amber-400 bg-amber-500/10 border-amber-500/20", Presentation: "text-purple-400 bg-purple-500/10 border-purple-500/20", Assignment: "text-blue-400 bg-blue-500/10 border-blue-500/20" };

  return (
    <section className="flex flex-col gap-8">

      {/* ── WARNINGS ── */}
      <div>
        <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
          <span className="text-amber-400">⚡</span> Academic Warnings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warnings.map((w) => {
            const cfg = toneConfig[w.tone] || toneConfig.neutral;
            return (
              <div key={w.title} className={`rounded-2xl p-5 border ${cfg.bg} ${cfg.border} flex gap-4`}>
                <span className="text-2xl shrink-0 mt-0.5">{cfg.icon}</span>
                <div>
                  <p className={`font-black text-base mb-1 ${cfg.text}`}>{w.title}</p>
                  <p className="text-white/55 text-base leading-relaxed">{w.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STUDY TIPS ── */}
      {studyTips.length > 0 && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">💡</span> Smart Study Tips
          </h3>
          <ul className="flex flex-col gap-3">
            {studyTips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-base text-white/65 leading-relaxed">
                <span className="text-cyan-400 font-black shrink-0 mt-0.5">{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── HABIT TRACKER ── */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span className="text-emerald-400">🎯</span> Habit Tracker
            </h3>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${completionPct}%` }} />
              </div>
              <span className="text-sm font-black text-emerald-400">{completedCount}/{habits.length}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {habits.map((habit) => (
              <div key={habit.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${habit.completed ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/[0.03] border-white/[0.06] hover:border-white/10"}`}>
                <button onClick={() => toggleHabit(habit.id)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${habit.completed ? "bg-emerald-500 border-emerald-500" : "border-white/20 hover:border-emerald-500"}`}>
                  {habit.completed && <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-base font-bold truncate ${habit.completed ? "line-through text-white/40" : "text-white"}`}>{habit.title}</p>
                  <p className="text-xs text-white/35 font-medium mt-0.5">
                    {habit.moduleName || "General"} · {habit.category} · {habit.targetMinutes}min · {habit.preferredTime || "Any time"}
                  </p>
                </div>
                <button onClick={() => removeHabit(habit.id)} className="text-white/20 hover:text-red-400 transition-colors shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Add Habit Form */}
          <form onSubmit={addHabit} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-sm font-black text-white/40 uppercase tracking-widest">Add Habit</p>
            <input type="text" placeholder="Habit title" value={habitForm.title}
              onChange={e => setHabitForm({ ...habitForm, title: e.target.value })}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-base text-white outline-none focus:border-emerald-500 transition-colors placeholder-white/20" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Module name" value={habitForm.moduleName}
                onChange={e => setHabitForm({ ...habitForm, moduleName: e.target.value })}
                className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-base text-white outline-none focus:border-emerald-500 transition-colors placeholder-white/20" />
              <select value={habitForm.category} onChange={e => setHabitForm({ ...habitForm, category: e.target.value })}
                className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-base text-white outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer">
                <option value="Revision">Revision</option>
                <option value="Practice">Practice</option>
                <option value="Reading">Reading</option>
                <option value="Focus">Focus</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" min="5" step="5" placeholder="Minutes" value={habitForm.targetMinutes}
                onChange={e => setHabitForm({ ...habitForm, targetMinutes: Number(e.target.value) || 0 })}
                className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-base text-white outline-none focus:border-emerald-500 transition-colors" />
              <input type="time" value={habitForm.preferredTime}
                onChange={e => setHabitForm({ ...habitForm, preferredTime: e.target.value })}
                className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-base text-white outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <button type="submit" className="w-full bg-emerald-500 text-black rounded-xl py-3 text-base font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">
              + Add Habit
            </button>
          </form>
        </div>

        {/* ── EVENTS ── */}
        <div className="flex flex-col gap-5">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span className="text-purple-400">📅</span> Upcoming Events
          </h3>

          {todayEvents.length > 0 && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/25 p-4 flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="text-red-400 font-black text-base">Today!</p>
                <p className="text-white/70 text-base">{todayEvents[0].title} — {todayEvents[0].moduleName || "General"}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 6).map((ev) => {
              const days = daysUntil(ev.date);
              const typeStyle = eventTypeColor[ev.type] || "text-white/60 bg-white/5 border-white/10";
              return (
                <div key={ev.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all group">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] shrink-0">
                    <span className="text-white font-black text-lg leading-none">{days !== null ? (days === 0 ? "!" : days) : "?"}</span>
                    <span className="text-white/30 text-[9px] font-bold uppercase">{days === 0 ? "today" : "days"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-white truncate">{ev.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${typeStyle}`}>{ev.type}</span>
                      <span className="text-xs text-white/35">{ev.moduleName || "General"} · {ev.date}</span>
                    </div>
                  </div>
                  <button onClick={() => removeEvent(ev.id)} className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              );
            }) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-white/30 text-base font-medium">
                No upcoming events. Add your exams and deadlines below.
              </div>
            )}
          </div>

          {/* Add Event Form */}
          <form onSubmit={addEvent} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-sm font-black text-white/40 uppercase tracking-widest">Add Event</p>
            <input type="text" placeholder="Event title" value={eventForm.title}
              onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-base text-white outline-none focus:border-purple-500 transition-colors placeholder-white/20" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Module name" value={eventForm.moduleName}
                onChange={e => setEventForm({ ...eventForm, moduleName: e.target.value })}
                className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-base text-white outline-none focus:border-purple-500 transition-colors placeholder-white/20" />
              <select value={eventForm.type} onChange={e => setEventForm({ ...eventForm, type: e.target.value })}
                className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-base text-white outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer">
                <option value="Exam">Exam</option>
                <option value="Quiz">Quiz</option>
                <option value="Presentation">Presentation</option>
                <option value="Assignment">Assignment</option>
              </select>
            </div>
            <input type="date" value={eventForm.date}
              onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-base text-white outline-none focus:border-purple-500 transition-colors" />
            <button type="submit" className="w-full bg-purple-500 text-white rounded-xl py-3 text-base font-black uppercase tracking-widest hover:bg-purple-400 transition-all">
              + Add Event
            </button>
          </form>
        </div>
      </div>

      {/* ── AI COACH CHAT ── */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-lg">🤖</div>
          <div>
            <p className="text-base font-black text-white">AI Study Coach</p>
            <p className="text-xs text-white/35 font-medium">Ask about habits, exams, or how to improve</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-black text-white/30 uppercase tracking-widest">Live</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-5 max-h-72 overflow-y-auto">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-base leading-relaxed ${
                msg.role === "user"
                  ? "bg-cyan-500 text-black font-semibold rounded-br-sm"
                  : "bg-white/[0.06] border border-white/[0.08] text-white/80 rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={sendCoachMessage} className="flex gap-3 p-4 border-t border-white/[0.06]">
          <input type="text" placeholder="Ask: how can I improve this semester?" value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-base text-white outline-none focus:border-cyan-500 transition-colors placeholder-white/20" />
          <button type="submit" disabled={chatLoading}
            className="px-5 py-3 bg-cyan-500 text-black rounded-xl text-base font-black uppercase tracking-wider hover:bg-cyan-400 transition-all disabled:opacity-50 shrink-0">
            {chatLoading ? "..." : "Send"}
          </button>
        </form>
      </div>

    </section>
  );
}

export default WarningsSection;
