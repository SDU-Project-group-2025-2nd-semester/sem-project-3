import { useState, useEffect } from "react";
import { useAuth } from "@features/auth/AuthContext";
import { getMyProfile, updateMyProfile } from "../user.services";

const OPTION_TO_NUMBER = {
    Less: 1,
    Normal: 2,
    Many: 3,
};

const NUMBER_TO_OPTION = {
    1: "Less",
    2: "Normal",
    3: "Many",
};

export function useUserProfile() {
    const { currentUser, refreshCurrentUser } = useAuth();

    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        userHeight: "",
        sittingHeight: "",
        standingHeight: "",
        sittingTime: "",
        standingTime: "",
        pillOption: "Normal",
        healthReminder: false,
        showUserHeight: false,
    });

    useEffect(() => {
        if (currentUser) {
            applyUser(currentUser);
            return;
        }

        let mounted = true;

        (async () => {
            try {
                const me = await refreshCurrentUser();
                if (!mounted || !me) return;
                applyUser(me);
            } catch {
                // ignore
            }
        })();

        return () => {
            mounted = false;
        };
    }, [currentUser, refreshCurrentUser]);

    const applyUser = (u) => {
        // If backend value is null/undefined, enable reminders by default
        const hrFreq = u.healthRemindersFrequency;
        const healthReminderEnabled =
            hrFreq == null ? true : hrFreq > 0;

        // Backend stores heights scaled by 10
        const displayedSitting =
            u.sittingHeight != null ? String(u.sittingHeight / 10) : "";
        const displayedStanding =
            u.standingHeight != null ? String(u.standingHeight / 10) : "";

        // Derive user height only if sitting/standing heights are missing
        let derivedUserHeight = "";
        if (!displayedSitting && !displayedStanding && u.standingHeight != null) {
            const standingCm = u.standingHeight / 10;
            const approx = standingCm / 0.62;
            derivedUserHeight = String(Number(approx.toFixed(1)));
        }

        setProfile({
            firstName: u.firstName ?? "",
            lastName: u.lastName ?? "",
            email: u.email ?? u.userName ?? "",
            password: "",
            userHeight: derivedUserHeight,
            sittingHeight: displayedSitting,
            standingHeight: displayedStanding,
            sittingTime: u.sittingTime ?? "",
            standingTime: u.standingTime ?? "",
            pillOption: NUMBER_TO_OPTION[hrFreq ?? 1],
            healthReminder: healthReminderEnabled,
            showUserHeight: !(u.sittingHeight || u.standingHeight),
        });
    };

    const updateProfile = async () => {
        try {
            const me = await getMyProfile();

            const payload = {
                ...me,
                firstName: profile.firstName || null,
                lastName: profile.lastName || null,
                email: profile.email || null,
                userName: profile.email || me?.userName,
                normalizedEmail: profile.email?.toUpperCase(),
                normalizedUserName: profile.email?.toUpperCase(),
                sittingHeight: profile.sittingHeight
                    ? Number(profile.sittingHeight) * 10
                    : null,
                standingHeight: profile.standingHeight
                    ? Number(profile.standingHeight) * 10
                    : null,
                sittingTime: profile.sittingTime
                    ? Number(profile.sittingTime)
                    : null,
                standingTime: profile.standingTime
                    ? Number(profile.standingTime)
                    : null,
                healthRemindersFrequency: profile.healthReminder
                    ? OPTION_TO_NUMBER[profile.pillOption]
                    : 0,
            };

            await updateMyProfile(payload);
            await refreshCurrentUser();
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    return {
        profile,
        setProfile,
        updateProfile,
        applyUser, // expose applyUser for tests and advanced usage
    };
}
