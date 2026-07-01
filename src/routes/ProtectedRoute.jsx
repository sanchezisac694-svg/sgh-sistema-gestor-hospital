import { useEffect } from 'react';
import { canAccessArea, redirectByRole } from '../utils/redirectByRole.js';

export function ProtectedRoute({ area, auth, navigate, children }) {
  const allowed = auth.isAuthenticated && canAccessArea(auth.user?.rol, area);
  const targetPath = !auth.isAuthenticated ? '/login' : redirectByRole(auth.user?.rol);

  useEffect(() => {
    if (!auth.loading && !allowed) {
      navigate(targetPath);
    }
  }, [allowed, auth.loading, navigate, targetPath]);

  if (auth.loading) {
    return (
      <main className="auth-page">
        <section className="auth-loading" aria-live="polite">
          Validando sesion...
        </section>
      </main>
    );
  }

  if (!allowed) {
    return null;
  }

  return children;
}
