import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AnalyticsCharts from "../components/AnalyticsCharts";

export default function AnalyticsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const plan = state?.plan;

  useEffect(() => {
    if (!plan) {
      navigate('/', { replace: true });
    }
  }, [plan, navigate]);

  if (!plan) return null;

  return (
    <div className="min-h-screen relative overflow-hidden text-white pt-16">
      <div className="mx-auto max-w-6xl p-6 relative z-10 animate-fade-in">
        <div className="flex items-center gap-4 mb-8 stagger-1">
          <button 
            onClick={() => navigate('/')}
            className="rounded-xl bg-[#232323] px-4 py-2 font-bold text-white shadow-sm border border-[#333333] hover:bg-[#333333] transition-all flex items-center gap-2 hover-lift"
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1">
              Performance <span className="text-[#3b82f6]">Analytics</span>
            </h1>
            <p className="text-sm font-medium text-white/60">
              Visual breakdown of your academic trajectory
            </p>
          </div>
        </div>
        
        <div className="animate-slide-up stagger-3">
          <AnalyticsCharts plan={plan} />
        </div>
      </div>
    </div>
  );
}
