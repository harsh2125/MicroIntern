// src/pages/admin/ManageUsers.jsx
// Admin: view all users, search, filter by role, block/unblock.
// ✅ All sub-components at MODULE LEVEL

import { useState, useMemo } from 'react';
import {
  HiUsers, HiSearch, HiShieldCheck, HiBan,
  HiCheckCircle, HiMail, HiAcademicCap, HiOfficeBuilding,
} from 'react-icons/hi';
import Layout            from '../../components/layout/Layout';
import useAdminData      from '../../hooks/useAdminData';
import { blockUser }     from '../../firebase/firestore';
import { timeAgo }       from '../../utils/formatDate';
import toast             from 'react-hot-toast';
import clsx              from 'clsx';

// ─── Role Badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    student: 'bg-blue-100   dark:bg-blue-900/30   text-blue-700   dark:text-blue-400',
    company: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    admin:   'bg-red-100    dark:bg-red-900/30    text-red-700    dark:text-red-400',
  };
  const icons = {
    student: <HiAcademicCap  className="h-3 w-3" />,
    company: <HiOfficeBuilding className="h-3 w-3" />,
    admin:   <HiShieldCheck  className="h-3 w-3" />,
  };
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
      styles[role] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'
    )}>
      {icons[role]} {role}
    </span>
  );
};

// ─── User Row ─────────────────────────────────────────────────────────────────
const UserRow = ({ user, onToggleBlock, blocking }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
    {/* Name + Email */}
    <td className="px-4 py-4">
      <div className="flex items-center gap-3">
        <div className={clsx(
          'w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
          user.isBlocked
            ? 'bg-gray-400 dark:bg-gray-600'
            : 'bg-gradient-to-br from-blue-400 to-blue-700'
        )}>
          {user.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <p className={clsx(
            'text-sm font-semibold truncate max-w-[160px]',
            user.isBlocked
              ? 'text-gray-400 dark:text-gray-500 line-through'
              : 'text-gray-900 dark:text-white'
          )}>
            {user.name || 'No name'}
          </p>
          <p className="text-xs text-gray-400 truncate max-w-[160px] flex items-center gap-1">
            <HiMail className="h-3 w-3 flex-shrink-0" />
            {user.email}
          </p>
        </div>
      </div>
    </td>
    {/* Role */}
    <td className="px-4 py-4">
      <RoleBadge role={user.role} />
    </td>
    {/* University / Company */}
    <td className="px-4 py-4">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {user.university || user.companyName || '—'}
      </span>
    </td>
    {/* Joined */}
    <td className="px-4 py-4">
      <span className="text-xs text-gray-400">
        {timeAgo(user.createdAt)}
      </span>
    </td>
    {/* Status */}
    <td className="px-4 py-4">
      {user.isBlocked ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
          <HiBan className="h-3 w-3" /> Blocked
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          <HiCheckCircle className="h-3 w-3" /> Active
        </span>
      )}
    </td>
    {/* Action */}
    <td className="px-4 py-4">
      {/* Don't allow blocking admin accounts */}
      {user.role !== 'admin' && (
        <button
          onClick={() => onToggleBlock(user)}
          disabled={blocking === user.id}
          className={clsx(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50',
            user.isBlocked
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'
              : 'bg-red-100   dark:bg-red-900/20   text-red-600   dark:text-red-400   hover:bg-red-200   dark:hover:bg-red-900/40'
          )}
        >
          {blocking === user.id ? (
            <span className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full inline-block" />
          ) : user.isBlocked ? (
            <><HiCheckCircle className="h-3.5 w-3.5" /> Unblock</>
          ) : (
            <><HiBan className="h-3.5 w-3.5" /> Block</>
          )}
        </button>
      )}
    </td>
  </tr>
);

// ─── Table Skeleton ───────────────────────────────────────────────────────────
const RowSkeleton = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      </td>
    ))}
  </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ManageUsers = () => {
  const { users, loading, refresh } = useAdminData();

  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [blocking,     setBlocking]     = useState(null); // userId being toggled

  // ── Derived: filtered + searched list ─────────────────────────────────────
  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchRole   = roleFilter   === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all'
        || (statusFilter === 'blocked' && u.isBlocked)
        || (statusFilter === 'active'  && !u.isBlocked);
      const matchSearch = !search || [u.name, u.email, u.university, u.companyName]
        .some(v => v?.toLowerCase().includes(search.toLowerCase()));
      return matchRole && matchStatus && matchSearch;
    });
  }, [users, roleFilter, statusFilter, search]);

  const handleToggleBlock = async (user) => {
    setBlocking(user.id);
    try {
      await blockUser(user.id, !user.isBlocked);
      toast.success(user.isBlocked ? `${user.name} unblocked` : `${user.name} blocked`);
      refresh();
    } catch {
      toast.error('Failed to update user status');
    } finally {
      setBlocking(null);
    }
  };

  // ── Counts for filter badges ───────────────────────────────────────────────
  const counts = {
    all:     users.length,
    student: users.filter(u => u.role === 'student').length,
    company: users.filter(u => u.role === 'company').length,
    admin:   users.filter(u => u.role === 'admin').length,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HiUsers className="h-6 w-6 text-primary-600" />
            Manage Users
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {users.length} total users · {users.filter(u => u.isBlocked).length} blocked
          </p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, university..."
              className="input pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          {/* Role Filter */}
          <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {['all', 'student', 'company', 'admin'].map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                  roleFilter === role
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                )}
              >
                {role} {counts[role] !== undefined && `(${counts[role]})`}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input w-auto dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="all">All status</option>
            <option value="active">Active only</option>
            <option value="blocked">Blocked only</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {['User', 'Role', 'Organization', 'Joined', 'Status', 'Action'].map(h => (
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">No users match your filters</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(user => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onToggleBlock={handleToggleBlock}
                      blocking={blocking}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {!loading && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              <p className="text-xs text-gray-400">
                Showing {filtered.length} of {users.length} users
              </p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default ManageUsers;