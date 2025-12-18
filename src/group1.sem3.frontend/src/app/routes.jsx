import { Routes, Route } from "react-router-dom";
import SignInPage from "@features/auth/pages/SignInPage";
import SignUpPage from "@features/auth/pages/SignUpPage";
import UserHomePage from "@features/user/pages/UserHomePage";
import StaffHomePage from "@features/staff/pages/StaffHomePage";
import UserSettingsPage from "@features/user/pages/UserSettingsPage";
import UserStatisticsPage from "@features/user/pages/UserStatisticsPage";
import StaffSettingsPage from "@features/staff/pages/StaffSettingsPage";
import AdminSettingsPage from "@features/staff/pages/StaffSettingsPage";
import BookingPage from "@features/user/pages/BookingPage";
import UsersManagerPage from "@features/admin/pages/UsersManagerPage";
import DamagesManagerPage from "@features/admin/pages/DamagesManagerPage";
import DesksManagerPage from "@features/admin/pages/DesksManagerPage";
import HealthStatsManagerPage from "@features/admin/pages/HealthStatsManagerPage";
import Scanning from "@features/user/pages/Scanning";
import DeskPage from "@features/user/pages/DeskPage";
import DamageReportPage from "@features/staff/pages/DamageReportPage";
import CompanyJoinPage from "@features/staff/pages/CompanyJoinPage";
import ProtectedRoute from "@shared/ui/ProtectedRoute";

export default function AppRoutes() {
 return (
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
 <Route path="/staff/companies/join" element={<ProtectedRoute roles={[1,2]}><CompanyJoinPage /></ProtectedRoute>} />
 <Route path="/user/companies/join" element={<ProtectedRoute><CompanyJoinPage /></ProtectedRoute>} />
 <Route path="/user/statistics" element={<ProtectedRoute><UserStatisticsPage /></ProtectedRoute>} />
 <Route path="/user/reservation/:reservationId" element={<ProtectedRoute><DeskPage /></ProtectedRoute>} />
 </Routes>
 );
}
