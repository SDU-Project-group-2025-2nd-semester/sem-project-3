import { useState } from "react";
import { useHealthStatsManager } from "../hooks/useHealthStatsManager";
import Card from "@shared/ui/Card";
import Button from "@shared/ui/Button";
import NotificationBanner from "@shared/ui/NotificationBanner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#1cafafff', '#cb2c66bd', '#ffa500', '#32cd32', '#ff6347'];

export default function HealthStatsManagerPage() {
    const [viewType, setViewType] = useState('company');
    const { loading, error, companyStats, roomStats, deskStats, chartData, fetchData } = useHealthStatsManager(viewType);



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

                {/* Company Stats Summary */}
                {viewType === 'company' && companyStats && (
                    <Card>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-accent">{companyStats.roomsCount}</div>
                                <div className="text-sm text-gray-600 mt-1">Total Rooms</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-accent">{companyStats.desksCount}</div>
                                <div className="text-sm text-gray-600 mt-1">Total Desks</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-secondary">{companyStats.occupiedDesksNow}</div>
                                <div className="text-sm text-gray-600 mt-1">Occupied Now</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-secondary">{companyStats.activeReservationsNow}</div>
                                <div className="text-sm text-gray-600 mt-1">Active Reservations</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-700">{companyStats.reservationsToday}</div>
                                <div className="text-sm text-gray-600 mt-1">Reservations Today</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">{companyStats.openDamageReports}</div>
                                <div className="text-sm text-gray-600 mt-1">Open Damage Reports</div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Room Stats Summary */}
                {viewType === 'room' && roomStats.length > 0 && (
                    <Card>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="text-2xl font-bold text-accent">{roomStats.length}</div>
                                <div className="text-sm text-gray-600 mt-1">Total Rooms</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-secondary">{roomStats.reduce((sum, r) => sum + r.desksCount, 0)}</div>
                                <div className="text-sm text-gray-600 mt-1">Total Desks</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-secondary">{roomStats.reduce((sum, r) => sum + r.occupiedDesksNow, 0)}</div>
                                <div className="text-sm text-gray-600 mt-1">Currently Occupied</div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Desk Stats Summary */}
                {viewType === 'desk' && deskStats.length > 0 && (
                    <Card>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="text-2xl font-bold text-accent">{deskStats.length}</div>
                                <div className="text-sm text-gray-600 mt-1">Total Desks</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-secondary">{deskStats.reduce((sum, d) => sum + d.reservationsTotal, 0)}</div>
                                <div className="text-sm text-gray-600 mt-1">Total Reservations</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-secondary">{deskStats.reduce((sum, d) => sum + d.activationsCounter, 0)}</div>
                                <div className="text-sm text-gray-600 mt-1">Total Activations</div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* View type tabs */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setViewType('company')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewType === 'company'
                            ? 'bg-accent text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        Company Overview
                    </button>
                    <button
                        onClick={() => setViewType('room')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewType === 'room'
                            ? 'bg-accent text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        By Room
                    </button>
                    <button
                        onClick={() => setViewType('desk')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewType === 'desk'
                            ? 'bg-accent text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        By Desk
                    </button>
                </div>

                {/* Company View - Occupancy Chart */}
                {viewType === 'company' && companyStats && (
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Current Desk Occupancy</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Occupied', value: companyStats.occupiedDesksNow },
                                        { name: 'Available', value: companyStats.desksCount - companyStats.occupiedDesksNow }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    <Cell fill="#cb2c66bd" />
                                    <Cell fill="#1cafafff" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </section>
                )}

                {/* Room View - Charts */}
                {viewType === 'room' && chartData.length > 0 && (
                    <>
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Desks per Room</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="desks" fill="#1cafafff" name="Total Desks" />
                                    <Bar dataKey="occupied" fill="#cb2c66bd" name="Occupied" />
                                </BarChart>
                            </ResponsiveContainer>
                        </section>
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Active Reservations per Room</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="reservations" fill="#ffa500" name="Active Reservations" />
                                </BarChart>
                            </ResponsiveContainer>
                        </section>
                    </>
                )}

                {/* Desk View - Charts */}
                {viewType === 'desk' && chartData.length > 0 && (
                    <>
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Reservations per Desk</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="reservations" fill="#1cafafff" name="Reservations" />
                                </BarChart>
                            </ResponsiveContainer>
                        </section>
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Desk Activity</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="activations" fill="#32cd32" name="Activations" />
                                    <Bar dataKey="sitStand" fill="#ff6347" name="Sit/Stand Changes" />
                                </BarChart>
                            </ResponsiveContainer>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}