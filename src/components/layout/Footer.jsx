import { Link } from 'react-router-dom';
import { HiMail, HiExternalLink } from 'react-icons/hi';
import { APP_NAME, ROUTES } from '../../utils/constants';

const FOOTER_LINKS = {
  'For Students': [
    { label: 'Browse Internships', path: ROUTES.INTERNSHIPS },
    { label: 'My Applications',    path: ROUTES.STUDENT_APPLICATIONS },
    { label: 'Saved Roles',        path: ROUTES.STUDENT_SAVED },
  ],
  'For Companies': [
    { label: 'Post an Internship', path: ROUTES.COMPANY_POST },
    { label: 'Company Dashboard',  path: ROUTES.COMPANY_DASHBOARD },
    { label: 'View Applicants',    path: ROUTES.COMPANY_APPLICANTS.replace('/:id', '') },
  ],
  'Company': [
    { label: 'About Us',    path: '/#about' },
    { label: 'How It Works',path: '/#how-it-works' },
    { label: 'Contact',     path: '/#contact' },
  ],
};

function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MI</span>
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">{APP_NAME}</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              Short-term, project-based internships connecting talented students with forward-thinking companies.
            </p>
            <a href="mailto:hello@microintern.io" className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline">
              <HiMail className="h-4 w-4" />
              hello@microintern.io
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{heading}</h3>
              <ul className="space-y-3">
                {links.map(({ label, path }) => (
                  <li key={label}>
                    <Link
                      to={path}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} {APP_NAME}. Built for the next generation of talent.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Privacy</Link>
            <Link to="/terms"   className="text-xs text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;