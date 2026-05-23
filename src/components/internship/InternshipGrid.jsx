// src/components/internship/InternshipGrid.jsx
import InternshipCard from './InternshipCard';

// ─── Empty state ──────────────────────────────────────────────────────────────
// Defined at module level
const EmptyState = ({ message = 'No internships found.' }) => (
  <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
    <div className="text-5xl mb-4">🔍</div>
    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
      Nothing here yet
    </h3>
    <p className="text-sm text-gray-400">{message}</p>
  </div>
);

// ─── Skeleton loader card ─────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
    <div className="flex gap-2 mb-4">
      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
    <div className="grid grid-cols-2 gap-2 mb-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      ))}
    </div>
    <div className="h-px bg-gray-100 dark:bg-gray-800 mt-4 pt-3">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-3" />
    </div>
  </div>
);

// ─── Main Grid ────────────────────────────────────────────────────────────────
const InternshipGrid = ({
  internships = [],
  loading     = false,
  skeletonCount = 6,
  onSave,
  savedIds = [],
  emptyMessage,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(skeletonCount)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {internships.length === 0
        ? <EmptyState message={emptyMessage} />
        : internships.map(item => (
            <InternshipCard
              key={item.id}
              internship={item}
              onSave={onSave}
              isSaved={savedIds.includes(item.id)}
            />
          ))
      }
    </div>
  );
};

export default InternshipGrid;