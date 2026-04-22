import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import AnalyticsSection from "../components/AnalyticsSection";
import { buildDefaultSemesters, yearWeights } from "../data/template";
import { calculateMetrics } from "../utils/gpa";

export default function RiskAnalyzerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [semesters, setSemesters] = useState(buildDefaultSemesters());
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get("/profile");
        setSemesters(data.semesters?.length ? data.semesters : buildDefaultSemesters());
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

  const yearAverages = useMemo(() => {
    return Object.keys(yearWeights).map((yearKey) => {
      const year = Number(yearKey);
      const yearSemesters = metrics.semesters.filter((semester) => semester.year === year);
      const totalCredits = yearSemesters.reduce((sum, semester) => sum + semester.semesterCredits, 0);
      const weightedGpa = yearSemesters.reduce(
        (sum, semester) => sum + semester.semesterGpa * semester.semesterCredits,
        0,
      );

      return {
        year,
        credits: totalCredits,
        average: totalCredits > 0 ? weightedGpa / totalCredits : 0,
      };
    });
  }, [metrics.semesters]);

  const analyticsProjection = useMemo(() => {
    const completedSemesters = metrics.semesters.filter((semester) => semester.semesterCredits > 0);
    const lastSemester = completedSemesters.at(-1);
    const previousSemester = completedSemesters.at(-2);
    const recentAverage =
      completedSemesters.length > 0
        ? completedSemesters.reduce((sum, semester) => sum + semester.semesterGpa, 0) / completedSemesters.length
        : 0;
    const trendBoost =
      lastSemester && previousSemester ? (lastSemester.semesterGpa - previousSemester.semesterGpa) * 0.35 : 0;
    const predictedNextSemesterGpa = Math.max(0, Math.min(4, recentAverage + trendBoost));
    const nextSemesterCredits = lastSemester?.semesterCredits || 20;
    const projectedCgpa = metrics.totalCredits
      ? ((metrics.cgpa * metrics.totalCredits) + predictedNextSemesterGpa * nextSemesterCredits) /
        (metrics.totalCredits + nextSemesterCredits)
      : predictedNextSemesterGpa;

    return {
      predictedNextSemesterGpa,
      nextSemesterCredits,
      projectedCgpa,
      predictedMark: predictedNextSemesterGpa * 25,
      recentAverage,
    };
  }, [metrics.cgpa, metrics.semesters, metrics.totalCredits]);

  const gradeDistribution = useMemo(() => {
    const buckets = {
      "A Range": 0,
      "B Range": 0,
      "C Range": 0,
      "D / E Range": 0,
    };

    metrics.semesters.forEach((semester) => {
      semester.modules.forEach((module) => {
        if (!module.grade) {
          return;
        }

        if (["A+", "A", "A-"].includes(module.grade)) {
          buckets["A Range"] += 1;
        } else if (["B+", "B", "B-"].includes(module.grade)) {
          buckets["B Range"] += 1;
        } else if (["C+", "C", "C-"].includes(module.grade)) {
          buckets["C Range"] += 1;
        } else {
          buckets["D / E Range"] += 1;
        }
      });
    });

    const total = Object.values(buckets).reduce((sum, count) => sum + count, 0) || 1;

    return Object.entries(buckets).map(([label, count]) => ({
      label,
      count,
      percentage: (count / total) * 100,
    }));
  }, [metrics.semesters]);

  const creditByYear = useMemo(() => {
    return Object.keys(yearWeights).map((yearKey) => {
      const year = Number(yearKey);
      const yearSemesters = metrics.semesters.filter((semester) => semester.year === year);
      const credits = yearSemesters.reduce((sum, semester) => sum + semester.semesterCredits, 0);

      return {
        year,
        credits,
        percentage: Math.min(100, (credits / 40) * 100),
      };
    });
  }, [metrics.semesters]);

  const analyticsNotes = useMemo(() => {
    const notes = [];

    if (analyticsProjection.predictedNextSemesterGpa >= 3.3) {
      notes.push("Your trend suggests a strong next semester if current performance consistency is maintained.");
    } else if (analyticsProjection.predictedNextSemesterGpa >= 2.5) {
      notes.push("Your projection is stable, but stronger performance in key modules is needed for upper-class improvement.");
    } else {
      notes.push("The current trend predicts a weak next semester. Early intervention is recommended before exams start.");
    }

    const strongestBucket = gradeDistribution.reduce(
      (best, bucket) => (bucket.count > best.count ? bucket : best),
      gradeDistribution[0],
    );
    notes.push(`Most completed modules are currently in the ${strongestBucket.label}.`);

    const weakestYear = creditByYear.reduce(
      (lowest, yearItem) => (yearItem.credits < lowest.credits ? yearItem : lowest),
      creditByYear[0],
    );
    notes.push(`Year ${weakestYear.year} has the lowest completed-credit progress in the current analytics view.`);

    return notes;
  }, [analyticsProjection.predictedNextSemesterGpa, creditByYear, gradeDistribution]);

  const handlePrintReport = () => {
    window.print();
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
    <div className="min-h-screen relative overflow-x-hidden pt-16 p-6 font-sans text-white selection:bg-orange-500 selection:text-black animate-fade-in">
      <div className="max-w-6xl mx-auto relative z-10 pt-10 pb-12">
        <div className="mb-10 text-center animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-xl">
            Risk <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 via-amber-400 to-yellow-200">Analyzer</span>
          </h1>
          <p className="text-lg text-white/60 font-medium max-w-2xl mx-auto text-balance">
            Identify modules where you are most at risk and visualize your academic performance trajectory.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-center font-bold">
            {error}
          </div>
        )}

        <div className="glass-dark rounded-3xl p-8 mb-8 animate-slide-up stagger-2 border-[#333333]">
          <AnalyticsSection
            metrics={metrics}
            yearAverages={yearAverages}
            gradeDistribution={gradeDistribution}
            creditByYear={creditByYear}
            analyticsProjection={analyticsProjection}
            analyticsNotes={analyticsNotes}
            handlePrintReport={handlePrintReport}
          />
        </div>

        <div className="flex justify-center gap-4 animate-slide-up stagger-3">
          <button 
            className="px-8 py-4 rounded-xl font-extrabold text-orange-500 border border-orange-500/30 hover:bg-orange-500/10 transition-all uppercase tracking-widest shadow-sm"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
