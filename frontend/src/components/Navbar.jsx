import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo3.png";

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 inset-x-0 z-50 p-4 pointer-events-none">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center justify-between px-6 py-2.5 mt-2 pointer-events-auto bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/5 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="transition-opacity hover:opacity-80 flex items-center">
                            <img src={logo} alt="AcademiX Logo" className="h-8 md:h-10 w-auto object-contain scale-110 origin-left object-left" />
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-10 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#737373]">
                        <Link to="/dashboard" className="text-[#22c55e] transition-colors relative after:content-[''] after:absolute after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-[#22c55e] after:rounded-full">
                            Dashboard
                        </Link>
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={() => {
                                localStorage.removeItem("selectedSemesterId");
                                navigate("/select-semester");
                            }}
                            className="rounded-md border border-[#444444] bg-transparent px-5 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#a3a3a3] hover:text-white hover:border-white transition-all"
                        >
                            Select Semester
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
