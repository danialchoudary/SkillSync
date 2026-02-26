import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../src/components/ProtectedRoute.jsx';

function renderProtectedRoute(authState, allowedRoles = ['jobseeker']) {
  const store = configureStore({
    reducer: {
      auth: (state = authState) => state,
    },
    preloadedState: {
      auth: authState,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/secure']}>
        <Routes>
          <Route
            path="/secure"
            element={(
              <ProtectedRoute allowedRoles={allowedRoles}>
                <div>Authorized Content</div>
              </ProtectedRoute>
            )}
          />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('shows loading spinner while auth status is loading', () => {
    const { container } = renderProtectedRoute({ user: null, loading: true });
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    renderProtectedRoute({ user: null, loading: false });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects users with disallowed role to dashboard', () => {
    renderProtectedRoute(
      { user: { id: 'u1', role: 'jobseeker' }, loading: false },
      ['recruiter'],
    );
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('renders children when user role is allowed', () => {
    renderProtectedRoute(
      { user: { id: 'u2', role: 'recruiter' }, loading: false },
      ['recruiter', 'admin'],
    );
    expect(screen.getByText('Authorized Content')).toBeInTheDocument();
  });
});

