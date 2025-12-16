import { get, put, del } from "../context/apiClient";

export async function getMyCompanies() {
 return get("/Users/me/companies");
}

export async function getCompany(companyId) {
 return get(`/${companyId}/Company`);
}

export async function updateSimulator(companyId, payload) {
 return put(`/Company/${companyId}/simulator`, payload);
}

export async function kickUser(companyId, userId) {
    return del(`/Company/${companyId}/users/${userId}`);
}