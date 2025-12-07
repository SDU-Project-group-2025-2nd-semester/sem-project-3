import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { get, post, put, del } from "../../context/apiClient";

export default function BookingPage() {   
    const { currentCompany, isHydrating } = useAuth();
    const COMPANY_ID = currentCompany?.id;
   
    // #region Date Selection
    // JS Date.getDay(): 0=Sunday, ..., 6=Saturday
    const DayFlag = {
        0: 64, 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32,
    };

    // to be deleted:
    const times = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];
    
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

        // Enforce min for both typed and picked values
        if (d) {
            const typedYmd = toYmd(d);
            if (typedYmd < todayStr) {
                e.target.setCustomValidity("Past dates cannot be chosen.");
                return;
            }
            setSelectedDate(typedYmd);
            return;
        }
        
        // Fallback (no valueAsDate)
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

    const filteredEndTimes = startTime
        ? times.filter((time) => time > startTime)
        : times;
 
    const canBook = Boolean(selectedDate) && Boolean(selectedTable) && Boolean(startTime) && Boolean(endTime);

    function handleSelectDate(value) {
        setSelectedDate(value);
        setDateInput(value);
        // When date changes, reset downstream selections
        setSelectedRoom(null);
        setSelectedTable(null);
        setStartTime("");
        setEndTime("");
    }
    
    // Reset selections when changing room/date
    function handleSelectRoom(room) {
        setSelectedRoom(room);
        setSelectedTable(null);
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
                    disabled={isHydrating} // optional: disable while auth is hydrating
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
                    {desksLoading ? (
                        <div className="text-gray-600">Loading desks…</div>
                    ) : desksError ? (
                        <div className="text-red-600">Error loading desks: {desksError}</div>
                    ) : !Array.isArray(desks) || desks.length === 0 ? (
                        <div className="text-gray-600">No desks found for this room.</div>
                    ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {desks.map((desk) => {
                        const deskId = desk?.id ?? desk;
                        const label = desk?.readableId ?? String(deskId);

                        // TODO: Replace with actual availability check
                        const isUnavailableWholeDay = false;

                        return (
                            <button
                                key={deskId}
                                onClick={() => setSelectedTable(deskId)}
                                className={`p-6 rounded-2xl font-semibold shadow text-center ${isUnavailableWholeDay
                                    ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                                    : selectedTable === deskId
                                    ? "bg-accent text-white"
                                    : "bg-white text-primary hover:bg-accent/10"
                                }`}
                                disabled={isUnavailableWholeDay}
                                title={label}
                                >
                                {label}
                            </button>
                        );
                        })}
                    </div>
                    )}
                </div>
            )}

            {/* Show times only after date, room and desk selection */}
            {/* TODO: If the date is today, only show times after current time */}
            {selectedDate && selectedRoom && selectedTable && (    
                <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 w-11/12 max-w-3xl mx-auto mb-8 flex flex-col gap-4">

                    <div className="flex flex-row gap-4 flex-stretch">
                        <select
                            value={startTime}
                            onChange={(e) => {
                                setStartTime(e.target.value);
                                setEndTime("");
                            }}
                            className="px-4 py-2 rounded-lg border border-primary bg-white text-primary font-medium shadow hover:bg-primary/90"
                        >
                            <option value="">From</option>
                            {times.map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>

                        <select
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className={`px-4 py-2 rounded-lg border border-primary text-primary font-medium shadow ${!startTime
                                    ? "bg-gray-200 cursor-not-allowed text-gray-500"
                                    : "bg-white hover:bg-secondary/90"
                                }`}
                            disabled={!startTime}
                        >
                            <option value="">Til</option>
                            {filteredEndTimes.map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <button
                disabled={!canBook}
                onClick={() =>
                    alert(
                        `Booked ${selectedTable} on ${selectedDate} from ${startTime} to ${endTime} in ${selectedRoom.name}`
                    )
                }
                className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md py-4 rounded-2xl text-lg font-semibold shadow-lg transition z-30 ${canBook
                        ? "bg-accent text-white hover:bg-accent/90"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
            >
                Book
            </button>
        </div>
    );
    //#endregion
}
