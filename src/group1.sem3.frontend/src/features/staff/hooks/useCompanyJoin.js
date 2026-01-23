import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@features/auth/AuthContext"; 
import { getMyCompanies, getPublicCompanies, enterCompany } from "@features/admin/admin.services.js";

export function useCompanyJoin() {
    const { refreshCurrentUser } = useAuth();
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

            alert("Company joined successfully!");

            navigate(isStaff ? "/staff/homepage" : `/user/homepage`);
        } catch (e) {
            setError("Failed to join. Check if the invite code is correct.");
        }
    }

    return {
        loading,
        error,
        myCompanies,
        availableCompanies,
        inviteCodes,
        setInviteCodes,
        handleJoin,
        isStaff
    };
}