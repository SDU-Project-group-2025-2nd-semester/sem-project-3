import { useState } from "react";
import { Link } from "react-router-dom";
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
    };

    const [height, setHeight] = useState(desk.currentHeight);

    const setSittingHeight = () => setHeight(desk.optimalSitting);

    const setStandingHeight = () => setHeight(desk.optimalStanding);

    const reportDamage = () => {
        alert("Damage report submitted!");
    };

    return (
        <div className="relative bg-background min-h-screen px-4 pt-24">

            {/* Desk Info and Status */}
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
                        className={`font-semibold text-sm ${desk.damaged ? "text-red-500" : "text-green-500"}`}
                    >
                        {desk.status} {desk.damaged && " - Damaged"}
                    </p>
                </div>
            </div>

            {/* Height Info and Buttons */}
            <div className="mt-6">
                <p className="text-primary font-semibold">
                    Current Height: {height} cm
                </p>

                <div className="flex gap-3 mt-3">
                    <button
                        onClick={setSittingHeight}
                        className="bg-accent text-white px-3 py-2 rounded-lg hover:bg-secondary transition text-sm"
                    >
                        <Icon name="arrow-down" className="w-4 h-4 mr-2" />
                        Set Sitting Height
                    </button>

                    <button
                        onClick={setStandingHeight}
                        className="bg-accent text-white px-3 py-2 rounded-lg hover:bg-secondary transition text-sm"
                    >
                        <Icon name="arrow-up" className="w-4 h-4 mr-2" />
                        Set Standing Height
                    </button>
                </div>

                {/* Report Damage Button */}
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={reportDamage}
                        className="bg-red-500/80 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition text-sm w-full max-w-xs sm:w-auto"
                    >
                        Report Damage
                    </button>
                </div>

            </div>

            {/* Reservation Info */}
            {desk.currentReservation && (
                <div className="mt-6">
                    <p className="text-primary text-sm">
                        Reserved:
                        {desk.currentReservation.date} | {desk.currentReservation.time} ({desk.currentReservation.bookedBy})
                    </p>
                </div>
            )}

            {/* Fixed Book Button */}
            <Link
                to="/user/booking"
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md bg-accent text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:bg-accent/90 transition z-30 block text-center"
            >
                Book
            </Link>

        </div>
    );
}
