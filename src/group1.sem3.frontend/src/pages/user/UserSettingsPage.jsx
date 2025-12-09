import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Icon from '@reacticons/bootstrap-icons';
import { get, put } from "../../context/apiClient";

const OPTION_TO_NUMBER = { "Less": 1, "Normal": 2, "Many": 3 };
const NUMBER_TO_OPTION = { 1: "Less", 2: "Normal", 3: "Many" };

export default function UserSettingsPage() {
    const { currentUser, logout, refreshCurrentUser } = useAuth();
    const navigate = useNavigate();

    // Profile fields 
    const [firstName, setFirstName] = useState(currentUser?.firstName ?? "");
    const [lastName, setLastName] = useState(currentUser?.lastName ?? "");
    const [email, setEmail] = useState(currentUser?.email ?? currentUser?.userName ?? "");
    const [password, setPassword] = useState("");

    // Preferences / ergonomics
    const [healthReminder, setHealthReminder] = useState(false);
    const numberToOption = (n) => NUMBER_TO_OPTION[Number(n)] ?? "Normal";
    const optionToNumber = (opt) => OPTION_TO_NUMBER[opt] ?? 0;
    const [pillOption, setPillOption] = useState(() =>
        numberToOption(currentUser?.healthRemindersFrequency ?? 1)
    );

    const [sittingTime, setSittingTime] = useState(currentUser?.sittingTime ?? "");
    const [standingTime, setStandingTime] = useState(currentUser?.standingTime ?? "");

    const [userHeight, setUserHeight] = useState("");
    const [sittingHeight, setSittingHeight] = useState(currentUser?.sittingHeight !== undefined && currentUser?.sittingHeight !== null ? String(currentUser.sittingHeight) : "");
    const [standingHeight, setStandingHeight] = useState(currentUser?.standingHeight !== undefined && currentUser?.standingHeight !== null ? String(currentUser.standingHeight) : "");

    const [sittingChanged, setSittingChanged] = useState(false);
    const [standingChanged, setStandingChanged] = useState(false);

    const [showUserHeight, setShowUserHeight] = useState(() => {
        return !(currentUser?.sittingHeight || currentUser?.standingHeight);
    });

    const inputClasses = "w-full border border-secondary rounded px-3 py-2 outline-none focus:ring-2 focus:ring-accent bg-background text-primary";
    const labelClasses = "block mb-1 text-sm font-semibold text-primary";
    const cardClasses = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";

    function applyUserToState(u) {
        setFirstName(u.firstName ?? "");
        setLastName(u.lastName ?? "");
        setEmail(u.email ?? u.userName ?? "");
        setSittingTime(u.sittingTime ?? "");
        setStandingTime(u.standingTime ?? "");
        setSittingHeight(u.sittingHeight !== undefined && u.sittingHeight !== null ? String(u.sittingHeight) : "");
        setStandingHeight(u.standingHeight !== undefined && u.standingHeight !== null ? String(u.standingHeight) : "");
        setPillOption(numberToOption(u.healthRemindersFrequency ?? 1));
        setHealthReminder((u.healthRemindersFrequency ?? 0) > 0);
        setShowUserHeight(!(u.sittingHeight || u.standingHeight));
    }

    // Calculate recommended sitting/standing heights from userHeight (cm)
    useEffect(() => {
        if (userHeight === "" || userHeight == null) {
            return;
        }

        const height = parseFloat(userHeight);
        if (!isNaN(height)) {
            const sitting = (height / 2 - 18.5).toFixed(1);
            const standing = (height * 0.62).toFixed(1);
            setSittingHeight(sitting);
            setStandingHeight(standing);
        }
    }, [userHeight]);

    useEffect(() => {
        if (currentUser) {
            applyUserToState(currentUser);
            return;
        }

        let mounted = true;
        (async () => {
            try {
                const me = await refreshCurrentUser();
                if (!mounted || !me) return;
                applyUserToState(me);
            } catch {
                // ignore fetch errors
            }
        })();

        return () => { mounted = false; };
    }, [currentUser, refreshCurrentUser, applyUserToState]);

    async function handleSave() {
        try {
            let me = null;
            try {
                me = await get("/Users/me");
            } catch (e) {
                me = null;
            }

            const partial = {
                firstName: firstName || null,
                lastName: lastName || null,
                email: email || null,
                userName: email || (me?.userName ?? null),
                normalizedEmail: email ? email.toUpperCase() : me?.normalizedEmail,
                normalizedUserName: email ? (email.toUpperCase()) : me?.normalizedUserName,
                sittingHeight: sittingHeight ? Number(sittingHeight) : null,
                standingHeight: standingHeight ? Number(standingHeight) : null,
                sittingTime: sittingTime ? Number(sittingTime) : null,
                standingTime: standingTime ? Number(standingTime) : null,
                healthRemindersFrequency: healthReminder ? optionToNumber(pillOption) : 0,
            };

            let payload;
            if (me) {
                payload = {
                    ...me,
                    ...partial
                };
            } else {
                payload = {
                    ...partial,
                    id: me?.id ?? null,
                    accountCreation: me?.accountCreation ?? null,
                    role: me?.role ?? 0,
                    normalizedEmail: partial.normalizedEmail ?? null,
                    normalizedUserName: partial.normalizedUserName ?? null,
                    emailConfirmed: me?.emailConfirmed ?? false,
                    passwordHash: me?.passwordHash ?? null,
                    securityStamp: me?.securityStamp ?? null,
                    concurrencyStamp: me?.concurrencyStamp ?? null,
                    phoneNumber: me?.phoneNumber ?? null,
                    phoneNumberConfirmed: me?.phoneNumberConfirmed ?? false,
                    twoFactorEnabled: me?.twoFactorEnabled ?? false,
                    lockoutEnd: me?.lockoutEnd ?? null,
                    lockoutEnabled: me?.lockoutEnabled ?? true,
                    accessFailedCount: me?.accessFailedCount ?? 0
                };
            }

            await put("/Users/me", payload);

            if (typeof refreshCurrentUser === "function") {
                await refreshCurrentUser();
            }

            alert("Profile saved.");
        } catch (err) {
            console.error(err);
            alert("Error while saving changes.");
        }
    }

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <div className="relative bg-background min-h-screen px-4 pt-20 pb-12">
            <main className="w-full max-w-2xl mx-auto flex flex-col gap-6">

                {/* Profile card */}
                <section className={cardClasses}>
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Account</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="min-w-0">
                            <label className={labelClasses} htmlFor="firstName">First Name</label>
                            <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClasses} placeholder="First Name" />
                        </div>

                        <div className="min-w-0">
                            <label className={labelClasses} htmlFor="lastName">Last Name</label>
                            <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClasses} placeholder="Last Name" />
                        </div>

                        <div className="min-w-0">
                            <label className={labelClasses} htmlFor="email">Email</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder="E‑Mail" />
                        </div>

                        <div className="min-w-0">
                            <label className={labelClasses} htmlFor="password">Password</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} placeholder="New password" />
                        </div>
                    </div>
                </section>

                <section className="flex flex-col gap-3 items-end">
                    <button
                        onClick={handleLogout}
                        className="px-20 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                        Logout
                    </button>
                </section>


                {/* Ergonomics card */}
                <section className={cardClasses}>
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Ergonomics</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Show the height input only when user wants to calculate from height */}
                        {showUserHeight ? (
                            <div className="min-w-0">
                                <label className={labelClasses}>My Height (cm)
                                    <div className="relative inline-block ml-2 group">
                                        <Icon name="info-circle" className="w-4 h-4 text-accent cursor-pointer" />
                                        <div className="absolute z-10 hidden group-hover:block bg-gray-100 text-secondary text-xs p-2 rounded shadow-md w-56 top-full left-1/2 transform -translate-x-1/2 mt-1">
                                            Your height is used to calculate recommended sitting/standing heights.
                                        </div>
                                    </div>
                                </label>
                                <div className="flex gap-2">
                                    <input type="number" min="100" max="250" value={userHeight} onChange={(e) => { setUserHeight(e.target.value); setSittingChanged(false); setStandingChanged(false); }} className={inputClasses} placeholder="e.g. 175" />
                                    <button onClick={() => setShowUserHeight(false)} className="px-4 py-2 bg-gray-200 rounded font-semibold text-primary text-sm">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="min-w-0">
                                    <button onClick={() => setShowUserHeight(true)} className="w-full px-6 py-2 bg-secondary text-white rounded-lg border-2 border-accent hover:bg-accent transition-colors font-medium">Calculate desk heights</button>
                            </div>
                        )}

                        <div className="min-w-0">
                            <label className={labelClasses}>Standing Height (cm)</label>
                            <input type="number" value={standingHeight} onChange={(e) => { setStandingHeight(e.target.value); setStandingChanged(true); }} className={inputClasses} placeholder="e.g. 110" />
                        </div>

                        <div className="min-w-0">
                            <label className={labelClasses}>Sitting Height (cm)</label>
                            <input type="number" value={sittingHeight} onChange={(e) => { setSittingHeight(e.target.value); setSittingChanged(true); }} className={inputClasses} placeholder="e.g. 70" />
                        </div>

                        {(sittingChanged || standingChanged) && (
                            <div className="col-span-1 md:col-span-2">
                                <button onClick={() => {
                                    const height = parseFloat(userHeight);
                                    if (!isNaN(height)) {
                                        setSittingHeight((height / 2 - 18.5).toFixed(1));
                                        setStandingHeight((height * 0.62).toFixed(1));
                                        setSittingChanged(false);
                                        setStandingChanged(false);
                                    }
                                }} className="w-full px-6 py-2 bg-secondary text-white rounded-lg border-2 border-accent hover:bg-accent transition-colors font-medium">
                                    Reset to recommended
                                </button>
                            </div>
                        )}

                        <div className="min-w-0 top-20">
                            <label className={labelClasses}>Health Reminder</label>
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={healthReminder} onChange={() => setHealthReminder(!healthReminder)} className="sr-only" />
                                    <div className={`w-11 h-6 rounded-full transition-colors ${healthReminder ? 'bg-accent' : 'bg-gray-200'}`}></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${healthReminder ? 'translate-x-5' : ''}`}></div>
                                </label>
                                <span className="text-sm font-medium text-primary">Enable reminders</span>
                            </div>
                        </div>
                    </div>


                    {healthReminder && (
                        <div className="mt-4 flex gap-2">
                            {["Less", "Normal", "Many"].map(option => (
                                <button key={option} onClick={() => setPillOption(option)} className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${pillOption === option ? 'bg-accent text-white' : 'bg-gray-200 text-primary'}`}>
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <div className="fixed bottom-6 right-6 z-50">
                    <button onClick={handleSave} className="w-full md:w-auto px-20 py-2 bg-accent text-white rounded-lg hover:bg-accent-600 transition-colors font-medium">Save</button>
                </div>
            </main>
        </div>
    );
}
