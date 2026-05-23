import clsx from 'clsx';

/**
 * Badge/Tag component for categories, status, work mode, etc.
 * @param {string} variant - 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
 */
function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-100   dark:bg-gray-800  text-gray-600  dark:text-gray-400',
    success: 'bg-green-100  dark:bg-green-900/40 text-green-700 dark:text-green-400',
    warning: 'bg-amber-100  dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
    danger:  'bg-red-100    dark:bg-red-900/40   text-red-700   dark:text-red-400',
    info:    'bg-blue-100   dark:bg-blue-900/40  text-blue-700  dark:text-blue-400',
    purple:  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
    teal:    'bg-teal-100   dark:bg-teal-900/40  text-teal-700  dark:text-teal-400',
  };

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

export default Badge;