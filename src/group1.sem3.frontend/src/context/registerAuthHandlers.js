import { setAuthHandler } from "./apiClient";

export function registerAuthHandlers({ refresh, logout } = {}) {
 setAuthHandler({ refresh, logout });
}
