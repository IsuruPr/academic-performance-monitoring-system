import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Radar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const CHART_DEFAULTS = {
  color: "rgba(255,255,255,0.6)",
  borderColor: "rgba(255,255,255,0.1)",
};

ChartJS.defaults.color = CHART_DEFAULTS.color;
ChartJS.defaults.borderColor = CHART_DEFAULTS.borderColor;

export default function CAGraphComparison({ whatIfConfig, whatIfVisuals, whatIfResult }) {
  const labels = whatIfVisuals.map((a) => a.name || "Task");

  // ─── Bar Chart: Actual vs Needed per assessment ──────────────────────────
  const barData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: "Actual Mark (%)",
        data: whatIfVisuals.map((a) => (a.completed ? a.actualMark : null)),
        backgroundColor: "rgba(34, 211, 238, 0.7)",
        borderColor: "rgba(34, 211, 238, 1)",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: "Target Needed (%)",
        data: whatIfVisuals.map((a) => (!a.completed ? Math.min(100, a.neededMark) : null)),
        backgroundColor: "rgba(251, 146, 60, 0.7)",
        borderColor: "rgba(251, 146, 60, 1)",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }), [whatIfVisuals, labels]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "rgba(255,255,255,0.7)",
          font: { weight: "bold", size: 12 },
          usePointStyle: true,
          pointStyle: "rectRounded",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15,15,15,0.95)",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.7)",
        padding: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw ?? "N/A"}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "rgba(255,255,255,0.6)", font: { weight: "bold" } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: {
          color: "rgba(255,255,255,0.6)",
          font: { weight: "bold" },
          callback: (v) => v + "%",
        },
      },
    },
  };

  // ─── Radar Chart: Actual vs Needed across all assessments ────────────────
  const radarData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: "Actual Marks",
        data: whatIfVisuals.map((a) => (a.completed ? a.actualMark : 0)),
        backgroundColor: "rgba(59, 130, 246, 0.25)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(59,130,246,1)",
        pointRadius: 5,
        fill: true,
      },
      {
        label: "Target / Needed",
        data: whatIfVisuals.map((a) =>
          a.completed ? a.actualMark : Math.min(100, a.neededMark)
        ),
        backgroundColor: "rgba(168, 85, 247, 0.2)",
        borderColor: "rgba(168, 85, 247, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(168, 85, 247, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(168,85,247,1)",
        pointRadius: 5,
        fill: true,
      },
    ],
  }), [whatIfVisuals, labels]);

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "rgba(255,255,255,0.7)",
          font: { weight: "bold", size: 12 },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15,15,15,0.95)",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.7)",
        padding: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw?.toFixed(1)}%`,
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        grid: { color: "rgba(255,255,255,0.08)" },
        angleLines: { color: "rgba(255,255,255,0.08)" },
        ticks: {
          color: "rgba(255,255,255,0.5)",
          backdropColor: "transparent",
          font: { size: 10, weight: "bold" },
          stepSize: 25,
          callback: (v) => v + "%",
        },
        pointLabels: {
          color: "rgba(255,255,255,0.7)",
          font: { weight: "bold", size: 11 },
        },
      },
    },
  };

  // ─── Doughnut: Progress vs Remaining ─────────────────────────────────────
  const completedWeight = whatIfVisuals
    .filter((a) => a.completed)
    .reduce((s, a) => s + a.weight, 0);
  const pendingWeight = whatIfResult.remainingWeight;
  const achievedMark = whatIfResult.currentWeightedScore;
  const targetMark = Number(whatIfConfig.targetOverallMark) || 0;
  const gap = Math.max(0, targetMark - achievedMark);
  const surplus = Math.max(0, achievedMark - targetMark);

  const doughnutData = useMemo(() => ({
    labels: [
      "Achieved So Far",
      surplus > 0 ? "Surplus (Exceeded Target)" : "Gap to Target",
      "Remaining Weight",
    ],
    datasets: [
      {
        data: [
          Math.min(achievedMark, targetMark),
          surplus > 0 ? surplus : gap,
          pendingWeight,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.85)",
          surplus > 0 ? "rgba(59, 130, 246, 0.85)" : "rgba(239, 68, 68, 0.7)",
          "rgba(255,255,255,0.08)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          surplus > 0 ? "rgba(59, 130, 246, 1)" : "rgba(239, 68, 68, 1)",
          "rgba(255,255,255,0.15)",
        ],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  }), [achievedMark, targetMark, gap, surplus, pendingWeight]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "rgba(255,255,255,0.7)",
          font: { weight: "bold", size: 11 },
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15,15,15,0.95)",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.7)",
        padding: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw?.toFixed(1)}%`,
        },
      },
    },
  };

  // ─── Weight Contribution Bar ──────────────────────────────────────────────
  const weightBarData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: "Assessment Weight (%)",
        data: whatIfVisuals.map((a) => a.weight),
        backgroundColor: whatIfVisuals.map((a) =>
          a.completed
            ? "rgba(34, 211, 238, 0.75)"
            : "rgba(168, 85, 247, 0.55)"
        ),
        borderColor: whatIfVisuals.map((a) =>
          a.completed ? "rgba(34, 211, 238, 1)" : "rgba(168, 85, 247, 1)"
        ),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }), [whatIfVisuals, labels]);

  const weightBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15,15,15,0.95)",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.7)",
        padding: 12,
        callbacks: {
          label: (ctx) => ` Weight: ${ctx.raw}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "rgba(255,255,255,0.6)", font: { weight: "bold" } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: {
          color: "rgba(255,255,255,0.6)",
          font: { weight: "bold" },
          callback: (v) => v + "%",
        },
      },
    },
  };

  const statRows = [
    {
      label: "Achieved Mark",
      value: achievedMark.toFixed(1) + "%",
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/30",
    },
    {
      label: "Target Mark",
      value: targetMark.toFixed(1) + "%",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30",
    },
    {
      label: surplus > 0 ? "Surplus" : "Gap to Target",
      value: (surplus > 0 ? "+" : "-") + (surplus > 0 ? surplus : gap).toFixed(1) + "%",
      color: surplus > 0 ? "text-cyan-400" : "text-red-400",
      bg: surplus > 0 ? "bg-cyan-500/10 border-cyan-500/30" : "bg-red-500/10 border-red-500/30",
    },
    {
      label: "Remaining Weight",
      value: pendingWeight.toFixed(0) + "%",
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/30",
    },
    {
      label: "Completed Weight",
      value: completedWeight.toFixed(0) + "%",
      color: "text-white",
      bg: "bg-white/5 border-white/10",
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Graph Comparison</h3>
          <p className="text-xs text-white/40 font-medium mt-0.5">Visual breakdown of your CA performance vs targets</p>
        </div>
      </div>

      {/* Summary Stat Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statRows.map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 flex flex-col items-center text-center ${s.bg}`}>
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">{s.label}</span>
            <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Row 1: Bar + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Actual vs Needed — Bar Chart */}
        <div className="glass-dark rounded-3xl p-7 border border-white/5 hover:border-cyan-500/20 transition-all flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
            <h4 className="text-base font-bold text-white">Actual vs Target Needed</h4>
          </div>
          <p className="text-xs text-white/40 font-medium -mt-2">Per-assessment mark breakdown</p>
          <div className="h-56">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Radar Chart */}
        <div className="glass-dark rounded-3xl p-7 border border-white/5 hover:border-purple-500/20 transition-all flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
            <h4 className="text-base font-bold text-white">Performance Radar</h4>
          </div>
          <p className="text-xs text-white/40 font-medium -mt-2">Actual vs required across all components</p>
          <div className="h-56">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
      </div>

      {/* Row 2: Doughnut + Weight Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Target Achievement Doughnut */}
        <div className="glass-dark rounded-3xl p-7 border border-white/5 hover:border-green-500/20 transition-all flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.7)]" />
            <h4 className="text-base font-bold text-white">Target Achievement</h4>
          </div>
          <p className="text-xs text-white/40 font-medium -mt-2">Your progress toward the overall target</p>
          <div className="relative h-56 flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            {/* Center label */}
            <div className="absolute pointer-events-none flex flex-col items-center">
              <span className="text-2xl font-black text-white">{achievedMark.toFixed(1)}%</span>
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Achieved</span>
            </div>
          </div>
        </div>

        {/* Assessment Weight Bar */}
        <div className="glass-dark rounded-3xl p-7 border border-white/5 hover:border-blue-500/20 transition-all flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.7)]" />
            <h4 className="text-base font-bold text-white">Assessment Weight Distribution</h4>
          </div>
          <p className="text-xs text-white/40 font-medium -mt-2">
            <span className="inline-flex items-center gap-1.5 mr-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Completed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Pending
            </span>
          </p>
          <div className="h-56">
            <Bar data={weightBarData} options={weightBarOptions} />
          </div>
        </div>
      </div>

      {/* Scenario Comparison Table */}
      <div className="glass-dark rounded-3xl p-7 border border-white/5 hover:border-white/10 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
          <h4 className="text-base font-bold text-white">Assessment Scenario Comparison</h4>
        </div>
        <p className="text-xs text-white/40 font-medium mb-5">Detailed breakdown of what you scored vs what you need</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-widest text-white/40">Assessment</th>
                <th className="text-center py-3 px-3 text-xs font-bold uppercase tracking-widest text-white/40">Weight</th>
                <th className="text-center py-3 px-3 text-xs font-bold uppercase tracking-widest text-cyan-400">Actual</th>
                <th className="text-center py-3 px-3 text-xs font-bold uppercase tracking-widest text-amber-400">Target Needed</th>
                <th className="text-center py-3 px-3 text-xs font-bold uppercase tracking-widest text-white/40">Status</th>
                <th className="text-center py-3 px-3 text-xs font-bold uppercase tracking-widest text-green-400">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {whatIfVisuals.map((a) => {
                const delta = a.completed ? a.actualMark - Math.min(100, a.neededMark) : null;
                return (
                  <tr key={a.id} className="hover:bg-white/3 transition-colors group">
                    <td className="py-3 px-3 font-bold text-white/80 group-hover:text-white transition-colors">{a.name}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white font-mono font-bold text-xs">
                        {a.weight}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {a.completed ? (
                        <span className="font-black text-cyan-400">{a.actualMark.toFixed(1)}%</span>
                      ) : (
                        <span className="text-white/20 font-bold">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {!a.completed ? (
                        <span className={`font-black ${a.neededMark > 100 ? "text-red-400" : "text-amber-400"}`}>
                          {Math.min(100, a.neededMark).toFixed(1)}%
                          {a.neededMark > 100 && <span className="text-red-400 ml-1 text-[10px]">!!!</span>}
                        </span>
                      ) : (
                        <span className="text-white/20 font-bold">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {a.completed ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          delta !== null && delta >= 0
                            ? "bg-green-500/10 border-green-500/30 text-green-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}>
                          {delta !== null && delta >= 0 ? `+${delta.toFixed(1)}` : delta?.toFixed(1)} Done
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-500/10 border-amber-400/30 text-amber-400">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-black ${a.completed ? "text-green-400" : "text-white/30"}`}>
                        {a.completed ? `${a.weightedContribution.toFixed(2)}%` : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-white/10">
                <td className="py-3 px-3 font-black text-white text-xs uppercase tracking-widest" colSpan={2}>Totals</td>
                <td className="py-3 px-3 text-center font-black text-cyan-400">—</td>
                <td className="py-3 px-3 text-center font-black text-amber-400">—</td>
                <td className="py-3 px-3" />
                <td className="py-3 px-3 text-center font-black text-green-400">
                  {achievedMark.toFixed(2)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
