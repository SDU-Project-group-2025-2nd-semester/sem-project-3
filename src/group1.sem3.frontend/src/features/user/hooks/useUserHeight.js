import { useState, useEffect } from "react";

export function useUserHeight(initialHeight = "", initialSitting = "", initialStanding = "") {
    const [userHeight, setUserHeight] = useState(initialHeight);
    const [sittingHeight, setSittingHeight] = useState(initialSitting);
    const [standingHeight, setStandingHeight] = useState(initialStanding);
    const [sittingChanged, setSittingChanged] = useState(false);
    const [standingChanged, setStandingChanged] = useState(false);

    // Sync incoming initial values (useful when profile loads asynchronously)
    useEffect(() => {
        setUserHeight(initialHeight ?? "");
        setSittingHeight(initialSitting ?? "");
        setStandingHeight(initialStanding ?? "");
        setSittingChanged(false);
        setStandingChanged(false);
    }, [initialHeight, initialSitting, initialStanding]);

    useEffect(() => {
        if (!userHeight) return;
        const h = parseFloat(userHeight);
        if (!isNaN(h)) {
            setSittingHeight((h / 2 - 18.5).toFixed(1));
            setStandingHeight((h * 0.62).toFixed(1));
        }
    }, [userHeight]);

    const resetRecommended = () => {
        const h = parseFloat(userHeight);
        if (!isNaN(h)) {
            setSittingHeight((h / 2 - 18.5).toFixed(1));
            setStandingHeight((h * 0.62).toFixed(1));
            setSittingChanged(false);
            setStandingChanged(false);
        }
    };

    return { userHeight, setUserHeight, sittingHeight, setSittingHeight, standingHeight, setStandingHeight, sittingChanged, standingChanged, setSittingChanged, setStandingChanged, resetRecommended };
}
