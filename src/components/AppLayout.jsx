import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart2, Calculator, LogOut, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { C } from "../constants";
import { apiFetch, clearAuth, getUser, setUser } from "../api/client";

const navItems = [
  { to: "/app/dashboard", label: "Analysis", icon: <BarChart2 size={17} /> },
  { to: "/app/gpa", label: "GPA Calculator", icon: <Calculator size={17} /> },
];

function SidebarNav() {
  const navigate = useNavigate();
  const [me, setMe] = useState(() => getUser());

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const user = await apiFetch("/api/auth/me");
        if (!alive) return;
        setMe(user);
        setUser(user);
      } catch {
        // ignore (token might be missing/expired); ProtectedRoute will handle routing
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const displayName = useMemo(() => {
    const n = (me?.name || "").trim();
    if (n) return n;
    const email = (me?.email || "").trim();
    return email || "Member";
  }, [me]);

  const initials = useMemo(() => {
    const n = (me?.name || "").trim();
    if (!n) return "U";
    const parts = n.split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] || "U").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
  }, [me]);

  const onLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#F0F5FB", fontFamily: "'Trebuchet MS',sans-serif" }}>
      <aside
        className="flex flex-col"
        style={{ width: 220, minHeight: "100vh", background: C.navy, boxShadow: "4px 0 24px rgba(30,58,95,0.15)" }}
      >
        <div className="flex items-center gap-3 px-5 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
            <TrendingUp size={18} color="white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">AcadMetrics</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>Historical Analytics</div>
          </div>
        </div>

        <nav className="flex-1 py-5 px-3 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all"
              style={({ isActive }) => ({
                color: isActive ? C.navy : "rgba(255,255,255,0.75)",
                background: isActive ? "white" : "transparent",
                fontWeight: isActive ? 700 : 400,
              })}
            >
              {icon}
              {label}
            </NavLink>
          ))}

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all mt-3"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            <LogOut size={17} />
            Logout
          </button>
        </nav>

        <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: C.blue, color: "white" }}
              title={displayName}
            >
              {initials}
            </div>
            <div>
              <div className="text-white text-xs font-semibold" style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}

export default function AppLayout() {
  return <SidebarNav />;
}

