import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get } from "../../context/apiClient";
import { useAuth } from "../../context/AuthContext";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts';


export default function UserStatisticsPage() {
    const { currentCompany } = useAuth();
    const [viewMode, setViewMode] = useState('daily');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        if (currentCompany?.id) {
            fetchUserData();
        }
    }, [currentCompany]);

    useEffect(() => {
        if (reservations.length > 0) {
            processChartData();
        }
    }, [reservations, viewMode]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!currentCompany?.id) {
                throw new Error('No company selected');
            }

            const profile = await get('/Users/me');
            setUserProfile(profile);

            const userReservations = await get(`/${currentCompany.id}/reservation/me`);

            const reservationsWithDesks = await Promise.all(
                (userReservations || []).map(async (reservation) => {
                    try {
                        const desk = await get(`/${currentCompany.id}/Desks/${reservation.deskId}`);
                        return { ...reservation, desk };
                    } catch (error) {
                        console.error(`Error fetching desk ${reservation.deskId}:`, error);
                        return { ...reservation, desk: null };
                    }
                })
            );

            setReservations(reservationsWithDesks);
        } catch (error) {
            console.error('Error fetching reservations:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getSittingStandingData = () => {
        const sittingMinutes = userProfile?.sittingTime || 0;
        const standingMinutes = userProfile?.standingTime || 0;

        return [
            { name: 'Sitting', value: sittingMinutes, color: '#1cafaf' },
            { name: 'Standing', value: standingMinutes, color: '#ff6b6b' }
        ];
    };


    const processChartData = () => {
        const now = new Date();
        const data = [];

        const pastReservations = reservations.filter(r => new Date(r.end) <= now);

        if (viewMode === 'daily') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);

                const dayReservations = pastReservations.filter(r => {
                    const resDate = new Date(r.start);
                    return resDate.toDateString() === date.toDateString();
                });

                const totalHours = dayReservations.reduce((sum, r) => {
                    const duration = (new Date(r.end) - new Date(r.start)) / (1000 * 60 * 60);
                    return sum + duration;
                }, 0);

                data.push({
                    name: date.toLocaleDateString('en-GB', { day: 'numeric', weekday: 'short', month: 'short' }),
                    total: Math.round(totalHours * 100) / 100
                });
            }
        } else if (viewMode === 'weekly') {
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date();
                weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
                weekStart.setHours(0, 0, 0, 0);

                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 7);

                const weekReservations = pastReservations.filter(r => {
                    const resDate = new Date(r.start);
                    return resDate >= weekStart && resDate < weekEnd;
                });

                const totalHours = weekReservations.reduce((sum, r) => {
                    const duration = (new Date(r.end) - new Date(r.start)) / (1000 * 60 * 60);
                    return sum + duration;
                }, 0);

                data.push({
                    name: `${weekStart.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}`,
                    total: Math.round(totalHours * 100) / 100
                });
            }
        } else if (viewMode === 'monthly') {
            for (let i = 5; i >= 0; i--) {
                const monthStart = new Date();
                monthStart.setMonth(monthStart.getMonth() - i);
                monthStart.setDate(1);
                monthStart.setHours(0, 0, 0, 0);

                const monthEnd = new Date(monthStart);
                monthEnd.setMonth(monthEnd.getMonth() + 1);

                const monthReservations = pastReservations.filter(r => {
                    const resDate = new Date(r.start);
                    return resDate >= monthStart && resDate < monthEnd;
                });

                const totalHours = monthReservations.reduce((sum, r) => {
                    const duration = (new Date(r.end) - new Date(r.start)) / (1000 * 60 * 60);
                    return sum + duration;
                }, 0);

                data.push({
                    name: monthStart.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
                    total: Math.round(totalHours * 100) / 100
                });
            }
        }

        setChartData(data);
    };

    const getDeskUsageStats = () => {
        const deskStats = {};
        const now = new Date();

        const pastReservations = reservations.filter(r => new Date(r.end) <= now);

        pastReservations.forEach(r => {
            const deskId = r.desk?.readableId || r.deskId;
            const duration = (new Date(r.end) - new Date(r.start)) / (1000 * 60);

            if (!deskStats[deskId]) {
                deskStats[deskId] = {
                    name: deskId,
                    total: 0
                };
            }

            deskStats[deskId].total += duration;
        });

        return Object.values(deskStats).map(stat => ({
            name: stat.name,
            total: Math.round((stat.total / 60) * 100) / 100
        }));
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins}min`;
    };

    const totalDeskTime = () => {
        return reservations
            .filter(r => new Date(r.end) <= new Date())
            .reduce((sum, r) => {
                const duration = (new Date(r.end) - new Date(r.start)) / (1000 * 60);
                return sum + duration;
            }, 0)
    };

    const ViewButton = ({ mode, label }) => (
        <button
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === mode
                ? 'bg-accent text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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
                        onClick={fetchUserReservations}
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
                        <span className="text-gray-600 ">Total Desk Time:</span>
                        <span className="ml-2 font-semibold">
                            {formatTime(totalDeskTime())}
                        </span>
                    </div>
                    {userProfile && (userProfile.sittingTime >= 0 || userProfile.standingTime >= 0) ? (
                        <PieChart width="100%" height={300}>
                            <Pie
                                data={getSittingStandingData()}
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${formatTime(value)}`}
                            >
                                {getSittingStandingData().map((entry, index) => (
                                    <Cell fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No sitting/standing data available</p>
                    )}
                </section>

                {/* Time tabs */}
                <div className="flex gap-3">
                    <ViewButton mode="daily" label="Daily" />
                    <ViewButton mode="weekly" label="Weekly" />
                    <ViewButton mode="monthly" label="Monthly" />
                </div>

                {/* Duration per Day/Week/Month */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Total Desk Time
                    </h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="1 3" />
                                <XAxis dataKey="name" />
                                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#1cafafff"
                                    fill="#1cafaf8f"
                                    name="hours"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No data available for this period</p>
                    )}
                </section>

                {/* Time Per Desk */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Time Per Desk
                    </h2>
                    {deskUsageData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={deskUsageData}>
                                <CartesianGrid strokeDasharray="1 3" />
                                <XAxis dataKey="name" />
                                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" fill="#1cafaf8f" name="hours" />
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