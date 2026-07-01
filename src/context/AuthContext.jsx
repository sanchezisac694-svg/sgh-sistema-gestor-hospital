import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY } from '../services/api.js';
import {
  clearSession,
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  registerPatient as registerPatientRequest,
  readStoredUser,
  saveSession,
} from '../services/auth.service.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const currentUser = await getMe();
        if (!isMounted) return;
        setUser(currentUser);
        setToken(storedToken);
        localStorage.setItem('sgh_user', JSON.stringify(currentUser));
      } catch (requestError) {
        if (!isMounted) return;
        if (requestError.status === 401 || requestError.status === 403 || !readStoredUser()) {
          clearSession();
          setUser(null);
          setToken(null);
        } else {
          setUser(readStoredUser());
          setToken(storedToken);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(credentials) {
    const session = await loginRequest(credentials);
    saveSession(session);
    const currentUser = await getMe();
    localStorage.setItem('sgh_user', JSON.stringify(currentUser));
    setToken(session.token);
    setUser(currentUser);
    return currentUser;
  }

  async function logout() {
    await logoutRequest();
    setToken(null);
    setUser(null);
  }

  async function registerPatient(payload) {
    const session = await registerPatientRequest(payload);
    saveSession(session);
    const currentUser = await getMe();
    localStorage.setItem('sgh_user', JSON.stringify(currentUser));
    setToken(session.token);
    setUser(currentUser);
    return currentUser;
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      logout,
      registerPatient,
      isAuthenticated: Boolean(token && user),
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return context;
}
