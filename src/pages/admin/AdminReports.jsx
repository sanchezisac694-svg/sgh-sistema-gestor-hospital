import { Button } from '../../components/Button.jsx';
import { Card } from '../../components/Card.jsx';
import { Input, Select } from '../../components/FormControls.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { ReportCard } from '../../components/admin/AdminUi.jsx';
import { reportCards, reports } from '../../data/adminData.js';

function BarList({ title, items, statusMode = false }) {
  const max = Math.max(...items.map((item) => item.total));
  return (
    <Card title={title}>
      <div className="bar-list">
        {items.map((item) => (
          <div key={item.label || item.estado} className="bar-row">
            <div>
              {statusMode ? <StatusBadge status={item.estado} /> : <span>{item.label}</span>}
              <strong>{item.total}</strong>
            </div>
            <div className="bar-track">
              <span style={{ width: `${(item.total / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AdminReports() {
  return (
    <div className="dashboard-stack">
      <Card className="admin-filter-card">
        <div className="admin-filter-grid reports-filter">
          <Input label="Fecha inicio" type="date" />
          <Input label="Fecha fin" type="date" />
          <Select label="Especialidad" options={['Todas', 'Cardiología', 'Pediatría', 'Gastroenterología']} />
          <Select label="Doctor" options={['Todos', 'Dr. Juan Pérez López', 'Dra. María González Ruiz']} />
          <Button>Generar reporte</Button>
          <Button variant="secondary">Exportar PDF visual</Button>
        </div>
      </Card>

      <section className="report-grid">
        {reportCards.map((title) => (
          <ReportCard key={title} title={title} />
        ))}
      </section>

      <section className="admin-dashboard-grid">
        <BarList title="Reporte de citas por estado" items={reports.estados} statusMode />
        <BarList title="Reporte de citas por especialidad" items={reports.especialidades} />
        <BarList title="Reporte de citas por doctor" items={reports.doctores} />
      </section>
    </div>
  );
}
