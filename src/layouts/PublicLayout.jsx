import { CalendarDays, Menu } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { redirectByRole } from '../utils/redirectByRole.js';

const links = [
  { label: 'Inicio', path: '/' },
  { label: 'Especialidades', path: '/' },
  { label: 'Doctores', path: '/doctores' },
  { label: 'Agendar cita', path: '/agendar-cita' },
];

export function PublicLayout({ children, navigate }) {
  const { isAuthenticated, logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="public-shell">
      <nav className="public-navbar">
        <button className="brand" type="button" onClick={() => navigate('/')} aria-label="Ir al inicio">
          <span>SGH</span>
          <small>Sistema Gestor de Hospital</small>
        </button>
        <div className="public-links">
          {links.map((link) => (
            <button key={link.label} type="button" onClick={() => navigate(link.path)}>
              {link.label}
            </button>
          ))}
        </div>
        <div className="public-actions">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate(redirectByRole(user?.rol))}>Mi portal</Button>
              <Button size="sm" onClick={handleLogout}>Cerrar sesion</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Iniciar sesion</Button>
              <Button size="sm" onClick={() => navigate('/registro')}>Registrarse</Button>
            </>
          )}
        </div>
        <button className="icon-btn mobile-only" type="button" aria-label="Abrir menu">
          <Menu size={22} />
        </button>
      </nav>
      {children}
      <footer className="public-footer">
        <div>
          <strong>SGH - Sistema Gestor de Hospital</strong>
          <span>Atencion hospitalaria organizada, segura y accesible.</span>
        </div>
        <div>
          <strong>Contacto</strong>
          <span>Av. Salud 120, Col. Centro Medico</span>
          <span>Tel. 55 1234 5678</span>
          <span>contacto@sgh-hospital.mx</span>
        </div>
        <div>
          <strong>Enlaces rapidos</strong>
          <button type="button" onClick={() => navigate('/doctores')}>Doctores</button>
          <button type="button" onClick={() => navigate('/agendar-cita')}>Agendar cita</button>
          {isAuthenticated ? (
            <button type="button" onClick={handleLogout}>Cerrar sesion</button>
          ) : (
            <button type="button" onClick={() => navigate('/login')}>Iniciar sesion</button>
          )}
        </div>
        <CalendarDays size={20} aria-hidden="true" />
      </footer>
    </div>
  );
}
