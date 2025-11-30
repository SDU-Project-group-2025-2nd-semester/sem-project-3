import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Icon from '@reacticons/bootstrap-icons';
import { get, put } from "../../context/apiClient";

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

    const [userHeight, setUserHeight] = useState("");
    const [sittingHeight, setSittingHeight] = useState("");
    const [standingHeight, setStandingHeight] = useState("");

    // Used to check if manual changes were made to the desk heights
    const [sittingChanged, setSittingChanged] = useState(false);
    const [standingChanged, setStandingChanged] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [saveErr, setSaveErr] = useState(undefined);

    useEffect(() => {
        const height = parseFloat(userHeight);
        if (!isNaN(height)) {
            // Calculations based on https://www.omnicalculator.com/everyday-life/desk-height 
            const sitting = (height / 2 - 18.5).toFixed(1);
            const standing = (height * 0.62).toFixed(1);
            setSittingHeight(sitting);
            setStandingHeight(standing);
        }
    }, [userHeight]);

    // Load existing profile heights (mm) from the database and show them in cm
    useEffect(() => {
        const ctrl = new AbortController();

        (async () => {
            try {
                const me = await get("/Users/me", { signal: ctrl.signal });
                if (ctrl.signal.aborted) return;

                const sitMm = me?.sittingHeight;
                const standMm = me?.standingHeight;

                if (typeof sitMm === "number" && sitMm > 0) {
                    setSittingHeight((sitMm / 10).toFixed(1)); // cm
                }
                if (typeof standMm === "number" && standMm > 0) {
                    setStandingHeight((standMm / 10).toFixed(1)); // cm
                }
            } catch (e) {
                console.error("Failed to load /Users/me:", e?.body?.message || e?.message || e);
            }
        })();

        return () => ctrl.abort();
    }, []);
    
    // Auto-save sitting/standing heights whenever they change
    // NOTE: User's height should also be auto-saved, but it's not in the model currently
    useEffect(() => {
        const sitCm = parseFloat(sittingHeight);
        const standCm = parseFloat(standingHeight);

        // If either is NaN (Not a Number), skip saving until both are valid numbers
        if (isNaN(sitCm) || isNaN(standCm)) return;

        // Debounce: wait a bit after the last change before saving
        const timer = setTimeout(async () => {
            setIsSaving(true);
            setSaveErr(undefined);

            const payload = {
            // Backend stores millimeters
            sittingHeight: Math.round(sitCm * 10),
            standingHeight: Math.round(standCm * 10),
            };

            try {
                await put("/Users/me", payload);
            } catch (e) {
                setSaveErr(e?.body?.message || e?.message || "Failed to save preferences.");
            } finally {
                setIsSaving(false);
            }
        }, 1000); 

        return () => clearTimeout(timer);
    }, [sittingHeight, standingHeight]);

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
                        <label className={labelClasses}>
                            My Height (cm) 
                            <div className="relative inline-block ml-2 group">
                                <Icon name="info-circle" className="w-4 h-4 text-accent cursor-pointer" />
                                <div className="absolute z-10 hidden group-hover:block bg-gray-100 text-secondary text-xs p-2 rounded shadow-md w-64 top-full left-1/2 transform -translate-x-1/2 mt-1">
                                    Your height is used to calculate ergonomical standing and sitting desk positions.
                                    Keep in mind that these are general calculations. Feel free to adjust them so it's comfortable for you.
                                </div>
                            </div>
                        </label>
                        <input
                            type="number"
                            min="100"
                            max="250"
                            value={userHeight}
                            onChange={(e) => {
                                setUserHeight(e.target.value);
                                setSittingChanged(false);
                                setStandingChanged(false);
                            }}
                            className={inputClasses}
                            placeholder="e.g. 175"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 w-full">
                    <div>
                        <label className="block text-sm font-medium text-primary mb-1">
                            Standing Height (cm)
                        </label>
                        <input
                            type="number"
                            value={standingHeight}
                            onChange={(e) => {
                                    setStandingHeight(e.target.value);
                                    setStandingChanged(true);
                                }}
                            className={inputClasses}
                            placeholder="Auto-filled"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary mb-1">
                            Sitting Height (cm)
                        </label>
                        <input
                            type="number"
                            value={sittingHeight}
                            onChange={(e) => {
                                    setSittingHeight(e.target.value);
                                    setSittingChanged(true);
                                }}
                            className={inputClasses}
                            placeholder="Auto-filled"
                        />
                    </div>

                    {(sittingChanged || standingChanged) && (
                        <div className="col-span-2">
                            <button
                                onClick={() => {
                                    const height = parseFloat(userHeight);
                                    if (!isNaN(height)) {
                                        setSittingHeight((height / 2 - 18.5).toFixed(1));
                                        setStandingHeight((height * 0.62).toFixed(1));
                                        setSittingChanged(false);
                                        setStandingChanged(false);
                                    }
                                }}
                                className="w-full mt-2 px-4 py-2 bg-accent text-white rounded hover:bg-blue-600 transition-colors text-sm font-semibold"
                            >  
                                Reset to Recommended
                            </button>
                        </div>
                    )}

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
