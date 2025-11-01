import { useState } from "react";
import desksMockData from '../../assets/admin/DesksMockData.json'
import profileMockData from '../../assets/admin/ProfileMockData.json'
import userMockData from '../../assets/admin/UserMockData.json'

export default function DesksManagerPage() {
    const DEFAULT_DESK_HEIGHT = 95;

    const allProfiles = [
        ...profileMockData.open.map(p => ({ ...p, category: 'open' })),
        ...profileMockData.closed.map(p => ({ ...p, category: 'closed' })),
        ...profileMockData.maintenance.map(p => ({ ...p, category: 'maintenance' })),
    ];

    const [activeTab, setActiveTab] = useState('open');
    const [activeRoom, setActiveRoom] = useState('room1');
    const [showNewDeskForm, setShowNewDeskForm] = useState(false);
    const [showNewRoomForm, setShowNewRoomForm] = useState(false);
    const [desks, setDesks] = useState(desksMockData.desks);
    const [rooms, setRooms] = useState(desksMockData.rooms);

    const [newDeskName, setNewDeskName] = useState('');
    const [newDeskAvailable, setNewDeskAvailable] = useState(true);

    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomFloor, setNewRoomFloor] = useState('');
    const [newRoomCapacity, setNewRoomCapacity] = useState('');

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

    const handleDeleteDesk = (deskId) => {
        console.log('Delete desk:', deskId);
        // TODO: Implement delete logic
    };
    const handleDeskStatus = (deskId) => {
        console.log('Toggle desk status:', deskId);
        // TODO: Implement logic
    };
    const handleDeskUnBook = (deskId) => {
        console.log('Unbook desk status:', deskId);
        // TODO: Implement logic
    };

    const handleSaveNewDesk = (e) => {
        e.preventDefault();
        const newDesk = {
            id: Date.now(),
            name: newDeskName,
            status: newDeskAvailable ? 'available' : 'unavailable',
            currentHeight: `${DEFAULT_DESK_HEIGHT}cm`,
            currentBook: null,
        };

        setDesks(prev => ({
            ...prev,
            [activeRoom]: [...prev[activeRoom], newDesk]
        }));

        handleCancelNewDesk();
    };

    const handleCancelNewDesk = () => {
        setNewDeskName('');
        setNewDeskAvailable(true);
        setShowNewDeskForm(false);
    };

    const handleSaveNewRoom = (e) => {
        e.preventDefault();
        const newRoom = {
            id: `room${rooms.length + 1}`,
            name: newRoomName,
            capacity: parseInt(newRoomCapacity),
            floor: parseInt(newRoomFloor),
            currentStatus: 'open',
        };

        setRooms(prev => [...prev, newRoom]);
        setDesks(prev => ({
            ...prev,
            [newRoom.id]: []
        }));
        setRoomProfiles(prev => ({
            ...prev,
            [newRoom.id]: {}
        }));

        handleCancelNewRoom();
        setActiveRoom(newRoom.id);
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

    const RoomButton = ({ value, label }) => (
        <button
            onClick={() => setActiveRoom(value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeRoom === value
                ? 'bg-secondary-100 text-secondary-700 border border-secondary-300'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
        >
            {label}
        </button>
    );

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

    const getUserName = (userId) => {
        if (!userId) return null;
        const user = userMockData.Users.find(u => u.id === userId);
        return user ? user.Name : null;
    };

    const getProfileById = (profileId) => {
        return allProfiles.find(p => p.id === profileId);
    };

    return (
        <div className="relative bg-background min-h-screen px-4 mt-20">
            <main className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-32">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-gray-800">Desk Management</h1>
                </div>

                {/* Global Room Control */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Global Room Control</h2>
                    <div className="flex gap-2 flex-wrap">
                        <TabButton value="open" label="Open" />
                        <TabButton value="closed" label="Closed" />
                        <TabButton value="maintenance" label="Maintenance" />
                    </div>

                    {/* Display profiles*/}
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
                            <RoomButton key={room.id} value={room.id} label={room.name} />
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

                    {/* Desks */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-700">
                                Desks
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
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Current Book</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="max-lg:block divide-y divide-gray-100">
                                    {desks[activeRoom]?.map((desk) => {
                                        const bookedUser = getUserName(desk.currentBookId);
                                        const activeProfile = getProfileById(desk.activeProfile);

                                        return (
                                            <tr key={desk.id} className="border-t last:border-b hover:bg-gray-50 transition-colors max-lg:flex max-lg:flex-wrap max-lg:border-b max-lg:py-2">
                                                <td className="px-4 py-3 text-sm font-medium max-lg:w-full">
                                                    <span className="font-semibold lg:hidden">Name: </span>
                                                    <span className="font-semibold">{desk.name}</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm max-lg:w-full">
                                                    <span className="font-semibold lg:hidden">Status: </span>
                                                    <span className={`font-medium ${getStatusColor(desk.status)}`}>
                                                        {getStatusText(desk.status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm max-lg:w-full">
                                                    <span className="font-semibold lg:hidden">Current Height: </span>
                                                    {desk.currentHeight}
                                                </td>
                                                <td className="px-4 py-3 text-sm max-lg:w-full">
                                                    <span className="font-semibold lg:hidden">Current Book: </span>
                                                    {bookedUser || '----'}
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
                                                        onClick={() => handleDeskStatus(desk.id)}
                                                        className="bg-accent text-white px-3 py-1.5 ml-2 rounded-lg text-xs hover:bg-accent-600 transition-all inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Change desk status"
                                                        disabled={desk.status == 'booked'}
                                                    >
                                                        <span>{desk.status == 'unavailable' ? 'Activate' : 'Deactivate'}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeskUnBook(desk.id)}
                                                        className="bg-accent text-white px-3 py-1.5 ml-2 rounded-lg text-xs hover:bg-accent-600 transition-all inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Cancel desk book"
                                                        disabled={desk.status !== 'booked'}
                                                    >
                                                        <span>Cancel Book</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {(!desks[activeRoom] || desks[activeRoom].length === 0) && (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500">
                                                No desks found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* New Desk */}
                    {showNewDeskForm && (
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

                    {/* New Room */}
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
                        {rooms.find(r => r.id === activeRoom)?.name || activeRoom} Control
                    </h2>

                    {/* Info card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Floor:</span>
                                <span className="ml-2 font-semibold">{rooms.find(r => r.id === activeRoom)?.floor}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Capacity:</span>
                                <span className="ml-2 font-semibold">{rooms.find(r => r.id === activeRoom)?.capacity}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Status:</span>
                                {/* TODO: Move logic to Model */}
                                <span className={`ml-2 font-semibold capitalize ${rooms.find(r => r.id === activeRoom)?.currentStatus === 'open' ? 'text-success-600' :
                                    rooms.find(r => r.id === activeRoom)?.currentStatus === 'maintenance' ? 'text-warning-600' :
                                        'text-danger-600'
                                    }`}>
                                    {rooms.find(r => r.id === activeRoom)?.currentStatus}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Desks:</span>
                                <span className="ml-2 font-semibold">{desks[activeRoom]?.length || 0}</span>
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