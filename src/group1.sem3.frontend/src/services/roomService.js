import { get, post, put, del } from "../context/apiClient";

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
 // backend expects the new height in the request body (integer)
 return put(`/${companyId}/Rooms/${roomId}/height`, newHeight);
}

export async function deleteRoom(companyId, roomId) {
 return del(`/${companyId}/Rooms/${roomId}`);
}
