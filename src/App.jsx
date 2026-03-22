import { BrowserRouter, Routes, Route } from "react-router-dom";
import ModuleListPage   from "./pages/ModuleListPage";
import AddModulePage    from "./pages/AddModule";
import ModuleDetailPage from "./pages/ModuleDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex justify-center bg-white min-h-screen">
        <div className="w-full max-w-md">
          <Routes>
            <Route path="/"           element={<ModuleListPage />} />
            <Route path="/add"        element={<AddModulePage />} />
            <Route path="/module/:id" element={<ModuleDetailPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}