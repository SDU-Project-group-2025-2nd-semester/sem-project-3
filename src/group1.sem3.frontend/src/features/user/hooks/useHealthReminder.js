import { useState, useEffect } from "react";

export function useHealthReminder(initialOption = "Normal", initialEnabled = false) {
    // If initialEnabled is null/undefined, treat as enabled (true)
    const resolvedEnabled = initialEnabled == null ? true : initialEnabled;
    const [pillOption, setPillOption] = useState(initialOption ?? "Normal");
    const [healthReminder, setHealthReminder] = useState(resolvedEnabled);

    // Keep internal state in sync if the initial props change (e.g. after async profile load)
    useEffect(() => {
        const enabled = initialEnabled == null ? true : initialEnabled;
        setPillOption(initialOption ?? "Normal");
        setHealthReminder(enabled);
    }, [initialOption, initialEnabled]);

    return { pillOption, setPillOption, healthReminder, setHealthReminder };
}
