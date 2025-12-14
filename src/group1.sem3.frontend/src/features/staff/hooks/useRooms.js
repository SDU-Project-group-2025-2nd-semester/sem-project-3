// features/staff/hooks/useRooms.js
import { useState, useEffect } from "react";
import { getRooms, getDesks, putDeskHeight } from "../staff.services";

export function useRooms(companyId) {
    const [rooms, setRooms] = useState({});
    const [roomsMeta, setRoomsMeta] = useState({});
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Load rooms and desks
    useEffect(() => {
        if (!companyId) return;
        let mounted = true;
        const controller = new AbortController();

        (async () => {
            try {
                const apiRooms = await getRooms(companyId, { signal: controller.signal }) || [];
                const apiDesks = await getDesks(companyId, { signal: controller.signal }) || [];

                const meta = {};
                const initialRooms = {};

                apiRooms.forEach((r) => {
                    const key = r.readableId ?? r.id;
                    meta[key] = { id: r.id, readableId: r.readableId };

                    const desksForRoom = apiDesks.filter(d => String(d.roomId) === String(r.id));
                    initialRooms[key] = desksForRoom.map((d, i) => ({
                        id: d.id,
                        name: d.readableId ?? (d.macAddress ? `Desk ${d.macAddress}` : `Desk ${i + 1}`),
                        readableId: d.readableId ?? (d.macAddress ? `Desk ${d.macAddress}` : `Desk ${i + 1}`),
                        status: "normal",
                        isDamaged: false,
                        height: d.height,
                        minHeight: d.minHeight,
                        maxHeight: d.maxHeight,
                        macAddress: d.macAddress,
                        roomId: d.roomId,
                        companyId: d.companyId,
                        reservationIds: Array.isArray(d.reservationIds) ? d.reservationIds : []
                    }));
                });

                if (!mounted) return;
                setRoomsMeta(meta);
                setRooms(initialRooms);

                const firstKey = Object.keys(meta)[0] ?? null;
                if (firstKey) setSelectedRoom(firstKey);
            } catch (err) {
                if (err?.name !== "AbortError") console.error("Failed to load rooms or desks:", err);
            }
        })();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, [companyId]);

    // Update all desks in a room
    const updateAllDesks = async (action) => {
        if (!selectedRoom || !companyId || !rooms[selectedRoom]?.length) return;

        const targetField = action === "raise" ? "maxHeight" : "minHeight";
        const targetStatus = action === "raise" ? "raised" : "lowered";

        setIsUpdating(true);
        setRooms(prev => ({
            ...prev,
            [selectedRoom]: prev[selectedRoom].map(d => ({ ...d, status: "updating" }))
        }));

        const desks = rooms[selectedRoom];
        const results = await Promise.allSettled(
            desks.map(d => putDeskHeight(companyId, d.id, d[targetField] ?? d.height))
        );

        setRooms(prev => ({
            ...prev,
            [selectedRoom]: desks.map((t, i) => {
                const res = results[i];
                if (res.status === "fulfilled") return { ...t, status: targetStatus, height: t[targetField] ?? t.height };
                return { ...t, status: "error" };
            })
        }));

        const failed = results.filter(r => r.status === "rejected");
        if (failed.length) {
            alert(`${failed.length} desks could not be updated. Check console for details.`);
            console.error("Desk update errors:", results.map((r, i) => r.status === "rejected" ? { index: i, reason: r.reason } : null));
        }

        setIsUpdating(false);
    };

    // Mark desk as damaged
    const markDamaged = (deskId) => {
        setRooms(prev => {
            const updated = { ...prev };
            for (const room in updated) {
                updated[room] = updated[room].map(d => d.id === deskId ? { ...d, isDamaged: true } : d);
            }
            return updated;
        });
    };

    return {
        rooms,
        roomsMeta,
        selectedRoom,
        setSelectedRoom,
        currentTables: rooms[selectedRoom] ?? [],
        updateAllDesks,
        markDamaged,
        isUpdating
    };
}
