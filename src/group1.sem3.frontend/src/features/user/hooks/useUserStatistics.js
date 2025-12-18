import { useState, useEffect } from "react";
import { getMyProfile, getReservations, getDeskById } from "../user.services";
import { useAuth } from "@features/auth/AuthContext";

export function useUserStatistics() {
    const { currentCompany } = useAuth();
    const [userProfile, setUserProfile] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState("daily");

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

            if (!currentCompany?.id) throw new Error("No company selected");

            const profile = await getMyProfile();
            setUserProfile(profile);

            const userReservations = await getReservations(currentCompany.id, { userId: profile?.id });

            const reservationsWithDesks = await Promise.all(
                (userReservations || []).map(async (reservation) => {
                    try {
                        const desk = await getDeskById(currentCompany.id, reservation.deskId);
                        return { ...reservation, desk };
                    } catch (error) {
                        console.error(`Error fetching desk ${reservation.deskId}:`, error);
                        return { ...reservation, desk: null };
                    }
                })
            );

            setReservations(reservationsWithDesks);
        } catch (err) {
            console.error("Error fetching reservations:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getSittingStandingData = () => {
        const sittingMinutes = userProfile?.sittingTime || 0;
        const standingMinutes = userProfile?.standingTime || 0;
        return [
            { name: "Sitting", value: sittingMinutes, color: "#1cafaf" },
            { name: "Standing", value: standingMinutes, color: "#ff6b6b" },
        ];
    };

    const processChartData = () => {
        const now = new Date();
        const data = [];
        const pastReservations = reservations.filter(r => new Date(r.end) <= now);

        if (viewMode === "daily") {
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);

                const dayReservations = pastReservations.filter(r => new Date(r.start).toDateString() === date.toDateString());

                const totalHours = dayReservations.reduce((sum, r) => {
                    return sum + (new Date(r.end) - new Date(r.start)) / (1000 * 60 * 60);
                }, 0);

                data.push({
                    name: date.toLocaleDateString("en-GB", { day: "numeric", weekday: "short", month: "short" }),
                    total: totalHours,
                });
            }
        } else if (viewMode === "weekly") {
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date();
                weekStart.setDate(weekStart.getDate() - i * 7 - weekStart.getDay());
                weekStart.setHours(0, 0, 0, 0);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 7);

                const weekReservations = pastReservations.filter(r => {
                    const resDate = new Date(r.start);
                    return resDate >= weekStart && resDate < weekEnd;
                });

                const totalHours = weekReservations.reduce((sum, r) => {
                    return sum + (new Date(r.end) - new Date(r.start)) / (1000 * 60 * 60);
                }, 0);

                data.push({
                    name: weekStart.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
                    total: totalHours,
                });
            }
        } else if (viewMode === "monthly") {
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
                    return sum + (new Date(r.end) - new Date(r.start)) / (1000 * 60 * 60);
                }, 0);

                data.push({
                    name: monthStart.toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
                    total: totalHours,
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
                deskStats[deskId] = { name: deskId, total: 0 };
            }

            deskStats[deskId].total += duration;
        });

        return Object.values(deskStats).map(stat => ({ name: stat.name, total: stat.total }));
    };

    const totalDeskTime = () => {
        return reservations
            .filter(r => new Date(r.end) <= new Date())
            .reduce((sum, r) => sum + (new Date(r.end) - new Date(r.start)) / (1000 * 60), 0);
    };

    return {
        userProfile,
        chartData,
        loading,
        error,
        viewMode,
        setViewMode,
        getSittingStandingData,
        getDeskUsageStats,
        totalDeskTime,
        fetchUserData,
    };
}
