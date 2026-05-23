// src/pages/admin/AdminDashboard.jsx
// Admin overview: platform stats + recent users + recent internships.
// ✅ All sub-components at MODULE LEVEL

import { Link }          from 'react-router-dom';
import {
  HiUsers, HiBriefcase, HiDocumentText, HiShieldCheck,
  HiArrowRight, HiCheckCircle, HiBan, HiTrendingUp,
} from 'react-icons/hi';
import Layout            from '../../components/layout/Layout';
import useAdminData      from '../../hooks/useAdminData';
import { timeAgo }       from '../../utils/formatDate';
import clsx              from 'clsx';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color, to }) => {
  const content = (
    <div className={clsx(
      'bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4',
      to && 'hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all cursor-pointer'
    )}>
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
  return to ? <Link to={to}>{content}</Link> : content;
};

// ─── Role Badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    student: 'bg-blue-100   dark:bg-blue-900/30   text-blue-700   dark:text-blue-400',
    company: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    admin:   'bg-red-100    dark:bg-red-900/30    text-red-700    dark:text-red-400',
  };
  return (
    <span className={clsx(
      'px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
      styles[role] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'
    )}>
      {role}
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
        <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
    </div>
  </Layout>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { users, internships, applications, loading } = useAdminData();

  if (loading) return <DashboardSkeleton />;

  // ── Derived stats ──────────────────────────────────────────────────────────
  const students        = users.filter(u => u.role === 'student');
  const companies       = users.filter(u => u.role === 'company');
  const blockedUsers    = users.filter(u => u.isBlocked);
  const activeInternships = internships.filter(i => i.status === 'active');

  // 6 most recent of each
  const recentUsers     = users.slice(0, 6);
  const recentInterns   = internships.slice(0, 6);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HiShieldCheck className="h-6 w-6 text-primary-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Platform overview and management
            </p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<HiUsers className="h-5 w-5 text-blue-600" />}
            color="bg-blue-50 dark:bg-blue-900/20"
            label="Total Users"
            value={users.length}
            sub={`${students.length} students · ${companies.length} companies`}
            to="/admin/users"
          />
          <StatCard
            icon={<HiBriefcase className="h-5 w-5 text-primary-600" />}
            color="bg-primary-50 dark:bg-primary-900/20"
            label="Internships"
            value={internships.length}
            sub={`${activeInternships.length} active`}
            to="/admin/internships"
          />
          <StatCard
            icon={<HiDocumentText className="h-5 w-5 text-amber-600" />}
            color="bg-amber-50 dark:bg-amber-900/20"
            label="Applications"
            value={applications.length}
          />
          <StatCard
            icon={<HiBan className="h-5 w-5 text-red-600" />}
            color="bg-red-50 dark:bg-red-900/20"
            label="Blocked Users"
            value={blockedUsers.length}
            to="/admin/users"
          />
        </div>

        {/* ── Recent Activity Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Users */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HiUsers className="h-4 w-4 text-primary-600" />
                Recent Users
              </h2>
              <Link
                to="/admin/users"
                className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                Manage all →
              </Link>
            </div>
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No users yet</p>
              ) : recentUsers.map(user => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user.name || 'Unknown'}
                      {user.isBlocked && (
                        <span className="ml-1.5 text-xs text-red-500">(blocked)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RoleBadge role={user.role} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Internships */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HiBriefcase className="h-4 w-4 text-primary-600" />
                Recent Internships
              </h2>
              <Link
                to="/admin/internships"
                className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                Manage all →
              </Link>
            </div>
            <div className="space-y-3">
              {recentInterns.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No internships yet</p>
              ) : recentInterns.map(intern => (
                <Link
                  key={intern.id}
                  to={`/internships/${intern.id}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {intern.companyName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {intern.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {intern.companyName} · {timeAgo(intern.createdAt)}
                    </p>
                  </div>
                  <span className={clsx(
                    'px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0',
                    intern.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  )}>
                    {intern.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Stats Bar ── */}
        <div className="bg-gradient-to-r from-primary-600 to-teal-500 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <HiTrendingUp className="h-5 w-5" />
            Platform at a glance
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Student accounts',  value: students.length },
              { label: 'Company accounts',  value: companies.length },
              { label: 'Active listings',   value: activeInternships.length },
              { label: 'Total applications',value: applications.length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-primary-100 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default AdminDashboard;