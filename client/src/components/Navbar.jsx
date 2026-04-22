import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo3.png";

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    if (location.pathname === "/login" || location.pathname === "/register") {
        return null;
    }

    const handleLogout = () => {
        localStorage.removeItem("gpa_token");
        localStorage.removeItem("gpa_user");
        navigate("/login");
    };

    // Get user initials from localStorage
    const userRaw = localStorage.getItem("gpa_user");
    const userName = (() => {
        try { return JSON.parse(userRaw)?.name || ""; } catch { return ""; }
    })();
    const initials = userName
        ? userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
        : "U";

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const navLink = (to, label) => (
        <Link
            to={to}
            className={`transition-colors relative ${
                location.pathname === to
                    ? "text-[#22c55e] after:content-[''] after:absolute after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-[#22c55e] after:rounded-full"
                    : "text-[#737373] hover:text-white"
            }`}
        >
            {label}
        </Link>
    );

    return (
        <nav className="fixed top-0 inset-x-0 z-50 p-4 pointer-events-none">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center justify-between px-6 py-2.5 mt-2 pointer-events-auto bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/5 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <Link to="/" className="transition-opacity hover:opacity-80 flex items-center">
                            <img src={logo} alt="AcadamiX Logo" className="h-8 md:h-10 w-auto object-contain scale-110 origin-left object-left" />
                        </Link>
                    </div>

                    {/* Nav links */}
                    <div className="hidden md:flex items-center gap-10 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                        {navLink("/", "Home")}
                        {navLink("/", "Dashboard")}
                        {navLink("/timer", "Study Timer")}
                        {navLink("/chat", "AI Chat")}
                        <Link
                            to="/academic-setup"
                            className="text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest font-bold text-[10px] sm:text-xs flex items-center gap-1.5 ml-4"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            Setup Profile
                        </Link>
                    </div>

                    {/* Profile avatar + dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(prev => !prev)}
                            className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs hover:border-emerald-500/60 hover:shadow-[0_0_12px_rgba(34,197,94,0.25)] transition-all select-none"
                            title="Profile"
                        >
                            {initials}
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-3 w-44 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50">
                                {userName && (
                                    <div className="px-4 py-3 border-b border-white/5">
                                        <p className="text-xs font-bold text-white truncate">{userName}</p>
                                        <p className="text-[10px] text-white/30 font-medium mt-0.5">Signed in</p>
                                    </div>
                                )}
                                <button
                                    onClick={() => { setDropdownOpen(false); navigate("/academic-setup"); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white/70 hover:bg-white/5 hover:text-white transition-colors text-left"
                                >
                                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors text-left"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
