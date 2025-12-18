import { get, put, post, del } from "../context/apiClient";

export async function getMyCompanies() {
 return get("/Users/me/companies");
}

export async function getCompany(companyId) {
 return get(`/${companyId}/Company`);
}

// The ones that can be joined with an invite code
export async function getPublicCompanies() {
 return get(`/Company/publiclyAccessible`);
}

export async function updateSimulator(companyId, payload) {
 return put(`/Company/${companyId}/simulator`, payload);
}

export async function updateUserRole(companyId, userId, payload) {
 return put(`/Company/${companyId}/users/${userId}?userRole=${payload}`);

export async function enterCompany(companyId, accessCode) {
 return post(`/Company/${companyId}/access`, accessCode);
}

export async function kickUser(companyId, userId) {
    return del(`/Company/${companyId}/users/${userId}`);
}
