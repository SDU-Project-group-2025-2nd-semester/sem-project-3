import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    async function login({ email, password }) {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            throw new Error("Login failed");
        }
        const data = await response.json();
        setCurrentUser({ email, role:data.role, token: data.accessToken });
    }

    async function signup({ username, fullName, email, password, role }) {
        if (!role) throw new Error("Role required");
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, fullName, email, password, role }),
        });
        if (!response.ok) {
            throw new Error("Signup failed");
        }
        const data = await response.json();
        setCurrentUser({ email: email || username, role, token: data.accessToken });
    }

    function logout() {
        setCurrentUser(null);
        // optionally notify backend to clear session/cookies
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
