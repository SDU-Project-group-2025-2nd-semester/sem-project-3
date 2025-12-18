import { useState, useEffect } from "react";
// Use centralized admin services
import {
    getMyCompanies,
    getRooms,
    deleteRoom,
    getDesksForRoom,
    setRoomHeight,
    getReservations,
    getUnadoptedDesks,
    adoptDesk,
    unadoptDesk,
    getSimulatorSettings,
    updateSimulatorSettings,
    deleteReservation as apiDeleteReservation,
    createRoom,
    updateRoom,
} from "../admin.services";

function Simulator({
    currentSimulatorLink,
    simulatorLink,
    setSimulatorLink,
    simulatorApiKey,
    setSimulatorApiKey,
    simulatorErrors,
    handleSaveSimulator
}) {
    return (
        <div className="overflow-hidden mb-6">
            <div className="px-6 pt-6 pb-4">
                <h1 className="text-2xl font-semibold text-gray-800">Simulator Management</h1>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Settings Display */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-gray-600">settings</span>
                            <h2 className="text-lg font-semibold text-gray-800">Current Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Simulator Link
                                </label>
                                <div className="text-sm text-gray-800 font-mono bg-white px-4 py-3 rounded-lg border border-gray-300 break-all shadow-sm">
                                    {currentSimulatorLink ? (
                                        <span className="text-accent-600">{currentSimulatorLink}</span>
                                    ) : (
                                        <span className="text-gray-400 italic">Not configured</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    API Key
                                </label>
                                <div className="text-sm text-gray-800 font-mono bg-white px-4 py-3 rounded-lg border border-gray-300 shadow-sm">
                                    {currentSimulatorLink ? (
                                        <span className="text-gray-600 select-none">********************************</span>
                                    ) : (
                                        <span className="text-gray-400 italic">Not configured</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Update Form */}
                    <form onSubmit={handleSaveSimulator} className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-gray-600">edit</span>
                            <h2 className="text-lg font-semibold text-gray-800">Update Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Simulator Link
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://simulator.example.com"
                                    value={simulatorLink}
                                    onChange={(e) => setSimulatorLink(e.target.value)}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all ${simulatorErrors.link ? 'border-danger-500 bg-danger-50' : 'border-gray-300 bg-white'
                                        }`}
                                />
                                {simulatorErrors.link && (
                                    <p className="text-danger-600 text-xs mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">error</span>
                                        {simulatorErrors.link}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    API Key
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter 32-character API key"
                                    value={simulatorApiKey}
                                    onChange={(e) => setSimulatorApiKey(e.target.value)}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all font-mono text-sm ${simulatorErrors.apiKey ? 'border-danger-500 bg-danger-50' : 'border-gray-300 bg-white'
                                        }`}
                                />
                                {simulatorErrors.apiKey && (
                                    <p className="text-danger-600 text-xs mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">error</span>
                                        {simulatorErrors.apiKey}
                                    </p>
                                )}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-600 transition-colors font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function DesksManagerPage() {
    const [activeRoom, setActiveRoom] = useState(null);
    const [showNewRoomForm, setShowNewRoomForm] = useState(false);
    const [desks, setDesks] = useState([]);
    const [unadoptedDesks, setUnadoptedDesks] = useState([]); // Array of MAC addresses
    const [loadingUnadopted, setLoadingUnadopted] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState(null);
    const [companyId, setCompanyId] = useState(null);

    const [newRoomOpeningTime, setNewRoomOpeningTime] = useState('');
    const [newRoomClosingTime, setNewRoomClosingTime] = useState('');
    const [newRoomDays, setNewRoomDays] = useState({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
    });
    const [roomHeight, setRoomHeightInput] = useState('');

    const [simulatorLink, setSimulatorLink] = useState('');
    const [simulatorApiKey, setSimulatorApiKey] = useState('');
    const [simulatorErrors, setSimulatorErrors] = useState({});
    const [currentSimulatorLink, setCurrentSimulatorLink] = useState(null);

    const [editingHours, setEditingHours] = useState(false);
    const [openingTime, setOpeningTime] = useState('');
    const [closingTime, setClosingTime] = useState('');
    const [DaysOpen, setDaysOpen] = useState({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
    });

    // Initialization
    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (activeRoom && companyId && activeRoom !== 'unadopted') {
            fetchDesksForRoom(activeRoom);
        } else if (activeRoom === 'unadopted' && companyId) {
            fetchUnadoptedDesks();
        }
    }, [activeRoom, companyId]);

    useEffect(() => {
        if (companyId) {
            fetchSimulatorSettings();
        }
    }, [companyId]);

    const fetchInitialData = async () => {
        setError(null);

        const userCompanies = await getMyCompanies();

        if (!userCompanies || userCompanies.length === 0) {
            throw new Error('No company associated with current user');
        }

        const userCompanyId = userCompanies[0].companyId;
        setCompanyId(userCompanyId);

        const roomsData = await getRooms(userCompanyId);
        setRooms(roomsData);

        if (roomsData.length > 0) {
            setActiveRoom(roomsData[0].id);
        }
    };

    const fetchDesksForRoom = async (roomId) => {
        try {
            const [desksData, reservationsData] = await Promise.all([
                getDesksForRoom(companyId, roomId),
                getReservations(companyId)
            ]);

            setDesks(desksData);
            setReservations(reservationsData);
        } catch (error) {
            if (error.status === 404) {
                setDesks([]);
                setReservations([]);
            } else {
                console.error('Error fetching desks:', error);
                setError(error.message);
            }
        }
    };

    const fetchUnadoptedDesks = async () => {
        if (!companyId) return;

        try {
            setLoadingUnadopted(true);
            setError(null);
            const macAddresses = await getUnadoptedDesks(companyId);
            setUnadoptedDesks(macAddresses || []);
        } catch (error) {
            console.error('Error fetching unadopted desks:', error);
            setError(error.message);
            setUnadoptedDesks([]);
        } finally {
            setLoadingUnadopted(false);
        }
    };

    const handleAdoptDesk = async (macAddress, rpiMacAddress, roomId) => {
        if (!roomId || roomId === '') {
            alert('Please select a room');
            return;
        }

        try {
            const newDesk = {
                macAddress: macAddress,
                roomId: roomId
            };

            // Only include rpiMacAddress if provided
            if (rpiMacAddress && rpiMacAddress.trim() !== '') {
                newDesk.rpiMacAddress = rpiMacAddress.trim();
            }

            await adoptDesk(companyId, newDesk.macAddress, newDesk.rpiMacAddress, newDesk.roomId);
            await fetchUnadoptedDesks(); // Refresh the list
            alert('Desk adopted successfully!');
        } catch (error) {
            console.error('Error adopting desk:', error);
            console.error('Error body:', error.body);
            const errorMessage = error.body?.error || error.body?.message || error.message || 'Unknown error';
            alert('Failed to adopt desk: ' + errorMessage);
        }
    };

    // Simulator
    const fetchSimulatorSettings = async () => {
        try {
            const settings = await getSimulatorSettings(companyId);
            setCurrentSimulatorLink(settings.simulatorLink || null);
        } catch (error) {
            if (error.status !== 404) {
                console.error('Error fetching simulator settings:', error);
            }
            setCurrentSimulatorLink(null);
        }
    };

    const handleSaveSimulator = async (e) => {
        e.preventDefault();

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

        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            const simulatorSettings = {
                simulatorLink: simulatorLink.trim(),
                simulatorApiKey: simulatorApiKey.trim()
            };

            await updateSimulatorSettings(companyId, simulatorSettings);
            alert('Simulator settings saved successfully!');
            setSimulatorLink('');
            setSimulatorApiKey('');
            setSimulatorErrors({});
            await fetchSimulatorSettings();
        } catch (error) {
            console.error('Error saving simulator:', error);
            alert('Failed to save simulator: ' + error.message);
        }
    };

    // Info card
    function decodeDaysOfTheWeek(daysBitmask) {
        if (!daysBitmask || typeof daysBitmask !== 'number') return 'Not set';
        const days = [
            { name: 'Monday', value: 1 },
            { name: 'Tuesday', value: 2 },
            { name: 'Wednesday', value: 4 },
            { name: 'Thursday', value: 8 },
            { name: 'Friday', value: 16 },
            { name: 'Saturday', value: 32 },
            { name: 'Sunday', value: 64 },
        ];
        const openDays = days.filter(d => (daysBitmask & d.value) !== 0).map(d => d.name);
        if (openDays.length === 0) return 'Not set';
        return openDays.join(', ');
    }

    // New Room
    const handleSaveNewRoom = async (e) => {
        e.preventDefault();

        try {
            const formatTime = (time) => {
                return time.length === 5 ? `${time}:00` : time;
            };

            let daysValue = 0;
            if (newRoomDays.monday) daysValue += 1;
            if (newRoomDays.tuesday) daysValue += 2;
            if (newRoomDays.wednesday) daysValue += 4;
            if (newRoomDays.thursday) daysValue += 8;
            if (newRoomDays.friday) daysValue += 16;
            if (newRoomDays.saturday) daysValue += 32;
            if (newRoomDays.sunday) daysValue += 64;

            const newRoom = {
                ReadableId: "R-00",
                DeskIds: [],
                OpeningHours: {
                    OpeningTime: formatTime(newRoomOpeningTime),
                    ClosingTime: formatTime(newRoomClosingTime),
                    DaysOfTheWeek: daysValue
                },
                CompanyId: companyId
            };

            const createdRoom = await createRoom(companyId, newRoom);
            await fetchInitialData();
            handleCancelNewRoom();
            setActiveRoom(createdRoom.id);
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room: ' + error.message);
        }
    };

    const handleCancelNewRoom = () => {
        setNewRoomOpeningTime('');
        setNewRoomClosingTime('');
        setNewRoomDays({
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false
        });
        setShowNewRoomForm(false);
    };

    // Room Editing
    const handleEditHours = () => {
        if (currentRoom && currentRoom.openingHours) {
            setOpeningTime(currentRoom.openingHours.openingTime || '');
            setClosingTime(currentRoom.openingHours.closingTime || '');
            const daysBitmask = currentRoom.openingHours.daysOfTheWeek || 0;
            setDaysOpen({
                monday: (daysBitmask & 1) !== 0,
                tuesday: (daysBitmask & 2) !== 0,
                wednesday: (daysBitmask & 4) !== 0,
                thursday: (daysBitmask & 8) !== 0,
                friday: (daysBitmask & 16) !== 0,
                saturday: (daysBitmask & 32) !== 0,
                sunday: (daysBitmask & 64) !== 0
            });
        }
        setEditingHours(true);
    };

    const handleDeleteRoom = async () => {
        if (!confirm('Are you sure you want to delete this room?')) {
            return;
        }

        try {
            await deleteRoom(companyId, currentRoom.id);
            await fetchInitialData();
        } catch (error) {
            console.error('Error deleting room:', error);
            alert('Failed to delete room: ' + error.message);
        }
    };

    const handleSaveHours = async () => {
        if (!openingTime || !closingTime) {
            alert('Please enter both opening and closing times');
            return;
        }

        try {
            const formatTime = (time) => {
                return time.length === 5 ? `${time}:00` : time;
            };

            let daysValue = 0;
            if (DaysOpen.monday) daysValue += 1;
            if (DaysOpen.tuesday) daysValue += 2;
            if (DaysOpen.wednesday) daysValue += 4;
            if (DaysOpen.thursday) daysValue += 8;
            if (DaysOpen.friday) daysValue += 16;
            if (DaysOpen.saturday) daysValue += 32;
            if (DaysOpen.sunday) daysValue += 64;

            const updatedOpeningHours = {
                OpeningTime: formatTime(openingTime),
                ClosingTime: formatTime(closingTime),
                DaysOfTheWeek: daysValue
            };

            const updatedRoom = {
                Id: currentRoom.id,
                ReadableId: currentRoom.readableId,
                DeskIds: currentRoom.deskIds || [],
                OpeningHours: updatedOpeningHours,
                CompanyId: currentRoom.companyId,
                Desks: [],
                Company: null
            };

            await updateRoom(companyId, currentRoom.id, updatedRoom);
            await fetchInitialData();
            setEditingHours(false);
            alert('Room schedule updated successfully!');
        } catch (error) {
            console.error('Error updating opening hours:', error);
            alert('Failed to update room schedule: ' + error.message);
        }
    };

    const handleCancelEditHours = () => {
        setEditingHours(false);
        setOpeningTime('');
        setClosingTime('');
    };

    const handleSetRoomHeight = async () => {
        if (!roomHeight || isNaN(roomHeight) || parseFloat(roomHeight) <= 0) {
            alert('Please enter a valid room height');
            return;
        }
        try {
            console.log(parseFloat(roomHeight * 10));
            await setRoomHeight(companyId, currentRoom.id, parseFloat(roomHeight * 10));
            setRoomHeightInput('');
            await fetchDesksForRoom(activeRoom);
        } catch (error) {
            console.error('Error setting room height:', error);
            alert('Failed to set room height: ' + error.message);
        }
    }

    // Room button component
    const RoomButton = ({ roomId, label }) => (
        <button
            onClick={() => setActiveRoom(roomId)}
            className={
                `px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeRoom === roomId
                    ? 'bg-secondary-100 text-secondary-700 border border-secondary-300'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`
            }
        >
            {label}
        </button>
    );

    // Desk table
    const getDeskStatus = (desk) => {
        const now = new Date();
        const hasReservation = reservations.some(r => {
            if (r.deskId !== desk.id) return false;
            const start = new Date(r.start);
            const end = new Date(r.end);
            return start <= now && now <= end;
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
                alert(`No booking found for that desk`);
                return;
            }
            if (!confirm('Are you sure you want to cancel this booking?')) {
                return;
            }

            await apiDeleteReservation(companyId, activeReservation.id);
            await fetchDesksForRoom(activeRoom);
        } catch (error) {
            console.error('Error canceling booking:', error);
            alert('Failed to cancel booking: ' + error.message);
        }
    };

    const handleDeleteDesk = async (deskId) => {
        if (!confirm('Are you sure you want to un-adopt this desk?')) {
            return;
        }

        try {
            console.log(companyId, deskId)
            await unadoptDesk(companyId, deskId);
            await fetchDesksForRoom(activeRoom);
        } catch (error) {
            console.error('Error deleting desk:', error);
            alert('Failed to delete desk: ' + error.message);
        }
    };

    // Error handling
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

    // Simulator
    // const Simulator = () => {
    //     return (
    //         <div className="overflow-hidden mb-6">
    //             <div className="px-6 pt-6 pb-4">
    //                 <h1 className="text-2xl font-semibold text-gray-800">Simulator Management</h1>
    //             </div>

    //             <div className="p-6">
    //                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    //                     {/* Current Settings Display */}
    //                     <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
    //                         <div className="flex items-center gap-2 mb-4">
    //                             <span className="material-symbols-outlined text-gray-600">settings</span>
    //                             <h2 className="text-lg font-semibold text-gray-800">Current Settings</h2>
    //                         </div>
    //                         <div className="space-y-4">
    //                             <div>
    //                                 <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
    //                                     Simulator Link
    //                                 </label>
    //                                 <div className="text-sm text-gray-800 font-mono bg-white px-4 py-3 rounded-lg border border-gray-300 break-all shadow-sm">
    //                                     {currentSimulatorLink ? (
    //                                         <span className="text-accent-600">{currentSimulatorLink}</span>
    //                                     ) : (
    //                                         <span className="text-gray-400 italic">Not configured</span>
    //                                     )}
    //                                 </div>
    //                             </div>
    //                             <div>
    //                                 <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
    //                                     API Key
    //                                 </label>
    //                                 <div className="text-sm text-gray-800 font-mono bg-white px-4 py-3 rounded-lg border border-gray-300 shadow-sm">
    //                                     {currentSimulatorLink ? (
    //                                         <span className="text-gray-600 select-none">********************************</span>
    //                                     ) : (
    //                                         <span className="text-gray-400 italic">Not configured</span>
    //                                     )}
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     </div>

    //                     {/* Update Form */}
    //                     <form onSubmit={handleSaveSimulator} className="bg-white rounded-xl border border-gray-200 p-6">
    //                         <div className="flex items-center gap-2 mb-4">
    //                             <span className="material-symbols-outlined text-gray-600">edit</span>
    //                             <h2 className="text-lg font-semibold text-gray-800">Update Settings</h2>
    //                         </div>
    //                         <div className="space-y-4">
    //                             <div>
    //                                 <label className="block text-sm font-medium text-gray-700 mb-2">
    //                                     Simulator Link
    //                                 </label>
    //                                 <input
    //                                     type="text"
    //                                     placeholder="https://simulator.example.com"
    //                                     value={simulatorLink}
    //                                     onChange={(e) => setSimulatorLink(e.target.value)}
    //                                     className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all ${simulatorErrors.link ? 'border-danger-500 bg-danger-50' : 'border-gray-300 bg-white'
    //                                         }`}
    //                                 />
    //                                 {simulatorErrors.link && (
    //                                     <p className="text-danger-600 text-xs mt-1.5 flex items-center gap-1">
    //                                         <span className="material-symbols-outlined text-sm">error</span>
    //                                         {simulatorErrors.link}
    //                                     </p>
    //                                 )}
    //                             </div>

    //                             <div>
    //                                 <label className="block text-sm font-medium text-gray-700 mb-2">
    //                                     API Key
    //                                 </label>
    //                                 <input
    //                                     type="text"
    //                                     placeholder="Enter 32-character API key"
    //                                     value={simulatorApiKey}
    //                                     onChange={(e) => setSimulatorApiKey(e.target.value)}
    //                                     className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all font-mono text-sm ${simulatorErrors.apiKey ? 'border-danger-500 bg-danger-50' : 'border-gray-300 bg-white'
    //                                         }`}
    //                                 />
    //                                 {simulatorErrors.apiKey && (
    //                                     <p className="text-danger-600 text-xs mt-1.5 flex items-center gap-1">
    //                                         <span className="material-symbols-outlined text-sm">error</span>
    //                                         {simulatorErrors.apiKey}
    //                                     </p>
    //                                 )}
    //                             </div>

    //                             <div className="pt-2">
    //                                 <button
    //                                     type="submit"
    //                                     className="w-full px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-600 transition-colors font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
    //                                 >
    //                                     <span className="material-symbols-outlined text-sm">save</span>
    //                                     Save Settings
    //                                 </button>
    //                             </div>
    //                         </div>
    //                     </form>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // };

    const currentRoom = rooms.find(r => r.id === activeRoom);
    const isUnadoptedView = activeRoom === 'unadopted';

    // No room available
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
                    <Simulator
                        currentSimulatorLink={currentSimulatorLink}
                        simulatorLink={simulatorLink}
                        setSimulatorLink={setSimulatorLink}
                        simulatorApiKey={simulatorApiKey}
                        setSimulatorApiKey={setSimulatorApiKey}
                        simulatorErrors={simulatorErrors}
                        handleSaveSimulator={handleSaveSimulator}
                    />
                </main>
            </div>
        );
    }

    // main page render
    return (
        <div className="relative bg-background min-h-screen px-4 mt-20">
            <main className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-32">
                <Simulator
                    currentSimulatorLink={currentSimulatorLink}
                    simulatorLink={simulatorLink}
                    setSimulatorLink={setSimulatorLink}
                    simulatorApiKey={simulatorApiKey}
                    setSimulatorApiKey={setSimulatorApiKey}
                    simulatorErrors={simulatorErrors}
                    handleSaveSimulator={handleSaveSimulator}
                />
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-gray-800">Room Management</h1>
                </div>

                {/* Room Management */}
                <section>
                    {/* Select room buttons */}
                    <div className="flex gap-2 flex-wrap mb-6">
                        {rooms.map(room => (
                            <RoomButton key={room.id} roomId={room.id} label={room.readableId || 'Unknown Room'} />
                        ))}
                        <RoomButton roomId="unadopted" label="Unadopted" />
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

                    {isUnadoptedView ? (
                        /* Unadopted Desks View */
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-700">
                                    Unadopted Desks
                                </h3>
                                <button
                                    onClick={fetchUnadoptedDesks}
                                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
                                    disabled={loadingUnadopted}
                                >
                                    <span className="material-symbols-outlined text-base">
                                        refresh
                                    </span>
                                    <span>Refresh</span>
                                </button>
                            </div>

                            {loadingUnadopted ? (
                                <div className="p-8 text-center text-gray-500">
                                    Loading unadopted desks...
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full table-auto max-lg:block">
                                        <thead className="bg-gray-50 max-lg:hidden">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">MAC Address</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">RPI MAC Address</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Room</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="max-lg:block divide-y divide-gray-100">
                                            {unadoptedDesks.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-4 py-6 text-center text-sm text-gray-500">
                                                        No unadopted desks found
                                                    </td>
                                                </tr>
                                            ) : (
                                                unadoptedDesks.map((macAddress) => (
                                                    <UnadoptedDeskRow
                                                        key={macAddress}
                                                        macAddress={macAddress}
                                                        rooms={rooms}
                                                        onAdopt={handleAdoptDesk}
                                                    />
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Regular Room View */
                        <>
                            {/* Info card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm items-center">
                                    <div>
                                        <span className="text-gray-600">Desks:</span>
                                        <span className="ml-2 font-semibold">
                                            {desks.filter(d => d.roomId === currentRoom?.id).length}
                                        </span>
                                    </div>
                                    {!editingHours ? (
                                        <>
                                            <div>
                                                <span className="text-gray-600">Opening:</span>
                                                <span className="ml-2 font-semibold">
                                                    {currentRoom?.openingHours?.openingTime || 'Not set'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Closing:</span>
                                                <span className="ml-2 font-semibold">
                                                    {currentRoom?.openingHours?.closingTime || 'Not set'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Open on</span>
                                                <span className="ml-2 font-semibold">
                                                    {decodeDaysOfTheWeek(currentRoom?.openingHours?.daysOfTheWeek)}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="text-gray-600 text-xs block mb-1">Opening:</label>
                                                <input
                                                    type="time"
                                                    value={openingTime}
                                                    onChange={(e) => setOpeningTime(e.target.value)}
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-gray-600 text-xs block mb-1">Closing:</label>
                                                <input
                                                    type="time"
                                                    value={closingTime}
                                                    onChange={(e) => setClosingTime(e.target.value)}
                                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-gray-600 text-xs block mb-1">Set open days:</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                                        <label key={day} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!DaysOpen[day]}
                                                                onChange={e => setDaysOpen({ ...DaysOpen, [day]: e.target.checked })}
                                                                className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                                                            />
                                                            <span className="text-sm text-gray-700 capitalize">{day}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="mt-3 flex gap-2">
                                    {!editingHours ? (
                                        <button
                                            onClick={handleEditHours}
                                            className="px-4 py-1.5 bg-accent text-white rounded-lg text-sm hover:bg-accent-600 transition-colors"
                                        >
                                            Edit Schedule
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleSaveHours}
                                                className="px-4 py-1.5 bg-accent text-white rounded-lg text-sm hover:bg-accent-600 transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancelEditHours}
                                                className="px-4 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={handleDeleteRoom}
                                        className="bg-danger text-white px-3 py-1.5 rounded-lg text-xs hover:bg-danger-600 transition-all inline-flex items-center gap-1"
                                        title="Delete room"
                                    >
                                        <span className="material-symbols-outlined text-sm leading-none">delete</span>
                                        Delete room
                                    </button>
                                </div>
                                <div className="mt-3 flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Room Height (cm)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Enter height in cm"
                                            value={roomHeight}
                                            onChange={(e) => setRoomHeightInput(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                                            min="0"
                                            step="0.1"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSetRoomHeight}
                                        className="px-4 py-1.5 bg-accent text-white rounded-lg text-sm hover:bg-accent-600 transition-colors inline-flex items-center gap-2"
                                    >
                                        Set Height
                                    </button>
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
                        </>
                    )}

                    {/* New Room form */}
                    {showNewRoomForm && (
                        <form onSubmit={handleSaveNewRoom} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-md">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">New Room</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Opening Time
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={newRoomOpeningTime}
                                    onChange={(e) => setNewRoomOpeningTime(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Closing Time
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={newRoomClosingTime}
                                    onChange={(e) => setNewRoomClosingTime(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Days of Week
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                        <label key={day} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newRoomDays[day]}
                                                onChange={(e) => setNewRoomDays({ ...newRoomDays, [day]: e.target.checked })}
                                                className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                                            />
                                            <span className="text-sm text-gray-700 capitalize">{day}</span>
                                        </label>
                                    ))}
                                </div>
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

// Component for unadopted desk row
function UnadoptedDeskRow({ macAddress, rooms, onAdopt }) {
    const [rpiMacAddress, setRpiMacAddress] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [isAdopting, setIsAdopting] = useState(false);

    const handleAdopt = async () => {
        if (!selectedRoomId) {
            alert('Please select a room');
            return;
        }

        setIsAdopting(true);
        try {
            await onAdopt(macAddress, rpiMacAddress, selectedRoomId);
            setRpiMacAddress('');
            setSelectedRoomId('');
        } catch (error) {
            console.error('Error in adopt handler:', error);
        } finally {
            setIsAdopting(false);
        }
    };

    return (
        <tr className="border-t last:border-b hover:bg-gray-50 transition-colors max-lg:flex max-lg:flex-wrap max-lg:border-b max-lg:py-2">
            <td className="px-4 py-3 text-sm font-medium max-lg:w-full">
                <span className="font-semibold lg:hidden">MAC Address: </span>
                <span className="font-mono">{macAddress}</span>
            </td>
            <td className="px-4 py-3 text-sm max-lg:w-full">
                <span className="font-semibold lg:hidden">RPI MAC Address: </span>
                <input
                    type="text"
                    placeholder="XX:XX:XX:XX:XX:XX"
                    value={rpiMacAddress}
                    onChange={(e) => setRpiMacAddress(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none font-mono max-w-xs"
                    maxLength={17}
                />
            </td>
            <td className="px-4 py-3 text-sm max-lg:w-full">
                <span className="font-semibold lg:hidden">Room: </span>
                <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                >
                    <option value="">Select a room</option>
                    {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                            {room.readableId || 'Unknown Room'}
                        </option>
                    ))}
                </select>
            </td>
            <td className="px-4 py-3 text-sm max-lg:w-full">
                <button
                    onClick={handleAdopt}
                    disabled={!selectedRoomId || isAdopting}
                    className="bg-accent text-white px-4 py-2 rounded-lg text-sm hover:bg-accent-600 transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isAdopting ? (
                        <>
                            <span className="material-symbols-outlined text-base animate-spin">sync</span>
                            <span>Adopting...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-base">add</span>
                            <span>Adopt</span>
                        </>
                    )}
                </button>
            </td>
        </tr>
    );
}