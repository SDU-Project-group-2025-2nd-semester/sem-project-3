import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
 getDamageReports,
 updateDamageReportStatus,
 deleteDamageReport,
 getMyProfile,
 getDeskById,
 getUserById,
} from "../admin.services";

export function useDamagesManager() {
 const navigate = useNavigate();
 const [damages, setDamages] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [companyId, setCompanyId] = useState(null);

 useEffect(() => {
 fetchDamageReports();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 async function fetchDamageReports() {
 try {
 setLoading(true);
 setError(null);

 const me = await getMyProfile();

 if (!me?.companyMemberships || me.companyMemberships.length ===0) {
 throw new Error("No company associated with current user");
 }

 const userCompanyId = me.companyMemberships[0].companyId;
 setCompanyId(userCompanyId);

 const reports = await getDamageReports(userCompanyId);

 const reportsWithDetails = await Promise.all(
 (reports || []).map(async (report) => {
 let desk = null;
 let resolvedByUser = null;

 if (report.deskId) {
 try {
 desk = await getDeskById(userCompanyId, report.deskId);
 } catch (err) {
 // ignore desk fetch error
 console.error(`Error fetching desk ${report.deskId}:`, err);
 }
 }

 if (report.resolvedById) {
 try {
 resolvedByUser = await getUserById(report.resolvedById);
 } catch (err) {
 console.error(`Error fetching user ${report.resolvedById}:`, err);
 }
 }

 return { ...report, desk, resolvedByUser };
 })
 );

 setDamages(reportsWithDetails);
 } catch (err) {
 console.error("Error fetching damage reports:", err);
 setError(err?.message || String(err));
 if (String(err?.message).includes("401") || String(err?.message).includes("Unauthorized")) {
 setTimeout(() => navigate("/"),2000);
 }
 } finally {
 setLoading(false);
 }
 }

 const formatDate = (iso) => {
 if (!iso) return "_";
 try {
 return new Date(iso).toLocaleString("en-US", {
 year: "numeric",
 month: "short",
 day: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 });
 } catch {
 return iso;
 }
 };

 const getStatusColor = (isResolved) => (isResolved ? "text-success-600" : "text-warning-600");
 const getStatusText = (isResolved) => (isResolved ? "Resolved" : "Open");

 const handleResolveIssue = async (damageId) => {
 if (!confirm("Mark this damage report as resolved?")) return;
 try {
 await updateDamageReportStatus(companyId, damageId, true);
 await fetchDamageReports();
 } catch (err) {
 console.error("Error resolving damage report:", err);
 alert("Failed to resolve damage report: " + (err?.message || String(err)));
 }
 };

 const handleRemoveDamage = async (damageId) => {
 if (!confirm("Are you sure you want to remove this damage report?")) return;
 try {
 await deleteDamageReport(companyId, damageId);
 await fetchDamageReports();
 } catch (err) {
 console.error("Error removing damage report:", err);
 alert("Failed to remove damage report: " + (err?.message || String(err)));
 }
 };

 return {
 damages,
 loading,
 error,
 companyId,
 fetchDamageReports,
 formatDate,
 getStatusColor,
 getStatusText,
 handleResolveIssue,
 handleRemoveDamage,
 };
}
