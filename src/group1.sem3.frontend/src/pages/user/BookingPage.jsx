import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";

export default function BookingPage() {   
    const { currentCompany, isHydrating } = useAuth();
    const COMPANY_ID = currentCompany?.id;
   
    // #region Date Selection
    // JS Date.getDay(): 0=Sunday, ..., 6=Saturday
    const DayFlag = {
        0: 64, 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32,
    };

    const rooms = [
        { id: 1, name: "R-1", tables: ["D-101", "D-102", "D-103", "D-104"], daysOfTheWeek: DayFlag[1] | DayFlag[2] | DayFlag[3] | DayFlag[4] | DayFlag[5] },
        { id: 2, name: "R-2", tables: ["D-101", "D-102", "D-103", "D-104", "D-105", "D-106", "e", "d", "f", "k"], daysOfTheWeek: DayFlag[6] | DayFlag[0] },
    ];

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

    function coerceValidDateStr(str, todayStr) {
        // If past or invalid, return todayStr; else return str
        if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return todayStr;
        return isPastDateStr(str) ? todayStr : str;
    }

    // Today's date (YYYY-MM-DD) for min attribute
    const todayStr = useMemo(() => toYmd(new Date()), []);
    const [selectedDate, setSelectedDate] = useState(""); // YYYY-MM-DD
    
    const selectedDateObj = useMemo(
        () => (selectedDate ? new Date(`${selectedDate}T00:00:00`) : null), // as local midnight
        [selectedDate]
    );   

    function handleDateChange(e) {
        // Prefer valueAsDate when available (avoids timezone pitfalls)
        const v = e.target.value;
        const d = e.target.valueAsDate; // Date | null

        // Reset any previous custom error
        e.target.setCustomValidity("");

        if (!v) {
            setSelectedDate("");
            return;
        }

        // Enforce min for both typed and picked values
        if (d) {
            const typedYmd = toYmd(d);
            if (typedYmd < todayStr) {
                // Change to today
                setSelectedDate(todayStr);
                e.target.setCustomValidity("Past dates cannot be chosen.");
                return;
            }
            setSelectedDate(typedYmd);
            return;
        }

        // Fallback if valueAsDate is null (some browsers/input states)
        const coerced = coerceValidDateStr(v, todayStr);
        if (coerced !== v) {
            // Change to today
            setSelectedDate(todayStr);
            e.target.setCustomValidity("Past dates cannot be chosen.");
            return;
        }
        setSelectedDate(v);
    }

    function handleDateBlur(e) {
        // Validate on blur to catch manual edits
        const v = e.target.value;
        if (!v) return;
        if (isPastDateStr(v)) {
            setSelectedDate(todayStr);
            e.target.setCustomValidity("Past dates cannot be chosen.");
            // e.target.reportValidity();
        } else {
            e.target.setCustomValidity("");
        }
    }
    //#endregion

    // Filter rooms that are open on the selected date
    const openRooms = useMemo(() => {
        if (!selectedDateObj) return [];
        const jsDow = selectedDateObj.getDay(); // 0..6, Sun..Sat
        const dayFlag = DayFlag[jsDow];
        return rooms.filter((r) => (r.daysOfTheWeek & dayFlag) !== 0);
    }, [rooms, selectedDateObj]);

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const filteredEndTimes = startTime
        ? times.filter((time) => time > startTime)
        : times;
 
    const canBook = Boolean(selectedDate) && Boolean(selectedTable) && Boolean(startTime) && Boolean(endTime);

    function handleSelectDate(value) {
        setSelectedDate(value);
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

    //#region JSX Block
    return (
        <div className="relative bg-background min-h-screen px-4 pt-24 pb-32">
            {/* First step: Choose a date -- Show the rooms which are open on that day. Before choosing a date, only show disabled Book button*/}
            <div className="fixed top-24 left-1/2 transform -translate-x-1/2 w-11/12 max-w-3xl mx-auto mb-6">
                <input
                    type="date"
                    value={selectedDate}
                    min={todayStr} 
                    onChange={handleDateChange}
                    onBlur={handleDateBlur}
                    className="w-full px-4 py-2 rounded-lg border border-primary bg-white text-primary font-medium shadow hover:bg-primary/90"
                    disabled={isHydrating} // optional: disable while auth is hydrating
                    lang="en-GB"
                />
            </div>

            {/* Show rooms only after date selection */}
            {selectedDate && (
                <div className="max-w-3xl mx-auto flex gap-4 mb-8 overflow-x-auto pt-16">
                    {openRooms.length === 0 ? (
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
                                {room.name}
                            </button>
                        ))
                    )}
                </div>
            )}

            {/* Show desks only after date and room selection */}
            {selectedDate && selectedRoom && (
                <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4 mb-16">
                    {selectedRoom.tables.map((table) => (
                        <button
                            key={table}
                            onClick={() => setSelectedTable(table)}
                            className={`p-6 rounded-2xl font-semibold shadow text-center ${selectedTable === table
                                    ? "bg-accent text-white"
                                    : "bg-white text-primary hover:bg-accent/10"
                                }`}
                        >
                            {table}
                        </button>
                    ))}
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
