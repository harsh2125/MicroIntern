// App-wide constants — import from here, never hardcode strings

export const APP_NAME = 'MicroIntern';
export const APP_TAGLINE = 'Launch your career with micro-internships';

// User roles — must match Firestore 'role' field values
export const ROLES = {
  STUDENT: 'student',
  COMPANY: 'company',
  ADMIN:   'admin',
};

// Internship categories for filters and posting
export const CATEGORIES = [
  'Engineering',
  'Design',
  'Marketing',
  'Data Science',
  'Product Management',
  'Finance',
  'Content Writing',
  'Sales',
  'HR',
  'Operations',
];

// Internship duration options
export const DURATIONS = [
  '1 Week',
  '2 Weeks',
  '3 Weeks',
  '1 Month',
  '2 Months',
  '3 Months',
  '6 Months',
];

// Work mode options
export const WORK_MODES = ['Remote', 'On-site', 'Hybrid'];

// Application status values
export const APPLICATION_STATUS = {
  PENDING:   'pending',
  REVIEWED:  'reviewed',
  SHORTLISTED: 'shortlisted',
  REJECTED:  'rejected',
  ACCEPTED:  'accepted',
};

// Navigation links — role-based menus use ROLES above
export const NAV_LINKS = [
  { label: 'Browse Internships', path: '/internships' },
  { label: 'Companies',          path: '/companies' },
  { label: 'How It Works',       path: '/#how-it-works' },
];

// Route paths — single source of truth
export const ROUTES = {
  HOME:               '/',
  LOGIN:              '/login',
  REGISTER:           '/register',
  FORGOT_PASSWORD:    '/forgot-password',
  INTERNSHIPS:        '/internships',
  INTERNSHIP_DETAIL:  '/internships/:id',
  STUDENT_DASHBOARD:  '/student/dashboard',
  STUDENT_APPLICATIONS: '/student/applications',
  STUDENT_SAVED:      '/student/saved',
  COMPANY_DASHBOARD:  '/company/dashboard',
  COMPANY_POST:       '/company/post',
  COMPANY_APPLICANTS: '/company/applicants/:id',
  ADMIN_DASHBOARD:    '/admin/dashboard',
  ADMIN_USERS:        '/admin/users',
  ADMIN_INTERNSHIPS:  '/admin/internships',
  STUDENT_APPLICATIONS: '/student/applications',
  STUDENT_SAVED:        '/student/saved',
};
