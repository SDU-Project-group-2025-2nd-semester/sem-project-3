import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@features/auth/AuthContext";
import Card from "@shared/ui/Card";
import Button from "@shared/ui/Button";
import { useRooms } from "../hooks/useRooms";

export default function StaffHomePage() {
    const { currentCompany } = useAuth();
    const companyId = typeof currentCompany === "string" ? currentCompany : currentCompany?.id;

    const { roomsMeta, currentTables, selectedRoom, setSelectedRoom, updateAllDesks, markDamaged, isUpdating } = useRooms(companyId);

    const navigate = useNavigate();
    const location = useLocation();

    // Handle damaged desk passed via navigation state
    useEffect(() => {
        const damagedId = location.state?.damagedTableId;
        if (damagedId) markDamaged(damagedId);
    }, [location.state, markDamaged]);

    const reportDamage = (id) => navigate("/staff/damagereport", { state: { tableId: id } });

    return (
        <div className="flex flex-col items-center min-h-screen bg-background px-6 py-8">
            <h1 className="text-2xl font-bold text-primary mb-6">Staff Control Panel</h1>

            <div className="mb-6 w-full max-w-xs">
                <label className="block mb-1 text-sm font-semibold text-secondary">Select Room</label>
                <select value={selectedRoom ?? ""} onChange={e => setSelectedRoom(e.target.value)}
                    className="w-full border border-secondary rounded-lg px-3 py-2 bg-white text-primary focus:ring-2 focus:ring-accent outline-none">
                    {Object.keys(roomsMeta).map(key => <option key={key} value={key}>{key}</option>)}
                </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button onClick={() => updateAllDesks("raise")} variant="primary" disabled={isUpdating}>Lift All Tables</Button>
                <Button onClick={() => updateAllDesks("lower")} variant="secondary" disabled={isUpdating}>Lower All Tables</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                {currentTables.map(d => (
                    <Card key={d.id} className={`${d.isDamaged ? 'border-red-500 bg-red-50' : 'border-secondary bg-white'}`}>
                        <h2 className="text-lg font-semibold text-primary mb-2">{d.name}</h2>
                        <p className={`text-sm mb-3 ${d.status === "raised" ? "text-accent" :
                                d.status === "lowered" ? "text-primary" :
                                    d.status === "updating" ? "text-yellow-600" :
                                        d.status === "error" ? "text-red-600" : "text-black"
                            }`}>
                            Status: {d.status}
                        </p>
                        {!d.isDamaged ? (
                            <Button onClick={() => reportDamage(d.id)} variant="ghost" className="border border-red-500 text-red-500">Report Damage</Button>
                        ) : (
                            <span className="text-red-600 text-sm font-semibold">Damaged</span>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
