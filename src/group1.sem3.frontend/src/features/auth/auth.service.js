import { post, get } from "../../shared/api/apiClient";

export async function login({ email, password }) {
    return post("/auth/login", { email, password });
}

export async function signup({ firstName, lastName, email, password }) {
    return post("/auth/register", { firstName, lastName, email, password });
}

export async function logout() {
    return post("/auth/logout");
}

export async function getCurrentUser() {
    return get("/Users/me");
}
