import { get, post, put, del } from "@shared/api/apiClient";

// Rooms & Desks
export async function getRooms(companyId, opts) {
 return get(`/${companyId}/Rooms`, opts);
}

export async function getDesks(companyId, opts) {
 return get(`/${companyId}/Desks`, opts);
}

export async function getDesksForRoom(companyId, roomId, opts) {
 return get(`/${companyId}/Desks/room/${roomId}`, opts);
}

export async function getDeskById(companyId, deskId, opts) {
 return get(`/${companyId}/Desks/${deskId}`, opts);
}

export async function getRoomById(companyId, roomId, opts) {
 return get(`/${companyId}/Rooms/${roomId}`, opts);
}

// Reservations
export async function getReservations(companyId, query = {}, opts) {
 // query: { startDate, endDate, userId, deskId }
 const qs = Object.keys(query || {}).length ? `?${new URLSearchParams(query).toString()}` : "";
 return get(`/${companyId}/Reservation${qs}`, opts);
}

export async function getMyReservations(companyId, opts) {
 return get(`/${companyId}/Reservation/me`, opts);
}

export async function getReservation(companyId, reservationId, opts) {
 return get(`/${companyId}/Reservation/${reservationId}`, opts);
}

export async function createReservation(companyId, payload) {
 return post(`/${companyId}/Reservation`, payload);
}

export async function deleteReservation(companyId, reservationId) {
 return del(`/${companyId}/Reservation/${reservationId}`);
}

// User profile
export async function getMyProfile(opts) {
 return get(`/Users/me`, opts);
}

export async function updateMyProfile(payload) {
 return put(`/Users/me`, payload);
}
