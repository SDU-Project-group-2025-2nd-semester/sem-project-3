import { useDamagesManager } from "../hooks/useDamagesManager";
import Card from "@shared/ui/Card";
import Button from "@shared/ui/Button";
import NotificationBanner from "@shared/ui/NotificationBanner";

export default function DamagesManagerPage() {
  const {
    damages,
    loading,
    error,
    formatDate,
    getStatusColor,
    getStatusText,
    handleResolveIssue,
    handleRemoveDamage,
    fetchDamageReports,
  } = useDamagesManager();

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
      <td className="pl-4 pr-2 py-2 text-sm font-medium max-lg:w-3/4 max-lg:pl-2 max-lg:text-lg">
        {damage.desk?.readableId || damage.deskId || 'Unknown'}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Issue</MobileLabel>
        {damage.issue || 'No issue'}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Description</MobileLabel>
        {damage.description || 'No description'}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Submitted</MobileLabel>
        {formatDate(damage.submitTime)}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Resolved</MobileLabel>
        {damage.resolveTime ? formatDate(damage.resolveTime) : '-'}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full max-lg:py-1">
        <MobileLabel>Resolved By</MobileLabel>
        {damage.resolvedByUser ? `${damage.resolvedByUser.firstName} ${damage.resolvedByUser.lastName}` : '-'}
      </td>
      <td className="px-4 py-3 text-sm max-lg:w-full">
        <span className="font-semibold lg:hidden">Status: </span>
        <span className={`font-medium ${getStatusColor(damage.isResolved)}`}>
          {getStatusText(damage.isResolved)}
        </span>
      </td>
      <td className="px-4 py-3 text-sm w-full flex flex-row gap-2 mt-2">
        <Button
          variant="primary"
          disabled={damage.isResolved}
          onClick={() => handleResolveIssue(damage.id)}
          className="px-3 py-1.5 text-xs"
          title="Mark as resolved"
        >
          Resolve
        </Button>
        <Button
          variant="danger"
          onClick={() => handleRemoveDamage(damage.id)}
          className="px-3 py-1.5 text-xs inline-flex items-center justify-center gap-1"
          title="Remove damage report"
        >
          <span className="material-symbols-outlined text-sm leading-none">delete</span>
          <span>Remove</span>
        </Button>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="relative bg-background min-h-screen px-4 mt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading damage reports...</div>
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
            <Button onClick={fetchDamageReports} variant="primary">Retry</Button>
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
              Reported Damages
            </h2>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto max-lg:block">
                <TableHeader
                  columns={[
                    'Desk',
                    'Issue',
                    'Description',
                    'Submitted',
                    'Resolved',
                    'Resolved By',
                    'Status',
                    'Actions'
                  ]}
                />
                <tbody className="max-lg:block divide-y divide-gray-100">
                  {damages.length > 0 ? (
                    damages.map((damage) => <DamageRow key={damage.id} damage={damage} />)
                  ) : (
                    <EmptyState colSpan="7" message="No damage reports found" />
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