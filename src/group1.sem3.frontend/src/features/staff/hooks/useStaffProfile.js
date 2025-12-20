import { useState, useEffect, useCallback } from "react";
import { getMyProfile, updateMyProfile } from "../staff.services";

export function useStaffProfile(currentUser, refreshCurrentUser) {
    const [firstName, setFirstName] = useState(currentUser?.firstName ?? "");
    const [lastName, setLastName] = useState(currentUser?.lastName ?? "");
    const [email, setEmail] = useState(currentUser?.email ?? currentUser?.userName ?? "");
    const [password, setPassword] = useState("");

    // Sync user data from context or API
    useEffect(() => {
        const applyUser = (u) => {
            setFirstName(u.firstName ?? "");
            setLastName(u.lastName ?? "");
            setEmail(u.email ?? u.userName ?? "");
        };

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
            } catch { }
        })();

        return () => { mounted = false; };
    }, [currentUser, refreshCurrentUser]);

    const saveProfile = useCallback(async () => {
        try {
            let me = null;
            try { me = await getMyProfile(); } catch { }

            const partial = {
                firstName: firstName || null,
                lastName: lastName || null,
                email: email || null,
                userName: email || (me?.userName ?? null),
                normalizedEmail: email?.toUpperCase() ?? me?.normalizedEmail,
                normalizedUserName: email?.toUpperCase() ?? me?.normalizedUserName
            };

            const payload = me ? { ...me, ...partial } : { ...partial, role: me?.role ?? 0 };
            await updateMyProfile(payload);
            if (typeof refreshCurrentUser === "function") await refreshCurrentUser();
            alert("Profile saved.");
        } catch (err) {
            console.error(err);
            alert("Error while saving changes.");
        }
    }, [firstName, lastName, email, refreshCurrentUser]);

    return { firstName, setFirstName, lastName, setLastName, email, setEmail, password, setPassword, saveProfile };
}
