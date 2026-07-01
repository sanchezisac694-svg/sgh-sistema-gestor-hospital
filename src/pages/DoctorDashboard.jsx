import { CalendarClock, CheckCircle2, Clock3, UserRound } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Card, StatCard } from '../components/Card.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { doctorAppointments } from '../data/mockData.js';

export function DoctorDashboard({ onOpenModal }) {
  const columns = [
    { key: 'id', label: 'Hora' },
    { key: 'paciente', label: 'Paciente' },
    { key: 'motivo', label: 'Motivo' },
    { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={row.estado} /> },
  ];

  return (
    <div className="dashboard-stack">
      <section className="stats-grid">
        <StatCard label="Citas hoy" value="9" helper="3 pendientes" tone="green" icon={CalendarClock} />
        <StatCard label="Siguiente cita" value="10:00" helper="Jorge Salas" tone="yellow" icon={Clock3} />
        <StatCard label="Pacientes vistos" value="5" helper="Jornada actual" icon={CheckCircle2} />
        <StatCard label="Perfil" value="Completo" helper="Datos medicos listos" tone="blue" icon={UserRound} />
      </section>

      <Card
        title="Agenda de hoy"
        subtitle="Citas simuladas para el panel doctor"
        actions={<Button size="sm" variant="secondary" onClick={onOpenModal}>Ver detalle</Button>}
      >
        <DataTable columns={columns} rows={doctorAppointments} />
      </Card>
    </div>
  );
}
