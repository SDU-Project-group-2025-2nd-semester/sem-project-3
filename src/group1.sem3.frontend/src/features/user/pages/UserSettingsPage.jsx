import Card from "@shared/ui/Card";
import Input from "@shared/ui/Input";
import Button from "@shared/ui/Button";

import { useUserSettings } from "../hooks/useUserSettings";

export default function UserSettingsPage() {
    const {
        profile,
        setProfile,
        userHeight,
        setUserHeight,
        sittingHeight,
        setSittingHeight,
        standingHeight,
        setStandingHeight,
        sittingChanged,
        standingChanged,
        resetRecommended,
        pillOption,
        healthReminder,
        handleToggleHealthReminder,
        handleSelectPillOption,
        handleSave,
        handleLogout,
        handleCancelUserHeight,
    } = useUserSettings();

    return (
        <div className="relative bg-background min-h-screen px-4 pt-20 pb-12">
            <main className="w-full max-w-2xl mx-auto flex flex-col gap-6">
                {/* Profile card */}
                <Card>
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Account
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            id="firstName"
                            value={profile.firstName}
                            onChange={(e) =>
                                setProfile((prev) => ({
                                    ...prev,
                                    firstName: e.target.value,
                                }))
                            }
                            placeholder="First Name"
                        />

                        <Input
                            id="lastName"
                            value={profile.lastName}
                            onChange={(e) =>
                                setProfile((prev) => ({
                                    ...prev,
                                    lastName: e.target.value,
                                }))
                            }
                            placeholder="Last Name"
                        />

                        <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={(e) =>
                                setProfile((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                            placeholder="E-Mail"
                        />

                        <Input
                            id="password"
                            type="password"
                            value={profile.password}
                            onChange={(e) =>
                                setProfile((prev) => ({
                                    ...prev,
                                    password: e.target.value,
                                }))
                            }
                            placeholder="New password"
                        />
                    </div>
                </Card>

                <section className="flex flex-col gap-3 items-end">
                    <Button variant="danger" onClick={handleLogout}>
                        Logout
                    </Button>
                </section>

                {/* Ergonomics card */}
                <Card>
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Ergonomics
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Height input and recommended reset */}
                        {profile.showUserHeight ? (
                            <div>
                                <label className="block mb-1 text-sm font-semibold text-primary">
                                    Your Height (cm)
                                </label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        type="number"
                                        min={100}
                                        max={250}
                                        value={userHeight}
                                        onChange={(e) => setUserHeight(e.target.value)}
                                        placeholder="e.g.175"
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="ghost"
                                        onClick={handleCancelUserHeight}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={() =>
                                    setProfile((prev) => ({
                                        ...prev,
                                        showUserHeight: true,
                                    }))
                                }
                            >
                                Calculate ergonomic heights
                            </Button>
                        )}

                        <label className="block mb-1 text-sm font-semibold text-primary">
                            Standing Height (cm)
                        </label>

                        <Input
                            type="number"
                            value={standingHeight}
                            onChange={(e) => setStandingHeight(e.target.value)}
                            placeholder="Standing Height"
                        />

                        <label className="block mb-1 text-sm font-semibold text-primary">
                            Sitting Height (cm)
                        </label>

                        <Input
                            type="number"
                            value={sittingHeight}
                            onChange={(e) => setSittingHeight(e.target.value)}
                            placeholder="Sitting Height"
                        />

                        {(sittingChanged || standingChanged) && (
                            <Button onClick={resetRecommended}>
                                Reset to recommended
                            </Button>
                        )}

                        {/* Health reminder */}
                        <div className="min-w-0">
                            <label className="block mb-1 text-sm font-semibold text-primary">
                                Health Reminder
                            </label>

                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={healthReminder}
                                        onChange={handleToggleHealthReminder}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`w-11 h-6 rounded-full transition-colors ${healthReminder ? "bg-accent" : "bg-gray-200"
                                            }`}
                                    />
                                    <div
                                        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${healthReminder ? "translate-x-5" : ""
                                            }`}
                                    />
                                </label>

                                <span className="text-sm font-medium text-primary">
                                    Enable reminders
                                </span>
                            </div>

                            {healthReminder && (
                                <div className="flex gap-2 mt-2">
                                    {["Less", "Normal", "Many"].map((option) => (
                                        <Button
                                            key={option}
                                            variant={
                                                pillOption === option ? "primary" : "ghost"
                                            }
                                            onClick={() => handleSelectPillOption(option)}
                                            className="flex-1 py-2 rounded-full text-sm font-semibold"
                                        >
                                            {option}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                <div className="fixed bottom-6 right-6 z-50">
                    <Button onClick={handleSave} variant="primary">
                        Save
                    </Button>
                </div>
            </main>
        </div>
    );
}
