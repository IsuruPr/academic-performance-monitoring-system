import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo2.png";

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 inset-x-0 z-50 p-4 pointer-events-none">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center justify-between px-6 py-3 mt-2 pointer-events-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-xl">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="transition-opacity hover:opacity-80 flex items-center bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
                            <img src={logo} alt="AcademiX Logo" className="h-8 md:h-10 w-auto object-contain drop-shadow-lg" />
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
                        <Link to="/dashboard" className="hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-white after:rounded-full">
                            Dashboard
                        </Link>


                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={() => {
                                localStorage.removeItem("selectedSemesterId");
                                navigate("/select-semester");
                            }}
                            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-[#0F172A] hover:bg-slate-100 hover:shadow-lg transition-all"
                        >
                            Get started
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
