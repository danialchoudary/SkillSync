import Applicants from './pages/Applicants';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import RecruiterPanel from './pages/RecruiterPanel';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import Profile from './components/Profile';
import Jobs from './pages/Jobs';
import SavedJobs from './pages/SavedJobs';
import RecruiterDashboard from './pages/RecruiterDashboard';
import JobForm from './features/jobs/components/JobForm';
import Onboarding from './pages/Onboarding';

import MyApplications from './pages/MyApplications';
import Messages from './pages/Messages';

const handlePostJob = async (job) => {
  try {
    // Simulate API call or integrate actual API logic here
    console.log('Job posted:', job);
    alert('Job posted successfully!');
  } catch (error) {
    console.error('Failed to post job:', error);
    alert('Failed to post job. Please try again.');
  }
};

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
  {
    path: '/recruiter/postjob',
    element: (
      <ProtectedRoute allowedRoles={['recruiter']}>
        <JobForm onPost={handlePostJob} />
      </ProtectedRoute>
    ),
  },
  { path: '/', element: <Login /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/verify-email', element: <VerifyEmail /> },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute allowedRoles={['pending']}>
        <Onboarding />
      </ProtectedRoute>
    ),
  },
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
    path: '/recruiter/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['recruiter']}>
        <RecruiterDashboard />
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
  {
    path: '/recruiter/profile',
    element: (
      <ProtectedRoute allowedRoles={['recruiter']}>
        <RecruiterPanel />
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <NotFound /> },
];

export default routes;
