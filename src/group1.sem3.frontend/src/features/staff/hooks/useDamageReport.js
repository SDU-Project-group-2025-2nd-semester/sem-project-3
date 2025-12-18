import { useState, useEffect, useCallback } from "react";
import { createDamageReport } from "../staff.services";

export function useDamageReport(companyId, tableId, reservationId, isStaff) {
    const [issue, setIssue] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState(null);

    useEffect(() => {
        if (!companyId || !tableId) {
            setErr("Missing company or desk context.");
        }
    }, [companyId, tableId]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!companyId || !tableId) {
            setErr("Cannot submit report: missing company or desk information.");
            return;
        }
        if (!issue.trim()) {
            alert("Please select an issue.");
            return;
        }

        setErr(null);
        setSubmitting(true);
        try {
            const payload = { issue: issue.trim(), description: description.trim(), deskId: tableId };
            await createDamageReport(companyId, payload);
            return { success: true }; // caller handles navigation
        } catch (e) {
            const message = e?.body?.message || e?.message || "Failed to submit damage report. Please try again.";
            setErr(message);
            return { success: false };
        } finally {
            setSubmitting(false);
        }
    }, [companyId, tableId, issue, description]);

    return { issue, setIssue, description, setDescription, submitting, err, handleSubmit };
}
