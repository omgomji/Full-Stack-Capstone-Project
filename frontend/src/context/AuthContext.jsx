import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { setAccessToken, registerRefresh } from '../services/api.js';
import { hasPermission } from '../config/permissions.js';

const STORAGE_KEY = 'rbac_access_token';

const AuthContext = createContext();

export function AuthProvider(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAccess = useCallback(async function () {
    try {
      const response = await api.post('/auth/refresh');
      const token = response.data.accessToken;
      setAccessToken(token);
      sessionStorage.setItem(STORAGE_KEY, token);
      setUser(response.data.user);
      return token;
    } catch (err) {
      sessionStorage.removeItem(STORAGE_KEY);
      setAccessToken(null);
      setUser(null);
      throw err;
    }
  }, []);

  useEffect(() => {
    registerRefresh(refreshAccess);
  }, [refreshAccess]);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      setAccessToken(stored);
    }
    refreshAccess()
      .catch(function () { /* ignore bootstrap refresh errors */ })
      .finally(function () { setLoading(false); });
  }, [refreshAccess]);

  const login = useCallback(async function (credentials) {
    const response = await api.post('/auth/login', credentials);
    setAccessToken(response.data.accessToken);
    sessionStorage.setItem(STORAGE_KEY, response.data.accessToken);
    setUser(response.data.user);
    const redirectTo = location.state && location.state.from ? location.state.from : '/';
    navigate(redirectTo, { replace: true });
  }, [navigate, location.state]);

  const logout = useCallback(async function () {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore network logout errors, client state is cleared either way
    }
    sessionStorage.removeItem(STORAGE_KEY);
    setAccessToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const contextValue = useMemo(() => ({
    user: user,
    loading: loading,
    login: login,
    logout: logout,
    refresh: refreshAccess,
    can: function (action, scope) {
      if (!user) return false;
      return hasPermission(user.role, action, scope);
    }
  }), [user, loading, login, logout, refreshAccess]);

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node
};

export function useAuth() {
  return useContext(AuthContext);
}
