import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function StaffSettingsPage() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState(currentUser?.fullName || "");
    const [email, setEmail] = useState(currentUser?.email || "");
    const [password, setPassword] = useState("");

    const inputClasses = "w-full border border-secondary rounded px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 outline-none focus:ring-2 focus:ring-accent bg-background text-primary";
    const labelClasses = "block mb-1 text-sm font-semibold text-primary";

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-background px-4 pt-20">
            
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gray-300 rounded-full flex items-center justify-center mb-6">
                <span className="text-white font-semibold text-sm sm:text-base">IMG</span>
            </div>

            
            <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 flex flex-col space-y-4">
                <div>
                    <label className={labelClasses} htmlFor="fullName">Full Name</label>
                    <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={inputClasses}
                        placeholder="Full Name"
                    />
                </div>

                <div>
                    <label className={labelClasses} htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClasses}
                        placeholder="Email"
                    />
                </div>

                <div>
                    <label className={labelClasses} htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClasses}
                        placeholder="New Password"
                    />
                </div>

                <button
                    onClick={handleLogout}
                    className="fixed bottom-4 right-4 bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-red-600 transition-colors shadow"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
