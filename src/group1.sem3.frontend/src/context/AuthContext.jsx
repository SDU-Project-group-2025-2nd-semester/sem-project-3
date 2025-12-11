import { createContext, useContext, useEffect, useState } from "react";
import { post, get } from "./apiClient";
import { registerAuthHandlers } from "./registerAuthHandlers";
import { useNavigate, useLocation } from "react-router-dom";
import { homepagePathForRole } from "../utils/homepage";

const AuthContext = createContext(null);

function pickUser(serverUser) {
	if (!serverUser) return null;
	return {
		id: serverUser.id,
		email: serverUser.email ?? serverUser.userName,
		userName: serverUser.userName,
		firstName: serverUser.firstName,
		lastName: serverUser.lastName,
		role: serverUser.role,
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

	function initializeCompanies(me) {
		// build companies list from server payload (companyMemberships)
		const mapped = (me.companyMemberships ?? []).map((cm) => ({
			id: cm.company.id,
			name: cm.company.name ?? "Unnamed",
			role: cm.role,
		}));
		setCompanies(mapped);

		// restore selected company from localStorage or pick first
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
	}

	const location = useLocation();

	// automatically move to homepage if already logged in (but only from login page)
	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const me = await get("/Users/me");
				if (!mounted || !me) return;
				const user = pickUser(me);
				setCurrentUser(user);

				initializeCompanies(me);

				// navigate to homepage only from login/signup pages
				if (location.pathname === "/" || location.pathname === "/signuppage") {
					navigate(homepagePathForRole(user?.role));
				}
			} catch {
				// no session
			} finally {
				if (mounted) setIsHydrating(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	// Refresh current user from server (returns picked user or null)
	async function refreshCurrentUser() {
		try {
			setIsHydrating(true);
			const me = await get("/Users/me");
			const user = pickUser(me);
			setCurrentUser(user);
			initializeCompanies(me);
			return user;
		} catch {
			// Not authenticated or error – clear local state
			setCurrentUser(null);
			return null;
		} finally {
			setIsHydrating(false);
		}
	}

	async function login({ email, password }) {
		await post("/auth/login", { email, password });

		// Refresh user state after successful login
		const user = await refreshCurrentUser();

		navigate(homepagePathForRole(user?.role));

		return user;
	}

	async function signup({ firstName, lastName, email, password }) {
		await post("/auth/register", { email, password, firstName, lastName });
		await login({ email, password });
	}

	async function logout() {
		try {
			await post("/auth/logout");
		} catch {
			// ignore network errors
		}
		setCurrentUser(null);
		setCompanies([]);
		setCurrentCompany(null);
		localStorage.removeItem("currentCompanyId");
	}

	// Named handlers for apiClient registration
	async function authRefreshHandler() {
		const u = await refreshCurrentUser();
		return Boolean(u);
	}
	function authLogoutHandler() {
		logout();
	}

	// Register auth handlers with api client so it can attempt refresh on401
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
