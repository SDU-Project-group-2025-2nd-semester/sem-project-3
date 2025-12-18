import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import { getMyCompanies, getPublicCompanies, enterCompany } from "../../services/companyService";

export default function CompanyJoinPage() {
    const { refreshCurrentUser} = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isStaff = location.pathname.includes("/staff");
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [myCompanies, setMyCompanies] = useState([]);
    const [publicCompanies, setPublicCompanies] = useState([]);
    const [inviteCodes, setInviteCodes] = useState({});

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const [mine, pub] = await Promise.all([
                    getMyCompanies(),
                    getPublicCompanies(),
                ]);
                if (!cancelled) {        
                    const normalizeMine = (arr) => (arr ?? []).map(c => ({
                        id: String(c.CompanyId ?? c.companyId ?? c.Id ?? c.id),
                        name: c.CompanyName ?? c.companyName ?? c.Name ?? c.name,
                    }));
                    const normalizePub = (arr) => (arr ?? []).map(c => ({
                        id: String(c.Id ?? c.id),
                        name: c.Name ?? c.name,
                    }));
                    setMyCompanies(normalizeMine(mine));
                    setPublicCompanies(normalizePub(pub));
                }
            } catch (e) {
                if (!cancelled) setError(e?.message ?? "Failed to load companies.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, []);

    const myCompanyIds = useMemo(
        () => new Set((myCompanies ?? []).map(c => c.id)), 
        [myCompanies]
    );

    // Public companies that the user is not yet part of
    const availableCompanies = useMemo(
        () => (publicCompanies ?? []).filter(c => !myCompanyIds.has(c.id)),
        [publicCompanies, myCompanyIds]
    );

    async function handleJoin(companyId) {
        const code = inviteCodes[companyId]?.trim();
        if (!code) {
            setError("Please enter the invite code.");
            return;
        }
        setError("");
        try {
            await enterCompany(companyId, code);
            localStorage.setItem("currentCompanyId", String(companyId));
            // From AuthContext -- so Sidebar reads the updated one
            await refreshCurrentUser();
            // Refresh lists so the newly joined company disappears from available
            const mine = await getMyCompanies();
            const normalizedMine = (mine ?? []).map(c => ({
                id: String(c.CompanyId ?? c.Id),
                name: c.CompanyName ?? c.Name,
            }));
            setMyCompanies(normalizedMine);
            alert("Company joined successfully!")
            navigate(isStaff ? "/staff/homepage" : `/user/homepage`);
        } catch (e) {
            // Backend returns 401 if wrong code, 409 if already member
            setError("Failed to join. Check if the invite code is correct."); // e?.message ?? 
        }
    }

    if (loading) {
        return (
        <div className="relative bg-background min-h-screen px-4 pt-20 pb-12">
            <main className="w-full max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-primary">
                    Please provide the invite code for the company you want to join.
                </h1>
                <p className="mt-4 text-gray-600">Loading companies…</p>
            </main>
        </div>
        );
    }

    return (
        <div className="relative bg-background min-h-screen w-full overflow-x-hidden px-4 pt-20 pb-12">
            <main className="w-full max-w-screen-sm sm:max-w-md md:max-w-3xl lg:max-w-4xl mx-auto">
                <h1 className="text-xl font-bold text-primary">
                    Please provide the invite code for the company you want to join.
                </h1>

                {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
                    {error}
                </div>
                )}

                {availableCompanies.length === 0 ? (
                    <p className="mt-6 text-gray-600">
                        No joinable companies found. You are either a member of every available company, or the company does not accept new members by invite code.
                    </p>
                ) : (
                    <ul className="mt-6 space-y-4">
                        {availableCompanies.map((c) => (
                        <li key={c.id} className="p-4 border rounded-md bg-white flex items-start sm:items-center gap-3 overflow-hidden">
                            <span className="flex-1 min-w-0 font-medium text-gray-800 truncate md:whitespace-normal md:break-words">{c.name}</span>
                            <input
                                type="text"
                                placeholder="Invite code"
                                value={inviteCodes[c.id] ?? ""}
                                onChange={(e) => setInviteCodes(prev => ({ ...prev, [c.id]: e.target.value }))}
                                className="border rounded px-3 py-2 text-sm w-32 sm:w-40 md:w-56 flex-shrink-0"
                            />
                            <button
                                onClick={() => handleJoin(c.id)}
                                className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition shrink-0"
                                >
                                Join
                            </button>
                        </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
}