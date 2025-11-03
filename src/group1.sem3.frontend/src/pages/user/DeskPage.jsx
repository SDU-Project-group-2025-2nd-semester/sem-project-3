import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "@reacticons/bootstrap-icons";

export default function DeskPage() {
    const desk = {
        name: "D-101",
        room: "R-12",
        status: "Booked",
        damaged: false,
        currentHeight: 72,
        optimalSitting: 70,
        optimalStanding: 110,
        currentReservation: {
            date: "25.10",
            time: "14:00-16:00",
            bookedBy: "You",
        },
        availableTimes: ["08:00 - 10:00", "10:30 - 12:30", "16:30 - 18:30"],
    };

    const [height, setHeight] = useState(desk.currentHeight);
    const setSittingHeight = () => setHeight(desk.optimalSitting);
    const setStandingHeight = () => setHeight(desk.optimalStanding);

    const hasReservation = !!desk.currentReservation;

    const location = useLocation();

    const [isDamaged, setIsDamaged] = useState(desk.damaged);

    // Check if damage was reported
    useEffect(() => {
        if (location.state?.damagedDeskId === desk.name) {
            setIsDamaged(true);

            // Clear navigation state after marking desk as damaged to prevent message showing up repeatedly
            navigate(location.pathname, { replace: true, state: {} });
        }

    }, [location.state]);

    const navigate = useNavigate();

    const reportDamage = () => {
        navigate("/user/damagereport", { state: { tableId: desk.name } });
    };

    return (
        <div className="relative bg-background min-h-screen px-4 pt-24">
            {/* Desk Info */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-primary font-semibold text-xl">Desk: {desk.name}</p>
                    <p className="text-primary font-semibold text-lg">Room: {desk.room}</p>
                </div>
                <p
                    className={`font-semibold text-sm ${desk.damaged ? "text-red-500" : "text-green-500"
                        }`}
                >
                    {desk.status} {desk.damaged && " - Damaged"}
                </p>
            </div>

            
            <div className="mt-6 flex justify-center">
                {hasReservation && (
                    <div>
                    <p className="text-primary font-semibold">
                        Current Height: {height} cm
                    </p>

                    <div className="flex gap-3 mt-3">
                        <button
                            onClick={setSittingHeight}
                            className="bg-accent text-white px-3 py-2 rounded-lg hover:bg-secondary transition text-sm flex items-center"
                        >
                            <Icon name="arrow-down" className="w-4 h-4 mr-2" />
                            Set Sitting Height
                        </button>

                        <button
                            onClick={setStandingHeight}
                            className="bg-accent text-white px-3 py-2 rounded-lg hover:bg-secondary transition text-sm flex items-center"
                        >
                            <Icon name="arrow-up" className="w-4 h-4 mr-2" />
                            Set Standing Height
                        </button>
                        </div>
                    </div>
                )}
            </div>


            {/* Report Damage */}
            <div className="mt-4 flex justify-center">

                {!isDamaged ? (
                    <button
                        onClick={reportDamage}
                        className="bg-red-500/80 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition text-sm w-full max-w-xs sm:w-auto"
                    >
                        Report Damage
                    </button>
                ) : (
                    <span className="text-red-600 text-sm font-semibold">
                        Damage reported
                    </span>
                )}
            </div>

            {/* Reservation Info */}
            {hasReservation && (
                <div className="mt-6 space-y-2">
                    <p className="text-primary text-sm">
                        Your Reservations: {desk.currentReservation.date} |{" "}
                        {desk.currentReservation.time}
                    </p>

                    {/* Available times */}
                    <div>
                        <p className="text-primary font-semibold text-sm mb-1">
                            Available times today:
                        </p>
                        <ul className="text-sm text-primary text-muted-foreground list-disc list-inside">
                            {desk.availableTimes.map((slot) => (
                                <li key={slot}>{slot}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Book Button */}
            <Link
                to="/user/booking"
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md bg-accent text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:bg-accent/90 transition z-30 block text-center"
            >
                {hasReservation ? "Book Again" : "Book"}
            </Link>
        </div>
    );
}
