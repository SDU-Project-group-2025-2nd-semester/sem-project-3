import { get, put, del } from "../context/apiClient";

export async function getMyProfile(opts) {
 return get("/Users/me", opts);
}

export async function updateMyProfile(payload) {
 return put("/Users/me", payload);
}

export async function getUsersByCompany(companyId) {
 return get(`/Users?companyId=${companyId}`);
}

export async function getUserById(userId) {
 return get(`/Users/${userId}`);
}

export async function deleteUser(userId) {
 return del(`/Users/${userId}`);
}
