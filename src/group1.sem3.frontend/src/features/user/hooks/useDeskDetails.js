import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@features/auth/AuthContext";
import { getMyProfile, getDeskById, getRoomById, putDeskHeight, getReservation } from "../user.services";

export function useDeskDetails({ reservationId }) {
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

    const [recentlyReported, setRecentlyReported] = useState(false);
    const [height, setHeight] = useState(null);
    const [userSittingCm, setUserSittingCm] = useState(null);
    const [userStandingCm, setUserStandingCm] = useState(null);

    const [err, setErr] = useState();
    const [loadingDetails, setLoadingDetails] = useState(true);

    // reservation timing
    const [reservationStart, setReservationStart] = useState(null);
    const [reservationEnd, setReservationEnd] = useState(null);

    // Helpers
    const toCm = (mm) => (typeof mm === "number" && mm > 0 ? +(mm / 10).toFixed(1) : null);
    const fmtDate = (d) => new Date(d).toLocaleDateString([], { day: "2-digit", month: "2-digit" });
    const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Compute if reservation is currently active
    const isReservationActive = reservationStart && reservationEnd ? (new Date() >= reservationStart && new Date() <= reservationEnd) : false;

    // Replace local-only setters with API calls that persist the new height
    const setSittingHeight = async () => {
        if (!COMPANY_ID || !deskId) return;
        if (!isReservationActive) return; // only allow when reservation is active
        const newCm = userSittingCm ?? 70;
        const newMm = Math.round(newCm * 10);
        try {
            setErr(undefined);
            await putDeskHeight(COMPANY_ID, deskId, newMm);
            setHeight(newCm);
        } catch (e) {
            setErr(e?.body?.message || e?.message || "Failed to set desk height");
        }
    };

    const setStandingHeight = async () => {
        if (!COMPANY_ID || !deskId) return;
        if (!isReservationActive) return; // only allow when reservation is active
        const newCm = userStandingCm ?? 110;
        const newMm = Math.round(newCm * 10);
        try {
            setErr(undefined);
            await putDeskHeight(COMPANY_ID, deskId, newMm);
            setHeight(newCm);
        } catch (e) {
            setErr(e?.body?.message || e?.message || "Failed to set desk height");
        }
    };

    // --- Fetch user profile ---
    useEffect(() => {
        const ctrl = new AbortController();
        (async () => {
            try {
                setErr(undefined);
                const me = await getMyProfile({ signal: ctrl.signal });
                if (ctrl.signal.aborted) return;
                setUserSittingCm(toCm(me?.sittingHeight));
                setUserStandingCm(toCm(me?.standingHeight));
            } catch (e) {
                if (e?.name !== "AbortError") setErr(e?.body?.message || e?.message);
            }
        })();
        return () => ctrl.abort();
    }, []);

    // --- Fetch reservation details ---
    useEffect(() => {
        if (!COMPANY_ID || !reservationId) return;
        const ctrl = new AbortController();
        (async () => {
            try {
                setLoadingDetails(true);
                setErr(null);
                const rsv = await getReservation(COMPANY_ID, reservationId, { signal: ctrl.signal });
                if (ctrl.signal.aborted) return;
                setDeskId(rsv.deskId);
                setReservationDate(fmtDate(rsv.start));
                setReservationTime(`${fmtTime(rsv.start)}-${fmtTime(rsv.end)}`);
                setReservationStart(new Date(rsv.start));
                setReservationEnd(new Date(rsv.end));
            } catch (e) {
                if (e?.name !== "AbortError") setErr(e?.body?.message || e?.message || "Failed to load reservation.");
            } finally {
                if (!ctrl.signal.aborted) setLoadingDetails(false);
            }
        })();
        return () => ctrl.abort();
    }, [COMPANY_ID, reservationId]);

    // --- Fetch desk & room details ---
    useEffect(() => {
        if (!COMPANY_ID || !deskId) return;
        const ctrl = new AbortController();
        (async () => {
            try {
                setLoadingDetails(true);
                setErr(undefined);
                const desk = await getDeskById(COMPANY_ID, deskId, { signal: ctrl.signal });
                if (ctrl.signal.aborted) return;

                setDeskName(desk?.readableId ?? deskId);
                setRoomId(desk?.roomId ?? null);
                setHeight(toCm(desk?.height));

                if (desk?.room?.readableId) {
                    setRoomName(desk.room.readableId);
                } else if (desk?.roomId) {
                    try {
                        const room = await getRoomById(COMPANY_ID, desk.roomId, { signal: ctrl.signal });
                        setRoomName(room?.readableId ?? "");
                    } catch {
                        setRoomName("");
                    }
                }
            } catch (e) {
                if (e?.name !== "AbortError") setErr(e?.body?.message || e?.message || "Failed to load desk details");
            } finally {
                if (!ctrl.signal.aborted) setLoadingDetails(false);
            }
        })();
        return () => ctrl.abort();
    }, [COMPANY_ID, deskId]);

    // --- Handle recently reported damage ---
    useEffect(() => {
        if (location.state?.damagedReservationId === reservationId) {
            setRecentlyReported(true);
            navigate(location.pathname, { replace: true, state: { ...location.state, damagedReservationId: undefined } });
            const t = setTimeout(() => setRecentlyReported(false), 3000);
            return () => clearTimeout(t);
        }
    }, [location.state, navigate, location.pathname, reservationId]);

    const reportDamage = () => {
        if (!deskId) return;
        navigate("/user/damagereport", {
            state: { tableId: deskId, table: deskName, companyId: COMPANY_ID, reservationId },
        });
    };

    return {
        reservationDate,
        reservationTime,
        deskName,
        deskId,
        roomName,
        roomId,
        recentlyReported,
        height,
        userSittingCm,
        userStandingCm,
        setSittingHeight,
        setStandingHeight,
        loadingDetails,
        err,
        reportDamage,
        isReservationActive,
        reservationStart,
        reservationEnd,
    };
}
