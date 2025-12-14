import { useState } from "react";
import { useHealthStatsManager } from "../hooks/useHealthStatsManager";
import Card from "@shared/ui/Card";
import Button from "@shared/ui/Button";
import NotificationBanner from "@shared/ui/NotificationBanner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function HealthStatsManagerPage() {
    const [viewMode, setViewMode] = useState('daily');
    const [viewType, setViewType] = useState('company');
    const { loading, error, reservations, desks, rooms, chartData, fetchData, getTotalDeskTime } = useHealthStatsManager(viewMode, viewType);

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
                <div className="w-full max-w-md">
                    <NotificationBanner type="error">{String(error)}</NotificationBanner>
                    <div className="mt-4 text-center">
                        <Button onClick={fetchData} variant="primary">Retry</Button>
                    </div>
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
                <Card>
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
                </Card>

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
                                <CartesianGrid strokeDasharray="33" />
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
                                <CartesianGrid strokeDasharray="33" />
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