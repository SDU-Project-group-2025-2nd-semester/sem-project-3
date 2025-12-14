import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getReservations, getAllDesks, getRooms } from "../admin.services";
import { useAuth } from "@features/auth/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function HealthStatsManagerPage() {
    const navigate = useNavigate();
    const { currentCompany } = useAuth();
    const [viewMode, setViewMode] = useState('daily');
    const [viewType, setViewType] = useState('company');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [desks, setDesks] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setError('Request timeout - please try again');
            }
        }, 10000);

        return () => clearTimeout(timeout);
    }, [loading]);

    useEffect(() => {
        if (currentCompany?.id) {
            fetchData();
        }
    }, [currentCompany]);

    useEffect(() => {
        if (reservations.length >= 0) {
            processChartData();
        }
    }, [reservations, viewMode, viewType]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!currentCompany?.id) {
                throw new Error('No company selected');
            }

            const [reservationsData, desksData, roomsData] = await Promise.all([
                getReservations(currentCompany.id),
                getAllDesks(currentCompany.id),
                getRooms(currentCompany.id)
            ]);

            setReservations(reservationsData || []);
            setDesks(desksData || []);
            setRooms(roomsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message);
            if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('company')) {
                setTimeout(() => navigate('/'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const processChartData = () => {
        const data = [];

        if (viewType === 'company') {
            if (viewMode === 'daily') {
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);

                    const dayReservations = reservations.filter(r => {
                        const resDate = new Date(r.start);
                        return resDate.toDateString() === date.toDateString();
                    });

                    const totalHours = dayReservations.reduce((sum, r) => {
                        const duration = (new Date(r.end) - new Date(r.start)) / (1000 * 60 * 60);
                        return sum + duration;
                    }, 0);

                    data.push({
                        name: date.toLocaleDateString('en-GB', { day: 'numeric', weekday: 'short', month: 'short' }),
                        total: Math.round(totalHours * 100) / 100,
                        reservations: dayReservations.length
                    });
                }
            } else if (viewMode === 'weekly') {
                for (let i = 3; i >= 0; i--) {
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
                    weekStart.setHours(0, 0, 0, 0);

                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 7);

                    const weekReservations = reservations.filter(r => {
                        const resDate = new Date(r.start);
                        return resDate >= weekStart && resDate < weekEnd;
                    });

                    const totalHours = weekReservations.reduce((sum, r) => {
                        const duration = (new Date(r.end) - new Date(r.start)) / (1000 * 60 * 60);
                        return sum + duration;
                    }, 0);

                    data.push({
                        name: `${weekStart.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}`,
                        total: Math.round(totalHours * 100) / 100,
                        reservations: weekReservations.length
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

                    const monthReservations = reservations.filter(r => {
                        const resDate = new Date(r.start);
                        return resDate >= monthStart && resDate < monthEnd;
                    });

                    const totalHours = monthReservations.reduce((sum, r) => {
                        const duration = (new Date(r.end) - new Date(r.start)) / (1000 * 60 * 60);
                        return sum + duration;
                    }, 0);

                    data.push({
                        name: monthStart.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
                        total: Math.round(totalHours * 100) / 100,
                        reservations: monthReservations.length
                    });
                }
            }
        } else if (viewType === 'room') {
            rooms.forEach(room => {
                const roomDesks = desks.filter(d => d.roomId === room.id);
                const roomDeskIds = new Set(roomDesks.map(d => d.id));
                const roomReservations = reservations.filter(r => roomDeskIds.has(r.deskId));

                const totalHours = roomReservations.reduce((sum, r) => {
                    const duration = (new Date(r.end) - new Date(r.start)) / (1000 * 60 * 60);
                    return sum + duration;
                }, 0);

                data.push({
                    name: room.readableId || `Room ${room.id}`,
                    total: Math.round(totalHours * 100) / 100,
                    reservations: roomReservations.length
                });
            });
        } else if (viewType === 'desk') {
            desks.forEach(desk => {
                const deskReservations = reservations.filter(r => r.deskId === desk.id);

                const totalHours = deskReservations.reduce((sum, r) => {
                    const duration = (new Date(r.end) - new Date(r.start)) / (1000 * 60 * 60);
                    return sum + duration;
                }, 0);

                data.push({
                    name: desk.readableId || `Desk ${desk.id}`,
                    total: Math.round(totalHours * 100) / 100,
                    reservations: deskReservations.length
                });
            });
        }

        setChartData(data);
    };

    const getTotalDeskTime = () => {
        return reservations
            .reduce((sum, r) => {
                const duration = (new Date(r.end) - new Date(r.start)) / (1000 * 60 * 60);
                return sum + duration;
            }, 0);
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
            <div className="relative bg-background min-h-screen px-4 mt-20 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative bg-background min-h-screen px-4 mt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg text-red-600">Error: {error}</div>
                    <button
                        onClick={fetchData}
                        className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative bg-background min-h-screen px-4 mt-20">
            <main className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-32">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-gray-800">Desk Usage Statistics</h1>
                </div>

                {/* Info cards */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Total Desks:</span>
                            <span className="ml-2 font-semibold">{desks.length}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Total Reservations:</span>
                            <span className="ml-2 font-semibold">{reservations.length}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Total Usage:</span>
                            <span className="ml-2 font-semibold">{Math.round(getTotalDeskTime())}h</span>
                        </div>
                    </div>
                </div>

                {/* View type and time tabs */}
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setViewType('company')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewType === 'company'
                                ? 'bg-secondary-100 text-secondary-700 border border-secondary-300'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            Company
                        </button>
                        <button
                            onClick={() => setViewType('room')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewType === 'room'
                                ? 'bg-secondary-100 text-secondary-700 border border-secondary-300'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            Per Room
                        </button>
                        <button
                            onClick={() => setViewType('desk')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewType === 'desk'
                                ? 'bg-secondary-100 text-secondary-700 border border-secondary-300'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            Per Desk
                        </button>
                    </div>


                    {viewType == 'company' && (
                        <div className="flex gap-3">
                            <ViewButton mode="daily" label="Daily" />
                            <ViewButton mode="weekly" label="Weekly" />
                            <ViewButton mode="monthly" label="Monthly" />
                        </div>
                    )}
                </div>

                {/* Desk Usage */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Desk Usage</h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#1cafafff"
                                    fill="#1cafaf8f"
                                    name="Total Hours"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No data available</p>
                    )}
                </section>

                {/* Reservations*/}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Reservations</h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis label={{ value: 'Reservations', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="reservations" fill="#cb2c66bd" name="Reservations" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No data available</p>
                    )}
                </section>
            </main>
        </div>
    );
}