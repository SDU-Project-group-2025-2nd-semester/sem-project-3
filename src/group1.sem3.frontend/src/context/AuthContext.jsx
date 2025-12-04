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

  const navigate = useNavigate();
  // automatically move to homepage if already logged in
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await get("/Users/me");
        if (!mounted || !me) return;
        const user = pickUser(me);
        setCurrentUser(user);
        navigate(homepagePathForRole(user?.role));

        } catch {
                // no session
        }
    })();
        return () => { mounted = false; };
    }, []);

    // Refresh current user from server (returns picked user or null)
    async function refreshCurrentUser() {
        try {
            const me = await get("/Users/me");
            const user = pickUser(me);
            setCurrentUser(user);
            return user;
        } catch (err) {
            // Not authenticated or error � clear local state
            setCurrentUser(null);
            return null;
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
    await post("/auth/logout");
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
