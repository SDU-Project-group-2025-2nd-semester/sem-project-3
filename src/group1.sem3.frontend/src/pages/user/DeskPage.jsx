import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "@reacticons/bootstrap-icons";
import { get, post, put, del } from "../../context/apiClient";

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

    const hasReservation = !!desk.currentReservation;

    const location = useLocation();

    const [isDamaged, setIsDamaged] = useState(desk.damaged);

    const navigate = useNavigate();

    // Pull from navigation state, if it exists
    const deskName = location.state?.desk ?? desk.name;
    const roomName = location.state?.room ?? desk.room;
    const reservationDate = location.state?.date ?? desk.currentReservation.date;
    const reservationTime = location.state?.time ?? desk.currentReservation.time;

    // Current height (cm)
    const [height, setHeight] = useState(desk.currentHeight);

    // User profile heights (in cm after conversion); null if not set    
    const [userSittingCm, setUserSittingCm] = useState(null);
    const [userStandingCm, setUserStandingCm] = useState(null);
    const [err, setErr] = useState();

    const setSittingHeight = () => {
        setHeight(userSittingCm ?? desk.optimalSitting);
    };
    const setStandingHeight = () => {
        setHeight(userStandingCm ?? desk.optimalStanding);
    };
    
    // Fetch user's profile and convert mm to cm
    useEffect(() => {
        const ctrl = new AbortController();

        (async () => {
            try {
                setErr(undefined);
                const me = await get("/Users/me", { signal: ctrl.signal });
                if (ctrl.signal.aborted) return;

                const sitMm = me?.sittingHeight;
                const standMm = me?.standingHeight;
    
                // Convert to cm with one decimal; ignore non-positive/undefined values
                const sitCm =
                    typeof sitMm === "number" && sitMm > 0 ? +(sitMm / 10).toFixed(1) : null;
                const standCm =
                    typeof standMm === "number" && standMm > 0 ? +(standMm / 10).toFixed(1) : null;

                setUserSittingCm(sitCm);
                setUserStandingCm(standCm);
            } catch (e) {
                if (e?.name === "AbortError") return;
                setErr(e?.body?.message || e?.message);
            }
        })();
   
        return () => ctrl.abort();
    }, []);
    
    // Check if damage was reported
    useEffect(() => {
        if (location.state?.damagedDeskId === desk.name) {
            setIsDamaged(true);

            // Clear navigation state after marking desk as damaged to prevent message showing up repeatedly
            navigate(location.pathname, { replace: true, state: {} });
        }

    }, [location.state, navigate, location.pathname]);

    const reportDamage = () => {
        navigate("/user/damagereport", { state: { tableId: desk.name } });
    };

    return (
        <div className="relative bg-background min-h-screen px-4 pt-24">
            {/* Desk Info */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-primary font-semibold text-xl">Desk: {deskName}</p>
                    <p className="text-primary font-semibold text-lg">Room: {roomName}</p>
                </div>
                <p
                    className={`font-semibold text-sm ${isDamaged ? "text-red-500" : "text-green-500"
                        }`}
                >
                    {/* TODO: Connect 'status' with backend */}
                    {desk.status} {isDamaged && " - Damaged"}
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


            {/* TODO: Connect damage reporting with backend */}    
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
                        Your Reservation: {reservationDate} |{" "}
                        {reservationTime}
                    </p>

                    {/* TODO: Connect available times with backend */}
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

            {/* TODO: implement booking */}
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
