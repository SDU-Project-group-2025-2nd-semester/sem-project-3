import { Link } from "react-router-dom";

export default function UserHomePage() {
    const currentBookings = [
        { id: 1, desk: "D-101", room: "R-12", date: "25.10", time: "14:00-16:00" },
        { id: 2, desk: "D-205", room: "R-3", date: "26.10", time: "09:00-11:00" },
    ];

    const recentBookings = [
        { id: 1, desk: "D-303", room: "R-8" },
        { id: 2, desk: "D-404", room: "R-5" },
    ];

    return (
        <div className="relative bg-background min-h-screen px-4 pt-24">
            <main className="max-w-3xl mx-auto flex flex-col gap-8 pb-32">
                <section>
                    <h2 className="text-2xl font-semibold text-secondary mb-4">
                        Current Bookings
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        {currentBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white rounded-2xl shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:w-64 items-start sm:items-center"
                            >
                                <div>
                                    <p className="text-primary font-semibold">
                                        Desk: {booking.desk}
                                    </p>
                                    <p className="text-primary font-semibold">
                                        Room: {booking.room}
                                    </p>
                                    <p className="text-primary text-sm mt-1">
                                        {booking.date} | {booking.time}
                                    </p>
                                </div>
                                <button className="mt-4 sm:mt-0 ml-4 sm:ml:0 bg-accent text-white px-3 py-2 rounded-lg hover:bg-accent/90 transition">
                                    Cancel
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-secondary mb-4">
                        Recent Bookings
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        {recentBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white rounded-2xl shadow p-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center"
                            >
                                <div>
                                    <p className="text-primary font-semibold">
                                        Desk: {booking.desk}
                                    </p>
                                    <p className="text-primary font-semibold">
                                        Room: {booking.room}
                                    </p>
                                </div>
                                <button className="mt-4 sm:mt-0 ml-4 sm:ml:0 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition">
                                    Rebook
                                </button>
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
