import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function SignUpPage() {
    const { signup } = useAuth();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Passwort-Regeln (aus Backend)
    const passwordRules = [
        { code: "PasswordTooShort", desc: "Atleast six characters" },
        { code: "PasswordRequiresDigit", desc: "Atleast one number (0–9)" },
        { code: "PasswordRequiresNonAlphanumeric", desc: "Atleast one special character" },
        { code: "PasswordRequiresLower", desc: "Atleast one low letter (a–z)" },
        { code: "PasswordRequiresUpper", desc: "Atleast one big letter (A–Z)" },
    ];

    function validatePassword(pw) {
        const checks = {
            PasswordTooShort: pw != null && pw.length >= 6,
            PasswordRequiresDigit: /[0-9]/.test(pw || ""),
            PasswordRequiresNonAlphanumeric: /[^a-zA-Z0-9]/.test(pw || ""),
            PasswordRequiresLower: /[a-z]/.test(pw || ""),
            PasswordRequiresUpper: /[A-Z]/.test(pw || ""),
        };
        const failed = Object.keys(checks).filter(k => !checks[k]);
        return { ok: failed.length === 0, failed, checks };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setError("First name, last name and email are required.");
            return;
        }

        const { ok } = validatePassword(password);
        if (!ok) {
            setError("Password does not fullfill all requirements.");
            return;
        }

        setLoading(true);
        try {
            setLoading(true);
            await signup({ firstName, lastName, email, password });
        } catch (err) {
            setError(err?.message || "Error on registration.");
        } finally {
            setLoading(false);
        }
    }

    const renderRule = (rule, checks) => {
        const ok = checks[rule.code];
        return (
            <div key={rule.code} className={`flex items-center gap-2 ${ok ? "text-success-700" : "text-gray-500"}`}>
                <span className={`w-4 h-4 rounded-full ${ok ? "bg-success-600" : "bg-gray-300"}`} />
                <span>{rule.desc}</span>
            </div>
        );
    };

    const lastChecks = validatePassword(password).checks;

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <div className="w-full max-w-md sm:max-w-lg md:max-w-xl p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow">

                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 text-primary">
                    Welcome!
                </h2>

                {error && <div className="text-red-500 mb-2 text-sm text-center">{error}</div>}

                <form className="space-y-3 sm:space-y-5 md:space-y-6" onSubmit={handleSubmit}>
                    <InputField id="firstname" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" />
                    <InputField id="lastname" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" />
                    <InputField id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                    <InputField id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

                    {/* Password requirements */}
                    <div className="text-xs text-gray-600 space-y-1">
                        {passwordRules.map(rule => renderRule(rule, lastChecks))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded disabled:opacity-60 transition-colors"
                    >
                        {loading ? "Registering…" : "Register"}
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
