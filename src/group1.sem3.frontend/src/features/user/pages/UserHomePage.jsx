import { Link } from "react-router-dom";
import FloatingActionButton from "@shared/ui/FloatingActionButton";
import NotificationBanner from "@shared/ui/NotificationBanner";
import { useUserBookings } from "../hooks/useUserBookings";

export default function UserHomePage() {
    const { currentBookings, recentBookings, profile, loading, err, cancelBooking } = useUserBookings();

    return (
        <div className="relative bg-background min-h-screen px-4 pt-24">
            <main className="max-w-3xl mx-auto flex flex-col pb-32">
                <h2>Welcome {profile?.firstName || ""}!</h2>
                {err && <NotificationBanner type="error">{String(err)}</NotificationBanner>}

                <section>
                    <h2 className="text-2xl font-semibold text-secondary mb-4">Current Bookings</h2>
                    {loading && <div>Loading…</div>}
                    {!loading && currentBookings.length === 0 && <div className="text-gray-600">No upcoming bookings.</div>}
                    <div className="flex flex-wrap gap-4">
                        {currentBookings.map(b => (
                            <div key={b.id} className="bg-white rounded-2xl shadow p-4 flex items-center justify-between w-full gap-4">
                                <Link to={`/user/reservation/${b.id}`} className="flex-1">
                                    <div>
                                        <p className="text-primary font-semibold">Desk: {b.desk}</p>
                                        <p className="text-primary font-semibold">Room: {b.room ?? "-"}</p>
                                    </div>
                                </Link>
                                <button className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition shrink-0"
                                    onClick={() => cancelBooking(b.id)}>Cancel</button>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-secondary mb-4 mt-4">Recent Bookings</h2>
                    {loading && <div>Loading…</div>}
                    {!loading && recentBookings.length === 0 && <div className="text-gray-600">No recent bookings.</div>}
                    <div className="flex flex-wrap gap-4">
                        {recentBookings.map(b => (
                            <div key={b.id} className="bg-white rounded-2xl shadow p-4 flex items-center justify-between w-full gap-4">
                                <div>
                                    <p className="text-primary font-semibold">Desk: {b.desk}</p>
                                    <p className="text-primary font-semibold">Room: {b.room ?? "-"}</p>
                                </div>
                                <Link to="/user/booking" state={{ mode: "rebook", roomId: b.roomId, roomName: b.room, deskId: b.deskId, deskName: b.desk }}
                                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition shrink-0">
                                    Rebook
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <FloatingActionButton to="/user/booking">Book</FloatingActionButton>
        </div>
    );
}
