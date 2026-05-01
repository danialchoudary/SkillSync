import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from './features/auth/authSlice';
import { Provider } from 'react-redux';
import { store } from './app/store';
import routes from './routes.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import useGlobalUnread from './features/messages/useGlobalUnread';

function AppRoutes() {
  const dispatch = useDispatch();
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const oauthToken = hashParams.get('token');

    if (oauthToken) {
      localStorage.setItem('token', oauthToken);
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }

    dispatch(fetchCurrentUser());
  }, [dispatch]);
  useGlobalUnread();
  return (
    <ErrorBoundary>
      <Routes>
        {routes.map(({ path, element }, idx) => (
          <Route key={idx} path={path} element={element} />
        ))}
      </Routes>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}

