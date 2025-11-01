import { Routes, Route } from "react-router-dom";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import UserHomePage from "./pages/user/UserHomePage";
import StaffHomePage from "./pages/staff/StaffHomePage";
import UserSettingsPage from "./pages/user/UserSettingsPage";
import StaffSettingsPage from "./pages/staff/StaffSettingsPage";
import BookingPage from "./pages/user/BookingPage";
import UserManagerPage from "./pages/admin/UserManagerPage";
import ProfilesManagerPage from "./pages/admin/ProfilesManagerPage";
import DesksManagerPage from "./pages/admin/DesksManagerPage";
import Header from "./components/Header";

export default function App() {

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<SignInPage />} />
                    <Route path="/signuppage" element={<SignUpPage />} />
                    <Route path="/user/homepage" element={<UserHomePage />} />
                    <Route path="/staff/homepage" element={<StaffHomePage />} />
                    <Route path="/user/settings" element={<UserSettingsPage />} />
                    <Route path="/staff/settings" element={<StaffSettingsPage />} />
                    <Route path="/user/booking" element={<BookingPage />} />
                    <Route path="/admin/UserManager" element={<UserManagerPage />} />
                    <Route path="/admin/ProfilesManager" element={<ProfilesManagerPage />} />
                    <Route path="/admin/DesksManager" element={<DesksManagerPage />} />
                </Routes>
            </main>
        </div>
    );
}
