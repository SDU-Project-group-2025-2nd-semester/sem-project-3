import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@features/auth/AuthContext";
import {
    getRooms,
    getDesksForRoom,
    getReservations,
    createReservation,
} from "../user.services";

/* -------------------- utilities -------------------- */

const DayFlag = { 0: 64, 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32 };

const toYmd = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
    ).padStart(2, "0")}`;

const toHHMM = (t) => {
    if (!t) return "00:00";
    const m = String(t).match(/^(\d{2}:\d{2})/);
    return m ? m[1] : String(t).slice(0, 5);
};

const dateAt = (date, hhmm) => new Date(`${date}T${hhmm}:00`);

const hhmmFromDate = (d) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
        2,
        "0"
    )}`;

function mergeIntervals(intervals) {
    if (!intervals.length) return [];
    const merged = [];
    let last = { ...intervals[0] };

    for (let i = 1; i < intervals.length; i++) {
        const cur = intervals[i];
        if (cur.start <= last.end) {
            last.end = new Date(Math.max(last.end, cur.end));
        } else {
            merged.push(last);
            last = { ...cur };
        }
    }
    merged.push(last);
    return merged;
}

function isFullyBooked(reservations, openStart, openEnd) {
    if (!reservations.length) return false;

    const merged = mergeIntervals(
        reservations
            .map((r) => ({
                start: new Date(Math.max(r.start, openStart)),
                end: new Date(Math.min(r.end, openEnd)),
            }))
            .filter((r) => r.end > r.start)
            .sort((a, b) => a.start - b.start)
    );

    return (
        merged.length === 1 &&
        merged[0].start <= openStart &&
        merged[0].end >= openEnd
    );
}

function generateTicks(intervals, step = 15) {
    const out = [];
    for (const { start, end } of intervals) {
        let t = new Date(start);
        t.setMinutes(Math.ceil(t.getMinutes() / step) * step, 0, 0);
        while (t < end) {
            out.push(hhmmFromDate(t));
            t = new Date(t.getTime() + step * 60000);
        }
    }
    return [...new Set(out)];
}

/* -------------------- hook -------------------- */

