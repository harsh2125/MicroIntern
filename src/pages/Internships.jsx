// src/pages/Internships.jsx
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db }         from '../firebase/config';
import Layout         from '../components/layout/Layout';
import InternshipGrid from '../components/internship/InternshipGrid';
import { HiSearch, HiFilter, HiX, HiAdjustments } from 'react-icons/hi';
import toast          from 'react-hot-toast';
import clsx           from 'clsx';
import { CATEGORIES, WORK_MODES } from '../utils/constants';

const DEFAULT_FILTERS = {
  search: '', domain: '', workType: '', duration: '', isPaid: '',
};

// ─── Filter Pill ──────────────────────────────────────────────────────────────
const FilterPill = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full">
    {label}
    <button onClick={onRemove} className="hover:text-red-500 transition-colors">
      <HiX className="h-3 w-3" />
    </button>
  </span>
);

// ─── Filter Section label ─────────────────────────────────────────────────────
const FilterSectionLabel = ({ title }) => (
  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
    {title}
  </p>
);

// ─── Radio Option ─────────────────────────────────────────────────────────────
const RadioOption = ({ name, value, label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange(name, value)}
      className="accent-primary-600 w-3.5 h-3.5"
    />
    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
      {label}
    </span>
  </label>
);

// ─── Filter Panel ─────────────────────────────────────────────────────────────
const FilterPanel = ({ filters, onChange, onReset, resultCount }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-24">
    <div className="flex items-center justify-between mb-5">
      <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <HiAdjustments className="h-4 w-4 text-primary-600" />
        Filters
      </h2>
      <button onClick={onReset} className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-semibold">
        Reset all
      </button>
    </div>

    <div className="mb-5">
      <FilterSectionLabel title="Category" />
      <div className="space-y-2">
        <RadioOption name="domain" value="" label="All categories" checked={filters.domain === ''} onChange={onChange} />
        {CATEGORIES.slice(0, 8).map(cat => (
          <RadioOption key={cat} name="domain" value={cat} label={cat} checked={filters.domain === cat} onChange={onChange} />
        ))}
      </div>
    </div>

    <div className="mb-5">
      <FilterSectionLabel title="Work Type" />
      <div className="space-y-2">
        <RadioOption name="workType" value="" label="Any type" checked={filters.workType === ''} onChange={onChange} />
        {WORK_MODES.map(mode => (
          <RadioOption key={mode} name="workType" value={mode} label={mode} checked={filters.workType === mode} onChange={onChange} />
        ))}
      </div>
    </div>

    <div className="mb-5">
      <FilterSectionLabel title="Duration" />
      <div className="space-y-2">
        <RadioOption name="duration" value="" label="Any duration" checked={filters.duration === ''} onChange={onChange} />
        {['1', '2', '3', '6'].map(m => (
          <RadioOption key={m} name="duration" value={m} label={`${m} Month${m !== '1' ? 's' : ''}`} checked={filters.duration === m} onChange={onChange} />
        ))}
      </div>
    </div>

    <div className="mb-5">
      <FilterSectionLabel title="Compensation" />
      <div className="space-y-2">
        <RadioOption name="isPaid" value=""       label="Any"         checked={filters.isPaid === ''}       onChange={onChange} />
        <RadioOption name="isPaid" value="paid"   label="Paid only"   checked={filters.isPaid === 'paid'}   onChange={onChange} />
        <RadioOption name="isPaid" value="unpaid" label="Unpaid only" checked={filters.isPaid === 'unpaid'} onChange={onChange} />
      </div>
    </div>

    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs text-gray-400 text-center">
        {resultCount} result{resultCount !== 1 ? 's' : ''} found
      </p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Internships = () => {
  const [allInternships,    setAllInternships]    = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [filters,           setFilters]           = useState(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch all active internships — no orderBy to avoid needing composite index
  const fetchInternships = useCallback(async () => {
    try {
      const snap = await getDocs(
        query(collection(db, 'internships'), where('status', '==', 'active'))
      );
      let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort client-side: newest first
      docs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setAllInternships(docs);
    } catch (err) {
      console.error('Firestore error:', err);
      toast.error('Failed to load internships.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchInternships();
      setLoading(false);
    })();
  }, [fetchInternships]);

  // Client-side filtering
  const displayed = allInternships.filter(i => {
    const { search, domain, workType, duration, isPaid } = filters;
    if (search) {
      const s = search.toLowerCase();
      const hay = [i.title, i.companyName, i.domain, i.workType, ...(i.skills || [])];
      if (!hay.some(v => v?.toLowerCase().includes(s))) return false;
    }
    if (domain   && i.domain   !== domain)           return false;
    if (workType && i.workType !== workType)          return false;
    if (duration && i.duration !== Number(duration)) return false;
    if (isPaid === 'paid'   && !i.isPaid)            return false;
    if (isPaid === 'unpaid' &&  i.isPaid)            return false;
    return true;
  });

  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleReset = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const activeFilters = Object.entries(filters).filter(([k, v]) => v !== '' && k !== 'search');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Browse Internships</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {loading ? 'Loading...' : `${displayed.length} opportunit${displayed.length !== 1 ? 'ies' : 'y'}${allInternships.length > displayed.length ? ` (filtered from ${allInternships.length})` : ''}`}
          </p>
        </div>

        {/* Search + mobile filter toggle */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              placeholder="Search by role, skill, or company..."
              className="input pl-10 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 rounded-xl w-full"
            />
            {filters.search && (
              <button onClick={() => handleFilterChange('search', '')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <HiX className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setMobileFiltersOpen(p => !p)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <HiFilter className="h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <span className="px-1.5 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeFilters.map(([key, value]) => (
              <FilterPill key={key} label={value} onRemove={() => handleFilterChange(key, '')} />
            ))}
            <button onClick={handleReset} className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-1">
              Clear all
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <FilterPanel filters={filters} onChange={handleFilterChange} onReset={handleReset} resultCount={displayed.length} />
          </aside>

          {/* Mobile drawer */}
          {mobileFiltersOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)}>
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 overflow-y-auto p-5 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 dark:text-white">Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)}><HiX className="h-5 w-5 text-gray-500" /></button>
                </div>
                <FilterPanel filters={filters} onChange={handleFilterChange} onReset={handleReset} resultCount={displayed.length} />
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <InternshipGrid
              internships={displayed}
              loading={loading}
              emptyMessage={
                activeFilters.length > 0 || filters.search
                  ? 'No internships match your filters. Try adjusting them.'
                  : 'No internships yet. Login as company and click Seed Fake Data!'
              }
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Internships;