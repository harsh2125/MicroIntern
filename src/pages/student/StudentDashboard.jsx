// src/pages/student/StudentDashboard.jsx
// Main student overview: stats, recent applications, quick actions.
// ✅ All sub-components at MODULE LEVEL

import { Link }          from 'react-router-dom';
import {
  HiBriefcase, HiBookmark, HiCheckCircle, HiClock,
  HiArrowRight, HiUser, HiSearch, HiTrendingUp,
} from 'react-icons/hi';
import Layout            from '../../components/layout/Layout';
import { useAuth }       from '../../context/AuthContext';
import useStudentData    from '../../hooks/useStudentData';
import { timeAgo, formatDate } from '../../utils/formatDate';
import { ROUTES }        from '../../utils/constants';
import clsx              from 'clsx';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-400'  },
  shortlisted: { label: 'Shortlisted', color: 'bg-blue-100   dark:bg-blue-900/30   text-blue-700   dark:text-blue-400'   },
  accepted:    { label: 'Accepted',    color: 'bg-green-100  dark:bg-green-900/30  text-green-700  dark:text-green-400'  },
  rejected:    { label: 'Rejected',    color: 'bg-red-100    dark:bg-red-900/30    text-red-600    dark:text-red-400'    },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
    <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
      cfg.color
    )}>
      {cfg.label}
    </span>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const DashboardSkeleton = () => (
  <Layout>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
    </div>
  </Layout>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyCard = ({ emoji, title, sub, linkTo, linkLabel }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <span className="text-4xl mb-3">{emoji}</span>
    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</p>
    <p className="text-xs text-gray-400 mb-4">{sub}</p>
    {linkTo && (
      <Link
        to={linkTo}
        className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
      >
        {linkLabel} <HiArrowRight className="h-3 w-3" />
      </Link>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const {
    applications, savedInternships, appInternships, loading,
  } = useStudentData(currentUser?.uid);

  if (loading) return <DashboardSkeleton />;

  // ── Derived stats ──────────────────────────────────────────────────────────
  const total       = applications.length;
  const pending     = applications.filter(a => a.status === 'pending').length;
  const shortlisted = applications.filter(a => a.status === 'shortlisted').length;
  const accepted    = applications.filter(a => a.status === 'accepted').length;

  // 5 most recent applications for the preview list
  const recentApps = applications.slice(0, 5);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {userProfile?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {userProfile?.university && `${userProfile.university} · `}
              Here's your internship activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.INTERNSHIPS}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <HiSearch className="h-4 w-4" />
              Browse Internships
            </Link>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<HiBriefcase className="h-5 w-5 text-primary-600" />}
            color="bg-primary-50 dark:bg-primary-900/20"
            label="Total Applied"
            value={total}
          />
          <StatCard
            icon={<HiClock className="h-5 w-5 text-amber-600" />}
            color="bg-amber-50 dark:bg-amber-900/20"
            label="Pending"
            value={pending}
          />
          <StatCard
            icon={<HiTrendingUp className="h-5 w-5 text-blue-600" />}
            color="bg-blue-50 dark:bg-blue-900/20"
            label="Shortlisted"
            value={shortlisted}
          />
          <StatCard
            icon={<HiCheckCircle className="h-5 w-5 text-green-600" />}
            color="bg-green-50 dark:bg-green-900/20"
            label="Accepted"
            value={accepted}
          />
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Applications */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HiBriefcase className="h-4 w-4 text-primary-600" />
                Recent Applications
              </h2>
              <Link
                to={ROUTES.STUDENT_APPLICATIONS}
                className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                View all →
              </Link>
            </div>

            {recentApps.length === 0 ? (
              <EmptyCard
                emoji="📭"
                title="No applications yet"
                sub="Start applying to internships that match your skills"
                linkTo={ROUTES.INTERNSHIPS}
                linkLabel="Browse internships"
              />
            ) : (
              <div className="space-y-3">
                {recentApps.map(app => {
                  const internship = appInternships[app.internshipId];
                  if (!internship) return null;
                  return (
                    <Link
                      key={app.id}
                      to={`/internships/${app.internshipId}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {internship.companyName?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {internship.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {internship.companyName} · {timeAgo(app.appliedAt)}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Saved Internships Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HiBookmark className="h-4 w-4 text-primary-600" />
                Saved Internships
              </h2>
              <Link
                to={ROUTES.STUDENT_SAVED}
                className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                View all →
              </Link>
            </div>

            {savedInternships.length === 0 ? (
              <EmptyCard
                emoji="🔖"
                title="Nothing saved yet"
                sub="Bookmark internships you're interested in to review later"
                linkTo={ROUTES.INTERNSHIPS}
                linkLabel="Explore internships"
              />
            ) : (
              <div className="space-y-3">
                {savedInternships.slice(0, 5).map(internship => (
                  <Link
                    key={internship.id}
                    to={`/internships/${internship.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {internship.companyName?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {internship.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {internship.companyName} · {internship.workType}
                        {internship.isPaid && ` · ₹${internship.stipend}/mo`}
                      </p>
                    </div>
                    <HiArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Profile Completion Card ── */}
        <ProfileCard userProfile={userProfile} />

      </div>
    </Layout>
  );
};

// ─── Profile Completion Card ──────────────────────────────────────────────────
// Defined at module level (after main component is fine — hoisting doesn't apply
// to const, but it's the same file so it's in scope)
const ProfileCard = ({ userProfile }) => {
  const fields = [
    { label: 'Full Name',   done: !!userProfile?.name },
    { label: 'University',  done: !!userProfile?.university },
    { label: 'Photo',       done: !!userProfile?.photoURL },
    { label: 'Resume',      done: !!userProfile?.resumeUrl },
  ];
  const completed = fields.filter(f => f.done).length;
  const pct = Math.round((completed / fields.length) * 100);

  if (pct === 100) return null; // hide when profile is complete

  return (
    <div className="bg-gradient-to-r from-primary-600 to-teal-500 rounded-2xl p-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
            <HiUser className="h-5 w-5" />
            Complete your profile — {pct}% done
          </h3>
          <p className="text-primary-100 text-sm mb-4">
            A complete profile gets 3× more responses from companies.
          </p>
          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-3">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {/* Checklist */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {fields.map(({ label, done }) => (
              <span key={label} className={clsx(
                'text-xs flex items-center gap-1',
                done ? 'text-white' : 'text-primary-200'
              )}>
                {done ? '✓' : '○'} {label}
              </span>
            ))}
          </div>
        </div>
        <Link
          to="/student/profile"
          className="flex-shrink-0 px-5 py-2.5 bg-white text-primary-700 font-bold text-sm rounded-xl hover:bg-primary-50 transition-colors"
        >
          Complete Profile
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;