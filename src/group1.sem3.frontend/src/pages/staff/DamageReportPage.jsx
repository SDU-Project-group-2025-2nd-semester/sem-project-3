import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { post } from "../../context/apiClient";

const currentCompany = '33333333-3333-3333-3333-333333333333'; // Company ID 

export default function DamageReportPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const tableId = location.state?.tableId;

    const [issue, setIssue] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!issue) {
            alert("Please select an issue.");
            return;
        }

        const payload = {
            deskId: tableId,
            description: issue + description,
        };

        post(`/${currentCompany}/DamageReport`, payload );

        alert("Damage reported successfully!");
      
        const isStaff = location.pathname.includes("/staff");

        // Navigate back and pass the damaged table ID  
        navigate(isStaff ? "/staff/homepage" : "/user/desk", {
            state: isStaff ? { damagedTableId: tableId } : { damagedDeskId: tableId },
        });

    };

    return (
        <div className="max-w-xl mx-auto mt-20 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-6 text-primary">Report malfunction</h1>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Table ID:</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{tableId ?? "Unknown"}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
                    <select
                        value={issue}
                        onChange={(e) => setIssue(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
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
                    />
                    <p className="text-sm text-gray-500 mt-1">{description.length}/512 characters</p>
                </div>

                <button
                    type="submit"
                    className="bg-accent text-white px-6 py-2 rounded-md hover:bg-secondary transition"
                >
                    Send
                </button>
            </form>
        </div>
    );
}