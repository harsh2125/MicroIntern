import { useState, useEffect }          from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiLocationMarker, HiClock, HiCurrencyDollar, HiUsers,
  HiCalendar, HiArrowLeft, HiCheckCircle, HiBriefcase,
  HiLockClosed,
} from 'react-icons/hi';
import {
  getInternshipById,
  applyForInternship,
  hasApplied,
} from '../firebase/firestore';
import Layout            from '../components/layout/Layout';
import { useAuth }       from '../context/AuthContext';
import { formatDate, isExpired } from '../utils/formatDate';
import { ROUTES, ROLES } from '../utils/constants';
import toast             from 'react-hot-toast';
import clsx              from 'clsx';

// ─── Sub-components — ALL at module level ─────────────────────────────────────

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <span className="text-primary-500 flex-shrink-0">{icon}</span>
    <span className="text-sm text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">{label}</span>
    <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
  </div>
);

const SkillBadge = ({ skill }) => (
  <span className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-lg">
    {skill}
  </span>
);

const Section = ({ title, children }) => (
  <div className="mb-6 last:mb-0">
    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
    <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
      {children}
    </div>
  </div>
);

const DetailSkeleton = () => (
  <Layout>
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 h-64" />
      </div>
    </div>
  </Layout>
);

// ─── Apply Button Logic ───────────────────────────────────────────────────────
// Returns the correct button/message based on auth + role + status
const ApplySection = ({ currentUser, userProfile, expired, applied, applying, onApply }) => {
  // Not logged in
  if (!currentUser) {
    return (
      <>
        <Link
          to={ROUTES.LOGIN}
          className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 mb-3"
        >
          <HiLockClosed className="h-4 w-4" />
          Sign in to Apply
        </Link>
        <p className="text-xs text-center text-gray-400">
          New here?{' '}
          <Link to={ROUTES.REGISTER} className="text-primary-600 hover:underline font-medium">
            Create a student account
          </Link>
        </p>
      </>
    );
  }

  // Logged in as company or admin — can't apply
  if (userProfile?.role === ROLES.COMPANY || userProfile?.role === ROLES.ADMIN) {
    return (
      <div className="py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold text-sm text-center mb-3">
        Only students can apply
      </div>
    );
  }

  // Applications closed
  if (expired) {
    return (
      <div className="py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold text-sm text-center mb-3">
        Applications Closed
      </div>
    );
  }

  // Already applied
  if (applied) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-semibold text-sm mb-3">
        <HiCheckCircle className="h-5 w-5" />
        Applied Successfully!
      </div>
    );
  }

  // Student — can apply
  return (
    <button
      onClick={onApply}
      disabled={applying}
      className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
    >
      {applying ? (
        <>
          <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
          Applying...
        </>
      ) : (
        <>
          <HiBriefcase className="h-4 w-4" />
          Apply Now
        </>
      )}
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const InternshipDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [internship, setInternship] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [applying,   setApplying]   = useState(false);
  const [applied,    setApplied]    = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getInternshipById(id);
        if (!data) {
          toast.error('Internship not found');
          navigate(ROUTES.INTERNSHIPS);
          return;
        }
        setInternship(data);

        // Only check "already applied" for logged-in students
        if (currentUser && userProfile?.role === ROLES.STUDENT) {
          const already = await hasApplied(id, currentUser.uid);
          setApplied(already);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load internship');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, currentUser, userProfile, navigate]);

  const handleApply = async () => {
    if (!currentUser) { navigate(ROUTES.LOGIN); return; }
    if (userProfile?.role !== ROLES.STUDENT) {
      toast.error('Only students can apply for internships');
      return;
    }
    setApplying(true);
    try {
      await applyForInternship(id, currentUser.uid, userProfile?.resumeUrl || '');
      setApplied(true);
      setInternship(prev => ({
        ...prev,
        applicantsCount: (prev.applicantsCount || 0) + 1,
      }));
      toast.success('Application submitted! 🎉');
    } catch (err) {
      toast.error(err.message || 'Failed to apply. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!internship) return null;

  const expired = isExpired(internship.applicationDeadline);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <HiArrowLeft className="h-4 w-4" /> Back to Internships
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Content ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Header */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {internship.companyName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {internship.title}
                  </h1>
                  <p className="text-primary-600 dark:text-primary-400 font-semibold mt-0.5">
                    {internship.companyName}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                      {internship.workType}
                    </span>
                    {internship.domain && (
                      <span className="px-2.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-full">
                        {internship.domain}
                      </span>
                    )}
                    {expired && (
                      <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                        Applications Closed
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {internship.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {internship.skills.map(s => <SkillBadge key={s} skill={s} />)}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              {internship.description && (
                <Section title="📋 About this Internship">{internship.description}</Section>
              )}
              {internship.responsibilities && (
                <Section title="✅ Responsibilities">{internship.responsibilities}</Section>
              )}
              {internship.requirements && (
                <Section title="🎯 Requirements">{internship.requirements}</Section>
              )}
              {internship.perks && (
                <Section title="🎁 Perks & Benefits">{internship.perks}</Section>
              )}
              {!internship.description && !internship.responsibilities && !internship.requirements && (
                <p className="text-sm text-gray-400 text-center py-8">No additional details provided.</p>
              )}
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-24">

              {/* Apply section */}
              <div className="mb-4">
                <ApplySection
                  currentUser={currentUser}
                  userProfile={userProfile}
                  expired={expired}
                  applied={applied}
                  applying={applying}
                  onApply={handleApply}
                />
              </div>

              {/* Details */}
              <DetailRow icon={<HiLocationMarker className="h-4 w-4" />} label="Location"  value={internship.location || 'Remote'} />
              <DetailRow icon={<HiClock          className="h-4 w-4" />} label="Duration"  value={`${internship.duration} month${internship.duration > 1 ? 's' : ''}`} />
              <DetailRow icon={<HiCurrencyDollar className="h-4 w-4" />} label="Stipend"   value={internship.isPaid ? `₹${internship.stipend}/month` : 'Unpaid'} />
              <DetailRow icon={<HiUsers          className="h-4 w-4" />} label="Openings"  value={`${internship.openings} position${internship.openings > 1 ? 's' : ''}`} />
              <DetailRow icon={<HiCalendar       className="h-4 w-4" />} label="Deadline"  value={formatDate(internship.applicationDeadline)} />
              <DetailRow icon={<HiUsers          className="h-4 w-4" />} label="Applied"   value={`${internship.applicantsCount || 0} students`} />
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default InternshipDetail;