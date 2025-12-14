import { get, del, put } from "../context/apiClient";

export async function getDeskById(companyId, deskId, opts) {
 return get(`/${companyId}/Desks/${deskId}`, opts);
}

export async function getDesk(companyId, deskId) {
 return getDeskById(companyId, deskId);
}

export async function getDesksForRoom(companyId, roomId) {
 return get(`/${companyId}/Desks/room/${roomId}`);
}

export async function putDeskHeight(companyId, deskId, opts) {
 return put(`/${companyId}/Desks/${deskId}/height`, opts)
}

export async function deleteDesk(companyId, deskId) {
 return del(`/${companyId}/Desks/${deskId}`);
}
