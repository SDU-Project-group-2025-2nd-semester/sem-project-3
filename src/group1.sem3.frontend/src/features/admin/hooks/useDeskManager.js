import { useState, useEffect, useCallback } from "react";
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

export function useDesksManagerPage() {
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

    // Compute current room
    const currentRoom = rooms.find(r => r.id === activeRoom);

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

    const fetchInitialData =  useCallback(async () => {
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
    }, []);

    const fetchDesksForRoom =  useCallback(async (roomId) => {
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
    }, [companyId]);

     const fetchUnadoptedDesks =  useCallback(async () => {
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
    }, [companyId]);

    const handleAdoptDesk =  useCallback(async (macAddress, rpiMacAddress, roomId) => {
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
    }, [companyId, fetchUnadoptedDesks]);

    // Simulator
    const fetchSimulatorSettings =  useCallback(async () => {
        try {
            const settings = await getSimulatorSettings(companyId);
            setCurrentSimulatorLink(settings.simulatorLink || null);
        } catch (error) {
            if (error.status !== 404) {
                console.error('Error fetching simulator settings:', error);
            }
            setCurrentSimulatorLink(null);
        }
    }, [companyId]);

    const handleSaveSimulator =  useCallback(async (e) => {
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
    }, [companyId, simulatorLink, simulatorApiKey, fetchSimulatorSettings]);

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
    const handleSaveNewRoom =  useCallback(async (e) => {
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
    }, [companyId, newRoomDays, newRoomOpeningTime, newRoomClosingTime, fetchInitialData]);

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

    const handleDeleteRoom =  useCallback(async () => {
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
    }, [companyId, currentRoom, fetchInitialData]);

    const handleSaveHours =  useCallback(async () => {
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
    }, [companyId, currentRoom, openingTime, closingTime, DaysOpen, fetchInitialData]);

    const handleCancelEditHours = () => {
        setEditingHours(false);
        setOpeningTime('');
        setClosingTime('');
    };

    const handleSetRoomHeight =  useCallback(async () => {
        if (!roomHeight || isNaN(roomHeight) || parseFloat(roomHeight) <= 0) {
            alert('Please enter a valid room height');
            return;
        }
        try {
            await setRoomHeight(companyId, currentRoom.id, parseFloat(roomHeight * 10));
            setRoomHeightInput('');
            await fetchDesksForRoom(activeRoom);
        } catch (error) {
            console.error('Error setting room height:', error);
            alert('Failed to set room height: ' + error.message);
        }
    }, [companyId, currentRoom, roomHeight, activeRoom, fetchDesksForRoom]);



    // Desk table
    const getDeskStatus = useCallback((desk) => {
        const now = new Date();
        const hasReservation = reservations.some(r => {
            if (r.deskId !== desk.id) return false;
            const start = new Date(r.start);
            const end = new Date(r.end);
            return start <= now && now <= end;
        });

        if (hasReservation) return 'booked';
        return "available";
    }, [reservations]);

    const getStatusColor = useCallback((status) => {
        switch (status) {
            case "booked":
                return "text-warning-600";
            case "available":
                return "text-success-600";
            case "unavailable":
                return "text-danger-600";
            default:
                return "text-gray-600";
        }
    }, []);

    const getStatusText = useCallback((status) => {
        switch (status) {
            case "booked":
                return "Booked";
            case "available":
                return "Available";
            case "unavailable":
                return "Unavailable";
            default:
                return status;
        }
    }, []);

    const handleDeskUnBook =  useCallback(async (deskId) => {
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
    }, [companyId, reservations, activeRoom, fetchDesksForRoom]);

    const handleDeleteDesk =  useCallback(async (deskId) => {
        if (!confirm('Are you sure you want to un-adopt this desk?')) {
            return;
        }

        try {
            await unadoptDesk(companyId, deskId);
            await fetchDesksForRoom(activeRoom);
        } catch (error) {
            console.error('Error deleting desk:', error);
            alert('Failed to delete desk: ' + error.message);
        }
    }, [companyId, activeRoom, fetchDesksForRoom]);

    // Return all state and functions for use in components
    return {
        activeRoom,
        setActiveRoom,
        showNewRoomForm,
        setShowNewRoomForm,
        desks,
        unadoptedDesks,
        loadingUnadopted,
        rooms,
        reservations,
        error,
        companyId,
        currentRoom,
        newRoomOpeningTime,
        setNewRoomOpeningTime,
        newRoomClosingTime,
        setNewRoomClosingTime,
        newRoomDays,
        setNewRoomDays,
        roomHeight,
        setRoomHeightInput,
        simulatorLink,
        setSimulatorLink,
        simulatorApiKey,
        setSimulatorApiKey,
        simulatorErrors,
        currentSimulatorLink,
        editingHours,
        setEditingHours,
        openingTime,
        setOpeningTime,
        closingTime,
        setClosingTime,
        DaysOpen,
        setDaysOpen,
        fetchDesksForRoom,
        fetchUnadoptedDesks,
        handleAdoptDesk,
        fetchSimulatorSettings,
        handleSaveSimulator,
        decodeDaysOfTheWeek,
        handleSaveNewRoom,
        handleCancelNewRoom,
        handleEditHours,
        handleDeleteRoom,
        handleSaveHours,
        handleCancelEditHours,
        handleSetRoomHeight,
        getDeskStatus,
        getStatusColor,
        getStatusText,
        handleDeskUnBook,
        handleDeleteDesk
    };
}

export function useUnadoptedDeskRow(macAddress, onAdopt) {
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

    return {
        rpiMacAddress,
        setRpiMacAddress,
        selectedRoomId,
        setSelectedRoomId,
        isAdopting,
        handleAdopt
    };
}