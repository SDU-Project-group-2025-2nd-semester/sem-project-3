import { get, put } from "../context/apiClient";

export async function getMyCompanies() {
 return get("/Users/me/companies");
}

export async function getCompany(companyId) {
 return get(`/${companyId}/Company`);
}

export async function updateSimulator(companyId, payload) {
 return put(`/Company/${companyId}/simulator`, payload);
}

export async function updateUserRole(companyId, userId, payload) {
 return put(`/Company/${companyId}/users/${userId}?userRole=${payload}`);
}
