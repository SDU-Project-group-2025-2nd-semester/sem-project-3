import Header from "../shared/Header";
import Sidebar from "../shared/Sidebar";
import { useState } from "react";
import AppRoutes from "./routes";

export default function App() {

    const [sidebarOpen, setSidebarOpen] = useState(false); // default: closed

    return (
        <div className="min-h-screen flex flex-col" >
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex flex-1">
                <main className="flex-1">
                    <AppRoutes />
                </main>
            </div>
        </div >
    )
}