// src/pages/student/MyApplications.jsx
// Full applications list with status filter tabs and detail view.
// ✅ All sub-components at MODULE LEVEL

import { useState }      from 'react';
import { Link }          from 'react-router-dom';
import {
  HiBriefcase, HiArrowRight, HiClock,
  HiCheckCircle, HiXCircle, HiFilter,
} from 'react-icons/hi';
import Layout            from '../../components/layout/Layout';
import { useAuth }       from '../../context/AuthContext';
import useStudentData    from '../../hooks/useStudentData';
import { timeAgo, formatDate } from '../../utils/formatDate';
import { ROUTES }        from '../../utils/constants';
import clsx              from 'clsx';

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  all:         { label: 'All',         color: '' },
  pending:     { label: 'Pending',     color: 'bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-400',  icon: <HiClock      className="h-3.5 w-3.5" /> },
  shortlisted: { label: 'Shortlisted', color: 'bg-blue-100   dark:bg-blue-900/30   text-blue-700   dark:text-blue-400',   icon: <HiFilter     className="h-3.5 w-3.5" /> },
  accepted:    { label: 'Accepted',    color: 'bg-green-100  dark:bg-green-900/30  text-green-700  dark:text-green-400',  icon: <HiCheckCircle className="h-3.5 w-3.5" /> },
  rejected:    { label: 'Rejected',    color: 'bg-red-100    dark:bg-red-900/30    text-red-600    dark:text-red-400',    icon: <HiXCircle    className="h-3.5 w-3.5" /> },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
      cfg.color
    )}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// ─── Application Row ──────────────────────────────────────────────────────────
const ApplicationRow = ({ app, internship }) => (
  <Link
    to={`/internships/${app.internshipId}`}
    className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200"
  >
    {/* Company Avatar */}
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
      {internship.companyName?.[0]?.toUpperCase()}
    </div>

    {/* Main Info */}
    <div className="flex-1 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {internship.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {internship.companyName}
            {internship.workType && ` · ${internship.workType}`}
            {internship.isPaid && ` · ₹${internship.stipend}/mo`}
          </p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <HiClock className="h-3 w-3" />
          Applied {timeAgo(app.appliedAt)}
        </span>
        <span className="text-xs text-gray-400">
          Deadline: {formatDate(internship.applicationDeadline)}
        </span>
        {internship.duration && (
          <span className="text-xs text-gray-400">
            {internship.duration} month{internship.duration > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>

    {/* Arrow */}
    <HiArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors flex-shrink-0 hidden sm:block" />
  </Link>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const RowSkeleton = () => (
  <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
    </div>
    <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ filter }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <span className="text-5xl mb-4">
      {filter === 'all' ? '📭' : filter === 'accepted' ? '🎉' : filter === 'rejected' ? '😔' : '⏳'}
    </span>
    <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-2">
      {filter === 'all'
        ? 'No applications yet'
        : `No ${STATUS_CONFIG[filter]?.label.toLowerCase()} applications`}
    </h3>
    <p className="text-sm text-gray-400 mb-6">
      {filter === 'all'
        ? 'Start applying to internships to track them here'
        : 'Applications with this status will appear here'}
    </p>
    {filter === 'all' && (
      <Link
        to={ROUTES.INTERNSHIPS}
        className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Browse Internships
      </Link>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const MyApplications = () => {
  const { currentUser } = useAuth();
  const { applications, appInternships, loading } = useStudentData(currentUser?.uid);

  const [activeFilter, setActiveFilter] = useState('all');

  const TABS = ['all', 'pending', 'shortlisted', 'accepted', 'rejected'];

  // Count per status
  const counts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'all'
      ? applications.length
      : applications.filter(a => a.status === tab).length;
    return acc;
  }, {});

  // Filter applications
  const filtered = activeFilter === 'all'
    ? applications
    : applications.filter(a => a.status === activeFilter);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HiBriefcase className="h-6 w-6 text-primary-600" />
              My Applications
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {applications.length} total application{applications.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to={ROUTES.INTERNSHIPS}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            + Apply More
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 flex-wrap mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                activeFilter === tab
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {STATUS_CONFIG[tab]?.label}
              {counts[tab] > 0 && (
                <span className={clsx(
                  'px-1.5 py-0.5 rounded-full text-xs font-bold',
                  activeFilter === tab
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                )}>
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            [...Array(4)].map((_, i) => <RowSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <EmptyState filter={activeFilter} />
          ) : (
            filtered.map(app => {
              const internship = appInternships[app.internshipId];
              if (!internship) return null;
              return (
                <ApplicationRow
                  key={app.id}
                  app={app}
                  internship={internship}
                />
              );
            })
          )}
        </div>

      </div>
    </Layout>
  );
};

export default MyApplications;