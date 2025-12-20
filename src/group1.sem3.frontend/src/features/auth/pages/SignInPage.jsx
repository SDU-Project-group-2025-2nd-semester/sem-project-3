import { useState } from "react";
import { useAuth } from "../AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { homepagePathForRole } from "../../../shared/utils/homepage";
import Card from "@shared/ui/Card";
import Input from "@shared/ui/Input";
import Button from "@shared/ui/Button";
import NotificationBanner from "@shared/ui/NotificationBanner";

export default function SignInPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const user = await login({ email, password });

            const role = user?.role ?? 0;
            navigate(homepagePathForRole(role));
        } catch (err) {
            const msg = err?.body?.message || err?.message || "Failed to log in";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-5">
            <Card className="w-full max-w-xl">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 text-primary">
                    Welcome Back!
                </h2>

                {error && <NotificationBanner type="error">{error}</NotificationBanner>}

                <form className="space-y-3 sm:space-y-5 md:space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block mb-1 text-sm font-semibold text-primary" htmlFor="email">
                            Email
                        </label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-semibold text-primary" htmlFor="password">
                            Password
                        </label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading} variant="primary">
                        {isLoading ? "Logging in..." : "Login"}
                    </Button>
                </form>

                <div className="mt-3 sm:mt-4 text-center">
                    <Link to="/signuppage" className="text-accent font-semibold text-sm sm:text-base hover:underline">
                        Register
                    </Link>
                </div>
            </Card>
        </div>
    );
}