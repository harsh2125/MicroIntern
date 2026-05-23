import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiArrowLeft, HiUser, HiMail, HiDownload,
  HiClock, HiCheckCircle, HiXCircle, HiChat,
} from 'react-icons/hi';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import {
  getInternshipById,
  getInternshipApplicants,
  updateApplicationStatus,
  createNotification,
} from '../../firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db }          from '../../firebase/config';
import { timeAgo }     from '../../utils/formatDate';
import toast           from 'react-hot-toast';
import clsx            from 'clsx';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'pending',     label: 'Pending',     color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'   },
  { value: 'shortlisted', label: 'Shortlisted', color: 'bg-blue-100  dark:bg-blue-900/30  text-blue-700  dark:text-blue-400'    },
  { value: 'accepted',    label: 'Accepted',    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'   },
  { value: 'rejected',    label: 'Rejected',    color: 'bg-red-100   dark:bg-red-900/30   text-red-600   dark:text-red-400'     },
];

const statusColor = (s) => STATUS_OPTIONS.find(o => o.value === s)?.color || '';

// ─── Quick Action Buttons ─────────────────────────────────────────────────────
const QuickActions = ({ application, student, internshipTitle, onUpdate }) => {
  const [loading, setLoading] = useState(null);

  const handleAction = async (newStatus) => {
    setLoading(newStatus);
    try {
      await updateApplicationStatus(application.id, newStatus);

      if (application.studentId) {
        const messages = {
          accepted:    `🎉 Congratulations! You've been accepted for "${internshipTitle}"`,
          rejected:    `Your application for "${internshipTitle}" was not selected this time.`,
          shortlisted: `⭐ You've been shortlisted for "${internshipTitle}"! Stay tuned.`,
          pending:     `Your application for "${internshipTitle}" status changed to pending.`,
        };
        await createNotification(application.studentId, {
          type:    newStatus,
          message: messages[newStatus] || `Application status updated to ${newStatus}`,
          internshipId: application.internshipId,
        });
      }

      onUpdate(application.id, newStatus);
      toast.success(`Marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setLoading(null);
    }
  };

  const isLoading = (s) => loading === s;

  if (application.status === 'accepted') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30
                      text-green-700 dark:text-green-400 text-xs font-semibold rounded-lg">
        <HiCheckCircle className="h-3.5 w-3.5" /> Accepted
      </div>
    );
  }

  if (application.status === 'rejected') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30
                      text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg">
        <HiXCircle className="h-3.5 w-3.5" /> Rejected
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {application.status !== 'shortlisted' && (
        <button
          onClick={() => handleAction('shortlisted')}
          disabled={!!loading}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20
                     text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg
                     hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors
                     disabled:opacity-50"
        >
          {isLoading('shortlisted')
            ? <span className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full" />
            : '⭐'
          } Shortlist
        </button>
      )}
      <button
        onClick={() => handleAction('accepted')}
        disabled={!!loading}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/20
                   text-green-700 dark:text-green-400 text-xs font-semibold rounded-lg
                   hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors
                   disabled:opacity-50"
      >
        {isLoading('accepted')
          ? <span className="animate-spin w-3 h-3 border border-green-600 border-t-transparent rounded-full" />
          : <HiCheckCircle className="h-3.5 w-3.5" />
        } Accept
      </button>
      <button
        onClick={() => handleAction('rejected')}
        disabled={!!loading}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20
                   text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg
                   hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors
                   disabled:opacity-50"
      >
        {isLoading('rejected')
          ? <span className="animate-spin w-3 h-3 border border-red-600 border-t-transparent rounded-full" />
          : <HiXCircle className="h-3.5 w-3.5" />
        } Reject
      </button>
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={clsx(
    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
    statusColor(status)
  )}>
    {STATUS_OPTIONS.find(o => o.value === status)?.label || status}
  </span>
);

// ─── Applicant Card ───────────────────────────────────────────────────────────
const ApplicantCard = ({ application, student, internshipTitle, onStatusUpdate }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                  dark:border-gray-800 p-5 transition-all duration-200
                  hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700">

    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-700
                      flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
        {student?.name?.[0]?.toUpperCase() || <HiUser className="h-5 w-5" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              {student?.name || 'Unknown Student'}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              {student?.email && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <HiMail className="h-3 w-3" />
                  {student.email}
                </span>
              )}
              {student?.university && (
                <span className="text-xs text-gray-400">🎓 {student.university}</span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <HiClock className="h-3 w-3" />
                Applied {timeAgo(application.appliedAt)}
              </span>
            </div>
          </div>
          <StatusBadge status={application.status} />
        </div>

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3
                        border-t border-gray-100 dark:border-gray-800">
          <QuickActions
            application={application}
            student={student}
            internshipTitle={internshipTitle}
            onUpdate={onStatusUpdate}
          />

          <div className="flex items-center gap-2 ml-auto">
            {application.resumeUrl && (
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100
                           dark:bg-gray-800 text-gray-600 dark:text-gray-400
                           text-xs font-semibold rounded-lg hover:bg-gray-200
                           dark:hover:bg-gray-700 transition-colors"
              >
                <HiDownload className="h-3.5 w-3.5" /> Resume
              </a>
            )}
            <Link
              to={`/chat/${application.studentId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50
                         dark:bg-primary-900/20 text-primary-700 dark:text-primary-400
                         text-xs font-semibold rounded-lg hover:bg-primary-100
                         dark:hover:bg-primary-900/40 transition-colors"
            >
              <HiChat className="h-3.5 w-3.5" /> Message
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                  dark:border-gray-800 p-5 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ViewApplicants = () => {
  const { id: internshipId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [internship,   setInternship]   = useState(null);
  const [applications, setApplications] = useState([]);
  const [students,     setStudents]     = useState({});
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const intern = await getInternshipById(internshipId);
        if (!intern) { toast.error('Internship not found'); navigate(-1); return; }
        if (intern.companyId !== currentUser?.uid) {
          toast.error('Unauthorized'); navigate(-1); return;
        }
        setInternship(intern);

        const apps = await getInternshipApplicants(internshipId);
        setApplications(apps);

        const studentMap = {};
        await Promise.all(
          apps.map(async (app) => {
            try {
              const snap = await getDoc(doc(db, 'users', app.studentId));
              if (snap.exists()) studentMap[app.studentId] = { uid: app.studentId, ...snap.data() };
            } catch { /* skip */ }
          })
        );
        setStudents(studentMap);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load applicants');
      } finally {
        setLoading(false);
      }
    })();
  }, [internshipId, currentUser, navigate]);

  const handleStatusUpdate = (appId, newStatus) => {
    setApplications(prev =>
      prev.map(a => a.id === appId ? { ...a, status: newStatus } : a)
    );
  };

  const TABS = ['all', 'pending', 'shortlisted', 'accepted', 'rejected'];
  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'all'
      ? applications.length
      : applications.filter(a => a.status === t).length;
    return acc;
  }, {});

  const filtered = filter === 'all'
    ? applications
    : applications.filter(a => a.status === filter);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back */}
        <button
          onClick={() => navigate('/company/dashboard')}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400
                     hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <HiArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        {/* Internship header */}
        {internship && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                          dark:border-gray-800 p-6 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400
                              to-primary-700 flex items-center justify-center
                              text-white font-bold text-xl flex-shrink-0">
                {internship.companyName?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {internship.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {internship.companyName} · {internship.workType}
                  {internship.isPaid && ` · ₹${internship.stipend}/mo`}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {applications.length}
                </p>
                <p className="text-xs text-gray-400">total applicants</p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
              {[
                { label: 'Pending',     count: counts.pending,     color: 'text-amber-600' },
                { label: 'Shortlisted', count: counts.shortlisted, color: 'text-blue-600'  },
                { label: 'Accepted',    count: counts.accepted,    color: 'text-green-600' },
                { label: 'Rejected',    count: counts.rejected,    color: 'text-red-600'   },
              ].map(({ label, count, color }) => (
                <div key={label} className="text-center">
                  <p className={`text-xl font-bold ${color}`}>{count}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1.5 flex-wrap mb-5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                filter === tab
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {counts[tab] > 0 && (
                <span className={clsx(
                  'px-1.5 py-0.5 rounded-full text-xs font-bold',
                  filter === tab
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                )}>
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => <CardSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-5xl mb-4">👥</span>
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-2">
                {filter === 'all' ? 'No applicants yet' : `No ${filter} applicants`}
              </h3>
              <p className="text-sm text-gray-400">
                {filter === 'all'
                  ? 'Share your internship to attract applicants'
                  : 'Update applicant statuses to see them here'}
              </p>
            </div>
          ) : (
            filtered.map(app => (
              <ApplicantCard
                key={app.id}
                application={app}
                student={students[app.studentId]}
                internshipTitle={internship?.title || ''}
                onStatusUpdate={handleStatusUpdate}
              />
            ))
          )}
        </div>

      </div>
    </Layout>
  );
};

export default ViewApplicants;