export function useBooking() {
    const { currentCompany } = useAuth();
    const COMPANY_ID = currentCompany?.id;
    const navigate = useNavigate();
    const location = useLocation();
    const navState = location?.state || {};

    const todayStr = useMemo(() => toYmd(new Date()), []);
    const [selectedDate, setSelectedDate] = useState("");
    const [dateInput, setDateInput] = useState("");

    useEffect(() => {
        if (!selectedDate) setSelectedDate(todayStr);
    }, [todayStr, selectedDate]);

    useEffect(() => setDateInput(selectedDate), [selectedDate]);

    // allow presetting date from navigation state
    useEffect(() => {
        if (navState?.selectedDate || navState?.date) {
            const d = navState.selectedDate || navState.date;
            setSelectedDate(d);
        }
        // only run on mount/navigation state change
    }, [navState?.selectedDate, navState?.date]);

    /* ---------------- rooms ---------------- */

    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [, setRoomsError] = useState(null);

    useEffect(() => {
        if (!COMPANY_ID) return;
        setLoadingRooms(true);
        getRooms(COMPANY_ID)
            .then(setRooms)
            .catch((e) => setRoomsError(e.message))
            .finally(() => setLoadingRooms(false));
    }, [COMPANY_ID]);

    const selectedDateObj = useMemo(
        () => new Date(`${selectedDate}T00:00:00`),
        [selectedDate]
    );

    const openRooms = useMemo(() => {
        const flag = DayFlag[selectedDateObj.getDay()];
        return rooms.filter(
            (r) => (r.openingHours?.daysOfTheWeek ?? 0) & flag
        );
    }, [rooms, selectedDateObj]);

    const [selectedRoom, setSelectedRoom] = useState(null);

    // preset selectedRoom from navigation state when rooms have loaded
    useEffect(() => {
        if (!navState?.roomId) return;
        if (!rooms || !rooms.length) return;
        if (selectedRoom) return;
        const found = rooms.find((r) => String(r.id) === String(navState.roomId));
        if (found) setSelectedRoom(found);
    }, [rooms, navState?.roomId, selectedRoom]);

    /* ---------------- desks ---------------- */

    const [desks, setDesks] = useState([]);
    const [desksLoading, setDesksLoading] = useState(false);
    const [, setDesksError] = useState(null);

    useEffect(() => {
        if (!selectedRoom) return;
        setDesksLoading(true);
        getDesksForRoom(COMPANY_ID, selectedRoom.id)
            .then(setDesks)
            .catch((e) => setDesksError(e.message))
            .finally(() => setDesksLoading(false));
    }, [selectedRoom, COMPANY_ID]);

    const [selectedTable, setSelectedTable] = useState(null);

    // preset selectedTable from navigation state when desks have loaded
    useEffect(() => {
        if (!navState?.deskId) return;
        if (!desks || !desks.length) return;
        if (selectedTable) return;
        const found = desks.find((d) => String(d.id) === String(navState.deskId));
        if (found) setSelectedTable(found);
    }, [desks, navState?.deskId, selectedTable]);

    /* ---------------- reservations ---------------- */

    const [reservationsByDesk, setReservationsByDesk] = useState({});
    const [reservationsLoading, setReservationsLoading] = useState(false);

    useEffect(() => {
        if (!selectedRoom || !desks.length) return;

        setReservationsLoading(true);
        getReservations(COMPANY_ID, {
            startDate: `${selectedDate}T00:00:00Z`,
            endDate: `${selectedDate}T23:59:59Z`,
        })
            .then((data) => {
                const byDesk = {};
                data.forEach((r) => {
                    (byDesk[r.deskId] ||= []).push({
                        start: new Date(r.start),
                        end: new Date(r.end),
                    });
                });
                setReservationsByDesk(byDesk);
            })
            .finally(() => setReservationsLoading(false));
    }, [selectedRoom, desks, selectedDate, COMPANY_ID]);

    /* ---------------- availability ---------------- */

    const openingWindow = useMemo(() => {
        if (!selectedRoom) return null;
        return {
            openStart: dateAt(
                selectedDate,
                toHHMM(selectedRoom.openingHours.openingTime)
            ),
            openEnd: dateAt(
                selectedDate,
                toHHMM(selectedRoom.openingHours.closingTime)
            ),
        };
    }, [selectedRoom, selectedDate]);

    const isDeskFullyBooked = useCallback(
        (deskId) => {
            if (!openingWindow) return false;
            return isFullyBooked(
                reservationsByDesk[deskId] || [],
                openingWindow.openStart,
                openingWindow.openEnd
            );
        },
        [reservationsByDesk, openingWindow]
    );

    const availableIntervals = useMemo(() => {
        if (!selectedTable || !openingWindow) return [];
        const res = reservationsByDesk[selectedTable.id] || [];

        const merged = mergeIntervals(
            res
                .map((r) => ({
                    start: new Date(
                        Math.max(r.start, openingWindow.openStart)
                    ),
                    end: new Date(Math.min(r.end, openingWindow.openEnd)),
                }))
                .filter((r) => r.end > r.start)
                .sort((a, b) => a.start - b.start)
        );

        let cursor = openingWindow.openStart;
        const slots = [];

        merged.forEach((b) => {
            if (cursor < b.start)
                slots.push({ start: cursor, end: b.start });
            cursor = b.end;
        });

        if (cursor < openingWindow.openEnd)
            slots.push({ start: cursor, end: openingWindow.openEnd });

        return slots;
    }, [selectedTable, openingWindow, reservationsByDesk]);

    const startOptions = useMemo(
        () => generateTicks(availableIntervals),
        [availableIntervals]
    );

    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const endOptions = useMemo(() => {
        if (!startTime) return [];
        const interval = availableIntervals.find(
            (i) =>
                hhmmFromDate(i.start) <= startTime &&
                startTime < hhmmFromDate(i.end)
        );
        return interval
            ? generateTicks([interval]).filter((t) => t > startTime)
            : [];
    }, [startTime, availableIntervals]);

    const canBook =
        !!selectedDate && !!selectedTable && !!startTime && !!endTime;

    /* ---------------- booking ---------------- */

    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState(null);

    async function handleBook() {
        if (!canBook) return;
        // clear any previous error before submitting
        setBookingError(null);
        setBookingSubmitting(true);
        try {
            await createReservation(COMPANY_ID, {
                Start: `${selectedDate}T${startTime}:00Z`,
                End: `${selectedDate}T${endTime}:00Z`,
                DeskId: selectedTable.id,
            });
            navigate("/user/homepage", { replace: true });
        } catch (e) {
            setBookingError(e.message);
        } finally {
            setBookingSubmitting(false);
        }
    }

    const availabilityLabel = useMemo(() => {
        if (!availableIntervals.length) return "No availability left on this day.";
        return availableIntervals
            .map((i) => `${hhmmFromDate(i.start)}-${hhmmFromDate(i.end)}`)
            .join(", ");
    }, [availableIntervals]);

    return {
        todayStr,
        dateInput,
        selectedDate,
        rooms,
        openRooms,
        desks,
        selectedRoom,
        selectedTable,
        startTime,
        endTime,
        startOptions,
        endOptions,
        isDeskFullyBooked,
        loadingRooms,
        desksLoading,
        reservationsLoading,
        bookingSubmitting,
        bookingError,
        canBook,
        availabilityLabel,
        handleDateChange: (e) => setSelectedDate(e.target.value),
        handleSelectRoom: setSelectedRoom,
        handleSelectDesk: setSelectedTable,
        setStartTime,
        setEndTime,
        handleBook,
    };
}
