import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createDamageReport } from "../staff.services";
import { useAuth } from "@features/auth/AuthContext";

export default function DamageReportPage() {
    const { currentCompany, isHydrating } = useAuth();
    const COMPANY_ID = currentCompany?.id;
    
    const location = useLocation();
    const navigate = useNavigate();
    const tableId = location.state?.tableId ?? null;
    const table = location.state?.table ?? "Unknown";
    const reservationId = location.state?.reservationId ?? null;

    const [issue, setIssue] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState(null);
    
    useEffect(() => {
        if (!isHydrating && (!COMPANY_ID || !tableId)) {
            setErr("Missing company or desk context.");
        }
    }, [COMPANY_ID, tableId, isHydrating]);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!COMPANY_ID || !tableId) {
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
            const payload = {
                issue: issue.trim(),
                description: description.trim(),
                deskId: tableId,
            };
            
            await createDamageReport(COMPANY_ID, payload);

            alert("Damage reported successfully!");

            const isStaff = location.pathname.includes("/staff");

            // Navigate back 
            // NOTE: might need to change the state for staff 
            navigate(isStaff ? "/staff/homepage" : `/user/reservation/${reservationId}`, {
                state: isStaff ? { damagedTableId: tableId } : { damagedReservationId: reservationId },
                replace: true,
            });
        } catch (e) {
            const message = e?.body?.message || e?.message || "Failed to submit damage report. Please try again.";
            setErr(message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto mt-20 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-6 text-primary">Report malfunction</h1>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Table:</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{table}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
                    <select
                        value={issue}
                        onChange={(e) => setIssue(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                        disabled={submitting || isHydrating}
                    >
                        <option value="" disabled hidden>Select an issue</option>
                        <option value="Table not moving">Table not moving</option>
                        <option value="Pico brick damaged">Pico brick damaged</option>
                        <option value="Table damaged">Table damaged</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        maxLength={512}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        disabled={submitting || isHydrating}
                    />
                    <p className="text-sm text-gray-500 mt-1">{description.length}/512 characters</p>
                </div>

                {err && <p className="text-red-600 text-sm mb-3">{err}</p>}

                <button
                    type="submit"
                    className="bg-accent text-white px-6 py-2 rounded-md hover:bg-secondary transition"
                    disabled={submitting || isHydrating}
                >
                    {submitting ? "Sending..." : "Send"}
                </button>
            </form>
        </div>
    );
}