import { createContext, useContext, useEffect, useState } from "react";
import { post, get } from "./apiClient";

const AuthContext = createContext(null);

function pickUser(serverUser) {
  if (!serverUser) return null;
  return {
    id: serverUser.id,
    email: serverUser.email ?? serverUser.userName,
    userName: serverUser.userName,
    firstName: serverUser.firstName,
    lastName: serverUser.lastName,
    role: "user",
    standingHeight: serverUser.standingHeight,
    sittingHeight: serverUser.sittingHeight,
    healthRemindersFrequency: serverUser.healthRemindersFrequency,
    sittingTime: serverUser.sittingTime,
    standingTime: serverUser.standingTime,
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // Rehydrate on app start (if session cookie exists)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await get("/Users/me");
        if (mounted && me) setCurrentUser(pickUser(me, null));
      } catch {
        // Keine Session / nicht angemeldet
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function login({ email, password }) {
    const data = await post("/auth/login", { email, password });
    // data may contain accessToken or server may use cookies
    const token = data?.accessToken ?? null;

    let me = null;
    try {
      me = await get("/Users/me");
    } catch {
      me = null;
    }

    setCurrentUser(pickUser(me ?? { email, userName: email }, token));
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
