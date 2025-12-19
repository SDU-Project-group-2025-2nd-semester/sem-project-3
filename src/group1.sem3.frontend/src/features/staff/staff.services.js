import { get, post, put, del } from "@shared/api/apiClient";

// Rooms & Desks
export async function getRooms(companyId, opts) {
 return get(`/${companyId}/Rooms`, opts);
}

export async function getDesks(companyId, opts) {
 return get(`/${companyId}/Desks`, opts);
}

export async function getDeskById(companyId, deskId, opts) {
 return get(`/${companyId}/Desks/${deskId}`, opts);
}

export async function putDeskHeight(companyId, deskId, newHeight) {
 return put(`/${companyId}/Desks/${deskId}/height`, newHeight);
}

// Damage reports
export async function createDamageReport(companyId, payload) {
 return post(`/${companyId}/DamageReport`, payload);
}

// User profile
export async function getMyProfile() {
 return get('/Users/me');
}

export async function updateMyProfile(payload) {
 return put('/Users/me', payload);
}

// Reservations (if needed later)
export async function getReservations(companyId) {
 return get(`/${companyId}/Reservation`);
}

export async function deleteReservation(companyId, reservationId) {
 return del(`/${companyId}/Reservation/${reservationId}`);
}
