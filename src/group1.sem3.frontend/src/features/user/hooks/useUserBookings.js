import { useState, useEffect, useCallback } from "react";
import * as userService from "../user.services";
import { useAuth } from "@features/auth/AuthContext";

export function useUserBookings() {
    const { currentCompany, isHydrating } = useAuth();
    const COMPANY_ID = currentCompany?.id;

    const [currentBookings, setCurrentBookings] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState();

    useEffect(() => {
        const ctrl = new AbortController();

        async function load() {
            if (!COMPANY_ID) {
                if (isHydrating) {
                    setLoading(true);
                    setErr(undefined);
                } else {
                    setErr("No company selected");
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            setErr(undefined);

            try {
                const [myReservations, myProfile] = await Promise.all([
                    userService.getMyReservations(COMPANY_ID, {}, { signal: ctrl.signal }),
                    userService.getMyProfile({ signal: ctrl.signal }),
                ]);

                if (ctrl.signal.aborted) return;

                setProfile(myProfile);

                const now = new Date();

                // Current bookings (end in future)
                const futureReservations = (myReservations ?? [])
                    .filter(r => new Date(r.end) > now)
                    .sort((a, b) => new Date(a.start) - new Date(b.start));

                const currentMapped = futureReservations.map(r => {
                    const start = new Date(r.start);
                    const end = new Date(r.end);
                    const date = start.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
                    const time = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}-${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                    return {
                        id: r.id,
                        deskId: r.deskId,
                        desk: r.deskLabel ?? r.deskId,
                        roomId: r.roomId,
                        room: r.roomLabel ?? r.roomId ?? "—",
                        date,
                        time,
                    };
                });

                setCurrentBookings(currentMapped);

                // Recent bookings (end in past) → most recent per desk
                const pastReservations = (myReservations ?? [])
                    .filter(r => new Date(r.end) <= now)
                    .sort((a, b) => new Date(b.end) - new Date(a.end));

                const byDesk = new Map();
                pastReservations.forEach(r => {
                    if (!byDesk.has(r.deskId)) byDesk.set(r.deskId, r);
                });

                const recentMapped = Array.from(byDesk.values()).map(r => {
                    const start = new Date(r.start);
                    const end = new Date(r.end);
                    const date = start.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
                    const time = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}-${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                    return {
                        id: r.id,
                        deskId: r.deskId,
                        desk: r.deskLabel ?? r.deskId,
                        roomId: r.roomId,
                        room: r.roomLabel ?? r.roomId ?? "—",
                        date,
                        time,
                    };
                });

                setRecentBookings(recentMapped);

            } catch (e) {
                if (e.name === "AbortError") return;
                setErr(e.body?.message || e.message);
            } finally {
                if (!ctrl.signal.aborted) setLoading(false);
            }
        }

        load();
        return () => ctrl.abort();
    }, [COMPANY_ID, isHydrating]);

    const cancelBooking = useCallback(async (id) => {
        if (!confirm("Are you sure you want to cancel this reservation?")) return;

        try {
            await userService.deleteReservation(COMPANY_ID, id);
            setCurrentBookings(prev => prev.filter(b => b.id !== id));
        } catch (e) {
            setErr(e.body?.message || e.message);
        }
    }, [COMPANY_ID]);

    return {
        currentBookings,
        recentBookings,
        profile,
        loading,
        err,
        cancelBooking,
    };
}
