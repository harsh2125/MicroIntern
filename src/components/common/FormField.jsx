// src/components/common/FormField.jsx
// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: Every component here is defined at MODULE LEVEL (top of file).
// NEVER move these inside a parent component — doing so causes React to
// unmount/remount on every keystroke, which makes the cursor jump out of inputs.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import clsx from 'clsx';

// ─── Shared input class string ────────────────────────────────────────────────
const inputBase = `
  w-full px-4 py-2.5 rounded-xl border text-sm
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-gray-100
  border-gray-200 dark:border-gray-700
  placeholder-gray-400 dark:placeholder-gray-500
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
  transition-all duration-200
`;

// ─── Text / Email / Number / Date Input ──────────────────────────────────────
export const FormInput = React.forwardRef(
  ({ label, id, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={clsx(inputBase, error && 'border-red-400 focus:ring-red-400', className)}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
FormInput.displayName = 'FormInput';

// ─── Textarea ─────────────────────────────────────────────────────────────────
export const FormTextarea = React.forwardRef(
  ({ label, id, error, rows = 4, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={clsx(inputBase, 'resize-none', error && 'border-red-400 focus:ring-red-400', className)}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
FormTextarea.displayName = 'FormTextarea';

// ─── Select ───────────────────────────────────────────────────────────────────
export const FormSelect = React.forwardRef(
  ({ label, id, error, options = [], className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={clsx(inputBase, error && 'border-red-400 focus:ring-red-400', className)}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
FormSelect.displayName = 'FormSelect';

// ─── Toggle Switch ────────────────────────────────────────────────────────────
export const FormToggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className={clsx(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
      )}
    >
      <span className={clsx(
        'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
        checked ? 'translate-x-6' : 'translate-x-1'
      )} />
    </button>
  </div>
);

// ─── Tag / Skill Input ────────────────────────────────────────────────────────
// Press Enter or comma to add a tag. Click × to remove.
export const TagInput = ({ label, tags = [], onAdd, onRemove, placeholder = 'Type and press Enter...' }) => {
  const [input, setInput] = React.useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = input.trim().replace(/,$/, '');
      if (val && !tags.includes(val)) {
        onAdd(val);
        setInput('');
      }
    }
    // Backspace on empty input removes last tag
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2 p-2.5 min-h-[46px] border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
        {tags.map(tag => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2.5 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-lg"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="hover:text-red-500 transition-colors ml-0.5"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[140px] bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none"
        />
      </div>
      <p className="text-xs text-gray-400">Press Enter or comma to add a tag</p>
    </div>
  );
};