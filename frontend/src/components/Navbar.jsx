import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo3.png";

export default function Navbar() {
    const location = useLocation();

    return (
        <nav className="fixed top-0 inset-x-0 z-50 p-4 pointer-events-none">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center justify-between px-6 py-2.5 mt-2 pointer-events-auto bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/5 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="transition-opacity hover:opacity-80 flex items-center">
                            <img src={logo} alt="AcadamiX Logo" className="h-8 md:h-10 w-auto object-contain scale-110 origin-left object-left" />
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-10 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                        <Link
                            to="/"
                            className={`transition-colors relative ${
                                location.pathname === '/'
                                    ? "text-[#22c55e] after:content-[''] after:absolute after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-[#22c55e] after:rounded-full"
                                    : "text-[#737373] hover:text-white"
                            }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/select-semester"
                            className={`transition-colors relative ${
                                location.pathname === '/dashboard' || location.pathname === '/select-semester'
                                    ? "text-[#22c55e] after:content-[''] after:absolute after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-[#22c55e] after:rounded-full"
                                    : "text-[#737373] hover:text-white"
                            }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/timer"
                            className={`transition-colors relative ${
                                location.pathname === '/timer'
                                    ? "text-[#22c55e] after:content-[''] after:absolute after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-[#22c55e] after:rounded-full"
                                    : "text-[#737373] hover:text-white"
                            }`}
                        >
                            Study Timer
                        </Link>
                        <Link
                            to="/chat"
                            className={`transition-colors relative ${
                                location.pathname === '/chat'
                                    ? "text-[#22c55e] after:content-[''] after:absolute after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-[#22c55e] after:rounded-full"
                                    : "text-[#737373] hover:text-white"
                            }`}
                        >
                            AI Chat
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
