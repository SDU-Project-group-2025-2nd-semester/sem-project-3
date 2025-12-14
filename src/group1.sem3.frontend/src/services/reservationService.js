import { get, post, put, del } from "../context/apiClient";

export async function getMyReservations(companyId, opts) {
 return get(`/${companyId}/reservation/me`, opts);
}

export async function getReservations(companyId) {
 return get(`/${companyId}/Reservation`);
}

export async function createReservation(companyId, payload) {
 return post(`/${companyId}/reservation`, payload);
}

export async function updateReservation(companyId, reservationId, payload) {
 return put(`/${companyId}/reservation/${reservationId}`, payload);
}

export async function cancelReservation(companyId, reservationId) {
 return del(`/${companyId}/reservation/${reservationId}`);
}
