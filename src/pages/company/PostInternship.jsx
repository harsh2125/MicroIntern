// src/pages/company/PostInternship.jsx
// Company form to create OR edit an internship listing.
// ✅ ALL sub-components defined at MODULE LEVEL — cursor bug is impossible here.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams }           from 'react-router-dom';
import { HiBriefcase, HiSave, HiX }        from 'react-icons/hi';
import {
  FormInput, FormTextarea, FormSelect, FormToggle, TagInput,
} from '../../components/common/FormField';
import {
  createInternship, updateInternship, getInternshipById,
} from '../../firebase/firestore';
import Layout            from '../../components/layout/Layout';
import { useAuth }       from '../../context/AuthContext';
import toast             from 'react-hot-toast';

// ─── Option constants (module level) ─────────────────────────────────────────
const DOMAIN_OPTIONS = [
  { value: '',                  label: 'Select a domain...' },
  { value: 'Web Development',   label: 'Web Development' },
  { value: 'Mobile Development',label: 'Mobile Development' },
  { value: 'Data Science',      label: 'Data Science' },
  { value: 'Machine Learning',  label: 'Machine Learning' },
  { value: 'UI/UX Design',      label: 'UI/UX Design' },
  { value: 'DevOps',            label: 'DevOps' },
  { value: 'Cybersecurity',     label: 'Cybersecurity' },
  { value: 'Marketing',         label: 'Marketing' },
  { value: 'Finance',           label: 'Finance' },
  { value: 'Content Writing',   label: 'Content Writing' },
  { value: 'HR',                label: 'HR' },
  { value: 'Other',             label: 'Other' },
];

const WORK_TYPE_OPTIONS = [
  { value: 'Remote',   label: 'Remote' },
  { value: 'On-site',  label: 'On-site' },
  { value: 'Hybrid',   label: 'Hybrid' },
];

const DURATION_OPTIONS = [1, 2, 3, 4, 6, 8, 12].map(m => ({
  value: String(m),
  label: `${m} Month${m > 1 ? 's' : ''}`,
}));

// ─── Section wrapper (module level) ──────────────────────────────────────────
const FormSection = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
    <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
      {title}
    </h2>
    <div className="space-y-4">{children}</div>
  </div>
);

// ─── Initial form state (module level) ───────────────────────────────────────
const INITIAL_FORM = {
  title:               '',
  companyName:         '',
  domain:              '',
  workType:            'Remote',
  location:            '',
  duration:            '3',
  isPaid:              false,
  stipend:             '',
  openings:            '1',
  description:         '',
  responsibilities:    '',
  requirements:        '',
  perks:               '',
  applicationDeadline: '',
};

