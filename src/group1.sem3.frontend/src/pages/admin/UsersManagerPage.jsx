import { useState } from "react";
import mockData from '../../assets/admin/UserMockData.json'

export default function UsersManagerPage() {
  const users = mockData?.Users || []
  const staff = mockData?.Staff || []

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

  const handleCancelBooking = (userId) => {
    console.log('Cancel booking for', userId);
    // TODO: Implement API call
  };

  const handleRemoveUSer = (userId) => {
    console.log('Remove User for', userId);
    // TODO: Implement API call
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

  const UserRow = ({ user }) => (
    <tr key={user.id} className="border-t last:border-b hover:bg-gray-50 transition-colors max-lg:flex max-lg:flex-wrap max-lg:border-b max-lg:py-2">
      <td className="px-4 py-2 text-sm font-medium max-lg:w-7/8 max-lg:pl-2 max-lg:text-lg">
        {user.Name}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 max-lg:w-full max-lg:py-1">
        {user.Email}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Current Booked</MobileLabel>
        <span className={user.CurrentBooked ? "text-gray-600 font-medium" : "text-gray-400"}>
          {user.CurrentBooked ?? '-'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Last Booked</MobileLabel>
        {formatDate(user.LastBook)}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Desk Time</MobileLabel>
        {user.DeskTime ?? '-'}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Sitting Time</MobileLabel>
        {user.SittingTime ?? '-'}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:flex max-lg:flex-row max-lg:gap-2 max-lg:mt-2">
        <button
          className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all max-lg:flex-[4]"
          disabled={!user.CurrentBooked}
          onClick={() => handleCancelBooking(user.id)}
          title={!user.CurrentBooked ? "No active booking" : "Cancel booking"}
        >
          Cancel Booking
        </button>
        <button
          className="bg-danger-500 text-white lg:ml-2 px-3 py-1.5 rounded-lg text-xs hover:bg-danger-600 transition-all inline-flex items-center justify-center gap-1 max-lg:flex-1"
          onClick={() => handleRemoveUser(user.id, 'user')}
          title="Remove user account"
        >
          <span className="material-symbols-outlined text-sm leading-none">delete</span>
          <span>Remove</span>
        </button>
      </td>
    </tr>
  );

  const StaffRow = ({ staffMember }) => (
    <tr key={staffMember.id} className="border-t last:border-b hover:bg-gray-50 transition-colors max-lg:flex max-lg:flex-wrap max-lg:border-b max-lg:py-2">
      <td className="px-4 py-2 text-sm font-medium max-lg:w-7/8 max-lg:pl-2 max-lg:text-lg">
        {staffMember.Name}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 max-lg:w-full max-lg:py-1">
        {staffMember.Email}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 max-lg:w-full max-lg:py-1">
        <MobileLabel>Job Description</MobileLabel>
        {staffMember.JobDescription}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <details className="cursor-pointer group">
          <summary className="text-sm font-medium text-gray-600 hover:text-gray-700 list-none max-lg:font-semibold">
            <span className="inline-flex items-center gap-1">
              View schedule
              <span className="material-symbols-outlined text-base group-open:rotate-180 transition-transform">
                expand_more
              </span>
            </span>
          </summary>
          <div className="mt-2 text-xs space-y-1 pl-4 border-l-2 border-gray-200">
            {staffMember.WorkingSchedule ? (
              Object.entries(staffMember.WorkingSchedule).map(([day, time]) => (
                <div key={day} className="flex gap-2">
                  <span className="font-medium text-gray-700 min-w-[60px]">{day}:</span>
                  <span className="text-gray-600">{time}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-400">No schedule available</div>
            )}
          </div>
        </details>
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:mt-2">
        <button
          className="bg-danger-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-danger-600 transition-all inline-flex items-center gap-1"
          onClick={() => handleRemoveUser(staffMember.id, 'staff')}
          title="Remove staff account"
        >
          <span className="material-symbols-outlined text-sm leading-none">delete</span>
          <span className="inline">Remove</span>
        </button>
      </td>
    </tr>
  );


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
                    'Current Booked',
                    'Last Book',
                    'Desk Time',
                    'Sitting Time',
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
                    'Working Schedule',
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