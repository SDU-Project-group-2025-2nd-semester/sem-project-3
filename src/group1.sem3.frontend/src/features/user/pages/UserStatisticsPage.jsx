import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip
} from "recharts";
import { useUserStatistics } from "../hooks/useUserStatistics";
import Card from "@shared/ui/Card";

export default function UserStatisticsPage() {
    const {
        userStats,
        loading,
        error,
        getSittingStandingData,
        totalDeskTime,
        fetchUserData,
        getHeights
    } = useUserStatistics();

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
    };

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

    return (
        <div className="relative bg-background min-h-screen px-4 pt-24">
            <main className="max-w-6xl mx-auto flex flex-col gap-8 pb-32">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-gray-800">My Desk Statistics</h1>
                </div>

                {/* User Profile Overview */}
                {userStats && (
                    <Card>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-accent">{userStats.reservationsTotal}</div>
                                <div className="text-sm text-gray-600 mt-1">Total Reservations</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-secondary">{userStats.activeReservationsNow}</div>
                                <div className="text-sm text-gray-600 mt-1">Active Now</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-accent">{userStats.uniqueDesksReserved}</div>
                                <div className="text-sm text-gray-600 mt-1">Unique Desks Used</div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Sitting vs Standing Time */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Sitting vs Standing Time
                    </h2>
                    <div className="flex gap-4 text-sm mb-4">
                        <span className="text-gray-600">Total Desk Time:</span>
                        <span className="ml-2 font-semibold">{formatTime(totalDeskTime())}</span>
                    </div>
                    {userStats && (userStats.sittingTime > 0 || userStats.standingTime > 0) ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={getSittingStandingData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value, percent }) => `${name}: ${formatTime(value)} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100}
                                    dataKey="value"
                                >
                                    {getSittingStandingData().map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatTime(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No sitting/standing data available</p>
                    )}
                </section>

                {/* Height Preferences */}
                {userStats && (getHeights().sitting || getHeights().standing) && (
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Height Preferences</h2>
                        <div className="grid grid-cols-2 gap-6">
                            {getHeights().sitting && (
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-accent">{getHeights().sitting} cm</div>
                                    <div className="text-sm text-gray-600 mt-1">Sitting Height</div>
                                </div>
                            )}
                            {getHeights().standing && (
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-accent">{getHeights().standing} cm</div>
                                    <div className="text-sm text-gray-600 mt-1">Standing Height</div>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            </main>
        </div>
    );
}
