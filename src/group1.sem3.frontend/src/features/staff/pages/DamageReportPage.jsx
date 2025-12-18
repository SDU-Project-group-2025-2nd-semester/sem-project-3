import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@features/auth/AuthContext";
import Card from "@shared/ui/Card";
import Input from "@shared/ui/Input";
import Button from "@shared/ui/Button";
import NotificationBanner from "@shared/ui/NotificationBanner";
import { useDamageReport } from "../hooks/useDamageReport";

export default function DamageReportPage() {
    const { currentCompany, isHydrating } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const tableId = location.state?.tableId ?? null;
    const table = location.state?.table ?? "Unknown";
    const reservationId = location.state?.reservationId ?? null;
    const isStaff = location.pathname.includes("/staff");

    const { issue, setIssue, description, setDescription, submitting, err, handleSubmit } =
        useDamageReport(currentCompany?.id, tableId, reservationId, isStaff);

    const onSubmit = async (e) => {
        const result = await handleSubmit(e);
        if (result?.success) {
            alert("Damage reported successfully!");
            navigate(
                isStaff ? "/staff/homepage" : `/user/reservation/${reservationId}`,
                {
                    state: isStaff ? { damagedTableId: tableId } : { damagedReservationId: reservationId },
                    replace: true
                }
            );
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-20">
            <Card>
                <h1 className="text-2xl font-bold mb-6 text-primary">Report malfunction</h1>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Table:</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{tableId}</p>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
                        <select value={issue} onChange={e => setIssue(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            required disabled={submitting || isHydrating}>
                            <option value="" disabled hidden>Select an issue</option>
                            <option value="Table not moving">Table not moving</option>
                            <option value="Pico brick damaged">Pico brick damaged</option>
                            <option value="Table damaged">Table damaged</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="Description" maxLength={512} rows={4}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            disabled={submitting || isHydrating} />
                        <p className="text-sm text-gray-500 mt-1">{description.length}/512 characters</p>
                    </div>

                    {err && <NotificationBanner type="error">{err}</NotificationBanner>}

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={submitting}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={submitting || isHydrating}>{submitting ? "Sending..." : "Send"}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
