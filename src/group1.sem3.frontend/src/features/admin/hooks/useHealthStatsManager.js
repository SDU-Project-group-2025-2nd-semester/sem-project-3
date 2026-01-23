import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@features/auth/AuthContext";
import { getAllDesks, getRooms, getRoomStats, getDeskStats, getCompanyStats } from "../admin.services";

export function useHealthStatsManager(viewType) {
    const navigate = useNavigate();
    const { currentCompany } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [companyStats, setCompanyStats] = useState(null);
    const [roomStats, setRoomStats] = useState([]);
    const [deskStats, setDeskStats] = useState([]);
    const [chartData, setChartData] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (viewType === 'company') {
                const stats = await getCompanyStats(currentCompany.id);
                setCompanyStats(stats);
            } else if (viewType === 'room') {
                const rooms = await getRooms(currentCompany.id);
                const statsPromises = rooms.map(room => getRoomStats(currentCompany.id, room.id));
                const stats = await Promise.all(statsPromises);
                setRoomStats(stats.filter(s => s !== null));
            } else if (viewType === 'desk') {
                const desks = await getAllDesks(currentCompany.id);
                const statsPromises = desks.map(desk => getDeskStats(currentCompany.id, desk.id));
                const stats = await Promise.all(statsPromises);
                setDeskStats(stats.filter(s => s !== null));
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err?.message || String(err));
            if (String(err?.message).includes("401") || String(err?.message).includes("Unauthorized") || String(err?.message).includes("company")) {
                setTimeout(() => navigate("/"), 2000);
            }
        } finally {
            setLoading(false);
        }
    }, [currentCompany, navigate, viewType]);

    useEffect(() => {
        if (currentCompany?.id) fetchData();
    }, [currentCompany, fetchData]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setError("Request timeout - please try again");
            }
        }, 10000);
        return () => clearTimeout(timeout);
    }, [loading]);

    const processChartData = useCallback(() => {
        const data = [];

        if (viewType === "company" && companyStats) {
            setChartData([]);
        } else if (viewType === "room") {
            roomStats.forEach((stats) => {
                data.push({
                    name: stats.roomReadableId || `Room ${stats.roomId}`,
                    desks: stats.desksCount,
                    occupied: stats.occupiedDesksNow,
                    reservations: stats.activeReservationsNow,
                });
            });
            setChartData(data);
        } else if (viewType === "desk") {
            deskStats.forEach((stats) => {
                data.push({
                    name: stats.deskReadableId || `Desk ${stats.deskId}`,
                    reservations: stats.reservationsTotal,
                    activations: stats.activationsCounter,
                    sitStand: stats.sitStandCounter,
                });
            });
            setChartData(data);
        }
    }, [companyStats, roomStats, deskStats, viewType]);

    useEffect(() => {
        processChartData();
    }, [processChartData]);

    return {
        loading,
        error,
        companyStats,
        roomStats,
        deskStats,
        chartData,
        fetchData,
    };
}
