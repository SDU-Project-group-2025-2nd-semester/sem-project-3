import { useState } from "react";

export default function StaffHomePage() {
    const [selectedRoom, setSelectedRoom] = useState("Room A");

    const [rooms, setRooms] = useState({
        "Room A": [
            { id: 1, name: "Table 1", status: "normal", isDamaged: false },
            { id: 2, name: "Table 2", status: "normal", isDamaged: false },
            { id: 3, name: "Table 3", status: "normal", isDamaged: false },
        ],
        "Room B": [
            { id: 4, name: "Table 1", status: "normal", isDamaged: false },
            { id: 5, name: "Table 2", status: "normal", isDamaged: false },
        ],
        "Room C": [
            { id: 6, name: "Table 1", status: "normal", isDamaged: false },
            { id: 7, name: "Table 2", status: "normal", isDamaged: false },
            { id: 8, name: "Table 3", status: "normal", isDamaged: false },
            { id: 9, name: "Table 4", status: "normal", isDamaged: false },
        ],
    });

    const currentTables = rooms[selectedRoom];

    const handleAllTables = (action) => {
        setRooms((prev) => ({
            ...prev,
            [selectedRoom]: prev[selectedRoom].map((table) => ({
                ...table,
                status: action === "raise" ? "raised" : "lowered",
            })),
        }));
    };

    const reportDamage = (id) => {
        setRooms((prev) => ({
            ...prev,
            [selectedRoom]: prev[selectedRoom].map((table) =>
                table.id === id ? { ...table, isDamaged: true } : table
            ),
        }));
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-background px-6 py-8">
            <h1 className="text-2xl font-bold text-primary mb-6">
                Staff Control Panel
            </h1>

            <div className="mb-6 w-full max-w-xs">
                <label className="block mb-1 text-sm font-semibold text-secondary">
                    Select Room
                </label>
                <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full border border-secondary rounded-lg px-3 py-2 bg-white text-primary focus:ring-2 focus:ring-accent outline-none"
                >
                    {Object.keys(rooms).map((room) => (
                        <option key={room} value={room}>
                            {room}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                    onClick={() => handleAllTables("raise")}
                    className="bg-accent text-white px-6 py-2 rounded-lg shadow hover:bg-secondary transition-colors"
                >
                    Lift All Tables
                </button>
                <button
                    onClick={() => handleAllTables("lower")}
                    className="bg-secondary text-white px-6 py-2 rounded-lg shadow hover:bg-accent transition-colors"
                >
                    Lower All Tables
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                {currentTables.map((table) => (
                    <div
                        key={table.id}
                        className={`border rounded-2xl p-4 flex flex-col items-center justify-between shadow transition ${
                            table.isDamaged
                                ? "border-red-500 bg-red-50"
                                : "border-secondary bg-white"
                        }`}
                    >
                        <h2 className="text-lg font-semibold text-primary mb-2">
                            {table.name}
                        </h2>

                        <p
                            className={`text-sm mb-3 ${
                                table.status === "raised"
                                    ? "text-accent"
                                    : table.status === "lowered"
                                    ? "text-primary"
                                    : "text-black"
                            }`}
                        >
                            Status: {table.status}
                        </p>

                        {!table.isDamaged ? (
                            <button
                                onClick={() => reportDamage(table.id)}
                                className="border border-red-500 text-red-500 px-4 py-1 rounded hover:bg-red-100 transition"
                            >
                                Report Damage
                            </button>
                        ) : (
                            <span className="text-red-600 text-sm font-semibold">
                                Damaged
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
