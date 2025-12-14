import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { putDeskHeight } from "../../services/deskService";
import { get } from "../../context/apiClient";
import { useAuth } from "../../context/AuthContext";

export default function StaffHomePage() {

    const { currentCompany } = useAuth();
    const companyId = typeof currentCompany === "string" ? currentCompany : currentCompany?.id;

    const [rooms, setRooms] = useState({});

    const [roomsMeta, setRoomsMeta] = useState({});

    const [selectedRoom, setSelectedRoom] = useState(null);

    const [isUpdating, setIsUpdating] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    
    // Load rooms list and all desks on mount -> populate roomsMeta and rooms
    useEffect(() => {
        if (!companyId) return;

        let mounted = true;
        const controller = new AbortController();

        (async () => {
            try {
                const apiRooms = await get(`/${companyId}/Rooms`, { signal: controller.signal });
                if (!mounted || !Array.isArray(apiRooms)) return;

                // Load all desks for the company (single request)
                const apiDesks = await get(`/${companyId}/Desks`, { signal: controller.signal });
                const allDesks = Array.isArray(apiDesks) ? apiDesks : [];

                const meta = {};
                const initialRooms = {};

                apiRooms.forEach((r) => {
                    const key = r.readableId ?? r.id;
                    meta[key] = { id: r.id, readableId: r.readableId };

                    // Filter desks by roomId (matches API response)
                    const desksForRoom = allDesks.filter(d => String(d.roomId) === String(r.id));
                    // keep full desk fields that backend expects
                    initialRooms[key] = desksForRoom.map((d, i) => {
                        const fallbackReadable = d.readableId ?? (d.macAddress ? `Desk ${d.macAddress}` : `Desk ${i + 1}`);
                        return {
                            id: d.id,
                            name: d.readableId ?? (d.macAddress ? `Desk ${d.macAddress}` : `Desk ${i + 1}`),
                            readableId: fallbackReadable,
                            status: "normal",
                            isDamaged: false,
                            height: d.height,
                            minHeight: d.minHeight,
                            maxHeight: d.maxHeight,
                            macAddress: d.macAddress,
                            roomId: d.roomId,
                            companyId: d.companyId,
                            reservationIds: Array.isArray(d.reservationIds) ? d.reservationIds : []
                        };
                    });
                });

                setRoomsMeta(meta);
                setRooms(initialRooms);

                // set default selected room to first available
                const firstKey = Object.keys(meta)[0] ?? null;
                if (firstKey) setSelectedRoom(firstKey);
            } catch (err) {
                if (err?.name === "AbortError") return;
                console.error("Failed to load rooms or desks:", err);
            }
        })();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, [companyId]);

    // Handle damaged flag passed via navigation state
    useEffect(() => {
        const damagedId = location.state?.damagedTableId;
        if (damagedId) {
            setRooms((prev) => {
                const updated = { ...prev };
                for (const room in updated) {
                    updated[room] = updated[room].map((table) =>
                        table.id === damagedId ? { ...table, isDamaged: true } : table
                    );
                }
                return updated;
            });
        }
    }, [location.state]);

    const currentTables = rooms[selectedRoom] ?? [];

    // action: "raise" -> set to maxHeight, "lower" -> set to minHeight
    const handleAllTables = async (action) => {
        if (!selectedRoom) return;
        if (!companyId) return;
        const desks = rooms[selectedRoom] ?? [];
        if (desks.length === 0) return;

        const targetField = action === "raise" ? "maxHeight" : "minHeight";
        const targetStatus = action === "raise" ? "raised" : "lowered";

        setIsUpdating(true);
        // optimistic: mark updating
        setRooms(prev => ({
            ...prev,
            [selectedRoom]: (prev[selectedRoom] ?? []).map(t => ({ ...t, status: "updating" }))
        }));

        // build promises using putDeskHeight service
        const promises = desks.map((d) => {
            const height = d[targetField] ?? d.height;
            // backend expects a raw integer in the body, not an object
            return putDeskHeight(companyId, d.id, height);
        });

        const results = await Promise.allSettled(promises);

        // apply results to UI
        setRooms(prev => ({
            ...prev,
            [selectedRoom]: (prev[selectedRoom] ?? []).map((t, i) => {
                const res = results[i];
                if (res.status === "fulfilled") {
                    const newHeight = t[targetField] ?? t.height;
                    return { ...t, status: targetStatus, height: newHeight };
                } else {
                    return { ...t, status: "error" };
                }
            })
        }));

        const failed = results.filter(r => r.status === "rejected");
        if (failed.length > 0) {
            alert(`${failed.length} desks could not be updated. Look into the console to see details.`);
            console.error("Desk update errors:", results.map((r, idx) => r.status === "rejected" ? { index: idx, reason: r.reason } : null));
        }

        setIsUpdating(false);
    };

    const reportDamage = (id) => {
        navigate("/staff/damagereport", { state: { tableId: id } });
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-background px-6 py-8">
            <h1 className="text-2xl font-bold text-primary mb-6">
                Staff Control Panel
            </h1>

            <div className="mb-6 w-full max-w-xs">
                <label className="block mb-1 text-sm font-semibold text-secondary">
                    Select Room
                </label>
                <select
                    value={selectedRoom ?? ""}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full border border-secondary rounded-lg px-3 py-2 bg-white text-primary focus:ring-2 focus:ring-accent outline-none"
                >
                    {Object.keys(roomsMeta).map((roomKey) => (
                        <option key={roomKey} value={roomKey}>
                            {roomKey}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                    onClick={() => handleAllTables("raise")}
                    className="bg-accent text-white px-6 py-2 rounded-lg shadow hover:bg-secondary transition-colors"
                    disabled={isUpdating}
                >
                    Lift All Tables
                </button>
                <button
                    onClick={() => handleAllTables("lower")}
                    className="bg-secondary text-white px-6 py-2 rounded-lg shadow hover:bg-accent transition-colors"
                    disabled={isUpdating}
                >
                    Lower All Tables
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                {currentTables.map((table) => (
                    <div
                        key={table.id}
                        className={`border rounded-2xl p-4 flex flex-col items-center justify-between shadow transition ${
                            table.isDamaged
                                ? "border-red-500 bg-red-50"
                                : "border-secondary bg-white"
                        }`}
                    >
                        <h2 className="text-lg font-semibold text-primary mb-2">
                            {table.name}
                        </h2>

                        <p
                            className={`text-sm mb-3 ${
                                table.status === "raised"
                                    ? "text-accent"
                                    : table.status === "lowered"
                                    ? "text-primary"
                                    : table.status === "updating"
                                    ? "text-yellow-600"
                                    : table.status === "error"
                                    ? "text-red-600"
                                    : "text-black"
                            }`}
                        >
                            Status: {table.status}
                        </p>

                        {!table.isDamaged ? (
                            <button
                                onClick={() => reportDamage(table.id)}
                                className="border border-red-500 text-red-500 px-4 py-1 rounded hover:bg-red-100 transition"
                            >
                                Report Damage
                            </button>
                        ) : (
                            <span className="text-red-600 text-sm font-semibold">
                                Damaged
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
