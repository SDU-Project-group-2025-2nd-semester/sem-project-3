import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export const roles = ["admin", "staff", "user"];

export default function SignUpPage() {
    const { signup } = useAuth();
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        setError("");
        try {
            signup({ firstname, lastname, email, password });
            navigate(`/user/homepage`);
        } catch (err) {
            setError(err.message || "Failed to register");
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <div className="w-full max-w-md sm:max-w-lg md:max-w-xl p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow">

                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 text-primary">
                    Welcome!
                </h2>

                {error && <div className="text-red-500 mb-2 text-sm text-center">{error}</div>}

                <form className="space-y-3 sm:space-y-5 md:space-y-6" onSubmit={handleSubmit}>
                    <InputField id="firstname" type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} placeholder="First Name" />
                    <InputField id="lastname" type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Last Name" />
                    <InputField id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                    <InputField id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

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


const inputClasses = "w-full border border-secondary rounded px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 outline-none focus:ring-2 focus:ring-accent bg-background text-primary";
const labelClasses = "block mb-1 text-sm font-semibold text-primary";
