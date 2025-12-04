import { createContext, useContext, useEffect, useState } from "react";
import { post, get } from "./apiClient";
import { useNavigate } from "react-router-dom";
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
    role: serverUser.companyMemberships?.[0]?.role ?? 0,
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

  const navigate = useNavigate();

  function initializeCompanies(me) {
    // build companies list from server payload (companyMemberships)
    const mapped = (me.companyMemberships ?? []).map(cm => ({
      id: cm.company.id,
      name: cm.company.name ?? "Unnamed",
      role: cm.role
    }));
    setCompanies(mapped);

    // restore selected company from localStorage or pick first
    const savedId = localStorage.getItem("currentCompanyId");
    const initial = mapped.find(c => c.id === savedId) ?? mapped[0] ?? null;
    if (initial) {
      setCurrentCompany(initial);
      localStorage.setItem("currentCompanyId", initial.id);
    } else {
      setCurrentCompany(null);
      localStorage.removeItem("currentCompanyId");
    }
  }

  // automatically move to homepage if already logged in
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await get("/Users/me");
        if (!mounted || !me) return;
        const user = pickUser(me);
        setCurrentUser(user);
        initializeCompanies(me);
        navigate(homepagePathForRole(user?.role));

      } catch {
        // no session
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function login({ email, password }) {
    const data = await post("/auth/login", { email, password });

    let me = null;
    try {
      me = await get("/Users/me");
    } catch {
      me = null;
    }

    const user = pickUser(me ?? { email, userName: email });
    setCurrentUser(user);
    initializeCompanies(me);
    return user;
  }

  async function signup({ firstName, lastName, email, password }) {
    await post("/auth/register", { email, password, firstName, lastName });
    await login({ email, password });
  }

  async function logout() {
    await post("/auth/logout");
    setCurrentUser(null);
    setCompanies([]);
    setCurrentCompany(null);
    localStorage.removeItem("currentCompanyId");
  }

  return (
    <AuthContext.Provider value={{ currentUser, companies, currentCompany, setCurrentCompany, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
