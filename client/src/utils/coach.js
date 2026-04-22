const todayDateString = () => new Date().toISOString().slice(0, 10);

export const defaultHabits = [
  {
    id: "habit-1",
    title: "Review lecture notes",
    moduleName: "Current Semester Module",
    category: "Revision",
    targetMinutes: 30,
    preferredTime: "19:00",
    completed: false,
  },
  {
    id: "habit-2",
    title: "Practice one quiz or past paper",
    moduleName: "Current Semester Module",
    category: "Practice",
    targetMinutes: 45,
    preferredTime: "20:00",
    completed: false,
  },
  {
    id: "habit-3",
    title: "Revise weak topic summary",
    moduleName: "Weakest Module",
    category: "Focus",
    targetMinutes: 25,
    preferredTime: "21:00",
    completed: false,
  },
];

export const sortEvents = (events) =>
  [...events].sort((left, right) => new Date(left.date || "2100-01-01") - new Date(right.date || "2100-01-01"));

export const getUpcomingEvents = (events) =>
  sortEvents(events).filter((event) => event.date && event.date >= todayDateString());

export const getTodayEvents = (events) => events.filter((event) => event.date === todayDateString());

export const buildStudyTips = (metrics, warnings, habits, events) => {
  const tips = [];
  const incompleteModules = metrics.semesters.flatMap((semester) =>
    semester.modules.filter((module) => Number(module.credits) > 0 && !module.grade),
  );
  const upcomingEvents = getUpcomingEvents(events);
  const completedHabits = habits.filter((habit) => habit.completed).length;

  if (warnings.some((warning) => warning.tone === "danger")) {
    tips.push("Focus first on low-performing or incomplete modules. High-credit weak modules should get the most study time.");
  }

  if (incompleteModules.length > 0) {
    tips.push(`You still have ${incompleteModules.length} module(s) without final grades. Start revision with those current-semester subjects.`);
  }

  if (upcomingEvents.length > 0) {
    const nextEvent = upcomingEvents[0];
    tips.push(`Your next event is ${nextEvent.title} for ${nextEvent.moduleName || "a module"} on ${nextEvent.date}. Prepare at least two days early.`);
  }

  const totalMinutes = habits.reduce((sum, habit) => sum + (Number(habit.targetMinutes) || 0), 0);

  if (completedHabits < 2) {
    tips.push("Build consistency: complete at least two daily study habits before ending the day.");
  }

  if (totalMinutes > 0) {
    tips.push(`Your planned study habit load is ${totalMinutes} minutes. Spread it across short focused sessions instead of one long block.`);
  }

  if (tips.length === 0) {
    tips.push("Your current semester plan looks stable. Keep daily revision active and review before each event.");
  }

  return tips;
};

export const generateCoachReply = ({ message, metrics, warnings, habits, events }) => {
  const normalized = message.trim().toLowerCase();
  const upcomingEvents = getUpcomingEvents(events);
  const todayEvents = getTodayEvents(events);
  const completedHabits = habits.filter((habit) => habit.completed).length;

  if (!normalized) {
    return "Ask about study tips, next exam, habits, or how to improve this semester.";
  }

  if (normalized.includes("event") || normalized.includes("exam") || normalized.includes("date")) {
    if (todayEvents.length > 0) {
      return `You have ${todayEvents.length} event(s) today. The nearest one is ${todayEvents[0].title} for ${todayEvents[0].moduleName || "your module"} today.`;
    }

    if (upcomingEvents.length > 0) {
      const nextEvent = upcomingEvents[0];
      return `Your next event is ${nextEvent.title} for ${nextEvent.moduleName || "a module"} on ${nextEvent.date}. Start revision now and solve one past-paper style question today.`;
    }

    return "No upcoming academic events are saved yet. Add your final exam, quiz, or presentation dates in the event form.";
  }

  if (normalized.includes("habit") || normalized.includes("routine")) {
    return `You completed ${completedHabits} habit(s) today. Aim for at least one revision habit, one practice habit, and one module-focused session before the day ends.`;
  }

  if (normalized.includes("improve") || normalized.includes("warning") || normalized.includes("semester")) {
    const highRiskWarning = warnings.find((warning) => warning.tone === "danger" || warning.tone === "warning");
    if (highRiskWarning) {
      return `${highRiskWarning.detail} Practical step: spend the next study session on the weakest current-semester module and finish one active recall summary.`;
    }

    return "To improve this semester, keep daily study habits active, review incomplete modules first, and prepare early for upcoming events.";
  }

  if (normalized.includes("cgpa") || normalized.includes("gpa")) {
    return `Your current CGPA is ${metrics.cgpa.toFixed(2)} and WGPA is ${metrics.wgpa.toFixed(2)}. Improving strong-credit current-semester modules will have the best effect.`;
  }

  return "Study coach suggestion: review the weakest current-semester module first, complete at least two habits today, and check the next event deadline before planning your evening.";
};
