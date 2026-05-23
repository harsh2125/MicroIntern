// src/components/internship/InternshipCard.jsx
// ✅ All sub-components at MODULE LEVEL
// Save button writes to Firestore and shows real saved state

import { useState } from 'react';
import { Link }     from 'react-router-dom';
import {
  HiLocationMarker, HiClock, HiCurrencyDollar,
  HiUsers, HiBookmark, HiArrowRight,
} from 'react-icons/hi';
import { timeAgo }  from '../../utils/formatDate';
import { saveInternship, unsaveInternship } from '../../firebase/firestore';
import { useAuth }  from '../../context/AuthContext';
import { ROLES }    from '../../utils/constants';
import toast        from 'react-hot-toast';
import clsx         from 'clsx';

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    gray:    'bg-gray-100   dark:bg-gray-800   text-gray-600   dark:text-gray-400',
    green:   'bg-green-100  dark:bg-green-900/40  text-green-700  dark:text-green-400',
    amber:   'bg-amber-100  dark:bg-amber-900/40  text-amber-700  dark:text-amber-400',
    blue:    'bg-blue-100   dark:bg-blue-900/40   text-blue-700   dark:text-blue-400',
    primary: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400',
  };
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      colors[color] || colors.gray
    )}>
      {children}
    </span>
  );
};

// ─── MetaItem ─────────────────────────────────────────────────────────────────
const MetaItem = ({ icon, text }) => (
  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
    {icon}
    <span className="truncate">{text}</span>
  </span>
);

// ─── Main Card ────────────────────────────────────────────────────────────────
const InternshipCard = ({ internship, isSaved = false, savedDocId = null, onSaveChange }) => {
  const { currentUser, userProfile } = useAuth();
  const [saved,    setSaved]    = useState(isSaved);
  const [savedId,  setSavedId]  = useState(savedDocId);
  const [saving,   setSaving]   = useState(false);

  const handleSaveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error('Sign in to save internships');
      return;
    }
    if (userProfile?.role !== ROLES.STUDENT) {
      toast.error('Only students can save internships');
      return;
    }

    setSaving(true);
    try {
      if (saved && savedId) {
        await unsaveInternship(savedId);
        setSaved(false);
        setSavedId(null);
        toast.success('Removed from saved');
        if (onSaveChange) onSaveChange(internship.id, false, null);
      } else {
        const newDocId = await saveInternship(currentUser.uid, internship.id);
        setSaved(true);
        setSavedId(newDocId);
        toast.success('Saved!');
        if (onSaveChange) onSaveChange(internship.id, true, newDocId);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const workTypeColor = { Remote: 'green', Hybrid: 'amber', 'On-site': 'blue' };

  return (
    <Link
      to={`/internships/${internship.id}`}
      className="group block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-xl hover:shadow-primary-100/40 dark:hover:shadow-primary-950/20 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
            {internship.companyName?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {internship.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {internship.companyName}
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveClick}
          disabled={saving}
          aria-label={saved ? 'Unsave' : 'Save internship'}
          className={clsx(
            'p-1.5 rounded-lg transition-colors flex-shrink-0',
            saved
              ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30'
              : 'text-gray-300 dark:text-gray-600 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
          )}
        >
          {saving
            ? <span className="animate-spin w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full inline-block" />
            : <HiBookmark className={clsx('h-4 w-4', saved && 'fill-current')} />
          }
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge color={workTypeColor[internship.workType] || 'gray'}>{internship.workType}</Badge>
        {internship.domain && <Badge color="primary">{internship.domain}</Badge>}
        {internship.isPaid && <Badge color="green">Paid</Badge>}
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mb-4">
        <MetaItem icon={<HiLocationMarker className="h-3.5 w-3.5 flex-shrink-0" />} text={internship.location || 'Remote'} />
        <MetaItem icon={<HiClock          className="h-3.5 w-3.5 flex-shrink-0" />} text={`${internship.duration} month${internship.duration > 1 ? 's' : ''}`} />
        <MetaItem icon={<HiCurrencyDollar className="h-3.5 w-3.5 flex-shrink-0" />} text={internship.isPaid ? `₹${internship.stipend}/mo` : 'Unpaid'} />
        <MetaItem icon={<HiUsers          className="h-3.5 w-3.5 flex-shrink-0" />} text={`${internship.applicantsCount || 0} applied`} />
      </div>

      {/* Skills */}
      {internship.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {internship.skills.slice(0, 3).map(skill => (
            <span key={skill} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-md">
              {skill}
            </span>
          ))}
          {internship.skills.length > 3 && (
            <span className="px-2 py-0.5 text-gray-400 text-xs">+{internship.skills.length - 3} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-400">{timeAgo(internship.createdAt)}</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
          View details <HiArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
};

export default InternshipCard;