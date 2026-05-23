import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiMenu, HiX, HiSun, HiMoon, HiUser, HiLogout,
  HiChevronDown, HiBriefcase, HiBookmark,
} from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';
import { useAuth }  from '../../context/AuthContext';
import { signOut }  from 'firebase/auth';
import { auth }     from '../../firebase/config';
import { NAV_LINKS, ROUTES, ROLES, APP_NAME } from '../../utils/constants';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';
import clsx  from 'clsx';

function Navbar() {
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { darkMode, toggleTheme } = useTheme();
  const { currentUser, userProfile } = useAuth();
  const loc    = useLocation();
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const dashboardPath = {
    [ROLES.STUDENT]: ROUTES.STUDENT_DASHBOARD,
    [ROLES.COMPANY]: ROUTES.COMPANY_DASHBOARD,
    [ROLES.ADMIN]:   ROUTES.ADMIN_DASHBOARD,
  }[userProfile?.role] || ROUTES.HOME;

  const isActive = (path) => loc.pathname === path;

  return (
    <nav className={clsx(
      'fixed top-0 inset-x-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg shadow-gray-200/50 dark:shadow-gray-950/50'
        : 'bg-white dark:bg-gray-900'
    )}>
      <div className="h-0.5 bg-gradient-to-r from-primary-500 via-teal-400 to-blue-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to={ROUTES.HOME} className="flex items-center shrink-0 group">
            <img
              src="/logo.png"
              alt="MicroIntern Logo"
              className="w-[100px] h-[100px] object-contain group-hover:scale-110 transition-transform duration-200"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-8 h-8 bg-primary-600 rounded-lg items-center justify-center
                            shadow-md hidden"
                 style={{ display: 'none' }}>
              <span className="text-white font-bold text-sm">MI</span>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
              {APP_NAME}
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative',
                  isActive(path)
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Right Side ── */}
          <div className="flex items-center gap-1.5">

            {/* Notification Bell */}
            <NotificationBell />

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900
                         dark:text-gray-400 dark:hover:text-white
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode
                ? <HiSun  className="h-5 w-5 text-amber-400" />
                : <HiMoon className="h-5 w-5" />
              }
            </button>

            {currentUser ? (
              <div className="relative hidden md:block" ref={dropRef}>
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl
                             hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-700
                                  rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {(userProfile?.name || currentUser.email)?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[90px] truncate">
                    {userProfile?.name || 'Account'}
                  </span>
                  <HiChevronDown className={clsx(
                    'h-4 w-4 text-gray-400 transition-transform duration-200',
                    profileOpen && 'rotate-180'
                  )} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900
                                  rounded-2xl shadow-2xl border border-gray-200
                                  dark:border-gray-700 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate mt-0.5">
                        {currentUser.email}
                      </p>
                      <span className="inline-block mt-1.5 text-xs bg-primary-100
                                       dark:bg-primary-900/40 text-primary-700
                                       dark:text-primary-400 px-2 py-0.5 rounded-full capitalize">
                        {userProfile?.role || 'user'}
                      </span>
                    </div>

                    <div className="p-1">
                      <Link
                        to={dashboardPath}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700
                                   dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                                   rounded-lg transition-colors"
                      >
                        <HiUser className="h-4 w-4 text-gray-400" /> Dashboard
                      </Link>

                      {userProfile?.role === ROLES.STUDENT && (
                        <>
                          <Link
                            to={ROUTES.STUDENT_APPLICATIONS}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700
                                       dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                                       rounded-lg transition-colors"
                          >
                            <HiBriefcase className="h-4 w-4 text-gray-400" /> My Applications
                          </Link>
                          <Link
                            to={ROUTES.STUDENT_SAVED}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700
                                       dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                                       rounded-lg transition-colors"
                          >
                            <HiBookmark className="h-4 w-4 text-gray-400" /> Saved
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                        <button
                          onClick={() => { setProfileOpen(false); handleLogout(); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm
                                     text-red-600 dark:text-red-400 hover:bg-red-50
                                     dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <HiLogout className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300
                             hover:text-primary-600 dark:hover:text-primary-400
                             px-3 py-2 rounded-lg hover:bg-gray-50
                             dark:hover:bg-gray-800 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="shimmer-btn text-sm font-semibold px-4 py-2 rounded-xl
                             shadow-lg shadow-primary-200 dark:shadow-none"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(p => !p)}
              className="md:hidden p-2 rounded-lg text-gray-500
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileOpen ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div className={clsx(
        'md:hidden overflow-hidden transition-all duration-300',
        'border-t border-gray-100 dark:border-gray-800',
        mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="bg-white dark:bg-gray-900 px-4 py-4 space-y-1">
          {NAV_LINKS.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={clsx(
                'block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive(path)
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              {label}
            </Link>
          ))}

          <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
            {currentUser ? (
              <>
                <Link to={dashboardPath} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Dashboard
                </Link>
                {userProfile?.role === ROLES.STUDENT && (
                  <>
                    <Link to={ROUTES.STUDENT_APPLICATIONS} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                      My Applications
                    </Link>
                    <Link to={ROUTES.STUDENT_SAVED} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                      Saved
                    </Link>
                  </>
                )}
                <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Sign In
                </Link>
                <Link to={ROUTES.REGISTER} className="block px-3 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 text-center">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;