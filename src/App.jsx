import { useEffect, useState } from 'react';
import { Button } from './components/Button.jsx';
import { Modal } from './components/Modal.jsx';
import { PublicLayout } from './layouts/PublicLayout.jsx';
import { PanelLayout } from './layouts/PanelLayout.jsx';
import { PublicHome } from './pages/PublicHome.jsx';
import { DoctorsSearch } from './pages/DoctorsSearch.jsx';
import { DoctorDetail } from './pages/DoctorDetail.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ScheduleAppointment } from './pages/ScheduleAppointment.jsx';
import { AdminDashboardFull } from './pages/admin/AdminDashboardFull.jsx';
import { AdminReports } from './pages/admin/AdminReports.jsx';
import { AdminResourcePage } from './pages/admin/AdminResourcePage.jsx';
import { AdminSettings } from './pages/admin/AdminSettings.jsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.jsx';
import { AdminSpecialtiesPage } from './pages/admin/AdminSpecialtiesPage.jsx';
import { AdminDoctorsPage } from './pages/admin/AdminDoctorsPage.jsx';
import { AdminSchedulesPage } from './pages/admin/AdminSchedulesPage.jsx';
import { AdminPatientsPage } from './pages/admin/AdminPatientsPage.jsx';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage.jsx';
import { adminResources } from './data/adminData.js';
import { DoctorDashboardFull } from './pages/doctor/DoctorDashboardFull.jsx';
import { DoctorAppointments } from './pages/doctor/DoctorAppointments.jsx';
import { DoctorTodayAppointments } from './pages/doctor/DoctorTodayAppointments.jsx';
import { DoctorAppointmentDetail } from './pages/doctor/DoctorAppointmentDetail.jsx';
import { DoctorAttendAppointment } from './pages/doctor/DoctorAttendAppointment.jsx';
import { DoctorSchedule } from './pages/doctor/DoctorSchedule.jsx';
import { DoctorProfile } from './pages/doctor/DoctorProfile.jsx';
import { DoctorObservations } from './pages/doctor/DoctorObservations.jsx';
import { PatientHome } from './pages/patient/PatientHome.jsx';
import { PatientProfile } from './pages/patient/PatientProfile.jsx';
import { PatientAppointments } from './pages/patient/PatientAppointments.jsx';
import { PatientScheduleAppointment } from './pages/patient/PatientScheduleAppointment.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';

function getViewFromPath(nextPath) {
  if (nextPath.startsWith('/admin')) return 'admin';
  if (nextPath === '/doctor' || nextPath.startsWith('/doctor/')) return 'doctor';
  if (nextPath === '/paciente' || nextPath.startsWith('/paciente/')) return 'paciente';
  return 'public';
}

function getInitialPath() {
  return window.location.pathname || '/';
}

function getPathnameFrom(nextPath) {
  return new URL(nextPath, window.location.origin).pathname || '/';
}

function getInitialView() {
  return getViewFromPath(getInitialPath());
}

