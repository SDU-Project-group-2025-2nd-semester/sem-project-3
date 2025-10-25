import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
export const roles = ["admin", "staff", "user"];

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    // Login setzt currentUser
    function login({ email, password, role }) {
        if (!role) throw new Error("Role required"); 
        setCurrentUser({ email: email || "unknown", role });
    }

    function signup({ username, fullName, email, password, role }) {
        if (!role) throw new Error("Role required");
        setCurrentUser({ email: email || username, role });
    }

    function logout() {
        setCurrentUser(null);
    }

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, signup, roles }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthProvider;
