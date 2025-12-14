import { get, put } from "../context/apiClient";

export async function getMyCompanies() {
 return get("/Users/me/companies");
}

export async function getCompany(companyId) {
 return get(`/${companyId}/Company`);
}

export async function getSimulator(companyId) {
 return get(`/Company/${companyId}/simulator`);
}

export async function updateSimulator(companyId, payload) {
 return put(`/Company/${companyId}/simulator`, payload);
}
