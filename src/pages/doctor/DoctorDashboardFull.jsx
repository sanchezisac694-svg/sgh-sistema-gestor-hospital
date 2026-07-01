import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, CalendarClock, CheckCircle2, Clock3, UserX } from 'lucide-react';
import { Button } from '../../components/Button.jsx';
import { Card, StatCard } from '../../components/Card.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { getDoctorDashboard } from '../../services/doctor-panel.service.js';
import {
  appointmentToRow,
  getErrorMessage,
  unwrapData,
} from '../../utils/doctorPanelFormat.js';

export function DoctorDashboardFull({ navigate }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setLoading(true);
      setError('');
      const response = await getDoctorDashboard();
      setDashboard(unwrapData(response));
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No se pudo cargar el dashboard.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const todayRows = useMemo(() => (dashboard?.citasHoy || []).map(appointmentToRow), [dashboard]);
  const nextRows = useMemo(() => (dashboard?.proximasCitas || []).map(appointmentToRow), [dashboard]);
  const resumen = dashboard?.resumen || {};

  const todayColumns = [
    { key: 'horaInicio', label: 'Hora' },
    { key: 'pacienteNombre', label: 'Paciente' },
    { key: 'motivo', label: 'Motivo' },
    { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={row.estado} /> },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (row) => (
        <Button size="sm" variant="secondary" onClick={() => {
          sessionStorage.setItem('sgh_doctor_appointment_id', row.id);
          navigate('/doctor/citas/detalle');
        }}>
          Ver detalle
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Card><p className="muted-copy">Cargando informacion...</p></Card>;
  }

  if (error) {
    return (
      <Card className="dashboard-state-card dashboard-error-card">
        <strong>{error}</strong>
        <Button size="sm" variant="secondary" onClick={loadDashboard}>Reintentar</Button>
      </Card>
    );
  }

  return (
    <div className="dashboard-stack">
      <section className="stats-grid doctor-stats-grid">
        <StatCard label="Citas de hoy" value={resumen.citasHoy ?? 0} helper="Jornada actual" tone="blue" icon={CalendarCheck} />
        <StatCard label="Proximas citas" value={resumen.proximasCitas ?? 0} helper="Agenda futura" tone="green" icon={CalendarClock} />
        <StatCard label="Pendientes" value={resumen.pendientes ?? 0} helper="Por confirmar" tone="yellow" icon={Clock3} />
        <StatCard label="Confirmadas" value={resumen.confirmadas ?? 0} helper="Listas para atencion" tone="blue" icon={CheckCircle2} />
        <StatCard label="Atendidas" value={resumen.atendidas ?? 0} helper="Historial registrado" tone="green" icon={CheckCircle2} />
        <StatCard label="No asistio" value={resumen.noAsistio ?? 0} helper="Ausencias" tone="yellow" icon={UserX} />
      </section>

      <section className="doctor-dashboard-grid">
        <Card title="Citas de hoy" subtitle="Agenda asignada para el dia" className="wide-card">
          <DataTable columns={todayColumns} rows={todayRows} emptyText="No tienes citas registradas para hoy." />
        </Card>
        <Card title="Proximas citas">
          <div className="doctor-list">
            {nextRows.length === 0 ? (
              <p className="muted-copy">No tienes proximas citas registradas.</p>
            ) : (
              nextRows.map((item) => (
                <div key={item.id}>
                  <strong>{item.fecha} - {item.horaInicio}</strong>
                  <span>{item.pacienteNombre}</span>
                  <StatusBadge status={item.estado} />
                </div>
              ))
            )}
          </div>
        </Card>
        <Card title="Alertas del dia">
          <div className="doctor-alerts">
            <p>Tienes {resumen.citasHoy ?? 0} citas programadas para hoy.</p>
            <p>{resumen.confirmadas ?? 0} citas estan confirmadas.</p>
            <p>{resumen.pendientes ?? 0} citas siguen pendientes.</p>
          </div>
        </Card>
      </section>
    </div>
  );
}
