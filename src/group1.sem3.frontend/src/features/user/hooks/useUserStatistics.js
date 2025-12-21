import { useState, useEffect } from "react";
import { getMyProfile, getUserStats } from "../user.services";
import { useAuth } from "@features/auth/AuthContext";

export function useUserStatistics() {
    const { currentCompany } = useAuth();
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (currentCompany?.id) {
            fetchUserData();
        }
    }, [currentCompany]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!currentCompany?.id) throw new Error("No company selected");

            const profile = await getMyProfile();

            if (!profile?.id) throw new Error("Unable to load user profile");

            const stats = await getUserStats(currentCompany.id, profile.id);
            setUserStats(stats);
        } catch (err) {
            console.error("Error fetching user statistics:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getSittingStandingData = () => {
        const sittingMinutes = userStats?.sittingTime || 0;
        const standingMinutes = userStats?.standingTime || 0;
        return [
            { name: "Sitting", value: sittingMinutes, color: "#1cafaf" },
            { name: "Standing", value: standingMinutes, color: "#ff6b6b" },
        ];
    };

    const totalDeskTime = () => {
        const sittingMinutes = userStats?.sittingTime || 0;
        const standingMinutes = userStats?.standingTime || 0;
        return sittingMinutes + standingMinutes;
    };

    const getHeights = () => ({
        sitting: (userStats?.sittingHeight || 0) / 10,
        standing: (userStats?.standingHeight || 0) / 10,
    });

    return {
        userStats,
        loading,
        error,
        getSittingStandingData,
        totalDeskTime,
        fetchUserData,
        getHeights
    };
}
