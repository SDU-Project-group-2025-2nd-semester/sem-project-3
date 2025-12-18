import { useUsersManager } from "../hooks/useUsersManager";
import Card from "@shared/ui/Card";
import Button from "@shared/ui/Button";
import NotificationBanner from "@shared/ui/NotificationBanner";

export default function UsersManagerPage() {
  const {
    users,
    staff,
    loading,
    error,
    fetchUserAndStaff,
    getLatestReservation,
    formatDate,
    handleCancelReservation,
    handleRemoveUser,
    me,
  } = useUsersManager();

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
      const hours = Math.floor(durationMs / (1000 *60 *60));
      const minutes = Math.floor((durationMs % (1000 *60 *60)) / (1000 *60));
      return hours >0 ? `${hours}h ${minutes}m` : `${minutes}m`;
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
          <MobileLabel>Actions</MobileLabel>
          <div className="flex gap-2">
            <Button
              variant="primary"
              disabled={!latestReservation || new Date(latestReservation.end) < new Date()}
              onClick={() => handleCancelReservation(user.id)}
              className="px-3 py-1.5 text-xs"
              title={latestReservation && new Date(latestReservation.end) >= new Date() ? "Cancel reservation" : "No active reservation"}
            >
              Cancel Reservation
            </Button>
            <Button
              variant="danger"
              onClick={() => handleRemoveUser(user.id)}
              className="px-3 py-1.5 text-xs inline-flex items-center justify-center gap-1"
              title="Remove user account"
            >
              <span className="material-symbols-outlined text-sm leading-none">delete</span>
              <span>Remove</span>
            </Button>
          </div>
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
        {staffMember.role ===1 ? 'Janitor' : staffMember.role ===2 ? 'Admin' : 'Staff'}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:mt-2">
        <Button
          variant="danger"
          onClick={() => handleRemoveUser(staffMember.id, 'staff')}
          className="px-3 py-1.5 text-xs inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Remove staff account"
          disabled={staffMember?.id === me?.id}
        >
          <span className="material-symbols-outlined text-sm leading-none">delete</span>
          <span className="inline">Remove</span>
        </Button>
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
        <div className="w-full max-w-md">
          <NotificationBanner type="error">{String(error)}</NotificationBanner>
          <div className="mt-4 text-center">
            <Button onClick={fetchUserAndStaff} variant="primary">Retry</Button>
          </div>
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
          <Card>
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
                    'Actions'
                  ]}
                />
                <tbody className="max-lg:block divide-y divide-gray-100">
                  {users.length >0 ? (
                    users.map((user) => <UserRow key={user.id} user={user} />)
                  ) : (
                    <EmptyState colSpan="8" message="No users found" />
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-secondary">
              Staff
            </h2>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto max-lg:block">
                <TableHeader
                  columns={[
                    'Name',
                    'Email',
                    'Job Description',
                    // 'Working Schedule',
                    'Action'
                  ]}
                />
                <tbody className="max-lg:block divide-y divide-gray-100">
                  {staff.length >0 ? (
                    staff.map((staffMember) => (
                      <StaffRow key={staffMember.id} staffMember={staffMember} />
                    ))
                  ) : (
                    <EmptyState colSpan="6" message="No staff found" />
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}