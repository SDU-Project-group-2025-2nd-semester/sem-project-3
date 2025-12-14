import FloatingActionButton from "@shared/ui/FloatingActionButton";
import NotificationBanner from "@shared/ui/NotificationBanner";
import { useDeskDetails } from "../hooks/useDeskDetails"; 
import { useParams } from "react-router-dom";

export default function DeskPage() {
    const { reservationId } = useParams();

    const {
        reservationDate,
        reservationTime,
        deskName,
        deskId,
        roomName,
        roomId,
        recentlyReported,
        height,
        setSittingHeight,
        setStandingHeight,
        loadingDetails,
        err,
        reportDamage,
    } = useDeskDetails({ reservationId });

    return (
        <div className="relative bg-background min-h-screen px-4 pt-24">
            {recentlyReported && <NotificationBanner type="success">Damage reported for this desk.</NotificationBanner>}

            <div className="flex justify-between items-start">
                <div>
                    <p className="text-primary font-semibold text-xl">Desk: {loadingDetails ? "..." : deskName || deskId}</p>
                    <p className="text-primary font-semibold text-lg">Room: {loadingDetails ? "..." : roomName || roomId}</p>
                </div>
            </div>

            <div className="mt-6 flex justify-center">
                <div>
                    <p className="text-primary font-semibold">Current Height: {height ?? "-"} cm</p>
                    <div className="flex gap-3 mt-3">
                        <button onClick={setSittingHeight} className="bg-accent text-white px-3 py-2 rounded-lg hover:bg-secondary transition text-sm flex items-center">
                            Set Sitting Height
                        </button>
                        <button onClick={setStandingHeight} className="bg-accent text-white px-3 py-2 rounded-lg hover:bg-secondary transition text-sm flex items-center">
                            Set Standing Height
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex justify-center">
                <button onClick={reportDamage} className="bg-red-500/80 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition text-sm w-full max-w-xs sm:w-auto">
                    Report Damage
                </button>
            </div>

            <div className="mt-6 space-y-2">
                <p className="text-primary text-sm">Your Reservation: {reservationDate} | {reservationTime}</p>
            </div>

            <FloatingActionButton
                to="/user/booking"
                state={{ mode: "rebook", roomId, roomName, deskId, deskName }}
            >
                Book Again
            </FloatingActionButton>

            {err && <div className="mt-4 text-red-600 text-sm">{String(err)}</div>}
        </div>
    );
}
