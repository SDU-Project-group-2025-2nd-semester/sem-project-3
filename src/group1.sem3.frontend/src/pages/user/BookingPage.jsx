import { useState } from "react";

export default function BookingPage() {
    const rooms = [
        { id: 1, name: "R-1", tables: ["D-101", "D-102", "D-103", "D-104"] },
        { id: 2, name: "R-2", tables: ["D-101", "D-102", "D-103", "D-104", "D-105", "D-106"] },
    ];

    const times = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"];

    const [selectedDate, setSelectedDate] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(rooms[0]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const filteredEndTimes = startTime
        ? times.filter((time) => time > startTime)
        : times;

    return (
        <div className="relative bg-background min-h-screen px-4 mt-16 pb-32">

            <div className="max-w-3xl mx-auto mb-6 mt-8">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-primary bg-white text-primary font-medium shadow hover:bg-primary/90"
                />
            </div>

            <div className="max-w-3xl mx-auto flex gap-4 mb-8 overflow-x-auto">
                {rooms.map((room) => (
                    <button
                        key={room.id}
                        onClick={() => { setSelectedRoom(room); setSelectedTable(null); startTime(null); endTime(null); }}
                        className={`px-4 py-2 rounded-lg font-semibold ${selectedRoom.id === room.id
                                ? "bg-primary text-white"
                                : "bg-white text-primary shadow hover:bg-primary/10"
                            }`}
                    >
                        {room.name}
                    </button>
                ))}
            </div>

            <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
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

            {selectedTable && (
                <div className="max-w-3xl mx-auto mb-8 flex flex-col gap-4">

                    <div className="flex gap-4">
                        <select
                            value={startTime}
                            onChange={(e) => {
                                setStartTime(e.target.value);
                                setEndTime("");
                            }}
                            className="px-4 py-2 rounded-lg border border-primary bg-white text-primary font-medium shadow hover:bg-primary/90"
                        >
                            <option value="">Select Start Time</option>
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
                            <option value="">Select End Time</option>
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
                disabled={!selectedTable || !startTime || !endTime || !selectedDate}
                onClick={() =>
                    alert(
                        `Booked ${selectedTable} on ${selectedDate} from ${startTime} to ${endTime} in ${selectedRoom.name}`
                    )
                }
                className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md py-4 rounded-2xl text-lg font-semibold shadow-lg transition z-30 ${selectedTable && startTime && endTime && selectedDate
                        ? "bg-accent text-white hover:bg-accent/90"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
            >
                Book
            </button>
        </div>
    );
}
