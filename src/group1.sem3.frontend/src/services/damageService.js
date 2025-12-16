import { get, put, del } from "../context/apiClient";

export async function getDamageReports(companyId) {
 return get(`/${companyId}/DamageReport`);
}

// Keep old name for compatibility, but provide the name used by UI
export async function updateDamageReportStatus(companyId, damageId, isResolved) {
 return put(`/${companyId}/DamageReport/${damageId}`, isResolved);
}

export async function resolveDamageReport(companyId, damageId, isResolved) {
 return updateDamageReportStatus(companyId, damageId, isResolved);
}

export async function deleteDamageReport(companyId, damageId) {
 return del(`/${companyId}/DamageReport/${damageId}`);
}
