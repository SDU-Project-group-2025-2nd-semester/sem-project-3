import { createContext, useContext, useState } from "react";

// User types: admin, staff, user
const users = [
    { username: "admin", role: "admin" },
    { username: "staff", role: "staff" },
    { username: "user", role: "user" },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    // Simulate login: accepts username, sets user if found in list
    function login(username) {
        const foundUser = users.find((u) => u.username === username);
        setCurrentUser(foundUser || null);
    }

    function logout() {
        setCurrentUser(null);
    }

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, users }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthProvider;