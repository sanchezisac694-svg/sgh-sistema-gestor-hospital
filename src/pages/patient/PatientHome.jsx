import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, CalendarDays, CheckCircle2, ClipboardList, Clock3, UserRound } from 'lucide-react';
import { Button } from '../../components/Button.jsx';
import { Card, StatCard } from '../../components/Card.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getMyPatientAppointments,
  getMyPatientProfile,
} from '../../services/patient-panel.service.js';
import {
  appointmentToPatientRow,
  fullName,
  getErrorMessage,
  getNextAppointment,
  unwrapData,
} from '../../utils/patientPanelFormat.js';

export function PatientHome({ navigate }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadSummary() {
    try {
      setLoading(true);
      setError('');
      const [profileResponse, appointmentsResponse] = await Promise.all([
        getMyPatientProfile(),
        getMyPatientAppointments(),
      ]);
      setProfile(unwrapData(profileResponse));
      setAppointments(unwrapData(appointmentsResponse) || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo cargar la informacion.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  const nextAppointment = useMemo(() => getNextAppointment(appointments), [appointments]);
  const nextRow = nextAppointment ? appointmentToPatientRow(nextAppointment) : null;
  const counts = useMemo(() => ({
    total: appointments.length,
    pendientes: appointments.filter((item) => item.estado === 'PENDIENTE').length,
    confirmadas: appointments.filter((item) => item.estado === 'CONFIRMADA').length,
    atendidas: appointments.filter((item) => item.estado === 'ATENDIDA').length,
  }), [appointments]);

  return (
    <main className="patient-page">
      <section className="page-heading patient-heading">
        <div>
          <span className="eyebrow-light">Portal paciente</span>
          <h1>Hola, {fullName(profile?.usuario) || user?.nombre || 'paciente'}</h1>
          <p>Consulta tus citas, revisa tu perfil y agenda nuevas consultas.</p>
        </div>
        <div className="step-actions">
          <Button variant="secondary" onClick={() => navigate('/paciente/citas')}>Mis citas</Button>
          <Button onClick={() => navigate('/paciente/agendar-cita')}>Agendar cita</Button>
        </div>
      </section>

      {error && (
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>{error}</strong>
          <Button size="sm" variant="secondary" onClick={loadSummary}>Reintentar</Button>
        </Card>
      )}

      {loading ? (
        <Card><p className="muted-copy">Cargando informacion...</p></Card>
      ) : (
        <>
          <section className="stats-grid patient-stats-grid">
            <StatCard label="Mis citas totales" value={counts.total} helper="Registradas" tone="blue" icon={CalendarDays} />
            <StatCard label="Pendientes" value={counts.pendientes} helper="Por confirmar" tone="yellow" icon={Clock3} />
            <StatCard label="Confirmadas" value={counts.confirmadas} helper="Listas para asistir" tone="blue" icon={CalendarCheck} />
            <StatCard label="Atendidas" value={counts.atendidas} helper="Consultas finalizadas" tone="green" icon={CheckCircle2} />
          </section>

          <section className="patient-grid">
            <Card className="patient-card">
              <ClipboardList size={24} />
              <strong>Proxima cita</strong>
              {nextRow ? (
                <>
                  <span>{nextRow.fecha} a las {nextRow.horaInicio}</span>
                  <span>{nextRow.doctorNombre}</span>
                  <StatusBadge status={nextRow.estado} />
                </>
              ) : (
                <span>No tienes proximas citas activas.</span>
              )}
            </Card>
            <Card className="patient-card">
              <UserRound size={24} />
              <strong>Mi perfil</strong>
              <span>{profile?.usuario?.correo || user?.correo}</span>
              <Button size="sm" variant="secondary" onClick={() => navigate('/paciente/perfil')}>Ver perfil</Button>
            </Card>
            <Card className="patient-card">
              <CalendarDays size={24} />
              <strong>Agenda medica</strong>
              <span>Busca doctores por especialidad y elige horarios disponibles.</span>
              <Button size="sm" onClick={() => navigate('/paciente/agendar-cita')}>Agendar</Button>
            </Card>
          </section>
        </>
      )}
    </main>
  );
}
