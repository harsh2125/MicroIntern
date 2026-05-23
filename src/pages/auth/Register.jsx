// src/pages/auth/Register.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiMail, HiLockClosed, HiUser, HiOfficeBuilding,
  HiAcademicCap, HiEye, HiEyeOff, HiCheck,
} from 'react-icons/hi';
import { registerUser } from '../../firebase/auth';
import { ROUTES, ROLES, APP_NAME } from '../../utils/constants';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// ✅ FIX — Field is defined OUTSIDE Register so React never remounts it.
// Previously it was inside Register(), causing the cursor-jumps bug.
const Field = ({ label, name, type = 'text', placeholder, icon: Icon, error, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={clsx(
          'input dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500',
          Icon && 'pl-9',
          error && 'border-red-500 focus:ring-red-500'
        )}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultRole = searchParams.get('role') === 'company'
    ? ROLES.COMPANY
    : ROLES.STUDENT;

  const [role, setRole]         = useState(defaultRole);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const [form, setForm] = useState({
    name:        '',
    email:       '',
    password:    '',
    confirm:     '',
    university:  '',
    companyName: '',
    website:     '',
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = 'Name is required';
    if (!form.email)        errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password)     errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    if (role === ROLES.STUDENT && !form.university.trim())
      errs.university = 'University name is required';
    if (role === ROLES.COMPANY && !form.companyName.trim())
      errs.companyName = 'Company name is required';
    return errs;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const extra = role === ROLES.STUDENT
        ? { university: form.university }
        : { companyName: form.companyName, website: form.website };

      await registerUser({
        email:    form.email,
        password: form.password,
        name:     form.name,
        role,
        extra,
      });

      toast.success('Account created successfully! 🎉');

      const dest = role === ROLES.STUDENT
        ? ROUTES.STUDENT_DASHBOARD
        : ROUTES.COMPANY_DASHBOARD;
      navigate(dest, { replace: true });

    } catch (err) {
      const msg = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password':        'Password should be at least 6 characters.',
        'auth/invalid-email':        'Please enter a valid email address.',
      }[err.code] || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">MI</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{APP_NAME}</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Join thousands of students and companies
          </p>
        </div>

        <div className="card dark:bg-gray-900 dark:border-gray-800">

          {/* Role Toggle */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-6">
            {[
              { value: ROLES.STUDENT, label: 'Student', Icon: HiAcademicCap },
              { value: ROLES.COMPANY, label: 'Company', Icon: HiOfficeBuilding },
            ].map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  role === value
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Common fields — ✅ value & onChange passed as props (not closed over) */}
            <Field
              label={role === ROLES.COMPANY ? 'Your Full Name' : 'Full Name'}
              name="name"
              placeholder="John Doe"
              icon={HiUser}
              error={errors.name}
              value={form.name}
              onChange={handleChange}
            />

            {/* Role-specific fields */}
            {role === ROLES.STUDENT && (
              <Field
                label="University / College"
                name="university"
                placeholder="e.g. IIT Delhi, BITS Pilani"
                icon={HiAcademicCap}
                error={errors.university}
                value={form.university}
                onChange={handleChange}
              />
            )}

            {role === ROLES.COMPANY && (
              <>
                <Field
                  label="Company Name"
                  name="companyName"
                  placeholder="e.g. Acme Corp"
                  icon={HiOfficeBuilding}
                  error={errors.companyName}
                  value={form.companyName}
                  onChange={handleChange}
                />
                <Field
                  label="Company Website (optional)"
                  name="website"
                  placeholder="https://yourcompany.com"
                  error={errors.website}
                  value={form.website}
                  onChange={handleChange}
                />
              </>
            )}

            <Field
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={HiMail}
              error={errors.email}
              value={form.email}
              onChange={handleChange}
            />

            {/* Password — custom because of show/hide toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className={clsx(
                    'input pl-9 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500',
                    errors.password && 'border-red-500 focus:ring-red-500'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <HiEyeOff className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
              {/* Password strength bar */}
              {form.password && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={clsx(
                      'h-1 flex-1 rounded-full transition-colors',
                      form.password.length >= i * 3
                        ? i === 1 ? 'bg-red-400'
                        : i === 2 ? 'bg-amber-400'
                        : 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    )} />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={clsx(
                    'input pl-9 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500',
                    errors.confirm && 'border-red-500 focus:ring-red-500'
                  )}
                />
                {form.confirm && form.password === form.confirm && (
                  <HiCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.confirm && (
                <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>
              )}
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              )}
              {loading
                ? 'Creating account...'
                : `Create ${role === ROLES.STUDENT ? 'Student' : 'Company'} Account`}
            </button>

          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-gray-900 text-gray-400">
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            to={ROUTES.LOGIN}
            className="block w-full text-center py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Sign in instead
          </Link>

        </div>
      </div>
    </div>
  );
}

export default Register;