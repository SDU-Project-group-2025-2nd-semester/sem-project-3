import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const base = "http://s3-be-dev.michalvalko.eu/api";

    async function login({ email, password }) {
        const response = await fetch(`${base}/auth/login`, {
            method: "POST",
            credentials: "include", 
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });    

        if (!response.ok) {
            throw new Error("Login failed");
        }

        let data = null;
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            try {
                data = await response.json();
            } catch {
                data = null;
            }
        }

        const me = await fetch(`${base}/Users/me`, {
            method: "GET",
            headers: {
                accept: "text/plain",
            },
            credentials: "include",
        });

        if (me.ok) {
            setCurrentUser({
                email,
                role: data?.role ?? "user",
                token: data?.accessToken ?? null,
            });
        } else {
            setCurrentUser({
                email,
                role: data?.role ?? "user",
                token: data?.accessToken ?? null,
            });
        }
    }

    async function signup({ firstName, lastName, email, password }) {
        const payload = { email, password, firstName, lastName };

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error("Signup failed");
        }

        await login({ email, password });
    }

    async function logout() {
        const response = await fetch(`${base}/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
            throw new Error("Logout failed");
        }
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