export default function App() {
  const auth = useAuth();
  const [view, setView] = useState(getInitialView);
  const [path, setPath] = useState(getInitialPath);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    function syncPath() {
      const nextPath = getInitialPath();
      setPath(nextPath);
      setView(getViewFromPath(nextPath));
    }

    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  function navigate(nextPath) {
    const nextPathname = getPathnameFrom(nextPath);
    window.history.pushState({}, '', nextPath);
    setPath(nextPathname);
    setView(getViewFromPath(nextPathname));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderPublicRoute() {
    if (path === '/doctores') return <DoctorsSearch navigate={navigate} />;
    if (path.startsWith('/doctores/detalle')) return <DoctorDetail navigate={navigate} />;
    if (path === '/login') return <LoginPage navigate={navigate} />;
    if (path === '/registro') return <RegisterPage navigate={navigate} />;
    if (path === '/agendar-cita') return <ScheduleAppointment navigate={navigate} />;
    return <PublicHome navigate={navigate} />;
  }

  function setAdminView(nextPath = '/admin/dashboard') {
    const nextPathname = getPathnameFrom(nextPath);
    window.history.pushState({}, '', nextPath);
    setPath(nextPathname);
    setView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getAdminRoute() {
    const key = path.replace('/admin/', '') || 'dashboard';
    if (key === 'dashboard' || path === '/admin') {
      return {
        title: 'Dashboard general',
        subtitle: 'Resumen general del hospital.',
        content: <AdminDashboardFull navigate={navigate} />,
      };
    }
    if (key === 'reportes') {
      return {
        title: 'Reportes',
        subtitle: 'Reportes visuales con datos simulados.',
        content: <AdminReports />,
      };
    }
    if (key === 'usuarios') {
      return {
        title: 'Usuarios y roles',
        subtitle: 'Usuarios reales del sistema y rol asignado.',
        content: <AdminUsersPage navigate={navigate} />,
      };
    }
    if (key === 'especialidades') {
      return {
        title: 'Especialidades',
        subtitle: 'Catalogo real de servicios medicos.',
        content: <AdminSpecialtiesPage navigate={navigate} />,
      };
    }
    if (key === 'doctores') {
      return {
        title: 'Doctores',
        subtitle: 'Gestion real de medicos, usuarios y perfil profesional.',
        content: <AdminDoctorsPage navigate={navigate} />,
      };
    }
    if (key === 'horarios') {
      return {
        title: 'Horarios',
        subtitle: 'Horarios medicos y disponibilidad por fecha.',
        content: <AdminSchedulesPage navigate={navigate} />,
      };
    }
    if (key === 'pacientes') {
      return {
        title: 'Pacientes',
        subtitle: 'Expedientes reales de pacientes y citas asociadas.',
        content: <AdminPatientsPage navigate={navigate} />,
      };
    }
    if (key === 'citas') {
      return {
        title: 'Citas',
        subtitle: 'Agenda real, disponibilidad y acciones administrativas.',
        content: <AdminAppointmentsPage navigate={navigate} />,
      };
    }
    if (key === 'configuracion') {
      return {
        title: 'Configuración',
        subtitle: 'Configuración visual básica del hospital.',
        content: <AdminSettings />,
      };
    }
    const resource = adminResources[key] || adminResources.usuarios;
    return {
      title: resource.title,
      subtitle: resource.subtitle,
      content: <AdminResourcePage resourceKey={key} />,
    };
  }

  const adminRoute = getAdminRoute();

  function setDoctorView(nextPath = '/doctor/dashboard') {
    const nextPathname = getPathnameFrom(nextPath);
    window.history.pushState({}, '', nextPath);
    setPath(nextPathname);
    setView('doctor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getDoctorRoute() {
    const key = path.replace('/doctor/', '') || 'dashboard';
    if (key === 'dashboard' || path === '/doctor') {
      return {
        title: 'Dashboard doctor',
        subtitle: 'Resumen de citas asignadas al doctor.',
        content: <DoctorDashboardFull navigate={navigate} />,
      };
    }
    if (key === 'citas') {
      return {
        title: 'Mis citas',
        subtitle: 'Todas las citas asignadas al doctor.',
        content: <DoctorAppointments navigate={navigate} />,
      };
    }
    if (key === 'citas-hoy') {
      return {
        title: 'Citas de hoy',
        subtitle: 'Consulta y atiende las citas programadas para el día.',
        content: <DoctorTodayAppointments navigate={navigate} />,
      };
    }
    if (key === 'citas/detalle') {
      return {
        title: 'Detalle de cita',
        subtitle: 'Información completa de la cita y del paciente.',
        content: <DoctorAppointmentDetail navigate={navigate} />,
      };
    }
    if (key === 'citas/atender') {
      return {
        title: 'Atender cita',
        subtitle: 'Registra las observaciones de la consulta médica.',
        content: <DoctorAttendAppointment navigate={navigate} />,
      };
    }
    if (key === 'horario') {
      return {
        title: 'Mi horario',
        subtitle: 'Consulta tu horario asignado.',
        content: <DoctorSchedule />,
      };
    }
    if (key === 'perfil') {
      return {
        title: 'Mi perfil',
        subtitle: 'Información profesional del doctor autenticado.',
        content: <DoctorProfile />,
      };
    }
    if (key === 'observaciones') {
      return {
        title: 'Observaciones',
        subtitle: 'Observaciones de consulta registradas.',
        content: <DoctorObservations />,
      };
    }
    return {
      title: 'Dashboard doctor',
      subtitle: 'Resumen de citas asignadas al doctor.',
      content: <DoctorDashboardFull navigate={navigate} />,
    };
  }

  const doctorRoute = getDoctorRoute();

  function getPatientRoute() {
    const key = path.replace('/paciente/', '') || 'inicio';

    if (key === 'inicio' || path === '/paciente') {
      return <PatientHome navigate={navigate} />;
    }

    if (key === 'perfil') {
      return <PatientProfile navigate={navigate} />;
    }

    if (key === 'citas') {
      return <PatientAppointments navigate={navigate} />;
    }

    if (key === 'agendar-cita') {
      return <PatientScheduleAppointment navigate={navigate} />;
    }

    return <PatientHome navigate={navigate} />;
  }

  return (
    <>
      <div className="view-switcher" aria-label="Cambiar area de prueba">
        <Button size="sm" variant={view === 'public' ? 'primary' : 'ghost'} onClick={() => navigate('/')}>
          Pública
        </Button>
        <Button size="sm" variant={view === 'admin' ? 'primary' : 'ghost'} onClick={() => setAdminView()}>
          Admin
        </Button>
        <Button size="sm" variant={view === 'doctor' ? 'primary' : 'ghost'} onClick={() => setDoctorView()}>
          Doctor
        </Button>
      </div>

      {view === 'public' && (
        <PublicLayout navigate={navigate} onNavigate={setView}>
          {renderPublicRoute()}
        </PublicLayout>
      )}

      {view === 'admin' && (
        <ProtectedRoute area="admin" auth={auth} navigate={navigate}>
          <PanelLayout
            area="admin"
            title={adminRoute.title}
            subtitle={adminRoute.subtitle}
            onNavigate={setView}
            navigate={navigate}
            activePath={path}
          >
            {adminRoute.content}
          </PanelLayout>
        </ProtectedRoute>
      )}

      {view === 'doctor' && (
        <ProtectedRoute area="doctor" auth={auth} navigate={navigate}>
          <PanelLayout
            area="doctor"
            title={doctorRoute.title}
            subtitle={doctorRoute.subtitle}
            onNavigate={setView}
            navigate={navigate}
            activePath={path}
          >
            {doctorRoute.content}
          </PanelLayout>
        </ProtectedRoute>
      )}

      {view === 'paciente' && (
        <ProtectedRoute area="paciente" auth={auth} navigate={navigate}>
          <PublicLayout navigate={navigate} onNavigate={setView}>
            {getPatientRoute()}
          </PublicLayout>
        </ProtectedRoute>
      )}

      <Modal
        open={modalOpen}
        title="Modal base reutilizable"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => setModalOpen(false)}>Guardar</Button>
          </>
        }
      >
        <p>
          Este componente queda preparado para formularios, confirmaciones y detalles de cita en las siguientes fases.
        </p>
      </Modal>
    </>
  );
}
