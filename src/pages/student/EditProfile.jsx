// src/pages/student/EditProfile.jsx
// ✅ All sub-components at MODULE LEVEL

import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db }                  from '../../firebase/config';
import Layout                  from '../../components/layout/Layout';
import { useAuth }             from '../../context/AuthContext';
import { FormInput, FormTextarea, TagInput } from '../../components/common/FormField';
import { HiUser, HiSave, HiArrowLeft } from 'react-icons/hi';
import toast                   from 'react-hot-toast';

// ─── Section wrapper ──────────────────────────────────────────────────────────
const FormSection = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
    <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
      {title}
    </h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const EditProfile = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', university: '', bio: '',
    photoURL: '', linkedIn: '', github: '', portfolio: '',
  });
  const [skills,  setSkills]  = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setForm({
        name:       userProfile.name       || '',
        university: userProfile.university || '',
        bio:        userProfile.bio        || '',
        photoURL:   userProfile.photoURL   || '',
        linkedIn:   userProfile.linkedIn   || '',
        github:     userProfile.github     || '',
        portfolio:  userProfile.portfolio  || '',
      });
      setSkills(userProfile.skills || []);
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...form, skills, updatedAt: serverTimestamp(),
      });
      toast.success('Profile updated! ✅');
      navigate('/student/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <HiArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <HiUser className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Keep your profile up to date</p>
            </div>
          </div>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          {form.photoURL ? (
            <img src={form.photoURL} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-primary-200" onError={e => { e.target.style.display = 'none'; }} />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
              {form.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{form.name || 'Your Name'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{userProfile?.email}</p>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{userProfile?.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <FormSection title="👤 Basic Information">
            <FormInput label="Full Name *" id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
            <FormInput label="University / College" id="university" name="university" value={form.university} onChange={handleChange} placeholder="e.g. IIT Delhi, BITS Pilani" />
            <FormTextarea label="Bio" id="bio" name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Tell companies about yourself, your interests and goals..." />
          </FormSection>

          <FormSection title="🛠️ Skills">
            <TagInput
              label="Your Skills"
              tags={skills}
              onAdd={s => setSkills(prev => [...prev, s])}
              onRemove={s => setSkills(prev => prev.filter(x => x !== s))}
              placeholder="Type a skill and press Enter..."
            />
          </FormSection>

          <FormSection title="🔗 Links & Social">
            <FormInput label="Profile Photo URL" id="photoURL" name="photoURL" value={form.photoURL} onChange={handleChange} placeholder="https://your-photo-url.com/photo.jpg" />
            <FormInput label="LinkedIn URL" id="linkedIn" name="linkedIn" value={form.linkedIn} onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile" />
            <FormInput label="GitHub URL" id="github" name="github" value={form.github} onChange={handleChange} placeholder="https://github.com/yourusername" />
            <FormInput label="Portfolio URL" id="portfolio" name="portfolio" value={form.portfolio} onChange={handleChange} placeholder="https://yourportfolio.com" />
          </FormSection>

          <div className="flex gap-3 pb-6">
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading
                ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" /> Saving...</>
                : <><HiSave className="h-4 w-4" /> Save Profile</>
              }
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditProfile;