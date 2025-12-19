import AuthProvider from "AuthContext";
import { useAuth as useAuthContext } from "AuthContext";

// Re-export context provider and hook from the features surface so the rest of the app
// can import from a single feature location. This makes later refactors easier.
export { useAuthContext as useAuth };
export default AuthProvider;
