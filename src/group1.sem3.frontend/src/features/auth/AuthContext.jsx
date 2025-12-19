import { createContext, useContext, useEffect, useState } from "react";
import { post, get } from "../../shared/api/apiClient";
import { registerAuthHandlers } from "./registerAuthHandlers";
import { useNavigate, useLocation } from "react-router-dom";
import { homepagePathForRole } from "../../shared/utils/homepage";

const AuthContext = createContext(null);

function pickUser(serverUser) {
    if (!serverUser) return null;

    const derivedRole =
        serverUser.role ??
        (Array.isArray(serverUser.companyMemberships) &&
            serverUser.companyMemberships[0]?.role) ??
        null;

    return {
        id: serverUser.id,
        email: serverUser.email ?? serverUser.userName,
        userName: serverUser.userName,
        firstName: serverUser.firstName,
        lastName: serverUser.lastName,
        role: derivedRole,
        standingHeight: serverUser.standingHeight,
        sittingHeight: serverUser.sittingHeight,
        healthRemindersFrequency: serverUser.healthRemindersFrequency,
        sittingTime: serverUser.sittingTime,
        standingTime: serverUser.standingTime,
    };
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [currentCompany, setCurrentCompany] = useState(null);
    const [isHydrating, setIsHydrating] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    function initializeCompanies(me) {
        const mapped = (me.companyMemberships ?? []).map((cm) => ({
            id: cm.company.id,
            name: cm.company.name ?? "Unnamed",
            role: cm.role,
        }));
        setCompanies(mapped);

        const savedId = localStorage.getItem("currentCompanyId");
        const initial =
            (savedId && mapped.find((c) => String(c.id) === String(savedId))) ||
            mapped[0] ||
            null;

        if (initial) {
            setCurrentCompany(initial);
            localStorage.setItem("currentCompanyId", String(initial.id));
        } else {
            setCurrentCompany(null);
            localStorage.removeItem("currentCompanyId");
        }

        return initial;
    }

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const me = await get("/Users/me");
                if (!mounted || !me) return;
                const user = pickUser(me);
                setCurrentUser(user);

                const initialCompany = initializeCompanies(me);

                if (location.pathname === "/" || location.pathname === "/signuppage") {
                    navigate(homepagePathForRole(initialCompany?.role ?? user?.role));
                }
            } catch (e) {
                // ignore errors during initial hydration
                console.debug && console.debug("AuthProvider init error", e);
            } finally {
                if (mounted) setIsHydrating(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    async function refreshCurrentUser() {
        try {
            setIsHydrating(true);
            const me = await get("/Users/me");
            const user = pickUser(me);
            const initial = initializeCompanies(me);
            setCurrentUser(user);
            return { user, initial };
        } catch (e) {
            console.debug && console.debug("refreshCurrentUser error", e);
            setCurrentUser(null);
            return { user: null, initial: null };
        } finally {
            setIsHydrating(false);
        }
    }

    async function login({ email, password }) {
        await post("/auth/login", { email, password });
        const { user, initial } = await refreshCurrentUser();
        navigate(homepagePathForRole(initial?.role ?? user?.role));
        return user;
    }

    async function signup({ firstName, lastName, email, password }) {
        await post("/auth/register", { email, password, firstName, lastName });
        await login({ email, password });
    }

    async function logout() {
        try {
            await post("/auth/logout");
        } catch (e) {
            console.debug && console.debug("logout error", e);
        }
        setCurrentUser(null);
        setCompanies([]);
        setCurrentCompany(null);
        localStorage.removeItem("currentCompanyId");
    }

    async function authRefreshHandler() {
        const res = await refreshCurrentUser();
        return Boolean(res?.user);
    }

    function authLogoutHandler() {
        logout();
    }

    useEffect(() => {
        registerAuthHandlers({
            refresh: authRefreshHandler,
            logout: authLogoutHandler,
        });
    }, []);

    const isAuthenticated = !!currentUser;

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                companies,
                currentCompany,
                setCurrentCompany,
                login,
                logout,
                signup,
                isHydrating,
                refreshCurrentUser,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthProvider;

