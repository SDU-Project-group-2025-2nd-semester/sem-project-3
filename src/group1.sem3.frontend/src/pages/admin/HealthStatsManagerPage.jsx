import { useState } from "react";
import {
    LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import MockData from '../../assets/admin/HealthStatsMockData.json';

export default function HealthStatsManagerPage() {
    const [viewMode, setViewMode] = useState('weekdays'); // weekdays or weekends
    const [activeRoom, setActiveRoom] = useState('room1');
    const [showHumidity, setShowHumidity] = useState(true);
    const [showTemperature, setShowTemperature] = useState(true);

    const occupancyData = viewMode === 'weekdays'
        ? MockData.roomOccupancy.weekdays
        : MockData.roomOccupancy.weekends;

    const comfortData = MockData.comfortFactors.humidity.map((item, index) => ({
        day: item.day,
        humidity: showHumidity ? item.value : 0,
        temperature: showTemperature ? MockData.comfortFactors.temperature[index].value : 0
    }));

    const TabButton = ({ active, onClick, children }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${active
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
        >
            {children}
        </button>
    );

    const RoomButton = ({ active, onClick, children }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${active
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="relative bg-background min-h-screen px-4 mt-20">
            <main className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-32">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-gray-800">Health Statistics</h1>
                </div>

                <div className="flex gap-2 items-center bg-gray-50 p-1 rounded-lg w-fit">
                    <TabButton active={viewMode === 'weekdays'} onClick={() => setViewMode('weekdays')}>
                        Weekdays
                    </TabButton>
                    <TabButton active={viewMode === 'weekends'} onClick={() => setViewMode('weekends')}>
                        Weekends
                    </TabButton>
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                        + Add View?
                    </button>
                </div>

                <div className="flex gap-2 flex-wrap bg-gray-50 p-1 rounded-lg w-fit">
                    <RoomButton active={activeRoom === 'room1'} onClick={() => setActiveRoom('room1')}>
                        {MockData.roomData.room1.name}
                    </RoomButton>
                    <RoomButton active={activeRoom === 'room2'} onClick={() => setActiveRoom('room2')}>
                        {MockData.roomData.room1.name}
                    </RoomButton>
                    <RoomButton active={activeRoom === 'room3'} onClick={() => setActiveRoom('room3')}>
                        {MockData.roomData.room3.name}
                    </RoomButton>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        {MockData.roomData[activeRoom].name} Statistics
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Avg Occupancy</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {MockData.roomData[activeRoom].avgOccupancy}%
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Peak Occupancy</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {MockData.roomData[activeRoom].peakOccupancy}%
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Avg Desk Time</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {MockData.roomData[activeRoom].avgDeskTime}h
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Avg Height</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {MockData.roomData[activeRoom].avgDeskHeight}cm
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Comfort Score</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {MockData.roomData[activeRoom].comfortScore}/10
                            </p>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Room Occupancy*/}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Room occupancy</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={occupancyData}>
                                <defs>
                                    <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="time"
                                    tick={{ fontSize: 12 }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="occupancy"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="url(#colorOccupancy)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="trend"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Comfort Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-700">Comfort factors</h2>
                            <div className="flex gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showHumidity}
                                        onChange={(e) => setShowHumidity(e.target.checked)}
                                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700">Humidity</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showTemperature}
                                        onChange={(e) => setShowTemperature(e.target.checked)}
                                        className="w-4 h-4 text-gray-500 rounded focus:ring-gray-500"
                                    />
                                    <span className="text-sm text-gray-700">Temperature</span>
                                </label>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={comfortData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis
                                    dataKey="day"
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 60]}
                                    tick={{ fontSize: 10 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                {showHumidity && (
                                    <Radar
                                        name="Humidity"
                                        dataKey="humidity"
                                        stroke="#f97316"
                                        fill="#f97316"
                                        fillOpacity={0.5}
                                        strokeWidth={2}
                                    />
                                )}
                                {showTemperature && (
                                    <Radar
                                        name="Temperature"
                                        dataKey="temperature"
                                        stroke="#6b7280"
                                        fill="#6b7280"
                                        fillOpacity={0.3}
                                        strokeWidth={2}
                                    />
                                )}
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Desk Time*/}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Desk Time (hrs/day)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={MockData.deskTimeByDay}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `${value / 1000}K`}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value) => [`${value} hours`, 'Total Hours']}
                                />
                                <Bar
                                    dataKey="hours"
                                    fill="#94a3b8"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={60}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Avg Desk Height*/}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Avg. Desk Height</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={MockData.avgDeskHeight}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    domain={[0, 120]}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value) => [`${value} cm`, 'Height']}
                                />
                                {/* Average line */}
                                <Line
                                    type="monotone"
                                    dataKey="avgHeight"
                                    stroke="#94a3b8"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                                <Bar
                                    dataKey="height"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={60}
                                >
                                    {MockData.avgDeskHeight.map((entry, index) => (
                                        <Bar
                                            key={`bar-${index}`}
                                            dataKey="height"
                                            fill={entry.day === 'Wed' ? '#1f2937' : '#d1d5db'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </div>
    );
}