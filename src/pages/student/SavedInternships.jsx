// src/pages/student/SavedInternships.jsx
// Student's bookmarked internships with unsave capability.
// ✅ All sub-components at MODULE LEVEL

import { useState }      from 'react';
import { Link }          from 'react-router-dom';
import {
  HiBookmark, HiTrash, HiArrowRight,
  HiLocationMarker, HiClock, HiCurrencyDollar,
} from 'react-icons/hi';
import Layout            from '../../components/layout/Layout';
import { useAuth }       from '../../context/AuthContext';
import useStudentData    from '../../hooks/useStudentData';
import { unsaveInternship } from '../../firebase/firestore';
import { ROUTES }        from '../../utils/constants';
import toast             from 'react-hot-toast';
import clsx              from 'clsx';

// ─── Work type badge ──────────────────────────────────────────────────────────
const WorkBadge = ({ type }) => {
  const colors = {
    Remote:   'bg-green-100  dark:bg-green-900/30  text-green-700  dark:text-green-400',
    Hybrid:   'bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-400',
    'On-site':'bg-blue-100   dark:bg-blue-900/30   text-blue-700   dark:text-blue-400',
  };
  return (
    <span className={clsx(
      'px-2.5 py-0.5 rounded-full text-xs font-semibold',
      colors[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
    )}>
      {type}
    </span>
  );
};

// ─── Meta item ────────────────────────────────────────────────────────────────
const Meta = ({ icon, text }) => (
  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
    {icon}
    {text}
  </span>
);

// ─── Saved Card ───────────────────────────────────────────────────────────────
const SavedCard = ({ internship, onUnsave, removing }) => (
  <div className={clsx(
    'bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 transition-all duration-200',
    removing
      ? 'opacity-40 scale-95 pointer-events-none'
      : 'hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 hover:-translate-y-0.5'
  )}>
    {/* Header */}
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {internship.companyName?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <Link
            to={`/internships/${internship.id}`}
            className="text-sm font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors block truncate"
          >
            {internship.title}
          </Link>
          <p className="text-xs text-gray-400 truncate mt-0.5">{internship.companyName}</p>
        </div>
      </div>
      {/* Unsave button */}
      <button
        onClick={() => onUnsave(internship.savedDocId, internship.id)}
        className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
        title="Remove from saved"
      >
        <HiTrash className="h-4 w-4" />
      </button>
    </div>

    {/* Badges */}
    <div className="flex flex-wrap gap-1.5 mb-3">
      <WorkBadge type={internship.workType} />
      {internship.domain && (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
          {internship.domain}
        </span>
      )}
      {internship.isPaid && (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          Paid
        </span>
      )}
    </div>

    {/* Meta */}
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-4">
      <Meta
        icon={<HiLocationMarker className="h-3.5 w-3.5" />}
        text={internship.location || 'Remote'}
      />
      <Meta
        icon={<HiClock className="h-3.5 w-3.5" />}
        text={`${internship.duration} month${internship.duration > 1 ? 's' : ''}`}
      />
      <Meta
        icon={<HiCurrencyDollar className="h-3.5 w-3.5" />}
        text={internship.isPaid ? `₹${internship.stipend}/mo` : 'Unpaid'}
      />
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
      <div className="flex flex-wrap gap-1">
        {internship.skills?.slice(0, 2).map(s => (
          <span key={s} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded-md">
            {s}
          </span>
        ))}
      </div>
      <Link
        to={`/internships/${internship.id}`}
        className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
      >
        View <HiArrowRight className="h-3 w-3" />
      </Link>
    </div>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
    <div className="flex gap-2 mb-3">
      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
    <span className="text-5xl mb-4">🔖</span>
    <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-2">
      No saved internships
    </h3>
    <p className="text-sm text-gray-400 mb-6">
      Click the bookmark icon on any internship to save it here
    </p>
    <Link
      to={ROUTES.INTERNSHIPS}
      className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
    >
      Browse Internships
    </Link>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const SavedInternships = () => {
  const { currentUser } = useAuth();
  const { savedInternships, loading, refresh } = useStudentData(currentUser?.uid);
  const [removingIds, setRemovingIds] = useState(new Set());

  const handleUnsave = async (savedDocId, internshipId) => {
    setRemovingIds(prev => new Set(prev).add(internshipId));
    try {
      await unsaveInternship(savedDocId);
      toast.success('Removed from saved');
      refresh(); // re-fetch saved list
    } catch {
      toast.error('Failed to remove. Try again.');
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(internshipId);
        return next;
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HiBookmark className="h-6 w-6 text-primary-600" />
              Saved Internships
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {loading ? 'Loading...' : `${savedInternships.length} saved`}
            </p>
          </div>
          <Link
            to={ROUTES.INTERNSHIPS}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Browse More
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
          ) : savedInternships.length === 0 ? (
            <EmptyState />
          ) : (
            savedInternships.map(internship => (
              <SavedCard
                key={internship.id}
                internship={internship}
                onUnsave={handleUnsave}
                removing={removingIds.has(internship.id)}
              />
            ))
          )}
        </div>

      </div>
    </Layout>
  );
};

export default SavedInternships;