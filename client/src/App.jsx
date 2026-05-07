import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { apiRequest, getToken, setToken } from './api.js';
import AdminRooms from './pages/AdminRooms/index.jsx';
import AdminUsers from './pages/AdminUsers/index.jsx';
import AuthPage from './pages/Auth/index.jsx';
import Home from './pages/Home/index.jsx';
import Profile from './pages/Profile/index.jsx';
import Room from './pages/Room/index.jsx';

function PublicRoute({ children }) {
  const authenticated = useMemo(() => Boolean(getToken()), []);
  return authenticated ? <Navigate to="/home" replace /> : children;
}

function PrivateRoute({ children }) {
  const authenticated = useMemo(() => Boolean(getToken()), []);
  return authenticated ? children : <Navigate to="/" replace />;
}

function AdminRoute({ children }) {
  const [state, setState] = useState({ loading: true, allowed: false });

  useEffect(() => {
    apiRequest('/auth/me')
      .then((data) => setState({ loading: false, allowed: data.user?.role === 'admin' }))
      .catch(() => {
        setToken('');
        setState({ loading: false, allowed: false });
      });
  }, []);

  if (!getToken()) {
    return <Navigate to="/" replace />;
  }

  if (state.loading) {
    return <div className="loading-screen">Validando acesso...</div>;
  }

  return state.allowed ? children : <Navigate to="/home" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AuthPage mode="register" /></PublicRoute>} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/room/:code" element={<PrivateRoute><Room /></PrivateRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/rooms" element={<AdminRoute><AdminRooms /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
