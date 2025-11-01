import { useState } from "react";
import mockData from '../../assets/admin/ProfileMockData.json'


export default function ProfilesManager() {
    const profiles = mockData || []

    // Default form values
    const DEFAULT_DESK_HEIGHT = 95;
    const DEFAULT_START_TIME = '09:00';
    const DEFAULT_END_TIME = '17:00';

    const [activeTab, setActiveTab] = useState('closed');
    const [showForm, setShowForm] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [profileCategory, setProfileCategory] = useState('open');
    const [scheduleType, setScheduleType] = useState('custom');
    const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
    const [endTime, setEndTime] = useState(DEFAULT_END_TIME);
    const [selectedDays, setSelectedDays] = useState({
        Mon: true,
        Tue: true,
        Wed: true,
        Thu: true,
        Fri: true,
        Sat: false,
        Sun: false
    });
    const [applyAutomatically, setApplyAutomatically] = useState(true);
    const [deskHeight, setDeskHeight] = useState(DEFAULT_DESK_HEIGHT);

    const handleDayToggle = (day) => {
        setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        console.log('Saving profile:', {
            name: profileName,
            category: profileCategory,
            scheduleType,
            startTime,
            endTime,
            selectedDays,
            deskHeight,
            applyAutomatically
        });
        // Close form after saving
        setShowForm(false);
        handleCancel();
    };

    // Reset form
    const handleCancel = () => {
        setProfileName('');
        setProfileCategory('open');
        setScheduleType('custom');
        setStartTime(DEFAULT_START_TIME);
        setEndTime(DEFAULT_END_TIME);
        setSelectedDays({ Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false });
        setDeskHeight(DEFAULT_DESK_HEIGHT);
        setApplyAutomatically(true);
        setShowForm(false);
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

    const DayCheckbox = ({ day, label }) => (
        <label className="flex items-center gap-2 cursor-pointer">
            <input
                type="checkbox"
                checked={selectedDays[day]}
                onChange={() => handleDayToggle(day)}
                className="w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </label>
    );

    const ProfileCard = ({ profile }) => (
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{profile.name}</h3>
                    <p className="text-sm text-gray-600">{profile.schedule}</p>
                </div>
                <button
                    className="text-gray-400 hover:text-danger transition-colors"
                    title="Delete profile"
                >
                    <span className="material-symbols-outlined text-xl">delete</span>
                </button>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">height</span>
                    <span>Desk: {profile.deskHeight}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                        {profile.autoApply ? 'check_circle' : 'cancel'}
                    </span>
                    <span>{profile.autoApply ? 'Auto-apply enabled' : 'Manual only'}</span>
                </div>
            </div>
            <button className="mt-3 w-full bg-accent-50 text-accent-700 py-2 rounded-lg text-sm font-medium hover:bg-accent-100 transition-colors">
                Edit Profile
            </button>
        </div>
    );

    return (
        <div className="relative bg-background min-h-screen px-4 mt-20">
            <main className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-32">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-gray-800">Profiles Management</h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 flex-wrap">
                    <TabButton value="closed" label="Closed" />
                    <TabButton value="open" label="Open" />
                    <TabButton value="maintenance" label="Maintenance" />
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent-600 transition-all inline-flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">
                            {showForm ? 'close' : 'add'}
                        </span>
                        <span>{showForm ? 'Close Form' : 'Add Profile'}</span>
                    </button>
                </div>

                {/* Created Profiles View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profiles[activeTab].map(profile => (
                        <ProfileCard key={profile.id} profile={profile} />
                    ))}
                </div>

                {/* New Profile Form */}
                {showForm && (
                    <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Profile</h2>

                        {/* Set Name */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Set name:
                            </label>
                            <input
                                type="text" required
                                placeholder="Name"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                            />
                        </div>

                        {/* Profile Category */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Profile Category:
                            </label>
                            <select
                                value={profileCategory}
                                onChange={(e) => setProfileCategory(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all bg-white"
                            >
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                                <option value="cleaning">Maintenance</option>
                            </select>
                        </div>

                        {/* Schedule Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Schedule</h3>

                            {/* Schedule Type*/}
                            <div className="flex gap-6 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="scheduleType"
                                        value="allDay"
                                        checked={scheduleType === 'allDay'}
                                        onChange={(e) => setScheduleType(e.target.value)}
                                        className="w-4 h-4 text-accent focus:ring-accent"
                                    />
                                    <span className="text-sm font-medium text-gray-700">All Day</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="scheduleType"
                                        value="custom"
                                        checked={scheduleType === 'custom'}
                                        onChange={(e) => setScheduleType(e.target.value)}
                                        className="w-4 h-4 text-accent focus:ring-accent"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Custom Time</span>
                                </label>
                            </div>

                            {/* Set Time */}
                            {scheduleType === 'custom' && (
                                <div className="flex gap-4 mb-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Day Selection */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                <DayCheckbox day="Monday" label="Monday" />
                                <DayCheckbox day="Tuesday" label="Tuesday" />
                                <DayCheckbox day="Wednesday" label="Wednesday" />
                                <DayCheckbox day="Thursday" label="Thursday" />
                                <DayCheckbox day="Friday" label="Friday" />
                                <DayCheckbox day="Saturday" label="Saturday" />
                                <DayCheckbox day="Sunday" label="Sunday" />
                            </div>


                            {/* Desk Height */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-700">Desk Height</h3>
                                    <span className="text-accent font-semibold text-lg">{deskHeight}cm</span>
                                </div>
                                <div className="relative pt-1">
                                    <input
                                        type="range"
                                        min="60"
                                        max="130"
                                        step="5"
                                        value={deskHeight}
                                        onChange={(e) => setDeskHeight(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent
                                    [&::-webkit-slider-thumb]:appearance-none 
                                    [&::-webkit-slider-thumb]:w-5 
                                    [&::-webkit-slider-thumb]:h-5 
                                    [&::-webkit-slider-thumb]:rounded-full 
                                    [&::-webkit-slider-thumb]:bg-accent
                                    [&::-webkit-slider-thumb]:cursor-pointer
                                    [&::-webkit-slider-thumb]:shadow-md
                                    [&::-webkit-slider-thumb]:hover:bg-accent-600
                                    [&::-moz-range-thumb]:w-5 
                                    [&::-moz-range-thumb]:h-5 
                                    [&::-moz-range-thumb]:rounded-full 
                                    [&::-moz-range-thumb]:bg-accent
                                    [&::-moz-range-thumb]:border-0
                                    [&::-moz-range-thumb]:cursor-pointer
                                    [&::-moz-range-thumb]:shadow-md
                                    [&::-moz-range-thumb]:hover:bg-accent-600"
                                    />
                                    {/* Range markers */}
                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                        <span>60cm</span>
                                        <span>95cm</span>
                                        <span>130cm</span>
                                    </div>
                                </div>
                            </div>
                            {/*Apply Toggle */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={applyAutomatically}
                                        onChange={(e) => setApplyAutomatically(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-accent transition-colors"></div>
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    Apply automatically to all desks during scheduled times
                                </span>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-secondary-400 transition-colors font-medium"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}