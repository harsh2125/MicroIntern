import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home             from '../pages/Home';
import Internships      from '../pages/Internships';
import InternshipDetail from '../pages/InternshipDetail';
import Chat             from '../pages/Chat';

import Login            from '../pages/auth/Login';
import Register         from '../pages/auth/Register';
import ForgotPassword   from '../pages/auth/ForgotPassword';

import StudentDashboard   from '../pages/student/StudentDashboard';
import MyApplications     from '../pages/student/MyApplications';
import SavedInternships   from '../pages/student/SavedInternships';

import CompanyDashboard   from '../pages/company/CompanyDashboard';
import PostInternship     from '../pages/company/PostInternship';
import ViewApplicants     from '../pages/company/ViewApplicants';

import AdminDashboard     from '../pages/admin/AdminDashboard';

import PrivateRoute from './PrivateRoute';
import RoleRoute    from './RoleRoute';

import { ROUTES, ROLES } from '../utils/constants';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ── */}
        <Route path={ROUTES.HOME}            element={<Home />} />
        <Route path={ROUTES.INTERNSHIPS}     element={<Internships />} />
        <Route path="/internships/:id"       element={<InternshipDetail />} />
        <Route path={ROUTES.LOGIN}           element={<Login />} />
        <Route path={ROUTES.REGISTER}        element={<Register />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />

        {/* ── Chat (any logged in user) ── */}
        <Route path="/chat/:otherId" element={
          <PrivateRoute><Chat /></PrivateRoute>
        } />

        {/* ── Student ── */}
        <Route path={ROUTES.STUDENT_DASHBOARD} element={
          <RoleRoute role={ROLES.STUDENT}><StudentDashboard /></RoleRoute>
        } />
        <Route path={ROUTES.STUDENT_APPLICATIONS} element={
          <RoleRoute role={ROLES.STUDENT}><MyApplications /></RoleRoute>
        } />
        <Route path={ROUTES.STUDENT_SAVED} element={
          <RoleRoute role={ROLES.STUDENT}><SavedInternships /></RoleRoute>
        } />

        {/* ── Company ── */}
        <Route path={ROUTES.COMPANY_DASHBOARD} element={
          <RoleRoute role={ROLES.COMPANY}><CompanyDashboard /></RoleRoute>
        } />
        <Route path="/company/post-internship" element={
          <RoleRoute role={ROLES.COMPANY}><PostInternship /></RoleRoute>
        } />
        <Route path="/company/edit-internship/:id" element={
          <RoleRoute role={ROLES.COMPANY}><PostInternship /></RoleRoute>
        } />
        <Route path="/company/applicants/:id" element={
          <RoleRoute role={ROLES.COMPANY}><ViewApplicants /></RoleRoute>
        } />

        {/* ── Admin ── */}
        <Route path={ROUTES.ADMIN_DASHBOARD} element={
          <RoleRoute role={ROLES.ADMIN}><AdminDashboard /></RoleRoute>
        } />

        {/* ── 404 ── */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="text-center">
              <h1 className="text-8xl font-bold text-primary-600 mb-4">404</h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">Page not found</p>
              <a href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600
                           hover:bg-primary-700 text-white font-semibold rounded-xl
                           transition-colors text-sm">
                Go Home
              </a>
            </div>
          </div>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;