import { useState } from "react";
import mockData from '../../assets/admin/DamagesMockData.json'

export default function DamagesManagerPage() {
  const damages = mockData?.Damages || []

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
        return 'text-warning-600';
      case 'resolved':
        return 'text-success-600';
      case 'pending':
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'in_progress':
        return 'In progress';
      case 'resolved':
        return 'Resolved';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const handleIssue = (damageId) => {
    console.log('Handling issue ', damageId);
    // TODO: Implement API call
  };

  const handleRemoveDamage = (damageId) => {
    console.log('Remove damage for', damageId);
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

  const DamageRow = ({ damage }) => (
    <tr key={damage.id} className="border-t last:border-b hover:bg-gray-50 transition-colors max-lg:flex max-lg:flex-wrap max-lg:border-b max-lg:py-2">
      <td className="px-4 py-2 text-sm font-medium max-lg:w-7/8 max-lg:pl-2 max-lg:text-lg">
        {damage.deskName}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Room</MobileLabel>
        {damage.roomName}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Issue</MobileLabel>
        {damage.issue}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Description</MobileLabel>
        {damage.description}
      </td>
      {/* <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <details className="cursor-pointer group">
          <summary className="text-sm font-medium text-gray-600 hover:text-gray-700 list-none max-lg:font-semibold">
            <span className="inline-flex items-center gap-1">
              View description
              <span className="material-symbols-outlined text-base group-open:rotate-180 transition-transform">
                expand_more
              </span>
            </span>
          </summary>
          <div className="mt-2 text-xs space-y-1 pl-4 border-l-2 border-gray-200">
            {damage.description ? damage.description : (
              <div className="text-gray-400">No description available</div>
            )}
          </div>
        </details>
      </td> */}
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Reported by</MobileLabel>
        {damage.reportedBy}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Date</MobileLabel>
        {formatDate(damage.date)}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full">
        <span className="font-semibold lg:hidden">Status: </span>
        <span className={`font-medium ${getStatusColor(damage.status)}`}>
          {getStatusText(damage.status)}
        </span>
      </td>
      <td className="px-4 py-3 text-sm w-full flex flex-row gap-2 mt-2">
        <button
          className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all max-lg:flex-[4]"
          disabled={damage.status != "pending"}
          onClick={() => handleIssue(damage.id)}
          title={"Open issue"}
        >
          Open
        </button>
        <button
          className="bg-accent text-white lg:ml-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all max-lg:flex-[4]"
          disabled={damage.status != "in_progress"}
          onClick={() => handleIssue(damage.id)}
          title={"Close issue"}
        >
          Close
        </button>
        <button
          className="bg-danger-500 text-white lg:ml-2 px-3 py-1.5 rounded-lg text-xs hover:bg-danger-600 transition-all inline-flex items-center justify-center gap-1 max-lg:flex-1"
          onClick={() => handleRemoveDamage(damage.id, 'damage')}
          title="Remove issue"
        >
          <span className="material-symbols-outlined text-sm leading-none">delete</span>
          <span>Remove</span>
        </button>
      </td>
    </tr >
  );

  return (
    <div className="relative bg-background min-h-screen px-4 mt-20">
      <main className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-32">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-secondary">
              Reported malfunctions
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto max-lg:block">
                <TableHeader
                  columns={[
                    'Desk',
                    'Room',
                    'Issue',
                    'Description',
                    'Reported by',
                    'Date',
                    'Status',
                    'Actions'
                  ]}
                />
                <tbody className="max-lg:block divide-y divide-gray-100">
                  {damages.length > 0 ? (
                    damages.map((damage) => <DamageRow key={damage.id} damage={damage} />)
                  ) : (
                    <EmptyState colSpan="8" message="No damages found" />
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