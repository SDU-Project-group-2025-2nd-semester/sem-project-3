import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function SignInPage() {
    const { login, users } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedUser, setSelectedUser] = useState(users[0]?.username || "");

    function handleSubmit(e) {
        e.preventDefault();
        login(selectedUser);
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow">

                {/* Placeholder image */}
                <div className="w-24 h-24 bg-gray-300 mx-auto squared-full mb-6 flex items-center justify-center">
                    <span className="text-primary text-sm">Image</span>
                </div>

                <h2 className="text-2xl font-bold text-center mb-6 text-primary">
                    Welcome Back!
                </h2>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label
                            className="block mb-1 text-sm font-semibold text-primary"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="w-full border border-secondary rounded px-3 py-2 outline-none focus:ring-2 focus:ring-accent bg-background text-primary"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label
                            className="block mb-1 text-sm font-semibold text-primary"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="w-full border border-secondary rounded px-3 py-2 outline-none focus:ring-2 focus:ring-accent bg-background text-primary"
                            placeholder="*******"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label
                            className="block mb-1 text-sm font-semibold text-primary"
                            htmlFor="userType"
                        >
                            User Type
                        </label>
                        <select
                            id="userType"
                            className="w-full border border-secondary rounded px-3 py-2 outline-none focus:ring-2 focus:ring-accent bg-background text-primary"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            {users.map((user) => (
                                <option key={user.username} value={user.username}>
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-accent text-white font-semibold py-2 rounded hover:bg-secondary transition-colors"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
