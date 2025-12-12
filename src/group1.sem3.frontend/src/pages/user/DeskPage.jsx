import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Icon from "@reacticons/bootstrap-icons";
import { get, post, put, del } from "../../context/apiClient";
import { useAuth } from "../../context/AuthContext";

export default function DeskPage() {
    const { reservationId } = useParams();
    const { currentCompany } = useAuth();
    const COMPANY_ID = currentCompany?.id;

    const location = useLocation();
    const navigate = useNavigate();

    const [reservationDate, setReservationDate] = useState("");
    const [reservationTime, setReservationTime] = useState("");
    const [deskName, setDeskName] = useState("");
    const [deskId, setDeskId] = useState(null);
    const [roomName, setRoomName] = useState("");
    const [roomId, setRoomId] = useState(null);

    // Success banner when coming back from DamageReportPage
    const [recentlyReported, setRecentlyReported] = useState(false);

    // Current height (cm)
    // TODO: Set this to a default ? - it does not persist
    const [height, setHeight] = useState(null);
  
    const [userSittingCm, setUserSittingCm] = useState(null);
    const [userStandingCm, setUserStandingCm] = useState(null);

    const [err, setErr] = useState();
    const [loadingDetails, setLoadingDetails] = useState(true);

    // Helpers 
    const toCm = (mm) =>
        typeof mm === "number" && mm > 0 ? +(mm / 10).toFixed(1) : null;

    const fmtDate = (d) =>
        new Date(d).toLocaleDateString([], { day: "2-digit", month: "2-digit" });

    const fmtTime = (d) =>
        new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const setSittingHeight = () => {
        setHeight(userSittingCm ?? 70);
    };
    const setStandingHeight = () => {
        setHeight(userStandingCm ?? 110);
    };
    
    // Fetch user's profile and convert mm to cm
    useEffect(() => {
        const ctrl = new AbortController();

        (async () => {
            try {
                setErr(undefined);
                const me = await get("/Users/me", { signal: ctrl.signal });
                if (ctrl.signal.aborted) return;

                const sitCm = toCm(me?.sittingHeight);
                const standCm = toCm(me?.standingHeight);

                setUserSittingCm(sitCm);
                setUserStandingCm(standCm);
            } catch (e) {
                if (e?.name === "AbortError") return;
                setErr(e?.body?.message || e?.message);
            }
        })();
   
        return () => ctrl.abort();
    }, []);
    
    // Fetch reservation by reservationId --> get deskId, date, time
    useEffect(() => {
        if (!COMPANY_ID || !reservationId) return;
        const ctrl = new AbortController();

        (async () => {
        try {
            setLoadingDetails(true);
            setErr(null);
            
            const rsv = await get(`/${COMPANY_ID}/reservation/${reservationId}`, { signal: ctrl.signal });

            if (ctrl.signal.aborted) return;

            setDeskId(rsv.deskId);
            setReservationDate(fmtDate(rsv.start));
            setReservationTime(`${fmtTime(rsv.start)}-${fmtTime(rsv.end)}`);
        } catch (e) {
            if (e?.name === "AbortError") return;
            setErr(e?.body?.message || e?.message || "Failed to load reservation.");
        } finally {
            if (!ctrl.signal.aborted) setLoadingDetails(false);
        }
        })();

        return () => ctrl.abort();
    }, [COMPANY_ID, reservationId]);

    // Fetch desk and room readable ids once we know deskId
    useEffect(() => {
        if (!COMPANY_ID || !deskId) return;

        const ctrl = new AbortController();
        (async () => {
        try {
            setLoadingDetails(true);
            setErr(undefined);

            const desk = await get(`/${COMPANY_ID}/Desks/${deskId}`, { signal: ctrl.signal });
            if (ctrl.signal.aborted) return;

            const readable = desk?.readableId ?? deskId;
            setDeskName(readable);

            const rid = desk?.roomId ?? null;
            setRoomId(rid);

            // set current height from desk payload (mm -> cm)
            const currentHeightCm = toCm(desk?.height);
            setHeight(currentHeightCm);

            const deskRoomLabel = desk?.room?.readableId ?? "";
            if (deskRoomLabel) {
            setRoomName(deskRoomLabel);
            } else if (rid) {
                try {
                    const room = await get(`/${COMPANY_ID}/Rooms/${rid}`, { signal: ctrl.signal });
                    setRoomName(room?.readableId ?? "");
                } catch (re) {
                    console.error("Failed to fetch room:", re);
                    setRoomName("");
                }
            }
        } catch (e) {
            if (e?.name === "AbortError") return;
            setErr(e?.body?.message || e?.message || "Failed to load desk details");
        } finally {
            if (!ctrl.signal.aborted) setLoadingDetails(false);
        }
        })();

        return () => ctrl.abort();
    }, [COMPANY_ID, deskId]);

    // Show a transient banner when returning with damagedReservationId
    useEffect(() => {
        if (location.state?.damagedReservationId === reservationId) {
            setRecentlyReported(true);

            // Clear state so the banner doesn't keep re-appearing
            navigate(location.pathname, { replace: true, state: { ...location.state, damagedReservationId: undefined } });
            
            const t = setTimeout(() => setRecentlyReported(false), 3000);
            return () => clearTimeout(t);
        }
    }, [location.state, navigate, location.pathname, reservationId]);

    const reportDamage = () => {
        if (!deskId) return;
        navigate("/user/damagereport", { state: { tableId: deskId, table: deskName, companyId: COMPANY_ID, reservationId } });
    };

    return (
        <div className="relative bg-background min-h-screen px-4 pt-24">
            {/* Banner after reporting damage */}
            {recentlyReported && (
                <div className="mb-4 px-3 py-2 rounded bg-green-100 text-green-800">
                Damage reported for this desk.
                </div>
            )}

            {/* Desk Info */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-primary font-semibold text-xl">Desk: {loadingDetails ? "..." : deskName || deskId}</p>
                    <p className="text-primary font-semibold text-lg">Room: {loadingDetails ? "..." : roomName || roomId}</p>
                </div>
            </div>

            
            <div className="mt-6 flex justify-center">
                <div>
                <p className="text-primary font-semibold">
                    Current Height: {height ?? "-"} cm
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
            </div>
    
            {/* Report Damage */}
            <div className="mt-4 flex justify-center">
                <button
                    onClick={reportDamage}
                    className="bg-red-500/80 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition text-sm w-full max-w-xs sm:w-auto"
                >
                    Report Damage
                </button>
            </div>

            {/* Reservation Info */}
            <div className="mt-6 space-y-2">
                <p className="text-primary text-sm">
                    Your Reservation: {reservationDate} |{" "}
                    {reservationTime}
                </p>
            </div>

            {/* Book Button */}
            <Link
                to="/user/booking"
                state={{
                    mode: "rebook",
                    roomId,
                    roomName,
                    deskId,
                    deskName,
                }}
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md bg-accent text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:bg-accent/90 transition z-30 block text-center"
            >
                Book Again
            </Link>
            
            {err && (
                <div className="mt-4 text-red-600 text-sm">
                {String(err)}
                </div>
            )}
        </div>
    );
}
