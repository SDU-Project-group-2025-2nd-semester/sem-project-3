import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserSettingsPage() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState(currentUser?.fullName || "");
    const [email, setEmail] = useState(currentUser?.email || "");
    const [password, setPassword] = useState("");

    const [healthReminder, setHealthReminder] = useState(false);
    const [pillOption, setPillOption] = useState("Normal");

    const inputClasses = "w-full border border-secondary rounded px-3 py-2 outline-none focus:ring-2 focus:ring-accent bg-background text-primary";
    const labelClasses = "block mb-1 text-sm font-semibold text-primary";

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-background px-4 pt-20">
            
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

                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 w-full">
                    <div>
                        <label className="block text-sm font-medium text-primary mb-1">
                            Standing Height (cm)
                        </label>
                        <input
                            type="number"
                            min="50"
                            max="250"
                            placeholder="e.g. 175"
                            className="w-full border border-secondary rounded px-3 py-2 outline-none focus:ring-2 focus:ring-accent bg-background text-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary mb-1">
                            Sitting Height (cm)
                        </label>
                        <input
                            type="number"
                            min="30"
                            max="200"
                            placeholder="e.g. 95"
                            className="w-full border border-secondary rounded px-3 py-2 outline-none focus:ring-2 focus:ring-accent bg-background text-primary"
                        />
                    </div>
                </div>

                
                <div className="flex items-center mt-4 space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={healthReminder}
                            onChange={() => setHealthReminder(!healthReminder)}
                            className="sr-only"
                        />
                        <div
                            className={`w-12 h-6 flex items-center p-[2px] rounded-full border transition-all duration-300 ${healthReminder ? "bg-accent border-accent" : "bg-gray-200 border-gray-400"
                                }`}
                        >
                            <div
                                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${healthReminder ? "translate-x-6" : "translate-x-0"
                                    }`}
                            />
                        </div>
                    </label>
                    <span className="text-sm font-medium text-primary">
                        Health Reminders
                    </span>
                </div>

                
                {healthReminder && (
                    <div className="flex justify-between mt-4 space-x-2">
                        {["Less", "Normal", "Many"].map((option) => (
                            <button
                                key={option}
                                onClick={() => setPillOption(option)}
                                className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${pillOption === option
                                        ? "bg-accent text-white"
                                        : "bg-gray-200 text-primary"
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}
            </div>

           
            <button
                onClick={handleLogout}
                className="fixed bottom-4 right-4 bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-red-600 transition-colors shadow"
            >
                Logout
            </button>
        </div>
    );
}
