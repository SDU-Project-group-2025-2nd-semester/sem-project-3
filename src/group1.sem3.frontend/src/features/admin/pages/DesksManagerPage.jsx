import { useDesksManagerPage, useUnadoptedDeskRow } from "../hooks/useDeskManager"
import Button from "@shared/ui/Button";
import Card from "@shared/ui/Card";
import ConfirmDialog from "@shared/ui/ConfirmDialog";
import Input from "@shared/ui/Input";

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
                                <div className="w-full px-3 py-2 rounded border border-secondary outline-none focus:ring-2 focus:ring-accent bg-background text-primary">
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
                                <div className="w-full px-3 py-2 rounded border border-secondary outline-none focus:ring-2 focus:ring-accent bg-background text-primary">
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
                    <Card className="rounded-xl p-6">
                        <form onSubmit={handleSaveSimulator}>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-gray-600">edit</span>
                                <h2 className="text-lg font-semibold text-gray-800">Update Settings</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Simulator Link
                                    </label>
                                    <Input value={simulatorLink} onChange={e => setSimulatorLink(e.target.value)} placeholder="https://simulator.example.com" className={`${simulatorErrors.link ? 'border-danger-500 bg-danger-50' : 'border-gray-300 bg-white'}`} />
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
                                    <Input value={simulatorApiKey} onChange={e => setSimulatorApiKey(e.target.value)} placeholder="Enter 32-character API key" className={`${simulatorErrors.link ? 'border-danger-500 bg-danger-50' : 'border-gray-300 bg-white'}`} />
                                    {simulatorErrors.apiKey && (
                                        <p className="text-danger-600 text-xs mt-1.5 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">error</span>
                                            {simulatorErrors.apiKey}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-full px-6 py-2.5 text-xs inline-flex items-center justify-center gap-2 hover:shadow-md flex "
                                        title="Remove user account"
                                    >
                                        <span className="material-symbols-outlined text-sm leading-none">save</span>
                                        <span>Save Settings</span>
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function DesksManagerPage() {
    const {
        activeRoom,
        setActiveRoom,
        showNewRoomForm,
        setShowNewRoomForm,
        desks,
        unadoptedDesks,
        loadingUnadopted,
        rooms,
        // reservations,
        error,
        // companyId,
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
        // setEditingHours,
        openingTime,
        setOpeningTime,
        closingTime,
        setClosingTime,
        DaysOpen,
        setDaysOpen,
        // fetchDesksForRoom,
        fetchUnadoptedDesks,
        handleAdoptDesk,
        // fetchSimulatorSettings,
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
        handleDeleteDesk,
        dialog,
        handleDialogConfirm,
        closeDialog
    } = useDesksManagerPage();

    // Room button component
    const RoomButton = ({ roomId, label }) => (
        <Button
            variant="ghost"
            onClick={() => setActiveRoom(roomId)}
            className={
                `px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeRoom === roomId
                    ? 'bg-secondary-100 text-secondary-700 border border-secondary-300'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`
            }
        >
            {label}
        </Button>
    );

    // Error handling
    if (error) {
        return (
            <div className="relative bg-background min-h-screen px-4 mt-20 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <NotificationBanner type="error">{String(error)}</NotificationBanner>
                    <div className="mt-4 text-center">
                        <Button onClick={fetchUserAndStaff} variant="primary">Retry</Button>
                    </div>
                </div>
            </div>
        );
    }

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
                        <Button
                            variant="primary"
                            onClick={() => setShowNewRoomForm(true)}
                            className="px-6 py-2.5 text-xs inline-flex items-center justify-center gap-2 hover:shadow-md flex "
                        >
                            Create First Room
                        </Button>
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
                        <Button
                            variant="primary"
                            onClick={() => setShowNewRoomForm(!showNewRoomForm)}
                            className="px-4 py-2 text-sm inline-flex items-center gap-2 hover:shadow-md flex "
                            title="Remove user account"
                        >
                            <span className="material-symbols-outlined text-base">
                                {showNewRoomForm ? 'close' : 'add'}
                            </span>
                            <span>Room</span>
                        </Button>
                    </div>

                    {isUnadoptedView ? (
                        /* Unadopted Desks View */
                        <Card className="overflow-hidden mb-6 p-0">
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-700">
                                    Unadopted Desks
                                </h3>
                                <Button
                                    variant="primary"
                                    onClick={fetchUnadoptedDesks}
                                    disabled={loadingUnadopted}
                                    className="px-4 py-2 text-xs inline-flex items-center justify-center gap-2 hover:shadow-md flex"
                                >
                                    <span className="material-symbols-outlined text-base">
                                        refresh
                                    </span>
                                    <span>Refresh</span>
                                </Button>
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
                        </Card>
                    ) : (
                        /* Regular Room View */
                        <>
                            {/* Info card */}
                            <Card className="rounded-xl p-4 mb-4">
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
                                                <Input type="time" value={openingTime} onChange={e => setOpeningTime(e.target.value)} className="w-auto" />
                                            </div>
                                            <div>
                                                <label className="text-gray-600 text-xs block mb-1">Closing:</label>
                                                <Input type="time" value={closingTime} onChange={e => setClosingTime(e.target.value)} className="w-auto" />
                                            </div>
                                            <div>
                                                <label className="text-gray-600 text-xs block mb-1">Set open days:</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                                        <label key={day} className="flex items-center gap-2 cursor-pointer">
                                                            <Input type="checkbox" checked={!!DaysOpen[day]} onChange={e => setDaysOpen({ ...DaysOpen, [day]: e.target.checked })} className="w-auto" />
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
                                        <Button onClick={handleEditHours} variant="primary" className="py-1.5">Edit Schedule</Button>
                                    ) : (
                                        <>
                                            <Button onClick={handleSaveHours} variant="primary" className="py-1.5">Save</Button>
                                            <Button onClick={handleCancelEditHours} variant="ghost" className="py-1.5 border border-gray-200 hover:bg-gray-50">Cancel</Button>
                                        </>
                                    )}
                                    <Button
                                        onClick={handleDeleteRoom}
                                        variant="danger"
                                        className="py-1.5"
                                        title="Delete room"
                                    >
                                        <span className="material-symbols-outlined text-sm leading-none">delete</span>
                                        Delete room
                                    </Button>
                                </div>
                                <div className="mt-3 flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Desk Height
                                        </label>
                                        <Input type="number" placeholder="Enter height in cm" value={roomHeight} onChange={(e) => setRoomHeightInput(e.target.value)} min="60" max="120" step="0.1" />

                                    </div>
                                    <Button
                                        variant="primary"
                                        onClick={handleSetRoomHeight}
                                        className="px-6 py-2.5 text-sm inline-flex items-center justify-center gap-2 hover:shadow-md flex "
                                    >
                                        Set Height
                                    </Button>
                                </div>
                            </Card>

                            {/* Desks table*/}
                            <Card className="overflow-hidden mb-6 p-0">
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
                                                            <Button
                                                                variant="danger"
                                                                onClick={() => handleDeleteDesk(desk.id)}
                                                                title="Delete desk"
                                                                className="text-sm inline-flex items-center justify-center gap-2 hover:shadow-md flex"
                                                            >
                                                                <span className="material-symbols-outlined text-sm leading-none">delete</span>
                                                                <span className="lg:hidden">Delete</span>
                                                            </Button>
                                                            <Button
                                                                variant="primary"
                                                                onClick={() => handleDeskUnBook(desk.id)}
                                                                title="Cancel desk booking"
                                                                className="ml-2 text-sm inline-flex items-center justify-center gap-2 hover:shadow-md flex "
                                                                disabled={status !== 'booked'}
                                                            >
                                                                Cancel Booking
                                                            </Button>
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
                            </Card>
                        </>
                    )}

                    {/* New Room form */}
                    {showNewRoomForm && (
                        <Card className="max-w-md">
                            <form onSubmit={handleSaveNewRoom}>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">New Room</h3>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Opening Time
                                    </label>
                                    <Input type="time" required={true} value={newRoomOpeningTime} onChange={e => setNewRoomOpeningTime(e.target.value)} className="w-full" />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Closing Time
                                    </label>
                                    <Input type="time" required={true} value={newRoomClosingTime} onChange={e => setNewRoomClosingTime(e.target.value)} className="w-full" />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Days of Week
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                            <label key={day} className="flex items-center gap-2 cursor-pointer">
                                                <Input type="checkbox" checked={newRoomDays[day]} onChange={e => setNewRoomDays({ ...newRoomDays, [day]: e.target.checked })} className="w-auto " />
                                                <span className="text-sm text-gray-700 capitalize">{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button type="submit" variant="primary">Save</Button>
                                    <Button type="button" onClick={handleCancelNewRoom} variant="ghost" className="border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</Button>
                                </div>
                            </form>
                        </Card>
                    )}
                </section>
            </main>            {dialog.isOpen && (
                <ConfirmDialog
                    message={dialog.message}
                    onConfirm={handleDialogConfirm}
                    onCancel={closeDialog}
                    confirmLabel={dialog.confirmLabel}
                    cancelLabel={dialog.cancelLabel}
                />
            )}        </div >
    );
}

