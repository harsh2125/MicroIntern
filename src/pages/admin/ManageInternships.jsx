// src/pages/admin/ManageInternships.jsx
// Admin: view all internships, search, filter by status, delete any listing.
// ✅ All sub-components at MODULE LEVEL

import { useState, useMemo } from 'react';
import { Link }              from 'react-router-dom';
import {
  HiBriefcase, HiSearch, HiTrash, HiEye,
  HiCheckCircle, HiBan, HiUsers,
} from 'react-icons/hi';
import Layout            from '../../components/layout/Layout';
import useAdminData      from '../../hooks/useAdminData';
import { deleteInternship } from '../../firebase/firestore';
import { formatDate, isExpired, timeAgo } from '../../utils/formatDate';
import toast             from 'react-hot-toast';
import clsx              from 'clsx';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status, deadline }) => {
  const expired = isExpired(deadline);
  if (status === 'closed' || expired) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
        <HiBan className="h-3 w-3" /> {expired ? 'Expired' : 'Closed'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
      <HiCheckCircle className="h-3 w-3" /> Active
    </span>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const ConfirmModal = ({ internship, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-sm w-full shadow-2xl">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
        <HiTrash className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Delete Internship?</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
        "<span className="font-medium text-gray-700 dark:text-gray-300">{internship?.title}</span>" will be permanently deleted.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading
            ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
            : <HiTrash className="h-4 w-4" />
          }
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Table Row Skeleton ───────────────────────────────────────────────────────
const RowSkeleton = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </td>
    ))}
  </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ManageInternships = () => {
  const { internships, loading, refresh } = useAdminData();

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return internships.filter(i => {
      const expired = isExpired(i.applicationDeadline);
      const isActive = i.status === 'active' && !expired;

      const matchStatus =
        statusFilter === 'all'    ? true :
        statusFilter === 'active' ? isActive :
        statusFilter === 'closed' ? (i.status === 'closed' || expired) : true;

      const matchSearch = !search || [i.title, i.companyName, i.domain, i.workType]
        .some(v => v?.toLowerCase().includes(search.toLowerCase()));

      return matchStatus && matchSearch;
    });
  }, [internships, statusFilter, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInternship(deleteTarget.id);
      toast.success('Internship deleted');
      refresh();
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete. Try again.');
    } finally {
      setDeleting(false);
    }
  };

  const counts = {
    all:    internships.length,
    active: internships.filter(i => i.status === 'active' && !isExpired(i.applicationDeadline)).length,
    closed: internships.filter(i => i.status === 'closed' || isExpired(i.applicationDeadline)).length,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HiBriefcase className="h-6 w-6 text-primary-600" />
            Manage Internships
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {internships.length} total listings · {counts.active} active
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, company, domain..."
              className="input pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {['all', 'active', 'closed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                  statusFilter === s
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                )}
              >
                {s} ({counts[s]})
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {['Internship', 'Domain', 'Deadline', 'Applicants', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  [...Array(5)].map((_, i) => <RowSkeleton key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <span className="text-4xl block mb-3">🔍</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">No internships match your filters</p>
                    </td>
                  </tr>
                ) : filtered.map(intern => (
                  <tr key={intern.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    {/* Title */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {intern.companyName?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[160px]">
                            {intern.title}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{intern.companyName}</p>
                        </div>
                      </div>
                    </td>
                    {/* Domain */}
                    <td className="px-4 py-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{intern.domain || '—'}</span>
                    </td>
                    {/* Deadline */}
                    <td className="px-4 py-4">
                      <span className={clsx(
                        'text-xs font-medium',
                        isExpired(intern.applicationDeadline) ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
                      )}>
                        {formatDate(intern.applicationDeadline)}
                      </span>
                    </td>
                    {/* Applicants */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                        <HiUsers className="h-3.5 w-3.5" />
                        {intern.applicantsCount || 0}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusBadge status={intern.status} deadline={intern.applicationDeadline} />
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/internships/${intern.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="View"
                        >
                          <HiEye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(intern)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              <p className="text-xs text-gray-400">
                Showing {filtered.length} of {internships.length} internships
              </p>
            </div>
          )}
        </div>

      </div>

      {deleteTarget && (
        <ConfirmModal
          internship={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </Layout>
  );
};

export default ManageInternships;