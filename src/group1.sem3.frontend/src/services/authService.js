import { post } from "../context/apiClient";

// Auth service: thin wrappers around API endpoints
export async function login({ email, password }) {
 return post("/auth/login", { email, password });
}

export async function register({ firstName, lastName, email, password }) {
 return post("/auth/register", { firstName, lastName, email, password });
}

export async function logout() {
 return post("/auth/logout");
}

// If you add a dedicated refresh endpoint, wire it here.
export async function refresh() {
 // Placeholder: many backends simply rely on cookie/session and GET /Users/me
 return null;
}
