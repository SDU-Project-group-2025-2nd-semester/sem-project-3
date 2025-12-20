import { setAuthHandler } from "../../shared/api/apiClient";

export function registerAuthHandlers({ refresh, logout } = {}) {
 setAuthHandler({ refresh, logout });
}
