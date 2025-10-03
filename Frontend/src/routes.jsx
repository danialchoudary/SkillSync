import Applicants from './pages/Applicants';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import RecruiterPanel from './pages/RecruiterPanel';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import Profile from './components/Profile';
import Jobs from './pages/Jobs';
import SavedJobs from './pages/SavedJobs';

import MyApplications from './pages/MyApplications';
import Messages from './pages/Messages';

const routes = [
  {
    path: '/messages',
    element: (
      <ProtectedRoute allowedRoles={['jobseeker', 'admin', 'recruiter']}>
        <Messages />
      </ProtectedRoute>
    ),
  },
  {
    path: '/recruiter/message',
    element: (
      <ProtectedRoute allowedRoles={['recruiter']}>
        <Messages />
      </ProtectedRoute>
    ),
  },
  { path: '/', element: <Login /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['jobseeker']}>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminPanel />
      </ProtectedRoute>
    ),
  },
  {
    path: '/recruiter/*',
    element: (
      <ProtectedRoute allowedRoles={['recruiter']}>
        <RecruiterPanel />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute allowedRoles={['jobseeker', 'admin', 'recruiter']}>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/jobs',
    element: (
      <ProtectedRoute allowedRoles={['jobseeker', 'admin', 'recruiter']}>
        <Jobs />
      </ProtectedRoute>
    ),
  },
  {
    path: '/saved-jobs',
    element: (
      <ProtectedRoute allowedRoles={['jobseeker', 'admin', 'recruiter']}>
        <SavedJobs />
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-applications',
    element: (
      <ProtectedRoute allowedRoles={['jobseeker', 'admin', 'recruiter']}>
        <MyApplications />
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <NotFound /> },
];

export default routes;
