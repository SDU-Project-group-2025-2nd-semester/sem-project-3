import { get, post, put, del } from "@shared/api/apiClient";

// Users
export async function getMyCompanies() {
 return get("/Users/me/companies");
}

export async function getMyProfile() {
 return get("/Users/me");
}

export async function getUserById(userId) {
 return get(`/Users/${userId}`);
}

export async function getUsersByCompany(companyId) {
 return get(`/Users?companyId=${companyId}`);
}

export async function deleteUser(userId) {
 return del(`/Users/${userId}`);
}

// Rooms
export async function getRooms(companyId, opts) {
 return get(`/${companyId}/Rooms`, opts);
}

export async function getRoomById(companyId, roomId, opts) {
 return get(`/${companyId}/Rooms/${roomId}`, opts);
}

export async function createRoom(companyId, payload) {
 return post(`/${companyId}/Rooms`, payload);
}

export async function updateRoom(companyId, roomId, payload) {
 return put(`/${companyId}/Rooms/${roomId}`, payload);
}

export async function setRoomHeight(companyId, roomId, newHeight) {
 return put(`/${companyId}/Rooms/${roomId}/height`, newHeight);
}

export async function deleteRoom(companyId, roomId) {
 return del(`/${companyId}/Rooms/${roomId}`);
}

// Desks
export async function getDesksForRoom(companyId, roomId) {
 return get(`/${companyId}/Desks/room/${roomId}`);
}

export async function getAllDesks(companyId) {
 return get(`/${companyId}/Desks`);
}

export async function getDeskById(companyId, deskId, opts) {
 return get(`/${companyId}/Desks/${deskId}`, opts);
}

export async function adoptDesk(companyId, macAddress, rpiMacAddress, roomId) {
 const payload = {
 macAddress: macAddress,
 roomId: roomId,
 };
 if (rpiMacAddress) payload.rpiMacAddress = rpiMacAddress;

 return post(`/${companyId}/Desks`, payload);
}

export async function deleteDesk(companyId, deskId) {
 return del(`/${companyId}/Desks/${deskId}`);
}

export async function getUnadoptedDesks(companyId) {
 return get(`/${companyId}/Desks/not-adopted`);
}

// Reservations
export async function getReservations(companyId) {
 return get(`/${companyId}/Reservation`);
}

export async function deleteReservation(companyId, reservationId) {
 return del(`/${companyId}/Reservation/${reservationId}`);
}

// Simulator settings
export async function getSimulatorSettings(companyId) {
 return get(`/Company/${companyId}/simulator`);
}

export async function updateSimulatorSettings(companyId, settings) {
 return put(`/Company/${companyId}/simulator`, settings);
}

// Damage reports
export async function getDamageReports(companyId) {
 return get(`/${companyId}/DamageReport`);
}

export async function updateDamageReportStatus(companyId, damageId, isResolved) {
 return put(`/${companyId}/DamageReport/${damageId}`, isResolved);
}

export async function deleteDamageReport(companyId, damageId) {
 return del(`/${companyId}/DamageReport/${damageId}`);
}
