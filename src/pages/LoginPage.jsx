import { useEffect, useState } from 'react';
import { LoginForm } from '../components/public/AuthForms.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { redirectByRole } from '../utils/redirectByRole.js';
import { getReturnUrl, safeReturnUrl } from '../utils/publicFormat.js';

export function LoginPage({ navigate }) {
  const { isAuthenticated, loading, login, user } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const returnUrl = safeReturnUrl(getReturnUrl());

  useEffect(() => {
    if (!loading && isAuthenticated && user?.rol) {
      if (returnUrl && user.rol === 'PACIENTE') {
        navigate(returnUrl);
        return;
      }
      navigate(redirectByRole(user.rol));
    }
  }, [isAuthenticated, loading, navigate, returnUrl, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const currentUser = await login({ correo, password });
      if (returnUrl && currentUser.rol === 'PACIENTE') {
        navigate(returnUrl);
        return;
      }
      navigate(redirectByRole(currentUser.rol));
    } catch (requestError) {
      setError(requestError.message || 'No fue posible iniciar sesion.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <LoginForm
        correo={correo}
        password={password}
        error={error}
        loading={submitting || loading}
        onCorreoChange={setCorreo}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
        onRegister={() => navigate(returnUrl ? `/registro?returnUrl=${encodeURIComponent(returnUrl)}` : '/registro')}
      />
    </main>
  );
}
