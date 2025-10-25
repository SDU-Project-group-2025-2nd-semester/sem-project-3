import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function SignUpPage() {
    const { signup, users } = useAuth();
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedUser, setSelectedUser] = useState(users[0]?.username || "");

    const inputClasses = "w-full border border-secondary rounded px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 outline-none focus:ring-2 focus:ring-accent bg-background text-primary";
    const labelClasses = "block mb-1 text-sm font-semibold text-primary";

    function handleSubmit(e) {
        e.preventDefault();
        signup({ username, fullName, email, password, role: selectedUser });
    }

    const InputField = ({ id, type, value, onChange, placeholder }) => (
        <div>
            <label className={labelClasses} htmlFor={id}>
                {placeholder}
            </label>
            <input
                id={id}
                type={type}
                className={inputClasses}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
            />
        </div>
    );

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <div className="w-full max-w-md sm:max-w-lg md:max-w-xl p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow">

                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gray-300 mx-auto rounded-full mb-4 sm:mb-6 flex items-center justify-center">
                    <span className="text-primary text-xs sm:text-sm md:text-base">Image</span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 text-primary">
                    Welcome!
                </h2>

                <form className="space-y-3 sm:space-y-5 md:space-y-6" onSubmit={handleSubmit}>
                    <InputField id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
                    <InputField id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" />
                    <InputField id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                    <InputField id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

                    <div>
                        <label className={labelClasses} htmlFor="userType">
                            User Type
                        </label>
                        <select
                            id="userType"
                            className={inputClasses}
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
                        className="w-full bg-accent text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded hover:bg-secondary transition-colors"
                    >
                        Register
                    </button>
                </form>

                <div className="mt-3 sm:mt-4 text-center">
                    <Link
                        to="/"
                        className="text-accent font-semibold text-sm sm:text-base hover:underline"
                    >
                        Login
                    </Link>
                </div>

            </div>
        </div>
    );
}
