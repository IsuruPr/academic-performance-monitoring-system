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
                backgroundColor: ["rgba(163, 163, 163, 0.5)", "rgba(34, 197, 94, 0.8)"],
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
                ticks: { color: 'rgba(255, 255, 255, 0.5)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            x: {
                ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                grid: { display: false }
            }
        },
    };

    // ===== RADAR CHART (Subject Analysis) =====
    const radarData = {
        labels: subjects.map((s) => s.subjectName),
        datasets: [
            {
                label: "Required Final",
                data: subjects.map((s) => s.requiredFinal),
                backgroundColor: "rgba(34, 197, 94, 0.2)",
                borderColor: "rgba(34, 197, 94, 0.8)",
                pointBackgroundColor: "rgba(34, 197, 94, 1)",
                borderWidth: 2,
            },
        ],
    };

    const radarOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: { color: 'rgba(255, 255, 255, 0.7)' }
            }
        },
        scales: {
            r: {
                beginAtZero: true,
                suggestedMax: 100,
                ticks: { color: 'rgba(255, 255, 255, 0.5)', backdropColor: 'transparent' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: { color: 'rgba(255, 255, 255, 0.7)' }
            },
        },
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-[#333333] bg-[#1a1a1a] p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#22c55e]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <h3 className="mb-4 text-lg font-extrabold text-white relative z-10">
                    GPA Progress
                </h3>
                <div className="relative z-10"><Bar data={barData} options={barOptions} /></div>
            </div>

            <div className="rounded-3xl border border-[#333333] bg-[#1a1a1a] p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#22c55e]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <h3 className="mb-4 text-lg font-extrabold text-white relative z-10">
                    Subject Final Requirement Radar
                </h3>
                <div className="relative z-10"><Radar data={radarData} options={radarOptions} /></div>
            </div>
        </div>
    );
}