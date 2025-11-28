import { Routes, Route } from "react-router-dom";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import UserHomePage from "./pages/user/UserHomePage";
import StaffHomePage from "./pages/staff/StaffHomePage";
import UserSettingsPage from "./pages/user/UserSettingsPage";
import StaffSettingsPage from "./pages/staff/StaffSettingsPage";
import BookingPage from "./pages/user/BookingPage";
import UsersManagerPage from "./pages/admin/UsersManagerPage";
import DamagesManagerPage from "./pages/admin/DamagesManagerPage";
import ProfilesManagerPage from "./pages/admin/ProfilesManagerPage";
import DesksManagerPage from "./pages/admin/DesksManagerPage";
import HealthStatsManagerPage from "./pages/admin/HealthStatsManagerPage";
import Header from "./components/Header";
import Scanning from "./pages/user/Scanning";
import DeskPage from "./pages/user/DeskPage";
import DamageReportPage from "./pages/staff/DamageReportPage";
import Sidebar from "./components/Sidebar";
import { useState } from "react";

export default function App() {

    const [sidebarOpen, setSidebarOpen] = useState(false); // default: closed
    
    return (
        <div className = "min-h-screen flex flex-col" >
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex flex-1">
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<SignInPage />} />
                        <Route path="/signuppage" element={<SignUpPage />} />
                        <Route path="/user/homepage" element={<UserHomePage />} />
                        <Route path="/staff/homepage" element={<StaffHomePage />} />
                        <Route path="/user/settings" element={<UserSettingsPage />} />
                        <Route path="/staff/settings" element={<StaffSettingsPage />} />
                        <Route path="/user/booking" element={<BookingPage />} />
                        <Route path="/admin/homepage" element={<UsersManagerPage />} />
                        <Route path="/admin/usersManager" element={<UsersManagerPage />} />
                        <Route path="/admin/damagesManager" element={<DamagesManagerPage />} />
                        <Route path="/admin/profilesManager" element={<ProfilesManagerPage />} />
                        <Route path="/admin/desksManager" element={<DesksManagerPage />} />
                        <Route path="/admin/healthStatsManager" element={<HealthStatsManagerPage />} />
                        <Route path="/user/scan" element={<Scanning />} />
                        <Route path="/user/desk" element={<DeskPage />} />
                        <Route path="/staff/damagereport" element={<DamageReportPage />} />
                        <Route path="/user/damagereport" element={<DamageReportPage />} />
                    </Routes>
                </main>
            </div>  
        </div >
    )
}