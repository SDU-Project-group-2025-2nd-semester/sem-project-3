import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
 getUsersByCompany,
 getMyProfile,
 deleteUser,
 getReservations,
 deleteReservation,
 getDeskById,
 updateUserRole,
} from "../admin.services";

export function useUsersManager() {
 const navigate = useNavigate();
 const [users, setUsers] = useState([]);
 const [staff, setStaff] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [userReservations, setUserReservations] = useState({});
 const [companyId, setCompanyId] = useState(null);
 const [me, setMe] = useState(null);

 useEffect(() => {
 fetchUserAndStaff();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const fetchReservationsForUsers = useCallback(async (companyId) => {
 try {
 if (!companyId) return;

 const allReservations = await getReservations(companyId);

 const DeskIds = [...new Set(allReservations.map((r) => r.deskId).filter(Boolean))];
 const deskPromises = DeskIds.map((deskId) =>
 getDeskById(companyId, deskId).catch((err) => {
 console.error(`Error fetching desk ${deskId}:`, err);
 return { id: deskId, readableId: deskId };
 })
 );
 const desks = await Promise.all(deskPromises);
 const deskMap = Object.fromEntries(desks.map((d) => [d.id, d]));

 const reservationsWithDesks = allReservations.map((reservation) => ({
 ...reservation,
 desk: deskMap[reservation.deskId],
 }));

 const reservationsByUser = {};
 reservationsWithDesks.forEach((reservation) => {
 if (!reservationsByUser[reservation.userId]) {
 reservationsByUser[reservation.userId] = [];
 }
 reservationsByUser[reservation.userId].push(reservation);
 });

 setUserReservations(reservationsByUser);
 } catch (err) {
 console.error("Error fetching reservations:", err);
 }
 }, []);

 const fetchUserAndStaff = useCallback(async () => {
 try {
 setLoading(true);
 setError(null);

 const currentUser = await getMyProfile();
 setMe(currentUser);

 if (!currentUser?.companyMemberships || currentUser.companyMemberships.length ===0) {
 throw new Error("No company associated with current user");
 }

 const userCompanyId = currentUser.companyMemberships[0].companyId;
 setCompanyId(userCompanyId);

 const allUsers = await getUsersByCompany(userCompanyId);

 const basicUsers = allUsers.filter((u) => u.role ===0);
 const staffUsers = allUsers.filter((u) => (u.role ===1 || u.role ===2) && u.id !== currentUser.id);

 setUsers(basicUsers);
 setStaff(staffUsers);

 await fetchReservationsForUsers(userCompanyId);
 } catch (err) {
 console.error("Error fetching users: ", err);
 setError(err?.message || String(err));
 if (String(err?.message).includes("401") || String(err?.message).includes("Unauthorized") || String(err?.message).includes("company")) {
 setTimeout(() => navigate("/"),2000);
 }
 } finally {
 setLoading(false);
 }
 }, [fetchReservationsForUsers, navigate]);

 const getLatestReservation = useCallback((userId) => {
 const reservations = userReservations[userId] || [];
 if (reservations.length ===0) return null;

 return reservations.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())[0];
 }, [userReservations]);

 const formatDate = useCallback((iso) => {
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
 }, []);

 const handleCancelReservation = useCallback(async (userId) => {
 const latestReservation = getLatestReservation(userId);

 if (!latestReservation) {
 alert("No reservation to cancel");
 return;
 }

 if (!confirm("Are you sure you want to cancel this reservation?")) return;

 try {
 await deleteReservation(companyId, latestReservation.id);
 await fetchUserAndStaff();
 } catch (err) {
 console.error("Error canceling reservation:", err);
 alert("Failed to cancel reservation: " + (err?.message || String(err)));
 }
 }, [companyId, fetchUserAndStaff, getLatestReservation]);

 const handleRemoveUser = useCallback(async (userId) => {
 const user = [...users, ...staff].find((u) => u.id === userId);
 if (!confirm(`Are you sure you want to remove ${user?.firstName + " " + user?.lastName || `this user`}?`)) return;
 try {
 await deleteUser(userId);
 await fetchUserAndStaff();
 } catch (err) {
 console.error(`Error removing user: `, err);
 alert("Failed to remove user: " + (err?.message || String(err)));
 }
 }, [users, staff, fetchUserAndStaff]);


 const handleRoleChange = useCallback(async (userId, newRole) => {
    const user = [...users, ...staff].find(u => u.id === userId);
    const roleNames = { 0: 'User', 1: 'Janitor', 2: 'Admin' };

    if (!confirm(`Change ${user?.firstName} ${user?.lastName}'s role to ${roleNames[newRole]}?`)) {
      return;
    }

    try {
      await updateUserRole(companyId, userId, newRole);
      await fetchUserAndStaff();
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Failed to change role: ' + error.message);
    }
  }, [companyId, users, staff, fetchUserAndStaff]);

 return {
 users,
 staff,
 loading,
 error,
 userReservations,
 companyId,
 me,
 fetchUserAndStaff,
 fetchReservationsForUsers,
 getLatestReservation,
 formatDate,
 handleCancelReservation,
 handleRemoveUser,
 handleRoleChange
 };
}
