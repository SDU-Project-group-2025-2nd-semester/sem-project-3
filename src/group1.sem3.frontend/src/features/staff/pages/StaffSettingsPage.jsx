import { useAuth } from "@features/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "@shared/ui/Card";
import Input from "@shared/ui/Input";
import Button from "@shared/ui/Button";
import { useStaffProfile } from "../hooks/useStaffProfile";

export default function StaffSettingsPage() {
    const { currentUser, logout, refreshCurrentUser } = useAuth();
    const navigate = useNavigate();
    const { firstName, setFirstName, lastName, setLastName, email, setEmail, password, setPassword, saveProfile } =
        useStaffProfile(currentUser, refreshCurrentUser);

    const labelClasses = "block mb-1 text-sm font-semibold text-primary";

    return (
        <div className="relative bg-background min-h-screen px-4 pt-20 pb-12">
            <main className="w-full max-w-2xl mx-auto flex flex-col gap-6">

                <Card>
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Account</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>First Name</label>
                            <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" />
                        </div>
                        <div>
                            <label className={labelClasses}>Last Name</label>
                            <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" />
                        </div>
                        <div>
                            <label className={labelClasses}>Email</label>
                            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-Mail" />
                        </div>
                        <div>
                            <label className={labelClasses}>Password</label>
                            <Input value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" />
                        </div>
                    </div>
                </Card>

                <section className="flex flex-col gap-3 items-end">
                    <Button onClick={saveProfile} variant="primary">Save</Button>
                </section>

                <div className="fixed bottom-6 right-4 z-50">
                    <Button onClick={() => { logout(); navigate("/"); }} variant="danger">Logout</Button>
                </div>
            </main>
        </div>
    );
}
