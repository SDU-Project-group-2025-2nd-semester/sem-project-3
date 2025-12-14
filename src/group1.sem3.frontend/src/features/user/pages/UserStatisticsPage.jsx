import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from "recharts";
import { useUserStatistics } from "../hooks/useUserStatistics";

export default function UserStatisticsPage() {
    const {
        userProfile,
        chartData,
        loading,
        error,
        viewMode,
        setViewMode,
        getSittingStandingData,
        getDeskUsageStats,
        totalDeskTime,
        fetchUserData
    } = useUserStatistics();

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
    };

    const ViewButton = ({ mode, label }) => (
        <button
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === mode
                    ? "bg-accent text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
        >
            {label}
        </button>
    );

    if (loading) {
        return (
            <div className="relative bg-background min-h-screen px-4 pt-24 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative bg-background min-h-screen px-4 pt-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg text-red-600">Error: {error}</div>
                    <button
                        onClick={fetchUserData}
                        className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const deskUsageData = getDeskUsageStats();

    return (
        <div className="relative bg-background min-h-screen px-4 pt-24">
            <main className="max-w-6xl mx-auto flex flex-col gap-8 pb-32">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-gray-800">Desk Statistics</h1>
                </div>

                {/* Pie chart - Sitting/Standing time */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Sitting vs Standing Time
                    </h2>
                    <div className="flex gap-4 text-sm mb-4">
                        <span className="text-gray-600">Total Desk Time:</span>
                        <span className="ml-2 font-semibold">{formatTime(totalDeskTime())}</span>
                    </div>
                    {userProfile && (userProfile.sittingTime >= 0 || userProfile.standingTime >= 0) ? (
                        <PieChart width="100%" height={300}>
                            <Pie
                                data={getSittingStandingData()}
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${formatTime(value)}`}
                            >
                                {getSittingStandingData().map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No sitting/standing data available</p>
                    )}
                </section>

                {/* Time view buttons */}
                <div className="flex gap-3">
                    <ViewButton mode="daily" label="Daily" />
                    <ViewButton mode="weekly" label="Weekly" />
                    <ViewButton mode="monthly" label="Monthly" />
                </div>

                {/* Duration per Day/Week/Month */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Desk Time</h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="13" />
                                <XAxis dataKey="name" />
                                <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                                <Tooltip formatter={(value) => formatTime(value * 60)} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#1cafafff"
                                    fill="#1cafaf8f"
                                    name="Duration"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No data available for this period</p>
                    )}
                </section>

                {/* Time Per Desk */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Time Per Desk</h2>
                    {deskUsageData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={deskUsageData}>
                                <CartesianGrid strokeDasharray="13" />
                                <XAxis dataKey="name" />
                                <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                                <Tooltip formatter={(value) => formatTime(value)} />
                                <Legend />
                                <Bar dataKey="total" fill="#1cafaf8f" name="Duration" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No data available for this period</p>
                    )}
                </section>
            </main>
        </div>
    );
}
