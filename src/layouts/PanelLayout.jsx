import {
  CalendarDays,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  LogOut,
  Settings,
  Stethoscope,
  UserCog,
  Users,
  UserRound,
  BriefcaseMedical,
  HeartPulse,
} from 'lucide-react';
import { AdminHeader } from '../components/admin/AdminUi.jsx';
import { DoctorHeader } from '../components/doctor/DoctorUi.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fullName, initialsFromName } from '../utils/doctorPanelFormat.js';

const iconMap = {
  Dashboard: LayoutDashboard,
  'Usuarios y roles': UserCog,
  Personal: Users,
  Doctores: Stethoscope,
  Enfermeros: HeartPulse,
  'Personal administrativo': BriefcaseMedical,
  Especialidades: ClipboardList,
  Horarios: Clock3,
  Turnos: CalendarDays,
  Citas: CalendarDays,
  Pacientes: UserRound,
  Reportes: ClipboardList,
  Configuración: Settings,
  'Mis citas': CalendarDays,
  'Citas de hoy': ClipboardList,
  'Mi horario': Clock3,
  'Mi perfil': UserRound,
  'Cerrar sesión': LogOut,
};

const adminItems = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Usuarios y roles', path: '/admin/usuarios' },
  { label: 'Personal' },
  { label: 'Doctores', path: '/admin/doctores', child: true },
  { label: 'Enfermeros', path: '/admin/enfermeros', child: true },
  { label: 'Personal administrativo', path: '/admin/personal', child: true },
  { label: 'Especialidades', path: '/admin/especialidades' },
  { label: 'Horarios', path: '/admin/horarios' },
  { label: 'Turnos', path: '/admin/turnos' },
  { label: 'Citas', path: '/admin/citas' },
  { label: 'Pacientes', path: '/admin/pacientes' },
  { label: 'Reportes', path: '/admin/reportes' },
  { label: 'Configuración', path: '/admin/configuracion' },
  { label: 'Cerrar sesión', path: '/' },
];

const doctorItems = [
  { label: 'Dashboard', path: '/doctor/dashboard' },
  { label: 'Mis citas', path: '/doctor/citas' },
  { label: 'Citas de hoy', path: '/doctor/citas-hoy' },
  { label: 'Mi horario', path: '/doctor/horario' },
  { label: 'Mi perfil', path: '/doctor/perfil' },
  { label: 'Cerrar sesión', path: '/' },
];

export function PanelLayout({ area, title, subtitle, children, onNavigate, navigate, activePath }) {
  const { logout, user } = useAuth();
  const isDoctor = area === 'doctor';
  const items = isDoctor ? doctorItems : adminItems;
  const doctorName = fullName(user);

  async function handleLogout() {
    await logout();
    if (navigate) navigate('/login');
    else onNavigate('public');
  }

  return (
    <div className="panel-shell">
      <aside className="sidebar">
        <button
          className="sidebar-brand"
          type="button"
          onClick={() => (navigate ? navigate(isDoctor ? '/doctor/dashboard' : '/admin/dashboard') : onNavigate('public'))}
        >
          <strong>SGH</strong>
          <span>{isDoctor ? 'SGH Doctor' : 'SGH Hospital'}</span>
        </button>
        <nav className="sidebar-nav">
          {items.map((entry) => {
            const item = typeof entry === 'string' ? entry : entry.label;
            const path = typeof entry === 'string' ? undefined : entry.path;
            const Icon = iconMap[item] || LayoutDashboard;
            const isLogout = item === 'Cerrar sesión';
            const isActive = path
              ? activePath === path || (path === '/admin/dashboard' && activePath === '/admin') || (path === '/doctor/dashboard' && activePath === '/doctor')
              : false;
            return (
              <button
                key={item}
                className={`sidebar-link ${isActive ? 'is-active' : ''} ${isLogout ? 'is-logout' : ''} ${entry.child ? 'is-child' : ''}`}
                type="button"
                onClick={() => {
                  if (isLogout) {
                    handleLogout();
                    return;
                  }
                  if (path && navigate) navigate(path);
                }}
              >
                <Icon size={18} />
                <span>{item}</span>
              </button>
            );
          })}
        </nav>
        {isDoctor ? (
          <div className="sidebar-user">
            <div className="avatar">{initialsFromName(doctorName)}</div>
            <div>
              <strong>{doctorName}</strong>
              <span>{user?.doctor?.especialidad?.nombre || 'Doctor'}</span>
              <span>Consultorio {user?.doctor?.consultorio || 'sin asignar'}</span>
            </div>
          </div>
        ) : (
          <div className="sidebar-user">
            <div className="avatar">{user?.nombres?.slice(0, 2).toUpperCase() || 'AD'}</div>
            <div>
              <strong>{user?.nombre || 'Administrador'}</strong>
              <span>{user?.correo || 'admin@sgh.com'}</span>
            </div>
          </div>
        )}
      </aside>
      <div className="panel-main">
        {isDoctor ? (
          <DoctorHeader title={title} subtitle={subtitle} />
        ) : (
          <AdminHeader title={title} subtitle={subtitle} />
        )}
        <main className="panel-content">{children}</main>
      </div>
    </div>
  );
}
