import { CalendarCheck, Stethoscope, Users, UserRoundCheck } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Card, StatCard } from '../components/Card.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { appointmentRows } from '../data/mockData.js';

export function AdminDashboard({ onOpenModal }) {
  const columns = [
    { key: 'id', label: 'Folio' },
    { key: 'paciente', label: 'Paciente' },
    { key: 'doctor', label: 'Doctor' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'estado', label: 'Estado', render: (row) => <StatusBadge status={row.estado} /> },
  ];

  return (
    <div className="dashboard-stack">
      <section className="stats-grid">
        <StatCard label="Citas del dia" value="42" helper="+8 programadas" tone="green" icon={CalendarCheck} />
        <StatCard label="Pacientes activos" value="1,284" helper="Registro simulado" icon={Users} />
        <StatCard label="Doctores" value="36" helper="12 especialidades" tone="blue" icon={Stethoscope} />
        <StatCard label="Personal" value="92" helper="Turnos activos" tone="yellow" icon={UserRoundCheck} />
      </section>

      <Card
        title="Citas recientes"
        subtitle="Vista base para gestion administrativa"
        actions={<Button size="sm" onClick={onOpenModal}>Nueva cita</Button>}
      >
        <DataTable columns={columns} rows={appointmentRows} />
      </Card>
    </div>
  );
}
