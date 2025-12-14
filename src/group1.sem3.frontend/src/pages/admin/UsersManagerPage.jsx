import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { get, del, put } from "../../context/apiClient";

export default function UsersManagerPage() {
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
  }, []);

  const fetchUserAndStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = await get('/Users/me');
      setMe(currentUser);

      if (!currentUser?.companyMemberships || currentUser.companyMemberships.length === 0) {
        throw new Error('No company associated with current user');
      }

      const userCompanyId = currentUser.companyMemberships[0].companyId;
      setCompanyId(userCompanyId);

      const allUsers = await get(`/Users?companyId=${userCompanyId}`);

      const basicUsers = allUsers.filter(u => u.role === 0);
      const staffUsers = allUsers.filter(u => (u.role === 1 || u.role === 2) && u.id !== currentUser.id);

      setUsers(basicUsers);
      setStaff(staffUsers);

      await fetchReservationsForUsers(userCompanyId);
    } catch (error) {
      console.error('Error fetching users: ', error);
      setError(error.message);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('company')) {
        setTimeout(() => navigate('/'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReservationsForUsers = async (companyId) => {
    try {
      if (!companyId) return;

      const allReservations = await get(`/${companyId}/Reservation`);

      const DeskIds = [...new Set(allReservations.map(r => r.deskId).filter(Boolean))];
      const deskPromises = DeskIds.map(deskId =>
        get(`/${companyId}/Desks/${deskId}`).catch(err => {
          console.error(`Error fetching desk ${deskId}:`, err);
          return { id: deskId, readableId: deskId };
        })
      );
      const desks = await Promise.all(deskPromises);
      const deskMap = Object.fromEntries(desks.map(d => [d.id, d]));

      const reservationsWithDesks = allReservations.map(reservation => ({
        ...reservation,
        desk: deskMap[reservation.deskId]
      }));

      const reservationsByUser = {};
      reservationsWithDesks.forEach(reservation => {
        if (!reservationsByUser[reservation.userId]) {
          reservationsByUser[reservation.userId] = [];
        }
        reservationsByUser[reservation.userId].push(reservation);
      });

      setUserReservations(reservationsByUser);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const getLatestReservation = (userId) => {
    const reservations = userReservations[userId] || [];
    if (reservations.length === 0) return null;

    return reservations.sort((a, b) =>
      new Date(b.start).getTime() - new Date(a.start).getTime()
    )[0];
  };

  const formatDate = (iso) => {
    if (!iso) return '_'
    try {
      return new Date(iso).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  }

  const handleCancelReservation = async (userId) => {
    const latestReservation = getLatestReservation(userId);

    if (!latestReservation) {
      alert('No reservation to cancel');
      return;
    }

    const now = new Date();
    const start = new Date(latestReservation.start);
    const end = new Date(latestReservation.end);
    // const isActive = start <= now && now <= end;

    // if (!isActive) {
    //   alert('No active reservation to cancel');
    //   return;
    // }

    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      await del(`/${companyId}/Reservation/${latestReservation.id}`);

      await fetchUserAndStaff();
    } catch (error) {
      console.error('Error canceling reservation:', error);
      alert('Failed to cancel reservation: ' + error.message);
    }
  };

  const handleRemoveUser = async (userId) => {
    const user = [...users, ...staff].find(u => u.id === userId);
    if (!confirm(`Are you sure you want to remove ${user?.firstName + " " + user?.lastName || `this user`}?`)) {
      return;
    }
    try {
      await del(`/Users/${userId}`);
      await fetchUserAndStaff();
    } catch (error) {
      console.error(`Error removing user: `, error);
      alert('Failed to remove user: ' + error.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const user = [...users, ...staff].find(u => u.id === userId);
    const roleNames = { 0: 'User', 1: 'Janitor' };

    if (!confirm(`Change ${user?.firstName} ${user?.lastName}'s role to ${roleNames[newRole]}?`)) {
      return;
    }

    try {
      await put(`/Users/${userId}/role`, { companyId, newRole });
      await fetchUserAndStaff();
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Failed to change role: ' + error.message);
    }
  };

  const TableHeader = ({ columns }) => (
    <thead className="bg-gray-50 max-lg:hidden">
      <tr>
        {columns.map((col, idx) => (
          <th key={idx} className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );

  const EmptyState = ({ colSpan, message }) => (
    <tr>
      <td colSpan={colSpan} className="px-4 py-6 text-center text-sm text-gray-500">
        {message}
      </td>
    </tr>
  );

  const MobileLabel = ({ children }) => (
    <span className="font-semibold lg:hidden">{children}: </span>
  );

  const UserRow = ({ user }) => {
    const latestReservation = getLatestReservation(user.id);

    const getDuration = (reservation) => {
      if (!reservation) return null;
      const start = new Date(reservation.start);
      const end = new Date(reservation.end);
      const durationMs = end - start;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    return (
      <tr key={user.id} className="border-t last:border-b hover:bg-gray-50 transition-colors max-lg:flex max-lg:flex-wrap max-lg:border-b max-lg:py-2">
        <td className="px-4 py-2 text-sm font-medium max-lg:w-7/8 max-lg:pl-2 max-lg:text-lg">
          {user.firstName} {user.lastName}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 max-lg:w-full max-lg:py-1">
          {user.email}
        </td>
        <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
          <MobileLabel>Latest Reservation</MobileLabel>
          <span className={latestReservation ? "text-gray-600 font-medium" : "text-gray-400"}>
            {latestReservation
              ? `${formatDate(latestReservation.start)} (${getDuration(latestReservation)})`
              : '-'
            }
          </span>
        </td>
        <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
          <MobileLabel>Desk</MobileLabel>
          {latestReservation?.desk?.readableId || latestReservation?.deskId || '-'}
        </td>
        <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
          <MobileLabel>Desk Time</MobileLabel>
          {user.sittingTime + user.standingTime} min
        </td>
        <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
          <MobileLabel>Sitting Time</MobileLabel>
          {user.sittingTime ?? 'no time available'} min
        </td>
        <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
          <MobileLabel>Role</MobileLabel>
          <select
            value={user.role}
            onChange={(e) => handleRoleChange(user.id, Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value={0}>User</option>
            <option value={1}>Janitor</option>
          </select>
        </td>
        <td className="px-4 py-3 text-sm max-lg:w-full max-lg:flex max-lg:flex-row max-lg:gap-2 max-lg:mt-2">
          <button
            className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all max-lg:flex-[4]"
            disabled={!latestReservation || new Date(latestReservation.end) < new Date()}
            onClick={() => handleCancelReservation(user.id)}
            title={latestReservation && new Date(latestReservation.end) >= new Date() ? "Cancel reservation" : "No active reservation"}
          >
            Cancel Reservation
          </button>
          <button
            className="bg-danger-500 text-white lg:ml-2 px-3 py-1.5 rounded-lg text-xs hover:bg-danger-600 transition-all inline-flex items-center justify-center gap-1 max-lg:flex-1"
            onClick={() => handleRemoveUser(user.id)}
            title="Remove user account"
          >
            <span className="material-symbols-outlined text-sm leading-none">delete</span>
            <span>Remove</span>
          </button>
        </td>
      </tr>
    );
  };
  const StaffRow = ({ staffMember }) => (
    <tr key={staffMember.id} className="border-t last:border-b hover:bg-gray-50 transition-colors max-lg:flex max-lg:flex-wrap max-lg:border-b max-lg:py-2">
      <td className="px-4 py-2 text-sm font-medium max-lg:w-7/8 max-lg:pl-2 max-lg:text-lg">
        {staffMember.firstName} {staffMember.lastName}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 max-lg:w-full max-lg:py-1">
        {staffMember.email}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 max-lg:w-full max-lg:py-1">
        <MobileLabel>Job Description</MobileLabel>
        {staffMember.role === 1 ? 'Janitor' : staffMember.role === 2 ? 'Admin' : 'Staff'}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Role</MobileLabel>
        <select
          value={staffMember.role}
          onChange={(e) => handleRoleChange(staffMember.id, Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={staffMember?.id === me?.id}
        >
          <option value={0}>User</option>
          <option value={1}>Janitor</option>
        </select>
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:mt-2">
        <button
          className="bg-danger-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-danger-600 transition-all inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleRemoveUser(staffMember.id, 'staff')}
          title="Remove staff account"
          disabled={staffMember?.id === me?.id}
        >
          <span className="material-symbols-outlined text-sm leading-none">delete</span>
          <span className="inline">Remove</span>
        </button>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="relative bg-background min-h-screen px-4 mt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative bg-background min-h-screen px-4 mt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600">Error: {error}</div>
          <button
            onClick={fetchUserAndStaff}
            className="mt-4 px-4 py-2 bg-accent text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-background min-h-screen px-4 mt-20">
      <main className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-32">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-secondary">
              Users
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto max-lg:block">
                <TableHeader
                  columns={[
                    'Name',
                    'Email',
                    'Latest Reservation',
                    'Desk',
                    'Desk Time',
                    'Sitting Time',
                    'Role',
                    'Actions'
                  ]}
                />
                <tbody className="max-lg:block divide-y divide-gray-100">
                  {users.length > 0 ? (
                    users.map((user) => <UserRow key={user.id} user={user} />)
                  ) : (
                    <EmptyState colSpan="8" message="No users found" />
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-secondary">
              Staff
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto max-lg:block">
                <TableHeader
                  columns={[
                    'Name',
                    'Email',
                    'Job Description',
                    'Role',
                    'Action'
                  ]}
                />
                <tbody className="max-lg:block divide-y divide-gray-100">
                  {staff.length > 0 ? (
                    staff.map((staffMember) => (
                      <StaffRow key={staffMember.id} staffMember={staffMember} />
                    ))
                  ) : (
                    <EmptyState colSpan="6" message="No staff found" />
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}