import { useState, useEffect } from "react";
import { get, post, put, del } from "../../context/apiClient";

// mock data
import desksMockData from '../../assets/admin/DesksMockData.json'
import profileMockData from '../../assets/admin/ProfileMockData.json'
import userMockData from '../../assets/admin/UserMockData.json'

export default function DesksManagerPage() {
    const DEFAULT_DESK_HEIGHT = 95;

    // mock data
    const allProfiles = [
        ...profileMockData.open.map(p => ({ ...p, category: 'open' })),
        ...profileMockData.closed.map(p => ({ ...p, category: 'closed' })),
        ...profileMockData.maintenance.map(p => ({ ...p, category: 'maintenance' })),
    ];

    const [activeTab, setActiveTab] = useState('open');
    const [activeRoom, setActiveRoom] = useState(null);
    const [showNewDeskForm, setShowNewDeskForm] = useState(false);
    const [showNewRoomForm, setShowNewRoomForm] = useState(false);
    const [desks, setDesks] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [companyId, setCompanyId] = useState(null);

    const [newDeskName, setNewDeskName] = useState('');
    const [newDeskAvailable, setNewDeskAvailable] = useState(true);

    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomFloor, setNewRoomFloor] = useState('');
    const [newRoomCapacity, setNewRoomCapacity] = useState('');

    // TODO: profiles backend implementation
    const [roomProfiles, setRoomProfiles] = useState(() => {
        const initial = {};
        Object.keys(desksMockData.roomProfiles).forEach(roomId => {
            initial[roomId] = {};
            desksMockData.roomProfiles[roomId].activeProfiles.forEach(profileId => {
                initial[roomId][profileId] = true;
            });
        });
        return initial;
    });

    const handleProfileToggle = (profileId) => {
        setRoomProfiles(prev => ({
            ...prev,
            [activeRoom]: {
                ...prev[activeRoom],
                [profileId]: !prev[activeRoom]?.[profileId]
            }
        }));
    };

    const handleApplyProfileToAllRooms = (profileId) => {
        const updatedProfiles = {};
        rooms.forEach(room => {
            updatedProfiles[room.id] = {
                ...roomProfiles[room.id],
                [profileId]: true
            };
        });
        setRoomProfiles(updatedProfiles);
        console.log(`Applied profile ${profileId} to all rooms`);
    };

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

    const handleSaveNewDesk = async (e) => {
        e.preventDefault();

        try {
            const newDesk = {
                name: newDeskName,
                isAvailable: newDeskAvailable,
                roomId: activeRoom,
                currentHeight: DEFAULT_DESK_HEIGHT,
            };

            await post(`/${companyId}/desks`, newDesk);
            await fetchDesksForRoom(activeRoom);
            handleCancelNewDesk();
        } catch (error) {
            console.error('Error creating desk:', error);
            alert('Failed to create desk: ' + error.message);
        }
    };

    const handleCancelNewDesk = () => {
        setNewDeskName('');
        setNewDeskAvailable(true);
        setShowNewDeskForm(false);
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

    // const getUserName = (userId) => {
    //     if (!userId) return null;
    //     const user = userMockData.Users.find(u => u.id === userId);
    //     return user ? user.Name : null;
    // };

    // const getProfileById = (profileId) => {
    //     return allProfiles.find(p => p.id === profileId);
    // };

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
                </main>
            </div>
        );
    }

    return (
        <div className="relative bg-background min-h-screen px-4 mt-20">
            <main className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-32">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-gray-800">Desk Management</h1>
                </div>

                {/*TODO: Global Room Control */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Global Room Control</h2>
                    <div className="flex gap-2 flex-wrap">
                        <TabButton value="open" label="Open" />
                        <TabButton value="closed" label="Closed" />
                        <TabButton value="maintenance" label="Maintenance" />
                    </div>

                    {/* TODO:Display profiles*/}
                    {activeTab && (
                        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Profiles
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {profileMockData[activeTab]?.map(profile => (
                                    <div key={profile.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 text-sm mb-1">{profile.name}</h4>
                                                <p className="text-xs text-gray-600 mb-1">{profile.schedule}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded ${profile.autoApply
                                                ? 'bg-success-100 text-success-700'
                                                : 'bg-gray-200 text-gray-700'
                                                }`}>
                                                {profile.autoApply ? 'Auto' : 'Manual'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">Height: {profile.deskHeight}</span>
                                            <button
                                                onClick={() => handleApplyProfileToAllRooms(profile.id)}
                                                className="px-3 py-1 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent-600 transition-colors"
                                                title="Apply to all rooms"
                                            >
                                                Apply to all rooms
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!profileMockData[activeTab] || profileMockData[activeTab].length === 0) && (
                                    <p className="text-sm text-gray-500 col-span-full text-center py-4">
                                        No profiles found for this category
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* Room Management */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Room Management</h2>
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

                    {/* Desks table*/}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-700">
                                Desks in {currentRoom?.readableId || 'Unknown Room'}
                            </h3>
                            <button
                                onClick={() => setShowNewDeskForm(!showNewDeskForm)}
                                className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent-600 transition-all inline-flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-base">
                                    {showNewDeskForm ? 'close' : 'add'}
                                </span>
                                <span>Desk</span>
                            </button>
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

                    {/* New Desk form*/}
                    {showNewDeskForm && activeRoom && (
                        <form onSubmit={handleSaveNewDesk} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-md">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">New Desk</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Desk name"
                                    value={newDeskName}
                                    onChange={(e) => setNewDeskName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={newDeskAvailable}
                                            onChange={(e) => setNewDeskAvailable(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-accent transition-colors"></div>
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Available</span>
                                </label>
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
                                    onClick={handleCancelNewDesk}
                                    className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

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

                {/* Room Control */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        {currentRoom?.readableId || 'Unknown Room'} Control
                    </h2>

                    {/* Info card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Floor:</span>
                                <span className="ml-2 font-semibold">{currentRoom?.floor || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Capacity:</span>
                                <span className="ml-2 font-semibold">{currentRoom?.capacity || 'N/A'}</span>
                            </div>
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

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Active Profiles
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Apply profiles to control all desks in this room
                        </p>
                        <div className="space-y-4">
                            {allProfiles.map(profile => (
                                <div key={profile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-900 text-sm">{profile.name}</h4>
                                            <span className={`text-xs px-2 py-0.5 rounded ${profile.category === 'open' ? 'bg-success-100 text-success-700' :
                                                profile.category === 'closed' ? 'bg-danger-100 text-danger-700' :
                                                    'bg-warning-100 text-warning-700'
                                                }`}>
                                                {profile.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600">{profile.schedule}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-500">Height: {profile.deskHeight}</span>
                                            <span className="text-xs text-gray-500">•</span>
                                            <span className="text-xs text-gray-500">
                                                {profile.autoApply ? 'Auto-apply' : 'Manual'}
                                            </span>
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer ml-4">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={roomProfiles[activeRoom]?.[profile.id] || false}
                                                onChange={() => handleProfileToggle(profile.id)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-accent transition-colors"></div>
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                                        </div>
                                    </label>
                                </div>
                            ))}
                            {allProfiles.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No profiles available. Create profiles in the Profiles Management page.
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}