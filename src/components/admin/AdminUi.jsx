import { Bell, Eye, FileText, Pencil, Plus, Power, RotateCcw, Search, Trash2 } from 'lucide-react';
import { Button } from '../Button.jsx';
import { Card, StatCard } from '../Card.jsx';
import { Input, Select, Textarea } from '../FormControls.jsx';

export function AdminHeader({ title, subtitle }) {
  return (
    <header className="panel-header admin-header">
      <div>
        <p>Panel administrativo</p>
        <h1>{title}</h1>
        {subtitle && <span>{subtitle}</span>}
      </div>
      <div className="admin-header-tools">
        <label className="admin-search">
          <Search size={18} />
          <input placeholder="Buscar..." />
        </label>
        <button className="icon-btn" type="button" aria-label="Notificaciones">
          <Bell size={19} />
        </button>
        <div className="panel-user">
          <div>
            <strong>Admin</strong>
            <span>admin@sgh.com</span>
          </div>
          <div className="avatar" aria-hidden="true">AD</div>
        </div>
      </div>
    </header>
  );
}

export function FilterBar({ filters, actionLabel, onAction }) {
  return (
    <Card className="admin-filter-card">
      <div className="admin-filter-grid">
        {filters.map((filter) =>
          filter.type === 'select' ? (
            <Select key={filter.label} label={filter.label} options={filter.options} />
          ) : (
            <Input key={filter.label} label={filter.label} type={filter.inputType || 'text'} placeholder={filter.placeholder} />
          )
        )}
        {actionLabel && (
          <Button onClick={onAction}>
            <Plus size={18} />
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}

export function TableActions({ variant = 'default', onDetail }) {
  const appointment = variant === 'appointment';
  const patient = variant === 'patient';

  return (
    <div className="table-actions">
      <button type="button" title="Ver" onClick={onDetail}><Eye size={16} /></button>
      <button type="button" title="Editar"><Pencil size={16} /></button>
      {appointment && <button type="button" title="Reprogramar"><RotateCcw size={16} /></button>}
      {appointment && <button type="button" title="Cancelar"><Trash2 size={16} /></button>}
      {patient && <button type="button" title="Ver citas"><FileText size={16} /></button>}
      {!appointment && <button type="button" title="Activar o inactivar"><Power size={16} /></button>}
    </div>
  );
}

export function FormSection({ fields }) {
  return (
    <div className="admin-form-grid">
      {fields.map((field) => {
        const lower = field.toLowerCase();
        if (lower.includes('biografía') || lower.includes('observaciones') || lower.includes('descripción') || lower.includes('dirección') || lower.includes('mensaje')) {
          return <Textarea key={field} label={field} placeholder={field} className="span-2" />;
        }
        if (lower.includes('estado')) return <Select key={field} label={field} options={['Activo', 'Inactivo']} />;
        if (lower.includes('rol')) return <Select key={field} label={field} options={['ADMIN', 'DOCTOR', 'ENFERMERO', 'RECEPCIONISTA', 'PACIENTE']} />;
        if (lower.includes('fecha')) return <Input key={field} label={field} type="date" />;
        if (lower.includes('hora')) return <Input key={field} label={field} type="time" />;
        if (lower.includes('contraseña')) return <Input key={field} label={field} type="password" placeholder={field} />;
        return <Input key={field} label={field} placeholder={field} />;
      })}
    </div>
  );
}

export function Pagination() {
  return (
    <div className="pagination">
      <span>Mostrando registros simulados</span>
      <div>
        <Button variant="ghost" size="sm">Anterior</Button>
        <Button variant="secondary" size="sm">1</Button>
        <Button variant="ghost" size="sm">Siguiente</Button>
      </div>
    </div>
  );
}

export function ReportCard({ title, value = 'Visual' }) {
  return (
    <Card className="report-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <p>Reporte simulado listo para conectar a datos reales.</p>
    </Card>
  );
}

export { StatCard };
