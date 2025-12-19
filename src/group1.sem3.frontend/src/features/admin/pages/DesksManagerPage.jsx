import { useDesksManagerPage, useUnadoptedDeskRow } from "../hooks/useDeskManager"

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
        handleDeleteDesk
    } = useDesksManagerPage();

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
                                            Desk Height
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
    const {
        rpiMacAddress,
        setRpiMacAddress,
        selectedRoomId,
        setSelectedRoomId,
        isAdopting,
        handleAdopt
    } = useUnadoptedDeskRow(macAddress, onAdopt);

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