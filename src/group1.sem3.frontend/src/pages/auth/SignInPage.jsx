import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function SignInPage() {
    const { login, roles, currentUser } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();


    function handleSubmit(e) {
        e.preventDefault();
        setError("");
        try {
            login({ email, password, role: selectedRole });
            navigate(`/${currentUser.role}/homepage`);
        } catch (err) {
            setError(err.message || "Failed to log in");
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <div className="w-full max-w-md sm:max-w-lg md:max-w-xl p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow">

                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 text-primary">
                    Welcome Back!
                </h2>

                {error && <div className="text-red-500 mb-2 text-sm text-center">{error}</div>}

                <form className="space-y-3 sm:space-y-5 md:space-y-6" onSubmit={handleSubmit}>
                    <InputField id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                    <InputField id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

                    <div>
                        <label className={labelClasses} htmlFor="userType">
                            User Type
                        </label>
                        <select
                            id="userType"
                            className={inputClasses}
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select a role</option>
                            {roles.map(role => (
                                <option key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                            ))}
                        </select>

                    </div>

                    <button
                        type="submit"
                        className="w-full bg-accent text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded hover:bg-secondary transition-colors"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-3 sm:mt-4 text-center">
                    <Link
                        to="/signuppage"
                        className="text-accent font-semibold text-sm sm:text-base hover:underline"
                    >
                        Register
                    </Link>
                </div>

            </div>
        </div>
    );
}

const inputClasses = "w-full border border-secondary rounded px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 outline-none focus:ring-2 focus:ring-accent bg-background text-primary";
const labelClasses = "block mb-1 text-sm font-semibold text-primary";

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