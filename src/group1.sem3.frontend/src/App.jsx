import { Routes, Route } from "react-router-dom";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import UserHomePage from "./pages/user/UserHomePage";
import StaffHomePage from "./pages/staff/StaffHomePage"; 
import UserSettingsPage from "./pages/user/UserSettingsPage"; 
import StaffSettingsPage from "./pages/staff/StaffSettingsPage";
import BookingPage from "./pages/user/BookingPage";
import Header from "./components/Header";
import Scanning from "./pages/user/Scanning";
import DeskPage from "./pages/user/Deskpage";
import DamageReportPage from "./pages/staff/DamageReportPage";
import Sidebar from "./components/Sidebar";
import { useState } from "react";

export default function App() {

    const [sidebarOpen, setSidebarOpen] = useState(false); // default: closed
    
    return (
        <div className="min-h-screen flex flex-col">
            <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex flex-1 pt-16">
                <Sidebar isOpen={sidebarOpen}/>
                <main className={`flex-1 p-4
                    ${sidebarOpen 
                        ? "ml-30 sm:ml-48 md:ml-48 lg:ml-48" 
                        : "ml-13 sm:ml-16 md:ml-16 lg:ml-16"}`}>
                    <Routes>
                        <Route path="/" element={<SignInPage />} />
                        <Route path="/signuppage" element={<SignUpPage />} />
                        <Route path="/user/homepage" element={<UserHomePage />} />
                        <Route path="/staff/homepage" element={<StaffHomePage />} />
                        <Route path="/user/settings" element={<UserSettingsPage />} />
                        <Route path="/staff/settings" element={<StaffSettingsPage />} />
                        <Route path="/user/booking" element={<BookingPage />} />
                        <Route path="/user/scan" element={<Scanning />} />
                        <Route path="/user/desk" element={<DeskPage />} />
                        <Route path="/staff/damagereport" element={<DamageReportPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    )
}