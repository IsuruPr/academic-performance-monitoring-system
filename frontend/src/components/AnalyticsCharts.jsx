import {
  Chart as ChartJS,
  RadialLinearScale,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar, Bar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function AnalyticsCharts({ plan }) {
  if (!plan) return null;

  const subjects = plan.requiredFinals ?? [];

  // ===== BAR CHART (GPA Progress) =====
  const barData = {
    labels: ["Current GPA", "Target GPA"],
    datasets: [
      {
        label: "GPA",
        data: [plan.currentGpa, plan.targetGpa],
        backgroundColor: ["#2563EB", "#1E3A8A"],
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        max: 4,
      },
    },
  };

  // ===== RADAR CHART (Subject Analysis) =====
  const radarData = {
    labels: subjects.map((s) => s.subjectName),
    datasets: [
      {
        label: "Required Final",
        data: subjects.map((s) => s.requiredFinal),
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        borderColor: "#2563EB",
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        suggestedMax: 100,
      },
    },
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#0F172A]">
          GPA Progress
        </h3>
        <Bar data={barData} options={barOptions} />
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#0F172A]">
          Subject Final Requirement Radar
        </h3>
        <Radar data={radarData} options={radarOptions} />
      </div>
    </div>
  );
}