// Component for unadopted desk row
function UnadoptedDeskRow({ macAddress, rooms, onAdopt }) {
    const {
        rpiMacAddress,
        setRpiMacAddress,
        selectedRoomId,
        setSelectedRoomId,
        isAdopting,
        handleAdopt,
        dialog,
        handleDialogConfirm,
        closeDialog
    } = useUnadoptedDeskRow(macAddress, onAdopt);

    return (
        <>
            <tr className="border-t last:border-b hover:bg-gray-50 transition-colors max-lg:flex max-lg:flex-wrap max-lg:border-b max-lg:py-2">
                <td className="px-4 py-3 text-sm font-medium max-lg:w-full">
                    <span className="font-semibold lg:hidden">MAC Address: </span>
                    <span className="font-mono">{macAddress}</span>
                </td>
                <td className="px-4 py-3 text-sm max-lg:w-full">
                    <span className="font-semibold lg:hidden">RPI MAC Address: </span>
                    <Input placeholder="XX:XX:XX:XX:XX:XX" value={rpiMacAddress} onChange={e => setRpiMacAddress(e.target.value)} max={17} className="w-auto" />
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
                    <Button
                        variant="primary"
                        onClick={handleAdopt}
                        disabled={!selectedRoomId || isAdopting}
                        className="inline-flex items-center justify-center"
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
                    </Button>
                </td>
            </tr>
            {dialog.isOpen && (
                <ConfirmDialog
                    message={dialog.message}
                    onConfirm={handleDialogConfirm}
                    onCancel={closeDialog}
                    confirmLabel={dialog.confirmLabel}
                    cancelLabel={dialog.cancelLabel}
                />
            )}
        </>
    );
}