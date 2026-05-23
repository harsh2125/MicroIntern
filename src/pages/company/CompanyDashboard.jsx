// src/pages/company/CompanyDashboard.jsx
import { useState }      from 'react';
import { Link }          from 'react-router-dom';
import {
  HiBriefcase, HiUsers, HiEye, HiPencil,
  HiTrash, HiPlus, HiCheckCircle,
  HiXCircle, HiBan,
} from 'react-icons/hi';
import Layout            from '../../components/layout/Layout';
import { useAuth }       from '../../context/AuthContext';
import useCompanyData    from '../../hooks/useCompanyData';
import { deleteInternship, closeInternship } from '../../firebase/firestore';
import { seedInternships } from '../../utils/seedData';
import { formatDate, isExpired } from '../../utils/formatDate';
import toast             from 'react-hot-toast';
import clsx              from 'clsx';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status, deadline }) => {
  if (status === 'closed' || isExpired(deadline)) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
        <HiBan className="h-3 w-3" /> Closed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
      <HiCheckCircle className="h-3 w-3" /> Active
    </span>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
    <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </div>
);

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
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
          {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" /> : <HiTrash className="h-4 w-4" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Table Row Skeleton ───────────────────────────────────────────────────────
const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" /></td>
    ))}
  </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CompanyDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const { internships, loading, refresh } = useCompanyData(currentUser?.uid);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [seeding,      setSeeding]      = useState(false);

  const totalListings   = internships.length;
  const activeListings  = internships.filter(i => i.status === 'active' && !isExpired(i.applicationDeadline)).length;
  const totalApplicants = internships.reduce((sum, i) => sum + (i.applicantsCount || 0), 0);
  const closedListings  = totalListings - activeListings;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInternship(deleteTarget.id);
      toast.success('Internship deleted');
      refresh();
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete.');
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = async (id, title) => {
    try {
      await closeInternship(id);
      toast.success(`"${title}" closed`);
      refresh();
    } catch {
      toast.error('Failed to close.');
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedInternships(currentUser?.uid);
      toast.success('10 fake internships added!');
      refresh();
    } catch {
      toast.error('Seeding failed.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {userProfile?.companyName || userProfile?.name} · Manage your listings
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl transition-colors disabled:opacity-60"
            >
              {seeding ? 'Seeding...' : '🌱 Seed Fake Data'}
            </button>
            <Link
              to="/company/post-internship"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
            >
              <HiPlus className="h-4 w-4" /> Post New Internship
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<HiBriefcase className="h-5 w-5 text-primary-600" />} color="bg-primary-50 dark:bg-primary-900/20" label="Total Listings" value={totalListings} />
          <StatCard icon={<HiCheckCircle className="h-5 w-5 text-green-600" />} color="bg-green-50 dark:bg-green-900/20" label="Active" value={activeListings} />
          <StatCard icon={<HiUsers className="h-5 w-5 text-blue-600" />} color="bg-blue-50 dark:bg-blue-900/20" label="Total Applicants" value={totalApplicants} />
          <StatCard icon={<HiXCircle className="h-5 w-5 text-gray-500" />} color="bg-gray-100 dark:bg-gray-800" label="Closed" value={closedListings} />
        </div>

        {/* Listings Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HiBriefcase className="h-4 w-4 text-primary-600" /> Your Internship Listings
            </h2>
            <span className="text-xs text-gray-400">{totalListings} listing{totalListings !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="overflow-x-auto"><table className="w-full"><tbody>{[...Array(3)].map((_, i) => <TableRowSkeleton key={i} />)}</tbody></table></div>
          ) : internships.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <span className="text-5xl mb-4">📋</span>
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-2">No internships posted yet</h3>
              <p className="text-sm text-gray-400 mb-6">Post your first internship or seed fake data to get started</p>
              <div className="flex gap-3">
                <button onClick={handleSeed} disabled={seeding} className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
                  {seeding ? 'Seeding...' : '🌱 Seed Fake Data'}
                </button>
                <Link to="/company/post-internship" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors">
                  Post First Internship
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    {['Role', 'Domain', 'Deadline', 'Applicants', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {internships.map(internship => (
                    <tr key={internship.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {internship.companyName?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[160px]">{internship.title}</p>
                            <p className="text-xs text-gray-400">{internship.workType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4"><span className="text-xs font-medium text-gray-600 dark:text-gray-400">{internship.domain || '—'}</span></td>
                      <td className="px-4 py-4">
                        <span className={clsx('text-xs font-medium', isExpired(internship.applicationDeadline) ? 'text-red-500' : 'text-gray-600 dark:text-gray-400')}>
                          {formatDate(internship.applicationDeadline)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Link to={`/company/applicants/${internship.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                          <HiUsers className="h-3.5 w-3.5" /> {internship.applicantsCount || 0} applicants
                        </Link>
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={internship.status} deadline={internship.applicationDeadline} /></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <Link to={`/internships/${internship.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="View">
                            <HiEye className="h-4 w-4" />
                          </Link>
                          <Link to={`/company/edit-internship/${internship.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Edit">
                            <HiPencil className="h-4 w-4" />
                          </Link>
                          {internship.status === 'active' && !isExpired(internship.applicationDeadline) && (
                            <button onClick={() => handleClose(internship.id, internship.title)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Close applications">
                              <HiBan className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => setDeleteTarget(internship)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmModal internship={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />
      )}
    </Layout>
  );
};

export default CompanyDashboard;