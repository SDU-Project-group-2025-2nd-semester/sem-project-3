import { useState } from "react";

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
    };

    const [height, setHeight] = useState(desk.currentHeight);

    const setSittingHeight = () => setHeight(desk.optimalSitting);
    const setStandingHeight = () => setHeight(desk.optimalStanding);

    const reportDamage = () => {
        alert("Damage report submitted!");
    };

    return (
        <div className="relative bg-background min-h-screen px-4 pt-24">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-primary font-semibold text-xl">
                                Desk: {desk.name}
                            </p>
                            <p className="text-primary font-semibold text-lg">
                                Room: {desk.room}
                            </p>
                        </div>
                        <div>
                            <p
                                className={`font-semibold text-sm ${desk.damaged ? "text-red-500" : "text-green-500"
                                    }`}
                            >
                                {desk.status} {desk.damaged && " - Damaged"}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-primary font-semibold">
                            Current Height: {height} cm
                        </p>
                        {desk.currentReservation && (
                            <p className="text-primary text-sm mt-1">
                                Reserved: {desk.currentReservation.date} |{" "}
                                {desk.currentReservation.time} ({desk.currentReservation.bookedBy})
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={setSittingHeight}
                            className="bg-accent text-white px-3 py-2 rounded-lg hover:bg-secondary transition text-sm"
                        >
                            Sitting Height
                        </button>
                        <button
                            onClick={setStandingHeight}
                            className="bg-accent text-white px-3 py-2 rounded-lg hover:bg-secondary transition text-sm"
                        >
                            Standing Height
                        </button>
                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={reportDamage}
                            className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                        >
                            Report Damage
                        </button>
                    </div>
        </div>
    );
}
