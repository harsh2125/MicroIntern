import clsx from 'clsx';

/**
 * Loading spinner — use for page-level and button-level loading states
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} className - extra classes
 */
function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={clsx(
      'animate-spin rounded-full border-primary-600 border-t-transparent',
      sizes[size],
      className
    )} />
  );
}

// Full-page centered loading overlay
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

export default Spinner;