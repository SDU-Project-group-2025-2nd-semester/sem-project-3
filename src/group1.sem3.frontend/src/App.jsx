import { Routes, Route } from "react-router-dom";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import UserHomePage from "./pages/user/UserHomePage";
import StaffHomePage from "./pages/staff/StaffHomePage";
import UserSettingsPage from "./pages/user/UserSettingsPage";
import UserStatisticsPage from "./pages/user/UserStatisticsPage";
import StaffSettingsPage from "./pages/staff/StaffSettingsPage";
import AdminSettingsPage from "./pages/staff/StaffSettingsPage";
import BookingPage from "./pages/user/BookingPage";
import UsersManagerPage from "./pages/admin/UsersManagerPage";
import DamagesManagerPage from "./pages/admin/DamagesManagerPage";
import DesksManagerPage from "./pages/admin/DesksManagerPage";
import HealthStatsManagerPage from "./pages/admin/HealthStatsManagerPage";
import Header from "./components/Header";
import Scanning from "./pages/user/Scanning";
import DeskPage from "./pages/user/DeskPage";
import DamageReportPage from "./pages/staff/DamageReportPage";
import CompanyJoinPage from "./pages/staff/CompanyJoinPage";
import Sidebar from "./components/Sidebar";
import { useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {

    const [sidebarOpen, setSidebarOpen] = useState(false); // default: closed

    return (
        <div className="min-h-screen flex flex-col" >
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex flex-1">
                <main className="flex-1">
                    <Routes>
                        <Route path="/" element={<SignInPage />} />
                        <Route path="/signuppage" element={<SignUpPage />} />
                        <Route path="/user/homepage" element={<ProtectedRoute><UserHomePage /></ProtectedRoute>} />
                        <Route path="/staff/homepage" element={<ProtectedRoute roles={[1,2]}><StaffHomePage /></ProtectedRoute>} />
                        <Route path="/user/settings" element={<ProtectedRoute><UserSettingsPage /></ProtectedRoute>} />
                        <Route path="/staff/settings" element={<ProtectedRoute roles={[1,2]}><StaffSettingsPage /></ProtectedRoute>} />
                        <Route path="/admin/settings" element={<ProtectedRoute roles={[2]}><AdminSettingsPage /></ProtectedRoute>} />
                        <Route path="/user/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
                        <Route path="/admin/homepage" element={<ProtectedRoute roles={[2]}><UsersManagerPage /></ProtectedRoute>} />
                        <Route path="/admin/usersManager" element={<ProtectedRoute roles={[2]}><UsersManagerPage /></ProtectedRoute>} />
                        <Route path="/admin/damagesManager" element={<ProtectedRoute roles={[2]}><DamagesManagerPage /></ProtectedRoute>} />
                        <Route path="/admin/desksManager" element={<ProtectedRoute roles={[2]}><DesksManagerPage /></ProtectedRoute>} />
                        <Route path="/admin/healthStatsManager" element={<ProtectedRoute roles={[2]}><HealthStatsManagerPage /></ProtectedRoute>} />
                        <Route path="/user/scan" element={<ProtectedRoute><Scanning /></ProtectedRoute>} />
                        <Route path="/user/desk" element={<ProtectedRoute><DeskPage /></ProtectedRoute>} />
                        <Route path="/staff/damagereport" element={<ProtectedRoute roles={[1,2]}><DamageReportPage /></ProtectedRoute>} />
                        <Route path="/user/damagereport" element={<ProtectedRoute><DamageReportPage /></ProtectedRoute>} />
                        <Route path="/user/statistics" element={<ProtectedRoute><UserStatisticsPage /></ProtectedRoute>} />
                        <Route path="/user/reservation/:reservationId" element={<ProtectedRoute><DeskPage /></ProtectedRoute>} />
                        <Route path="/user/companies/join" element={<CompanyJoinPage />} /> {/* should be protected? */}
                        <Route path="/staff/companies/join" element={<CompanyJoinPage />} /> {/* should be protected? */}
                    </Routes>
                </main>
            </div>
        </div >
    )
}