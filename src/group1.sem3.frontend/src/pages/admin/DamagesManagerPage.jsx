import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { get, put, del } from "../../context/apiClient";

export default function DamagesManagerPage() {
  const navigate = useNavigate();
  const [damages, setDamages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    fetchDamageReports();
  }, []);

  const fetchDamageReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const me = await get('/Users/me');

      if (!me?.companyMemberships || me.companyMemberships.length === 0) {
        throw new Error('No company associated with current user');
      }

      const userCompanyId = me.companyMemberships[0].companyId;
      setCompanyId(userCompanyId);

      const reports = await get(`/${userCompanyId}/DamageReport`);


      const reportsWithDesks = await Promise.all(
        (reports || []).map(async (report) => {
          let desk = null;
          let resolvedByUser = null;

          if (report.deskId) {
            try {
              desk = await get(`/${userCompanyId}/Desks/${report.deskId}`);
            } catch (error) {
              console.error(`Error fetching desk ${report.deskId}:`, error);
            }
          }

          if (report.resolvedById) {
            try {
              resolvedByUser = await get(`/Users/${report.resolvedById}`);
            } catch (error) {
              console.error(`Error fetching user ${report.resolvedById}:`, error);
            }
          }

          return { ...report, desk, resolvedByUser };
        })
      );

      setDamages(reportsWithDesks);
    } catch (error) {
      console.error('Error fetching damage reports:', error);
      setError(error.message);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        setTimeout(() => navigate('/'), 2000);
      }
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (isResolved) => {
    return isResolved ? 'text-success-600' : 'text-warning-600';
  }

  const getStatusText = (isResolved) => {
    return isResolved ? 'Resolved' : 'Open';
  };

  const handleResolveIssue = async (damageId) => {
    if (!confirm('Mark this damage report as resolved?')) {
      return;
    }

    try {
      await put(`/${companyId}/DamageReport/${damageId}`, true);
      await fetchDamageReports();
    } catch (error) {
      console.error('Error resolving damage report:', error);
      alert('Failed to resolve damage report: ' + error.message);
    }
  };

  const handleRemoveDamage = async (damageId) => {
    if (!confirm('Are you sure you want to remove this damage report?')) {
      return;
    }

    try {
      await del(`/${companyId}/DamageReport/${damageId}`);
      await fetchDamageReports();
    } catch (error) {
      console.error('Error removing damage report:', error);
      alert('Failed to remove damage report: ' + error.message);
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

  const DamageRow = ({ damage }) => (
    < tr key={damage.id} className="border-t last:border-b hover:bg-gray-50 transition-colors max-lg:flex max-lg:flex-wrap max-lg:border-b max-lg:py-2" >
      <td className="pl-4 pr-2 py-2 text-sm font-medium max-lg:w-3/4 max-lg:pl-2 max-lg:text-lg">
        {damage.desk?.readableId || damage.deskId || 'Unknown'}
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
        <button
          className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all max-lg:flex-[4]"
          disabled={damage.isResolved}
          onClick={() => handleResolveIssue(damage.id)}
          title="Mark as resolved"
        >
          Resolve
        </button>
        <button
          className="bg-danger-500 text-white lg:ml-2 px-3 py-1.5 rounded-lg text-xs hover:bg-danger-600 transition-all inline-flex items-center justify-center gap-1 max-lg:flex-1"
          onClick={() => handleRemoveDamage(damage.id)}
          title="Remove damage report"
        >
          <span className="material-symbols-outlined text-sm leading-none">delete</span>
          <span>Remove</span>
        </button>
      </td>
    </tr >
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
        <div className="text-center">
          <div className="text-lg text-red-600">Error: {error}</div>
          <button
            onClick={fetchDamageReports}
            className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-600"
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
              Reported malfunctions
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto max-lg:block">
                <TableHeader
                  columns={[
                    'Desk',
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
          </div>
        </section>
      </main>
    </div>
  );
}