import { get} from "../context/apiClient";

export function GetCompanyStats(companyId) {
    return get(`/${companyId}/Statistics/company`);
}

export function GetRoomStats(companyId, roomId) {
    return get(`/${companyId}/Statistics/rooms/${roomId}`);
}

export function GetDeskStats(companyId, deskId) {
    return get(`/${companyId}/Statistics/desks/${deskId}`);
}

export function GetUserStats(companyId, userId) {
    return get(`/${companyId}/Statistics/users/${userId}`);
}

// 