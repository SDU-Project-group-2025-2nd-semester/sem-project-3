import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get, post, put, del } from "../../context/apiClient";
import { useAuth } from "../../context/AuthContext";

export default function UserHomePage() {
    
    const { currentCompany, isHydrating } = useAuth();
    const COMPANY_ID = currentCompany?.id;
    const [currentBookings, setCurrentBookings] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState()

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
                const [myreservations, myprofile] = await Promise.all([
                    get(`/${COMPANY_ID}/reservation/me`, { signal: ctrl.signal }),
                    get(`/Users/me`, { signal: ctrl.signal }),
                ]);

                if (ctrl.signal.aborted) return; // don’t update state if aborted

                const now = new Date();

                // 'Current bookings' --> the end of the booking is in the future
                const futurereservations = (myreservations ?? []).filter(r => new Date(r.end) > now)
                .sort((a, b) => {
                    const sa = new Date(a.start).getTime();
                    const sb = new Date(b.start).getTime();
                    if (sa !== sb) return sa - sb; // earlier start first
                    // earlier end first
                    return new Date(a.end).getTime() - new Date(b.end).getTime();
                });

                const currentMapped = futurereservations.map(r => {
                    const start = new Date(r.start);
                    const end = new Date(r.end);
                    const date = start.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
                    const time = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}-${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                    return {
                        id: r.id,
                        deskId: r.deskId,                     
                        desk: r.deskLabel ?? r.deskId,         // shows id until label exists
                        roomId: r.roomId,
                        room: r.roomLabel ?? r.roomId ?? "—",  // shows id until label exists
                        date,
                        time,
                    };
                });

                setCurrentBookings(currentMapped);
                setProfile(myprofile);

                // 'Recent Bookings' --> the end of the booking is in the past
                const pastReservations = (myreservations ?? [])
                .filter(r => new Date(r.end) <= now)
                .sort((a, b) => new Date(b.end) - new Date(a.end)); // order by end

                // Group by deskId and keep the most recent per desk
                const byDesk = new Map();
                for (const r of pastReservations) {
                    if (!byDesk.has(r.deskId)) {
                        byDesk.set(r.deskId, r);
                }}

                const recentMapped = Array.from(byDesk.values()).map(r => {
                    const start = new Date(r.start);
                    const end = new Date(r.end);
                    const date = start.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
                    const time = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}-${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

                    return {
                        id: r.id, // uses reservation id as key; could also use deskId
                        deskId: r.deskId,
                        desk: r.deskLabel ?? r.deskId,         // shows id until label exists
                        roomId: r.roomId,
                        room: r.roomLabel ?? r.roomId ?? "—",  // shows id until label exists
                        date,
                        time,
                    };
                });

                setRecentBookings(recentMapped);
            } catch (e) {
                if (e.name === "AbortError") return; // ignore normal abort
                setErr(e.body?.message || e.message);
            } finally {
                if (!ctrl.signal.aborted) setLoading(false);
            }
        }

        load();
        return () => ctrl.abort();
    }, [COMPANY_ID, isHydrating]);

    async function cancelBooking(id) {
        if (!confirm('Are you sure you want to cancel this reservation?')) {
            return;
        }
        try {
            await del(`/${COMPANY_ID}/reservation/${id}`);
            setCurrentBookings(prev => prev.filter(b => b.id !== id));
        } catch (e) {
            setErr(e.body?.message || e.message);
        }
    }

    return (
        <div className="relative bg-background min-h-screen px-4 pt-24">
            <main className="max-w-3xl mx-auto flex flex-col pb-32">
                <h2>
                    Welcome {profile ? profile.firstName : ""}!
                </h2>
                {/* CURRENT BOOKINGS */}
                <section>
                    <h2 className="text-2xl font-semibold text-secondary mb-4">
                        Current Bookings
                    </h2>

                    {loading && <div>Loading…</div>}
                    {err && <div className="text-red-600 mb-2">{String(err)}</div>}
                    {!loading && currentBookings.length === 0 && (
                        <div className="text-gray-600">No upcoming bookings.</div>
                    )}

                    <div className="flex flex-wrap gap-4">
                        {currentBookings.map((booking) => (
                            <div key={booking.id}
                                className="bg-white rounded-2xl shadow p-4 flex items-center justify-between w-full gap-4"
                            >

                            <Link to={`/user/reservation/${booking.id}`}
                            className="flex-1">
                            <div>
                                <p className="text-primary font-semibold">
                                    Desk: {booking.desk}
                                </p>
                                <p className="text-primary font-semibold">
                                    Room: {booking.room ?? "-"}
                                </p>
                                <p className="text-primary text-sm mt-1">
                                    {booking.date} | {booking.time}
                                </p>
                            </div>
                            </Link>

                            <button
                            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition shrink-0"
                            onClick={(e) => cancelBooking(booking.id)}>
                            Cancel
                            </button>
                        </div> 
                    ))}
                    </div>
                </section>

                {/* RECENT BOOKINGS */}
                <section>
                    <h2 className="text-2xl font-semibold text-secondary mb-4 mt-4">
                        Recent Bookings
                    </h2>

                    {loading && <div>Loading…</div>}
                    {err && <div className="text-red-600 mb-2">{String(err)}</div>}           
                    {!loading && recentBookings.length === 0 && (
                        <div className="text-gray-600">No recent bookings.</div>
                    )}

                    <div className="flex flex-wrap gap-4">
                        {recentBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white rounded-2xl shadow p-4 flex items-center justify-between w-full gap-4"
                            >
                                <div>
                                    <p className="text-primary font-semibold">
                                        Desk: {booking.desk}
                                    </p>
                                    <p className="text-primary font-semibold">
                                        Room: {booking.room ?? "-"}
                                    </p>
                                </div>

                                <Link
                                    to="/user/booking"
                                    state={{
                                        mode: "rebook",
                                        roomId: booking.roomId,
                                        roomName: booking.room,
                                        deskId: booking.deskId,
                                        deskName: booking.desk,
                                    }}
                                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition shrink-0"
                                >
                                    Rebook
                                </Link>
                            </div>
                        ))}   
                    </div>
                </section>
            </main>

            <Link
                to="/user/booking"
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md bg-accent text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:bg-accent/90 transition z-30 block text-center"
            >
                Book
            </Link>

        </div>
    );
}