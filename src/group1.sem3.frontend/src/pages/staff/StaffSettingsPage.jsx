import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Icon from '@reacticons/bootstrap-icons';
import { get, put } from "../../context/apiClient";

export default function StaffSettingsPage() {
    const { currentUser, logout, refreshCurrentUser } = useAuth();
    const navigate = useNavigate();

    // Profile fields 
    const [firstName, setFirstName] = useState(currentUser?.firstName ?? "");
    const [lastName, setLastName] = useState(currentUser?.lastName ?? "");
    const [email, setEmail] = useState(currentUser?.email ?? currentUser?.userName ?? "");
    const [password, setPassword] = useState("");

    const inputClasses = "w-full border border-secondary rounded px-3 py-2 outline-none focus:ring-2 focus:ring-accent bg-background text-primary";
    const labelClasses = "block mb-1 text-sm font-semibold text-primary";
    const cardClasses = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";

    function applyUserToState(u) {
        setFirstName(u.firstName ?? "");
        setLastName(u.lastName ?? "");
        setEmail(u.email ?? u.userName ?? "");
    }

    // If currentUser isn't present, fall back to refreshing once via context
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
    }, [currentUser, refreshCurrentUser]);

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
                normalizedUserName: email ? (email.toUpperCase()) : me?.normalizedUserName
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
                    <button onClick={handleSave} className="px-20 py-2 bg-accent text-white rounded-lg hover:bg-accent-600 transition-colors font-medium">Save</button>
                </section>

                <div className="fixed bottom-6 right-4 z-50">
                    <button onClick={handleLogout} className="px-20 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">Logout</button>
                </div>
            </main>
        </div>
    );
}
