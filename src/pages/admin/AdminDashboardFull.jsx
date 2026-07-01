import { useEffect, useState } from 'react';
import {
  CalendarCheck,
  ClipboardList,
  HeartPulse,
  Stethoscope,
  UserCheck,
  UserCog,
  UserMinus,
  Users,
  XCircle,
} from 'lucide-react';
import { Button } from '../../components/Button.jsx';
import { Card, StatCard } from '../../components/Card.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { clearSession } from '../../services/auth.service.js';
import {
  getActiveStaffReport,
  getAppointmentsByDoctorReport,
  getAppointmentsBySpecialtyReport,
  getAppointmentsByStatusReport,
  getDashboardReport,
  getPatientsReport,
} from '../../services/reports.service.js';

const statusLabels = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  REPROGRAMADA: 'Reprogramada',
  ATENDIDA: 'Atendida',
  NO_ASISTIO: 'No asistio',
};

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString('es-MX');
}

function statusToBadge(status) {
  return statusLabels[status] || status;
}

function MiniMetric({ label, value, tone = 'blue' }) {
  return (
    <div className={`mini-metric mini-metric-${tone}`}>
      <span>{label}</span>
      <strong>{formatNumber(value)}</strong>
    </div>
  );
}

export function AdminDashboardFull({ navigate }) {
  const [dashboard, setDashboard] = useState(null);
  const [citasPorEstado, setCitasPorEstado] = useState([]);
  const [citasPorDoctor, setCitasPorDoctor] = useState([]);
  const [citasPorEspecialidad, setCitasPorEspecialidad] = useState([]);
  const [personalActivo, setPersonalActivo] = useState(null);
  const [pacientesReport, setPacientesReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError('');

      const [
        dashboardResponse,
        citasEstadoResponse,
        citasDoctorResponse,
        citasEspecialidadResponse,
        personalResponse,
        pacientesResponse,
      ] = await Promise.all([
        getDashboardReport(),
        getAppointmentsByStatusReport(),
        getAppointmentsByDoctorReport(),
        getAppointmentsBySpecialtyReport(),
        getActiveStaffReport(),
        getPatientsReport(),
      ]);

      setDashboard(dashboardResponse.data);
      setCitasPorEstado(citasEstadoResponse.data || []);
      setCitasPorDoctor(citasDoctorResponse.data || []);
      setCitasPorEspecialidad(citasEspecialidadResponse.data || []);
      setPersonalActivo(personalResponse.data);
      setPacientesReport(pacientesResponse.data);
    } catch (requestError) {
      if (requestError.status === 401) {
        clearSession();
        navigate('/login');
        return;
      }

      setError(requestError.message || 'No se pudieron cargar los reportes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const stats = [
    { label: 'Total doctores', value: dashboard?.totalDoctores, helper: 'Medicos registrados', tone: 'blue', icon: Stethoscope },
    { label: 'Total enfermeros', value: dashboard?.totalEnfermeros, helper: 'Personal de enfermeria', tone: 'green', icon: HeartPulse },
    { label: 'Pacientes registrados', value: dashboard?.totalPacientes, helper: 'Expedientes de pacientes', tone: 'green', icon: Users },
    { label: 'Especialidades activas', value: dashboard?.totalEspecialidades, helper: 'Servicios disponibles', tone: 'blue', icon: ClipboardList },
    { label: 'Citas de hoy', value: dashboard?.citasHoy, helper: 'Agenda del dia', tone: 'blue', icon: CalendarCheck },
    { label: 'Citas pendientes', value: dashboard?.citasPendientes, helper: 'Requieren seguimiento', tone: 'yellow', icon: ClipboardList },
    { label: 'Citas confirmadas', value: dashboard?.citasConfirmadas, helper: 'Confirmadas por hospital', tone: 'green', icon: CalendarCheck },
    { label: 'Citas canceladas', value: dashboard?.citasCanceladas, helper: 'Canceladas en sistema', tone: 'red', icon: XCircle },
    { label: 'Citas atendidas', value: dashboard?.citasAtendidas, helper: 'Consultas finalizadas', tone: 'green', icon: UserCheck },
    { label: 'No asistio', value: dashboard?.citasNoAsistio, helper: 'Pacientes ausentes', tone: 'yellow', icon: UserMinus },
  ];

  const statusColumns = [
    { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={statusToBadge(row.estado)} /> },
    { key: 'totalCitas', label: 'Total' },
  ];

  const doctorColumns = [
    { key: 'nombreDoctor', label: 'Doctor' },
    { key: 'especialidad', label: 'Especialidad' },
    { key: 'totalCitas', label: 'Total citas' },
  ];

  const specialtyColumns = [
    { key: 'nombreEspecialidad', label: 'Especialidad' },
    { key: 'totalCitas', label: 'Total citas' },
  ];

  if (loading) {
    return (
      <div className="dashboard-stack">
        <Card className="dashboard-state-card">
          <strong>Cargando dashboard...</strong>
          <span>Consultando reportes reales del sistema SGH.</span>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-stack">
        <Card className="dashboard-state-card dashboard-error-card">
          <strong>No se pudieron cargar los reportes.</strong>
          <span>{error}</span>
          <Button onClick={loadDashboardData}>Reintentar</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      <section className="stats-grid admin-stats-grid admin-stats-grid-real">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} value={formatNumber(stat.value)} />
        ))}
      </section>

      <section className="admin-dashboard-grid">
        <Card title="Reporte de citas por estado" subtitle="Distribucion actual de citas" className="wide-card">
          <DataTable columns={statusColumns} rows={citasPorEstado} />
        </Card>

        <Card title="Resumen de personal" subtitle="Personal activo e inactivo">
          <div className="mini-metric-grid">
            <MiniMetric label="Doctores activos" value={personalActivo?.doctoresActivos} tone="green" />
            <MiniMetric label="Doctores inactivos" value={personalActivo?.doctoresInactivos} tone="muted" />
            <MiniMetric label="Enfermeros activos" value={personalActivo?.enfermerosActivos} tone="green" />
            <MiniMetric label="Enfermeros inactivos" value={personalActivo?.enfermerosInactivos} tone="muted" />
            <MiniMetric label="Admin activo" value={personalActivo?.personalAdminActivo} tone="blue" />
            <MiniMetric label="Admin inactivo" value={personalActivo?.personalAdminInactivo} tone="muted" />
          </div>
        </Card>

        <Card title="Reporte de pacientes" subtitle="Estado general de expedientes">
          <div className="mini-metric-grid">
            <MiniMetric label="Pacientes activos" value={pacientesReport?.pacientesActivos} tone="green" />
            <MiniMetric label="Pacientes inactivos" value={pacientesReport?.pacientesInactivos} tone="muted" />
            <MiniMetric label="Registrados este mes" value={pacientesReport?.pacientesRegistradosMesActual} tone="blue" />
            <MiniMetric label="Total pacientes" value={pacientesReport?.totalPacientes} tone="blue" />
          </div>
        </Card>
      </section>

      <section className="admin-dashboard-grid">
        <Card title="Reporte de citas por doctor" subtitle="Citas agrupadas por medico">
          <DataTable columns={doctorColumns} rows={citasPorDoctor} />
        </Card>

        <Card title="Reporte de citas por especialidad" subtitle="Demanda por servicio medico">
          <DataTable columns={specialtyColumns} rows={citasPorEspecialidad} />
        </Card>
      </section>
    </div>
  );
}
