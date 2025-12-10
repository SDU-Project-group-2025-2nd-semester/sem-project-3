import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { get, post, put, del } from "../../context/apiClient";

export default function DesksManagerPage() {
    const navigate = useNavigate();
    const DEFAULT_DESK_HEIGHT = 95;


    const [activeTab, setActiveTab] = useState('open');
    const [activeRoom, setActiveRoom] = useState(null);
    const [showNewRoomForm, setShowNewRoomForm] = useState(false);
    const [desks, setDesks] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [companyId, setCompanyId] = useState(null);

    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomFloor, setNewRoomFloor] = useState('');
    const [newRoomCapacity, setNewRoomCapacity] = useState('');

    const [simulatorLink, setSimulatorLink] = useState('');
    const [simulatorApiKey, setSimulatorApiKey] = useState('');
    const [simulatorErrors, setSimulatorErrors] = useState({});

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (activeRoom && companyId) {
            fetchDesksForRoom(activeRoom);
        }
    }, [activeRoom, companyId]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            setError(null);

            const userCompanies = await get('/Users/me/companies');

            if (!userCompanies || userCompanies.length === 0) {
                throw new Error('No company associated with current user');
            }

            const userCompanyId = userCompanies[0].companyId;
            setCompanyId(userCompanyId);

            const roomsData = await get(`/${userCompanyId}/rooms`);
            setRooms(roomsData);

            if (roomsData.length > 0) {
                setActiveRoom(roomsData[0].id);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            setError(error.message);
            if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('company')) {
                setTimeout(() => navigate('/'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchDesksForRoom = async (roomId) => {
        try {
            const [desksData, reservationsData] = await Promise.all([
                get(`/${companyId}/desks/room/${roomId}`),
                get(`/${companyId}/reservation`)
            ]);

            setDesks(desksData);
            setReservations(reservationsData);
        } catch (error) {
            console.error('Error fetching desks:', error);
            if (error.status === 404) {
                setDesks([]);
                setReservations([]);
            } else {
                setError(error.message);
            }
        }
    };

    const handleDeleteDesk = async (deskId) => {
        if (!confirm('Are you sure you want to delete this desk?')) {
            return;
        }

        try {
            await del(`/${companyId}/desks/${deskId}`);
            await fetchDesksForRoom(activeRoom);
        } catch (error) {
            console.error('Error deleting desk:', error);
            alert('Failed to delete desk: ' + error.message);
        }
    };

    const handleDeskUnBook = async (deskId) => {
        try {
            const now = new Date();
            const activeReservation = reservations.find(r => {
                if (r.deskId !== deskId) return false;
                const start = new Date(r.start);
                const end = new Date(r.end);
                return start <= now && now <= end;
            });

            if (!activeReservation) {
                alert('No active booking found for this desk');
                return;
            }
            // if (!activeReservation) {
            //     alert('No active booking found for this desk');
            //     return;
            // }

            if (!confirm('Are you sure you want to cancel this booking?')) {
                return;
            }

            await del(`/${companyId}/reservation/${activeReservation.id}`);
            await fetchDesksForRoom(activeRoom);
        } catch (error) {
            console.error('Error canceling booking:', error);
            alert('Failed to cancel booking: ' + error.message);
        }
    };

    const handleSaveSimulator = async (e) => {
        e.preventDefault();

        // Validation
        const errors = {};

        if (!simulatorLink.trim()) {
            errors.link = 'Simulator link is required';
        } else if (!/^https?:\/\/.+/.test(simulatorLink)) {
            errors.link = 'Must be a valid URL (http:// or https://)';
        }

        if (!simulatorApiKey.trim()) {
            errors.apiKey = 'API key is required';
        } else if (simulatorApiKey.length != 32) {
            errors.apiKey = 'API key must be 32 characters long';
        }

        setSimulatorErrors(errors);

        // If there are errors, don't submit
        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            const simulatorSettings = {
                simulatorLink: simulatorLink.trim(),
                simulatorApiKey: simulatorApiKey.trim()
            };

            await put(`/Company/${companyId}/simulator`, simulatorSettings);
            alert('Simulator settings saved successfully!');
            setSimulatorLink('');
            setSimulatorApiKey('');
            setSimulatorErrors({});
        } catch (error) {
            console.error('Error saving simulator:', error);
            alert('Failed to save simulator: ' + error.message);
        }
    };

    const handleSaveNewRoom = async (e) => {
        e.preventDefault();

        try {
            const newRoom = {
                name: newRoomName,
                capacity: parseInt(newRoomCapacity),
                floor: parseInt(newRoomFloor),
            };

            const createdRoom = await post(`/${companyId}/rooms`, newRoom);
            await fetchInitialData();
            handleCancelNewRoom();
            setActiveRoom(createdRoom.id);
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room: ' + error.message);
        }
    };

    const handleCancelNewRoom = () => {
        setNewRoomName('');
        setNewRoomFloor('');
        setNewRoomCapacity('');
        setShowNewRoomForm(false);
    };

    const TabButton = ({ value, label }) => (
        <button
            onClick={() => setActiveTab(value)}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === value
                ? 'bg-secondary-100 text-secondary-700 border border-secondary-300'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
        >
            {label}
        </button>
    );

    const RoomButton = ({ roomId, label }) => (
        <button
            onClick={() => setActiveRoom(roomId)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeRoom === roomId
                ? 'bg-secondary-100 text-secondary-700 border border-secondary-300'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
        >
            {label}
        </button>
    );

    const getDeskStatus = (desk) => {
        const now = new Date();
        const hasReservation = reservations.some(r => {
            if (r.deskId !== desk.id) return false;
            const start = new Date(r.start);
            const end = new Date(r.end);
            return start <= now;
            // return start <= now && now <= end;
        });

        if (hasReservation) return 'booked';
        return 'available';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'booked':
                return 'text-warning-600';
            case 'available':
                return 'text-success-600';
            case 'unavailable':
                return 'text-danger-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'booked':
                return 'Booked';
            case 'available':
                return 'Available';
            case 'unavailable':
                return 'Unavailable';
            default:
                return status;
        }
    };

    function isRoomOpen(room) {
        if (!room || !room.openinghours) return false;
        const now = new Date();
        const dayOfWeek = now.getDay();
        const todayHours = room.openingHours.find(h => h.dayOfWeek === dayOfWeek);
        if (!todayHours) return false;
        const [startHour, startMinute] = todayHours.start.split(':').map(Number);
        const [endHour, endMinute] = todayHours.end.split(':').map(Number);
        const start = new Date(now);
        start.setHours(startHour, startMinute, 0, 0);
        const end = new Date(now);
        end.setHours(endHour, endMinute, 0, 0);
        return now >= start && now <= end;
    }

    if (loading) {
        return (
            <div className="relative bg-background min-h-screen px-4 mt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg text-gray-600">Loading rooms and desks...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative bg-background min-h-screen px-4 mt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg text-red-600">Error: {error}</div>
                    <button
                        onClick={fetchInitialData}
                        className="mt-4 px-4 py-2 bg-accent text-white rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const currentRoom = rooms.find(r => r.id === activeRoom);

    const Simulator = () => {
        return (
            <div className="bg-white rounded-2xl overflow-hidden mb-6">
                <h1 className="text-3xl font-semibold text-gray-800 py-6">Simulator Management</h1>
                <form onSubmit={handleSaveSimulator} className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 max-w-md">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link
                        </label>
                        <input
                            type="text"
                            placeholder="https://simulator.example.com"
                            value={simulatorLink}
                            onChange={(e) => setSimulatorLink(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all ${simulatorErrors.link ? 'border-danger-500' : 'border-gray-300'
                                }`}
                        />
                        {simulatorErrors.link && (
                            <p className="text-danger-600 text-sm mt-1">{simulatorErrors.link}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Api Key
                        </label>
                        <input
                            type="text"
                            placeholder="Enter API key"
                            value={simulatorApiKey}
                            onChange={(e) => setSimulatorApiKey(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all ${simulatorErrors.apiKey ? 'border-danger-500' : 'border-gray-300'
                                }`}
                        />
                        {simulatorErrors.apiKey && (
                            <p className="text-danger-600 text-sm mt-1">{simulatorErrors.apiKey}</p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-600 transition-colors font-medium"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div >
        );
    };

    // Don't render if no rooms available
    if (!currentRoom && rooms.length === 0) {
        return (
            <div className="relative bg-background min-h-screen px-4 mt-20">
                <main className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-32">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-semibold text-gray-800">Desk Management</h1>
                    </div>
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">No rooms found for your company.</p>
                        <button
                            onClick={() => setShowNewRoomForm(true)}
                            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-600 transition-colors font-medium"
                        >
                            Create First Room
                        </button>
                    </div>
                    <Simulator />
                </main>
            </div>
        );
    }


    return (
        <div className="relative bg-background min-h-screen px-4 mt-20">
            <main className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-32">
                <Simulator />

                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-gray-800">Room Management</h1>
                </div>

                {/* Room Management */}
                <section>
                    <div className="flex gap-2 flex-wrap mb-6">
                        {rooms.map(room => (
                            <RoomButton key={room.id} roomId={room.id} label={room.readableId || 'Unknown Room'} />
                        ))}
                        <button
                            onClick={() => setShowNewRoomForm(!showNewRoomForm)}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent-600 transition-all inline-flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">
                                {showNewRoomForm ? 'close' : 'add'}
                            </span>
                            <span>Room</span>
                        </button>
                    </div>

                    {/* Info card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Status:</span>
                                <span className={`ml-2 font-semibold capitalize ${isRoomOpen(currentRoom) ? 'text-success-600'
                                    : currentRoom?.currentStatus === 'maintenance' ? 'text-warning-600'
                                        : 'text-danger-600'
                                    }`}>
                                    {isRoomOpen(currentRoom) ? 'open'
                                        : currentRoom?.currentStatus === 'maintenance' ? 'maintenance'
                                            : 'closed'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Desks:</span>
                                <span className="ml-2 font-semibold">
                                    {desks.filter(d => d.roomId === currentRoom?.id).length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Desks table*/}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-700">
                                Desks
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto max-lg:block">
                                <thead className="bg-gray-50 max-lg:hidden">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Current Height</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">MAC Address</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="max-lg:block divide-y divide-gray-100">
                                    {desks.map((desk) => {
                                        const status = getDeskStatus(desk);

                                        return (
                                            <tr key={desk.id} className="border-t last:border-b hover:bg-gray-50 transition-colors max-lg:flex max-lg:flex-wrap max-lg:border-b max-lg:py-2">
                                                <td className="px-4 py-3 text-sm font-medium max-lg:w-full">
                                                    <span className="font-semibold lg:hidden">Name: </span>
                                                    <span className="font-semibold">{desk.readableId || 'Unknown Desk'}</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm max-lg:w-full">
                                                    <span className="font-semibold lg:hidden">Status: </span>
                                                    <span className={`font-medium ${getStatusColor(status)}`}>
                                                        {getStatusText(status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm max-lg:w-full">
                                                    <span className="font-semibold lg:hidden">Current Height: </span>
                                                    {((desk.height ?? 0) / 10).toFixed(1)} cm
                                                </td>
                                                <td className="px-4 py-3 text-sm max-lg:w-full">
                                                    <span className="font-semibold lg:hidden">MAC Address: </span>
                                                    {desk.macAddress || 'Not set'}
                                                </td>
                                                <td className="px-4 py-3 text-sm max-lg:w-full">
                                                    <button
                                                        onClick={() => handleDeleteDesk(desk.id)}
                                                        className="bg-danger text-white px-3 py-1.5 rounded-lg text-xs hover:bg-danger-600 transition-all inline-flex items-center gap-1"
                                                        title="Delete desk"
                                                    >
                                                        <span className="material-symbols-outlined text-sm leading-none">delete</span>
                                                        <span className="lg:hidden">Delete</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeskUnBook(desk.id)}
                                                        className="bg-accent text-white px-3 py-1.5 ml-2 rounded-lg text-xs hover:bg-accent-600 transition-all inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Cancel desk booking"
                                                        disabled={status !== 'booked'}
                                                    >
                                                        <span>Cancel Booking</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {desks.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500">
                                                No desks found in this room
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>


                    {/* New Room form*/}
                    {showNewRoomForm && (
                        <form onSubmit={handleSaveNewRoom} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-md">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">New Room</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Room name"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Floor
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    placeholder="e.g., 2"
                                    value={newRoomFloor}
                                    onChange={(e) => setNewRoomFloor(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Capacity
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="e.g., 12"
                                    value={newRoomCapacity}
                                    onChange={(e) => setNewRoomCapacity(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-600 transition-colors font-medium"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelNewRoom}
                                    className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </section>
            </main>
        </div>
    );
}