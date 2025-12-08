import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { get, post, put, del } from "../../context/apiClient";

export default function BookingPage() {   
    const { currentCompany } = useAuth();
    const COMPANY_ID = currentCompany?.id;
   
    // #region Date Selection
    // JS Date.getDay(): 0=Sunday, ..., 6=Saturday
    const DayFlag = {
        0: 64, 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32,
    };
    
    function toYmd(d) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    function isPastDateStr(str) {
        if (!str) return false;
        const today = new Date();
        const todayYmd = toYmd(today);
        return str < todayYmd;
    }

    // Today's date (YYYY-MM-DD) for min attribute
    const todayStr = useMemo(() => toYmd(new Date()), []);
    const [selectedDate, setSelectedDate] = useState("");
    
    // Raw input the user is typing
    const [dateInput, setDateInput] = useState("");
    
    // Keep input in sync when selectedDate changes programmatically
    useEffect(() => {
        setDateInput(selectedDate || "");
    }, [selectedDate]);

    const selectedDateObj = useMemo(
        () => (selectedDate ? new Date(`${selectedDate}T00:00:00`) : null), // as local midnight
        [selectedDate]
    );   

    function handleDateChange(e) {
        // Prefer valueAsDate when available (avoids timezone pitfalls)
        const v = e.target.value;
        const d = e.target.valueAsDate; // Date | null
        setDateInput(v);

        // Don't show errors while typing
        e.target.setCustomValidity("");

        // Only update selectedDate when a full ISO date is present and valid
        const fullDate = /^\d{4}-\d{2}-\d{2}$/.test(v);
        if (!fullDate) return;

        if (d) {
            const typedYmd = toYmd(d);
            if (typedYmd < todayStr) {
                e.target.setCustomValidity("Past dates cannot be chosen.");
                return;
            }
            setSelectedDate(typedYmd);
            return;
        }
        
        if (!isPastDateStr(v)) {
            setSelectedDate(v);
        } else {
            e.target.setCustomValidity("Past dates cannot be chosen.");
        }
    }

    function handleDateBlur(e) {
        // Validate on blur to catch manual edits
        const v = e.target.value;
        // On blur, finalize the value (invalid/past to today)
        if (!v) {
            setSelectedDate("");
            setDateInput("");
            e.target.setCustomValidity("");
            return;
        }
        const fullDate = /^\d{4}-\d{2}-\d{2}$/.test(v);
        if (!fullDate || isPastDateStr(v)) {
            setSelectedDate(todayStr);
            setDateInput(todayStr);
            e.target.setCustomValidity("Past dates cannot be chosen.");
        } else {
            e.target.setCustomValidity("");
            setSelectedDate(v);
            setDateInput(v);
        }
    }
    //#endregion

    //#region Room Selection
    function useRooms(companyId) {
        const [rooms, setRooms] = useState([]);
        const [loadingRooms, setLoadingRooms] = useState(false);
        const [roomsError, setRoomsError] = useState(null);

        useEffect(() => {
            if (!companyId) {
                setRooms([]);
                setLoadingRooms(false);
                setRoomsError(null);
                return;
            }

            let abort = false;
            setLoadingRooms(true);
            setRoomsError(null);

            (async () => {
                try {                    
                    const data = await get(`/${companyId}/rooms`);
                    if (!abort) setRooms(Array.isArray(data) ? data : []);

                } catch (err) {
                    if (!abort) {
                        setRoomsError(err?.message || String(err));
                        setRooms([]);
                    }
                } finally {
                    if (!abort) setLoadingRooms(false);
                }
            })();

            return () => { abort = true; };
        }, [companyId]);

        return { rooms, loadingRooms, roomsError };
    }

    const { rooms, loadingRooms, roomsError } = useRooms(COMPANY_ID);

    // Filter rooms that are open on the selected date
    const openRooms = useMemo(() => {
        if (!selectedDateObj || !rooms.length) return [];
        const jsDow = selectedDateObj.getDay(); // 0...6, Sun...Sat
        const dayFlag = DayFlag[jsDow];
        return rooms.filter((r) => {
            const mask = r?.openingHours?.daysOfTheWeek ?? 0;
            return (mask & dayFlag) !== 0;
        });
    }, [rooms, selectedDateObj]);

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
  
    // Auto-select the first open room after date selection
    useEffect(() => {
        if (!selectedDateObj || loadingRooms) return;

        if (openRooms.length > 0) {
            if (!selectedRoom || !openRooms.some(r => r.id === selectedRoom.id)) {
                setSelectedRoom(openRooms[0]);
                // Clear further selections when the room changes
                setSelectedTable(null);
                setStartTime("");
                setEndTime("");
            }
        } else {
            // No rooms open for the selected date --> clear the selection
            if (selectedRoom) {
                setSelectedRoom(null);
                setSelectedTable(null);
                setStartTime("");
                setEndTime("");
            }
        }
    }, [selectedDateObj, loadingRooms, openRooms, selectedRoom]);
 
    const canBook = Boolean(selectedDate) && Boolean(selectedTable?.id) && Boolean(startTime) && Boolean(endTime);
    
    // Reset selections when changing room/date
    function handleSelectRoom(room) {
        setSelectedRoom(room);
        setSelectedTable(null);
        setStartTime("");
        setEndTime("");
    }
    
    function handleSelectDesk(deskId) {
        setSelectedTable(deskId);
        setStartTime("");
        setEndTime("");
    }
    //#endregion

    //#region Desk Selection
    const [desks, setDesks] = useState([]);
    const [desksLoading, setDesksLoading] = useState(false);
    const [desksError, setDesksError] = useState(null);

    useEffect(() => {
        // Clear desks when room changes
        setDesks([]);
        setDesksError(null);

        if (!selectedRoom || !COMPANY_ID) {
            setDesksLoading(false);
            return;
        }

        let aborted = false;
        setDesksLoading(true);

        (async () => {
            try {
                const data = await get(`/${COMPANY_ID}/desks/room/${selectedRoom.id}`);

                if (!aborted) setDesks(Array.isArray(data) ? data : []);
            } catch (err) {
                if (!aborted) {            
                    if (err.status === 404) {
                        // No desks found for this room
                        setDesks([]);
                        setDesksError(null);
                    } else {
                        setDesksError(err?.message || String(err));
                        setDesks([]);
                    }
                }
            } finally {
                if (!aborted) setDesksLoading(false);
            }
        })();

        return () => { aborted = true; };
    }, [selectedRoom, COMPANY_ID]);
    //#endregion

    //#region Reservation Connection
    const [reservationsByDesk, setReservationsByDesk] = useState({});
    const [reservationsLoading, setReservationsLoading] = useState(false);
    const [reservationsError, setReservationsError] = useState(null);

    useEffect(() => {
        setReservationsByDesk({});
        setReservationsError(null);

        if (!selectedRoom || !COMPANY_ID || !selectedDate || !Array.isArray(desks)) {
            setReservationsLoading(false);
            return;
        }
        
        // USe local time, but convert to UTC before sending to the server
        const dayStartUTC = new Date(`${selectedDate}T00:00:00`).toISOString();
        const dayEndUTC   = new Date(`${selectedDate}T23:59:59.999`).toISOString();

        let aborted = false;
        setReservationsLoading(true);

        (async () => {
            try {
                const qs = `?startDate=${encodeURIComponent(dayStartUTC)}&endDate=${encodeURIComponent(dayEndUTC)}`;
                const data = await get(`/${COMPANY_ID}/Reservation${qs}`);

                // Normalize to Date objects
                const normalized = Array.isArray(data)
                    ? data.map(r => ({
                        id: r.id,
                        deskId: r.deskId,
                        start: new Date(r.start),
                        end: new Date(r.end),
                    }))
                    : [];

                // Only keep reservations for desks in the selected room
                const deskIdsInRoom = new Set(desks.map(d => d.id));
                const filtered = normalized.filter(r => deskIdsInRoom.has(r.deskId));

                const byDesk = filtered.reduce((acc, r) => {
                    (acc[r.deskId] ||= []).push(r);
                    return acc;
                }, {});

                if (!aborted) setReservationsByDesk(byDesk);
            } catch (err) {
                if (!aborted) {
                    setReservationsError(err?.message || String(err));
                    setReservationsByDesk({});
                }
            } finally {
                if (!aborted) setReservationsLoading(false);
            }
        })();

        return () => { aborted = true; };
    }, [selectedRoom, COMPANY_ID, selectedDate, desks]);

    // Extract "HH:MM" from backend time strings like "15:27:03.783Z" or "08:00:00"
    function toHHMMFromBackendTimeString(t) {
        if (!t) return "00:00";
        const m = String(t).match(/^(\d{2}:\d{2})/);
        return m ? m[1] : String(t).slice(0, 5);
    }

    // Build a local Date for the selected date at a given HH:MM
    function dateAtHHMM(dateStr, hhmm) {
        return new Date(`${dateStr}T${hhmm}:00`);
    }
    
    // Format a Date -> "HH:MM" (zero-padded)
    function hhmmFromDate(d) {
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    }

    // Clip a reservation interval to the opening window; drop if no overlap
    function clipInterval(resStart, resEnd, openStart, openEnd) {
        const start = new Date(Math.max(resStart.getTime(), openStart.getTime()));
        const end = new Date(Math.min(resEnd.getTime(), openEnd.getTime()));
        return end > start ? { start, end } : null;
    }

    // Merge overlapping/contiguous intervals (assumes sorted by start)
    function mergeIntervals(intervals) {
        if (!intervals.length) return [];
        const merged = [];
        let last = { ...intervals[0] };
        for (let i = 1; i < intervals.length; i++) {
            const cur = intervals[i];
            if (cur.start <= last.end) {
                if (cur.end > last.end) last.end = cur.end; // extend
            } else {
                merged.push(last);
                last = { ...cur };
            }
        }
        merged.push(last);
        return merged;
    }

    // Compute complement intervals (available slots) inside [openStart, openEnd] minus merged reservations
    function complementIntervals(openStart, openEnd, mergedBusy) {
        const slots = [];
        let cursor = openStart;
        for (const b of mergedBusy) {
            if (cursor < b.start) slots.push({ start: new Date(cursor), end: new Date(b.start) });
            if (b.end > cursor) cursor = b.end;
        }
        if (cursor < openEnd) slots.push({ start: new Date(cursor), end: new Date(openEnd) });
        return slots;
    }

    // True if reservations fully cover the opening window (no gaps).
    function isFullyBooked(reservations, openStart, openEnd) {
        const clipped = reservations
            .map(r => clipInterval(r.start, r.end, openStart, openEnd))
            .filter(Boolean)
            .sort((a, b) => a.start - b.start);

        if (clipped.length === 0) return false;

        const merged = mergeIntervals(clipped);
        const first = merged[0];
        const last = merged[merged.length - 1];

        return merged.length === 1 && first.start <= openStart && last.end >= openEnd;
    }

    // Is the selected date today? 
    const isToday = useMemo(() => {
        if (!selectedDate) return false;
        const localTodayStr = String(new Date().getFullYear()).padStart(4, "0")
            + "-" + String(new Date().getMonth() + 1).padStart(2, "0")
            + "-" + String(new Date().getDate()).padStart(2, "0");
        return selectedDate === localTodayStr;
    }, [selectedDate]);

    // Available intervals for the selected desk on the selected day
    const availableIntervals = useMemo(() => {
        if (!selectedRoom || !selectedTable || !selectedDate) return [];

        const openHHMM  = toHHMMFromBackendTimeString(selectedRoom?.openingHours?.openingTime);
        const closeHHMM = toHHMMFromBackendTimeString(selectedRoom?.openingHours?.closingTime);
        const openStart = dateAtHHMM(selectedDate, openHHMM);   // local
        const openEnd   = dateAtHHMM(selectedDate, closeHHMM);  // local

        const res = (selectedTable?.id && reservationsByDesk[selectedTable.id]) ? reservationsByDesk[selectedTable.id] : [];
        const clipped = res
            .map(r => clipInterval(r.start, r.end, openStart, openEnd))
            .filter(Boolean)
            .sort((a, b) => a.start - b.start);

        const mergedBusy = mergeIntervals(clipped);
        let slots = complementIntervals(openStart, openEnd, mergedBusy);

        // If the date is today: only show future hours
        if (isToday) {
            const now = new Date();
            slots = slots.map(s => {
                const start = new Date(Math.max(s.start.getTime(), now.getTime()));
                return start < s.end ? { start, end: s.end } : null;
            }).filter(Boolean);
        }

        return slots;
    }, [selectedRoom, selectedTable, selectedDate, reservationsByDesk, isToday]);
    
    // Generate "HH:MM" ticks from intervals (rounded up to step)
    function generateTicksFromIntervals(intervals, stepMinutes = 15) {
        const out = [];
        for (const { start, end } of intervals) {
            let t = new Date(start);
            // Round up to the next step
            const minutes = t.getMinutes();
            const roundedMinutes = Math.ceil(minutes / stepMinutes) * stepMinutes;
            t.setMinutes(roundedMinutes, 0, 0);
            while (t <= end) {
                out.push(hhmmFromDate(t));
                t = new Date(t.getTime() + stepMinutes * 60000);
            }
        }
        // Remove duplicates
        return [...new Set(out)];
    }

    // Build start options from availableIntervals
    const startOptions = useMemo(() => {
        return generateTicksFromIntervals(availableIntervals, 15);
    }, [availableIntervals]);

    // Build end options: must be within the SAME interval as selected start, and strictly > start
    const endOptions = useMemo(() => {
        if (!startTime) return [];
        // Find the interval that contains selected start
        const interval = availableIntervals.find(({ start, end }) => {
            const sStr = hhmmFromDate(start);
            const eStr = hhmmFromDate(end);
            // start is inside if sStr <= startTime < eStr
            return sStr <= startTime && startTime < eStr;
        });
        if (!interval) return [];

        // Generate ticks for that interval and keep those > startTime
        const ticks = generateTicksFromIntervals([interval], 15).filter(t => t > startTime);
        return ticks;
    }, [availableIntervals, startTime]);
    
    // Display the available times in a readable way
    function formatIntervalLabel(interval) {
        return `${hhmmFromDate(interval.start)}–${hhmmFromDate(interval.end)}`;
    }

    const availabilityLabel = useMemo(() => {
        if (!availableIntervals.length) return "No availability left today.";
        return availableIntervals.map(formatIntervalLabel).join(", ");
    }, [availableIntervals]);
    //#endregion

    //#region Booking
    // Track booking submission
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState(null);

    // Construct local Date from selected date+HH:MM, then to UTC
    function buildUtcIso(dateStr, hhmm) {
        // dateStr = "YYYY-MM-DD", hhmm = "HH:MM"
        const local = new Date(`${dateStr}T${hhmm}:00`);
        return local.toISOString();
    }

    function isValidTimeRange(startHHMM, endHHMM) {
        return !!startHHMM && !!endHHMM && endHHMM > startHHMM;
    }

    async function handleBook() {
        setBookingError(null);

        // Guards
        if (!COMPANY_ID) {
            setBookingError("Company not available.");
            return;
        }
        if (!selectedDate) {
            setBookingError("Please select a date.");
            return;
        }
        const deskId = selectedTable?.id;
        if (!deskId) {
            setBookingError("Please select a desk.");
            return;
        }
        if (!isValidTimeRange(startTime, endTime)) {
            setBookingError("Please choose a valid time range (start must be before end).");
            return;
        }

        // Build UTC ISO strings to send to the backend
        const startUtc = buildUtcIso(selectedDate, startTime);
        const endUtc   = buildUtcIso(selectedDate, endTime);

        const payload = {
            Start: startUtc,
            End: endUtc,
            DeskId: deskId,
        };

        setBookingSubmitting(true);

        try {
            const created = await post(`/${COMPANY_ID}/Reservation`, payload);

            alert(`Booked desk ${selectedTable.readableId} on ${selectedDate} from ${startTime} to ${endTime} in room ${selectedRoom.readableId}`);

            // Reset time selection
            setStartTime("");
            setEndTime("");
        } catch (err) {
            if (err?.status === 409) {
                setBookingError(err?.body || "Requested time is already occupied!");
            } else {
                setBookingError(err?.message || "Booking failed. Please try again.");
            }
        } finally {
            setBookingSubmitting(false);
        }
    }
    //#endregion

    //#region JSX Block
    return (
        <div className="relative bg-background min-h-screen px-4 pt-24 pb-32">
            {/* First step: Choose a date -- Before choosing a date, only show disabled Book button. */}
            <div className="fixed top-24 left-1/2 transform -translate-x-1/2 w-11/12 max-w-3xl mx-auto mb-6">
                <input
                    type="date"
                    value={dateInput}
                    min={todayStr} 
                    onChange={handleDateChange}
                    onBlur={handleDateBlur}
                    className="w-full px-4 py-2 rounded-lg border border-primary bg-white text-primary font-medium shadow hover:bg-primary/90"
                    lang="en-GB"
                />
            </div>

            {/* Second step: Choose a room -- Display rooms that are open on the selected day. */}
            {selectedDate && (
                <div className="max-w-3xl mx-auto flex gap-4 mb-8 overflow-x-auto pt-16">
                    {loadingRooms ? (
                    <div className="text-gray-600">Loading rooms…</div>
                    ) : roomsError ? (
                    <div className="text-red-600">Error loading rooms: {roomsError}</div>
                    ) : openRooms.length === 0 ? (
                    <div className="text-gray-600">No rooms are open on this day.</div>
                    ) : (
                        openRooms.map((room) => (
                            <button
                                key={room.id}
                                onClick={() =>  handleSelectRoom(room) }
                                className={`px-4 py-2 rounded-lg font-semibold ${selectedRoom?.id === room.id
                                        ? "bg-primary text-white"
                                        : "bg-white text-primary shadow hover:bg-primary/10"
                                    }`}
                            >
                                {room.readableId}
                            </button>
                        ))
                    )}
                </div>
            )}

            {/* Third step: Show the desks for the selected room. Desks that are unavailable for the whole day have a different colour. */}
            {selectedDate && selectedRoom && (
                <div className="max-w-3xl mx-auto mb-16">
                    {(desksLoading || reservationsLoading) ? (
                        <div className="text-gray-600">Loading desks…</div>
                    ) : (desksError || reservationsError) ? (
                        <div className="text-red-600">Error: {desksError || reservationsError}</div>
                    ) : !Array.isArray(desks) || desks.length === 0 ? (
                        <div className="text-gray-600">No desks found for this room.</div>
                    ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {desks.map((desk) => {
                        const deskId = desk?.id ?? desk;
                        const label = desk?.readableId ?? String(deskId);

                        // Opening window for the selected date (local)
                        const openHHMM  = toHHMMFromBackendTimeString(selectedRoom?.openingHours?.openingTime);
                        const closeHHMM = toHHMMFromBackendTimeString(selectedRoom?.openingHours?.closingTime);
                        const openStart = dateAtHHMM(selectedDate, openHHMM);
                        const openEnd   = dateAtHHMM(selectedDate, closeHHMM);

                        // Reservations for this desk
                        const res = reservationsByDesk[deskId] || [];

                        const full = isFullyBooked(res, openStart, openEnd);

                        return (
                            <button
                                key={desk.id}
                                onClick={() => !full && handleSelectDesk(desk)}
                                className={`p-6 rounded-2xl font-semibold shadow text-center ${full
                                    ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                                    : selectedTable?.id === deskId
                                    ? "bg-accent text-white"
                                    : "bg-white text-primary hover:bg-accent/10"
                                }`}
                                disabled={full}
                                title={label}
                                >
                                {desk.readableId}
                            </button>
                        );
                        })}
                    </div>
                    )}
                </div>
            )}

            {/* Show times only after date, room and desk selection */}
            {selectedDate && selectedRoom && selectedTable && (    
                <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 w-11/12 max-w-3xl mx-auto mb-8 flex flex-col gap-4">

                    {/* Availability preview */}
                    <div className="text-sm text-gray-700 bg-white rounded-lg px-4 py-2 shadow">
                        <span className="font-medium">Available this day: </span>
                        {availabilityLabel}
                    </div>

                    <div className="flex flex-row gap-4 flex-stretch">
                        <select
                            value={startTime}
                            onChange={(e) => {
                                setStartTime(e.target.value);
                                setEndTime("");
                            }}
                            className="px-4 py-2 rounded-lg border border-primary bg-white text-primary font-medium shadow hover:bg-primary/90"
                            disabled={!startOptions.length}
                        >
                            <option value="">From</option>
                            {startOptions.map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>

                        <select
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className={`px-4 py-2 rounded-lg border border-primary text-primary font-medium shadow ${!startTime || !endOptions.length
                                    ? "bg-gray-200 cursor-not-allowed text-gray-500"
                                    : "bg-white hover:bg-secondary/90"
                                }`}
                            disabled={!startTime || !endOptions.length}
                        >
                            <option value="">Til</option>
                            {endOptions.map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
       
            {bookingError && (
                <div className="fixed bottom-38 left-1/2 transform -translate-x-1/2 w-11/12 max-w-3xl mx-auto">
                    <div className="text-red-700 bg-red-100 border border-red-300 rounded-lg px-4 py-2 shadow">
                        {String(bookingError)}
                    </div>
                </div>
            )}
      
            <button
                disabled={!canBook || bookingSubmitting}
                onClick={handleBook}
                className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md py-4 rounded-2xl text-lg font-semibold shadow-lg transition z-30 ${
                    (!canBook || bookingSubmitting)
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-accent text-white hover:bg-accent/90" 
                    }`}
            >
                {bookingSubmitting ? "Booking…" : "Book"}
            </button>
        </div>
    );
    //#endregion
}