// ─── Main component ───────────────────────────────────────────────────────────
const PostInternship = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate  = useNavigate();
  const { id: editId } = useParams();   // present when editing
  const isEditing = Boolean(editId);

  const [form,     setForm]     = useState(INITIAL_FORM);
  const [skills,   setSkills]   = useState([]);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  // ── Load existing data when editing ──────────────────────────────────────
  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const data = await getInternshipById(editId);
        if (!data) { toast.error('Internship not found'); navigate(-1); return; }
        if (data.companyId !== currentUser?.uid) {
          toast.error('You are not authorised to edit this listing');
          navigate(-1);
          return;
        }
        const { skills: existingSkills = [], ...rest } = data;
        setForm({
          ...INITIAL_FORM,
          ...rest,
          duration:            String(rest.duration  || 3),
          openings:            String(rest.openings  || 1),
          stipend:             String(rest.stipend   || ''),
          applicationDeadline: rest.applicationDeadline?.toDate
            ? rest.applicationDeadline.toDate().toISOString().split('T')[0]
            : rest.applicationDeadline || '',
        });
        setSkills(existingSkills);
      } catch {
        toast.error('Failed to load internship data');
      } finally {
        setFetching(false);
      }
    })();
  }, [editId, isEditing, currentUser, navigate]);

  // ── Handlers — useCallback keeps references stable ────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev  => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const handleToggle = useCallback((val) => {
    setForm(prev => ({ ...prev, isPaid: val }));
  }, []);

  const addSkill    = useCallback((s) => setSkills(prev => [...prev, s]),            []);
  const removeSkill = useCallback((s) => setSkills(prev => prev.filter(x => x !== s)), []);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim())               e.title               = 'Title is required';
    if (!form.companyName.trim())         e.companyName         = 'Company name is required';
    if (!form.domain)                     e.domain              = 'Domain is required';
    if (!form.description.trim())         e.description         = 'Description is required';
    if (!form.requirements.trim())        e.requirements        = 'Requirements are required';
    if (form.isPaid && !form.stipend)     e.stipend             = 'Stipend amount is required';
    if (!form.applicationDeadline)        e.applicationDeadline = 'Application deadline is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors above'); return; }

    setLoading(true);
    const payload = {
      ...form,
      skills,
      duration: Number(form.duration),
      openings: Number(form.openings),
      stipend:  form.isPaid ? Number(form.stipend) : 0,
      companyName: form.companyName || userProfile?.companyName || userProfile?.name || '',
    };

    try {
      if (isEditing) {
        await updateInternship(editId, payload);
        toast.success('Internship updated successfully!');
      } else {
        await createInternship(payload, currentUser.uid);
        toast.success('Internship posted successfully! 🎉');
      }
      navigate('/company/dashboard');
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state while fetching edit data ────────────────────────────────
  if (fetching) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
            <HiBriefcase className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Internship' : 'Post New Internship'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEditing ? 'Update your listing details' : 'Reach thousands of talented students'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* ── Basic Info ── */}
          <FormSection title="📋 Basic Information">
            <FormInput
              label="Internship Title *"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer Intern"
              error={errors.title}
            />
            <FormInput
              label="Company Name *"
              id="companyName"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Your company name"
              error={errors.companyName}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Domain / Category *"
                id="domain"
                name="domain"
                value={form.domain}
                onChange={handleChange}
                options={DOMAIN_OPTIONS}
                error={errors.domain}
              />
              <FormSelect
                label="Work Type"
                id="workType"
                name="workType"
                value={form.workType}
                onChange={handleChange}
                options={WORK_TYPE_OPTIONS}
              />
            </div>
            {form.workType !== 'Remote' && (
              <FormInput
                label="Location"
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Mumbai, India"
              />
            )}
          </FormSection>

          {/* ── Duration & Pay ── */}
          <FormSection title="💰 Duration & Compensation">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormSelect
                label="Duration"
                id="duration"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                options={DURATION_OPTIONS}
              />
              <FormInput
                label="Number of Openings"
                id="openings"
                name="openings"
                type="number"
                min="1"
                max="100"
                value={form.openings}
                onChange={handleChange}
              />
            </div>
            <FormToggle
              label="Paid Internship"
              description="Toggle on if you offer a monthly stipend"
              checked={form.isPaid}
              onChange={handleToggle}
            />
            {form.isPaid && (
              <FormInput
                label="Monthly Stipend (₹) *"
                id="stipend"
                name="stipend"
                type="number"
                min="0"
                value={form.stipend}
                onChange={handleChange}
                placeholder="e.g. 8000"
                error={errors.stipend}
              />
            )}
            <FormInput
              label="Application Deadline *"
              id="applicationDeadline"
              name="applicationDeadline"
              type="date"
              value={form.applicationDeadline}
              onChange={handleChange}
              error={errors.applicationDeadline}
            />
          </FormSection>

          {/* ── Description ── */}
          <FormSection title="📝 Internship Details">
            <FormTextarea
              label="Description *"
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the internship, your company, and what the intern will work on..."
              error={errors.description}
            />
            <FormTextarea
              label="Key Responsibilities"
              id="responsibilities"
              name="responsibilities"
              value={form.responsibilities}
              onChange={handleChange}
              rows={3}
              placeholder="List the main responsibilities (one per line)..."
            />
            <FormTextarea
              label="Requirements *"
              id="requirements"
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              rows={3}
              placeholder="List required skills, qualifications, or experience..."
              error={errors.requirements}
            />
            <FormTextarea
              label="Perks & Benefits"
              id="perks"
              name="perks"
              value={form.perks}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Certificate, Letter of Recommendation, Pre-Placement Offer..."
            />
          </FormSection>

          {/* ── Skills ── */}
          <FormSection title="🛠️ Required Skills">
            <TagInput
              label="Skills / Technologies"
              tags={skills}
              onAdd={addSkill}
              onRemove={removeSkill}
              placeholder="Type a skill and press Enter..."
            />
          </FormSection>

          {/* ── Action buttons ── */}
          <div className="flex flex-col sm:flex-row gap-3 pb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <HiX className="h-4 w-4" /> Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" /> Saving...</>
                : <><HiSave className="h-4 w-4" /> {isEditing ? 'Update Internship' : 'Post Internship'}</>
              }
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
};

export default PostInternship;